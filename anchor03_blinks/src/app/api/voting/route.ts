import { Program, BN } from '@coral-xyz/anchor'
import { Anchor03Voting } from '@project/anchor'
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

import * as Anchor03VotingIDL from '../../../../anchor/target/idl/anchor03_voting.json'

export const OPTIONS = GET

export async function GET() {
  const ag: ActionGetResponse = {
    title: 'Vote for your favorite color of the apple!',
    description: 'Vote between red and green.',
    label: 'Vote',
    icon: 'https://www.kindpng.com/picc/m/153-1533376_red-apple-and-green-apple-png-download-red.png',
    links: {
      actions: [
        {
          label: 'Vote for red.',
          href: '/api/voting?color=red',
          type: 'transaction',
        },
        {
          label: 'Vote for green.',
          href: '/api/voting?color=green',
          type: 'transaction',
        },
      ],
    },
  }
  return Response.json(ag, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const candidate = url.searchParams.get('color')
  if (candidate != 'red' && candidate != 'green') {
    return new Response('Invalid candidate', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }
  const connection = new Connection('http://192.168.0.105:8899', 'confirmed')
  const program: Program<Anchor03Voting> = new Program(Anchor03VotingIDL, { connection })
  const body: ActionPostRequest = await req.json()
  let voter
  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    console.error(error)
    return new Response(`Invalid Account`, { status: 400, headers: ACTIONS_CORS_HEADERS })
  }
  const instruction = await program.methods
    .voteForCandidate(new BN(1), candidate)
    .accounts({
      signer: voter,
    })
    .instruction()

  const blockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction)

  const rsp = await createPostResponse({
    fields: {
      type: 'transaction',
      transaction: transaction,
    },
  })
  return Response.json(rsp, { headers: ACTIONS_CORS_HEADERS })
}
