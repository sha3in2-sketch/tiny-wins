import React, { useState } from 'react';
import { usePantryStore } from '../../store/usePantryStore';
import { useUIStore } from '../../store/useUIStore';
import { db } from '../../db';

export const BackupModal: React.FC = () => {
  const { backupModalOpen, closeBackupModal } = useUIStore();
  const { ingredients, recipes, shoppingList, loadAll } = usePantryStore();

  const [importText, setImportText] = useState('');
  const [diffSummary, setDiffSummary] = useState<{
    newRecipes: number;
    updatedRecipes: number;
    newIngredients: number;
    parsedData: any;
  } | null>(null);

  if (!backupModalOpen) return null;

  // JSON Export handler
  const handleExport = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      ingredients,
      recipes,
      shoppingList,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantry-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Inspect & Diff pre-import
  const handleInspectImport = () => {
    try {
      const data = JSON.parse(importText);
      if (!data.ingredients || !data.recipes) {
        alert('Invalid backup file: missing recipes or ingredients.');
        return;
      }

      const existingRecipeIds = new Set(recipes.map((r) => r.id));
      const existingIngIds = new Set(ingredients.map((i) => i.id));

      let newRecipes = 0;
      let updatedRecipes = 0;
      for (const r of data.recipes) {
        if (existingRecipeIds.has(r.id)) updatedRecipes++;
        else newRecipes++;
      }

      let newIngredients = 0;
      for (const i of data.ingredients) {
        if (!existingIngIds.has(i.id)) newIngredients++;
      }

      setDiffSummary({
        newRecipes,
        updatedRecipes,
        newIngredients,
        parsedData: data,
      });
    } catch (err) {
      alert('Failed to parse JSON. Please verify file contents.');
    }
  };

  const handleApplyImport = async () => {
    if (!diffSummary) return;
    const { parsedData } = diffSummary;

    await db.transaction('rw', db.ingredients, db.recipes, db.shoppingList, async () => {
      if (parsedData.ingredients?.length) {
        await db.ingredients.bulkPut(parsedData.ingredients);
      }
      if (parsedData.recipes?.length) {
        await db.recipes.bulkPut(parsedData.recipes);
      }
      if (parsedData.shoppingList?.length) {
        await db.shoppingList.bulkPut(parsedData.shoppingList);
      }
    });

    await loadAll();
    alert('Import applied successfully!');
    closeBackupModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[520px] gl p-7 rounded-[24px] border border-line bg-[#121a16] text-ink relative shadow-2xl space-y-5">
        <button
          onClick={closeBackupModal}
          className="absolute top-5 right-5 text-mut hover:text-ink text-sm"
          aria-label="Close dialog"
        >
          ✕
        </button>

        <h2 className="font-serif text-3xl font-medium tracking-tight">
          Backup & Restore
        </h2>

        {/* Export Section */}
        <div className="p-4 rounded-xl border border-line bg-white/[0.02] flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-ink">Export Pantry Data</div>
            <div className="text-xs text-mut">
              Downloads a complete JSON snapshot ({recipes.length} recipes, {ingredients.length} ingredients)
            </div>
          </div>
          <button
            onClick={handleExport}
            className="border border-ink rounded-full px-4 py-2 text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90"
          >
            Export JSON
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-mut uppercase tracking-wider">
            Restore / Import JSON
          </label>
          <textarea
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste exported JSON here..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none"
          />

          {!diffSummary ? (
            <button
              onClick={handleInspectImport}
              disabled={!importText.trim()}
              className="border border-line rounded-full px-5 py-2 text-xs font-medium text-ink hover:border-gold disabled:opacity-30"
            >
              Inspect Backup Diff
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-gold/40 bg-gold/10 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold">
                Diff Preview
              </h4>
              <ul className="text-xs space-y-1 text-ink">
                <li>• New recipes to add: {diffSummary.newRecipes}</li>
                <li>• Existing recipes to update: {diffSummary.updatedRecipes}</li>
                <li>• New pantry ingredients: {diffSummary.newIngredients}</li>
              </ul>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApplyImport}
                  className="border border-gold rounded-full px-5 py-2 text-xs font-medium bg-gold text-[#0d1210] hover:bg-opacity-90 font-semibold"
                >
                  Confirm & Apply Import
                </button>
                <button
                  onClick={() => setDiffSummary(null)}
                  className="text-xs text-mut hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
