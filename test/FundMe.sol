// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {MockV3Aggregator} from "../src-0_6_x/test/MockV3Aggregator.sol";
import {FundMe} from "../src/FundMe.sol";

contract FundMeTest is Test {
    uint8 constant public DECIMALS = 8;
    uint256 constant public INITIAL_ANSWER = 2e11;
    MockV3Aggregator public mv3a;
    FundMe public fm;
    function setUp() public {
        mv3a = new MockV3Aggregator(DECIMALS, INITIAL_ANSWER);
        fm = new FundMe(mv3a.address);
    }
    function test_constructor() public {
        assertEq(fm.priceFeed(), mv3a.address, "not set the aggregator addresses correctly");
    }
}