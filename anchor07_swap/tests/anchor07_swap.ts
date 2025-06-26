import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor07Swap } from "../target/types/anchor07_swap";
import { confirmTransaction, createAccountsMintsAndTokenAccounts, makeKeypairs } from "@solana-developers/helpers";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { assert } from "chai";

describe("anchor07_swap", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;

  const TOKEN_PROGRAM: typeof TOKEN_PROGRAM_ID | typeof TOKEN_2022_PROGRAM_ID = TOKEN_2022_PROGRAM_ID; 
  const program = anchor.workspace.anchor07Swap as Program<Anchor07Swap>;
  // const [ alice, bob, mintA, mintB ] = makeKeypairs(4);
  const accounts: Record<string, PublicKey|Keypair> = {
    tokenProgram: TOKEN_PROGRAM
  }
  const payer = (anchor.getProvider().wallet as anchor.Wallet).payer;

  const getPublicKey = (item: PublicKey|Keypair)=>item instanceof PublicKey ? item : item.publicKey;
  const getKeypair = (item: PublicKey|Keypair)=>item instanceof Keypair ? item: null;
  const tokenAofferedAmount = new anchor.BN(1e6);
  const wantTokenBAmount = new anchor.BN(1e6);
  const offer_id = new anchor.BN(1); 
  before("setup tokens", async()=>{
    const usersMintsAndTokenAccounts = await createAccountsMintsAndTokenAccounts([[1e9, 0],[0, 1e9]],LAMPORTS_PER_SOL, connection, payer)
    accounts.alice = usersMintsAndTokenAccounts.users[0];
    accounts.bob = usersMintsAndTokenAccounts.users[1];
    accounts.mintA = usersMintsAndTokenAccounts.mints[0];
    accounts.mintB = usersMintsAndTokenAccounts.mints[1];
    accounts.aliceTokenAAccount = usersMintsAndTokenAccounts.tokenAccounts[0][0];
    accounts.aliceTokenBAccount = usersMintsAndTokenAccounts.tokenAccounts[0][1];
    accounts.bobTokenAAccount = usersMintsAndTokenAccounts.tokenAccounts[1][0];
    accounts.bobTokenBAccount = usersMintsAndTokenAccounts.tokenAccounts[1][1];
  });
  it("make offer", async () => {
    // Add your test here.
    const tx = await program.methods.makeOffer(
      offer_id,
      tokenAofferedAmount,
      wantTokenBAmount
    ).accounts({
      maker: getPublicKey(accounts.alice),
      tokenAMintAccount: getPublicKey(accounts.mintA),
      tokenBMintAccount: getPublicKey(accounts.mintB),
      tokenProgram: getPublicKey(accounts.tokenProgram) 
    }).signers([getKeypair(accounts.alice)!]).rpc();
    await confirmTransaction(anchor.getProvider().connection, tx);
    const offers_fetch = await program.account.offer.all();
    assert(offers_fetch.length == 1);
    const [offer_account, offer_bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("offer"),
        offer_id.toArrayLike(Buffer, "le", 8),
        getPublicKey(accounts.alice).toBuffer()
      ],
      program.programId
    )
    assert(offer_account.toBase58() == offers_fetch[0].publicKey.toBase58() && offer_bump == offers_fetch[0].account.bump);
    const vault_account = getAssociatedTokenAddressSync(
      getPublicKey(accounts.mintA),
      offers_fetch[0].publicKey,
      true,
      getPublicKey(accounts.tokenProgram)
    )
    assert((await connection.getTokenAccountBalance(vault_account)).value.amount == new anchor.BN(1e6).toString())
    assert((await connection.getTokenAccountBalance(getPublicKey(accounts.aliceTokenAAccount))).value.amount == new anchor.BN(1e9-1e6).toString())
    accounts.offer = offer_account;
    accounts.vault = vault_account;
  }).slow(1e5);
  it("take offer", async ()=>{
    const tx = await program.methods.takeOffer().accounts({
       taker: getPublicKey(accounts.bob),
       tokenProgram: getPublicKey(accounts.tokenProgram),
       offer: getPublicKey(accounts.offer),
    }).signers([getKeypair(accounts.bob)!]).rpc();
    await confirmTransaction(connection, tx);
    assert((await connection.getTokenAccountBalance(getPublicKey(accounts.aliceTokenBAccount))).value.amount == new anchor.BN(1e6).toString())
    assert((await connection.getTokenAccountBalance(getPublicKey(accounts.bobTokenAAccount))).value.amount == new anchor.BN(1e6).toString())
    assert((await connection.getTokenAccountBalance(getPublicKey(accounts.bobTokenBAccount))).value.amount == new anchor.BN(1e9-1e6).toString())
  }).slow(1e5);
  it("check closed vault", async()=>{
    const closed_vault = await connection.getAccountInfo(getPublicKey(accounts.vault));
    assert(closed_vault == null);
  });
});
