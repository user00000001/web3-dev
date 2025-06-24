use anchor_lang::prelude::*;

use crate::{
    error::ErrorCode,
    state::{Candidate, PollVote},
};

#[derive(Accounts)]
#[instruction(poll_id: u64, name: String)]
pub struct CandidateInit<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        seeds = [poll_id.to_le_bytes().as_ref(), name.as_ref()],
        space = 8 + Candidate::INIT_SPACE,
        bump,
    )]
    candidate: Account<'info, Candidate>,
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pollvote: Account<'info, PollVote>,
    system_program: Program<'info, System>,
}

pub fn candidate_init_(ctx: Context<CandidateInit>, poll_id: u64, name: String) -> Result<()> {
    if ctx.accounts.candidate.own_votes != 0 {
        return Err(ErrorCode::CandidateInitedError.into());
    }
    *ctx.accounts.candidate = Candidate {
        poll_id,
        name,
        own_votes: 0,
    };
    ctx.accounts.pollvote.total_candidates += 1;
    Ok(())
}
