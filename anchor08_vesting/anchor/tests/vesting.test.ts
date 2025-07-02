import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import { Vesting } from '../target/types/vesting'
import { BanksClient, Clock, ProgramTestContext, startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import VestingIDL from '../target/idl/vesting.json'
import { createMint, mintTo, getAccount } from 'spl-token-bankrun'
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import path from 'path'
import { beforeAll, describe, expect, it } from "@jest/globals"
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'

describe('vesting', () => {
  const company_name = 'company_name'
  const employee = new Keypair()
  let context: ProgramTestContext;
  let banksClient: BanksClient
  let provider
  let employeeProvider
  let employer: Keypair
  let mint: PublicKey
  let vestingDataAccount: PublicKey
  let employeeDataAccount: PublicKey
  let treasuryTokenAccount: PublicKey
  let program: Program<Vesting>
  let program2: Program<Vesting>
  beforeAll(async () => {
    context = await startAnchor(
      path.resolve(__dirname, '..'),
      [{ name: 'vesting', programId: new PublicKey(VestingIDL.address) }],
      [
        {
          address: employee.publicKey,
          info: {
            lamports: 1e9,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ],
    )
    banksClient = context.banksClient
    provider = new BankrunProvider(context)
    anchor.setProvider(provider)
    employer = (provider.wallet as anchor.Wallet).payer
    program = new Program<Vesting>(VestingIDL, provider)
    employeeProvider = new BankrunProvider(context)
    employeeProvider.wallet = new NodeWallet(employee)
    program2 = new Program<Vesting>(VestingIDL, employeeProvider)

    // create mint
    mint = await createMint(banksClient, employer, employer.publicKey, null, 9)

    ;[treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('vesting_treasury'), Buffer.from(company_name)],
      program.programId,
    )
    ;[vestingDataAccount] = PublicKey.findProgramAddressSync([Buffer.from(company_name)], program.programId)
    ;[employeeDataAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('employee_vesting'), employee.publicKey.toBuffer(), vestingDataAccount.toBuffer()],
      program2.programId,
    )
  })
  it('create vesting account.', async () => {
    const tx = await program.methods
      .createVesting(company_name)
      .accounts({
        employer: employer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([employer])
      .rpc({ commitment: 'confirmed' })
    const treasuryBalance = await getAccount(banksClient, treasuryTokenAccount)
    expect(treasuryBalance.amount).toEqual(BigInt(0))
  })
  it('fund treasury token account.', async () => {
    const tx = await mintTo(banksClient, employer, mint, treasuryTokenAccount, employer, 1e13)
    const treasuryBalance = await getAccount(banksClient, treasuryTokenAccount)
    expect(treasuryBalance.amount === BigInt(1e13)).toBeTruthy()
  })
  it('create employee account', async () => {
    const tx = await program.methods
      .createEmployee(new anchor.BN(0), new anchor.BN(1000), new anchor.BN(500), new anchor.BN(1e10))
      .accounts({
        employee: employee.publicKey,
        vestingDataAccount: vestingDataAccount,
      })
      .signers([employer])
      .rpc({commitment: "confirmed"});
    const employeeDataAccount_fetch_nullable = await program.account.employeeDataAccount.fetchNullable(employeeDataAccount);
    expect(employeeDataAccount_fetch_nullable == null).toBeFalsy();
  });
  it("claim half vesting tokens.", async ()=>{
    // await new Promise(resolve=>setTimeout(resolve, 1000));
    const currentClock = await banksClient.getClock();
    context.setClock(new Clock(
      currentClock.slot,
      currentClock.epochStartTimestamp,
      currentClock.epoch,
      currentClock.leaderScheduleEpoch,
      BigInt(500),
    ));
  const employeeTokenAccount = getAssociatedTokenAddressSync(mint, employee.publicKey);
  const tx = await program2.methods.claimToken(company_name).accounts({
      employee: employee.publicKey,
      employeeTokenAccount,
      vestingDataAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([employee]).rpc({commitment:"confirmed"});
    const employeeTokenAccount_ = await getAccount(banksClient, employeeTokenAccount);
    const treasuryTokenAccount_ = await getAccount(banksClient, treasuryTokenAccount);
    expect(employeeTokenAccount_.amount).toEqual(BigInt(5e9));
    expect(treasuryTokenAccount_.amount).toEqual(BigInt(1e13 - 5e9));
  });
 it("claim the rest half vesting tokens.", async ()=>{
    // await new Promise(resolve=>setTimeout(resolve, 1000));
    const currentClock = await banksClient.getClock();
    context.setClock(new Clock(
      currentClock.slot,
      currentClock.epochStartTimestamp,
      currentClock.epoch,
      currentClock.leaderScheduleEpoch,
      BigInt(1000),
    ));
  const employeeTokenAccount = getAssociatedTokenAddressSync(mint, employee.publicKey);
  const tx = await program2.methods.claimToken(company_name).accounts({
      employee: employee.publicKey,
      employeeTokenAccount,
      vestingDataAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([employee]).rpc({commitment:"confirmed"});
    const employeeTokenAccount_ = await getAccount(banksClient, employeeTokenAccount);
    const treasuryTokenAccount_ = await getAccount(banksClient, treasuryTokenAccount);
    expect(employeeTokenAccount_.amount).toEqual(BigInt(1e10));
    expect(treasuryTokenAccount_.amount).toEqual(BigInt(1e13 - 1e10));
  });
});
