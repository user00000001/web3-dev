import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day15M4 } from "../target/types/day15_m4";
import { assert } from "chai";

describe("day15-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day15M4 as Program<Day15M4>;
  const pda = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    const pda_fetch = await program.account.pda.fetchNullable(pda);
    assert.isNotNull(pda_fetch);
  });
  it("close pda", async () => {
    await program.methods.close().accounts({
      pda,
    }).rpc();
    const pda_fetch = await program.account.pda.fetchNullable(pda);
    assert.isNull(pda_fetch);
  });
});
