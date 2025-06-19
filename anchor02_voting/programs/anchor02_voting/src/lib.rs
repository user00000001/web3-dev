#![allow(deprecated)]
#![allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use instructions::*;

declare_id!("At2QRDFiaw7cMSgj6NtbM3dF2EwiUt2L7PbvnNUemkDM");

#[program]
pub mod anchor02_voting {
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
