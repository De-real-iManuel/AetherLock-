import express from 'express';
import { verifyWalletSignature } from '../middleware/auth.js';

const router = express.Router();

// Get chat history for an escrow
router.get('/:escrowId/history', verifyWalletSignature, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { walletAddress } = req.user;
    const { limit = 50, before } = req.query;
    
    // Verify user is part of the escrow
    const escrow = await global.prisma.escrow.findUnique({
      where: { escrowId },
      include: {
        buyer: true,
        seller: true
      }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    const isParticipant = 
      escrow.buyer.walletAddress === walletAddress ||
      escrow.seller.walletAddress === walletAddress;
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant in this escrow'
      });
    }
    
    // Build query
    const where = { escrowId };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }
    
    // Get messages
    const messages = await global.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    // Reverse to get chronological order
    messages.reverse();
    
    res.json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        escrowId: m.escrowId,
        senderId: m.senderId,
        senderRole: m.senderRole,
        content: m.content,
        timestamp: m.createdAt,
        read: m.read
      })),
      count: messages.length
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send a message
router.post('/:escrowId/send', verifyWalletSignature, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { walletAddress } = req.user;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message content exceeds 5000 characters'
      });
    }
    
    // Verify user is part of the escrow
    const escrow = await global.prisma.escrow.findUnique({
      where: { escrowId },
      include: {
        buyer: true,
        seller: true
      }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    const isClient = escrow.buyer.walletAddress === walletAddress;
    const isFreelancer = escrow.seller.walletAddress === walletAddress;
    
    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant in this escrow'
      });
    }
    
    const senderRole = isClient ? 'client' : 'freelancer';
    
    // Create message in database
    const message = await global.prisma.message.create({
      data: {
        escrowId,
        senderId: walletAddress,
        senderRole,
        content: content.trim(),
        read: false
      }
    });
    
    // Broadcast message via WebSocket using the enhanced service
    global.websocketService.broadcastToEscrow(escrowId, 'chat_message', {
      id: message.id,
      escrowId: message.escrowId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      timestamp: message.createdAt,
      read: message.read
    });
    
    // Send notification to the other party
    const recipientAddress = isClient ? 
      escrow.seller.walletAddress : 
      escrow.buyer.walletAddress;
    
    global.websocketService.notifyUser(recipientAddress, {
      type: 'message_received',
      title: 'New Message',
      message: `New message in escrow: ${escrow.title}`,
      escrowId,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: {
        id: message.id,
        escrowId: message.escrowId,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        timestamp: message.createdAt,
        read: message.read
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark message as read
router.put('/:messageId/read', verifyWalletSignature, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { walletAddress } = req.user;
    
    // Get message
    const message = await global.prisma.message.findUnique({
      where: { id: messageId }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    // Verify user is the recipient (not the sender)
    if (message.senderId === walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Cannot mark own message as read'
      });
    }
    
    // Verify user is part of the escrow
    const escrow = await global.prisma.escrow.findUnique({
      where: { escrowId: message.escrowId },
      include: {
        buyer: true,
        seller: true
      }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    const isParticipant = 
      escrow.buyer.walletAddress === walletAddress ||
      escrow.seller.walletAddress === walletAddress;
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant in this escrow'
      });
    }
    
    // Update message
    const updatedMessage = await global.prisma.message.update({
      where: { id: messageId },
      data: { read: true }
    });
    
    // Notify sender via WebSocket
    global.io.to(`user:${message.senderId}`).emit('message_read', {
      messageId: updatedMessage.id,
      escrowId: updatedMessage.escrowId
    });
    
    res.json({
      success: true,
      message: {
        id: updatedMessage.id,
        read: updatedMessage.read
      }
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread message count for user
router.get('/unread/count', verifyWalletSignature, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    
    // Get all escrows where user is a participant
    const user = await global.prisma.user.findUnique({
      where: { walletAddress },
      include: {
        buyerEscrows: { select: { escrowId: true } },
        sellerEscrows: { select: { escrowId: true } }
      }
    });
    
    if (!user) {
      return res.json({
        success: true,
        count: 0
      });
    }
    
    const escrowIds = [
      ...user.buyerEscrows.map(e => e.escrowId),
      ...user.sellerEscrows.map(e => e.escrowId)
    ];
    
    // Count unread messages in these escrows (not sent by user)
    const count = await global.prisma.message.count({
      where: {
        escrowId: { in: escrowIds },
        senderId: { not: walletAddress },
        read: false
      }
    });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
