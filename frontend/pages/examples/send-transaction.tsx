import React, { useEffect, useState } from "react";
import CustomNav from "./_components/CustomNav";
import {
  BaseError,
  useAccount,
  useBalance,
  useBlockNumber,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";

function SendTransaction() {
  const [to, setto] = useState<`0x${string}`>();
  const { address: from } = useAccount();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const {
    data: from_balance,
    refetch: from_refetch,
    queryKey,
  } = useBalance({
    address: from,
  });
  const {
    data: to_balance,
    refetch: to_refetch,
    queryKey: to_queryKey,
  } = useBalance({ address: to });
  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
  } = useSendTransaction();
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const to = formData.get("address") as `0x${string}`;
    const value = formData.get("value") as string;
    console.log(`${to}, ${value}`);
    sendTransaction({ to, value: parseEther(value) });
  }
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  useEffect(() => {
    to_refetch();
    // from_refetch(); // using queryClient now
  }, [isConfirmed, to_refetch, from_refetch]);
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey }); // refetch data again
  }, [blockNumber, queryKey, queryClient]);
  return (
    <>
      <CustomNav></CustomNav>
      <div className=" mt-4 bg-blue-400 bg-opacity-50 h-full">
        <form
          onSubmit={onSubmit}
          className=" h-12 border-collapse border border-red-300 flex items-center justify-center space-x-4 mx-auto rounded-md p-8 bg-lime-300"
        >
          <div className="flex flex-col">
            <div>From: {from}</div>
            <div>
              {"owns "}
              {from_balance
                ? formatUnits(from_balance?.value, from_balance?.decimals)
                : 0}{" "}
              ETH
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex">
              <label htmlFor="address" className="flex flex-col">
                <div className=" pr-4">To:</div>
              </label>
              <input
                type="text"
                name="address"
                placeholder="0x..."
                id="address"
                required
                className=" border w-[24rem]"
                onChange={(value) => {
                  let to = value.target.value;
                  if (to.length == 42 && to.startsWith(`0x`)) {
                    console.log(`${to}`);
                    setto(to as `0x${string}`);
                  }
                }}
              />
            </div>
            <div className="flex">
              <span className="w-1/2">
                {"owns "}
                {to_balance
                  ? formatUnits(to_balance?.value, to_balance?.decimals)
                  : 0}{" "}
                ETH
              </span>
              <button
                type="button"
                className=" w-1/2 bg-slate-400 px-5 rounded-lg border border-black hover:scale-105"
                onClick={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: to_queryKey,
                  });
                }}
              >
                refresh
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <label htmlFor="value">Value(ETH): </label>
              <input
                type="text"
                name="value"
                placeholder="1"
                id="value"
                required
                className=" border w-16"
              />
            </div>
            <button
              disabled={isPending}
              type="submit"
              className=" bg-slate-400 px-5 rounded-lg border border-black hover:scale-105"
            >
              {isPending ? "Confirming..." : "Send"}
            </button>
          </div>
        </form>
        <div className=" divide-y-2 divide-pink-400 divide-dashed divide-opacity-50">
          <div className="text-purple-800 text-center flex justify-around">
            {blockNumber && <div>BlockNumber: {blockNumber.toString()}</div>}
            {hash && <div className="">Transaction Hash: {hash}</div>}
          </div>
          {isPending && <div className="">Waiting for Submit...</div>}
          {isConfirming && <div className="">Waiting for confirmation...</div>}
          {isConfirmed && <div>Transaction confirmed.</div>}
          {error && (
            <div className="text-red text-right">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SendTransaction;
