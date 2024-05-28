export interface networkConfigItem {
  name?: string;
  subscriptionId?: string;
  keepersUpdateInterval?: string;
  raffleEntranceFee?: string;
  callbackGasLimit?: string;
  vrfCoordinatorV2_5?: string;
  gasLane?: string;
  ethUsdPriceFeed?: string;
  mintFee?: string;
  nativePayment?: boolean;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
  31337: {
    name: "hardhat",
    gasLane:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    callbackGasLimit: "500000",
    mintFee: "10000000000000000",
    nativePayment: false,
  },
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2_5: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    gasLane:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    callbackGasLimit: "500000",
    subscriptionId:
      "34604683759749477888056652172057628403454283637887467963489055799049183689105",
    mintFee: "10000000000000000",
    nativePayment: false,
  },
};

const DECIMALS = "18";
const INITIAL_PRICE = "200000000000000000000";
const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
export const frontEndContractsFile = "./packages/nextjs-moralis/constants/networkMapping.json"
export const frontEndContractsFile2 =
    "./packages/nextjs-thegraph/constants/networkMapping.json"
export const frontEndAbiLocation = "./packages/nextjs-moralis/constants/"
export const frontEndAbiLocation2 = "./packages/nextjs-thegraph/constants/"

export {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  DECIMALS,
  INITIAL_PRICE,
};
