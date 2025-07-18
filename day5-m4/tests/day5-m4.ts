import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day5M4 } from "../target/types/day5_m4";
import { assert } from "chai";

describe("day5-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day5M4 as Program<Day5M4>;
  const myStorage = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];
  const incre_size = 2048;
  let prev_acc_info;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    prev_acc_info = await anchor
      .getProvider()
      .connection.getAccountInfo(myStorage);
    console.log(prev_acc_info, prev_acc_info.data.length);
    assert(prev_acc_info.space == 8 + 8);
  });
  it("Increase the struct size.", async () => {
    // Add your test here.
    const tx = await program.methods.increStructSize(new anchor.BN(incre_size)).rpc();
    console.log("Your transaction signature", tx);
    const myStorageAccInfo = await anchor
      .getProvider()
      .connection.getAccountInfo(myStorage);
    console.log(myStorageAccInfo, myStorageAccInfo.data.length);
    assert(prev_acc_info.data.length + incre_size == myStorageAccInfo.data.length)
  });
});
