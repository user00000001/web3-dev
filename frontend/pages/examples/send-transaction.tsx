import React from "react";
import CustomNav from "./_components/CustomNav";
import {
  BaseError,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

function SendTransaction() {
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
  return (
    <>
      <CustomNav></CustomNav>
      <div className=" mt-4 bg-blue-400 bg-opacity-50 h-full">
        <form
          onSubmit={onSubmit}
          className=" h-12 border-collapse border border-red-300 flex items-center justify-center space-x-4 w-4/5 mx-auto rounded-md"
        >
          <label htmlFor="address">To: </label>
          <input
            type="text"
            name="address"
            placeholder="0x..."
            id="address"
            required
            className=" border w-[24rem]"
          />
          <label htmlFor="value">Value(ETH): </label>
          <input
            type="text"
            name="value"
            placeholder="1"
            id="value"
            required
            className=" border w-16"
          />
          <button
            disabled={isPending}
            type="submit"
            className=" bg-slate-400 px-5 rounded-lg border border-black hover:scale-105"
          >
            {isPending ? "Confirming..." : "Send"}
          </button>
        </form>
        <div className=" divide-y-2 divide-pink-400 divide-dashed divide-opacity-50">
          {hash && <div className="text-purple-800 text-center">Transaction Hash: {hash}</div>}
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
