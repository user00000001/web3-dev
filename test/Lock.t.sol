// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {Lock} from "../contracts/Lock.sol";

contract LockTest is Test {
    Lock public lock;
    uint256 public unlockTime = block.timestamp + 1 days;
    uint256 public constant lock_initial_value = 1e9 wei;
    function setUp() public {
        lock = new Lock{value: lock_initial_value}(unlockTime);
    }
    function test_constructor() public {
        assertEq(lock.unlockTime(), unlockTime, "unlockTime not matched.");
        console.log("unlockTime Compare: %s %s(t)", lock.unlockTime(), unlockTime);
        
        assertEq(address(lock).balance, lock_initial_value, "balance not matched.");
        console.log("balance Compare: %s %s(t)", address(lock).balance, lock_initial_value);
    }
}