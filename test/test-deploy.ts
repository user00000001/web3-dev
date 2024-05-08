import { ethers } from "hardhat";
import { expect, assert } from "chai";
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";


describe("SimpleStorage", function() {
    let simpleStorage: SimpleStorage;
    beforeEach(async function () {
        const simpleStorageFactory = (await ethers.getContractFactory("SimpleStorage")) as unknown as SimpleStorage__factory;
        simpleStorage = await simpleStorageFactory.deploy();
        await simpleStorage.waitForDeployment();
    })
    it("Should start with a favorite number of 0", async function() {
        const currentValue = await simpleStorage.retrieve()
        const expectedValue = "0";
        assert.equal(currentValue.toString(), expectedValue)
    })
    describe("SimpleStorage value checking", function() {
        it("Should update when we call store", async function () {
            // it.only("Should update when we call store", async function () {
            const expectedValue = "1000"
            const txResp = await simpleStorage.store(1000);
            await txResp.wait(1);
            const currentValue = await simpleStorage.retrieve()
            expect(expectedValue, "Not Matched!").equal(currentValue.toString())
        })
    })
})