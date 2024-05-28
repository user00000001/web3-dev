/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
import { expect, assert } from "chai";
import { ethers, network, getNamedAccounts, deployments } from "hardhat";
import { describe, it, beforeEach } from "mocha";
import { developmentChains } from "../../helper-hardhat-config";
import { BasicNft } from "../../typechain";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic NFT Unit Tests", function () {
      let basicNft: BasicNft;
      let deployer: string;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["basicnft"]);
        basicNft = (await ethers.getContract(
          "BasicNft",
          deployer
        )) as unknown as BasicNft;
      });
      it("Allows users to mint an NFT, and updates appropriately", async function () {
        const txResp = await basicNft.mintNft();
        await txResp.wait(1);
        const tokenURI = await basicNft.tokenURI(0);
        const tokenCounter = await basicNft.getTokenCounter();
        assert.equal(tokenCounter.toString(), "1");
        assert.equal(tokenURI, await basicNft.TOKEN_URI());
        expect(await basicNft.getTokenCounter()).to.equal(1);
      });
    });
