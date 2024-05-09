import { assert, expect } from "chai";
import { ethers, getNamedAccounts, network } from "hardhat";
import { FundMe } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name) ? describe.skip : describe("FundMe", async function () {
    let fundMe: FundMe, deployer: string
    const sendValue = ethers.utils.parseEther("0.01"); // 1e18.toString()
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
    });
    it("allows people to fund and withdraw", async function () {
        await fundMe.fund({value: sendValue, gasLimit: 110000})
        await fundMe.withdraw({gasLimit: 80000});
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), "0")
    })
})