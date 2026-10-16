import React, { createContext, useContext, useEffect, useState } from 'react';
import { tg, initTelegramApp, getTelegramUser, isTelegramEnv } from '../utils/telegram.js';

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initTelegramApp();
    const currentUser = getTelegramUser();
    setUser(currentUser);
    setInitData(tg?.initData || '');
    setIsReady(true);
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        tg,
        user,
        initData,
        isTelegramEnv,
        isReady,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
