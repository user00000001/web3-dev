import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { network, deployments, ethers, getNamedAccounts } from "hardhat";

import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";

!developmentChains.includes(network.name) ? describe.skip : describe("Raffle Unit Tests", function(){
    let raffle: Raffle, 
    vrfCoordinatorV2Mock: VRFCoordinatorV2Mock, 
    raffleEntranceFee: BigNumber,
    deployer: string,
    interval: BigNumber;
    const chainId = network.config.chainId!;
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
    });
    describe("constructor", function () {
        it("initializes the raffle correctly", async function () {
            const raffleState = await raffle.getRaffleState();
            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), (networkConfig as {[key: number]: {
                interval: string;
            }})[chainId]["interval"]);
        });
    });
    describe("enterRaffle", function () {
        it("reverts when you don't pay enough", async function () {
            await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered");
        });
        it("records players when they enter", async function () {
            await raffle.enterRaffle({value: raffleEntranceFee});
            const playerFromContract = await raffle.getPlayer(0);
            assert.equal(playerFromContract, deployer);
        });
        it("emits event on enter", async function () {
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.emit(raffle, "RaffleEnter");
        })
        it("doesn't allow entrance when raffle is calculating", async function () {
            await raffle.enterRaffle({value: raffleEntranceFee})
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({method: "evm_mine", params: []})
            // await network.provider.send("evm_mine", [])
            await raffle.performUpkeep([]);
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.be.revertedWith("Raffle__NotOpen")
        })
    });
    describe("checkUpKeep", function() {
        it("returns false if people haven't sent any ETH", async function () {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({method: "evm_mine", params: []});
            const { upcheckNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(!upcheckNeeded);
        });
        it("returns false if raffle is't open", async function() {
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({method: "evm_mine", params: []});
            await raffle.performUpkeep("0x");
            const raffleState = await raffle.getRaffleState();
            const { upcheckNeeded } = await raffle.checkUpkeep([])
            assert.equal(raffleState.toString(), "1");
            assert.equal(upcheckNeeded, false);
        });
        it("returns false if enough time hasn't passed", async function() {
            await raffle.enterRaffle({value: raffleEntranceFee});
            // await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
            await network.provider.request({method: "evm_mine", params: []});
            const { upcheckNeeded } = await raffle.callStatic.checkUpkeep("0x");
            assert(!upcheckNeeded);
        });
        it("returns true if enough time has passed, has players, eth, and is open", async function() {
            await raffle.enterRaffle({value: raffleEntranceFee}); // every `it` task own an individial initial(beforeEach) Mocks state.
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({method: "evm_mine", params: []});
            const { upcheckNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(upcheckNeeded);
            const players_len = await raffle.getNumberOfPlayers();
            assert.equal(players_len.toString(), "2");
            const balance = await raffle.getOwnEth();
            assert.equal(balance.toString(), raffleEntranceFee.mul(2).toString());
            process.stdout.write(`${balance.toString()}\t${raffleEntranceFee.toString()}\n`);
        });
    });
    describe("performUpkeep", function(){
        it("it can only run if checkupkeep is true", async function() {
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({method: "evm_mine", params: []});
            const txResp = await raffle.performUpkeep([]);
            await txResp.wait(1);
            assert(txResp);
        });
        it("reverts when checkupkeep is false", async function(){
            await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpkeepNotNeeded(0, 0, 0)")
        });
        it("update the raffle state, emits and event, and calls the vrf coordinator", async function () {
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({method: "evm_mine", params: []});
            const txResp = await raffle.performUpkeep([]);
            const txRcpt = await txResp.wait(1);
            const requstId= txRcpt.events![1]!.args!.requestId; // need to define event params' name
            const raffleState = await raffle.getRaffleState();
            assert(requstId.toNumber() > 0);
            assert(raffleState.toString() == "1");
        })
    });
    describe("fulfillRandomWords", function(){
        beforeEach(async function(){
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({method: "evm_mine", params: []});
        });
        it("can only be called after performUpkeep", async function(){
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request");
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request");
        });
        it("picks a winner, resets the lottery, and sends money", async function () {
            const additionalEntrants = 3;
            const startingAccountIndex = 1;
            const accounts = await ethers.getSigners();
            for( let i = startingAccountIndex; i< startingAccountIndex + additionalEntrants; i++) {
                process.stdout.write(`account-${i}: ${accounts[i].address}\n`);
                const accountConnectedRaffle = raffle.connect(accounts[i])
                await accountConnectedRaffle.enterRaffle({value: raffleEntranceFee})
            }
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
                        const winnerEndingBalance = await accounts[1].getBalance();
                        assert.equal(numPlayers.toString(), "0");
                        assert.equal(raffleState.toString(), "0");
                        assert(endingTimeStamp > startingTimeStamp);
                        assert.equal(
                            winnerEndingBalance.toString(), 
                            winnerStartingBalance.add(
                                raffleEntranceFee
                                    .mul(additionalEntrants)
                                    .add(raffleEntranceFee)
                            ).toString()
                        );
                    } catch (error) {
                        reject(error);
                    }
                    resolve(1);
                })
                const txResp = await raffle.performUpkeep([]);
                const txRcpt = await txResp.wait(1);
                const winnerStartingBalance = await accounts[1].getBalance();
                await vrfCoordinatorV2Mock.fulfillRandomWords(
                    txRcpt.events![1].args!.requestId,
                    raffle.address
                )
            })
        });
    });
})