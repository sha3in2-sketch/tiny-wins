import React, { useMemo, useState } from 'react';
import { usePantryStore } from '../../store/usePantryStore';
import { useUIStore } from '../../store/useUIStore';
import { IngredientCategory } from '../../types';

export const PantryScreen: React.FC = () => {
  const {
    ingredients,
    recipes,
    staplesHidden,
    toggleIngredientState,
    setIngredientState,
    toggleAlwaysHave,
    addIngredientQuick,
    clearAllTicks,
    bulkSetShelfState,
    restockStaples,
    toggleStaplesHidden,
  } = usePantryStore();

  const { openBackupModal } = useUIStore();

  const [query, setQuery] = useState('');
  const [collapsedShelves, setCollapsedShelves] = useState<Set<string>>(new Set());
  const [contextMenuIngId, setContextMenuIngId] = useState<string | null>(null);

  // Compute usage counts for badge
  const usageCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of recipes) {
      for (const ref of r.ingredientRefs) {
        map.set(ref.ingredientId, (map.get(ref.ingredientId) || 0) + 1);
      }
    }
    return map;
  }, [recipes]);

  // Categories in preferred display order
  const categories: IngredientCategory[] = [
    'Spices',
    'Vegetables',
    'Dairy',
    'Flours & grains',
    'Dals & legumes',
    'Oils & fats',
    'Sweeteners',
    'Nuts & seeds',
    'Fruits',
    'Sauces & packaged',
    'Other',
  ];

  const haveCount = ingredients.filter((i) => i.state === 'have' || i.alwaysHave).length;

  const toggleShelf = (cat: string) => {
    setCollapsedShelves((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await addIngredientQuick(query.trim(), true);
    setQuery('');
  };

  // Grouped and filtered ingredients
  const filteredIngredients = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ingredients.filter((i) => {
      if (staplesHidden && i.alwaysHave) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [ingredients, query, staplesHidden]);

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, typeof ingredients>();
    for (const cat of categories) {
      map.set(cat, []);
    }
    for (const ing of filteredIngredients) {
      const list = map.get(ing.category) || [];
      list.push(ing);
      map.set(ing.category, list);
    }
    return map;
  }, [filteredIngredients]);

  return (
    <div className="space-y-4">
      {/* Top Action & Search Bar */}
      <div className="gl p-5 rounded-[20px] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleAdd} className="flex-1 min-w-[200px] flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter or add ingredient (e.g. coriander)..."
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none transition-colors"
            />
            {query.trim() && (
              <button
                type="submit"
                className="border border-ink rounded-full px-5 py-2 text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all"
              >
                + Add
              </button>
            )}
          </form>

          <button
            onClick={() => toggleStaplesHidden()}
            className={`border rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
              !staplesHidden
                ? 'bg-gold/20 border-gold text-gold'
                : 'border-line text-mut hover:text-ink'
            }`}
          >
            {staplesHidden ? 'Show staples' : 'Hide staples'}
          </button>

          <button
            onClick={() => restockStaples()}
            className="border border-line rounded-full px-3.5 py-2 text-xs font-medium text-mut hover:text-ink transition-colors"
            title="Mark all staple items as on-hand"
          >
            Restock staples
          </button>

          <button
            onClick={() => clearAllTicks()}
            className="border border-line rounded-full px-3.5 py-2 text-xs font-medium text-mut hover:text-clay transition-colors"
          >
            Clear ticks
          </button>

          <button
            onClick={() => openBackupModal()}
            className="border border-line rounded-full px-3.5 py-2 text-xs font-medium text-mut hover:text-ink transition-colors"
          >
            Backup / Restore
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-mut pt-1">
          <span>
            {haveCount} of {ingredients.length} items on hand
          </span>
          <span className="text-[11px]">
            Tap chip to cycle: <span className="text-sage font-medium">Have</span> →{' '}
            <span className="text-gold font-medium">Low</span> →{' '}
            <span className="text-mut font-medium">Out</span>
          </span>
        </div>
      </div>

      {/* Shelves by Category */}
      <div className="space-y-3.5">
        {categories.map((cat) => {
          const items = grouped.get(cat) || [];
          if (items.length === 0) return null;

          const isCollapsed = collapsedShelves.has(cat);
          const shelfHave = items.filter((i) => i.state === 'have' || i.alwaysHave).length;

          return (
            <div key={cat} className="gl p-5 rounded-[20px] transition-all">
              {/* Shelf Header */}
              <div
                onClick={() => toggleShelf(cat)}
                className="flex items-center justify-between cursor-pointer select-none pb-2"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-semibold tracking-[2px] uppercase text-mut">
                    {cat}
                  </h3>
                  <span className="text-[11px] text-mut px-2 py-0.5 rounded-full border border-line">
                    {shelfHave} / {items.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      bulkSetShelfState(cat, 'have');
                    }}
                    className="text-[10px] text-mut hover:text-sage transition-colors px-1.5 py-0.5"
                  >
                    All Have
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      bulkSetShelfState(cat, 'out');
                    }}
                    className="text-[10px] text-mut hover:text-clay transition-colors px-1.5 py-0.5"
                  >
                    Clear
                  </button>
                  <span className="text-mut text-xs ml-1">
                    {isCollapsed ? '▼' : '▲'}
                  </span>
                </div>
              </div>

              {/* Shelf Items */}
              {!isCollapsed && (
                <div className="flex flex-wrap gap-2 pt-3">
                  {items.map((ing) => {
                    const usage = usageCounts.get(ing.id) || 0;
                    const isHave = ing.state === 'have' || ing.alwaysHave;
                    const isLow = ing.state === 'low';

                    return (
                      <div key={ing.id} className="relative group">
                        <button
                          onClick={() => toggleIngredientState(ing.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenuIngId(
                              contextMenuIngId === ing.id ? null : ing.id
                            );
                          }}
                          className={`text-xs px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 select-none ${
                            isHave
                              ? 'border-sage/40 bg-sage/15 text-[#d6ecd9]'
                              : isLow
                              ? 'border-gold/40 bg-gold/15 text-gold'
                              : 'border-line text-mut hover:border-gold hover:text-ink'
                          }`}
                        >
                          <span>{isHave ? '✓ ' : isLow ? '⚡ ' : ''}{ing.name}</span>
                          {usage > 0 && (
                            <span className="text-[10px] opacity-60">· {usage}</span>
                          )}
                          {ing.alwaysHave && (
                            <span className="text-[9px] text-gold" title="Staple item">★</span>
                          )}
                        </button>

                        {/* Long-press / Context Menu Popover */}
                        {contextMenuIngId === ing.id && (
                          <div className="absolute z-20 left-0 top-full mt-1.5 gl p-2 rounded-xl border border-line bg-[#121a16] shadow-xl min-w-[150px] space-y-1">
                            <button
                              onClick={() => {
                                setIngredientState(ing.id, 'have');
                                setContextMenuIngId(null);
                              }}
                              className="w-full text-left text-xs px-2.5 py-1.5 rounded text-sage hover:bg-white/[0.05]"
                            >
                              Mark as Have
                            </button>
                            <button
                              onClick={() => {
                                setIngredientState(ing.id, 'low');
                                setContextMenuIngId(null);
                              }}
                              className="w-full text-left text-xs px-2.5 py-1.5 rounded text-gold hover:bg-white/[0.05]"
                            >
                              Mark Running Low
                            </button>
                            <button
                              onClick={() => {
                                setIngredientState(ing.id, 'out');
                                setContextMenuIngId(null);
                              }}
                              className="w-full text-left text-xs px-2.5 py-1.5 rounded text-clay hover:bg-white/[0.05]"
                            >
                              Mark Out of Stock
                            </button>
                            <div className="border-t border-line my-1" />
                            <button
                              onClick={() => {
                                toggleAlwaysHave(ing.id);
                                setContextMenuIngId(null);
                              }}
                              className="w-full text-left text-xs px-2.5 py-1.5 rounded text-ink hover:bg-white/[0.05]"
                            >
                              {ing.alwaysHave ? 'Remove Staple' : 'Set as Staple ★'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
