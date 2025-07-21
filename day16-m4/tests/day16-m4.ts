import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Day16M4 } from "../target/types/day16_m4";

describe("day16-m4", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.day16M4 as Program<Day16M4>;
  const payer = anchor.getProvider().wallet.payer;

  async function confirmTransaction(tx) {
    const latestBlockHash = await anchor
      .getProvider()
      .connection.getLatestBlockhash();
    await anchor.getProvider().connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: tx,
      },
      "confirmed"
    );
  }
  async function airdropSol(publicKey, amount) {
    let airdropTx = await anchor
      .getProvider()
      .connection.requestAirdrop(
        publicKey,
        amount * anchor.web3.LAMPORTS_PER_SOL
      );
    await confirmTransaction(airdropTx);
  }
  it("Is initialized!", async () => {
    // Add your test here.
    const rngKp = anchor.web3.Keypair.generate();
    await airdropSol(rngKp.publicKey, 10);
    await program.methods.initialize().accounts({someAccount: rngKp.publicKey}).signers([rngKp]).rpc().then(()=>{throw "should not success."}).catch((reason)=>{
      console.error(reason);
    });
    console.log(`if account's init field exists, Account will transfer owner from System_Program to this Program, the previous operation would not be failed.`);
  });

  it("unchecked account's data", async()=>{
    const rngKp = anchor.web3.Keypair.generate();
    const tx = new anchor.web3.Transaction().add(anchor.web3.SystemProgram.createAccount(
      {
        fromPubkey: payer.publicKey,
        newAccountPubkey: rngKp.publicKey,
        space: 16,
        lamports: await anchor.getProvider().connection.getMinimumBalanceForRentExemption(16),
        programId: program.programId,
      }
    ));
    await anchor.web3.sendAndConfirmTransaction(program.provider.connection, tx, [payer, rngKp]);
    await program.methods.foo().accounts({
      someAccount: rngKp.publicKey
    }).rpc();
    const rngKp_account_info = await anchor.getProvider().connection.getAccountInfo(rngKp.publicKey);
    console.log(rngKp_account_info);
  });
  it("hello signer info", async()=>{
    await program.methods.hello().rpc();
    console.log(`see system logs.`);
  });
});
