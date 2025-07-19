# [RareSkills Solana in 60 days](https://rareskills.io/solana-tutorial).

## use anchor init a new project(ablrun for the low glibc host such as deepin v23).

```bash
ablrun anchor init anchor01_favorites --no-git --no-install --package-manager pnpm -t multiple --test-template mocha
```

## pnpm install from npmmirror, need to fix dependencies not synced from npmjs, or use proxy for npmjs.

```bash
cd anchor01_favorites; HTTP_PROXY=http://127.0.0.1:10809 pnpm install --registry https://registery.npmjs.org
```

## anchor / solana-cli operations

```bash
solana-keygen new
solana config set -ul
solana-test-validator -r

solana logs

ablrun anchor build
ablrun anchor keys sync
ablrun anchor deploy
ablrun anchor test --skip-local-validator --skip-deploy
```

## use create-solana-dapp to create a project.

```bash
create-solana-dapp --pm pnpm --skip-git --skip-install anchor03_blinks
```
