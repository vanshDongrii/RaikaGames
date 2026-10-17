import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// Lobby Components
import HeroSection from './components/Lobby/HeroSection';
import FilterPills from './components/Lobby/FilterPills';
import ProvidersBar from './components/Lobby/ProvidersBar';
import GameGrid from './components/Lobby/GameGrid';

// Active Game Views
import ChickenShootGame from './components/Games/ChickenShoot/ChickenShootGame';
import LuckyWheelGame from './components/Games/LuckyWheel/LuckyWheelGame';
import SportsView from './components/Games/Sportsbook/SportsView';
import MinesGame from './components/Games/Mines/MinesGame';
import CoinFlipGame from './components/Games/CoinFlip/CoinFlipGame';
import NumberGuessGame from './components/Games/NumberGuess/NumberGuessGame';
import TicTacToeGame from './components/Games/TicTacToe/TicTacToeGame';
import MemoryMatchGame from './components/Games/MemoryMatch/MemoryMatchGame';
import ReactionTestGame from './components/Games/ReactionTest/ReactionTestGame';
import RockPaperScissorsGame from './components/Games/RockPaperScissors/RockPaperScissorsGame';

// Modals
import DepositModal from './components/Modals/DepositModal';
import WithdrawModal from './components/Modals/WithdrawModal';
import ProfileModal from './components/Modals/ProfileModal';
import BonusesModal from './components/Modals/BonusesModal';
import InviteFriendsModal from './components/Modals/InviteFriendsModal';
import SettingsModal from './components/Modals/SettingsModal';
import ProviderGameModal from './components/Games/ProviderModal/ProviderGameModal';
import PlatformInfoModal from './components/Modals/PlatformInfoModal';

import { tg } from './utils/telegram';

export default function App() {
  const { activeTab, setActiveTab, activeGameId, setActiveGameId, openModal } = useGame();

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [discoveryFilter, setDiscoveryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [providerModalGame, setProviderModalGame] = useState(null);
  const [infoModal, setInfoModal] = useState({ open: false, type: 'about' });

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setDiscoveryFilter('all');
    setSearchQuery('');
    setProviderFilter('all');
  };

  // Telegram BackButton integration
  useEffect(() => {
    if (tg?.BackButton) {
      if (activeTab !== 'lobby') {
        tg.BackButton.show();
        const handleBack = () => {
          setActiveTab('lobby');
        };
        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.offClick(handleBack);
        };
      } else {
        tg.BackButton.hide();
      }
    }
  }, [activeTab, setActiveTab]);

  // Handle clicking on any game card
  const handleSelectGame = (game) => {
    if (game.isOriginal || game.playType === 'internal') {
      setActiveGameId(game.id);
      setActiveTab('game');
    } else {
      setProviderModalGame(game);
    }
  };

  const handleSelectCategory = (catId) => {
    setCategoryFilter(catId);
    setDiscoveryFilter('all');
  };

  const handleSelectDiscovery = (discId) => {
    setDiscoveryFilter(discId);
    setCategoryFilter('all');
  };

  return (
    <div className="min-h-screen bg-raika-dark text-white flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar */}
      <TopBar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar (Desktop fixed + Mobile slide-out drawer) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeFilter={discoveryFilter}
          onSelectFilter={handleSelectDiscovery}
          selectedCategory={categoryFilter}
          onSelectCategory={handleSelectCategory}
          onOpenInfoModal={(type) => setInfoModal({ open: true, type })}
        />

        {/* Main Content Area (offset by 240px on lg desktop) */}
        <main className="flex-1 w-full lg:pl-60 transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 pb-24 lg:pb-12">
            {/* 1. Main Casino Lobby View */}
            {activeTab === 'lobby' && (
              <div className="space-y-3 animate-fadeIn">
                {/* Hero Section: Banner + 4 Promotional Cards */}
                <HeroSection
                  onOpenBonuses={() => openModal('bonuses')}
                  onOpenInvite={() => setInviteModalOpen(true)}
                  onSelectCategory={handleSelectCategory}
                />

                {/* Horizontal Category Navigation Bar */}
                <FilterPills
                  activeFilter={categoryFilter}
                  onSelectFilter={handleSelectCategory}
                />

                {/* Search & Provider Filters Bar */}
                <ProvidersBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedProvider={providerFilter}
                  onSelectProvider={setProviderFilter}
                />

                {/* Dynamic Game Catalogue & Popular Section */}
                <GameGrid
                  categoryFilter={categoryFilter}
                  discoveryFilter={discoveryFilter}
                  searchQuery={searchQuery}
                  providerFilter={providerFilter}
                  onSelectGame={handleSelectGame}
                  onViewAllCategory={handleSelectCategory}
                  onResetFilters={handleResetFilters}
                />
              </div>
            )}

            {/* 2. Active Playable Games */}
            {activeTab === 'game' && (
              <div className="animate-fadeIn">
                {activeGameId === 'chicken_shoot' && <ChickenShootGame />}
                {activeGameId === 'mines' && <MinesGame />}
                {activeGameId === 'coin_flip' && <CoinFlipGame />}
                {activeGameId === 'number_guess' && <NumberGuessGame />}
                {activeGameId === 'tictactoe' && <TicTacToeGame />}
                {activeGameId === 'memory_match' && <MemoryMatchGame />}
                {activeGameId === 'reaction_test' && <ReactionTestGame />}
                {activeGameId === 'rps' && <RockPaperScissorsGame />}
                {activeGameId === 'lucky_wheel' && <LuckyWheelGame />}
                {/* Fallback if another game ID */}
                {!['chicken_shoot', 'mines', 'coin_flip', 'number_guess', 'tictactoe', 'memory_match', 'reaction_test', 'rps', 'lucky_wheel'].includes(activeGameId) && (
                  <ChickenShootGame />
                )}
              </div>
            )}

            {/* 3. Sport Section */}
            {activeTab === 'sport' && (
              <div className="animate-fadeIn">
                <SportsView />
              </div>
            )}

            {/* 4. Lucky Wheel Standalone View */}
            {activeTab === 'wheel' && (
              <div className="animate-fadeIn">
                <LuckyWheelGame />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Fixed Bottom Navigation (Mobile only, hidden on lg desktop) */}
      <BottomNav onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {/* Pop-up Modals */}
      <DepositModal />
      <WithdrawModal />
      <ProfileModal />
      <BonusesModal />
      <InviteFriendsModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <ProviderGameModal
        game={providerModalGame}
        onClose={() => setProviderModalGame(null)}
      />
      <PlatformInfoModal
        type={infoModal.type}
        isOpen={infoModal.open}
        onClose={() => setInfoModal({ open: false, type: 'about' })}
      />
    </div>
  );
}
