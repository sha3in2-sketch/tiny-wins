import Dexie, { type EntityTable } from 'dexie';
import { Ingredient, Recipe, ShoppingItem, AppSettings } from '../types';
import seedData from './seedRecipes.json';
import { normalizeIngredient } from './normalizer';

export class PantryDatabase extends Dexie {
  ingredients!: EntityTable<Ingredient, 'id'>;
  recipes!: EntityTable<Recipe, 'id'>;
  shoppingList!: EntityTable<ShoppingItem, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('PantryDatabase');
    this.version(1).stores({
      ingredients: 'id, name, category, state, alwaysHave',
      recipes: 'id, name, category, favorite, source, createdAt',
      shoppingList: 'id, ingredientId, reason, checked',
      settings: 'id',
    });
  }

  /**
   * Seeds the database with all 61 prototype recipes on first initialization
   */
  async seedIfEmpty(): Promise<void> {
    const recipeCount = await this.recipes.count();
    if (recipeCount > 0) return;

    console.log('Database empty: Seeding 61 recipes and initial pantry...');

    const ingredientMap = new Map<string, Ingredient>();
    const recipesToInsert: Recipe[] = [];

    // Common kitchen staples that default to alwaysHave
    const stapleNames = new Set([
      'water',
      'salt',
      'black pepper',
      'mustard oil',
      'olive oil',
      'cow ghee',
      'turmeric powder',
      'cumin seeds',
      'mustard seeds',
      'asafoetida (hing)',
    ]);

    for (const r of seedData) {
      const ingredientRefs = [];

      for (const rawIng of r.ingredients) {
        const { id, name, category } = normalizeIngredient(rawIng);
        if (!ingredientMap.has(id)) {
          ingredientMap.set(id, {
            id,
            name,
            aliases: [rawIng.toLowerCase()],
            category,
            state: 'out', // Initial state
            alwaysHave: stapleNames.has(name) || stapleNames.has(rawIng.toLowerCase()),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else {
          // Add alias if different
          const existing = ingredientMap.get(id)!;
          const lower = rawIng.toLowerCase();
          if (!existing.aliases.includes(lower)) {
            existing.aliases.push(lower);
          }
        }

        ingredientRefs.push({
          ingredientId: id,
          rawText: rawIng,
        });
      }

      // Parse step-by-step method from raw sentences
      const steps = r.method
        .split(/(?<=\.)\s+/)
        .map((s: string) => s.trim())
        .filter(Boolean);

      recipesToInsert.push({
        id: r.id,
        name: r.name,
        category: r.category as any,
        ingredientRefs,
        method: steps.length > 0 ? steps : [r.method],
        rawMethod: r.method,
        favorite: false,
        source: 'seed',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    await this.transaction('rw', this.ingredients, this.recipes, this.settings, async () => {
      await this.ingredients.bulkAdd(Array.from(ingredientMap.values()));
      await this.recipes.bulkAdd(recipesToInsert);
      await this.settings.put({
        id: 'main',
        staplesHidden: true,
        theme: 'dark',
      });
    });

    console.log(
      `Seeded ${recipesToInsert.length} recipes and ${ingredientMap.size} distinct pantry ingredients.`
    );
  }
}

export const db = new PantryDatabase();
