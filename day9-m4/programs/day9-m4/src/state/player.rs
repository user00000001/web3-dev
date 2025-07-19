use anchor_lang::prelude::*;

#[account]
pub struct Player {
    pub points: u64,
    pub authority: Pubkey,
}
