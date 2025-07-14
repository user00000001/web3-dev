use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("A is too small.")]
    AIsTooSmall,
    #[msg("A is too big.")]
    AIsTooBig,
}
