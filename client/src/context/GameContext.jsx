import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTelegram } from './TelegramContext';
import { triggerHaptic, triggerNotificationHaptic } from '../utils/telegram';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { user: tgUser, initData } = useTelegram();

  // Navigation & Game State
  const [activeTab, setActiveTab] = useState('lobby'); // 'lobby', 'game', 'sport', 'wheel'
  const [activeGameId, setActiveGameId] = useState('chicken_shoot');
  const [isDemo, setIsDemo] = useState(false); // Real by default, toggleable to Demo
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modals state
  const [modalState, setModalState] = useState({
    deposit: false,
    withdraw: false,
    profile: false,
    bonuses: false,
    autoplay: false,
  });

  // User financial and VIP stats
  const [userProfile, setUserProfile] = useState({
    id: '',
    username: 'raika_player',
    firstName: 'Alex',
    lastName: '',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=raika_vip',
    balance: 0.00,
    demoBalance: 10000.00,
    activeWagers: 0.00,
    totalWagered: 0.00,
    totalWon: 0.00,
    vip: { tier: 'Bronze I', nextTier: 'Silver I', progress: 0, cashback: '3%' },
  });

  // Global live statistics & win feed
  const [onlinePlayers, setOnlinePlayers] = useState(7988);
  const [recentWins, setRecentWins] = useState([]);

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('raika_favorites')) || ['chicken_shoot', 'turbo_crash', 'plinko'];
    } catch {
      return ['chicken_shoot', 'turbo_crash', 'plinko'];
    }
  });

  // Autoplay config
  const [autoplayConfig, setAutoplayConfig] = useState({
    rounds: 25,
    stopOnProfit: 100,
    stopOnLoss: 50,
    targetTier: 'auto',
    isRunning: false,
    remainingRounds: 0,
    totalProfit: 0,
  });

  // Open/Close modal helper
  const openModal = useCallback((name) => {
    setModalState(prev => ({ ...prev, [name]: true }));
  }, []);

  const closeModal = useCallback((name) => {
    setModalState(prev => ({ ...prev, [name]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalState({
      deposit: false,
      withdraw: false,
      profile: false,
      bonuses: false,
      autoplay: false,
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const next = prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId];
      localStorage.setItem('raika_favorites', JSON.stringify(next));
      return next;
    });
  };

  // Helper headers for API calls
  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (initData) {
      headers['x-telegram-init-data'] = initData;
    }
    if (tgUser) {
      headers['x-dev-telegram-user'] = JSON.stringify(tgUser);
    }
    return headers;
  }, [initData, tgUser]);

  // Fetch user profile and balances
  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUserProfile(prev => ({ ...prev, ...data.user }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch user profile:', e);
    }
  }, [getAuthHeaders]);

  // Fetch game stats and ticker feed
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch('/api/game/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOnlinePlayers(data.onlinePlayers);
          if (data.recentWins) {
            setRecentWins(data.recentWins);
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch game stats:', e);
    }
  }, []);

  // Execute Bet
  const executeBet = async ({ betAmount, gameType = 'chicken_shoot', targetPreference = 'auto' }) => {
    try {
      const res = await fetch('/api/game/bet', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          betAmount,
          gameType,
          isDemo,
          targetPreference,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place bet');
      }

      // Update local balance immediately
      if (isDemo) {
        setUserProfile(prev => ({ ...prev, demoBalance: data.balance }));
      } else {
        setUserProfile(prev => ({
          ...prev,
          balance: data.balance,
          totalWagered: prev.totalWagered + betAmount,
          totalWon: data.won ? prev.totalWon + data.payout : prev.totalWon,
        }));
      }

      if (data.won) {
        triggerHaptic('heavy');
      } else {
        triggerHaptic('light');
      }

      return data;
    } catch (err) {
      triggerNotificationHaptic('error');
      throw err;
    }
  };

  // Deposit funds
  const handleDeposit = async (amount, currency = 'USDT') => {
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, currency }),
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile(prev => ({ ...prev, balance: data.balance }));
        triggerNotificationHaptic('success');
        return data;
      }
      throw new Error(data.error || 'Deposit failed');
    } catch (err) {
      triggerNotificationHaptic('error');
      throw err;
    }
  };

  // Withdraw funds
  const handleWithdraw = async (amount, address, currency = 'TON') => {
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, address, currency }),
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile(prev => ({ ...prev, balance: data.balance }));
        triggerNotificationHaptic('success');
        return data;
      }
      throw new Error(data.error || 'Withdrawal failed');
    } catch (err) {
      triggerNotificationHaptic('error');
      throw err;
    }
  };

  // Claim Daily Giveaway
  const handleDailyClaim = async () => {
    try {
      const res = await fetch('/api/wallet/daily-claim', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile(prev => ({ ...prev, balance: data.balance }));
        triggerNotificationHaptic('success');
        return data;
      }
      throw new Error(data.error || 'Daily claim failed');
    } catch (err) {
      triggerNotificationHaptic('error');
      throw err;
    }
  };

  // Claim Faucet Test Balance
  const handleFaucet = async (mode = 'real') => {
    try {
      const res = await fetch('/api/wallet/faucet', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile(prev => ({
          ...prev,
          balance: data.balance,
          demoBalance: data.demoBalance,
        }));
        triggerNotificationHaptic('success');
        return data;
      }
      throw new Error(data.error || 'Faucet claim failed');
    } catch (err) {
      triggerNotificationHaptic('error');
      throw err;
    }
  };

  // Initial load and URL query param checking (e.g. ?game=chicken_shoot or ?tab=wheel)
  useEffect(() => {
    refreshProfile();
    refreshStats();

    // Check URL parameters for direct deep-linking from Telegram Bot
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get('game');
    const tabParam = params.get('tab');
    const actionParam = params.get('action');

    if (gameParam) {
      setActiveGameId(gameParam);
      setActiveTab('game');
    } else if (tabParam) {
      setActiveTab(tabParam);
    }

    if (actionParam) {
      if (actionParam === 'deposit') openModal('deposit');
      else if (actionParam === 'withdraw') openModal('withdraw');
      else if (actionParam === 'profile') openModal('profile');
      else if (actionParam === 'bonuses') openModal('bonuses');
    }

    const interval = setInterval(refreshStats, 8000);
    return () => clearInterval(interval);
  }, [refreshProfile, refreshStats, openModal]);

  return (
    <GameContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeGameId,
        setActiveGameId,
        isDemo,
        setIsDemo,
        drawerOpen,
        setDrawerOpen,
        modalState,
        openModal,
        closeModal,
        closeAllModals,
        userProfile,
        setUserProfile,
        onlinePlayers,
        recentWins,
        favorites,
        toggleFavorite,
        autoplayConfig,
        setAutoplayConfig,
        executeBet,
        handleDeposit,
        handleWithdraw,
        handleDailyClaim,
        handleFaucet,
        refreshProfile,
        currentBalance: isDemo ? userProfile.demoBalance : userProfile.balance,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
