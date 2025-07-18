import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day8M4 } from "../target/types/day8_m4";
import { assert } from "chai";

describe("day8-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day8M4 as Program<Day8M4>;
  const rngKp = anchor.web3.Keypair.generate();
  const sols = 3e2;
  const amount = new anchor.BN(sols * anchor.web3.LAMPORTS_PER_SOL);

  it("send Sol!", async () => {
    // Add your test here.
    const tx = await program.methods
      .sendSola(amount)
      .accounts({
        recipient: rngKp.publicKey,
      })
      .rpc({commitment: "confirmed"});
    console.log("Your transaction signature", tx);
    const balance = await anchor.getProvider().connection.getBalanceAndContext(rngKp.publicKey, "confirmed");
    assert(balance.value == sols * anchor.web3.LAMPORTS_PER_SOL);
  });
  it("split Sol!", async()=>{
    const rngKp1 = anchor.web3.Keypair.generate();
    const rngKp2 = anchor.web3.Keypair.generate();
    const rngKp3 = anchor.web3.Keypair.generate();
    const remainingAccounts = [
      {
        pubkey: rngKp1.publicKey,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: rngKp2.publicKey,
        isSigner: false,
        isWritable: true
      },
      //{
      //  pubkey: rngKp1.publicKey,
      //  isSigner: false,
      //  isWritable: true
      //}
    ];
    await program.methods.splitSol(amount).remainingAccounts(remainingAccounts).rpc({commitment: "confirmed"});
    const rngKp1_balance = (await anchor.getProvider().connection.getBalanceAndContext(rngKp1.publicKey)).value;
    const rngKp2_balance = (await anchor.getProvider().connection.getBalanceAndContext(rngKp2.publicKey)).value;
    const rngKp3_balance = (await anchor.getProvider().connection.getBalanceAndContext(rngKp3.publicKey)).value;
    console.log(rngKp1_balance, rngKp2_balance, rngKp3_balance);
    assert(rngKp1_balance == (sols * anchor.web3.LAMPORTS_PER_SOL / remainingAccounts.length) );
    assert(rngKp2_balance == (sols * anchor.web3.LAMPORTS_PER_SOL / remainingAccounts.length) );
    //assert(rngKp3_balance == (sols * anchor.web3.LAMPORTS_PER_SOL / remainingAccounts.length) );
  });
});
