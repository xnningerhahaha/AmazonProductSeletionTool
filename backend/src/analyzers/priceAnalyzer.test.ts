import { describe, it, expect } from 'vitest';
import priceAnalyzer from './priceAnalyzer';
import { ExtendedProductInfo } from '../types';

describe('Price Analyzer', () => {
  const createMockProduct = (price: number): ExtendedProductInfo => ({
    asin: 'B08N5WRWNW',
    title: 'Test Product',
    imageUrl: 'https://example.com/image.jpg',
    price,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 500,
    salesRank: 5000,
    category: 'Electronics'
  });

  it('should score low for low-price products', () => {
    const result = priceAnalyzer.analyze(createMockProduct(10));
    expect(result.score).toBeLessThan(60);
    expect(result.profitMargin).toBeTruthy();
  });

  it('should score medium for mid-price products', () => {
    const result = priceAnalyzer.analyze(createMockProduct(30));
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThan(80);
  });

  it('should score high for higher-price products', () => {
    const result = priceAnalyzer.analyze(createMockProduct(75));
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('should include profit margin', () => {
    const result = priceAnalyzer.analyze(createMockProduct(50));
    expect(result.profitMargin).toBeTruthy();
    expect(result.profitMargin).toMatch(/%$/);
  });

  it('should include description', () => {
    const result = priceAnalyzer.analyze(createMockProduct(50));
    expect(result.description).toBeTruthy();
    expect(typeof result.description).toBe('string');
  });
});
