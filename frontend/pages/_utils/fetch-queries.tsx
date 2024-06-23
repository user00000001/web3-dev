import { getBlockQueryOptions } from "wagmi/query";
import config, { client, hardhat_node } from "../_config";
import type { Block } from "viem";
import { sepolia } from "viem/chains";

export async function fetchBlockData(): Promise<Block> {
  return client.fetchQuery(
    getBlockQueryOptions(config, { chainId: hardhat_node.id })
  );
}

export async function prefetchBlockData() {
  const { queryKey } = getBlockQueryOptions(config, {
    chainId: hardhat_node.id,
  });
  console.log("Gotta Request of Prefetch.");
  return client.prefetchQuery({ queryKey });
}

export function getPendingBlockData(): Promise<Block> | undefined {
  const { queryKey } = getBlockQueryOptions(config, {
    chainId: sepolia.id,
    blockTag: "pending",
  });
  return client.getQueryData(queryKey);
}

export function setPendingBlockData(data: Block) {
  const { queryKey } = getBlockQueryOptions(config, {
    chainId: sepolia.id,
    blockTag: "pending",
  });
  return client.setQueryData(queryKey, data);
}
