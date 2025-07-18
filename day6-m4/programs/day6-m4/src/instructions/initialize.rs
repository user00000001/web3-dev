use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: unchecked account
    pub acct: UncheckedAccount<'info>,
    //pub acct: AccountInfo<'info>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let lamports = **ctx.accounts.acct.to_account_info().lamports.borrow();
    msg!(
        "Account-{}: has {:?} lamports",
        ctx.accounts.acct.key(),
        lamports
    );
    Ok(())
}
