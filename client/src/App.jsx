import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import DrawerMenu from './components/DrawerMenu';

// Lobby components
import HeroCarousel from './components/Lobby/HeroCarousel';
import FilterPills from './components/Lobby/FilterPills';
import ProvidersBar from './components/Lobby/ProvidersBar';
import GameGrid from './components/Lobby/GameGrid';

// Active Game Views
import ChickenShootGame from './components/Games/ChickenShoot/ChickenShootGame';
import LuckyWheelGame from './components/Games/LuckyWheel/LuckyWheelGame';
import SportsView from './components/Games/Sportsbook/SportsView';

// Modals
import DepositModal from './components/Modals/DepositModal';
import WithdrawModal from './components/Modals/WithdrawModal';
import ProfileModal from './components/Modals/ProfileModal';
import BonusesModal from './components/Modals/BonusesModal';

export default function App() {
  const { activeTab, activeGameId } = useGame();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');

  return (
    <div className="min-h-screen bg-raika-dark text-white flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 pt-3 pb-24">
        {activeTab === 'lobby' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Category Filter Pills */}
            <FilterPills
              activeFilter={categoryFilter}
              onSelectFilter={setCategoryFilter}
            />

            {/* Search & Provider Filter */}
            <ProvidersBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedProvider={providerFilter}
              onSelectProvider={setProviderFilter}
            />

            {/* Game Grid */}
            <GameGrid
              categoryFilter={categoryFilter}
              searchQuery={searchQuery}
              providerFilter={providerFilter}
            />
          </div>
        )}

        {activeTab === 'game' && activeGameId === 'chicken_shoot' && (
          <ChickenShootGame />
        )}

        {activeTab === 'sport' && (
          <SportsView />
        )}

        {activeTab === 'wheel' && (
          <LuckyWheelGame />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Side Slide-out Drawer Menu */}
      <DrawerMenu />

      {/* Pop-up Modals */}
      <DepositModal />
      <WithdrawModal />
      <ProfileModal />
      <BonusesModal />
    </div>
  );
}
