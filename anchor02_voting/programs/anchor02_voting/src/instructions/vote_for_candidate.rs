use anchor_lang::prelude::*;

use crate::{
    error::ErrorCode,
    state::{Candidate, PollVote},
};

#[derive(Accounts)]
#[instruction(poll_id: u64, name: String)]
pub struct VoteForCandidate<'info> {
    signer: Signer<'info>,
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    poll_vote: Account<'info, PollVote>,
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), name.as_ref()],
        bump,
    )]
    candidate: Account<'info, Candidate>,
}

pub fn vote_for_candidate_(
    ctx: Context<VoteForCandidate>,
    poll_id: u64,
    name: String,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    if now > ctx.accounts.poll_vote.vote_begin as i64
        && now < ctx.accounts.poll_vote.vote_end as i64
    {
        ctx.accounts.candidate.own_votes += 1;
        ctx.accounts.poll_vote.total_votes += 1;
        msg!(
            "{0} vote for {name}, total {1} votes for {poll_id}",
            ctx.accounts.signer.key(),
            ctx.accounts.poll_vote.total_votes,
        );
    } else {
        return err!(ErrorCode::VotingTimeError);
    }
    Ok(())
}
