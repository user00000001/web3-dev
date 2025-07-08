import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor09Lottery } from "../target/types/anchor09_lottery";
import { assert } from "chai";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

describe("anchor09_lottery", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchor09Lottery as Program<Anchor09Lottery>;
  const connection = anchor.getProvider().connection;
  const TOKEN_METADATA_PROGRAM = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

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
    const lotteryData = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("lottery_data")],
      program.programId
    )[0];
    const lottery_data_fetch = await program.account.lotteryData.fetch(
      lotteryData
    );
    assert(lottery_data_fetch.ticketNum.eq(new anchor.BN(5)));
  });
});
