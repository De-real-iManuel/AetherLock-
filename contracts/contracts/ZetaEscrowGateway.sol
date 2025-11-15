// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGatewayZEVM {
    function call(bytes memory receiver, address zrc20, bytes calldata message) external;
}

interface IUniversalContract {
    struct MessageContext {
        address sender;
    }
    
    struct RevertContext {
        bytes revertMessage;
    }
}

contract ZetaEscrowGateway is IUniversalContract {
    IGatewayZEVM public gateway;
    address public treasury;
    uint256 public constant PROTOCOL_FEE = 10;

    enum EscrowStatus { Created, Funded, PendingVerification, Verified, Released, Refunded }

    struct Escrow {
        bytes32 escrowId;
        bytes solanaProgramId;
        address client;
        address freelancer;
        uint256 amount;
        string metadata;
        EscrowStatus status;
        bytes32 chainlinkRequestId;
    }

    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => bytes32) public solanaToZetaMapping;

    event EscrowCreated(bytes32 indexed escrowId, address client, address freelancer, uint256 amount);
    event EscrowReleased(bytes32 indexed escrowId, uint256 amount);
    event VerificationRequested(bytes32 indexed escrowId, bytes32 requestId);
    event VerificationCompleted(bytes32 indexed escrowId, bool result);

    constructor(address _gateway, address _treasury) {
        gateway = IGatewayZEVM(_gateway);
        treasury = _treasury;
    }

    function createEscrow(bytes memory solanaProgramId, address client, address freelancer, uint256 amount, string memory metadata) external payable {
        require(msg.value == amount, "Incorrect amount");
        bytes32 escrowId = keccak256(abi.encodePacked(client, freelancer, block.timestamp));

        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            solanaProgramId: solanaProgramId,
            client: client,
            freelancer: freelancer,
            amount: amount,
            metadata: metadata,
            status: EscrowStatus.Funded,
            chainlinkRequestId: bytes32(0)
        });

        emit EscrowCreated(escrowId, client, freelancer, amount);
    }

    function releaseFunds(bytes memory solanaEscrowId) external {
        bytes32 escrowId = solanaToZetaMapping[keccak256(solanaEscrowId)];
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Verified, "Not verified");

        uint256 fee = (escrow.amount * PROTOCOL_FEE) / 100;
        uint256 freelancerAmount = escrow.amount - fee;

        escrow.status = EscrowStatus.Released;
        payable(escrow.freelancer).transfer(freelancerAmount);
        payable(treasury).transfer(fee);

        emit EscrowReleased(escrowId, freelancerAmount);
    }

    function handleCrossChainCall(bytes32 escrowId, bool verificationResult) external {
        Escrow storage escrow = escrows[escrowId];
        escrow.status = verificationResult ? EscrowStatus.Verified : EscrowStatus.Funded;
        emit VerificationCompleted(escrowId, verificationResult);
    }

    function onCall(MessageContext calldata context, address zrc20, uint256 amount, bytes calldata message) external {
        require(msg.sender == address(gateway), "Unauthorized");
        (bytes32 escrowId, address freelancer, string memory metadata) = abi.decode(message, (bytes32, address, string));
        
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            solanaProgramId: "",
            client: context.sender,
            freelancer: freelancer,
            amount: amount,
            metadata: metadata,
            status: EscrowStatus.Funded,
            chainlinkRequestId: bytes32(0)
        });

        emit EscrowCreated(escrowId, context.sender, freelancer, amount);
    }

    function onRevert(RevertContext calldata context) external {
        require(msg.sender == address(gateway), "Unauthorized");
        bytes32 escrowId = abi.decode(context.revertMessage, (bytes32));
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.client != address(0)) {
            escrow.status = EscrowStatus.Refunded;
            payable(escrow.client).transfer(escrow.amount);
        }
    }

    receive() external payable {}
}
