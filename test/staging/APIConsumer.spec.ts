import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { network, ethers, run } from "hardhat"
import { APIConsumer } from "../../typechain-types"
import { assert } from "chai"
import { BigNumber, constants } from "ethers"
import { autoFundCheck } from "../../helper-functions"

developmentChains.includes(network.name)
    ? describe.skip
    : describe("APIConsumer Staging Tests", async function () {
          let apiConsumer: APIConsumer
          let linkTokenAddress: string

          beforeEach(async () => {
              apiConsumer = await ethers.getContract("APIConsumer")
              const chainId: number | undefined = network.config.chainId
              if (!chainId) return
              linkTokenAddress = networkConfig[chainId].linkToken!
              if (await autoFundCheck(apiConsumer.address, network.name, linkTokenAddress, "")) {
                  await run("fund-link", {
                      contract: apiConsumer.address,
                      linkaddress: linkTokenAddress,
                  })
              }
          })

          afterEach(async function () {
              apiConsumer.removeAllListeners()
          })

          // We can't use an arrow functions here because we need to use `this`. So we need
          // to use `async function() {` as seen.
          it("Our event should successfully fire on callback", async function () { // takes 26m to exit on windows???
              this.timeout(200000) // wait 200 seconds max
              // we setup a promise so we can wait for our callback from the `once` function
              await new Promise(async (resolve, reject) => {
                  // setup listener for our event
                  apiConsumer.once("DataFullfilled", async () => {
                      console.log("DataFullfilled event fired!")
                      const volume: BigNumber = await apiConsumer.volume()
                      // assert throws an error if it fails, so we need to wrap
                      // it in a try/catch so that the promise returns event
                      // if it fails.
                      try {
                          assert(volume.gt(constants.Zero), "The volume is more than 0. ")
                          console.log(`${volume.toHexString()} ${volume.toString()}`);
                          resolve(true)
                      } catch (e) {
                          console.error(e);
                          reject(e)
                      }
                  })

                  await apiConsumer.requestVolumeData()
              });
          });

          it.skip("Our event should successfully fire on callback with done", (done) => { // takes 23m to exit on windows???
            apiConsumer.once("DataFullfilled", async () => {
                console.log("DataFullfilled event fired!")
                const volume: BigNumber = await apiConsumer.volume()
                try {
                    assert(volume.gt(constants.Zero), "The volume is more than 0. ")
                    console.log(`${volume.toHexString()} ${volume.toString()} with done`);
                    done();
                } catch (e) {
                    console.error(e);
                }
            })
            apiConsumer.requestVolumeData()
        }).timeout(30000);
      })
