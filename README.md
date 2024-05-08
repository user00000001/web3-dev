# Operations

## run scripts.

```shell
pnpm hardhat run scripts/deploy.js --network sepolia

pnpm hardhat node
pnpm hardhat run scripts/deploy.js --network localhost
```

## run tasks

```shell
pnpm hardhat block-number 
pnpm hardhat block-number --network sepolia
pnpm hardhat block-number --network localhost
```

## console

```shell
pnpm hardhat console --network localhost
# preset: Object.keys(global), like hre, ethers, network, tasks, etc.
```

## test & coverage

```shell
pnpm hardhat test
pnpm hardhat test --grep store
pnpm hardhat coverage
```

## convert to typescript

```shell
pnpm i -D ts-node typescript
pnpm hardhat typechain
```