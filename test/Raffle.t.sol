// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import {
    Raffle,
    Raffle__NotEnoughETHEntered,
    Raffle__TransferFailed,
    Raffle__NotOpen,
    Raffle__UpkeepNotNeeded
} from "../src/Raffle.sol";
import {VRFCoordinatorV2Mock} from "../src/test/VRFCoordinatorV2Mock.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

interface IRaffleEvent {
    event RaffleEnter(address);
    event RequestedRaffleWinner(uint256 requestId);
    event WinnerPicked(address);
}

contract RaffleTestBase is Test {
    uint96 public constant BASE_FEE = 0.25 ether;
    uint96 public constant GAS_PRICE_LINK = 1e9;
    uint256 public entranceFee = 0.01 ether;
    bytes32 public gasLane = bytes32(bytes("787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"));
    uint32 public callbackGasLimit = 500000;
    uint256 public interval = 30;

    uint64 public subId;
    Raffle raffle;
    VRFCoordinatorV2Mock vrfCoordinator;

    receive() external payable {}

    function setUp() public {
        vrfCoordinator = new VRFCoordinatorV2Mock(BASE_FEE, GAS_PRICE_LINK);
        subId = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(subId, 30 ether);
        raffle = new Raffle(address(vrfCoordinator), entranceFee, gasLane, subId, callbackGasLimit, interval);
        vrfCoordinator.addConsumer(subId, address(raffle));
    }
}

contract RaffleContructorTest is RaffleTestBase {
    function test_raffleState() public view {
        assertTrue(raffle.getRaffleState() == Raffle.RaffleState.OPEN, "raffle state not right.");
    }

    function test_raffleInterval() public view {
        assertTrue(raffle.getInterval() == interval, "raffle interval not right.");
    }
}

contract RaffleEnterRaffleTest is RaffleTestBase, IRaffleEvent {
    function test_pay_not_enough() public {
        vm.expectRevert(Raffle__NotEnoughETHEntered.selector);
        raffle.enterRaffle();
    }

    function test_enter_then_record() public {
        raffle.enterRaffle{value: entranceFee}();
        address p0 = raffle.getPlayer(0);
        assertTrue(p0 == address(this), "p0 not matched.");
    }

    function test_event_on_enter() public {
        vm.expectEmit(address(raffle));
        emit RaffleEnter(address(this));
        raffle.enterRaffle{value: entranceFee}();
    }

    function test_allow_entrance_when_raffle_is_calculating() public {
        raffle.enterRaffle{value: entranceFee}();
        skip(interval + 1);
        vm.roll(10);
        raffle.performUpkeep("");
        vm.expectRevert(Raffle__NotOpen.selector);
        raffle.enterRaffle{value: entranceFee}();
    }
}

contract RaffleCheckUpkeepTest is RaffleTestBase {
    function test_check_balance() public {
        skip(interval + 1);
        vm.roll(10);
        (bool upcheckNeeded,) = raffle.checkUpkeep("");
        assertFalse(upcheckNeeded, "checkUpkeep not matched");
    }

    function test_check_state() public {
        raffle.enterRaffle{value: entranceFee}();
        skip(interval + 1);
        vm.roll(10);
        raffle.performUpkeep("");
        Raffle.RaffleState rafflestate = raffle.getRaffleState();
        assertTrue(rafflestate == Raffle.RaffleState.CALCULATING, "raffle state not caculating");
        (bool upcheckNeeded,) = raffle.checkUpkeep("");
        assertFalse(upcheckNeeded, "checkUpkeep not matched");
    }

    function test_time_point_not_reach() public {
        raffle.enterRaffle{value: entranceFee}();
        skip(interval - 1);
        vm.roll(10);
        (bool upcheckNeeded,) = raffle.checkUpkeep("");
        assertFalse(upcheckNeeded, "checkUpkeep time not matched");
    }

    function test_checkUpkeep_finish() public {
        raffle.enterRaffle{value: entranceFee}();
        raffle.enterRaffle{value: entranceFee}();
        skip(interval + 1);
        vm.roll(10);
        (bool upcheckNeeded,) = raffle.checkUpkeep("");
        assertTrue(upcheckNeeded, "checkUpkeep matches.");
        uint256 players_len = raffle.getNumberOfPlayers();
        assertEq(players_len, 2, "Not match the amount of players");
        // uint256 balance = raffle.getOwnEth();
        (bool success, bytes memory bm) =
            address(raffle).staticcall(abi.encode(bytes4(keccak256(bytes("getOwnEth()")))));
        uint256 balance = abi.decode(bm, (uint256));
        if (success) {
            assertEq(balance, address(raffle).balance, "checkUpkeep not matched");
        }
    }
}

