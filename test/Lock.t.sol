// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {Lock} from "../contracts/Lock.sol";

contract LockTestBase is Test {
    Lock public lock;
    uint256 public unlockTime = block.timestamp + 1 days;
    uint256 public constant lock_initial_value = 1e9 wei;

    receive() external payable {}

    function setUp() public {
        lock = new Lock{value: lock_initial_value}(unlockTime);
    }
}

contract LockConstructorTest is LockTestBase {
    function test_constructor_unlockTime() public view {
        assertEq(lock.unlockTime(), unlockTime, "unlockTime not matched.");
        console.log("unlockTime Compare: %s %s(t)", lock.unlockTime(), unlockTime);
    }

    function test_constructor_owner() public view {
        assertEq(lock.owner(), address(this), "owner not matched.");
        console.log("owner Compare: %s %s(t)", lock.owner(), address(this));
    }

    function test_constructor_balance() public view {
        assertEq(address(lock).balance, lock_initial_value, "balance not matched.");
        console.log("balance Compare: %s %s(t)", address(lock).balance, lock_initial_value);
    }

    function test_constructor_unlockTime_failure() public {
        console.log("%s", block.timestamp); // 1s
        // skip(29); // this costs 29 seconds
        vm.warp(unlockTime); // block.timestamp is set to unlockTime
        console.log("%s", block.timestamp); // 30s
        uint256 passTime = block.timestamp - 30 seconds; // negative will be failed: [FAIL. Reason: Arithmetic over/underflow]
        vm.expectRevert("Unlock time should be in the future");
        new Lock{value: 1}(passTime);
    }
}

contract LockWithdrawTest is LockTestBase {
    function test_withdraw_validation_unlockTime() public {
        vm.expectRevert("You can't withdraw yet");
        lock.withdraw();
    }

    function test_withdraw_validation_new_owner() public {
        skip(unlockTime); // reach the unlockTime point.
        address new_user = makeAddr("new_user");
        vm.prank(new_user); // exchange caller
        vm.expectRevert("You aren't the owner");
        lock.withdraw();
    }

    function test_withdraw_validation_owner() public {
        skip(unlockTime);
        vm.expectCall(
            address(lock),
            // abi.encodeWithSelector(lock.withdraw.selector)
            // abi.encodeCall(lock.withdraw, ())
            // abi.encodeWithSignature("withdraw()")
            // abi.encodeWithSelector(bytes4(keccak256(abi.encodePacked("withdraw()"))))
            abi.encodeWithSelector(bytes4(keccak256(bytes("withdraw()"))))
        );
        lock.withdraw();
    }
}

contract LockEventTest is LockTestBase {
    function test_event() public {
        // skip(unlockTime);
        vm.warp(unlockTime);
        // vm.expectEmit();
        vm.expectEmit(address(lock));
        emit Lock.Withdrawal(lock_initial_value, block.timestamp);
        lock.withdraw();
    }
}
