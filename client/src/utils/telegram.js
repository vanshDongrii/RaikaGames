/**
 * Telegram WebApp SDK helper utilities with graceful browser fallback
 */

export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export const isTelegramEnv = Boolean(tg && tg.initData);

export function initTelegramApp() {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0a0d14');
      tg.setBackgroundColor('#0a0d14');
      tg.enableClosingConfirmation?.();
    } catch (e) {
      console.warn('Telegram initialization notice:', e);
    }
  }
}

/**
 * Trigger haptic feedback safely
 * @param {'light' | 'medium' | 'heavy' | 'rigid' | 'soft'} style
 */
export function triggerHaptic(style = 'medium') {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    } else if (navigator.vibrate) {
      navigator.vibrate(style === 'heavy' ? 40 : 20);
    }
  } catch {
    // ignore
  }
}

/**
 * Trigger notification haptic safely
 * @param {'error' | 'success' | 'warning'} type
 */
export function triggerNotificationHaptic(type = 'success') {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    } else if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [30, 50, 30] : [50, 50, 50]);
    }
  } catch {
    // ignore
  }
}

/**
 * Close Telegram Mini App
 */
export function closeTelegramApp() {
  if (tg) {
    tg.close();
  } else {
    alert('Close command triggered (Telegram Mini App view closed)');
  }
}

/**
 * Get current telegram user details or local mock
 */
export function getTelegramUser() {
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }

  // Fallback for standalone browser testing
  return {
    id: '88997711',
    first_name: 'Alex',
    last_name: 'Raika',
    username: 'raika_player',
    photo_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=raika_vip',
  };
}
