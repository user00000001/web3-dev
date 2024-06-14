// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import {APIConsumer} from "../src/APIConsumer.sol";
import {MockOracle} from "../src/test/MockOracle.sol";
import {MockLinkToken} from "../src/test/MockLinkToken.sol";
import {MockV3Aggregator} from "../src/test/MockV3Aggregator.sol";
import {VRFCoordinatorV2_5Mock} from "../src/test/VRFCoordinatorV2_5Mock.sol";

interface IAPIConsumer {
    event ChainlinkRequested(bytes32 indexed id);
    event ChainlinkFulfilled(bytes32 indexed id);
    event ChainlinkCancelled(bytes32 indexed id);
    event DataFullfilled(uint256 volume);
}

contract APIConsumerTestBase is Test, IAPIConsumer {
    uint8 public DECIMALS = 18;
    uint96 public BASE_FEE = 1e17;
    uint96 public GAS_PRICE_LINK = 1e9;
    int256 public INITIAL_PRICE = 2e20;
    int256 public WEI_PER_UNIT_LINK = 2e17;
    bytes32 public jobId = "29fa9aa13bf1468788b7cc4a500a45b8";

    MockOracle public oracle;
    MockLinkToken public linkToken;
    MockV3Aggregator public v3a;
    VRFCoordinatorV2_5Mock public vrfCoordinator;
    APIConsumer public apiconsumer;

    function setUp() public {
        linkToken = new MockLinkToken();
        oracle = new MockOracle(address(linkToken));
        v3a = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        vrfCoordinator = new VRFCoordinatorV2_5Mock(BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK);
        apiconsumer = new APIConsumer(address(oracle), jobId, BASE_FEE, address(linkToken));
        linkToken.transfer(address(apiconsumer), 100 ether);
    }

    function test_requestVolumeData() public {
        vm.expectEmit(false, true, true, true, address(apiconsumer));
        emit ChainlinkRequested(0);
        apiconsumer.requestVolumeData();
    }

    function test_volumedata_req_rsp() public {
        bytes32 requestId = apiconsumer.requestVolumeData();
        uint256 callbackValue = 777;
        oracle.fulfillOracleRequest(requestId, bytes32(callbackValue));
        uint256 volume = apiconsumer.volume();
        assertEq(volume, callbackValue, "request/response not matched.");
    }

    function test_volumedata_req_rsp_event() public {
        bytes32 requestId = apiconsumer.requestVolumeData();
        uint256 callbackValue = 777;
        vm.expectEmit(address(apiconsumer));
        emit DataFullfilled(callbackValue);
        oracle.fulfillOracleRequest(requestId, bytes32(callbackValue));
        uint256 volume = apiconsumer.volume();
        assertEq(volume, callbackValue, "event: request/response not matched.");
    }
}
