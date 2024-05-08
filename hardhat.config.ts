import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";

const config: HardhatUserConfig = {
  // solidity: "0.8.18",
  solidity: {
    compilers: [
      {version: "0.8.18"}, {version: "0.6.6"}
    ]
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // accounts: [],
      chainId: 31337,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 0,
    }
  }
};

export default config;
