import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || '7890123456:AAExampleBotTokenPlaceholderXYZ123';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

console.log('🤖 Initializing Raika Game Telegram Bot...');
console.log(`🌐 Mini App WebApp URL: ${WEBAPP_URL}`);

// Check if token is placeholder
const isPlaceholderToken = BOT_TOKEN.includes('ExampleBotTokenPlaceholder') || BOT_TOKEN.includes('YOUR_TELEGRAM');

let bot;
try {
  bot = new Bot(BOT_TOKEN);
} catch (e) {
  console.warn('Bot initialization warning:', e.message);
}

/**
 * Main persistent keyboard
 */
function getMainReplyKeyboard() {
  return new Keyboard()
    .webApp('🎮 Play Raika', WEBAPP_URL)
    .row()
    .text('💳 Deposit')
    .text('💸 Withdraw')
    .row()
    .text('👤 Profile')
    .text('🎁 Bonuses')
    .text('🎉 Daily Giveaway')
    .row()
    .text('🎰 Game Catalog')
    .resized();
}

/**
 * Inline Game Catalog Menu
 */
function getCatalogInlineKeyboard() {
  return new InlineKeyboard()
    .webApp('🐔 Chicken Shoot (Original)', `${WEBAPP_URL}?game=chicken_shoot`)
    .webApp('🚀 Turbo Crash', `${WEBAPP_URL}?game=turbo_crash`)
    .row()
    .webApp('🪙 Plinko Royale', `${WEBAPP_URL}?game=plinko`)
    .webApp('💣 Raika Mines', `${WEBAPP_URL}?game=mines`)
    .row()
    .webApp('🎰 Slots & Jackpots', `${WEBAPP_URL}?cat=slots`)
    .webApp('🃏 Blackjack', `${WEBAPP_URL}?cat=blackjack`)
    .row()
    .webApp('🎡 European Roulette', `${WEBAPP_URL}?cat=roulette`)
    .webApp('🎪 Lucky Wheel', `${WEBAPP_URL}?tab=wheel`)
    .row()
    .url('💬 Join Community', 'https://t.me/raika_community')
    .url('📢 Announcements', 'https://t.me/raika_news');
}

/**
 * Fetch or register user with backend
 */
async function getOrCreateUserData(fromUser) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-dev-telegram-user': JSON.stringify({
          id: fromUser.id,
          username: fromUser.username || `user_${fromUser.id}`,
          first_name: fromUser.first_name,
          last_name: fromUser.last_name,
        }),
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.error('Backend connection warning from bot:', err.message);
  }

  // Fallback defaults
  return {
    telegramId: String(fromUser.id),
    username: fromUser.username || `user_${fromUser.id}`,
    firstName: fromUser.first_name || 'Player',
    balance: 0.00,
    activeWagers: 0.00,
    totalWagered: 0.00,
    vipTier: 'Bronze I',
  };
}

