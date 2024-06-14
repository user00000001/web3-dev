// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import {AutomationCounter} from "../src/AutomationCounter.sol";

contract AutomationCounterTestBase is Test {
    uint256 automationUpdateInterval = 30;
    AutomationCounter ac;

    function setUp() public {
        ac = new AutomationCounter(automationUpdateInterval);
    }

    function test_checkUpkeep() public view {
        (bool upkeepNeeded,) = ac.checkUpkeep("");
        assertEq(upkeepNeeded, false, "checkUpkeep wrong");
    }

    function test_performUpkeep_revert() public {
        vm.expectRevert(bytes("Time interval not met"));
        ac.performUpkeep("");
    }

    function test_performUpkeep() public {
        uint256 startingCount = ac.counter();
        skip(automationUpdateInterval + 1);
        vm.roll(10);
        ac.performUpkeep("");
        assertEq(ac.counter(), startingCount + 1, "performUpkeep wrong");
    }
}
