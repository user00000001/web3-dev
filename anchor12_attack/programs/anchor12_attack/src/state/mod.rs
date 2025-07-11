use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Bank {
    pub authority: Pubkey,
    pub vault: Pubkey,
    pub is_initialized: bool,
}
