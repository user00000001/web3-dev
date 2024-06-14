// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import {PriceConsumerV3} from "../src/PriceConsumerV3.sol";
import {MockV3Aggregator} from "../src/test/MockV3Aggregator.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract readPriceScript is Script {
    using Strings for address;
    uint8 public DECIMALS = 18;
    int256 public INITIAL_PRICE = 2e20;

    MockV3Aggregator public v3a;
    PriceConsumerV3 public pcv3;
    function run() public {
        uint256 deployerPrivate = vm.envUint("PRIVATE_KEY");
        console.log("caller: %s, callee: %s", msg.sender.toHexString(), address(this).toHexString());
        vm.startBroadcast(deployerPrivate);
        // address pcv3_addr = vm.envAddress("PRICECONSUMERV3ADDR");
        checkOwner check_owner = new checkOwner();
        v3a = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        pcv3 = new PriceConsumerV3(address(v3a));
        int256 price = pcv3.getLatestPrice();
        console.log("InBroadcast checkOwner's caller: %s, owner: %s", check_owner.caller().toHexString(), check_owner.owner().toHexString());
        vm.stopBroadcast();
        console.log("OutBroadcast checkOwner's caller: %s", check_owner.caller().toHexString());
        console.log("price: %s", uint(price));
    }
}

contract checkOwner {
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    function caller() public view returns(address) {
        return msg.sender;
    }
}