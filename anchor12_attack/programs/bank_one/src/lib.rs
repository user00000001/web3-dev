#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

declare_id!("95PUpjNoydaPHzGQGVVKqjEeE7SncjQQoDGfR9uxNMNw");

#[program]
pub mod bank_one {
    use anchor_lang::system_program;

    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        *ctx.accounts.bank_data = Bank {
            authority: ctx.accounts.authority.key(),
            balance: ctx.accounts.bank_data.balance + amount,
            bump: ctx.bumps.bank_data,
        };
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.bank_data.to_account_info(),
                },
            ),
            amount,
        )?;
        msg!("{:#?}", ctx.accounts.bank_data);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        ctx.accounts.bank_data.balance -= amount;
        ctx.accounts.authority.add_lamports(amount)?;
        ctx.accounts.bank_data.sub_lamports(amount)?;
        msg!("{:#?}", ctx.accounts.bank_data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + Bank::INIT_SPACE,
        seeds = [b"bank"],
        bump,
    )]
    pub bank_data: Account<'info, Bank>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"bank"],
        bump = bank_data.bump,
        has_one = authority,
    )]
    pub bank_data: Account<'info, Bank>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Bank {
    pub authority: Pubkey,
    pub balance: u64,
    pub bump: u8,
}
