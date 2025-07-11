#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

declare_id!("H9JzXX35iSycXdUjB7ekkfP4GSEU89GSs244wREXGSbm");

#[program]
pub mod bank_three {
    use super::*;
    use anchor_lang::system_program;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        *ctx.accounts.bank_data = Bank {
            authority: if ctx.accounts.bank_data.initialized {
                ctx.accounts.bank_data.authority
            } else {
                ctx.accounts.authority.key()
            },
            vault: if ctx.accounts.bank_data.initialized {
                ctx.accounts.bank_data.vault
            } else {
                ctx.accounts.vault.key()
            },
            initialized: true,
        };
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;
        msg!("{:#?}", ctx.accounts.bank_data);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let bank_account_data = ctx.accounts.bank_data.try_borrow_data()?;
        let mut bank_data_slice: &[u8] = &bank_account_data;
        let bank_data = Bank::try_deserialize(&mut bank_data_slice)?;
        if bank_data.authority != ctx.accounts.authority.key() {
            return Err(ProgramError::InvalidAccountData.into());
        }
        let signers_seeds: &[&[&[u8]]] = &[&[b"vault", &[ctx.bumps.vault]]];
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.authority.to_account_info(),
                },
            )
            .with_signer(signers_seeds),
            amount,
        )?;
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
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: AccountInfo alias UncheckedAccount, unchecked the source of an account.
    pub bank_data: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Bank {
    pub authority: Pubkey,
    pub vault: Pubkey,
    pub initialized: bool,
}
