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

forge install transmissions11/solmate
pnpm i -D @openzeppelin/contracts
```

# local node operations

```shell
# anvil
forge create NFT --rpc-url=http://localhost:8545 --private-key=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --constructor-args "number NFT" NNFT
cast send --rpc-url=http://localhost:8545 --private-key=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 0x5FbDB2315678afecb367f032d93F642f64180aa3 "mintTo(address)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
cast call --rpc-url=http://localhost:8545 --private-key=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 0x5FbDB2315678afecb367f032d93F642f64180aa3 "ownerOf(uint256)" 1

# forge script --chain sepolia script/NFT.s.sol:MyScript --rpc-url $SEPOLIA_RPC_URL --broadcast --verify -vvvv
forge script --chain anvil-hardhat script/NFT.s.sol:MyScript --fork-url http://localhost:8545 --broadcast -vvvv

forge test --match-path test/Create2.t.sol -vvvv
```
