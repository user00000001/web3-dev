#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("44L8KCvFbeu3rjYcbwXW5wudTeZUUUbi1P4DxG7Vss6P");

#[program]
pub mod day17_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn read_other_data(ctx: Context<ReadOtherData>) -> Result<()> {
        read_other_data_(ctx)
    }

    pub fn read_other_data_fieldname_not_matched(
        ctx: Context<ReadOtherDataFieldNameNotMatched>,
    ) -> Result<()> {
        read_other_data_fieldname_not_matched_(ctx)
    }

    pub fn read_other_data_type_not_matched(
        ctx: Context<ReadOtherDataTypeNotMatched>,
    ) -> Result<()> {
        read_other_data_type_not_matched_(ctx)
    }
}
