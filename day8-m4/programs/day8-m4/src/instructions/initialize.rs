use anchor_lang::{prelude::*, system_program};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: recipient from outside account.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, amount: u64) -> Result<()> {
    let res = system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        ),
        amount,
    );
    if res.is_ok() {
        return Ok(());
    } else {
        return err!(ErrorCode::TransferFailed);
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("transfer failed.")]
    TransferFailed,
}

#[derive(Accounts)]
pub struct SplitSol<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn split_sol_<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, SplitSol<'info>>,
    amount: u64,
) -> Result<()> {
    let amount_each_gets = amount / ctx.remaining_accounts.len() as u64;

    for recipient in ctx.remaining_accounts {
        let res = system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: recipient.to_account_info(),
                },
            ),
            amount_each_gets,
        );
        if !res.is_ok() {
            return err!(ErrorCode::TransferFailed);
        }
    }
    Ok(())
}
