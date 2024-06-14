// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import {OurToken} from "../src/OurToken.sol";

interface IOurToken {
    event Transfer(address indexed, address indexed, uint256);
    event Approval(address indexed, address indexed, uint256);
}

contract OurTokenTestBase is Test {
    OurToken ourtoken;
    uint256 constant INIT_SUPPLY = 1e20;

    function setUp() public {
        ourtoken = new OurToken(INIT_SUPPLY);
    }
}

contract OurTokenConstructorTest is OurTokenTestBase {
    function test_supply() public view {
        assertTrue(INIT_SUPPLY == ourtoken.totalSupply(), "match supply.");
    }

    function test_name_and_symbol() public view {
        assertEq("OurToken", ourtoken.name(), "match name.");
        assertEq("OT", ourtoken.symbol(), "match symbol.");
    }
}

contract OurTokenTransferTest is OurTokenTestBase, IOurToken {
    function test_transfer() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        ourtoken.transfer(addr, tokens);
        assertTrue(ourtoken.balanceOf(addr) == tokens, "transfer amount match.");
    }

    function test_transfer_event() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        vm.expectEmit();
        emit Transfer(address(this), address(addr), tokens);
        ourtoken.transfer(addr, tokens);
    }
}

contract OurTokenAllowanceTest is OurTokenTestBase, IOurToken {
    function test_approve_to_other() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        ourtoken.approve(addr, tokens);
        vm.startPrank(addr);
        ourtoken.transferFrom(address(this), addr, tokens);
        vm.stopPrank();
        assertTrue(ourtoken.balanceOf(addr) == tokens, "transfer amount match.");
    }

    function test_un_approve_revert() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        // ourtoken.approve(addr, tokens);
        vm.startPrank(addr);
        vm.expectRevert(bytes("ERC20: insufficient allowance"));
        ourtoken.transferFrom(address(this), addr, tokens);
        vm.stopPrank();
    }

    function test_approve_event() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        vm.expectEmit(true, true, true, true, address(ourtoken));
        emit Approval(address(this), addr, tokens);
        ourtoken.approve(addr, tokens);
    }

    function test_allowance_check() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        ourtoken.approve(addr, tokens);
        assertTrue(ourtoken.allowance(address(this), addr) == tokens, "transfer amount match.");
    }

    function test_allowance_not_match_revert() public {
        uint256 tokens = 10 ether;
        address addr = makeAddr("an address");
        ourtoken.approve(addr, tokens);
        vm.startPrank(addr);
        vm.expectRevert("ERC20: insufficient allowance");
        ourtoken.transferFrom(address(this), addr, tokens * 2);
        vm.stopPrank();
    }
}
