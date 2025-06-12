# day1

## prepare rust/node environments

## solana-cli/anchor tools

```bash
# install solana
sh -c "$(curl -sSfL https://release.solana.com/v1.16.25/install)"

# install anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

avm install latest
avm use latest
```

## use anchor to create a day1 project(ablrun for low glibc.)

```bash
ablrun anchor init --no-git --package-manager pnpm day1
cd day1 && ablrun anchor build
```

## prepare local environment.

```bash
# terminal 1
solana-test-validator

# terminal 2
solana config set -ul
solana logs
```

## run test

```bash
ablrun anchor keys sync
ablrun anchor test --skip-local-validator
```
