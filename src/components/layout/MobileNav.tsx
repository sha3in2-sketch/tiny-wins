import React from 'react';
import { useUIStore, TabId } from '../../store/useUIStore';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: { id: TabId; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: '✦' },
    { id: 'recipes', label: 'Recipes', icon: '📖' },
    { id: 'pantry', label: 'Pantry', icon: '🥫' },
    { id: 'cook', label: 'Cook', icon: '🍳' },
    { id: 'shopping', label: 'Shop', icon: '🛒' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121a16]/95 backdrop-blur-xl border-t border-line px-2 py-1.5 flex items-center justify-around"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-gold font-medium'
                : 'text-mut hover:text-ink'
            }`}
          >
            <span className="text-base leading-none mb-1">{item.icon}</span>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
