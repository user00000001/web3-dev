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
