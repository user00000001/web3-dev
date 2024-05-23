# Operations

## setup

```shell
# pnpm env --global use 16.x.x

pnpm i -D hardhat@~2.9.0 @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13 @nomiclabs/hardhat-etherscan@^3.1.0 ethers@^5 chai@^4.0.0 hardhat hardhat-contract-sizer hardhat-deploy@^0.9.29 hardhat-gas-reporter@^1.0.8 prettier prettier-plugin-solidity solhint solidity-coverage@~0.7.0 dotenv @typechain/ethers-v5@~10.0.0 @typechain/hardhat@~6.0.0 @types/chai @types/node ts-node typechain@~8.0.0 typescript @types/mocha @nomicfoundation/hardhat-chai-matchers@^1 @nomicfoundation/hardhat-toolbox@^2

# pnpm i -D "git+https://github.com/smartcontractkit/chainlink.git#49f1bf3ba296f0e3dfc01d5a3d371f82f159dc4a&path:contracts"
pnpm i -D "@chainlink/contracts@github:smartcontractkit/chainlink#49f1bf3ba296f0e3dfc01d5a3d371f82f159dc4a&path:contracts"

# fix fund-link not support ethereum sepolia
pnpm i -D "@appliedblockchain/chainlink-plugins-fund-link@github:user00000001/chainlink-consumer#4baee5fe304db9352c99b0d6437a305ab3c89ff3&path:plugins/fund-link" # need build dist.
#build then link to @appliedblockchain/chainlink-plugins-fund-link
git clone --depth 1 https://github.com/user00000001/chainlink-consumer && cd plugins/fund-link && \
pnpm remove @appliedblockchain@chainlink-eslint-config tsc && pnpm install && pnpm update -D ts-node@latest typescript@latest && \
pnpm run build && pnpm link -g && cd $prjpath && pnpm link -g @appliedblockchain/chainlink-plugins-fund-link
pnpm hardhat fund-link --contract $contractaddress --network sepolia --linkaddress $linkaddress

pnpm add -D @openzeppelin/contracts@^4 
```

## test at localhost

```shell
pnpm hardhat node --hostname 0.0.0.0
pnpm hardhat deploy --network localhost

pnpm hardhat read-automation-counter --contract 0x610178dA211FEF7D417bC0e6FeD39F05609AD788 --network localhost
pnpm hardhat run scripts/readPrice.ts --network localhost
# pnpm hardhat #...
```