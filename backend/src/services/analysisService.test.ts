import { describe, it, expect } from 'vitest';
import { analyzeProduct } from './analysisService';
import { ProductInfo } from '../types';

describe('Analysis Service', () => {
  const createMockProduct = (overrides: Partial<ProductInfo> = {}): ProductInfo => ({
    asin: 'B08N5WRWNW',
    title: 'Test Product',
    imageUrl: 'https://example.com/image.jpg',
    price: 29.99,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 500,
    salesRank: 5000,
    category: 'Electronics',
    ...overrides
  });

  it('should return recommended for high-scoring product', () => {
    const product = createMockProduct({
      reviewCount: 50,
      rating: 3.5,
      price: 50,
      salesRank: 3000
    });
    const result = analyzeProduct(product);
    
    expect(result.conclusion).toBe('recommended');
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });

  it('should return not_recommended for low-scoring product', () => {
    const product = createMockProduct({
      reviewCount: 5000,
      rating: 4.8,
      price: 10,
      salesRank: 120000
    });
    const result = analyzeProduct(product);
    
    expect(result.conclusion).toBe('not_recommended');
    expect(result.overallScore).toBeLessThan(70);
  });

  it('should include all dimension analyses', () => {
    const product = createMockProduct();
    const result = analyzeProduct(product);
    
    expect(result.dimensions.competition).toBeDefined();
    expect(result.dimensions.pricing).toBeDefined();
    expect(result.dimensions.demand).toBeDefined();
  });

  it('should calculate overall score with correct weights', () => {
    const product = createMockProduct();
    const result = analyzeProduct(product);
    
    const expectedScore = Math.round(
      result.dimensions.competition.score * 0.4 +
      result.dimensions.pricing.score * 0.3 +
      result.dimensions.demand.score * 0.3
    );
    
    expect(result.overallScore).toBe(expectedScore);
  });
});
