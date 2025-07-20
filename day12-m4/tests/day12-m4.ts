import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day12M4 } from "../target/types/day12_m4";
import { assert } from "chai";

describe("day12-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day12M4 as Program<Day12M4>;
  const [myPDA, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  );

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.increment().rpc();
    console.log("Your transaction signature", tx);
    await program.methods.increment().rpc();
    await program.methods.increment().rpc();
    await program.methods.increment().rpc();
    await program.methods.increment().rpc();
    const myPDA_fetch = await program.account.myPda.fetch(myPDA);
    console.log(myPDA_fetch);
    assert(myPDA_fetch.counter.eq(new anchor.BN(5)));
  });
  it("reinitialize.", async()=>{
    await program.methods.drainLamports().rpc();
    await program.methods.increment().rpc();
    await program.methods.giveToSystemProgram().rpc();
    await program.methods.increment().rpc();
    const myPDA_fetch = await program.account.myPda.fetch(myPDA);
    console.log(myPDA_fetch);
    assert(myPDA_fetch.counter.eq(new anchor.BN(1)));
  });
  it("initialize insecure.", async ()=>{
    await program.methods.increment().rpc();
    await program.methods.increment().rpc();
    await program.methods.increment().rpc();
    await program.methods.increment().rpc();
    console.log(await anchor.getProvider().connection.getAccountInfo(myPDA));
    await program.methods.initializeInsecure().accounts({
      myPda: myPDA,
    }).rpc();
    await program.methods.increment().rpc();
    console.log(await anchor.getProvider().connection.getAccountInfo(myPDA));
    await program.methods.initializeInsecure().accounts({
      myPda: myPDA,
    }).rpc();
    const myPDA_fetch = await program.account.myPda.fetch(myPDA);
    console.log(myPDA_fetch);
    assert(myPDA_fetch.counter.eq(new anchor.BN(1)));
  });
  it("erase pda", async()=> {
    await program.methods.erase().accounts({myPda: myPDA}).rpc();
    console.log(await anchor.getProvider().connection.getAccountInfo(myPDA));
  });
  it("reinitialize erase pda.", async()=>{
    await program.methods.drainEraseAccountLamports().accounts({myPda: myPDA}).rpc();
    await program.methods.increment().rpc();
    console.log(await anchor.getProvider().connection.getAccountInfo(myPDA));
    const myPDA_fetch = await program.account.myPda.fetch(myPDA);
    console.log(myPDA_fetch);
    assert(myPDA_fetch.counter.eq(new anchor.BN(1)));
  });
});
