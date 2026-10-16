import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Raika platform data...');

  await prisma.gameStats.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      onlinePlayers: 7988,
      totalBetsCount: 154200,
      totalVolume: 895420.50,
    },
  });

  // Seed demo test user
  await prisma.user.upsert({
    where: { telegramId: '88997711' },
    update: {},
    create: {
      telegramId: '88997711',
      username: 'raika_player',
      firstName: 'Alex',
      lastName: 'Raika',
      balance: 100.00, // starting balance for instant testing
      demoBalance: 10000.00,
      vipTier: 'Gold II',
      totalWagered: 6250.00,
      totalWon: 7120.00,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
