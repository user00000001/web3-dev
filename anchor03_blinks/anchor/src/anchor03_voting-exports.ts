// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import Anchor03VotingIDL from '../target/idl/anchor03_voting.json'
import type { Anchor03Voting } from '../target/types/anchor03_voting'

// Re-export the generated IDL and type
export { Anchor03Voting, Anchor03VotingIDL }

// The programId is imported from the program IDL.
export const ANCHOR03_VOTING_PROGRAM_ID = new PublicKey(Anchor03VotingIDL.address)

// This is a helper function to get the Anchor03Voting Anchor program.
export function getAnchor03VotingProgram(provider: AnchorProvider, address?: PublicKey): Program<Anchor03Voting> {
  return new Program({ ...Anchor03VotingIDL, address: address ? address.toBase58() : Anchor03VotingIDL.address } as Anchor03Voting, provider)
}

// This is a helper function to get the program ID for the Anchor03Voting program depending on the cluster.
export function getAnchor03VotingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return ANCHOR03_VOTING_PROGRAM_ID
  }
}
