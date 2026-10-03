import { describe, expect, it } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { Product } from '../product/entities/product.entity.js';

describe('Category <-> Product (зв’язок з категоріями)', () => {
  it('Product.category — ManyToOne на Category через category_id', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(
      (r) => r.target === Product && r.propertyName === 'category',
    );
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('many-to-one');

    const joinCols = storage.joinColumns.filter(
      (j) => j.target === Product && j.propertyName === 'category',
    );
    expect(joinCols).toHaveLength(1);
    expect(joinCols[0].name).toBe('category_id');
  });

  it('Category.products — OneToMany на Product (інверсний бік)', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(
      (r) => r.target === Category && r.propertyName === 'products',
    );
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('one-to-many');
  });
});
