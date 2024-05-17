# Operations

## setup

```shell
# pnpm env --global use 16.x.x

pnpm i -D hardhat@~2.9.0 @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13 ethers@^5 @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle@2.0.0 chai@^4.0.0 ethereum-waffle@^3.0.0 hardhat hardhat-contract-sizer hardhat-deploy@^0.9.29 hardhat-gas-reporter@^1.0.8 prettier prettier-plugin-solidity solhint solidity-coverage@~0.7.0 dotenv @typechain/ethers-v5@~10.0.0 @typechain/hardhat@~6.0.0 @types/chai @types/node ts-node typechain@~8.0.0 typescript @types/mocha 

pnpm i -D git+https://github.com/smartcontractkit/chainlink#49f1bf3ba296f0e3dfc01d5a3d371f82f159dc4a # dependencies: @chainlink, branch: develop
pnpm add -D @openzeppelin/contracts@^4
```