import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day1M4 } from "../target/types/day1_m4";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { assert } from "chai";

describe("day1-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day1M4 as Program<Day1M4>;
  const payer = anchor.getProvider().wallet.payer!;

  it("Is initialized!", async () => {
    // Add your test here.
    const myStorage = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("my_storage"), payer.publicKey.toBuffer()],
      program.programId
    )[0];
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: payer.publicKey,
        myStorage,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();
    console.log("Your transaction signature", tx);
    const myStorage_fetch = await program.account.myStorage.fetchNullable(myStorage, "confirmed");
    console.log(myStorage_fetch);
    assert.isNotNull(myStorage_fetch);
    //await program.methods.initialize().rpc(); // can be initialized twice.
  });
});
