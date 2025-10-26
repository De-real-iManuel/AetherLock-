const { PrismaClient } = require('@prisma/client');

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // User operations
  async createUser(walletAddress, role, zkMeProofHash = null) {
    return await this.prisma.user.create({
      data: {
        walletAddress,
        role,
        zkMeProofHash
      }
    });
  }

  async getUserByWallet(walletAddress) {
    return await this.prisma.user.findUnique({
      where: { walletAddress }
    });
  }

  // Escrow operations
  async createEscrow(buyerId, sellerId, amount, aiVerificationHash = null, ipfsHash = null) {
    return await this.prisma.escrow.create({
      data: {
        buyerId,
        sellerId,
        amount,
        aiVerificationHash,
        ipfsHash
      },
      include: {
        buyer: true,
        seller: true
      }
    });
  }

  async updateEscrowStatus(escrowId, status) {
    return await this.prisma.escrow.update({
      where: { id: escrowId },
      data: { status }
    });
  }

  async getEscrow(escrowId) {
    return await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        buyer: true,
        seller: true,
        transactions: true
      }
    });
  }

  // Transaction operations
  async createTransaction(escrowId, txHash) {
    return await this.prisma.transaction.create({
      data: {
        escrowId,
        txHash
      }
    });
  }

  async updateTransactionStatus(txHash, status) {
    return await this.prisma.transaction.update({
      where: { txHash },
      data: { status }
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = DatabaseService;