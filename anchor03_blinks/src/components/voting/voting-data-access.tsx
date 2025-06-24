'use client'

import { BN } from "@coral-xyz/anchor"
import { getAnchor03VotingProgram, getAnchor03VotingProgramId } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export function useAnchor03VotingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const { publicKey } = useWallet()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getAnchor03VotingProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getAnchor03VotingProgram(provider, programId), [provider, programId])

  const now = Math.floor(new Date().getTime() / 1000)

  const candidate01_name = "red"
  const candidate02_name = "green"

  const accounts = useQuery({
    queryKey: ['pollvote', 'all', { cluster }],
    queryFn: () => program.account.pollVote.all(),
  })
  const pollvote = {
    poll_id: new BN(1),
    desc: 'This is a poll vote, please vote for these candidate.',
    begin: new BN(now - 60),
    end: new BN(now + 600),
  }
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const pollvoteInit = useMutation({
    mutationKey: ['pollvote', 'pollvoteInit', { cluster }],
    mutationFn: () =>
      program.methods.pollvoteInit(pollvote.poll_id, pollvote.desc, pollvote.begin, pollvote.end).accounts({ signer: publicKey! }).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to init poll vote account')
    },
  })

  const candidate01Init = useMutation({
    mutationKey: ['candidate01', 'candidateInit', { cluster }],
    mutationFn: () =>
      program.methods.candidateInit(pollvote.poll_id, candidate02_name).accounts({ signer: publicKey! }).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to init candidate 01 account')
    },
  })


  const candidate02Init = useMutation({
    mutationKey: ['candidate02', 'candidateInit', { cluster }],
    mutationFn: () =>
      program.methods.candidateInit(pollvote.poll_id, candidate02_name).accounts({ signer: publicKey! }).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to init candidate 02 account')
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    pollvoteInit,
    candidate01Init,
    candidate02Init,
    candidate01_name,
    candidate02_name,
    pollvote,
  }
}

export function useAnchor03VotingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts, candidate01_name, candidate02_name, pollvote } = useAnchor03VotingProgram()

  const accountQuery = useQuery({
    queryKey: ['pollvote', 'fetch', { cluster, account }],
    queryFn: () => program.account.pollVote.fetch(account),
  })

  const voteCandidate01Mutation = useMutation({
    mutationKey: ['candidate01', 'vote', { cluster, account }],
    mutationFn: (publicKey: PublicKey) => program.methods.voteForCandidate(pollvote.poll_id, candidate01_name).accounts({ signer: publicKey }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  const voteCandidate02Mutation = useMutation({
    mutationKey: ['candidate02', 'vote', { cluster, account }],
    mutationFn: (publicKey: PublicKey) => program.methods.voteForCandidate(pollvote.poll_id, candidate02_name).accounts({ signer: publicKey }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    voteCandidate01Mutation,
    voteCandidate02Mutation,
  }
}
