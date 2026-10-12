import React, { useMemo } from 'react';
import { usePantryStore } from '../../store/usePantryStore';

export const ShoppingScreen: React.FC = () => {
  const {
    ingredients,
    shoppingList,
    toggleShoppingItem,
    clearCheckedShopping,
    addToShoppingList,
  } = usePantryStore();

  const [customItem, setCustomItem] = React.useState('');

  // Auto-derived items needed: running low or out of stock items
  const autoItems = useMemo(() => {
    return ingredients
      .filter((i) => i.state === 'low' || i.state === 'out')
      .map((i) => ({
        id: `auto-${i.id}`,
        name: i.name,
        category: i.category,
        reason: i.state,
      }));
  }, [ingredients]);

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    await addToShoppingList({
      ingredientId: customItem.toLowerCase().trim(),
      name: customItem.trim(),
      category: 'Other',
      reason: 'out',
      checked: false,
    });
    setCustomItem('');
  };

  const handleExportText = () => {
    const lines = [
      '🛒 Pantry Shopping List:',
      '',
      '-- Low / Out of stock items --',
      ...autoItems.map((i) => `[ ] ${i.name} (${i.reason})`),
      '',
      '-- Custom / Added items --',
      ...shoppingList.map((i) => `[${i.checked ? 'X' : ' '}] ${i.name}`),
    ];
    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    alert('Shopping list copied to clipboard!');
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="gl p-5 rounded-[20px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">Shopping List</h2>
          <p className="text-xs text-mut">
            Auto-populated from items that are running low or out of stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportText}
            className="border border-line rounded-full px-4 py-2 text-xs font-medium text-ink hover:border-gold transition-colors"
          >
            📋 Export text / Copy
          </button>
          {shoppingList.some((s) => s.checked) && (
            <button
              onClick={clearCheckedShopping}
              className="border border-line rounded-full px-4 py-2 text-xs font-medium text-clay hover:underline transition-colors"
            >
              Clear checked
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Custom Item */}
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <input
          type="text"
          value={customItem}
          onChange={(e) => setCustomItem(e.target.value)}
          placeholder="Add extra item to shopping list (e.g. olive oil, napkins)..."
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
        />
        <button
          type="submit"
          className="border border-ink rounded-full px-5 py-2 text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90"
        >
          Add item
        </button>
      </form>

      {/* Auto Low/Out Section */}
      <div className="gl p-6 rounded-[20px] space-y-3">
        <h3 className="text-xs font-medium tracking-[2px] uppercase text-mut">
          Pantry Needs Restocking ({autoItems.length})
        </h3>
        {autoItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {autoItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-white/[0.02]"
              >
                <span className="text-sm font-medium text-ink">{item.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.reason === 'low'
                      ? 'bg-gold/20 text-gold'
                      : 'bg-clay/20 text-clay'
                  }`}
                >
                  {item.reason === 'low' ? 'Running Low' : 'Out'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-mut">Your pantry is fully stocked! No items marked low or out.</p>
        )}
      </div>

      {/* Custom Shopping Items */}
      {shoppingList.length > 0 && (
        <div className="gl p-6 rounded-[20px] space-y-3">
          <h3 className="text-xs font-medium tracking-[2px] uppercase text-mut">
            Custom Items ({shoppingList.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shoppingList.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-white/[0.02] cursor-pointer hover:border-gold/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleShoppingItem(item.id)}
                  className="rounded text-gold focus:ring-gold"
                />
                <span
                  className={`text-sm ${
                    item.checked ? 'line-through text-mut' : 'text-ink'
                  }`}
                >
                  {item.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
