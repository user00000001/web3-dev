use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("lottery not open.")]
    LotteryNotOpen,
    #[msg("not authorized.")]
    NotAuthorized,
    #[msg("randomness already revealed.")]
    RandomnessAlreadyRevealed,
    #[msg("incorrect randomness account ")]
    IncorrectRandomnessAccount,
    #[msg("lottery not completed")]
    LotteryNotCompleted,
    #[msg("randomness not resolved")]
    RandomnessNotResolved,
    #[msg("winner chosen")]
    WinnerChosen,
    #[msg("winner not chosen")]
    WinnerNotChosen,
    #[msg("not verified ticket")]
    NotVerifiedTicket,
    #[msg("Incorrect ticket")]
    IncorrectTicket,
}
