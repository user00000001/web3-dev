export interface networkConfigItem {
  name: string;
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string | number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
  },
  11155111: {
    name: "sepolia",
    blockConfirmations: 6,
  },
  1: {
    name: "mainnet",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
export const proposalsFile = "proposals.json";

// Governor Values
export const QUORUM_PERCENTAGE = 4; // Need 4% of voters to pass
export const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 5; // blocks
export const VOTING_DELAY = 1; // 1 Block - How many blocks till a proposal vote becomes active
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const NEW_STORE_VALUE = 77;
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!";

export { networkConfig, developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS };
