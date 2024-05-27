import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { RandomIpfsNft, VRFCoordinatorV25Mock } from "../../typechain";

// eslint-disable-next-line no-unused-expressions
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random IPFS NFT Unit Tests", function () {
      let randomIpfsNft: RandomIpfsNft,
        deployer,
        vrfCoordinatorV2_5Mock: VRFCoordinatorV25Mock;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "randomipfs"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft");
        vrfCoordinatorV2_5Mock = await ethers.getContract(
          "VRFCoordinatorV2_5Mock",
          deployer
        );
      });

      describe("constructor", function () {
        it("sets starting values correctly", async function () {
          const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0);
          const isInitialized = await randomIpfsNft.s_initialized();
          assert(dogTokenUriZero.includes("ipfs://"));
          assert.equal(isInitialized, true);
        });
      });

      describe("requestNft", function () {
        it("fails if payment isn't sent with the request", async function () {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
            "NeedMoreETHSent"
          );
        });
        it("emits and event and kicks off a random word request", async function () {
          const fee = await randomIpfsNft.s_mintFee();
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested");
        });
      });
      describe("fulfillRandomWords", function () {
        it("mints NFT after random number returned", async function () {
          const eventHandler = new Promise<void>((resolve, reject) => {
            randomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenUri = await randomIpfsNft.tokenURI(0);
                const tokenCounter = await randomIpfsNft.s_tokenCounter();
                assert.equal(tokenUri.toString().includes("ipfs://"), true);
                assert.equal(tokenCounter.toString(), "1");
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
            });
          });
          try {
            const fee = await randomIpfsNft.s_mintFee();
            const requestNftResponse = await randomIpfsNft.requestNft({
              value: fee.toString(),
            });
            const requestNftReceipt = await requestNftResponse.wait(1);
            await vrfCoordinatorV2_5Mock.fulfillRandomWords(
              requestNftReceipt.events![1].args!.requestId,
              randomIpfsNft.address
            );
          } catch (e) {
            console.log(e);
          }
          await Promise.resolve(eventHandler);
        });
      });
    });
