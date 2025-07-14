import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day3 } from "../target/types/day3";

describe("day3", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day3 as Program<Day3>;

  it("add function", async () => {
    // Add your test here.
    const tx = await program.methods
      .add(new anchor.BN(5), new anchor.BN(10)).accounts( {account: anchor.web3.Keypair.generate().publicKey})
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("sub function", async () => {
    // Add your test here.
    const tx = await program.methods
      .sub(new anchor.BN(50), new anchor.BN(10))
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
