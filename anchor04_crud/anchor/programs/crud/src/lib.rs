#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("DyRyZ1gGV4SgDpQFumqVHmNS8dc5ZdzS7FzHLXLVk6fv");

#[program]
pub mod crud {
    use super::*;

    pub fn close(_ctx: Context<CloseCrud>, _title: String) -> Result<()> {
        Ok(())
    }

    pub fn update(ctx: Context<UpdateCrud>, _title: String, message: String) -> Result<()> {
        ctx.accounts.crud.message = message.clone();
        Ok(())
    }

    pub fn create(ctx: Context<CreateCrud>, title: String, message: String) -> Result<()> {
        let crud = &mut ctx.accounts.crud;
        crud.owner = ctx.accounts.payer.key();
        crud.title = title.clone();
        crud.message = message.clone();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateCrud<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        seeds = [title.as_bytes(), payer.key().as_ref()],
        bump,
        space = 8 + Crud::INIT_SPACE,
        payer = payer
    )]
    pub crud: Account<'info, Crud>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CloseCrud<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [title.as_bytes(), payer.key().as_ref()],
        bump,
        close = payer, // close account and return lamports to payer
    )]
    pub crud: Account<'info, Crud>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateCrud<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [title.as_bytes(), payer.key().as_ref()],
        bump,
    )]
    pub crud: Account<'info, Crud>,
}

#[account]
#[derive(InitSpace)]
pub struct Crud {
    owner: Pubkey,
    #[max_len(50)]
    title: String,
    #[max_len(1000)]
    message: String,
}
