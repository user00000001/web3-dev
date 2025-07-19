import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day9M4 } from "../target/types/day9_m4";
import { assert } from "chai";

const airdropSol = async (publickey, amount) => {
  let airdropTx = await anchor
    .getProvider()
    .connection.requestAirdrop(publickey, amount);
  await confirmTransaction(airdropTx);
};

const confirmTransaction = async (tx) => {
  const latestBlockHash = await anchor
    .getProvider()
    .connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
};

describe("day9-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day9M4 as Program<Day9M4>;

  it("Is initialized!", async () => {
    // Add your test here.
    const rngKp = anchor.web3.Keypair.generate();
    await airdropSol(rngKp.publicKey, 1e9);
    const rngKp1 = anchor.web3.Keypair.generate();
    await airdropSol(rngKp1.publicKey, 1e9);
    const newValue = new anchor.BN(1000);
    let seeds = [];
    const myStorage = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId)[0];
    const tx = await program.methods.initialize().accounts({
      myStorage,
      signer: rngKp.publicKey
    }).signers([rngKp]).rpc();
    console.log("Your transaction signature", tx);
    await program.methods.updateValue(newValue).accounts({
      fren: rngKp1.publicKey
    }).signers([rngKp1]).rpc();
    const myStorage_fetch = await program.account.myStorage.fetch(myStorage);
    assert(myStorage_fetch.x.eq(newValue));
  });
  it("players transfer points", async()=>{
    const rngKp = anchor.web3.Keypair.generate();
    await airdropSol(rngKp.publicKey, 1e9);
    const rngKp1 = anchor.web3.Keypair.generate();
    await airdropSol(rngKp1.publicKey, 1e9);
    const newValue = new anchor.BN(1000);
    let seeds = [rngKp.publicKey.toBuffer()];
    const player = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId)[0];
    let seeds1 = [rngKp1.publicKey.toBuffer()];
    const player1 = anchor.web3.PublicKey.findProgramAddressSync(seeds1, program.programId)[0];
    const transfer_points = new anchor.BN(5);
    await program.methods.initPlayer().accounts({signer: rngKp.publicKey}).signers([rngKp]).rpc();
    await program.methods.initPlayer().accounts({signer: rngKp1.publicKey}).signers([rngKp1]).rpc();
    assert((await program.account.player.fetch(player)).points.eq(new anchor.BN(10)));
    assert((await program.account.player.fetch(player1)).points.eq(new anchor.BN(10)));
    await program.methods.transferPoints(transfer_points).accounts({
      from: player,
      to: player1,
      authority: rngKp.publicKey
      //signer: rngKp.publicKey
    }).signers([rngKp]).rpc({commitment:"confirmed"});
    assert((await program.account.player.fetch(player)).points.eq(new anchor.BN(10).sub(transfer_points)));
    assert((await program.account.player.fetch(player1)).points.eq(new anchor.BN(10).add(transfer_points)));
  });
});
