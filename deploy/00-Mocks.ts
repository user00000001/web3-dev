import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNamedAccounts, deployments, network } from "hardhat";

export default async () => {
    const DECIMALS: string = `18`;
    const INITIAL_PRICE: string = `200000000000000000000`;

    const BASE_FEE = "100000000000000000";
    const GAS_PRICE_LINK = "1000000000";
    const WEI_PER_UNIT_LINK = "200000000000000000";

    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number | undefined = network.config.chainId;

    if(chainId === 31337) {
        log(`Local network detected! Deploying mocks...`);
        const mockLinkToken = await deploy(`MockLinkToken`, {from: deployer, log: true});
        await deploy(`MockV3Aggregator`, {
            contract: `MockV3Aggregator`,
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        await deploy(`VRFCoordinatorV2_5Mock`, {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK],
        })
        await deploy("MockOracle", {
            from: deployer,
            log: true,
            args: [mockLinkToken.address],
        })

        log(`Mocks Deployed!`)
        log(`----------------------------------------------------`)
        log(`You are deploying to a local network, you'll need a local network running to interact`)
        log("Please run `pnpm hardhat console` to interact with the deployed smart contracts!")
        log(`----------------------------------------------------`)
    }
}

export const tags = ["all", "mocks", `main`]