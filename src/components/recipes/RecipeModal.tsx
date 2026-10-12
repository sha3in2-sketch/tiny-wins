import React, { useState } from 'react';
import { usePantryStore } from '../../store/usePantryStore';
import { useUIStore } from '../../store/useUIStore';
import { RecipeCategory } from '../../types';

export const RecipeModal: React.FC = () => {
  const { recipeModalOpen, editingRecipeId, closeRecipeModal } = useUIStore();
  const { recipes, addRecipe, updateRecipe, deleteRecipe, addIngredientQuick } =
    usePantryStore();

  const isEditing = Boolean(editingRecipeId);
  const existingRecipe = recipes.find((r) => r.id === editingRecipeId);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Dinner');
  const [ingredientsText, setIngredientsText] = useState('');
  const [methodText, setMethodText] = useState('');
  const [pasteDraft, setPasteDraft] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'paste'>('form');

  // Initialize or reset form fields
  React.useEffect(() => {
    if (existingRecipe) {
      setName(existingRecipe.name);
      setCategory(existingRecipe.category);
      setIngredientsText(existingRecipe.ingredientRefs.map((r) => r.rawText).join(', '));
      setMethodText(existingRecipe.rawMethod);
    } else {
      setName('');
      setCategory('Dinner');
      setIngredientsText('');
      setMethodText('');
      setPasteDraft('');
    }
  }, [existingRecipe, recipeModalOpen]);

  if (!recipeModalOpen) return null;

  const categories: RecipeCategory[] = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
    'Dessert',
    'Drink',
  ];

  // Quick parser for pasted recipe text: "name | category | ings | method" or multi-line
  const handleParsePaste = () => {
    const raw = pasteDraft.trim();
    if (!raw) return;

    if (raw.includes('|')) {
      const [n, c, i, m] = raw.split('|');
      if (n) setName(n.trim());
      if (c && categories.includes(c.trim() as any)) setCategory(c.trim() as any);
      if (i) setIngredientsText(i.trim());
      if (m) setMethodText(m.trim());
      setActiveTab('form');
    } else {
      // Freeform lines: first line name, followed by lines
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) setName(lines[0]);
      if (lines.length > 1) {
        setMethodText(lines.slice(1).join('\n'));
      }
      setActiveTab('form');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const rawIngList = ingredientsText
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    if (rawIngList.length === 0) return;

    // Process ingredients and create missing ones in pantry
    const ingredientRefs = [];
    for (const rawIng of rawIngList) {
      const ing = await addIngredientQuick(rawIng, false);
      ingredientRefs.push({
        ingredientId: ing.id,
        rawText: rawIng,
      });
    }

    const steps = methodText
      .split(/(?<=\.)\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditing && existingRecipe) {
      await updateRecipe({
        ...existingRecipe,
        name: cleanName,
        category,
        ingredientRefs,
        method: steps.length > 0 ? steps : [methodText],
        rawMethod: methodText,
        updatedAt: Date.now(),
      });
    } else {
      await addRecipe({
        name: cleanName,
        category,
        ingredientRefs,
        method: steps.length > 0 ? steps : [methodText],
        rawMethod: methodText,
        favorite: false,
        source: 'user',
      });
    }

    closeRecipeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[500px] gl p-7 rounded-[24px] border border-line bg-[#121a16] text-ink relative shadow-2xl">
        <button
          onClick={closeRecipeModal}
          className="absolute top-5 right-5 text-mut hover:text-ink text-sm"
          aria-label="Close dialog"
        >
          ✕
        </button>

        <h2 className="font-serif text-3xl font-medium tracking-tight mb-2">
          {isEditing ? 'Edit recipe' : 'New recipe'}
        </h2>

        {!isEditing && (
          <div className="flex gap-4 border-b border-line mb-4 text-xs">
            <button
              onClick={() => setActiveTab('form')}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === 'form' ? 'border-gold text-ink' : 'border-transparent text-mut'
              }`}
            >
              Manual entry
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === 'paste' ? 'border-gold text-ink' : 'border-transparent text-mut'
              }`}
            >
              Paste recipe text
            </button>
          </div>
        )}

        {activeTab === 'paste' ? (
          <div className="space-y-4">
            <p className="text-xs text-mut leading-relaxed">
              Paste in the format <code className="text-gold">Name | Category | ing1, ing2 | Method</code> or raw text lines.
            </p>
            <textarea
              rows={6}
              value={pasteDraft}
              onChange={(e) => setPasteDraft(e.target.value)}
              placeholder="Paneer Tikka | Dinner | paneer, curd, spices | Roast paneer."
              className="w-full text-sm p-3 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleParsePaste}
                className="border border-ink rounded-full px-5 py-2 text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90"
              >
                Parse & Review
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-mut mb-1.5 uppercase tracking-wider">
                Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masala Oats Khichdi"
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mut mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#121a16]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-mut mb-1.5 uppercase tracking-wider">
                Ingredients (comma-separated)
              </label>
              <textarea
                required
                rows={3}
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="rolled oats, carrots, green peas, cumin seeds"
                className="w-full text-sm p-3 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mut mb-1.5 uppercase tracking-wider">
                Method
              </label>
              <textarea
                rows={3}
                value={methodText}
                onChange={(e) => setMethodText(e.target.value)}
                placeholder="Roast oats. Sauté cumin seeds and veggies. Simmer for 10 min."
                className="w-full text-sm p-3 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isEditing && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Delete this recipe?')) {
                      await deleteRecipe(editingRecipeId!);
                      closeRecipeModal();
                    }
                  }}
                  className="text-xs text-clay hover:underline"
                >
                  Delete recipe
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={closeRecipeModal}
                  className="border border-line rounded-full px-5 py-2 text-xs font-medium text-ink hover:border-ink/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="border border-ink rounded-full px-6 py-2 text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
