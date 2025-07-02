'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useVestingProgram, useVestingProgramAccount } from '../vesting/vesting-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { create } from 'domain'
import { atom, useAtom} from "jotai"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { start } from 'repl'
import { useWallet } from '@solana/wallet-adapter-react'
import { program } from '@coral-xyz/anchor/dist/cjs/native/system'
import { useCluster } from '../cluster/cluster-data-access'

const validatePublicKey = (str: string)=>{
  try {
    new PublicKey(str);
    return true;
  } catch (error) {
    alert(error)
    return false;
  }
};

export function EmployeeList() {
  const { getProgramAccount, program } = useVestingProgram();
  const { publicKey } = useWallet();
  const accounts = useQuery({
    queryKey: ["employee", "vestings", {publicKey}],
    queryFn: () => program.account.employeeDataAccount.all().then(res=>res.filter((item)=>item.account.employee.toBase58() == publicKey?.toBase58()))
  })

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <EmployeeCard key={account.account.vestingDataAccount.toString()} publicKey={publicKey!} account={account.account.vestingDataAccount} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function EmployeeCard({ account, publicKey }: { account: PublicKey, publicKey: PublicKey }) {
  const client = useQueryClient()
  const { cluster } = useCluster()
  const { program } = useVestingProgram()
  const { accountQuery, tokenBalance, claimVestingMutation } = useVestingProgramAccount({
    account,
  })
  const employeeAccountsByVesting = useQuery({
    queryKey: ['employee_data', 'vesting', { cluster, account, publicKey }],
    queryFn: () => program.account.employeeDataAccount.all().then(res=>res.filter((item)=> item.account.employee.toBase58() == publicKey.toBase58() && account.toBase58() == item.account.vestingDataAccount.toBase58())),
  })

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>CompanyName: <span className='border-2 border-red-600 rounded-sm'>{accountQuery.data!.companyName}</span></CardTitle>
        <CardDescription>
          <div>
            <div>
              Vesting Data Account: <span>{account.toBase58()}</span>
            </div>
            <div>
              Treasury Token Account: <span>{accountQuery.data!.treasuryTokenAccount.toBase58()}</span>
            </div>
            { tokenBalance.isPending ? <div> fetching balance... </div> :
              <div>Treasury Token Balance: <span>{tokenBalance.data!.value.amount}</span>
            </div>}
          </div>
        </CardDescription>
      </CardHeader>
      <div className='flex flex-col gap-3 mx-3'>
        {employeeAccountsByVesting.isPending ? <div>
            employee loading...
          </div> : employeeAccountsByVesting.data?.map(employee=>(
            <div className=' border-2 border-amber-500 rounded-sm' key={employee.publicKey.toBase58()}>
              <div>Employee: {employee.account.employee.toBase58()}</div>
              <div>TotalAmount: {employee.account.totalAmount.toString(10)}</div>
              <div>TotalWithdraw: {employee.account.totalWithdraw.toString(10)}</div>
              <div>StartTime: {employee.account.startTime.toString(10)}</div>
              <div>EndTime: {employee.account.endTime.toString(10)}</div>
              <div>CliffTime: {employee.account.cliffTime.toString(10)}</div>
              <CardContent>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => claimVestingMutation.mutateAsync({
              company_name: accountQuery.data!.companyName,
              employee: publicKey,
              mint: accountQuery.data!.mint
            }, {
              onSuccess(data, variables, context) {
                 employeeAccountsByVesting.refetch();
                 client.invalidateQueries(['employee_data', 'vesting', { cluster, account, publicKey }])
              },
            })}
            disabled={claimVestingMutation.isPending}
          >
            Claim Tokens
          </Button>
       </div>
      </CardContent>

            </div>
            ))}
      </div>
   </Card>
  )
}
