import React, { useState, useEffect } from 'react'
import { useWeb3Contract, useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { abi, contractAddresses } from '../constants';
import { useNotification } from 'web3uikit';
import { BigNumber, ethers, ContractTransaction } from "ethers";

interface contractAddressesInterfacee {
  [key: string]: string[]
}

function LotteryEntrance() {
  const addresses: contractAddressesInterfacee = contractAddresses;
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId: string = parseInt(chainIdHex!).toString();
  const raffleAddress = chainId in addresses ? addresses[chainId][0]: null;
  const [EntranceFee, setEntranceFee] = useState("0");
  const [NumPlayers, setNumPlayers] = useState("0");
  const [RecentWinner, setRecentWinner] = useState("0");

  const dispatch = useNotification();

  const {
    runContractFunction: EnterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "enterRaffle",
    params: {},
    msgValue: EntranceFee,
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress!, // specify the networkId
    functionName: "getEntranceFee",
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress!, // specify the networkId
      functionName: "getNumberOfPlayers",
      params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress!, // specify the networkId
      functionName: "getRecentWinner",
      params: {},
  })

  async function updateUI() {
    const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString()
    const numPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString()
    const recentWinnerFromCall = (await getRecentWinner()) as string;
    setEntranceFee(entranceFeeFromCall)
    setNumPlayers(numPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }

  useEffect(() => {
    if(isWeb3Enabled) {
      updateUI()
    }
  }, [isWeb3Enabled])

  const handleSuccess = async function(tx: ContractTransaction) {
    await tx.wait(1)
    handleNewNotification()
    updateUI()
  }

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    })
  }

  return (
    <div className='p-5'>Hi from LotteryEntrance!
    {raffleAddress ? (
      <div className=''>
        RaffleV2_5({ raffleAddress })
        <br />
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto' onClick={async function(){
          await EnterRaffle({
            onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
          })
        }} disabled={isLoading || isFetching}>
          {isLoading||isFetching ? (
            <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div>
          ) : (
            <div>Enter Raffle</div>
          )}
        </button>
        <div>Entrance Fee: {ethers.utils.formatUnits(EntranceFee, "ether")} ETH</div>
        <div>Number Of Players: {NumPlayers}</div>
        <div>Recent Winner: {RecentWinner}</div>
      </div>
    ) : (
      <div>No Raffle Address Deteched</div>
    )}
    </div>
  )
}

export default LotteryEntrance