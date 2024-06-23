/* eslint-disable react-hooks/rules-of-hooks */
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import React, { useRef, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { abi } from "../../../out/ERC20Test.sol/ERC20Test.json";

function onContracts() {
  const { address: account } = useAccount();
  const [InputAddr, setInputAddr] = useState<`0x${string}`>();
  const [OutputAddr, setOutputAddr] = useState<`0x${string}`>();
  const [TokenAddr, setTokenAddr] = useState<`0x${string}`>();
  const [OutputAmount, setOutputAmount] = useState<string>("0");
  const { data: symbol } = useReadContract({
    abi,
    account,
    address: TokenAddr,
    functionName: "symbol",
  });
  const { data: name } = useReadContract({
    abi,
    account,
    address: TokenAddr,
    functionName: "name",
  });
  const { data: decimals } = useReadContract({
    abi,
    account,
    address: TokenAddr,
    functionName: "decimals",
  });
  const { data: balance, refetch: refetch_balance } = useReadContract({
    abi,
    account,
    address: TokenAddr,
    functionName: "balanceOf",
    args: [InputAddr],
  });
  const { data: hash, writeContract } = useWriteContract();
  const inputaddr_ref = useRef<HTMLInputElement>(null);
  return (
    <div className=" bg-sky-300 w-4/5 mx-auto mt-4 flex flex-col">
      <div className="flex flex-row justify-center gap-4">
        <label htmlFor="token">Token Addr: </label>
        <input
          type="text"
          name=""
          className=" bg-amber-200"
          size={42}
          placeholder="0x..."
          id="token"
          onChange={(e) => setTokenAddr(e.target.value as `0x${string}`)}
        />
        <label htmlFor="input">Input Addr: </label>
        <input
          ref={inputaddr_ref}
          type="text"
          name=""
          className=" bg-amber-200"
          size={42}
          placeholder="0x..."
          id="input"
          onMouseOver={(e)=>{
            e.preventDefault();
            setInputAddr(inputaddr_ref.current!.value as `0x${string}`);
          }}
          onChange={(e) => setInputAddr(e.target.value as `0x${string}`)}
        />
        <button type="button" onClick={()=>{refetch_balance()}}>CheckTokens</button>
      </div>
      {(balance as bigint) && (
        <div>
          address: {InputAddr} at Token({name as string}): {TokenAddr} has{" "}
          {formatUnits(balance as bigint, decimals as number)}{" "}
          {symbol as string}s.
        </div>
      )}

      <div className=" mt-8">
        <div className="flex flex-row justify-center gap-4">
          <label htmlFor="output">Output Addr: </label>
          <input
            type="text"
            name=""
            className=" bg-amber-200"
            size={42}
            placeholder="0x..."
            id="output"
            onChange={(e) => setOutputAddr(e.target.value as `0x${string}`)}
          />
          <label htmlFor="amount">Amount: </label>
          <input
            type="number"
            name=""
            className=" bg-amber-200"
            size={42}
            placeholder="0x..."
            id="amount"
            onChange={(e) => setOutputAmount(e.target.value as `0x${string}`)}
          />
          <button
            type="button"
            onClick={() => {
              writeContract({
                address: TokenAddr!,
                abi,
                functionName: "transfer",
                args: [
                  OutputAddr,
                  parseUnits(OutputAmount, decimals as number),
                ],
              });
            }}
          >
            Apply
          </button>
        </div>
        {hash && <div>TX Hash: {hash}</div>}
      </div>
    </div>
  );
}

export default onContracts;
