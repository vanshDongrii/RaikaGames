import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { telegramAuthMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/wallet/deposit
router.post('/deposit', telegramAuthMiddleware, async (req, res) => {
  try {
    const { amount, currency = 'USDT' } = req.body;
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid deposit amount' });
    }

    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Update user balance and create transaction in a Prisma transaction
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          balance: { increment: depositAmount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: req.user.id,
          type: 'DEPOSIT',
          amount: depositAmount,
          currency,
          status: 'COMPLETED',
          txHash,
          description: `Deposit via ${currency}`,
        },
      }),
    ]);

    res.json({
      success: true,
      balance: updatedUser.balance,
      transaction,
      message: `Successfully deposited $${depositAmount.toFixed(2)} ${currency}`,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ success: false, error: 'Deposit processing failed' });
  }
});

// POST /api/wallet/withdraw
router.post('/withdraw', telegramAuthMiddleware, async (req, res) => {
  try {
    const { amount, address, currency = 'TON' } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 10) {
      return res.status(400).json({ success: false, error: 'Minimum withdrawal amount is $10.00' });
    }

    if (!address || address.length < 10) {
      return res.status(400).json({ success: false, error: 'Valid wallet address required' });
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.balance < withdrawAmount) {
      return res.status(400).json({ success: false, error: 'Insufficient real balance' });
    }

    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          balance: { decrement: withdrawAmount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: req.user.id,
          type: 'WITHDRAW',
          amount: withdrawAmount,
          currency,
          status: 'COMPLETED', // Or PENDING for queueing
          txHash,
          description: `Withdraw to ${address.slice(0, 6)}...${address.slice(-4)} (${currency})`,
        },
      }),
    ]);

    res.json({
      success: true,
      balance: updatedUser.balance,
      transaction,
      message: `Withdrawal of $${withdrawAmount.toFixed(2)} processed successfully`,
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ success: false, error: 'Withdrawal processing failed' });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', telegramAuthMiddleware, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve transactions' });
  }
});

// POST /api/wallet/faucet - starter test balance / reload
router.post('/faucet', telegramAuthMiddleware, async (req, res) => {
  try {
    const { mode = 'real' } = req.body;
    let updatedUser;

    if (mode === 'demo') {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { demoBalance: 10000.00 },
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { balance: { increment: 50.00 } },
      });

      await prisma.transaction.create({
        data: {
          userId: req.user.id,
          type: 'BONUS',
          amount: 50.00,
          currency: 'USD',
          status: 'COMPLETED',
          description: 'Community Faucet Test Grant',
        },
      });
    }

    res.json({
      success: true,
      balance: updatedUser.balance,
      demoBalance: updatedUser.demoBalance,
      message: mode === 'demo' ? 'Demo balance restored to $10,000.00' : 'Received $50.00 Faucet Bonus!',
    });
  } catch (error) {
    console.error('Faucet error:', error);
    res.status(500).json({ success: false, error: 'Failed to claim faucet' });
  }
});

// POST /api/wallet/daily-claim - Daily giveaway / check-in
router.post('/daily-claim', telegramAuthMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const now = new Date();
    if (user.lastClaimDate) {
      const hoursSinceLastClaim = (now.getTime() - new Date(user.lastClaimDate).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < 24) {
        const remainingHours = Math.ceil(24 - hoursSinceLastClaim);
        return res.status(400).json({
          success: false,
          error: `Next daily reward available in ${remainingHours} hours`,
        });
      }
    }

    // Award random daily gift: $5.00 to $25.00
    const rewardAmount = parseFloat((Math.random() * 20 + 5).toFixed(2));

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          balance: { increment: rewardAmount },
          lastClaimDate: now,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: req.user.id,
          type: 'DAILY_CLAIM',
          amount: rewardAmount,
          currency: 'USD',
          status: 'COMPLETED',
          description: 'Daily Giveaway Reward',
        },
      }),
    ]);

    res.json({
      success: true,
      rewardAmount,
      balance: updatedUser.balance,
      message: `Claimed $${rewardAmount.toFixed(2)} Daily Giveaway!`,
    });
  } catch (error) {
    console.error('Daily claim error:', error);
    res.status(500).json({ success: false, error: 'Failed to claim daily reward' });
  }
});

export default router;
