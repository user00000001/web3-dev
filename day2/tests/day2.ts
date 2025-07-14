import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day2 } from "../target/types/day2";

describe("day2", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day2 as Program<Day2>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize(new anchor.BN(10), new anchor.BN(15), "hello solana.", [
        new anchor.BN(100),
        new anchor.BN(150),
      ], 3.1415)
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
