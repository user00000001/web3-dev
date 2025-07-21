import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day17M4 } from "../target/types/day17_m4";
import { assert } from "chai";

describe("day17-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day17M4 as Program<Day17M4>;
  const storage = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    const storage_fetch = await program.account.storage.fetchNullable(storage);
    assert.isNotNull(storage_fetch);
    assert(storage_fetch.x.eq(new anchor.BN(9+8*2**32)));
  });
  it("read other data", async()=>{
    await program.methods.readOtherData().accounts({
      storage,
    }).rpc();
    console.log('`see system logs.`')
  });
  it("read other data fieldname not matched", async()=>{
    await program.methods.readOtherDataFieldnameNotMatched().accounts({
      storage,
    }).rpc();
    console.log('`see system logs.`')
  });
  it("read other data type not matched", async()=>{
    await program.methods.readOtherDataTypeNotMatched().accounts({
      storage,
    }).rpc();
    console.log('`see system logs.`')
  });

});
