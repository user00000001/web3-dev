// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title The RandomNumberConsumerV2Plus contract
 * @author
 * @notice A contract that gets random values from Chainlink VRF V2_5(V2Plus)
 */
contract RandomNumberConsumerV2Plus is VRFConsumerBaseV2Plus {
    IVRFCoordinatorV2Plus immutable COORDINATOR;

    uint256 immutable s_subscriptionId;
    bytes32 immutable s_keyHash;

    uint32 constant CALLBACK_GAS_LIMIT = 1e5;
    uint16 constant REQUEST_CONFIRMATIONS = 3;

    uint32 constant NUM_WORDS = 2;
    uint256[] public s_randomWords;
    uint256 public s_requestId;
    bool private s_nativePayment;
    address s_owner;

    event ReturnedRandomness(uint256[] randomWords);

    /**
     * @notice Constructor inherits VRFConsumerBaseV2Plus
     *
     * @param subscriptionId - the subscription ID that this contract uses for funding requests
     * @param vrfCoordinator -
     * @param keyHash - the gas lane to use, which specifies the maximum gas price to bump to
     * @param nativePayment - VRF V2.5 new param, indicate payment paied by ETH or LINK.
     */
    constructor(uint256 subscriptionId, address vrfCoordinator, bytes32 keyHash, bool nativePayment)
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        COORDINATOR = IVRFCoordinatorV2Plus(vrfCoordinator);
        s_keyHash = keyHash;
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
        s_nativePayment = nativePayment;
    }

    /**
     * @notice Request randomness
     * Assumes the subscription is funded sufficiently; "Words" refers to unit of data in Computer Science
     */
    function requestRandomWords() external onlyOwner {
        s_requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: s_nativePayment}))
            })
        );
    }

    /**
     * @notice Callback function used by VRF Coordinator
     *
     * param requestId - id of request
     * @param randomWords - array of random results from VRF Coordinator
     */
    function fulfillRandomWords(uint256, /* requestId */ uint256[] calldata randomWords) internal override {
        s_randomWords = randomWords;
        emit ReturnedRandomness(randomWords);
    }

    // modifier onlyOwner() { // already implemented in new version.
    //     require(msg.sender == s_owner);
    //     _;
    // }
}
