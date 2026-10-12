import React, { useEffect } from 'react';
import { AuroraBackground } from './components/common/AuroraBackground';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { TodayScreen } from './components/screens/TodayScreen';
import { RecipesScreen } from './components/screens/RecipesScreen';
import { PantryScreen } from './components/screens/PantryScreen';
import { CookNowScreen } from './components/screens/CookNowScreen';
import { ShoppingScreen } from './components/screens/ShoppingScreen';
import { CookModal } from './components/cook/CookModal';
import { RecipeModal } from './components/recipes/RecipeModal';
import { BackupModal } from './components/backup/BackupModal';
import { CommandPalette } from './components/common/CommandPalette';
import { usePantryStore } from './store/usePantryStore';
import { useUIStore } from './store/useUIStore';

export const App: React.FC = () => {
  const { loadAll, isLoading } = usePantryStore();
  const { activeTab } = useUIStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1210] text-ink font-serif text-2xl">
        <AuroraBackground />
        <div className="flex items-center gap-3">
          <span className="animate-spin text-gold">✦</span>
          <span>Preparing kitchen pantry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col text-ink selection:bg-gold/30 selection:text-ink">
      {/* Background Aurora */}
      <AuroraBackground />

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-3.5 sm:px-5 py-2 sm:py-3 pb-24 md:pb-16">
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'recipes' && <RecipesScreen />}
        {activeTab === 'pantry' && <PantryScreen />}
        {activeTab === 'cook' && <CookNowScreen />}
        {activeTab === 'shopping' && <ShoppingScreen />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals and Overlays */}
      <CookModal />
      <RecipeModal />
      <BackupModal />
      <CommandPalette />
    </div>
  );
};
