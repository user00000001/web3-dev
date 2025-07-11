#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

declare_id!("BYQiFXXsKtubunUjQt7HoQLdJuWTm7e2PKFSomW3EWBX");

#[program]
pub mod bank_two {
    use anchor_lang::system_program;

    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let authority = if ctx.accounts.bank_data.initialized {
            ctx.accounts.bank_data.authority.key()
        } else {
            ctx.accounts.authority.key()
        };
        *ctx.accounts.bank_data = Bank {
            authority,
            initialized: true,
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

    pub fn update_auth(ctx: Context<UpdateAuth>) -> Result<()> {
        ctx.accounts.bank_data.authority = ctx.accounts.new_authority.key();
        msg!("{:#?}", ctx.accounts.bank_data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAuth<'info> {
    #[account(mut)]
    pub authority: SystemAccount<'info>,
    #[account(mut)]
    pub new_authority: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"bank"],
        bump = bank_data.bump,
        has_one = authority,
    )]
    pub bank_data: Account<'info, Bank>,
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
    pub initialized: bool,
    pub bump: u8,
}
