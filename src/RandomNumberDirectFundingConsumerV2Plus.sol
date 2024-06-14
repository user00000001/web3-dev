// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {VRFV2PlusWrapperConsumerBase} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract RandomNumberDirectFundingConsumerV2Plus is VRFV2PlusWrapperConsumerBase, ConfirmedOwner {
    event RequestSent(uint256 requestId, uint32 numWords, uint256 paid);
    event RequestFulfilled(uint256 reqeustId, uint256[] randomWords, uint256 payment);

    error InsufficientFunds(uint256 balance, uint256 paid);
    error RequestNotFound(uint256 requestId);
    error LinkTransferError(address sender, address receiver, uint256 amount);

    struct RequestStatus {
        uint256 paid; // amount paid in link
        bool fulfilled; // whether the request has been successfully fulfilled
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests;

    uint256[] public requestIds;
    uint256 public lastRequestId;
    bool private s_nativePayment;

    constructor(address _wrapperAddress, bool nativePayment)
        ConfirmedOwner(msg.sender)
        VRFV2PlusWrapperConsumerBase(_wrapperAddress)
    {
        s_nativePayment = nativePayment;
    }

    function requestRandomWords(uint32 _callbackGasLimit, uint16 _requestConfirmations, uint32 _numWords)
        external
        onlyOwner
        returns (uint256)
    {
        (uint256 requestId, uint256 reqPrice) = requestRandomness(
            _callbackGasLimit,
            _requestConfirmations,
            _numWords,
            VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: s_nativePayment}))
        );
        // uint256 paid = i_vrfV2PlusWrapper.calculateRequestPrice(_callbackGasLimit, _numWords);
        uint256 paid = reqPrice;
        uint256 balance = i_linkToken.balanceOf(address(this));
        if (balance < paid) revert InsufficientFunds(balance, paid);
        s_requests[requestId] = RequestStatus({paid: paid, randomWords: new uint256[](0), fulfilled: false});
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, _numWords, paid);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        RequestStatus storage request = s_requests[_requestId];
        if (request.paid == 0) revert RequestNotFound(_requestId);
        request.fulfilled = true;
        request.randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords, request.paid);
    }

    function getNumberOfRequests() external view returns (uint256) {
        return requestIds.length;
    }

    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (uint256 paid, bool fulfilled, uint256[] memory randomWords)
    {
        RequestStatus memory request = s_requests[_requestId];
        if (request.paid == 0) revert RequestNotFound(_requestId);
        return (request.paid, request.fulfilled, request.randomWords);
    }

    function withdrawLink(address _receiver) public onlyOwner {
        bool success = i_linkToken.transfer(_receiver, i_linkToken.balanceOf(address(this)));
        if (!success) revert LinkTransferError(msg.sender, _receiver, i_linkToken.balanceOf(address(this)));
    }
}
