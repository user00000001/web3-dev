import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day3M4 } from "../target/types/day3_m4";
import TrueOrFalseIDL from "../target/idl/day3_m4.json";
import { assert } from "chai";

describe("day3-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day3M4 as Program<Day3M4>;
  const true_or_false_program = new anchor.Program<Day3M4>(TrueOrFalseIDL, anchor.getProvider());
  const trueOrFalse = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    const true_or_false_fetch = await program.account.trueOrFalse.fetchNullable(trueOrFalse);
    console.log(true_or_false_fetch);
    assert.isNotNull(true_or_false_fetch);
  });
  it("set true_or_false", async()=>{
    const true_or_false_fetch = await program.account.trueOrFalse.fetch(trueOrFalse);
    await program.methods.set(!true_or_false_fetch.trueOrFalse).rpc();
    assert(!true_or_false_fetch.trueOrFalse == (await program.account.trueOrFalse.fetch(trueOrFalse, "confirmed")).trueOrFalse);
  });
  it("read true_or_false", async()=> {
    const true_or_false_fetch = await true_or_false_program.account.trueOrFalse.fetch(trueOrFalse);
    console.log(true_or_false_fetch);
    console.log(await anchor.getProvider().connection.getAccountInfo(trueOrFalse));
  });
});
