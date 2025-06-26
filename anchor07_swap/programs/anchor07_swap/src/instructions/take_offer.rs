#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::*};

use crate::{Offer, SEED};

pub fn take_offer_(ctx: Context<TakeOffer>) -> Result<()> {
    let transfer_accounts_option = TransferChecked {
        mint: ctx.accounts.token_b_mint_account.to_account_info(),
        from: ctx.accounts.token_b_token_account.to_account_info(),
        to: ctx.accounts.maker_token_b_token_account.to_account_info(),
        authority: ctx.accounts.taker.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts_option,
    );
    transfer_checked(
        cpi_ctx,
        ctx.accounts.offer.want_token_b_amount,
        ctx.accounts.token_b_mint_account.decimals,
    )?;
    let transfer_accounts_option_a = TransferChecked {
        mint: ctx.accounts.token_a_mint_account.to_account_info(),
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.token_a_token_account.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };
    let signer_seeds = &[
        SEED.as_ref(),
        &ctx.accounts.offer.offer_id.to_le_bytes()[..],
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &[ctx.accounts.offer.bump],
    ];
    let signers_seeds = [&signer_seeds[..]];
    let cpi_ctx_a = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts_option_a,
    )
    .with_signer(&signers_seeds);
    transfer_checked(
        cpi_ctx_a,
        ctx.accounts.vault.amount,
        ctx.accounts.token_a_mint_account.decimals,
    )?;
    let close_vault_option = CloseAccount {
        account: ctx.accounts.vault.to_account_info(),
        destination: ctx.accounts.taker.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        close_vault_option,
    )
    .with_signer(&signers_seeds);
    close_account(cpi_ctx)?;
    Ok(())
}

#[derive(Accounts)]
pub struct TakeOffer<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>,
    #[account(mint::token_program = token_program)]
    pub token_a_mint_account: InterfaceAccount<'info, Mint>,
    #[account(mint::token_program = token_program)]
    pub token_b_mint_account: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_a_mint_account,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub token_a_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = token_b_mint_account,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub token_b_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::token_program = token_program,
        associated_token::mint = token_b_mint_account,
        associated_token::authority = maker,
    )]
    pub maker_token_b_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        has_one = maker,
        has_one = token_a_mint_account,
        has_one = token_b_mint_account,
        seeds = [SEED.as_bytes().as_ref(), offer.offer_id.to_le_bytes().as_ref(), maker.key().as_ref()],
        bump = offer.bump,
        close = maker,
    )]
    pub offer: Account<'info, Offer>,
    #[account(
        mut,
        associated_token::mint = token_a_mint_account,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
