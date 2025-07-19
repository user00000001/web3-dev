import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day11M4 } from "../target/types/day11_m4";
import { assert } from "chai";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("day11-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day11M4 as Program<Day11M4>;
  const seeds = [];
  const myStorage = anchor.web3.PublicKey.findProgramAddressSync(
    seeds,
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    const myStorage_fetch = await program.account.myStorage.fetchNullable(myStorage);
    const myStorageAccountInfo = await anchor.getProvider().connection.getAccountInfo(myStorage);
    console.log(myStorageAccountInfo);
    assert.isNotNull(myStorage_fetch);
    assert(myStorageAccountInfo.owner.equals(program.programId));
  });
  it("change owner to system program", async()=>{
    await program.methods.changeOwner().accounts({
      myStorage,
    }).rpc();
    const myStorageAccountInfo = await anchor.getProvider().connection.getAccountInfo(myStorage);
    console.log(myStorageAccountInfo);
    assert(myStorageAccountInfo.data.length == 0);
    assert(myStorageAccountInfo.owner.equals(SYSTEM_PROGRAM_ID));
  });
  it("still can be reinitialized.", async()=>{
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
    const myStorage_fetch = await program.account.myStorage.fetchNullable(myStorage);
    const myStorageAccountInfo = await anchor.getProvider().connection.getAccountInfo(myStorage);
    console.log(myStorageAccountInfo);
    assert.isNotNull(myStorage_fetch);
    assert(myStorageAccountInfo.owner.equals(program.programId));
  });
  it("donate 1 sol.", async()=>{
    const sols = 1;
    const prev = await anchor.getProvider().connection.getBalance(myStorage);
    await program.methods.donate(new anchor.BN(sols * anchor.web3.LAMPORTS_PER_SOL)).rpc();
    const curr = await anchor.getProvider().connection.getBalance(myStorage);
    assert(prev + sols * anchor.web3.LAMPORTS_PER_SOL == curr);
  });
  it("withdraw 1 sol.", async()=>{
    const sols = 1;
    const prev = await anchor.getProvider().connection.getBalance(myStorage);
    await program.methods.withdraw(new anchor.BN(sols * anchor.web3.LAMPORTS_PER_SOL)).rpc({commitment: "confirmed"});
    const curr = await anchor.getProvider().connection.getBalance(myStorage);
    console.log(prev, curr);
    assert.equal(prev - sols * anchor.web3.LAMPORTS_PER_SOL, curr);
  });

});
