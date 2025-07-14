import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Stablecoin } from '../target/types/stablecoin'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { Agent } from 'node:https'
import nodeFetch, { RequestInit, Response, RequestInfo } from 'node-fetch'
import { Connection } from '@solana/web3.js'
import path from 'path'
import StablecoinIDL from '../target/idl/stablecoin.json'
import { ProgramTestContext } from 'solana-bankrun'
import { PublicKey } from '@solana/web3.js'

describe('stablecoin', () => {
  let provider: BankrunProvider
  let connection: Connection
  let program: Program<Stablecoin>
  let wallet: anchor.Wallet
  let context: ProgramTestContext
  let collateralData: PublicKey
  let pythSolanaReceiver: PythSolanaReceiver
  let solUsdPriceFeedAccount: PublicKey

  const agent = new HttpsProxyAgent('http://127.0.0.1:20171')

  const fetchWithProxy = (url: RequestInfo, options?: RequestInit): Promise<Response> => {
    const optionsWithProxy: RequestInit = {
      ...options,
      agent: agent as Agent,
    }
    return nodeFetch(url, optionsWithProxy)
  }

  const pyth = new PublicKey('7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE')
  const SOL_PRICE_FEED_ID = '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'
  const devConnection = new Connection('https://api.devnet.solana.com', { fetch: fetchWithProxy })

  beforeAll(async () => {
    const pythAccountInfo = await devConnection.getAccountInfo(pyth, 'confirmed')
    context = await startAnchor(
      path.resolve(__dirname, '..'),
      [
        {
          name: 'stablecoin',
          programId: new anchor.web3.PublicKey(StablecoinIDL.address),
        },
      ],
      [
        {
          address: pyth,
          info: pythAccountInfo!,
        },
      ],
    )
    pythSolanaReceiver = new PythSolanaReceiver({ connection: devConnection, wallet })
    solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID)
    const feedAccountInfo = await devConnection.getAccountInfo(solUsdPriceFeedAccount, 'confirmed')
    context.setAccount(solUsdPriceFeedAccount, feedAccountInfo!)

    provider = new BankrunProvider(context)
    wallet = provider.wallet
    connection = provider.connection
    program = new Program<Stablecoin>(StablecoinIDL, provider)
    collateralData = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('collateral'), wallet.publicKey.toBuffer()],
      program.programId,
    )[0]
  }, 5e4)

  it('Is initialized!', async () => {
    const tx = await program.methods.initConfig().accounts({}).rpc({ skipPreflight: true, commitment: 'confirmed' })
    console.log('Your transaction signature', tx)
  })

  it('Deposit Collateral and Mint USDS', async () => {
    const amountCollateral = 1_000_000_000
    const amountToMint = 1_000_000_000
    const tx = await program.methods
      .depositCollateralAndMintTokens(new anchor.BN(amountCollateral), new anchor.BN(amountToMint))
      .accounts({ priceUpdate: solUsdPriceFeedAccount })
      .rpc({ skipPreflight: true, commitment: 'confirmed' })
    console.log('Your transaction signature', tx)
  })

  it('Redeem Collateral and Burn USDS', async () => {
    const amountCollateral = 500_000_000
    const amountToBurn = 500_000_000
    const tx = await program.methods
      .redeemCollateralAndBurnTokens(new anchor.BN(amountCollateral), new anchor.BN(amountToBurn))
      .accounts({ priceUpdate: solUsdPriceFeedAccount })
      .rpc({ skipPreflight: true, commitment: 'confirmed' })
    console.log('Your transaction signature', tx)
  })

  // Increase minimum health threshold to test liquidate
  it('Update Config', async () => {
    const tx = await program.methods
      .updateConfig(new anchor.BN(100))
      .accounts({})
      .rpc({ skipPreflight: true, commitment: 'confirmed' })
    console.log('Your transaction signature', tx)
  })

  it('Liquidate', async () => {
    const amountToBurn = 500_000_000
    const tx = await program.methods
      .liquidate(new anchor.BN(amountToBurn))
      .accounts({ collateralData, priceUpdate: solUsdPriceFeedAccount })
      .rpc({ skipPreflight: true, commitment: 'confirmed' })
    console.log('Your transaction signature', tx)
  })

  it('Update Config', async () => {
    const tx = await program.methods
      .updateConfig(new anchor.BN(1))
      .accounts({})
      .rpc({ skipPreflight: true, commitment: 'confirmed' })
    console.log('Your transaction signature', tx)
  })
})
