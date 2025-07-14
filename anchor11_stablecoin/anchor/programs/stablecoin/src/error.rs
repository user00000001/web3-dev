use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("below minimum health factor")]
    BelowMinimumHealthFactor,
    #[msg("above minimum health factor")]
    AboveMinimumHealthFactor,
    #[msg("invalid price, negetive not allowed")]
    InvalidPrice,
}
