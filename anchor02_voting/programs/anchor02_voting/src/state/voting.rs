use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PollVote {
    pub poll_id: u64,
    #[max_len(500)]
    pub description: String,
    pub vote_begin: u64,
    pub vote_end: u64,
    pub total_votes: u64,
    pub total_candidates: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub poll_id: u64,
    #[max_len(10)]
    pub name: String,
    pub own_votes: u64,
}
