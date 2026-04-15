import { describe, it, expect } from 'vitest';
import competitionAnalyzer from './competitionAnalyzer';
import { ExtendedProductInfo } from '../types';

describe('Competition Analyzer', () => {
  const createMockProduct = (reviewCount: number, rating: number): ExtendedProductInfo => ({
    asin: 'B08N5WRWNW',
    title: 'Test Product',
    imageUrl: 'https://example.com/image.jpg',
    price: 29.99,
    currency: 'USD',
    rating,
    reviewCount,
    salesRank: 5000,
    category: 'Electronics'
  });

  it('should score high for low competition (few reviews, low rating)', () => {
    const result = competitionAnalyzer.analyze(createMockProduct(50, 3.2));
    expect(result.score).toBeGreaterThan(70);
    expect(result.level).toBe('low');
  });

  it('should score medium for moderate competition', () => {
    const result = competitionAnalyzer.analyze(createMockProduct(500, 4.0));
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(70);
    expect(result.level).toBe('medium');
  });

  it('should score low for high competition (many reviews, high rating)', () => {
    const result = competitionAnalyzer.analyze(createMockProduct(2000, 4.7));
    expect(result.score).toBeLessThan(40);
    expect(result.level).toBe('high');
  });

  it('should include description', () => {
    const result = competitionAnalyzer.analyze(createMockProduct(100, 4.0));
    expect(result.description).toBeTruthy();
    expect(typeof result.description).toBe('string');
  });
});
