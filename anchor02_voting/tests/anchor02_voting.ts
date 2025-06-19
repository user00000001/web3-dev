import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor02Voting } from "../target/types/anchor02_voting";
import { BN } from "bn.js";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("anchor02_voting", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchor02Voting as Program<Anchor02Voting>;
  const now = Math.floor(new Date().getTime()/1000);
  const pollvote = {
    poll_id: new BN(10),
    desc: "This is a poll vote, please vote for these candidate.",
    begin: new BN(now - 60),
    end: new BN(now + 600),
  };

  const candidate01_name = "01";
  const candidate02_name = "02";

  const pollvote_authority = Keypair.generate();
  const voter01_authority = Keypair.generate();
  const voter02_authority = Keypair.generate();
  
  const connection = program.provider.connection;

  const [pollvote_data_account, pollvote_account_bump] = PublicKey.findProgramAddressSync([
    pollvote.poll_id.toArrayLike(Buffer, "le", 8),
  ], program.programId);
  const [candidate01_data_account, candidate01_account_bump] = PublicKey.findProgramAddressSync([
    pollvote.poll_id.toArrayLike(Buffer, "le", 8), Buffer.from(candidate01_name)
  ], program.programId);
  const [candidate02_data_account, candidate02_account_bump] = PublicKey.findProgramAddressSync([
    pollvote.poll_id.toArrayLike(Buffer, "le", 8), Buffer.from(candidate02_name)
  ], program.programId);

  it("Init the poll vote.", async () => {
    const tx_sign = await connection.requestAirdrop(
      pollvote_authority.publicKey,
      LAMPORTS_PER_SOL * 10,
    );
    await connection.confirmTransaction(tx_sign); 
    console.log(`${pollvote_authority.publicKey} has ${(await connection.getBalance(pollvote_authority.publicKey)) / LAMPORTS_PER_SOL} SOLs`);
    const tx = await program.methods.pollvoteInit(
      pollvote.poll_id,
      pollvote.desc,
      pollvote.begin,
      pollvote.end,
    ).accounts({
      signer: pollvote_authority.publicKey
    }).signers([pollvote_authority]).rpc();
    await connection.confirmTransaction(tx);
    const pollvote_fetch = await program.account.pollVote.fetch(pollvote_data_account);
    console.log(`${JSON.stringify(pollvote_fetch, null, 2)}`);
    assert(
      pollvote_fetch.pollId.eq(pollvote.poll_id) &&
      pollvote_fetch.totalVotes.eq(new BN(0)) &&
      pollvote_fetch.totalCandidates.eq(new BN(0)) &&
      pollvote_fetch.voteBegin.eq(pollvote.begin) &&
      pollvote_fetch.voteEnd.eq(pollvote.end) &&
      pollvote_fetch.description == pollvote.desc
    );
  });
  it("Init the candidate 01.", async () => {
    const tx = await program.methods.candidateInit(
      pollvote.poll_id,
      candidate01_name, 
    ).accounts({
      signer: pollvote_authority.publicKey
    }).signers([pollvote_authority]).rpc();
    await connection.confirmTransaction(tx);
    const candidate01_fetch = await program.account.candidate.fetch(candidate01_data_account);
    console.log(`${JSON.stringify(candidate01_fetch, null, 2)}`);
    assert(
      candidate01_fetch.pollId.eq(pollvote.poll_id) &&
      candidate01_fetch.ownVotes.eq(new anchor.BN(0)) &&
      candidate01_fetch.name == candidate01_name
    );
  });
  it("vote for candidate 01.", async () => {
    const tx_sign = await connection.requestAirdrop(
      voter01_authority.publicKey,
      LAMPORTS_PER_SOL * 10,
    );
    await connection.confirmTransaction(tx_sign); 
    console.log(`${voter01_authority.publicKey} has ${(await connection.getBalance(voter01_authority.publicKey)) / LAMPORTS_PER_SOL} SOLs`);
    const tx = await program.methods.voteForCandidate(pollvote.poll_id, candidate01_name).accounts({
      signer: voter01_authority.publicKey,
    }).signers([voter01_authority]).rpc();
    const candidate01_fetch = await program.account.candidate.fetch(candidate01_data_account);
    console.log(`${JSON.stringify(candidate01_fetch, null, 2)}`);
    assert(
      candidate01_fetch.pollId.eq(pollvote.poll_id) &&
      candidate01_fetch.ownVotes.eq(new anchor.BN(1)) &&
      candidate01_fetch.name == candidate01_name
    );
  });
  it("Init the candidate 02.", async () => {
    const tx = await program.methods.candidateInit(
      pollvote.poll_id,
      candidate02_name, 
    ).accounts({
      signer: pollvote_authority.publicKey
    }).signers([pollvote_authority]).rpc();
    await connection.confirmTransaction(tx);
    const candidate02_fetch = await program.account.candidate.fetch(candidate02_data_account);
    console.log(`${JSON.stringify(candidate02_fetch, null, 2)}`);
    assert(
      candidate02_fetch.pollId.eq(pollvote.poll_id) &&
      candidate02_fetch.name == candidate02_name
    );
  });
  it("vote for candidate 02.", async () => {
    const tx_sign = await connection.requestAirdrop(
      voter01_authority.publicKey,
      LAMPORTS_PER_SOL * 10,
    );
    await connection.confirmTransaction(tx_sign); 
    console.log(`${voter02_authority.publicKey} has ${(await connection.getBalance(voter02_authority.publicKey)) / LAMPORTS_PER_SOL} SOLs`);
    const tx = await program.methods.voteForCandidate(pollvote.poll_id, candidate02_name).accounts({
      signer: voter02_authority.publicKey,
    }).signers([voter02_authority]).rpc();
    const candidate02_fetch = await program.account.candidate.fetch(candidate02_data_account);
    console.log(`${JSON.stringify(candidate02_fetch, null, 2)}`);
    assert(
      candidate02_fetch.pollId.eq(pollvote.poll_id) &&
      candidate02_fetch.ownVotes.eq(new anchor.BN(1)) &&
      candidate02_fetch.name == candidate02_name
    );
  });
  it("vote for candidate 02 again.", async () => {
    const tx = await program.methods.voteForCandidate(pollvote.poll_id, candidate02_name).accounts({
      signer: program.provider.wallet.publicKey,
    }).rpc();
    const candidate02_fetch = await program.account.candidate.fetch(candidate02_data_account);
    console.log(`${JSON.stringify(candidate02_fetch, null, 2)}`);
    assert(
      candidate02_fetch.pollId.eq(pollvote.poll_id) &&
      candidate02_fetch.ownVotes.eq(new anchor.BN(2)) &&
      candidate02_fetch.name == candidate02_name
    );
  });

  it("check total votes for this poll vote.", async()=>{
    const pollvote_fetch = await program.account.pollVote.fetch(pollvote_data_account);
    console.log(`${JSON.stringify(pollvote_fetch, null, 2)}`);
    assert(
      pollvote_fetch.pollId.eq(pollvote.poll_id) &&
      pollvote_fetch.totalVotes.eq(new BN(3)) &&
      pollvote_fetch.totalCandidates.eq(new BN(2)) &&
      pollvote_fetch.voteBegin.eq(pollvote.begin) &&
      pollvote_fetch.voteEnd.eq(pollvote.end) &&
      pollvote_fetch.description == pollvote.desc
    );

  });

});
