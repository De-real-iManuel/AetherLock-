import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DatabaseService {
  // ==================== User Operations ====================
  async createUser(walletAddress, role = null) {
    return await prisma.user.create({
      data: { walletAddress, role }
    });
  }

  async getUserByWallet(walletAddress) {
    return await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        buyerEscrows: true,
        sellerEscrows: true
      }
    });
  }

  async getUserById(id) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async updateUser(walletAddress, data) {
    return await prisma.user.update({
      where: { walletAddress },
      data
    });
  }

  async updateUserKYC(walletAddress, zkMeSessionId, zkMeVerified = false, zkMeLevel = null) {
    return await prisma.user.update({
      where: { walletAddress },
      data: { zkMeSessionId, zkMeVerified, zkMeLevel }
    });
  }

  async updateUserRole(walletAddress, role) {
    return await prisma.user.update({
      where: { walletAddress },
      data: { role }
    });
  }

  async updateUserProfile(walletAddress, profileData) {
    const { name, avatar, skills } = profileData;
    return await prisma.user.update({
      where: { walletAddress },
      data: {
        name,
        avatar,
        skills: skills ? JSON.stringify(skills) : undefined
      }
    });
  }

  async updateUserSettings(walletAddress, settings) {
    return await prisma.user.update({
      where: { walletAddress },
      data: {
        settings: JSON.stringify(settings)
      }
    });
  }

  async updateUserStats(walletAddress, stats) {
    return await prisma.user.update({
      where: { walletAddress },
      data: stats
    });
  }

  // ==================== Escrow Operations ====================
  async createEscrow(data) {
    return await prisma.escrow.create({
      data: {
        escrowId: data.escrowId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        amount: data.amount,
        currency: data.currency || 'SOL',
        feeAmount: data.feeAmount,
        title: data.title,
        description: data.description,
        milestones: data.milestones ? JSON.stringify(data.milestones) : null,
        sourceChain: data.sourceChain || 'solana',
        destinationChain: data.destinationChain,
        deadline: data.deadline,
        expiresAt: data.expiresAt
      }
    });
  }

  async getEscrow(escrowId) {
    return await prisma.escrow.findUnique({
      where: { escrowId },
      include: {
        buyer: true,
        seller: true,
        transactions: true,
        submissions: true,
        disputes: true,
        messages: true
      }
    });
  }

  async getEscrowById(id) {
    return await prisma.escrow.findUnique({
      where: { id },
      include: {
        buyer: true,
        seller: true,
        transactions: true,
        submissions: true,
        disputes: true
      }
    });
  }

  async updateEscrow(escrowId, data) {
    return await prisma.escrow.update({
      where: { escrowId },
      data
    });
  }

  async updateEscrowStatus(escrowId, status) {
    return await prisma.escrow.update({
      where: { escrowId },
      data: { status }
    });
  }

  async updateEscrowVerification(escrowId, chainlinkRequestId, evidenceIpfsHash) {
    return await prisma.escrow.update({
      where: { escrowId },
      data: {
        chainlinkRequestId,
        evidenceIpfsHash,
        status: 'PENDING_VERIFICATION'
      }
    });
  }

  async completeVerification(escrowId, verificationResult, aiVerificationHash) {
    return await prisma.escrow.update({
      where: { escrowId },
      data: {
        verificationResult,
        aiVerificationHash,
        status: 'VERIFIED'
      }
    });
  }

  async assignFreelancer(escrowId, sellerId) {
    return await prisma.escrow.update({
      where: { escrowId },
      data: {
        sellerId,
        status: 'active'
      }
    });
  }

  async getUserEscrows(walletAddress, role = 'buyer') {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return [];

    return await prisma.escrow.findMany({
      where: role === 'buyer' ? { buyerId: user.id } : { sellerId: user.id },
      include: {
        buyer: true,
        seller: true,
        transactions: true,
        submissions: true,
        disputes: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async listEscrows(filters = {}, pagination = {}) {
    const { status, minAmount, maxAmount, currency, clientAddress, freelancerAddress } = filters;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = {};
    if (status) where.status = status;
    if (minAmount) where.amount = { ...where.amount, gte: minAmount };
    if (maxAmount) where.amount = { ...where.amount, lte: maxAmount };
    if (currency) where.currency = currency;
    if (clientAddress) {
      const user = await this.getUserByWallet(clientAddress);
      if (user) where.buyerId = user.id;
    }
    if (freelancerAddress) {
      const user = await this.getUserByWallet(freelancerAddress);
      if (user) where.sellerId = user.id;
    }

    const [escrows, total] = await Promise.all([
      prisma.escrow.findMany({
        where,
        include: {
          buyer: true,
          seller: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.escrow.count({ where })
    ]);

    return {
      escrows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAvailableEscrows(filters = {}) {
    const { minAmount, maxAmount, currency } = filters;
    
    const where = {
      status: 'pending',
      sellerId: null
    };
    
    if (minAmount) where.amount = { ...where.amount, gte: minAmount };
    if (maxAmount) where.amount = { ...where.amount, lte: maxAmount };
    if (currency) where.currency = currency;

    return await prisma.escrow.findMany({
      where,
      include: {
        buyer: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ==================== Transaction Operations ====================
  async createTransaction(escrowId, txHash, chain, type, amount = null) {
    return await prisma.transaction.create({
      data: {
        escrowId,
        txHash,
        chain,
        type,
        amount
      }
    });
  }

  async getTransaction(txHash) {
    return await prisma.transaction.findUnique({
      where: { txHash },
      include: {
        escrow: true
      }
    });
  }

  async updateTransactionStatus(txHash, status, blockNumber = null) {
    return await prisma.transaction.update({
      where: { txHash },
      data: { status, blockNumber }
    });
  }

  async getTransactionsByEscrow(escrowId) {
    return await prisma.transaction.findMany({
      where: { escrowId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserTransactions(walletAddress, limit = 50) {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return [];

    const escrows = await prisma.escrow.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ]
      },
      select: { id: true }
    });

    const escrowIds = escrows.map(e => e.id);

    return await prisma.transaction.findMany({
      where: {
        escrowId: { in: escrowIds }
      },
      include: {
        escrow: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // ==================== Submission Operations ====================
  async createSubmission(data) {
    return await prisma.submission.create({
      data: {
        escrowId: data.escrowId,
        freelancerAddress: data.freelancerAddress,
        description: data.description,
        evidence: data.evidence ? JSON.stringify(data.evidence) : null,
        status: data.status || 'pending'
      }
    });
  }

  async getSubmission(id) {
    return await prisma.submission.findUnique({
      where: { id },
      include: {
        escrow: true,
        user: true
      }
    });
  }

  async getSubmissionsByEscrow(escrowId) {
    return await prisma.submission.findMany({
      where: { escrowId },
      include: {
        user: true
      },
      orderBy: { submittedAt: 'desc' }
    });
  }

  async updateSubmission(id, data) {
    return await prisma.submission.update({
      where: { id },
      data
    });
  }

  async updateSubmissionStatus(id, status, aiVerification = null) {
    return await prisma.submission.update({
      where: { id },
      data: {
        status,
        aiVerification: aiVerification ? JSON.stringify(aiVerification) : undefined
      }
    });
  }

  // ==================== Message Operations ====================
  async createMessage(data) {
    return await prisma.message.create({
      data: {
        escrowId: data.escrowId,
        senderId: data.senderId,
        senderRole: data.senderRole,
        content: data.content
      }
    });
  }

  async getMessage(id) {
    return await prisma.message.findUnique({
      where: { id }
    });
  }

  async getMessagesByEscrow(escrowId, limit = 100) {
    return await prisma.message.findMany({
      where: { escrowId },
      orderBy: { createdAt: 'asc' },
      take: limit
    });
  }

  async markMessageAsRead(id) {
    return await prisma.message.update({
      where: { id },
      data: { read: true }
    });
  }

  async markMessagesAsRead(escrowId, userId) {
    return await prisma.message.updateMany({
      where: {
        escrowId,
        senderId: { not: userId },
        read: false
      },
      data: { read: true }
    });
  }

  async getUnreadMessageCount(escrowId, userId) {
    return await prisma.message.count({
      where: {
        escrowId,
        senderId: { not: userId },
        read: false
      }
    });
  }

  // ==================== Dispute Operations ====================
  async createDispute(data) {
    return await prisma.dispute.create({
      data: {
        escrowId: data.escrowId,
        initiatedBy: data.initiatedBy,
        initiatorAddress: data.initiatorAddress,
        reason: data.reason,
        evidence: data.evidence ? JSON.stringify(data.evidence) : null,
        deadline: data.deadline
      }
    });
  }

  async getDispute(id) {
    return await prisma.dispute.findUnique({
      where: { id },
      include: {
        escrow: true,
        user: true
      }
    });
  }

  async getDisputesByEscrow(escrowId) {
    return await prisma.dispute.findMany({
      where: { escrowId },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDispute(id, data) {
    return await prisma.dispute.update({
      where: { id },
      data
    });
  }

  async resolveDispute(id, resolution) {
    return await prisma.dispute.update({
      where: { id },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date()
      }
    });
  }

  async getActiveDisputes() {
    return await prisma.dispute.findMany({
      where: {
        status: { in: ['open', 'under_review'] }
      },
      include: {
        escrow: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ==================== Notification Operations ====================
  async createNotification(data) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl
      }
    });
  }

  async getNotification(id) {
    return await prisma.notification.findUnique({
      where: { id }
    });
  }

  async getUserNotifications(userId, limit = 50) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async markNotificationAsRead(id) {
    return await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }

  async markAllNotificationsAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    });
  }

  async getUnreadNotificationCount(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  }

  async deleteNotification(id) {
    return await prisma.notification.delete({
      where: { id }
    });
  }

  // ==================== Statistics & Aggregations ====================
  async getUserStats(walletAddress) {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return null;

    const [totalEscrows, completedEscrows, totalVolume, asFreelancer, asClient] = await Promise.all([
      prisma.escrow.count({
        where: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }]
        }
      }),
      prisma.escrow.count({
        where: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }],
          status: 'RELEASED'
        }
      }),
      prisma.escrow.aggregate({
        where: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }],
          status: 'RELEASED'
        },
        _sum: { amount: true }
      }),
      prisma.escrow.aggregate({
        where: {
          sellerId: user.id,
          status: 'RELEASED'
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.escrow.aggregate({
        where: {
          buyerId: user.id,
          status: 'RELEASED'
        },
        _sum: { amount: true },
        _count: true
      })
    ]);

    return {
      totalEscrows,
      completedEscrows,
      successRate: totalEscrows > 0 ? (completedEscrows / totalEscrows) * 100 : 0,
      totalVolume: totalVolume._sum.amount || 0,
      totalEarned: asFreelancer._sum.amount || 0,
      totalSpent: asClient._sum.amount || 0,
      completedAsFreelancer: asFreelancer._count || 0,
      completedAsClient: asClient._count || 0,
      trustScore: user.trustScore
    };
  }

  async getClientDashboardStats(walletAddress) {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return null;

    const [activeEscrows, totalSpent, pendingPayments, disputes] = await Promise.all([
      prisma.escrow.count({
        where: {
          buyerId: user.id,
          status: { in: ['active', 'ai_reviewing'] }
        }
      }),
      prisma.escrow.aggregate({
        where: {
          buyerId: user.id,
          status: 'RELEASED'
        },
        _sum: { amount: true }
      }),
      prisma.escrow.aggregate({
        where: {
          buyerId: user.id,
          status: { in: ['active', 'ai_reviewing'] }
        },
        _sum: { amount: true }
      }),
      prisma.dispute.count({
        where: {
          initiatorAddress: walletAddress,
          status: { in: ['open', 'under_review'] }
        }
      })
    ]);

    return {
      activeEscrows,
      totalSpent: totalSpent._sum.amount || 0,
      pendingPayments: pendingPayments._sum.amount || 0,
      activeDisputes: disputes
    };
  }

  async getFreelancerDashboardStats(walletAddress) {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return null;

    const [activeJobs, totalEarned, pendingEarnings, availableTasks, successRate] = await Promise.all([
      prisma.escrow.count({
        where: {
          sellerId: user.id,
          status: { in: ['active', 'ai_reviewing'] }
        }
      }),
      prisma.escrow.aggregate({
        where: {
          sellerId: user.id,
          status: 'RELEASED'
        },
        _sum: { amount: true }
      }),
      prisma.escrow.aggregate({
        where: {
          sellerId: user.id,
          status: { in: ['active', 'ai_reviewing'] }
        },
        _sum: { amount: true }
      }),
      prisma.escrow.count({
        where: {
          status: 'pending',
          sellerId: null
        }
      }),
      prisma.escrow.findMany({
        where: {
          sellerId: user.id,
          status: { in: ['RELEASED', 'completed'] }
        },
        select: { status: true }
      })
    ]);

    const completedJobs = successRate.length;
    const successfulJobs = successRate.filter(e => e.status === 'RELEASED' || e.status === 'completed').length;

    return {
      activeJobs,
      totalEarned: totalEarned._sum.amount || 0,
      pendingEarnings: pendingEarnings._sum.amount || 0,
      availableTasks,
      completedJobs,
      successRate: completedJobs > 0 ? (successfulJobs / completedJobs) * 100 : 0
    };
  }

  async getTransactionHistory(walletAddress, days = 30) {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const escrows = await prisma.escrow.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ]
      },
      select: { id: true }
    });

    const escrowIds = escrows.map(e => e.id);

    return await prisma.transaction.findMany({
      where: {
        escrowId: { in: escrowIds },
        createdAt: { gte: startDate }
      },
      include: {
        escrow: {
          include: {
            buyer: true,
            seller: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getEscrowsByDateRange(startDate, endDate) {
    return await prisma.escrow.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        buyer: true,
        seller: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPlatformStats() {
    const [totalUsers, totalEscrows, totalVolume, activeEscrows, completedEscrows] = await Promise.all([
      prisma.user.count(),
      prisma.escrow.count(),
      prisma.escrow.aggregate({
        where: { status: 'RELEASED' },
        _sum: { amount: true }
      }),
      prisma.escrow.count({
        where: { status: { in: ['active', 'ai_reviewing'] } }
      }),
      prisma.escrow.count({
        where: { status: 'RELEASED' }
      })
    ]);

    return {
      totalUsers,
      totalEscrows,
      totalVolume: totalVolume._sum.amount || 0,
      activeEscrows,
      completedEscrows,
      successRate: totalEscrows > 0 ? (completedEscrows / totalEscrows) * 100 : 0
    };
  }

  // ==================== Utility Methods ====================
  async disconnect() {
    await prisma.$disconnect();
  }

  getPrismaClient() {
    return prisma;
  }
}

export default new DatabaseService();
export { DatabaseService };
