import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day10M4 } from "../target/types/day10_m4";
import { assert } from "chai";

describe("day10-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day10M4 as Program<Day10M4>;

  it("Is pda initialized!", async () => {
    // Add your test here.
    const seeds = [];
    const myPda = anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      program.programId
    )[0];
    const tx = await program.methods
      .initialize()
      .accounts({
        myPda,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is keypair initialized!", async () => {
    // Add your test here.
    const myPda_account = anchor.web3.Keypair.generate();
    const airdropTx = await anchor.getProvider().connection.requestAirdrop(myPda_account.publicKey, 1e9);
    const latestBlockHash = await anchor.getProvider().connection.getLatestBlockhash();
    await anchor.getProvider().connection.confirmTransaction({
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      blockhash: latestBlockHash.blockhash,
      signature: airdropTx,
    }, "confirmed");
   const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: myPda_account.publicKey,
        toPubkey: anchor.getProvider().wallet.publicKey,
        lamports: 1e0,
      })
   );
    await anchor.getProvider().sendAndConfirm(transaction,[myPda_account]) // works, because account's data not initialized, not belongs to the program yet.
    console.log(await anchor.getProvider().connection.getAccountInfo(myPda_account.publicKey));
    const tx = await program.methods
      .initializedByKeypair()
.accounts({
        myPda: myPda_account.publicKey,
      }).signers([myPda_account]) // need keypair's private signature for the generated account without seeds.
      .rpc();
    console.log("Your transaction signature", tx);
    console.log(await anchor.getProvider().connection.getAccountInfo(myPda_account.publicKey));
    const transaction_failed = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: myPda_account.publicKey,
        toPubkey: anchor.getProvider().wallet.publicKey,
        lamports: 1e0,
      })
    );
    // private key not working when account is owned by program.
    await anchor.getProvider().sendAndConfirm(transaction_failed,[myPda_account]).then(()=> {throw Error("should not success");}).catch((error)=>{console.log(error)});

    // The only significance difference (which will not affect most applications) is that PDAs can only be initialized with a size of 10,240 bytes, but a keypair account can be initialized to the full size of 10 MB. However, a PDA can be resized up to the 10 MB limit.
  });
});
