#![allow(unexpected_cfgs)]

use crate::{
    constants::{ANCHOR_DISCRIMINATOR, SEED},
    Offer,
};
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::*};

#[derive(Accounts)]
#[instruction(offer_id: u64)]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mint::token_program = token_program)]
    pub token_a_mint_account: InterfaceAccount<'info, Mint>,
    #[account(mint::token_program = token_program)]
    pub token_b_mint_account: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        space = ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
        payer = maker,
        seeds = [SEED.as_bytes().as_ref(), offer_id.to_le_bytes().as_ref(), maker.key().as_ref()],
        bump,
    )]
    pub offer: Account<'info, Offer>,
    #[account(
        mut,
        associated_token::mint = token_a_mint_account,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_a_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = token_a_mint_account,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn make_offer_(
    ctx: Context<MakeOffer>,
    offer_id: u64,
    token_a_offered_amount: u64,
    want_token_b_amount: u64,
) -> Result<()> {
    let transfer_accounts_option = TransferChecked {
        from: ctx.accounts.maker_token_a_account.to_account_info(),
        mint: ctx.accounts.token_a_mint_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.maker.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts_option,
    );
    transfer_checked(
        cpi_ctx,
        token_a_offered_amount,
        ctx.accounts.token_a_mint_account.decimals,
    )?;
    let offer = &mut ctx.accounts.offer;
    offer.offer_id = offer_id;
    offer.maker = ctx.accounts.maker.key();
    offer.token_a_mint_account = ctx.accounts.token_a_mint_account.key();
    offer.token_b_mint_account = ctx.accounts.token_b_mint_account.key();
    offer.want_token_b_amount = want_token_b_amount;
    offer.bump = ctx.bumps.offer;
    Ok(())
}
