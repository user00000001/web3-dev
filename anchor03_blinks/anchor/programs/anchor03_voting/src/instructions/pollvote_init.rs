use anchor_lang::prelude::*;

use crate::state::PollVote;

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct PollVoteInit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        seeds = [&poll_id.to_le_bytes()],
        space = 8 + PollVote::INIT_SPACE,
        bump,
    )]
    pub poll_vote: Account<'info, PollVote>,
    pub system_program: Program<'info, System>,
}

pub fn pollvote_init_(
    ctx: Context<PollVoteInit>,
    poll_id: u64,
    description: String,
    begin: u64,
    end: u64,
) -> Result<()> {
    *ctx.accounts.poll_vote = PollVote {
        poll_id,
        description: description.clone(),
        vote_begin: begin,
        vote_end: end,
        total_votes: 0,
        total_candidates: 0,
    };
    msg!("PollVote({poll_id}): {description}. start: {start}, end: {end} created! ");
    Ok(())
}
