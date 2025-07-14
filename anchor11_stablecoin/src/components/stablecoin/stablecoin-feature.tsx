'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'
import { useStablecoinProgram } from './stablecoin-data-access'
import { StablecoinCreate, StablecoinProgram } from './stablecoin-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function StablecoinFeature() {
  const { publicKey } = useWallet()
  const { programId } = useStablecoinProgram()

  return publicKey ? (
    <div>
      <AppHero title="Stablecoin" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <StablecoinCreate />
      </AppHero>
      <StablecoinProgram />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  )
}
