import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { telegramAuthMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to calculate VIP level and progress
function calculateVipLevel(totalWagered) {
  if (totalWagered >= 50000) return { tier: 'Diamond VIP', nextTier: 'Max Level', progress: 100, cashback: '15%' };
  if (totalWagered >= 15000) return { tier: 'Platinum III', nextTier: 'Diamond VIP', progress: ((totalWagered - 15000) / 35000) * 100, cashback: '10%' };
  if (totalWagered >= 5000) return { tier: 'Gold II', nextTier: 'Platinum III', progress: ((totalWagered - 5000) / 10000) * 100, cashback: '7%' };
  if (totalWagered >= 1000) return { tier: 'Silver I', nextTier: 'Gold II', progress: ((totalWagered - 1000) / 4000) * 100, cashback: '5%' };
  return { tier: 'Bronze I', nextTier: 'Silver I', progress: (totalWagered / 1000) * 100, cashback: '3%' };
}

// GET /api/user/profile
router.get('/profile', telegramAuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const vipInfo = calculateVipLevel(user.totalWagered);

    // Update VIP tier in DB if changed
    if (user.vipTier !== vipInfo.tier) {
      await prisma.user.update({
        where: { id: user.id },
        data: { vipTier: vipInfo.tier },
      });
      user.vipTier = vipInfo.tier;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        balance: user.balance,
        demoBalance: user.demoBalance,
        activeWagers: user.activeWagers,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon,
        vip: vipInfo,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
});

// GET /api/user/balance
router.get('/balance', telegramAuthMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true,
        demoBalance: true,
        activeWagers: true,
      },
    });

    res.json({
      success: true,
      balance: user?.balance ?? 0.00,
      demoBalance: user?.demoBalance ?? 10000.00,
      activeWagers: user?.activeWagers ?? 0.00,
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve balance' });
  }
});

export default router;
