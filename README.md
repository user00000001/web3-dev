# Operations

## commands

```shell
pnpm i -D hardhat@~2.14.0 solhint @chainlink/contracts@0.8 hardhat-deploy@~0.9.0 @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13
pnpm hardhat init
pnpm solhint contracts/*.sol
pnpm hardhat typechain
pnpm hardhat deploy --tags mocks
http_proxy=http://127.0.0.1:10809 pnpm hardhat deploy --tags fundme --network sepolia
pnpm hardhat test --grep owner
```
