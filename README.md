# Operations

## install hardhat & packages

```shell
# pnpm env --global use 16.x.x
pnpm init 
pnpm i -D "hardhat@~2.9.0"
pnpm hardhat init # typescript

# remove eslint supports, not good at it, handling it is too boring and spend time.
pnpm install --save-dev "hardhat@~2.9.9" "@nomiclabs/hardhat-waffle@^2.0.0" "ethereum-waffle@^3.0.0"^
 "chai@^4.2.0" "hardhat-deploy@^0.10.5" "ethers@^5.0.0" "@nomiclabs/hardhat-etherscan@^3.0.0"^
 "dotenv@^16.0.0" "hardhat-gas-reporter@^1.0.4" "prettier@^2.3.2" "prettier-plugin-solidity@^1.0.0-beta.13"^
 "solhint@^3.3.6" "solidity-coverage@^0.7.16" "@typechain/ethers-v5@^7.0.1" "@typechain/hardhat@^2.3.0"^
 "@types/chai@^4.2.21" "@types/node@^12.0.0" "@nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13"^
 "@types/mocha@^9.0.0" "ts-node@^10.1.0" "typechain@^5.1.2" "typescript@^4.5.2" "@openzeppelin/contracts@^4"^
 "@openzeppelin/hardhat-upgrades@~1.15.0"

pnpm hardhat node --hostname 0.0.0.0 --no-deploy

```
