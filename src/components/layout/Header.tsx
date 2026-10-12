import React from 'react';
import { useUIStore, TabId } from '../../store/useUIStore';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, openRecipeModal } = useUIStore();

  const navItems: { id: TabId; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'cook', label: 'Cook now' },
    { id: 'shopping', label: 'Shopping' },
  ];

  return (
    <header className="max-w-[1100px] mx-auto px-4 sm:px-5 pt-4 sm:pt-7 pb-2 sm:pb-3 flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          Pantry<span className="text-gold">.</span>
        </h1>
      </div>

      {/* Desktop & Tablet Navigation */}
      <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`py-1 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                isActive
                  ? 'text-ink border-gold'
                  : 'text-mut border-transparent hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Top right actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => openRecipeModal()}
          className="border border-ink rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-gold"
        >
          + Recipe
        </button>
      </div>
    </header>
  );
};
