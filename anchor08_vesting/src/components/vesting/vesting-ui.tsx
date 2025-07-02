'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useVestingProgram, useVestingProgramAccount } from './vesting-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { create } from 'domain'
import { atom, useAtom} from "jotai"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { start } from 'repl'
import { redirect } from "next/navigation"

const create_vesting_default = {
  mint: "mntCHsQHSurodoEAt3a2XQE144nYrNNDorFWegjgRs6",
  company_name: "company name"
};
const create_vesting_atom = atom(create_vesting_default);

const validatePublicKey = (str: string)=>{
  try {
    new PublicKey(str);
    return true;
  } catch (error) {
    alert(error)
    return false;
  }
};

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram()
  const [vesting, setVesting] = useAtom(create_vesting_atom);
  return <div className=' flex flex-col-reverse justify-center gap-3'>
    <Button onClick={() => validatePublicKey(vesting.mint) && createVestingAccount.mutateAsync({
      mint: new PublicKey(vesting.mint),
      company_name: vesting.company_name
    }).then(()=>setVesting(create_vesting_default))} disabled={createVestingAccount.isPending}>
      Create {createVestingAccount.isPending && '...'}
    </Button>
    <div className='flex flex-row'>
      <label className=' mr-3' htmlFor='mint'>MintAddress: </label>
      <input className=' border-2 border-red-600 rounded-sm w-full' type='text' id='mint' onChange={(e)=>setVesting({...vesting, mint: e.target.value})} value={vesting.mint} />
    </div>
    <div className='flex flex-row'>
      <label className=' mr-3' htmlFor='company_name'>CompanyName: </label>
      <input className=' border-2 border-red-600 rounded-sm w-full' type='text' id='company_name' onChange={(e)=>setVesting({...vesting, company_name: e.target.value})} value={vesting.company_name} />
    </div>
  </div>
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram()

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
            <VestingCard key={account.publicKey.toString()} account={account.publicKey} />
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

function VestingCard({ account }: { account: PublicKey }) {
  const client = useQueryClient()
  const { accountQuery, tokenBalance, createEmployeeDataMutation,employeeAccountsByVesting } = useVestingProgramAccount({
    account,
  })

  const [employeeData, setEmployeeData] = useState({
    employee: PublicKey.default.toBase58(),
    start_time: Math.floor(new Date().getTime()/1000).toString(),
    end_time: (Math.floor(new Date().getTime()/1000) + 1000*600).toString(),
    cliff_time: Math.floor(new Date().getTime()/1000).toString(),
    total_amount: "0"
  });

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
              <div>Employee: <a onClick={()=>redirect(`/account/${employee.account.employee.toBase58()}`)}>{employee.account.employee.toBase58()}</a></div>
              <div>TotalAmount: {employee.account.totalAmount.toString(10)}</div>
              <div>TotalWithdraw: {employee.account.totalWithdraw.toString(10)}</div>
              <div>StartTime: {employee.account.startTime.toString(10)}</div>
              <div>EndTime: {employee.account.endTime.toString(10)}</div>
              <div>CliffTime: {employee.account.cliffTime.toString(10)}</div>
            </div>
            ))}
      </div>
      <CardContent>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => validatePublicKey(employeeData.employee) && createEmployeeDataMutation.mutateAsync({
              start_time: parseInt(employeeData.start_time),
              end_time: parseInt(employeeData.end_time),
              cliff_time: parseInt(employeeData.cliff_time),
              total_amount: parseInt(employeeData.total_amount),
              employee: new PublicKey(employeeData.employee)
            }, {
              onSuccess(data, variables, context) {
                  employeeAccountsByVesting.refetch();
              },
            })}
            disabled={createEmployeeDataMutation.isPending}
          >
            CreateEmployee
          </Button>
          <div>
            <div>
              <label className=' mr-3' htmlFor='ta'>Employee: </label>
              <input className=' border-2 border-red-600 rounded-sm w-full' type='text' id='ta' onChange={(e)=>setEmployeeData({...employeeData, employee: e.target.value})} value={employeeData.employee} />
            </div>
            <div>
              <label className=' mr-3' htmlFor='ta'>TotalAmount: </label>
              <input className=' border-2 border-red-600 rounded-sm w-full' type='number' id='ta' onChange={(e)=>setEmployeeData({...employeeData, total_amount: e.target.value})} value={employeeData.total_amount} />
            </div>
            <div>
              <label className=' mr-3' htmlFor='st'>StartTime: </label>
              <input className=' border-2 border-red-600 rounded-sm w-full' type='number' id='st' onChange={(e)=>setEmployeeData({...employeeData, start_time: e.target.value})} value={employeeData.start_time} />
            </div>

            <div>
              <label className=' mr-3' htmlFor='et'>EndTime: </label>
              <input className=' border-2 border-red-600 rounded-sm w-full' type='number' id='et' onChange={(e)=>setEmployeeData({...employeeData, end_time: e.target.value})} value={employeeData.end_time} />
            </div>
            <div>
              <label className=' mr-3' htmlFor='ct'>CliffTime: </label>
              <input className=' border-2 border-red-600 rounded-sm w-full' type='number' id='ct' onChange={(e)=>setEmployeeData({...employeeData, cliff_time: e.target.value})} value={employeeData.cliff_time} />
            </div>
          </div>
       </div>
      </CardContent>
    </Card>
  )
}
