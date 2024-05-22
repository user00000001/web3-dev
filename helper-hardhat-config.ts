import { BigNumber } from "ethers";

type NetworkConfigItem = {
    name: string,
    fundAmount: BigNumber,
    fee?: string,
    keyHash?: string,
    interval?: string,
    linkToken?: string,
    vrfCoordinator?: string,
    automationUpdateInterval?: string,
    oracle?: string,
    jobId?: string,
    ethUsdPriceFeed?: string,
    nativePayment?: boolean,
}

type NetworkConfigMap = {
    [chainId: string]: NetworkConfigItem,
}

export const VERIFICATION_BLOCK_CONFIRMATIONS = 6
export const developmentChains = ["localhost", "hardhat"]
export const networkConfig: NetworkConfigMap = {
    default: {
        name: "hardhat",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: BigNumber.from("1000000000000000000"),
        automationUpdateInterval: "30",
        nativePayment: false,
    },
    31337: {
        name: "localhost",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: BigNumber.from("1000000000000000000"),
        automationUpdateInterval: "30",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        nativePayment: false,
    },
    1: {
        name: "mainnet",
        linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
        fundAmount: BigNumber.from("0"),
        automationUpdateInterval: "30",
        nativePayment: false,
    },
    11155111: {
        name: "sepolia",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        vrfCoordinator: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
        oracle: "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD",
        jobId: "ca98366cc7314957b8c012c72f05aeeb",
        fee: "100000000000000000",
        fundAmount: BigNumber.from("100000000000000000"),
        automationUpdateInterval: "30",
        nativePayment: false
    }
}