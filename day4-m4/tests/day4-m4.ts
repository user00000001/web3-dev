import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day4M4 } from "../target/types/day4_m4";
import { assert } from "chai";

describe("day4-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day4M4 as Program<Day4M4>;
  const name = "map_name";
  const key1 = new anchor.BN(10);
  const key2 = new anchor.BN(10);
  const value = new anchor.BN(100);
  const val = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(name),
      key1.toArrayLike(Buffer, "le", 8),
      key2.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize(name, key1, key2).rpc();
    console.log("Your transaction signature", tx);
    const val_fetch = await program.account.val.fetchNullable(val);
    console.log(val_fetch);
    assert.isNotNull(val_fetch);
  });
  it("set val", async()=>{
    await program.methods.set(name, key1, key2, value).rpc();
    const val_fetch = await program.account.val.fetch(val);
    console.log(val_fetch);
    assert(val_fetch.value.eq(value));
  });
});
