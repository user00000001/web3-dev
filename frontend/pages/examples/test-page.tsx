import React from "react";
import {
  fetchBlockData,
  getPendingBlockData,
  prefetchBlockData,
  setPendingBlockData,
} from "../_utils/fetch-queries";
import { serialize, deserialize } from "wagmi";
import type { Block } from "viem";
import CustomNav from "./_components/CustomNav";

function TestPage({
  data,
  sepolia_data,
}: {
  data: string;
  sepolia_data: string;
}) {
  // not allow async function for page, put async data to props
  const blk = deserialize<Block>(data);
  const sepolia_blk = deserialize<Block>(sepolia_data);
  return (
    <div>
      <CustomNav></CustomNav>
      <div className=" space-y-2 mt-4 w-2/3 mx-auto p-2 rounded-md bg-lime-200 divide-y-2 divide-purple-500">
        <div>Hardhat: {blk.transactions && blk.transactions[0].toString()}</div>
        <div>
          Sepolia:{" "}
          {sepolia_blk
            ? sepolia_blk.transactions && sepolia_blk.transactions[0].toString()
            : "Not exists."}
        </div>
        <div>
          Prefetch Block:{" "}
          <button type="button" className=" bg-orange-300 rounded-lg px-4 hover:scale-105" title="prefetch block into cache." onClick={async () => prefetchBlockData()}>
            Click At Me
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestPage;

export async function getServerSideProps() {
  const block = await fetchBlockData();
  setPendingBlockData(block);
  const sepolia_block = await getPendingBlockData();
  const data = serialize(block);
  const sepolia_data = serialize(sepolia_block || null);
  return {
    props: {
      data,
      // block, // cannot be serialized as JSON (BigInt)
      sepolia_data,
    },
  };
}
