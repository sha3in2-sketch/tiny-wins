import { describe, it, expect } from 'vitest';
import { normalizeIngredient, categorizeIngredient, slugify } from '../db/normalizer';

describe('normalizer', () => {
  it('correctly slugifies names by stripping parens and special chars', () => {
    expect(slugify('Gram Flour (besan)')).toBe('gram-flour');
    expect(slugify('Whole Wheat Flour (atta)')).toBe('whole-wheat-flour');
    expect(slugify('Cow Ghee')).toBe('cow-ghee');
  });

  it('resolves aliases into canonical names', () => {
    expect(normalizeIngredient('dahi').name).toBe('curd');
    expect(normalizeIngredient('yogurt').name).toBe('curd');
    expect(normalizeIngredient('atta').name).toBe('whole wheat flour');
    expect(normalizeIngredient('jeera').name).toBe('cumin seeds');
    expect(normalizeIngredient('hing').name).toBe('asafoetida (hing)');
    expect(normalizeIngredient('rajma').name).toBe('kidney beans (rajma)');
  });

  it('correctly auto-categorizes ingredients', () => {
    expect(categorizeIngredient('turmeric powder')).toBe('Spices');
    expect(categorizeIngredient('cumin seeds')).toBe('Spices');
    expect(categorizeIngredient('paneer')).toBe('Dairy');
    expect(categorizeIngredient('curd')).toBe('Dairy');
    expect(categorizeIngredient('whole wheat flour')).toBe('Flours & grains');
    expect(categorizeIngredient('kidney beans (rajma)')).toBe('Dals & legumes');
    expect(categorizeIngredient('mustard oil')).toBe('Oils & fats');
    expect(categorizeIngredient('bananas')).toBe('Fruits');
    expect(categorizeIngredient('jaggery powder')).toBe('Sweeteners');
    expect(categorizeIngredient('carrots')).toBe('Vegetables');
    expect(categorizeIngredient('tomato ketchup')).toBe('Sauces & packaged');
  });
});
