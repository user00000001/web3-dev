import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Crud } from '../target/types/crud'

describe('crud', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const wallet = provider.wallet as anchor.Wallet
  const payer = wallet.payer

  const program = anchor.workspace.Crud as Program<Crud>

  const crud_one = {
    owner: payer.publicKey,
    title: 'hello world!',
    message: 'This is an article about how to build the solana smart contract.',
  }
  const [crud_pubKey] = PublicKey.findProgramAddressSync(
    [Buffer.from(crud_one.title), payer.publicKey.toBytes()],
    program.programId,
  )

  it('Create Crud', async () => {
    await program.methods
      .create(crud_one.title, crud_one.message)
      .accounts({
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc()

    const crud_fetch = await program.account.crud.fetch(crud_pubKey)

    expect(crud_fetch.owner).toEqual(crud_one.owner)
    expect(crud_fetch.title).toEqual(crud_one.title)
    expect(crud_fetch.message).toEqual(crud_one.message)
  })

  it('Update Crud', async () => {
    const message = 'new update about this article.'
    await program.methods.update(crud_one.title, message).accounts({ payer: payer.publicKey }).signers([payer]).rpc()

    const crud_fetch = await program.account.crud.fetch(crud_pubKey)

    expect(crud_fetch.message).toEqual(message)
  })

  it('Close the crud account', async () => {
    await program.methods
      .close(crud_one.title)
      .accounts({
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc()

    // The account should no longer exist, returning null.
    const crud_fetch = await program.account.crud.fetchNullable(crud_pubKey)
    expect(crud_fetch).toBeNull()
  })
})
