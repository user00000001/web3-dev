use anchor_lang::prelude::*;

#[account]
pub struct TrueOrFalse {
    pub true_or_false: bool,
}
