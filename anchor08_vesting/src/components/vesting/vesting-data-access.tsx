'use client'

import { getVestingProgram, getVestingProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import * as anchor from "@coral-xyz/anchor"
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'

export function useVestingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVestingProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVestingProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['vesting', 'all', { cluster }],
    queryFn: () => program.account.vestingDataAccount.all(),
  })

  const employeeAccounts = useQuery({
    queryKey: ['employee_data', 'all', { cluster }],
    queryFn: () => program.account.employeeDataAccount.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createVestingAccount = useMutation({
    mutationKey: ['vesting', 'create', { cluster }],
    mutationFn: ({
      company_name,
      mint
    }: {
      company_name: string,
      mint: PublicKey
    }) =>
      program.methods.createVesting(company_name).accounts({
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to create vesting account')
    },
  })

  return {
    program,
    programId,
    accounts,
    employeeAccounts,
    getProgramAccount,
    createVestingAccount,
  }
}

export function useVestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVestingProgram()

  const accountQuery = useQuery({
    queryKey: ['vesting', 'fetch', { cluster, account }],
    queryFn: () => program.account.vestingDataAccount.fetch(account),
  })
  const { connection } = useConnection();
  const tokenBalance = useQuery({
    queryKey: ['token account balance', {account, endpoint: connection.rpcEndpoint}],
    queryFn: async ()=>{
      const vesting_data = await program.account.vestingDataAccount.fetch(account);
      return await connection.getTokenAccountBalance(vesting_data.treasuryTokenAccount, "confirmed")
    }
  })

  const employeeAccountsByVesting = useQuery({
    queryKey: ['employee_data', 'vesting', { cluster, account }],
    queryFn: () => program.account.employeeDataAccount.all().then(res=>res.filter((item)=>item.account.vestingDataAccount.toBase58() == account.toBase58()))
  })

  const createEmployeeDataMutation = useMutation({
    mutationKey: ['ceate employee data', { cluster, account }],
    mutationFn: ({employee, total_amount, start_time, end_time, cliff_time}:{
      employee: PublicKey,
      total_amount: number,
      start_time: number,
      end_time: number,
      cliff_time: number
    }) => program.methods.createEmployee(
      new anchor.BN(start_time),
      new anchor.BN(end_time),
      new anchor.BN(cliff_time),
      new anchor.BN(total_amount),
    ).accounts({
      employee,
      vestingDataAccount: account
    }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  const claimVestingMutation = useMutation({
    mutationKey: ['claim employee vesting', { cluster, account }],
    mutationFn: ({employee, mint, company_name}:{
      company_name: string,
      employee: PublicKey,
      mint: PublicKey
    }) => {
    const employeeTokenAccount = getAssociatedTokenAddressSync(mint, employee)
    return program.methods.claimToken(
      company_name
    ).accounts({
      employee,
      vestingDataAccount: account,
      employeeTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID
    }).rpc()
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    tokenBalance,
    employeeAccountsByVesting,
    createEmployeeDataMutation,
    claimVestingMutation
  }
}
