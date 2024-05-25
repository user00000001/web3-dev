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
pnpm i -D typescript ts-node @types/node dotenv solhint "hardhat-gas-reporter@^1" ^
@typechain/ethers-v5 "ethers@^5.0.0" typechain @nomiclabs/hardhat-etherscan "solidity-coverage@~0.7.0" ^
 "@nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13" ^
@typechain/hardhat @nomiclabs/hardhat-waffle "hardhat@~2.9.0" @types/mocha ^
 "chai@^4" prettier 
```

## basic operations

```
pnpm hardhat compile
pnpm hardhat typechain
pnpm hardhat test
pnpm hardhat coverage
pnpm hardhat accounts
```