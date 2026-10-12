import { create } from 'zustand';
import { db } from '../db';
import { Ingredient, Recipe, ShoppingItem, IngredientState, IngredientCategory } from '../types';
import { normalizeIngredient } from '../db/normalizer';

interface PantryState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  staplesHidden: boolean;
  isLoading: boolean;

  // Actions
  loadAll: () => Promise<void>;
  toggleIngredientState: (id: string) => Promise<void>;
  setIngredientState: (id: string, state: IngredientState) => Promise<void>;
  toggleAlwaysHave: (id: string) => Promise<void>;
  addIngredientQuick: (rawName: string, markHave?: boolean) => Promise<Ingredient>;
  clearAllTicks: () => Promise<void>;
  bulkSetShelfState: (category: IngredientCategory, state: IngredientState) => Promise<void>;
  restockStaples: () => Promise<void>;
  toggleStaplesHidden: () => void;

  // Recipe actions
  toggleFavoriteRecipe: (id: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;

  // Shopping list actions
  addToShoppingList: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  clearCheckedShopping: () => Promise<void>;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  ingredients: [],
  recipes: [],
  shoppingList: [],
  staplesHidden: true,
  isLoading: true,

  loadAll: async () => {
    await db.seedIfEmpty();
    const [ingredients, recipes, shoppingList, settings] = await Promise.all([
      db.ingredients.toArray(),
      db.recipes.toArray(),
      db.shoppingList.toArray(),
      db.settings.get('main'),
    ]);

    set({
      ingredients,
      recipes,
      shoppingList,
      staplesHidden: settings?.staplesHidden ?? true,
      isLoading: false,
    });
  },

  toggleIngredientState: async (id: string) => {
    const ing = get().ingredients.find((x) => x.id === id);
    if (!ing) return;

    // Cycle: out -> have -> low -> out
    const nextState: Record<IngredientState, IngredientState> = {
      out: 'have',
      have: 'low',
      low: 'out',
    };
    const newState = nextState[ing.state];

    await db.ingredients.update(id, { state: newState, updatedAt: Date.now() });
    set((state) => ({
      ingredients: state.ingredients.map((x) => (x.id === id ? { ...x, state: newState } : x)),
    }));
  },

  setIngredientState: async (id: string, state: IngredientState) => {
    await db.ingredients.update(id, { state, updatedAt: Date.now() });
    set((s) => ({
      ingredients: s.ingredients.map((x) => (x.id === id ? { ...x, state } : x)),
    }));
  },

  toggleAlwaysHave: async (id: string) => {
    const ing = get().ingredients.find((x) => x.id === id);
    if (!ing) return;
    const newVal = !ing.alwaysHave;
    await db.ingredients.update(id, { alwaysHave: newVal, updatedAt: Date.now() });
    set((s) => ({
      ingredients: s.ingredients.map((x) => (x.id === id ? { ...x, alwaysHave: newVal } : x)),
    }));
  },

  addIngredientQuick: async (rawName: string, markHave = true) => {
    const { id, name, category } = normalizeIngredient(rawName);
    const existing = get().ingredients.find((x) => x.id === id);

    if (existing) {
      if (markHave && existing.state !== 'have') {
        await db.ingredients.update(id, { state: 'have', updatedAt: Date.now() });
        set((s) => ({
          ingredients: s.ingredients.map((x) => (x.id === id ? { ...x, state: 'have' } : x)),
        }));
      }
      return existing;
    }

    const newIng: Ingredient = {
      id,
      name,
      aliases: [rawName.toLowerCase()],
      category,
      state: markHave ? 'have' : 'out',
      alwaysHave: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.ingredients.add(newIng);
    set((s) => ({
      ingredients: [...s.ingredients, newIng],
    }));

    return newIng;
  },

  clearAllTicks: async () => {
    await db.transaction('rw', db.ingredients, async () => {
      const ings = await db.ingredients.toArray();
      for (const ing of ings) {
        if (ing.state !== 'out') {
          await db.ingredients.update(ing.id, { state: 'out' });
        }
      }
    });

    set((s) => ({
      ingredients: s.ingredients.map((x) => ({ ...x, state: 'out' })),
    }));
  },

  bulkSetShelfState: async (category: IngredientCategory, state: IngredientState) => {
    await db.transaction('rw', db.ingredients, async () => {
      const targets = await db.ingredients.where('category').equals(category).toArray();
      for (const t of targets) {
        await db.ingredients.update(t.id, { state });
      }
    });

    set((s) => ({
      ingredients: s.ingredients.map((x) => (x.category === category ? { ...x, state } : x)),
    }));
  },

  restockStaples: async () => {
    await db.transaction('rw', db.ingredients, async () => {
      const staples = await db.ingredients.where('alwaysHave').equals(1).toArray();
      for (const st of staples) {
        await db.ingredients.update(st.id, { state: 'have' });
      }
    });

    set((s) => ({
      ingredients: s.ingredients.map((x) => (x.alwaysHave ? { ...x, state: 'have' } : x)),
    }));
  },

  toggleStaplesHidden: () => {
    const newVal = !get().staplesHidden;
    set({ staplesHidden: newVal });
    db.settings.update('main', { staplesHidden: newVal });
  },

  toggleFavoriteRecipe: async (id: string) => {
    const rec = get().recipes.find((x) => x.id === id);
    if (!rec) return;
    const newVal = !rec.favorite;
    await db.recipes.update(id, { favorite: newVal, updatedAt: Date.now() });
    set((s) => ({
      recipes: s.recipes.map((x) => (x.id === id ? { ...x, favorite: newVal } : x)),
    }));
  },

  addRecipe: async (data) => {
    const id = `user-${Date.now()}`;
    const newRecipe: Recipe = {
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.recipes.add(newRecipe);
    set((s) => ({
      recipes: [...s.recipes, newRecipe],
    }));
    return id;
  },

  updateRecipe: async (recipe) => {
    await db.recipes.put(recipe);
    set((s) => ({
      recipes: s.recipes.map((x) => (x.id === recipe.id ? recipe : x)),
    }));
  },

  deleteRecipe: async (id: string) => {
    await db.recipes.delete(id);
    set((s) => ({
      recipes: s.recipes.filter((x) => x.id !== id),
    }));
  },

  addToShoppingList: async (item) => {
    const id = `shop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem: ShoppingItem = {
      ...item,
      id,
      createdAt: Date.now(),
    };
    await db.shoppingList.add(newItem);
    set((s) => ({
      shoppingList: [...s.shoppingList, newItem],
    }));
  },

  toggleShoppingItem: async (id: string) => {
    const item = get().shoppingList.find((x) => x.id === id);
    if (!item) return;
    const checked = !item.checked;
    await db.shoppingList.update(id, { checked });
    set((s) => ({
      shoppingList: s.shoppingList.map((x) => (x.id === id ? { ...x, checked } : x)),
    }));
  },

  clearCheckedShopping: async () => {
    await db.transaction('rw', db.shoppingList, async () => {
      const checked = await db.shoppingList.where('checked').equals(1).toArray();
      for (const item of checked) {
        await db.shoppingList.delete(item.id);
      }
    });
    set((s) => ({
      shoppingList: s.shoppingList.filter((x) => !x.checked),
    }));
  },
}));
