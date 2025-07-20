use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Erase<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: unchecked account
    #[account(mut)]
    pub my_pda: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn erase_(ctx: Context<Erase>) -> Result<()> {
    ctx.accounts.my_pda.resize(0)?;
    Ok(())
}

pub fn drain_erase_account_lamports_(ctx: Context<Erase>) -> Result<()> {
    let lamports = ctx.accounts.my_pda.lamports();
    ctx.accounts.my_pda.sub_lamports(lamports)?;
    ctx.accounts.signer.add_lamports(lamports)?;
    Ok(())
}
