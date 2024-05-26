# Operations

## install hardhat & packages

```shell
# pnpm env --global use 16.x.x
pnpm init 

# on windows: double (not single) quote the limited (tilde (~) or caret (^)) version, 
# or pnpm will ignore those limit, lock the same version as typed at pnpm-lock.yaml
pnpm i -D "hardhat@~2.9.0"
pnpm hardhat init # typescript

# multiple-line not support next line begins with double quote, will treat it as input end. 
# below line will fail, one space even better.
# 
# pnpm i -D @typechain/ethers-v5 "ethers@^5.0.0" typechain @nomiclabs/hardhat-etherscan ^
# "@nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13" ^
# solidity-coverage
#
# Be care of using multiple-lines( \ , ^ ), I lose some data of the driver root dirtory, 
# dependencies configuration suddenly have a value to the driver symbol(likes E:\), 
# even ignore_node_modules directory instead of, which turn to be operating to the root 
# directory of one driver, might operating wrong data directory.
pnpm install --save-dev "hardhat@~2.9.9" "@nomiclabs/hardhat-waffle@^2.0.0" "ethereum-waffle@^3.0.0"^
 "chai@^4.2.0" "@nomiclabs/hardhat-ethers@^2.0.0" "ethers@^5.0.0" "@nomiclabs/hardhat-etherscan@^3.0.0"^
 "dotenv@^16.0.0" "eslint@^7.29.0" "eslint-config-prettier@^8.3.0" "eslint-config-standard@^16.0.3"^
 "eslint-plugin-import@^2.23.4" "eslint-plugin-node@^11.1.0" "eslint-plugin-prettier@^3.4.0"^
 "eslint-plugin-promise@^5.1.0" "hardhat-gas-reporter@^1.0.4" "prettier@^2.3.2"^
 "prettier-plugin-solidity@^1.0.0-beta.13" "solhint@^3.3.6" "solidity-coverage@^0.7.16"^
 "@typechain/ethers-v5@^7.0.1" "@typechain/hardhat@^2.3.0" "@typescript-eslint/eslint-plugin@^4.29.1"^
 "@typescript-eslint/parser@^4.29.1" "@types/chai@^4.2.21" "@types/node@^12.0.0" "@types/mocha@^9.0.0"^
 "ts-node@^10.1.0" "typechain@^5.1.2" "typescript@^4.5.2"

pnpm i -D "@nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13" "hardhat-deploy@^0.10.5"

pnpm i -D "@openzeppelin/contracts@^4"
```

## basic operations

```
pnpm hardhat compile
pnpm hardhat typechain
pnpm hardhat test
pnpm hardhat coverage
pnpm hardhat accounts
```