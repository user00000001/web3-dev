use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub offer_id: u64,
    pub maker: Pubkey,
    pub token_a_mint_account: Pubkey,
    pub token_b_mint_account: Pubkey,
    pub want_token_b_amount: u64,
    pub bump: u8,
}
