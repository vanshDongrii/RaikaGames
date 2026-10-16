import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { telegramAuthMiddleware } from '../middleware/auth.js';
import { resolveChickenShootBet, TARGET_TIERS } from '../gameEngine/chickenShootEngine.js';

const router = Router();
const prisma = new PrismaClient();

// In-memory simulated live win feed for real-time ticker
let mockTickerIndex = 0;
const SAMPLE_TICKER_NAMES = [
  'Alex_TG', 'CryptoSniper', 'LuckyDoge', 'VipKing777', 'Elena_R',
  'MoonWhale', 'ShadowFox', 'TargetHunter', 'GoldenClaw', 'PixelGamer'
];

// GET /api/game/stats - Online users & live win ticker
router.get('/stats', async (req, res) => {
  try {
    let stats = await prisma.gameStats.findUnique({
      where: { id: 'global' },
    });

    if (!stats) {
      stats = await prisma.gameStats.create({
        data: {
          id: 'global',
          onlinePlayers: 7988 + Math.floor(Math.random() * 40 - 20),
          totalBetsCount: 154200,
          totalVolume: 895420.50,
        },
      });
    }

    // Dynamic jitter for online players
    const jitteredOnline = 7980 + Math.floor(Math.sin(Date.now() / 15000) * 80) + Math.floor(Math.random() * 15);

    // Recent wins
    const recentSessions = await prisma.gameSession.findMany({
      where: { payout: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: {
          select: { username: true, firstName: true },
        },
      },
    });

    // Fallback ticker items if fresh database
    const tickerItems = recentSessions.length > 0
      ? recentSessions.map(s => ({
          user: s.user.username ? `@${s.user.username.slice(0, 3)}***` : 'Player****',
          game: s.gameType,
          multiplier: s.multiplier,
          payout: s.payout,
          timestamp: s.createdAt,
        }))
      : [
          { user: '@cryp***', game: 'chicken_shoot', multiplier: 24.50, payout: 245.00, timestamp: new Date() },
          { user: '@alex***', game: 'chicken_shoot', multiplier: 3.20, payout: 64.00, timestamp: new Date() },
          { user: '@vip_***', game: 'chicken_shoot', multiplier: 48.00, payout: 1200.00, timestamp: new Date() },
          { user: '@luck***', game: 'chicken_shoot', multiplier: 12.00, payout: 120.00, timestamp: new Date() },
        ];

    res.json({
      success: true,
      onlinePlayers: jitteredOnline,
      totalBets: stats.totalBetsCount,
      totalVolume: stats.totalVolume,
      recentWins: tickerItems,
      targets: TARGET_TIERS,
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve game stats' });
  }
});

// POST /api/game/bet - Central betting endpoint for Chicken Shoot
router.post('/bet', telegramAuthMiddleware, async (req, res) => {
  try {
    const {
      gameType = 'chicken_shoot',
      betAmount,
      isDemo = false,
      targetPreference = 'auto',
      clientSeed = 'raika_client_seed',
      nonce = 1,
    } = req.body;

    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid bet amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify balance
    if (isDemo) {
      if (user.demoBalance < bet) {
        return res.status(400).json({ success: false, error: 'Insufficient Demo Balance. Reset in settings!' });
      }
    } else {
      if (user.balance < bet) {
        return res.status(400).json({ success: false, error: 'Insufficient Real Balance. Please deposit funds!' });
      }
    }

    // Resolve outcome via game engine
    const outcome = resolveChickenShootBet(bet, targetPreference, clientSeed, nonce);

    // Apply updates in a database transaction
    const balanceField = isDemo ? 'demoBalance' : 'balance';
    const balanceChange = outcome.won ? (outcome.payout - bet) : -bet;

    const userUpdates = {
      [balanceField]: { increment: balanceChange },
    };

    if (!isDemo) {
      userUpdates.totalWagered = { increment: bet };
      if (outcome.won) {
        userUpdates.totalWon = { increment: outcome.payout };
      }
    }

    const [updatedUser, session] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: userUpdates,
      }),
      prisma.gameSession.create({
        data: {
          userId: user.id,
          gameType,
          betAmount: bet,
          multiplier: outcome.multiplier,
          payout: outcome.payout,
          isDemo,
          outcomeDetails: JSON.stringify({
            target: outcome.target,
            won: outcome.won,
            provablyFair: outcome.provablyFair,
          }),
        },
      }),
    ]);

    // Update global game stats
    await prisma.gameStats.upsert({
      where: { id: 'global' },
      update: {
        totalBetsCount: { increment: 1 },
        totalVolume: { increment: bet },
      },
      create: {
        id: 'global',
        onlinePlayers: 7988,
        totalBetsCount: 1,
        totalVolume: bet,
      },
    });

    res.json({
      success: true,
      won: outcome.won,
      multiplier: outcome.multiplier,
      payout: outcome.payout,
      netProfit: outcome.netProfit,
      target: outcome.target,
      provablyFair: outcome.provablyFair,
      sessionId: session.id,
      balance: isDemo ? updatedUser.demoBalance : updatedUser.balance,
      isDemo,
    });
  } catch (error) {
    console.error('Error processing bet:', error);
    res.status(500).json({ success: false, error: 'Game bet execution failed' });
  }
});

// POST /api/game/wheel-spin - Daily Lucky Wheel spin
router.post('/wheel-spin', telegramAuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const slices = [
      { id: 1, label: '$5.00 Cash', mult: 5, type: 'cash', value: 5.0, color: '#10b981' },
      { id: 2, label: 'x1.5 Multiplier', mult: 1.5, type: 'bonus', value: 1.5, color: '#3b82f6' },
      { id: 3, label: '$10.00 Cash', mult: 10, type: 'cash', value: 10.0, color: '#f59e0b' },
      { id: 4, label: 'Try Again', mult: 0, type: 'zero', value: 0, color: '#6b7280' },
      { id: 5, label: '$25.00 Cash', mult: 25, type: 'cash', value: 25.0, color: '#8b5cf6' },
      { id: 6, label: 'x2.0 Booster', mult: 2, type: 'bonus', value: 2.0, color: '#ec4899' },
      { id: 7, label: '$50.00 Jackpot', mult: 50, type: 'cash', value: 50.0, color: '#ef4444' },
      { id: 8, label: '100 Free Demo', mult: 100, type: 'demo', value: 1000.0, color: '#06b6d4' },
    ];

    const randomIndex = Math.floor(Math.random() * slices.length);
    const selectedSlice = slices[randomIndex];

    if (selectedSlice.type === 'cash') {
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: selectedSlice.value } },
      });
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'BONUS',
          amount: selectedSlice.value,
          description: `Lucky Wheel Prize: ${selectedSlice.label}`,
        },
      });
    }

    res.json({
      success: true,
      sliceIndex: randomIndex,
      reward: selectedSlice,
    });
  } catch (error) {
    console.error('Error in wheel spin:', error);
    res.status(500).json({ success: false, error: 'Wheel spin failed' });
  }
});

// GET /api/game/history - User's game history
router.get('/history', telegramAuthMiddleware, async (req, res) => {
  try {
    const history = await prisma.gameSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve history' });
  }
});

export default router;
