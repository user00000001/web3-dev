import { beforeEach, describe, it } from "mocha";
import { developmentChains } from "../../helper-hardhat-config";
import { ethers, network, deployments, getNamedAccounts } from "hardhat";
import { BasicNft, NftMarketplace } from "../../typechain";
import { Signer } from "ethers";
import { assert, expect } from "chai";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFT Marketplace Unit Tests.", function () {
      let nftMarketplace: NftMarketplace,
        nftMarketplaceContract: NftMarketplace,
        basicNft: BasicNft;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;
      let deployer: Signer;
      let user: Signer;
      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        basicNft = await ethers.getContract("BasicNft", deployer);
        nftMarketplace = await ethers.getContract("NftMarketplace", deployer);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplaceContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplace.address, TOKEN_ID);
      });
      describe("listItem", function () {
        it("emits an event after listing an item", async function () {
          expect(
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.emit(nftMarketplace, `ItemListed`);
        });
        it("exclusively items that haven't been listed", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`;
          //   await expect(
          //       nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          //   ).to.be.revertedWith("AlreadyListed")
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith(error);
        });
        it("exclusively allows owners to list", async function () {
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(await user.getAddress(), TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            // ).to.be.revertedWith("NftMarketplace_NotOwner");
            // ).to.be.revertedWith("1NotOwner"); // failed, matches with letters' sequence.
          ).to.be.revertedWith("_NotOwner");
        });
        it("needs approvals to list item", async function () {
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotApprovedForMarketplace");
        });
        it("Updates listing with seller and price", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const listing = await nftMarketplace.s_listings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == (await deployer.getAddress()));
        });
      });

      describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
          const error = `NotListed("${basicNft.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith(error);
        });
        it("reverts if anyone but the owner tries to call", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(await user.getAddress(), TOKEN_ID);
          await expect(
            nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NotOwner");
        });
        it("emits event and removes listing", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.emit(nftMarketplace, "ItemCanceled");
          const listing = await nftMarketplace.s_listings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == "0");
        });
      });
      describe("buyItem", function () {
        it("reverts if the item isnt listed", async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NotListed");
        });
        it("reverts if the price isnt met", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await expect(
            nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("PriceNotMet");
        });
        it("transfers the nft to the buyer and updates internal proceeds record", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          expect(
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit(nftMarketplace, "ItemBought");
          const newOwner = await basicNft.ownerOf(TOKEN_ID);
          const deployerProceeds = await nftMarketplace.s_proceeds(
            await deployer.getAddress()
          );
          assert(newOwner.toString() == (await user.getAddress()));
          assert(deployerProceeds.toString() == PRICE.toString());
        });
      });
      describe("updateListing", function () {
        it("must be owner and listed", async function () {
          await expect(
            nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotListed");
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotOwner");
        });
        it("updates the price of the item", async function () {
          const updatedPrice = ethers.utils.parseEther("0.2");
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.updateListing(
              basicNft.address,
              TOKEN_ID,
              updatedPrice
            )
          ).to.emit(nftMarketplace, "ItemListed");
          const listing = await nftMarketplace.s_listings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == updatedPrice.toString());
        });
      });
      describe("withdrawProceeds", function () {
        it("doesn't allow 0 proceed withdrawls", async function () {
          await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
            "NoProceeds"
          );
        });
        it("withdraws proceeds", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });
          nftMarketplace = nftMarketplaceContract.connect(deployer);

          const deployerProceedsBefore = await nftMarketplace.s_proceeds(
            await deployer.getAddress()
          );
          const deployerBalanceBefore = await deployer.getBalance();
          const txResponse = await nftMarketplace.withdrawProceeds();
          const transactionReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const deployerBalanceAfter = await deployer.getBalance();

          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalanceBefore).toString()
          );
        });
      });
    });
