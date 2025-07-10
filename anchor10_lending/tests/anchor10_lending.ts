import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor10Lending } from "../target/types/anchor10_lending";
import Anchor10LendingIDL from "../target/idl/anchor10_lending.json";
import { BankrunContextWrapper } from "../bankrun-utils/bankrunConnection";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import {
  createMint,
  mintTo,
  getAccount,
  createAccount,
} from "spl-token-bankrun";
import path from "path";
import { Agent } from "https";
import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch, { RequestInit, Response } from "node-fetch";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { sign } from "crypto";
import { assert } from "chai";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

describe("anchor10_lending", () => {
  let signer: Keypair;
  let usdcBankAccount: PublicKey;
  let solBankAccount: PublicKey;

  let usdcTokenAccount: PublicKey;
  let solTokenAccount: PublicKey;
  let mintSOL: PublicKey;
  let mintUSDC: PublicKey;
  let solUsdPriceFeedAccount: string;
  let solUsdPriceFeedAccountPubkey: PublicKey;

  let provider: BankrunProvider;
  let program: Program<Anchor10Lending>;
  let banksClient: BanksClient;
  let context: ProgramTestContext;
  let bankrunContextWrapper: BankrunContextWrapper;

  const proxy_url = "http://127.0.0.1:20171";
  const agent = new HttpsProxyAgent(proxy_url);
  const fetchWithProxy = (
    url: string,
    options?: RequestInit
  ): Promise<Response> => {
    const optionsWithAgent: RequestInit = {
      ...options,
      agent: agent as any,
    };
    return nodeFetch(url, optionsWithAgent);
  };

  before(async () => {
    const pyth = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE");

    const devnetConnection = new Connection("https://api.devnet.solana.com", {
      fetch: fetchWithProxy as any,
    });

    const accountInfo = await devnetConnection.getAccountInfo(pyth);

    context = await startAnchor(
      path.join(__dirname, ".."),
      [
        {
          name: "anchor10_lending",
          programId: new PublicKey(Anchor10LendingIDL.address),
        },
      ],
      [
        {
          address: pyth,
          info: accountInfo!,
        },
      ]
    );
    provider = new BankrunProvider(context);

    bankrunContextWrapper = new BankrunContextWrapper(context);

    const connection = bankrunContextWrapper.connection.toConnection();

    const pythSolanaReceiver = new PythSolanaReceiver({
      connection,
      wallet: provider.wallet,
    });

    const SOL_PRICE_FEED_ID =
      "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

    solUsdPriceFeedAccount = pythSolanaReceiver
      .getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID)
      .toBase58();

    solUsdPriceFeedAccountPubkey = new PublicKey(solUsdPriceFeedAccount);
    const feedAccountInfo = await devnetConnection.getAccountInfo(
      solUsdPriceFeedAccountPubkey
    );

    context.setAccount(solUsdPriceFeedAccountPubkey, feedAccountInfo);

    console.log("pricefeed:", solUsdPriceFeedAccount);

    console.log("Pyth Account Info:", accountInfo);

    program = new Program<Anchor10Lending>(Anchor10LendingIDL, provider);

    banksClient = context.banksClient;

    signer = provider.wallet.payer;

    mintUSDC = await createMint(banksClient, signer, signer.publicKey, null, 2);

    mintSOL = await createMint(banksClient, signer, signer.publicKey, null, 2);

    [usdcBankAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), mintUSDC.toBuffer()],
      program.programId
    );

    [solBankAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), mintSOL.toBuffer()],
      program.programId
    );

    solTokenAccount = getAssociatedTokenAddressSync(mintSOL, signer.publicKey);

    console.log("USDC Bank Account", usdcBankAccount.toBase58());

    console.log("SOL Bank Account", solBankAccount.toBase58());
  });
  it("Test Init User", async () => {
    const initUserTx = await program.methods
      .initUser(mintUSDC)
      .accounts({
        signer: signer.publicKey,
      })
      .rpc({ commitment: "confirmed" });
    const user_data = anchor.web3.PublicKey.findProgramAddressSync(
      [signer.publicKey.toBuffer()],
      program.programId
    )[0];
    const user_fetch = await program.account.user.fetch(user_data);
    assert(user_fetch.usdcAddress.toBase58() == mintUSDC.toBase58());
  });
  it("Test Init and Fund USDC Bank", async () => {
    const initUSDCBankTx = await program.methods
      .initBank(new anchor.BN(1), new anchor.BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    const amount = 10_000 * 1e9;
    const mintTx = await mintTo(
      banksClient,
      signer,
      mintUSDC,
      usdcBankAccount,
      signer,
      amount
    );
    const bank_token_account = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), mintUSDC.toBuffer()],
      program.programId
    )[0];
    const bank_token_account_fetch = await getAccount(
      banksClient,
      bank_token_account,
      "confirmed"
    );
    assert(bank_token_account_fetch.amount.toString() == amount.toString());
  });
  it("Test Init and Fund SOL Bank", async () => {
    const initSOLBankTx = await program.methods
      .initBank(new anchor.BN(1), new anchor.BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    const amount = 10_000 * 1e9;
    const mintTx = await mintTo(
      banksClient,
      signer,
      mintSOL,
      solBankAccount,
      signer,
      amount
    );
    const bank_token_account = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), mintSOL.toBuffer()],
      program.programId
    )[0];
    const bank_token_account_fetch = await getAccount(
      banksClient,
      bank_token_account,
      "confirmed"
    );
    assert(bank_token_account_fetch.amount.toString() == amount.toString());
  });
  it("Create and Fund Token Account", async () => {
    usdcTokenAccount = await createAccount(
      banksClient,
      signer,
      mintUSDC,
      signer.publicKey
    );
    const amount = 10_000 * 1e9;
    const mintTx = await mintTo(
      banksClient,
      signer,
      mintUSDC,
      usdcTokenAccount,
      signer,
      amount
    );
    const usdc_token_account_fetch = await getAccount(
      banksClient,
      usdcTokenAccount,
      "confirmed"
    );
    assert(usdc_token_account_fetch.amount.toString() == amount.toString());
  });
  it("Test Deposit", async () => {
    const usdcBankAccount_before = await getAccount(
      banksClient,
      usdcBankAccount,
      "confirmed"
    );
    await program.methods
      .deposit(new anchor.BN(100e9))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    const usdcBankAccount_after = await getAccount(
      banksClient,
      usdcBankAccount,
      "confirmed"
    );
    assert(
      usdcBankAccount_before.amount + BigInt(100e9) ==
        usdcBankAccount_after.amount
    );
  });
  it("Test Borrow", async () => {
    const solBankAccount_before = await getAccount(
      banksClient,
      solBankAccount,
      "confirmed"
    );
    await program.methods
      .borrow(new anchor.BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
        priceUpdate: solUsdPriceFeedAccount,
      })
      .rpc({ commitment: "confirmed" });
    const solTokenAccount_after = await getAccount(
      banksClient,
      solTokenAccount,
      "confirmed"
    );
    const solBankAccount_after = await getAccount(
      banksClient,
      solBankAccount,
      "confirmed"
    );
    const total_after =
      solTokenAccount_after.amount + solBankAccount_after.amount;
    console.log(solTokenAccount_after.amount);
    assert(total_after == solBankAccount_before.amount);
  });
  it("Test Repay", async () => {
    const solTokenAccount_before = await getAccount(
      banksClient,
      solTokenAccount,
      "confirmed"
    );
    const solBankAccount_before = await getAccount(
      banksClient,
      solBankAccount,
      "confirmed"
    );
    await program.methods
      .repay(new anchor.BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    const solTokenAccount_after = await getAccount(
      banksClient,
      solTokenAccount,
      "confirmed"
    );
    const solBankAccount_after = await getAccount(
      banksClient,
      solBankAccount,
      "confirmed"
    );
    const total_before =
      solTokenAccount_before.amount + solBankAccount_before.amount;
    const total_after =
      solTokenAccount_after.amount + solBankAccount_after.amount;
    console.log(solTokenAccount_after.amount);
    assert(total_after == total_before);
  });
  it("Test Withdraw", async () => {
    const usdcBankAccount_before = await getAccount(
      banksClient,
      usdcBankAccount,
      "confirmed"
    );
    await program.methods
      .withdraw(new anchor.BN(100))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    const usdcBankAccount_after = await getAccount(
      banksClient,
      usdcBankAccount,
      "confirmed"
    );
    assert(
      usdcBankAccount_after.amount + BigInt(100) ==
        usdcBankAccount_before.amount
    );
  });
});
