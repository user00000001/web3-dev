// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.6.2 <0.8.0;
pragma experimental ABIEncoderV2;

import "forge-std/Test.sol";
import {MockV3Aggregator} from "../src-0_6_x/test/MockV3Aggregator.sol";
import {FundMe} from "../src-0_6_x/FundMe.sol";

contract FundMeTest is Test {
    uint8 constant public DECIMALS = 8;
    int256 constant public INITIAL_ANSWER = 2e11;
    MockV3Aggregator public mv3a;
    FundMe public fm;
    function setUp() public {
        mv3a = new MockV3Aggregator(DECIMALS, INITIAL_ANSWER);
        fm = new FundMe(mv3a);
    }
    function test_constructor() view public {
        assertEq(address(fm.priceFeed()), address(mv3a), "not set the aggregator addresses correctly");
    }
}