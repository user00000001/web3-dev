import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor09Lottery } from "../target/types/anchor09_lottery";
import { assert } from "chai";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import * as sb from "@switchboard-xyz/on-demand";
import OnDemandIDL from "./ondemand-idl.json";

describe("anchor09_lottery", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchor09Lottery as Program<Anchor09Lottery>;
  const connection = anchor.getProvider().connection;
  const TOKEN_METADATA_PROGRAM = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  const rngKp = anchor.web3.Keypair.generate();
  // better-https-proxy-agent needs https proxy server, insteaded by anchor idl command.
  // `proxychains ablrun anchor --provider.cluster mainnet idl fetch <sb.ON_DEMAND_MAINNET_PID> -o ondemand-idl.json`
  console.log(`${sb.ON_DEMAND_MAINNET_PID.toBase58()}`);
  const switchboardProgram = new anchor.Program(OnDemandIDL, provider);

  //before(async()=>{
  //  const switchboardIDL = await anchor.Program.fetchIdl(
  //    sb.ON_DEMAND_MAINNET_PID, 
  //    {connection: new anchor.web3.Connection("https://api.mainnet-beta.solana.com", { agent: https.Agent})}
  //  );
  //  switchboardProgram = new anchor.Program(switchboardIDL, provider);
  //});
  //
  const lotteryData = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("lottery_data")],
      program.programId
  )[0];
  const collection_mint = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("collection_mint")],
      program.programId
  )[0];
  const metadata = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM.toBuffer(),
        collection_mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM
  )[0];
  const master_edition = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM.toBuffer(),
        collection_mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM
  )[0];

  const buyTicket = async () => {
    const buyTicketIx = await program.methods
      .buyTicket()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    const lastBlockContext = await connection.getLatestBlockhash();
    const computeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 3e5,
    });
    const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    });
    const tx = new anchor.web3.Transaction({
      blockhash: lastBlockContext.blockhash,
      lastValidBlockHeight: lastBlockContext.lastValidBlockHeight,
    })
      .add(buyTicketIx)
      .add(computeIx)
      .add(priorityIx);
    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
      anchor.getProvider().wallet.payer!,
    ]);
    console.log(`buy ticket`, sig);
  };
  it("initialize lottery!", async () => {
    // Add your test here.
    const slot = await connection.getSlot();
    const init_config_ix = await program.methods
      .initializeConfig(
        new anchor.BN(0),
        new anchor.BN(slot + 10),
        new anchor.BN(1e4)
      )
      .instruction();
    const init_lottery_ix = await program.methods
      .initializeLottery()
      .accounts({
        metadata,
        masterEdition: master_edition,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    const lastBlockContext = await connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      lastValidBlockHeight: lastBlockContext.lastValidBlockHeight,
      blockhash: lastBlockContext.blockhash,
    })
      .add(init_config_ix)
      .add(init_lottery_ix);
    const tx_rsp = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
      anchor.getProvider().wallet.payer!,
    ]);
    const lottery_data_all = await program.account.lotteryData.all();
    assert(lottery_data_all.length == 1);
    assert(lottery_data_all[0].account.price.eq(new anchor.BN(1e4)));
  });
  it("buy ticket five times.", async () => {
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    const lottery_data_fetch = await program.account.lotteryData.fetch(
      lotteryData
    );
    assert(lottery_data_fetch.ticketNum.eq(new anchor.BN(5)));
  });
  it("commit and choose winner.", async () => {
    //const { connection } = await sb.AnchorUtils.loadEnv();
    //console.log(`Connection from AnchorUtils:`, connection.rpcEndpoint);
    const queue = new anchor.web3.PublicKey(
      "A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w"
    );

    const queueAccount = new sb.Queue(switchboardProgram, queue);
    console.log("Queue account", queue.toString());
    try {
      await queueAccount.loadData();
    } catch (err) {
      console.log("Queue account not found");
      process.exit(1);
    }

    const [randomness, ix] = await sb.Randomness.create(
      switchboardProgram,
      rngKp,
      queue
    );
    console.log("Created randomness account..");
    console.log("Randomness account", randomness.pubkey.toBase58());
    
    const createRandomnessTx = await sb.asV0Tx({
      connection,
      ixs: [ix],
      payer: provider.wallet.publicKey,
      signers: [provider.wallet.payer, rngKp],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const blockhashContext = await connection.getLatestBlockhashAndContext();
    const createRandomnessSignature = await connection.sendTransaction(createRandomnessTx);
    await connection.confirmTransaction({
      signature: createRandomnessSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log(`Transaction signature for randomness account creation:`, createRandomnessSignature);
    const sbCommitIx = await randomness.commitIx(queue);
    const commitIx = await program.methods.commitWinner()
      .accounts({
        randomnessData: randomness.pubkey
      })
      .instruction();
    const commitTx = await sb.asV0Tx({
      connection,
      ixs: [sbCommitIx, commitIx],
      payer: provider.wallet.publicKey,
      signers: [provider.wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const commitSignature = await connection.sendTransaction(commitTx);
    await connection.confirmTransaction({
      signature: commitSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    });
    console.log(`Transaction signature for commit:`, commitSignature);

    const sbRevealIx = await randomness.revealIx();
    const revealIx = await program.methods.chooseWinner().accounts({
      randomnessData: randomness.pubkey
    }).instruction();

    const revealTx = await sb.asV0Tx({
      connection,
      ixs: [sbRevealIx, revealIx],
      payer: provider.wallet.publicKey,
      signers: [provider.wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    const revealSignature = await connection.sendTransaction(revealTx);
    await connection.confirmTransaction({
      signature: revealSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    });
    console.log(`Transaction signature revealTx:`, revealSignature);
    const lottery_data_fetch = await program.account.lotteryData.fetch(lotteryData);
    assert(lottery_data_fetch.winnerChosen == true);
  });
  it("claim prize", async()=>{
    const lottery_data_fetch = await program.account.lotteryData.fetch(lotteryData);
    console.log(`Lottery Data:`, lottery_data_fetch);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(provider.wallet.publicKey, {programId: TOKEN_PROGRAM_ID});
    tokenAccounts.value.forEach(async (account)=>{
      console.log(`Token account mint`, account.account.data.parsed.info.mint);
      console.log(`Token account address`, account.pubkey.toBase58());
    });
    const winningMint = anchor.web3.PublicKey.findProgramAddressSync(
      [new anchor.BN(lottery_data_fetch.winner).toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )[0];
    console.log(`Winning mint`, winningMint.toBase58());

    const winningTokenAddress = sb.getAssociatedTokenAddressSync(
      winningMint,
      provider.wallet.publicKey
    );
    console.log(`Winning token address`, winningTokenAddress.toBase58());

    const claimIx = await program.methods.claimPrize().accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
    }).instruction();
    const blockhash = await connection.getLatestBlockhash();
    const claimTx = new anchor.web3.Transaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(claimIx);
    const claimSig = await anchor.web3.sendAndConfirmTransaction(connection, claimTx, [provider.wallet.payer]);
    console.log(`Claim signature:`, claimSig);
    const lottery_data_fetch1 = await program.account.lotteryData.fetch(lotteryData);
    assert(lottery_data_fetch1.lotteryPotAmount.eq(new anchor.BN(0)));
  });
});
