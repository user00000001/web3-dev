import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { network, deployments, ethers, getNamedAccounts } from "hardhat";

import { RaffleV2_5 } from "../../typechain-types";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";

developmentChains.includes(network.name) ? describe.skip : describe("Raffle Unit Tests", function(){
    let raffle: RaffleV2_5, 
    raffleEntranceFee: BigNumber,
    deployer: string;
    const chainId = network.config.chainId!;
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("RaffleV2_5", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
    });
    describe("fulfillRandomWords", function(){
        let accounts: any [];
        beforeEach(async function () {
            accounts = await ethers.getSigners();
        })
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
            const startingTimeStamp = await raffle.getLatestTimeStamp();
    
            await new Promise(async(resolve, reject)=>{
                raffle.once("WinnerPicked", async ()=>{
                    console.log("Found the event!");
                    try {
                        const recentWinner = await raffle.getRecentWinner();
                        process.stdout.write(`winner: ${recentWinner}\n`);
                        const raffleState = await raffle.getRaffleState();
                        const endingTimeStamp = await raffle.getLatestTimeStamp();
                        const numPlayers = await raffle.getNumberOfPlayers();
                        const winnerEndingBalance = await accounts[0].getBalance();
                        assert.equal(numPlayers.toString(), "0");
                        assert.equal(raffleState.toString(), "0");
                        assert(endingTimeStamp > startingTimeStamp);
                        await expect(raffle.getPlayer(0)).to.be.reverted;
                        assert.equal(recentWinner.toString(), accounts[0].address);
                        assert.equal(
                            winnerEndingBalance.toString(),
                            winnerStartingBalance.add(raffleEntranceFee).toString()
                        )
                    } catch (error) {
                        reject(error);
                    }
                    resolve(1);
                })
                await raffle.enterRaffle({value: raffleEntranceFee});
                const winnerStartingBalance = await accounts[0].getBalance();
            })
    })
    });
})