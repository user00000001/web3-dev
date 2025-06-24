'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState, useEffect } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudProgram, useCrudProgramAccount } from './crud-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import {atom, useAtom} from "jotai"

export const crud_one = atom({
  owner: "",
  title: "",
  message: ""
})

export function CrudCreate() {
  const { createMutation } = useCrudProgram()
  const [crud, setCrud] = useAtom(crud_one)
  return <div className={"block spacing-y-2 border-2 justify-round-2"}>
    <div className="">
      <label htmlFor="title">title:</label>
      <input type="text" id="title" placeholder="title like `hello`" value={crud.title} onChange={(e)=>setCrud({...crud, title: e.target.value})} />
    </div>
    <div>
      <label htmlFor="msg">message:</label>
      <textarea id="msg" placeholder="some content." defaultValue={crud.message} onChange={(e)=>setCrud({...crud, message: e.target.value})}/>
    </div>
    <Button onClick={() => createMutation.mutateAsync(crud)} disabled={createMutation.isPending}>
      Create {createMutation.isPending && '...'}
    </Button>
 </div>
}

export function CrudList() {
  const { accounts, getProgramAccount } = useCrudProgram()

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
            <CrudCard key={account.publicKey.toString()} account={account.publicKey} />
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

function CrudCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateMutation, closeMutation } = useCrudProgramAccount({
    account,
  })

  const [crud, setCrud] = useState<{
    owner: string,
    title: string,
    message: string
  }>({
  owner: "",
  title: "",
  message: ""
  });
  useEffect(()=>{
    setCrud({
      owner: accountQuery.data?.owner.toString() ?? "",
      title: accountQuery.data?.title ?? "",
      message: accountQuery.data?.message ?? "",
    })
  }, [accountQuery.isLoading])

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Crud: {accountQuery.data?.title}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-red-1">
          <label>
            message:
            <textarea onChange={(e)=>setCrud({...crud, message: e.target.value})} defaultValue={crud.message}/>
          </label>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => updateMutation.mutateAsync(crud)}
            disabled={updateMutation.isPending}
          >
            Update
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!window.confirm('Are you sure you want to close this account?')) {
                return
              }
              return closeMutation.mutateAsync(crud.title)
            }}
            disabled={closeMutation.isPending}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
