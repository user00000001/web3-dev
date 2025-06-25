# SPL Token operations

## prepare accounts

```bash
# to faucet airdrop
solana address
HTTPS_PROXY=http://127.0.0.1:20171 solana balance

# for mint account
solana-keygen grind --starts-with mnt:1

# switch to devnet
solana config set -ud
solana config get

# create mint account online
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata mntCHsQHSurodoEAt3a2XQE144nYrNNDorFWegjgRs6.json

# init token metadata
spl-token initialize-metadata mntCHsQHSurodoEAt3a2XQE144nYrNNDorFWegjgRs6 "MNT Classic" MNTC https://raw.githubusercontent.com/user00000001/web3-dev/refs/heads/solana-bootcamp-2024/anchor05_spl_token/metadata.json

# create associated token account of the mint
spl-token create-account mntCHsQHSurodoEAt3a2XQE144nYrNNDorFWegjgRs6

# mint to ata of this mint
spl-token mint mntCHsQHSurodoEAt3a2XQE144nYrNNDorFWegjgRs6 1000

# transfer to other wallet
spl-token transfer mntCHsQHSurodoEAt3a2XQE144nYrNNDorFWegjgRs6 1000 DKVpVR6mEiL5MGvzxNTqhjceGvLkzCXrCDZM3RYFR8yH --fund-recipient
```
