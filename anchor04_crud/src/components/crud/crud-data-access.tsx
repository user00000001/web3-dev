'use client'

import { getCrudProgram, getCrudProgramId } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export function useCrudProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCrudProgram(provider, programId), [provider, programId])
  const {publicKey} = useWallet()

  const accounts = useQuery({
    queryKey: ['crud', 'all', { cluster }],
    queryFn: () => program.account.crud.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createMutation = useMutation({
    mutationKey: ['crud', 'initialize', { cluster }],
    mutationFn: (crud: {title: string, message: string}) =>
      program.methods.create(crud.title, crud.message).accounts({ payer: publicKey! }).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize account')
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createMutation,
  }
}

export function useCrudProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrudProgram()
  const { publicKey } = useWallet()

  const accountQuery = useQuery({
    queryKey: ['crud', 'fetch', { cluster, account }],
    queryFn: () => program.account.crud.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['crud', 'close', { cluster, account }],
    mutationFn: (title: string) => program.methods.close(title).accounts({ payer: publicKey! }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accounts.refetch()
    },
  })

  const updateMutation = useMutation({
    mutationKey: ['crud', 'update', { cluster, account }],
    mutationFn: (crud: {title: string, message: string}) => program.methods.update(crud.title, crud.message).accounts({ payer: publicKey! }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    updateMutation,
  }
}
