// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainlinkVerifier {
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    address public gateway;
    address public router;

    struct VerificationRequest {
        bytes32 escrowId;
        string prompt;
        string fileCID;
        address requester;
    }

    mapping(bytes32 => VerificationRequest) public requests;

    event VerificationRequested(bytes32 indexed requestId, bytes32 escrowId, string prompt, string fileCID);
    event VerificationComplete(bytes32 indexed requestId, bool passed, uint8 confidence, string feedback);

    constructor(address _router, bytes32 _donId, uint64 _subscriptionId, address _gateway) {
        router = _router;
        donId = _donId;
        subscriptionId = _subscriptionId;
        gateway = _gateway;
    }

    function requestVerification(string calldata prompt, string calldata fileCID, bytes32 escrowId) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(escrowId, prompt, fileCID, block.timestamp));
        
        requests[requestId] = VerificationRequest({
            escrowId: escrowId,
            prompt: prompt,
            fileCID: fileCID,
            requester: msg.sender
        });

        emit VerificationRequested(requestId, escrowId, prompt, fileCID);
        return requestId;
    }

    function fulfillRequest(bytes32 requestId, bool passed, uint8 confidence, string memory feedback) external {
        require(msg.sender == router, "Only router");
        VerificationRequest memory req = requests[requestId];
        
        emit VerificationComplete(requestId, passed, confidence, feedback);
        
        (bool success,) = gateway.call(abi.encodeWithSignature("handleCrossChainCall(bytes32,bool)", req.escrowId, passed));
        require(success, "Gateway call failed");
    }
}
