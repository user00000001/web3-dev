// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import {PriceConsumerV3} from "../src/PriceConsumerV3.sol";
import {MockV3Aggregator} from "../src/test/MockV3Aggregator.sol";

contract PriceConsumerV3TestBase is Test {
    uint8 public DECIMALS = 18;
    int256 public INITIAL_PRICE = 2e20;

    MockV3Aggregator public v3a;
    PriceConsumerV3 public pcv3;

    function setUp() public {
        v3a = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        pcv3 = new PriceConsumerV3(address(v3a));
    }

    function test_constructor() public view {
        address pf = address(pcv3.getPriceFeed());
        assertEq(pf, address(v3a), "pricefeed address not matched.");
    }

    function test_latestprice() public view {
        int256 lp = pcv3.getLatestPrice();
        (, int256 pfa,,,) = v3a.latestRoundData();
        assertEq(lp, pfa, "price not matched");
    }
}
