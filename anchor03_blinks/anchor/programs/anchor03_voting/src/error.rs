use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Voting time is not matched!")]
    VotingTimeError,
    #[msg("Candidate is initialized!")]
    CandidateInitedError,
}
