use anchor_lang::prelude::*;

declare_id!("A6DMnq32uzsnRBJBMgUQwe8DtjLPNbVbg84ti2GhwJC5");

#[program]
pub mod day1 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
