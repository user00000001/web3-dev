'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useAnchor03VotingProgram, useAnchor03VotingProgramAccount } from './voting-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useWallet } from '@solana/wallet-adapter-react'

export function Anchor03VotingCreate() {
  const { pollvoteInit } = useAnchor03VotingProgram()
  return (
    <>
      <Button onClick={() => pollvoteInit.mutateAsync(Keypair.generate())} disabled={pollvoteInit.isPending}>
      Create {pollvoteInit.isPending && '...'}
      </Button>
    </>
  )
}

export function Anchor03VotingList() {
  const { accounts, getProgramAccount } = useAnchor03VotingProgram()

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
            <Anchor03VotingCard key={account.publicKey.toString()} account={account.publicKey} />
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

function Anchor03VotingCard({ account }: { account: PublicKey }) {
  const { accountQuery, voteCandidate01Mutation, voteCandidate02Mutation } = useAnchor03VotingProgramAccount({
    account
  })
  const { candidate01_name, candidate02_name } = useAnchor03VotingProgram()
  const { publicKey } = useWallet()

  const count = useMemo(() => accountQuery.data?.totalVotes ?? 0, [accountQuery.data?.totalVotes])

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Anchor03Voting: {count.toString()}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => voteCandidate01Mutation.mutateAsync(publicKey!)}
            disabled={voteCandidate01Mutation.isPending}
          >
            Candidate {candidate01_name}
          </Button>
          <Button
            variant="outline"
            onClick={() => voteCandidate02Mutation.mutateAsync(publicKey!)}
            disabled={voteCandidate02Mutation.isPending}
          >
            Candidate {candidate02_name}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
