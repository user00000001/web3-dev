import { assert, expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

describe("FundMe", async function () {
    let fundMe: FundMe, deployer: string, mockV3Aggregator: MockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1"); // 1e18.toString()
    beforeEach(async function () {
        // const accounts = await ethers.getSigners();
        // const accountOne = accounts[0]
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]) // by hardhat-deploy
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    });
    describe("constructor", async function () {
        it("set the aggregator addresses correctly", async function () {
            const pfaddr = await fundMe.priceFeed();
            assert.equal(pfaddr, mockV3Aggregator.address)
        })
    });
    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.reverted;
        })
        it("updated the amount funded data structure", async function () {
            await fundMe.fund({value: sendValue});
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString());
        })
        it("Adds funder to array of fundes", async function () {
            await fundMe.fund({value: sendValue});
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer);
        })
    });
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({value: sendValue})
        })
        it("Withdraw ETH from a single founder", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const txResp = await fundMe.withdraw()
            const txReceipt = await txResp.wait(1)
            const { gasUsed, effectiveGasPrice } = txReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance.toString(), ethers.utils.parseEther("0").toString());
            assert.equal(
                startingDeployerBalance.add(startingFundMeBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString()
                // endingDeployerBalance.toString()
            )
        })
        it("allows us to withdraw with multiple funders", async function() {
            const accounts = await ethers.getSigners();
            for(let i=1; i< 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const txResp = await fundMe.withdraw()
            const txRcpt = await txResp.wait(1);
            const { gasUsed, effectiveGasPrice } = txRcpt;
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString(),
            )
            await expect(fundMe.funders(0)).to.be.reverted
            for (let i=1; i< 6;i++) {
                assert.equal(
                    (await fundMe.addressToAmountFunded(accounts[i].address)).toString(),
                    "0"
                )
            }
        })
        it("Only allows the owner to withdraw", async function() {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1];
            const attackerConnectedFundMe = fundMe.connect(attacker)
            await expect(attackerConnectedFundMe.withdraw()).to.be.revertedWithCustomError(fundMe, "NotOwner")
        })
    })
})