if (bot) {
  // Command: /start
  bot.command('start', async (ctx) => {
    const user = await getOrCreateUserData(ctx.from);

    const welcomeMsg = `⚡️ <b>Welcome to Raika Game!</b> ⚡️

The #1 Telegram Web3 Gaming Platform. Play exclusive Raika Originals, shoot targets for up to <b>100x multipliers</b> in <i>Chicken Shoot</i>, and compete for massive jackpots!

━━━━━━━━━━━━━━━━━━━━━
👤 <b>Player:</b> @${user.username || ctx.from.first_name} (ID: <code>${ctx.from.id}</code>)
💰 <b>Real Balance:</b> <code>$${user.balance.toFixed(2)} USD</code>
🎯 <b>Active Wagers:</b> <code>$${user.activeWagers.toFixed(2)}</code>
🏆 <b>VIP Tier:</b> <b>${user.vipTier || 'Bronze I'}</b>
━━━━━━━━━━━━━━━━━━━━━

Tap <b>🎮 Play Raika</b> below to launch the Mini App or explore games from the catalog:`;

    const inlineKeyboard = new InlineKeyboard()
      .webApp('🚀 Launch Mini App', WEBAPP_URL)
      .row()
      .text('🎰 Browse Categories', 'open_catalog')
      .text('🎁 Claim Daily Free Gift', 'claim_giveaway');

    await ctx.reply(welcomeMsg, {
      parse_mode: 'HTML',
      reply_markup: getMainReplyKeyboard(),
    });

    await ctx.reply('Quick Actions & Originals:', {
      reply_markup: inlineKeyboard,
    });
  });

  // Text Button: 🎰 Game Catalog / Browse Categories
  bot.hears(['🎰 Game Catalog', 'Games', 'Catalog'], async (ctx) => {
    await ctx.reply('🎰 <b>Raika Gaming Catalog:</b>\nSelect any category below to jump straight in:', {
      parse_mode: 'HTML',
      reply_markup: getCatalogInlineKeyboard(),
    });
  });

  bot.callbackQuery('open_catalog', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('🎰 <b>Raika Gaming Catalog:</b>\nChoose an arcade game or casino category:', {
      parse_mode: 'HTML',
      reply_markup: getCatalogInlineKeyboard(),
    });
  });

  // Text Button: 💳 Deposit
  bot.hears('💳 Deposit', async (ctx) => {
    const inline = new InlineKeyboard()
      .webApp('💳 Open Deposit Terminal', `${WEBAPP_URL}?action=deposit`)
      .row()
      .url('💎 Buy Crypto with TON', 'https://wallet.t.me');

    await ctx.reply(`💳 <b>Instant Deposit</b>

Deposit instantly using TON, USDT TRC-20, Telegram Stars, or Credit Card.
• Zero processing fees
• Minimum deposit: $5.00
• Instant balance credit to play all games

Click below to open the deposit modal inside the Mini App:`, {
      parse_mode: 'HTML',
      reply_markup: inline,
    });
  });

  // Text Button: 💸 Withdraw
  bot.hears('💸 Withdraw', async (ctx) => {
    const user = await getOrCreateUserData(ctx.from);
    const inline = new InlineKeyboard()
      .webApp('💸 Withdraw Now', `${WEBAPP_URL}?action=withdraw`);

    await ctx.reply(`💸 <b>Fast Withdrawals</b>

Current Balance: <b>$${user.balance.toFixed(2)} USD</b>
• Minimum withdrawal: $10.00
• Processing speed: 1-5 minutes
• Supported networks: TON, USDT (TRC-20 / TON), Telegram Wallet

Request your cashout directly in the Mini App:`, {
      parse_mode: 'HTML',
      reply_markup: inline,
    });
  });

  // Text Button: 👤 Profile
  bot.hears('👤 Profile', async (ctx) => {
    const user = await getOrCreateUserData(ctx.from);
    const inline = new InlineKeyboard()
      .webApp('📊 View Full Stats & VIP', `${WEBAPP_URL}?action=profile`);

    await ctx.reply(`👤 <b>Player Profile: @${user.username || ctx.from.first_name}</b>

• <b>Telegram ID:</b> <code>${ctx.from.id}</code>
• <b>Real Balance:</b> $${user.balance.toFixed(2)} USD
• <b>Active Wagers:</b> $${user.activeWagers.toFixed(2)}
• <b>Total Wagered:</b> $${(user.totalWagered || 0).toFixed(2)}
• <b>VIP Tier:</b> ⭐️ ${user.vipTier || 'Bronze I'}
• <b>Cashback Rate:</b> 3% - 15% weekly

Level up your VIP tier by playing Raika Originals!`, {
      parse_mode: 'HTML',
      reply_markup: inline,
    });
  });

  // Text Button: 🎁 Bonuses
  bot.hears('🎁 Bonuses', async (ctx) => {
    const inline = new InlineKeyboard()
      .webApp('🎁 Rewards Center', `${WEBAPP_URL}?action=bonuses`)
      .webApp('🎪 Spin Daily Wheel', `${WEBAPP_URL}?tab=wheel`);

    await ctx.reply(`🎁 <b>Raika Rewards & Bonuses</b>

🔥 <b>Welcome Package:</b> 100% Deposit Match + 50 Free Spins
🎡 <b>Daily Lucky Wheel:</b> 1 Free Spin every 24 hours
💰 <b>Weekly VIP Cashback:</b> Up to 15% returned on all wagers
👥 <b>Referral Bonus:</b> Earn 15% revenue share for every invited friend!`, {
      parse_mode: 'HTML',
      reply_markup: inline,
    });
  });

  // Text Button / Callback: 🎉 Daily Giveaway
  const handleDailyGiveaway = async (ctx) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallet/daily-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dev-telegram-user': JSON.stringify({
            id: ctx.from.id,
            username: ctx.from.username,
            first_name: ctx.from.first_name,
          }),
        },
      });

      const data = await res.json();
      if (data.success) {
        await ctx.reply(`🎉 <b>Daily Reward Claimed!</b>\n\nYou received <b>+$${data.rewardAmount.toFixed(2)} USD</b> into your balance!\nNew Balance: <b>$${data.balance.toFixed(2)} USD</b>\n\nPlay Chicken Shoot now with your bonus!`, {
          parse_mode: 'HTML',
          reply_markup: new InlineKeyboard().webApp('🐔 Shoot Now', `${WEBAPP_URL}?game=chicken_shoot`),
        });
      } else {
        await ctx.reply(`⏳ <b>Daily Giveaway:</b>\n${data.error || 'Already claimed today!'}\n\nCome back tomorrow or spin the Lucky Wheel!`, {
          reply_markup: new InlineKeyboard().webApp('🎪 Lucky Wheel', `${WEBAPP_URL}?tab=wheel`),
        });
      }
    } catch {
      await ctx.reply('🎉 Claim your daily bonus in the Mini App!', {
        reply_markup: new InlineKeyboard().webApp('🎁 Open Rewards', `${WEBAPP_URL}?action=bonuses`),
      });
    }
  };

  bot.hears('🎉 Daily Giveaway', handleDailyGiveaway);
  bot.callbackQuery('claim_giveaway', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleDailyGiveaway(ctx);
  });

  // Default fallback
  bot.on('message', async (ctx) => {
    await ctx.reply('🎮 Tap <b>Play Raika</b> to enter the game arena or use the menu below!', {
      parse_mode: 'HTML',
      reply_markup: getMainReplyKeyboard(),
    });
  });

  // Catch errors
  bot.catch((err) => {
    console.error('Telegram Bot Error occurred:', err);
  });

  // Start polling if token is valid
  if (!isPlaceholderToken) {
    bot.start({
      onStart: (botInfo) => {
        console.log(`✅ Telegram Bot @${botInfo.username} is running and polling!`);
      },
    });
  } else {
    console.log('ℹ️ Bot token is currently a placeholder.');
    console.log('👉 To connect to real Telegram: Update BOT_TOKEN in bot/.env with your token from @BotFather');
  }
}

export default bot;
