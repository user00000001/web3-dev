import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "dotenv/config";

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  // solidity: "0.8.18",
  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.8.7" },
      { version: "0.6.6" },
    ],
  },
  networks: {
    hardhat: {
      blockGasLimit: 30000000 * 1e2,
      allowUnlimitedContractSize: true,            
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // accounts: [],
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
  mocha: {
    timeout: 200000,
  },
};

export default config;
