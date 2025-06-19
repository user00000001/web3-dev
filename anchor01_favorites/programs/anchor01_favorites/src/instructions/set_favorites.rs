pub use crate::constants::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        seeds = [b"favorites", signer.key().as_ref()],
        bump,
        space = ANCHOR_ACCOUNT_DISCRIMINATOR_SIZE as usize + Favorites::INIT_SPACE,
    )]
    favorites: Account<'info, Favorites>,
    system_program: Program<'info, System>,
}

pub fn set_favorites_(
    ctx: Context<SetFavorites>,
    number: u64,
    color: String,
    hobbies: Vec<String>,
) -> Result<()> {
    ctx.accounts.favorites.set_inner(Favorites {
        number,
        color: color.clone(),
        hobbies: hobbies.clone(),
    });
    let favorites = &mut ctx.accounts.favorites;
    msg!(
        "Greetings from: {:?}, number: {}, color: {}, hobbies: {:?}",
        ctx.program_id,
        favorites.number,
        favorites.color,
        favorites.hobbies
    );
    Ok(())
}
