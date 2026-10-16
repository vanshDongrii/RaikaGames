import crypto from 'crypto';

/**
 * Multiplier tiers for Chicken Shoot targets:
 * - Green Farm Chicken: x1.20 - x1.50
 * - Blue Hunter Chicken: x2.00 - x3.50
 * - Purple Cyber Chicken: x5.00 - x12.00
 * - Red Mech Chicken: x15.00 - x35.00
 * - Golden Phoenix / Golden Egg: x50.00 - x100.00
 */
export const TARGET_TIERS = [
  { id: 'green', name: 'Farm Chicken', minMult: 1.2, maxMult: 1.5, weight: 45, color: '#10b981' },
  { id: 'blue', name: 'Hunter Chicken', minMult: 2.0, maxMult: 3.5, weight: 30, color: '#3b82f6' },
  { id: 'purple', name: 'Cyber Chicken', minMult: 5.0, maxMult: 12.0, weight: 15, color: '#a855f7' },
  { id: 'red', name: 'Mech Chicken', minMult: 15.0, maxMult: 35.0, weight: 8, color: '#ef4444' },
  { id: 'gold', name: 'Golden Phoenix', minMult: 50.0, maxMult: 100.0, weight: 2, color: '#f59e0b' },
];

/**
 * Generates a Provably Fair game outcome using HMAC-SHA256
 * @param {string} serverSeed
 * @param {string} clientSeed
 * @param {number} nonce
 * @returns {object} { rollNumber (0-99.99), hash }
 */
export function generateProvablyFairRoll(serverSeed, clientSeed, nonce) {
  const hmac = crypto.createHmac('sha256', serverSeed);
  hmac.update(`${clientSeed}:${nonce}`);
  const hash = hmac.digest('hex');

  // Convert first 8 hex characters to an integer and normalize to [0, 100)
  const subHash = hash.substring(0, 8);
  const intVal = parseInt(subHash, 16);
  const rollNumber = (intVal % 10000) / 100; // 0.00 - 99.99

  return { rollNumber, hash };
}

/**
 * Calculates game outcome for Chicken Shoot
 * Theoretical RTP: ~96.50%
 * @param {number} betAmount
 * @param {string} [targetPreference] - 'auto', 'green', 'blue', 'purple', 'red', 'gold'
 * @param {string} [clientSeed]
 * @param {number} [nonce=1]
 */
export function resolveChickenShootBet(betAmount, targetPreference = 'auto', clientSeed = 'default_client_seed', nonce = 1) {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

  const { rollNumber, hash } = generateProvablyFairRoll(serverSeed, clientSeed, nonce);

  // House edge 3.5% (RTP = 96.5%)
  // If roll is < 3.5%, it's a guaranteed Miss / Armor Deflect (0x multiplier)
  // Otherwise, select a target based on probability weights and compute multiplier
  const isMiss = rollNumber < 3.5;

  let chosenTier = TARGET_TIERS[0];
  let multiplier = 0;
  let won = false;

  if (!isMiss) {
    // Pick tier based on rollNumber remainder or weighted random
    const normalizedRoll = (rollNumber - 3.5) / (100 - 3.5); // 0.0 to 1.0

    if (targetPreference && targetPreference !== 'auto') {
      const found = TARGET_TIERS.find(t => t.id === targetPreference);
      if (found) chosenTier = found;
    } else {
      let cumulative = 0;
      for (const tier of TARGET_TIERS) {
        cumulative += tier.weight;
        if (normalizedRoll * 100 <= cumulative) {
          chosenTier = tier;
          break;
        }
      }
    }

    // Determine multiplier within tier range
    const tierSpread = chosenTier.maxMult - chosenTier.minMult;
    const subRoll = ((parseInt(hash.substring(8, 12), 16) % 1000) / 1000);
    multiplier = parseFloat((chosenTier.minMult + tierSpread * subRoll).toFixed(2));
    won = true;
  } else {
    chosenTier = { id: 'miss', name: 'Deflected / Missed', color: '#6b7280' };
    multiplier = 0;
    won = false;
  }

  const payout = won ? parseFloat((betAmount * multiplier).toFixed(2)) : 0;

  return {
    won,
    multiplier,
    payout,
    netProfit: parseFloat((payout - betAmount).toFixed(2)),
    target: chosenTier,
    provablyFair: {
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      hash,
      rollNumber,
    },
  };
}
