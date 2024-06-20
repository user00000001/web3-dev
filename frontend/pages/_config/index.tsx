import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  hardhat,
  Chain,
} from "wagmi/chains";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient } from "@tanstack/react-query";
import { GetSiweMessageOptions } from "@rainbow-me/rainbowkit-siwe-next-auth";

const hardhat_node = {
  ...hardhat,
  id: 31338,
  name: "HarthatNode",
  rpcUrls: {
    default: { http: ["http://192.168.0.99:8545"] },
  },
} as const satisfies Chain;

const config = getDefaultConfig({
  appName: "RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    hardhat,
    hardhat_node,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
  wallets: [
    {
      groupName: "Current",
      wallets: [metaMaskWallet],
    },
    {
      groupName: "Recommended",
      wallets: [rainbowWallet, walletConnectWallet],
    },
  ],
});

const client = new QueryClient();

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to the RainbowKit + SIWE example app",
});

export default config;
export {
    hardhat_node,
    client,
    getSiweMessageOptions
};
