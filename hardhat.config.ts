import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "hardhat-contract-sizer"
import "@appliedblockchain/chainlink-plugins-fund-link"

import "./tasks"; // after typechain generated.
import "./tasks/accounts";
import "./tasks/balance";
import "./tasks/block-number";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const COMPILER_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1e6,
  },
  metadata: {
    bytecodeHash: "none",
  },
};

const config: HardhatUserConfig = {
  // solidity: "0.8.4",
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: COMPILER_SETTINGS,
      },
      {
          version: "0.8.7",
          settings: COMPILER_SETTINGS,
      },
      {
          version: "0.8.6",
          settings: COMPILER_SETTINGS,
      },
      {
          version: "0.8.0",
          settings: COMPILER_SETTINGS,
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: []
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  }
};

export default config;
