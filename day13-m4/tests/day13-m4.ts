import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day13M4 } from "../target/types/day13_m4";
import { assert } from "chai";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("day13-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day13M4 as Program<Day13M4>;
  const pda = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];
  const connection = program.provider.connection;
  const payer = program.provider.wallet.payer;
  
  it("Is initialized!", async () => {
    // Add your test here.
    const initTx = await program.methods
      .initialize()
      .accounts({
        pda,
      })
      .transaction();
    const setTx = await program.methods
      .set(5)
      .accounts({
        pda,
      })
      .transaction();

    const setFailsTx = await program.methods
      .setFails(5)
      .accounts({
        pda,
      })
      .transaction();
    const tx = new anchor.web3.Transaction().add(initTx).add(setTx)
      //.add(setFailsTx);
    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
      payer,
    ])
    //.then(()=>{ throw "transaction should not success."}).catch((reason)=>{
    //  console.error(reason);
    //});
    const pda_fetch = await program.account.pda.fetchNullable(pda);
    console.log("Your transaction signature", sig);
    assert(pda_fetch.value == 5);
    //assert.isNull(pda_fetch);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const initTx = await program.methods
      .initialize()
      .accounts({
        pda,
      })
      .transaction();
    const setTx = await program.methods
      .set(10)
      .accounts({
        pda,
      })
      .transaction();

    const setFailsTx = await program.methods
      .setFails(5)
      .accounts({
        pda,
      })
      .transaction();
    const tx = new anchor.web3.Transaction();
    const pda_account_info = await connection.getAccountInfo(pda);
    if (!pda_account_info || pda_account_info.owner.equals(SYSTEM_PROGRAM_ID) || pda_account_info.lamports == 0) {
      tx.add(initTx);
    } else {
      console.log(pda_account_info);
    }
    tx.add(setTx);
    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
      payer]);
    const pda_fetch = await program.account.pda.fetchNullable(pda);
    console.log("Your transaction signature", sig);
    assert(pda_fetch.value == 10);
  });
});
