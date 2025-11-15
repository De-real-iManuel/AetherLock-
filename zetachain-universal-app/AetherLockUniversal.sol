// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsRequest.sol";

contract AetherLockUniversal is UniversalContract, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    IGatewayZEVM public gateway;
    address public treasury;
    uint256 public constant PROTOCOL_FEE = 10;
    
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;

    enum EscrowStatus { Created, Funded, PendingVerification, Verified, Released, Refunded, Disputed }

    struct Escrow {
        bytes32 escrowId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 feeAmount;
        EscrowStatus status;
        string sourceChain;
        string destinationChain;
        bytes32 chainlinkRequestId;
        bool verificationResult;
        string evidenceIpfsHash;
        uint256 expiry;
        bool disputeRaised;
    }

    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => bytes32) public chainlinkRequests;
    
    event EscrowCreated(bytes32 indexed escrowId, address buyer, address seller, uint256 amount);
    event ChainlinkVerificationRequested(bytes32 indexed escrowId, bytes32 requestId);
    event VerificationCompleted(bytes32 indexed escrowId, bool result);
    event FundsReleased(bytes32 indexed escrowId, address seller, uint256 amount);
    event FundsRefunded(bytes32 indexed escrowId, address buyer, uint256 amount);

    constructor(address _gateway, address _router, uint64 _subscriptionId, address _treasury) FunctionsClient(_router) {
        gateway = IGatewayZEVM(_gateway);
        subscriptionId = _subscriptionId;
        treasury = _treasury;
        donId = bytes32("fun-ethereum-sepolia-1");
    }

    function createEscrow(bytes32 escrowId, address seller, string memory sourceChain, string memory destinationChain, uint256 expiry) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(escrows[escrowId].buyer == address(0), "Escrow already exists");

        uint256 feeAmount = (msg.value * PROTOCOL_FEE) / 100;

        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            feeAmount: feeAmount,
            status: EscrowStatus.Funded,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            chainlinkRequestId: bytes32(0),
            verificationResult: false,
            evidenceIpfsHash: "",
            expiry: expiry,
            disputeRaised: false
        });

        emit EscrowCreated(escrowId, msg.sender, seller, msg.value);
    }

    function requestVerification(bytes32 escrowId, string memory evidenceIpfsHash, string memory source) external returns (bytes32) {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Invalid status");

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.addArgs([evidenceIpfsHash]);

        bytes32 requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);

        escrow.chainlinkRequestId = requestId;
        escrow.evidenceIpfsHash = evidenceIpfsHash;
        escrow.status = EscrowStatus.PendingVerification;
        chainlinkRequests[requestId] = escrowId;

        emit ChainlinkVerificationRequested(escrowId, requestId);
        return requestId;
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        bytes32 escrowId = chainlinkRequests[requestId];
        Escrow storage escrow = escrows[escrowId];

        if (err.length > 0) {
            escrow.status = EscrowStatus.Funded;
            return;
        }

        bool result = abi.decode(response, (bool));
        escrow.verificationResult = result;
        escrow.status = EscrowStatus.Verified;

        emit VerificationCompleted(escrowId, result);
    }

    function releaseFunds(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Verified, "Not verified");
        require(escrow.verificationResult, "Verification failed");

        uint256 sellerAmount = escrow.amount - escrow.feeAmount;
        escrow.status = EscrowStatus.Released;
        
        payable(escrow.seller).transfer(sellerAmount);
        payable(treasury).transfer(escrow.feeAmount);

        emit FundsReleased(escrowId, escrow.seller, sellerAmount);
    }

    function refundBuyer(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require((escrow.status == EscrowStatus.Verified && !escrow.verificationResult) || (escrow.status == EscrowStatus.Funded && block.timestamp > escrow.expiry), "Cannot refund");

        escrow.status = EscrowStatus.Refunded;
        payable(escrow.buyer).transfer(escrow.amount);

        emit FundsRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    function onCall(MessageContext calldata context, address zrc20, uint256 amount, bytes calldata message) external override {
        require(msg.sender == address(gateway), "Unauthorized");

        (bytes32 escrowId, address seller, uint256 expiry) = abi.decode(message, (bytes32, address, uint256));

        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            buyer: context.sender,
            seller: seller,
            amount: amount,
            feeAmount: (amount * PROTOCOL_FEE) / 100,
            status: EscrowStatus.Funded,
            sourceChain: "zetachain",
            destinationChain: "solana",
            chainlinkRequestId: bytes32(0),
            verificationResult: false,
            evidenceIpfsHash: "",
            expiry: expiry,
            disputeRaised: false
        });

        emit EscrowCreated(escrowId, context.sender, seller, amount);
    }

    function onRevert(RevertContext calldata context) external override {
        require(msg.sender == address(gateway), "Unauthorized");
        
        (bytes32 escrowId) = abi.decode(context.revertMessage, (bytes32));
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.buyer != address(0)) {
            escrow.status = EscrowStatus.Refunded;
            payable(escrow.buyer).transfer(escrow.amount);
            emit FundsRefunded(escrowId, escrow.buyer, escrow.amount);
        }
    }

    function raiseDispute(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Unauthorized");
        escrow.disputeRaised = true;
        escrow.status = EscrowStatus.Disputed;
    }

    function getEscrow(bytes32 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    receive() external payable {}
}
