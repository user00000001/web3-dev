#![allow(clippy::result_large_err)]
#![allow(deprecated)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token_interface};

declare_id!("5NpmkFTKGmJFGyUUFomuqUScU8V6bZCQhKiiygQ58b3L");

#[program]
pub mod vesting {
    use super::*;
    pub fn create_vesting(ctx: Context<CreateVesting>, company_name: String) -> Result<()> {
        let vesting_data_account = &mut ctx.accounts.vesting_data_account;
        vesting_data_account.employer = ctx.accounts.employer.key();
        vesting_data_account.mint = ctx.accounts.mint.key();
        vesting_data_account.treasury_token_account = ctx.accounts.treasury_token_account.key();
        vesting_data_account.treasury_bump = ctx.bumps.treasury_token_account;
        vesting_data_account.bump = ctx.bumps.vesting_data_account;
        vesting_data_account.company_name = company_name.clone();
        Ok(())
    }
    pub fn create_employee(
        ctx: Context<CreateEmployee>,
        start_time: i64,
        end_time: i64,
        cliff_time: i64,
        total_amount: i64,
    ) -> Result<()> {
        *ctx.accounts.employee_data_account = EmployeeDataAccount {
            employee: ctx.accounts.employee.key(),
            start_time,
            end_time,
            cliff_time,
            total_amount,
            total_withdraw: 0,
            vesting_data_account: ctx.accounts.vesting_data_account.key(),
            bump: ctx.bumps.employee_data_account,
        };
        Ok(())
    }
    pub fn claim_token(ctx: Context<ClaimToken>, _company_name: String) -> Result<()> {
        let employee_data_account = &mut ctx.accounts.employee_data_account;
        let now = Clock::get()?.unix_timestamp;
        if now < employee_data_account.cliff_time {
            return Err(VestingErrorCode::NotTheClaimPeriod.into());
        }
        let vesting_time = employee_data_account
            .end_time
            .saturating_sub(employee_data_account.start_time);
        let claim_time = now.saturating_sub(employee_data_account.start_time);
        let vesting_remain_value = employee_data_account
            .total_amount
            .saturating_sub(employee_data_account.total_withdraw);
        if vesting_remain_value == 0 {
            return Err(VestingErrorCode::NoRemainValue.into());
        }
        let claim_value = if now >= employee_data_account.end_time {
            vesting_remain_value
        } else {
            vesting_remain_value
                .saturating_mul(claim_time)
                .saturating_div(vesting_time)
        };
        if claim_value == 0 {
            return Err(VestingErrorCode::NoRemainValue.into());
        }

        let transfer_accounts_options = token_interface::TransferChecked {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            to: ctx.accounts.employee_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.treasury_token_account.to_account_info(),
        };
        let signer_seeds = [
            b"vesting_treasury",
            ctx.accounts.vesting_data_account.company_name.as_bytes(),
            &[ctx.accounts.vesting_data_account.treasury_bump],
        ];
        let signers_seeds: &[&[&[u8]]] = &[&signer_seeds];
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts_options,
        )
        .with_signer(signers_seeds);
        token_interface::transfer_checked(cpi_ctx, claim_value as u64, ctx.accounts.mint.decimals)?;
        ctx.accounts.employee_data_account.total_withdraw += claim_value;
        ctx.accounts.employee_data_account.start_time = now;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateVesting<'info> {
    #[account(mut)]
    pub employer: Signer<'info>,
    #[account(
        init,
        payer = employer,
        space = 8 + VestingDataAccount::INIT_SPACE,
        seeds = [company_name.as_ref()],
        bump,
    )]
    pub vesting_data_account: Account<'info, VestingDataAccount>,
    #[account(
        init,
        payer = employer,
        token::mint = mint,
        token::authority = treasury_token_account,
        seeds = [b"vesting_treasury", company_name.as_bytes()],
        bump,
    )]
    pub treasury_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub mint: InterfaceAccount<'info, token_interface::Mint>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateEmployee<'info> {
    #[account(mut)]
    pub employer: Signer<'info>,
    pub employee: SystemAccount<'info>,
    #[account(
        has_one=employer
    )]
    pub vesting_data_account: Account<'info, VestingDataAccount>,
    #[account(
        init,
        payer = employer,
        space = 8 + EmployeeDataAccount::INIT_SPACE,
        seeds = [
            b"employee_vesting",
            employee.key().as_ref(),
            vesting_data_account.key().as_ref()
        ],
        bump,
    )]
    pub employee_data_account: Account<'info, EmployeeDataAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct ClaimToken<'info> {
    #[account(mut)]
    pub employee: Signer<'info>,
    pub mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        seeds = [
            b"employee_vesting",
            employee.key().as_ref(),
            vesting_data_account.key().as_ref()
        ],
        bump = employee_data_account.bump,
        has_one = employee,
        has_one = vesting_data_account
    )]
    pub employee_data_account: Account<'info, EmployeeDataAccount>,
    #[account(
        mut,
        seeds = [company_name.as_bytes()],
        bump = vesting_data_account.bump,
        has_one = mint,
        has_one = treasury_token_account
    )]
    pub vesting_data_account: Account<'info, VestingDataAccount>,
    #[account(mut)]
    pub treasury_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        init_if_needed,
        payer = employee,
        associated_token::mint = mint,
        associated_token::authority = employee,
        associated_token::token_program = token_program,
    )]
    pub employee_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}

#[account]
#[derive(InitSpace)]
pub struct VestingDataAccount {
    pub employer: Pubkey,
    pub mint: Pubkey,
    pub treasury_token_account: Pubkey,
    #[max_len(50)]
    pub company_name: String,
    pub treasury_bump: u8,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct EmployeeDataAccount {
    pub employee: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
    pub total_amount: i64,
    pub total_withdraw: i64,
    pub vesting_data_account: Pubkey,
    pub bump: u8,
}

#[error_code]
pub enum VestingErrorCode {
    #[msg("not the claim period.")]
    NotTheClaimPeriod,
    #[msg("no remain value.")]
    NoRemainValue,
}
