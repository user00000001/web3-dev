#![allow(unexpected_cfgs)]
use anchor_lang::{prelude::*, system_program};
use anchor_spl::{associated_token, metadata, token_interface};

use crate::{error::ErrorCode, LotteryData, NAME, SYMBOL, URI};

pub fn buy_ticket_(ctx: Context<BuyTicket>) -> Result<()> {
    let clock = Clock::get()?;
    let ticket_name = NAME.to_owned() + ctx.accounts.lottery_data.ticket_num.to_string().as_ref();
    if clock.slot < ctx.accounts.lottery_data.lottery_start
        || clock.slot > ctx.accounts.lottery_data.lottery_end
    {
        return err!(ErrorCode::LotteryNotOpen);
    }
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.lottery_data.to_account_info(),
            },
        ),
        ctx.accounts.lottery_data.price,
    )?;
    ctx.accounts.lottery_data.lottery_pot_amount += ctx.accounts.lottery_data.price;
    let signers_seeds: &[&[&[u8]]] = &[&[b"collection_mint", &[ctx.bumps.collection_mint]]];

    token_interface::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::MintTo {
                mint: ctx.accounts.ticket_mint.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.collection_mint.to_account_info(),
            },
        )
        .with_signer(signers_seeds),
        1,
    )?;
    msg!("mint to token account.");

    metadata::create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            metadata::CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.ticket_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signers_seeds,
        ),
        metadata::mpl_token_metadata::types::DataV2 {
            name: ticket_name,
            uri: URI.to_string(),
            symbol: SYMBOL.to_string(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true,
        true,
        None,
    )?;
    msg!("create metadata accounts.");

    metadata::create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            metadata::CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.ticket_mint.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signers_seeds,
        ),
        Some(0),
    )?;
    msg!("create master edition.");

    metadata::set_and_verify_sized_collection_item(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            metadata::SetAndVerifySizedCollectionItem {
                metadata: ctx.accounts.metadata.to_account_info(),
                collection_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx
                    .accounts
                    .collection_metadata_edition
                    .to_account_info(),
            },
            signers_seeds,
        ),
        None,
    )?;
    msg!("verify ticket mint.");

    ctx.accounts.lottery_data.ticket_num += 1;
    Ok(())
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lottery_data"],
        bump = lottery_data.bump
    )]
    pub lottery_data: Account<'info, LotteryData>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_mint,
        mint::freeze_authority = collection_mint,
        mint::token_program = token_program,
        seeds = [lottery_data.ticket_num.to_le_bytes().as_ref()],
        bump
    )]
    pub ticket_mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = ticket_mint,
        associated_token::authority = payer,
        associated_token::token_program = token_program,
    )]
    pub destination: InterfaceAccount<'info, token_interface::TokenAccount>,
    /// CHECK: This account was initialized by the metaplex program.
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), ticket_mint.key().as_ref()],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: This account was initialized by the metaplex program.
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), ticket_mint.key().as_ref(), b"edition"],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub master_edition: UncheckedAccount<'info>,
    /// CHECK: This account was initialized by the metaplex program.
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub collection_metadata: UncheckedAccount<'info>,
    /// CHECK: This account was initialized by the metaplex program.
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), b"edition"],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub collection_metadata_edition: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = ["collection_mint".as_bytes()],
        bump
    )]
    pub collection_mint: InterfaceAccount<'info, token_interface::Mint>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub token_metadata_program: Program<'info, metadata::Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
