# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
pnpm hardhat help
pnpm hardhat test
REPORT_GAS=true pnpm hardhat test
pnpm hardhat node
pnpm hardhat ignition deploy ./ignition/modules/Lock.ts

pnpm install --save-dev @nomicfoundation/hardhat-foundry
pnpm hardhat init-foundry
forge test -vv # console.log
forge test -vvvvv # all details
forge test --match-contract LockConstructorTest --no-match-test failure
```
