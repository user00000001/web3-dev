pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;

declare_id!("AUxB23jcR3Sijo9xx8i5mes9uqEjM77GNfj6kgJKh3bt");

#[program]
pub mod anchor01_favorites {
    use super::*;

    pub fn set_favorites(
        ctx: Context<SetFavorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        instructions::set_favorites(ctx, number, color, hobbies)
    }
}
