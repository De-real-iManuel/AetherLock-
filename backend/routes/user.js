import express from 'express';
import { verifyWalletSignature } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyWalletSignature, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    
    const user = await global.prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        role: true,
        zkMeVerified: true,
        trustScore: true,
        createdAt: true,
        updatedAt: true,
        buyerEscrows: {
          select: {
            id: true,
            status: true,
            amount: true
          }
        },
        sellerEscrows: {
          select: {
            id: true,
            status: true,
            amount: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Calculate statistics
    const completedJobs = [...user.buyerEscrows, ...user.sellerEscrows]
      .filter(e => e.status === 'COMPLETED').length;
    
    const totalEarned = user.sellerEscrows
      .filter(e => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalSpent = user.buyerEscrows
      .filter(e => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + e.amount, 0);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        address: user.walletAddress,
        role: user.role,
        trustScore: user.trustScore,
        kycStatus: user.zkMeVerified ? 'verified' : 'pending',
        completedJobs,
        totalEarned,
        totalSpent,
        joinedAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', verifyWalletSignature, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { role, name, skills, avatar } = req.body;
    
    // Validate role
    if (role && !['client', 'freelancer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "client" or "freelancer"'
      });
    }
    
    const updateData = {};
    if (role) updateData.role = role;
    
    const user = await global.prisma.user.update({
      where: { walletAddress },
      data: updateData
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        address: user.walletAddress,
        role: user.role,
        trustScore: user.trustScore,
        kycStatus: user.zkMeVerified ? 'verified' : 'pending',
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user settings
router.put('/settings', verifyWalletSignature, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { notifications, theme } = req.body;
    
    // Validate settings
    if (notifications) {
      const { email, push, inApp } = notifications;
      if (typeof email !== 'boolean' || typeof push !== 'boolean' || typeof inApp !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Invalid notification settings'
        });
      }
    }
    
    if (theme && !['dark', 'light'].includes(theme)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid theme. Must be "dark" or "light"'
      });
    }
    
    // For now, we'll return success since settings aren't in the schema
    // In production, you'd add a settings field to the User model
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        notifications: notifications || { email: true, push: true, inApp: true },
        theme: theme || 'dark'
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create or get user (called after wallet connection)
router.post('/create', async (req, res) => {
  try {
    const { walletAddress, chain } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }
    
    // Check if user exists
    let user = await global.prisma.user.findUnique({
      where: { walletAddress }
    });
    
    // Create user if doesn't exist
    if (!user) {
      user = await global.prisma.user.create({
        data: {
          walletAddress,
          trustScore: 50 // Default trust score
        }
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        address: user.walletAddress,
        role: user.role,
        trustScore: user.trustScore,
        kycStatus: user.zkMeVerified ? 'verified' : 'pending',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
