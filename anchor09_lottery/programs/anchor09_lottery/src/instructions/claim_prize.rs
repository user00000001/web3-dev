use anchor_lang::prelude::*;
use anchor_spl::{metadata, token_interface};

use crate::{error::ErrorCode, LotteryData, NAME};

pub fn claim_prize_(ctx: Context<ClaimPrize>) -> Result<()> {
    msg!("Winner chosen: {}", ctx.accounts.lottery_data.winner);
    require!(
        ctx.accounts.lottery_data.winner_chosen,
        ErrorCode::WinnerNotChosen
    );
    require!(
        ctx.accounts.metadata.collection.as_ref().unwrap().verified,
        ErrorCode::NotVerifiedTicket
    );
    require!(
        ctx.accounts.metadata.collection.as_ref().unwrap().key
            == ctx.accounts.collection_mint.key(),
        ErrorCode::IncorrectTicket
    );
    let ticket_name = NAME.to_owned() + &ctx.accounts.lottery_data.winner.to_string();
    let metadata_name = ctx.accounts.metadata.name.replace("\u{0}", "");
    msg!(
        "TicketName: {}, MetadataName: {}",
        ticket_name,
        metadata_name
    );
    require!(ticket_name == metadata_name, ErrorCode::IncorrectTicket);
    require!(
        ctx.accounts.destination.amount > 0,
        ErrorCode::IncorrectTicket
    );

    **ctx
        .accounts
        .lottery_data
        .to_account_info()
        .try_borrow_mut_lamports()? -= ctx.accounts.lottery_data.lottery_pot_amount;
    **ctx
        .accounts
        .payer
        .to_account_info()
        .try_borrow_mut_lamports()? += ctx.accounts.lottery_data.lottery_pot_amount;
    ctx.accounts.lottery_data.lottery_pot_amount = 0;
    Ok(())
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lottery_data"],
        bump = lottery_data.bump
    )]
    pub lottery_data: Account<'info, LotteryData>,
    #[account(
        mut,
        seeds = [b"collection_mint"],
        bump,
    )]
    pub collection_mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        seeds = [lottery_data.winner.to_le_bytes().as_ref()],
        bump
    )]
    pub ticket_mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), ticket_mint.key().as_ref()],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub metadata: Account<'info, metadata::MetadataAccount>,

    #[account(
        associated_token::mint = ticket_mint,
        associated_token::authority = payer,
        associated_token::token_program = token_program,
    )]
    pub destination: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub collection_metadata: Account<'info, metadata::MetadataAccount>,

    pub token_metadata_program: Program<'info, metadata::Metadata>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>,
}
