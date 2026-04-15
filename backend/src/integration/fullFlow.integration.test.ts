import { describe, it, expect } from 'vitest';
import amazonDataService from '../services/amazonDataService';
import { analyzeProduct } from '../services/analysisService';
import { validateAsin, normalizeAsin } from '../utils/validators';

describe('Full Analysis Flow Integration Tests', () => {
  it('should complete full analysis flow from ASIN to result', async () => {
    const asin = 'B08N5WRWNW';

    // Step 1: Validate ASIN
    expect(validateAsin(asin)).toBe(true);

    // Step 2: Normalize ASIN
    const normalizedAsin = normalizeAsin(asin);
    expect(normalizedAsin).toBe(asin);

    // Step 3: Get product info
    const productInfo = await amazonDataService.getProductInfo(normalizedAsin);
    expect(productInfo).toBeDefined();
    expect(productInfo.asin).toBe(normalizedAsin);

    // Step 4: Analyze product
    const analysis = analyzeProduct(productInfo);
    expect(analysis).toBeDefined();
    expect(analysis.conclusion).toMatch(/^(recommended|not_recommended)$/);
    expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
    expect(analysis.overallScore).toBeLessThanOrEqual(100);

    // Step 5: Verify all dimensions
    expect(analysis.dimensions.competition).toBeDefined();
    expect(analysis.dimensions.pricing).toBeDefined();
    expect(analysis.dimensions.demand).toBeDefined();

    // Verify dimension scores
    expect(analysis.dimensions.competition.score).toBeGreaterThanOrEqual(0);
    expect(analysis.dimensions.competition.score).toBeLessThanOrEqual(100);
    expect(analysis.dimensions.pricing.score).toBeGreaterThanOrEqual(0);
    expect(analysis.dimensions.pricing.score).toBeLessThanOrEqual(100);
    expect(analysis.dimensions.demand.score).toBeGreaterThanOrEqual(0);
    expect(analysis.dimensions.demand.score).toBeLessThanOrEqual(100);
  });

  it('should handle invalid ASIN in flow', () => {
    const invalidAsin = 'INVALID';
    expect(validateAsin(invalidAsin)).toBe(false);
  });

  it('should produce consistent results for same product', async () => {
    const asin = 'B08N5WRWNW';
    
    // Run analysis twice
    const productInfo1 = await amazonDataService.getProductInfo(asin);
    const analysis1 = analyzeProduct(productInfo1);
    
    const productInfo2 = await amazonDataService.getProductInfo(asin);
    const analysis2 = analyzeProduct(productInfo2);

    // Results should be consistent
    expect(analysis1.conclusion).toBe(analysis2.conclusion);
    expect(analysis1.overallScore).toBe(analysis2.overallScore);
  });

  it('should handle different product scenarios', async () => {
    // High competition scenario
    const highCompProduct = {
      asin: 'TEST001',
      title: 'High Competition Product',
      imageUrl: 'https://example.com/image.jpg',
      price: 29.99,
      currency: 'USD',
      rating: 4.8,
      reviewCount: 5000,
      salesRank: 150000,
      category: 'Electronics'
    };

    const highCompAnalysis = analyzeProduct(highCompProduct);
    expect(highCompAnalysis.dimensions.competition.score).toBeLessThan(50);

    // Low competition scenario
    const lowCompProduct = {
      ...highCompProduct,
      asin: 'TEST002',
      rating: 3.2,
      reviewCount: 50,
      salesRank: 5000
    };

    const lowCompAnalysis = analyzeProduct(lowCompProduct);
    expect(lowCompAnalysis.dimensions.competition.score).toBeGreaterThan(50);
  });
});
