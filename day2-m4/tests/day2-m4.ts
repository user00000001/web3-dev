import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day2M4 } from "../target/types/day2_m4";
import { assert } from "chai";

describe("day2-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day2M4 as Program<Day2M4>;
  const myStorage = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    assert((await program.account.myStorage.fetch(myStorage)).x.eq(new anchor.BN(0)));
  });
  it("set x", async () => {
    await program.methods.set(new anchor.BN(10)).rpc();
    assert((await program.account.myStorage.fetch(myStorage)).x.eq(new anchor.BN(10)));
  });
  it("print x", async ()=>{
    await program.methods.printX().accounts({
      myStorage
    }).rpc();
    assert((await program.account.myStorage.fetch(myStorage)).x.eq(new anchor.BN(10)));
  });
});
