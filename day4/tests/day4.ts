import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day4 } from "../target/types/day4";
import { assert } from "chai";

describe("day4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day4 as Program<Day4>;

  it("A is smaller than 100!", async () => {
    // Add your test here.
    try {
      const tx = await program.methods.initialize(new anchor.BN(99)).rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      assert.isTrue(error instanceof anchor.AnchorError);
      let error_: anchor.AnchorError = error;
      let errMsg = "A is too small.";
      assert.strictEqual(errMsg, error_.error.errorMessage);
      console.log(`ErrorCode: {}`, error_.error.errorCode);
    }
  });
  it("A is 100!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize(new anchor.BN(100)).rpc();
    console.log("Your transaction signature", tx);
  });
  it("A is bigger than 100!", async () => {
    // Add your test here.
    try {
      const tx = await program.methods.initialize(new anchor.BN(101)).rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      assert.isTrue(error instanceof anchor.AnchorError);
      let error_: anchor.AnchorError = error;
      let errMsg = "A is too big.";
      assert.strictEqual(errMsg, error_.error.errorMessage);
      console.log(`ErrorCode: {}`, error_.error.errorCode);
    }
  });
});
