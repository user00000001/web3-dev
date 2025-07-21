import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day18M4 } from "../target/types/day18_m4";
import { Alice } from "../target/types/alice";
import { assert } from "chai";

describe("day18-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day18M4 as Program<Day18M4>;
  const program_alice = anchor.workspace.alice as Program<Alice>;
  const bobDataAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
  it("cpi from alice to bob.", async () => {
    await program_alice.methods
      .initialize(new anchor.BN(3), new anchor.BN(5))
      .accounts({
        bobDataAccount,
        bobProgram: program.programId,
      })
      .rpc();
    const bobDataAccount_fetch = await program.account.bobData.fetch(
      bobDataAccount
    );
    assert(
      bobDataAccount_fetch.result.eq(new anchor.BN(3).add(new anchor.BN(5)))
    );
  });
});
