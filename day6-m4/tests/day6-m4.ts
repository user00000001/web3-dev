import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day6M4 } from "../target/types/day6_m4";

describe("day6-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day6M4 as Program<Day6M4>;
  const payer = anchor.getProvider().wallet.payer!;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        acct: payer.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
