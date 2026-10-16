# ⚡️ Raika Game - Telegram Mini App Platform Clone

A 1:1 production-ready full-stack clone of the **Raika Game** Telegram bot and gaming Mini App, featuring a dark-mode casino/arcade interface, provably fair multiplier mini-games (including an interactive HTML5 Canvas clone of **"Chicken Shoot"**), wallet balances, real vs. demo mode, transaction logs, and Telegram WebApp SDK integration.

---

## 🏗️ System Architecture

```
mini-games/
├── client/                     # Telegram Mini App Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar.jsx      # Balance capsule, deposit trigger, profile avatar
│   │   │   ├── BottomNav.jsx   # Fixed navigation: Menu, Games, Sport, Wheel
│   │   │   ├── DrawerMenu.jsx  # Slide-out deep navigation menu
│   │   │   ├── Modals/         # Deposit, Withdraw, Profile, Bonuses, Autoplay
│   │   │   ├── Lobby/          # Hero carousel, filter pills, providers, game cards
│   │   │   └── Games/
│   │   │       ├── ChickenShoot/ # Canvas shooting gallery, reticle, betting controls, win ticker
│   │   │       ├── LuckyWheel/   # Daily spinning wheel with cash & multiplier prizes
│   │   │       └── Sportsbook/   # Live fixtures, odds, and betting slips
│   │   ├── context/            # Telegram & Game state providers
│   │   └── utils/              # Web Audio API sound synthesizer, Telegram WebApp SDK helpers
├── server/                     # Backend API (Node.js + Express + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma       # User, Transaction, GameSession, GameStats models
│   │   └── seed.js             # Initial database seeder
│   ├── middleware/
│   │   └── auth.js             # Telegram HMAC-SHA256 initData validation & dev fallback
│   ├── routes/
│   │   ├── user.js             # User profile, VIP tier progression, balances
│   │   ├── wallet.js           # Deposit, withdraw, faucet, daily giveaway
│   │   └── game.js             # Chicken Shoot betting, Lucky Wheel spin, live stats
│   └── gameEngine/
│       └── chickenShootEngine.js # Provably fair RNG (HMAC-SHA256), multiplier tiers & payouts
├── bot/                        # Telegram Bot (Grammy framework)
│   └── bot.js                  # /start, WebApp buttons, persistent reply keyboard, inline catalog
└── package.json                # Root orchestrator scripts
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ or v20+ (v24 supported)
- **npm** v9+

### 2. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install in `server`, `client`, and `bot` individually: `cd <dir> && npm install`)*

### 3. Setup Database
The project comes pre-configured with zero-dependency **SQLite** for instant out-of-the-box local testing, with 1-click swap to **PostgreSQL** for production.

```bash
cd server
npx prisma db push
node prisma/seed.js
```

### 4. Start Development Servers
Run client and server concurrently:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Mini App (Port 5173)
npm run dev:client

# Terminal 3: Telegram Bot (Optional - connects when BOT_TOKEN is provided)
npm run dev:bot
```
Access the application in your browser at: **`http://localhost:5173/`**

---

## 🤖 Telegram Bot Configuration

1. Open Telegram and talk to [@BotFather](https://t.me/BotFather) to create a bot: `/newbot`.
2. Copy your HTTP API token.
3. Paste your token into `bot/.env` and `server/.env`:
   ```env
   BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
   ```
4. Configure your Mini App menu button in `@BotFather`:
   - Send `/setmenubutton`
   - Select your bot
   - Enter your WebApp URL (e.g., your deployed URL or Ngrok tunnel `https://your-domain.com`)
   - Enter button title: `🎮 Play Raika`

---

## 🗄️ Switching to PostgreSQL in Production

In `server/prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
In `server/.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/raika?schema=public"
```
Then run:
```bash
cd server
npx prisma db push
```

---

## 🎯 Chicken Shoot Arcade Mechanics

- **HTML5 Canvas Vector Graphics**: Ultra-fast rendering with zero external asset loading delay.
- **5 Multiplier Target Tiers**:
  - 🟢 **Green Farm Chicken**: x1.20 – x1.50 (Common)
  - 🔵 **Blue Hunter Chicken**: x2.00 – x3.50 (Uncommon)
  - 🟣 **Purple Cyber Chicken**: x5.00 – x12.00 (Rare)
  - 🔴 **Red Mech Chicken**: x15.00 – x35.00 (Epic)
  - 🟡 **Golden Phoenix / Egg**: x50.00 – x100.00 (Legendary)
- **Provably Fair Algorithm**: HMAC-SHA256 calculation based on `serverSeed`, `clientSeed`, and `nonce` (RTP: 96.50%).
- **Hold-to-Autoplay**: Press and hold the primary action button to fill the progress ring and trigger configurable autoplay rounds (10–1000 spins with profit/loss limits).
- **Web Audio Sound Synthesizer**: Procedural audio effects for gunshots, target hits, multiplier coin dings, and armor ricochets.
