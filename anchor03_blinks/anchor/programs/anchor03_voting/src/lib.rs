#![allow(deprecated)]
#![allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use instructions::*;

declare_id!("3kcYDejvnqSvMwbBpXjAFmiHos3bNdG3kfyw8Q3x5zc4");

#[program]
pub mod anchor03_voting {
    use super::*;

    pub fn pollvote_init(
        ctx: Context<PollVoteInit>,
        poll_id: u64,
        desc: String,
        begin: u64,
        end: u64,
    ) -> Result<()> {
        pollvote_init_(ctx, poll_id, desc, begin, end)
    }

    pub fn candidate_init(ctx: Context<CandidateInit>, poll_id: u64, name: String) -> Result<()> {
        candidate_init_(ctx, poll_id, name)
    }

    pub fn vote_for_candidate(
        ctx: Context<VoteForCandidate>,
        poll_id: u64,
        name: String,
    ) -> Result<()> {
        vote_for_candidate_(ctx, poll_id, name)
    }
}
