use anchor_lang::prelude::*;

use crate::MyPDA;

#[derive(Accounts)]
pub struct DrainLamports<'info> {
    #[account(mut, seeds = [], bump)]
    pub my_pda: Account<'info, MyPDA>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

pub fn drain_lamports_(ctx: Context<DrainLamports>) -> Result<()> {
    let lamports = ctx.accounts.my_pda.get_lamports();
    ctx.accounts.my_pda.sub_lamports(lamports)?;
    ctx.accounts.my_pda.add_lamports(lamports)?;
    Ok(())
}

#[derive(Accounts)]
pub struct GiveToSystemProgram<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, seeds = [], bump)]
    pub my_pda: Account<'info, MyPDA>,
    pub system_program: Program<'info, System>,
}

pub fn give_to_system_program_(ctx: Context<GiveToSystemProgram>) -> Result<()> {
    let my_pda_account_info = &mut ctx.accounts.my_pda.to_account_info();
    my_pda_account_info.assign(&ctx.accounts.system_program.key());
    my_pda_account_info.resize(0)?;
    Ok(())
}