contract RafflePerformUpkeepTest is RaffleTestBase, IRaffleEvent {
    function test_performUpkeep() public {
        raffle.enterRaffle{value: entranceFee}();
        skip(interval + 1);
        vm.roll(10);
        vm.expectEmit(true, true, true, false, address(raffle));
        emit RequestedRaffleWinner(0); // requestId not known yet.
        raffle.performUpkeep("");
    }

    function test_revert_upkeepNotNeeded() public {
        vm.expectRevert(abi.encodeWithSelector(Raffle__UpkeepNotNeeded.selector, 0, 0, 0));
        raffle.performUpkeep("");
    }

    function test_performUpkeep_state() public {
        vm.recordLogs(); // record emited logs
        raffle.enterRaffle{value: entranceFee}();
        skip(interval + 1);
        vm.roll(10);
        vm.expectEmit(true, true, true, false, address(raffle));
        emit RequestedRaffleWinner(0); // requestId not known yet.
        // Your last read consumed the recorded logs,
        vm.getRecordedLogs();
        raffle.performUpkeep(""); // will emit RequestedRaffleWinner event
        Vm.Log[] memory entries = vm.getRecordedLogs();
        uint256 requestId = abi.decode(entries[entries.length - 1].data, (uint256)); // parse event params.
        assertEq(requestId, 1);
        Raffle.RaffleState rafflestate = raffle.getRaffleState();
        assertTrue(rafflestate == Raffle.RaffleState.CALCULATING, "state not matched");
    }
}

contract RaffleFulfillRandomWordsTest is RaffleTestBase, IRaffleEvent {
    using Strings for address;

    function test_checkRevert() public {
        vm.expectRevert(bytes("nonexistent request"));
        vrfCoordinator.fulfillRandomWords(0, address(raffle));
        vm.expectRevert(bytes("nonexistent request"));
        vrfCoordinator.fulfillRandomWords(1, address(raffle));
    }

    function test_reset_raffle() public {
        uint256 account_counts = 3;
        address[] memory accounts = new address[](account_counts);
        for (uint256 i = 0; i < account_counts; i++) {
            address user = makeAddr(string(abi.encodePacked(i)));
            accounts[i] = user;
            vm.deal(user, 1000 ether);
            vm.startPrank(user);
            raffle.enterRaffle{value: entranceFee}();
            vm.stopPrank();
        }
        uint256 startingTimeStamp = raffle.getLatestTimeStamp();
        skip(interval + 1);
        vm.roll(10);
        vm.recordLogs();
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        uint256 requestId = abi.decode(entries[entries.length - 1].data, (uint256)); // parse event params.
        vm.expectEmit(true, true, true, false, address(raffle));
        emit WinnerPicked(address(0)); // don't know the exact winer right now.
        vrfCoordinator.fulfillRandomWords(requestId, address(raffle));
        Vm.Log[] memory entries1 = vm.getRecordedLogs();
        address winner = abi.decode(entries1[entries1.length - 2].data, (address));
        bytes memory bm =
            abi.encodePacked("Mock Winner: ", winner.toHexString(), " not match with: ", accounts[2].toHexString());
        // bytes memory bm = abi.encodePacked("Mock Winner: ", winner, " not match with: ", accounts[2], " "); // bad decode
        string memory info = string(bm);
        // string memory info = abi.decode(bm, (string)); // decode not match with encodePacked
        assertEq(winner, accounts[2], info);
        assertGt(raffle.getLatestTimeStamp(), startingTimeStamp, "wrong timestamp");
    }
}
