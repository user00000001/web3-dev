use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize {}

pub fn handler(
    ctx: Context<Initialize>,
    a: u64,
    b: u64,
    c: String,
    d: Vec<u64>,
    e: f32,
) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    msg!("a: {}, b: {}, c: {}, d: {:#?}, e: {}", a, b, c, d, e);
    msg!("{}", a - b);
    //msg!("{}", a.checked_sub(b).unwrap());
    Ok(())
}
