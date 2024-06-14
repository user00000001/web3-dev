// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import {MockLinkToken} from "../src/test/MockLinkToken.sol";
import {MockV3Aggregator} from "../src/test/MockV3Aggregator.sol";
import {VRFCoordinatorV2_5Mock} from "../src/test/VRFCoordinatorV2_5Mock.sol";
import {RandomNumberConsumerV2Plus} from "../src/RandomNumberConsumerV2Plus.sol";

interface IRandomNumberConsumerV2Plus {
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint256 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        bytes extraArgs,
        address indexed sender
    );
    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256 outputSeed,
        uint256 indexed subId,
        uint96 payment,
        bool nativePayment,
        bool success,
        bool onlyPremium
    );
    event ConfigSet();
    event ReturnedRandomness(uint256[] randomWords);
}

contract RandomNumberConsumerV2PlusTestBase is Test, IRandomNumberConsumerV2Plus {
    uint8 public DECIMALS = 18;
    uint96 public BASE_FEE = 1e17;
    uint96 public GAS_PRICE_LINK = 1e9;
    int256 public INITIAL_PRICE = 2e20;
    int256 public WEI_PER_UNIT_LINK = 2e17;
    bool public nativePayment = false;
    bytes32 public keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

    MockLinkToken public linkToken;
    MockV3Aggregator public v3a;
    VRFCoordinatorV2_5Mock public vrfCoordinator;
    RandomNumberConsumerV2Plus public randomNumberConsumerV2Plus;

    function setUp() public {
        linkToken = new MockLinkToken();
        v3a = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        vrfCoordinator = new VRFCoordinatorV2_5Mock(BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK);
        uint256 subId = vrfCoordinator.createSubscription();

        randomNumberConsumerV2Plus =
            new RandomNumberConsumerV2Plus(subId, address(vrfCoordinator), keyHash, nativePayment);
        vrfCoordinator.addConsumer(subId, address(randomNumberConsumerV2Plus));
        linkToken.transfer(address(randomNumberConsumerV2Plus), 100 ether);
        vrfCoordinator.fundSubscription(subId, 100 ether);
    }

    function test_requestRandomWords_event() public {
        vm.expectEmit(false, false, false, false, address(vrfCoordinator));
        emit RandomWordsRequested(0, 0, 0, 0, 0, 0, 0, "", address(0)); // params not know yet.
        randomNumberConsumerV2Plus.requestRandomWords();
    }

    function test_requestRandomWords() public {
        randomNumberConsumerV2Plus.requestRandomWords();
        uint256 requestId = randomNumberConsumerV2Plus.s_requestId();
        uint256[] memory randomwordsPlaceHolder = new uint256[](2); 
        vm.expectEmit(false, false, false, false, address(randomNumberConsumerV2Plus));
        emit ReturnedRandomness(randomwordsPlaceHolder);
        vrfCoordinator.fulfillRandomWords(requestId, address(randomNumberConsumerV2Plus));
        uint256 firstRandomNumber = randomNumberConsumerV2Plus.s_randomWords(0);
        uint256 secondRandomNumber = randomNumberConsumerV2Plus.s_randomWords(1);
        assertGt(firstRandomNumber, 0, "First random number is greather than zero");
        assertGt(secondRandomNumber, 0, "Second random number is greather than zero");
    }
}
