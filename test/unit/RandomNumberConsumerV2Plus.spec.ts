import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { network, deployments, ethers } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { RandomNumberConsumerV2Plus, VRFCoordinatorV2_5Mock } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomNumberConsumer Unit Tests", async function () {
          let randomNumberConsumerV2Plus: RandomNumberConsumerV2Plus
          let vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock

          beforeEach(async () => {
              await deployments.fixture(["mocks", "vrf"])
              randomNumberConsumerV2Plus = await ethers.getContract("RandomNumberConsumerV2Plus")
              vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")
          })

          it("Should successfully request a random number", async () => {
              await expect(randomNumberConsumerV2Plus.requestRandomWords()).to.emit(
                  vrfCoordinatorV2_5Mock,
                  "RandomWordsRequested"
              )
          })

          it("Should successfully request a random number and get a result", async () => {
              await randomNumberConsumerV2Plus.requestRandomWords()
              const requestId: BigNumber = await randomNumberConsumerV2Plus.s_requestId()

              // simulate callback from the oracle network
              await expect(
                  vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, randomNumberConsumerV2Plus.address)
              ).to.emit(randomNumberConsumerV2Plus, "ReturnedRandomness")

              const firstRandomNumber: BigNumber = await randomNumberConsumerV2Plus.s_randomWords(0)
              const secondRandomNumber: BigNumber = await randomNumberConsumerV2Plus.s_randomWords(1)

              assert(
                  firstRandomNumber.gt(ethers.constants.Zero),
                  "First random number is greather than zero"
              )

              assert(
                  secondRandomNumber.gt(ethers.constants.Zero),
                  "Second random number is greather than zero"
              )
          })

          it("Should successfully fire event on callback", async function () {
              await new Promise(async (resolve, reject) => {
                  randomNumberConsumerV2Plus.once("ReturnedRandomness", async () => {
                      console.log("ReturnedRandomness event fired!")
                      const firstRandomNumber: BigNumber =
                          await randomNumberConsumerV2Plus.s_randomWords(0)
                      const secondRandomNumber: BigNumber =
                          await randomNumberConsumerV2Plus.s_randomWords(1)
                      // assert throws an error if it fails, so we need to wrap
                      // it in a try/catch so that the promise returns event
                      // if it fails.
                      try {
                          assert(firstRandomNumber.gt(ethers.constants.Zero))
                          assert(secondRandomNumber.gt(ethers.constants.Zero))
                          resolve(true)
                      } catch (e) {
                          reject(e)
                      }
                  })
                  await randomNumberConsumerV2Plus.requestRandomWords()
                  const requestId: BigNumber = await randomNumberConsumerV2Plus.s_requestId()
                  vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, randomNumberConsumerV2Plus.address)
              })
          })
      })
