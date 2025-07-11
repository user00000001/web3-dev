import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor12Attack } from "../target/types/anchor12_attack";

describe("anchor12_attack", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchor12Attack as Program<Anchor12Attack>;

  it("Is initialized!", async () => {
    // Add your test here.
  });
});
