# Operations

## compile contract.

```bash
pnpm solcjs --bin --abi --include-path node_modules --base-path . -o . SimpleStorage.sol
```

## formater

```bash
pnpm prettier --write *.js
pnpm prettier --write --plugin=prettier-plugin-solidity *.sol
```

## typechain

```bash
pnpm i -D typechain @typechain/ethers-v6
pnpm typechain --out-dir . --target ethers-v6 *.abi
```
