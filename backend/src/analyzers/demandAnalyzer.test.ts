import { describe, it, expect } from 'vitest';
import demandAnalyzer from './demandAnalyzer';
import { ExtendedProductInfo } from '../types';

describe('Demand Analyzer', () => {
  const createMockProduct = (salesRank: number): ExtendedProductInfo => ({
    asin: 'B08N5WRWNW',
    title: 'Test Product',
    imageUrl: 'https://example.com/image.jpg',
    price: 29.99,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 500,
    salesRank,
    category: 'Electronics'
  });

  it('should score high for top-ranked products', () => {
    const result = demandAnalyzer.analyze(createMockProduct(5000));
    expect(result.score).toBeGreaterThan(80);
    expect(result.level).toBe('low');
  });

  it('should score medium for mid-ranked products', () => {
    const result = demandAnalyzer.analyze(createMockProduct(30000));
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThan(80);
    expect(result.level).toBe('medium');
  });

  it('should score low for poorly-ranked products', () => {
    const result = demandAnalyzer.analyze(createMockProduct(80000));
    expect(result.score).toBeLessThan(50);
    expect(result.level).toBe('high');
  });

  it('should score very low for very poorly-ranked products', () => {
    const result = demandAnalyzer.analyze(createMockProduct(150000));
    expect(result.score).toBeLessThan(30);
    expect(result.level).toBe('critical');
  });

  it('should include description', () => {
    const result = demandAnalyzer.analyze(createMockProduct(10000));
    expect(result.description).toBeTruthy();
    expect(typeof result.description).toBe('string');
  });
});
