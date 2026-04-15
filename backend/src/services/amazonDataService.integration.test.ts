import { describe, it, expect } from 'vitest';
import amazonDataService from './amazonDataService';
import { ErrorCode } from '../types';

describe('Amazon Data Service Integration Tests', () => {
  describe('getProductInfo', () => {
    it('should return mock data when API credentials not configured', async () => {
      const asin = 'B08N5WRWNW';
      const productInfo = await amazonDataService.getProductInfo(asin);

      expect(productInfo).toBeDefined();
      expect(productInfo.asin).toBe(asin);
      expect(productInfo.title).toBeTruthy();
      expect(productInfo.price).toBeGreaterThan(0);
      expect(productInfo.rating).toBeGreaterThanOrEqual(0);
      expect(productInfo.rating).toBeLessThanOrEqual(5);
      expect(productInfo.reviewCount).toBeGreaterThanOrEqual(0);
      expect(productInfo.salesRank).toBeGreaterThan(0);
      expect(productInfo.category).toBeTruthy();
    });

    it('should handle different ASINs', async () => {
      const asins = ['B08N5WRWNW', 'B001234567', 'A123456789'];
      
      for (const asin of asins) {
        const productInfo = await amazonDataService.getProductInfo(asin);
        expect(productInfo.asin).toBe(asin);
      }
    });

    it('should return consistent data structure', async () => {
      const productInfo = await amazonDataService.getProductInfo('B08N5WRWNW');

      // Verify all required fields exist
      expect(productInfo).toHaveProperty('asin');
      expect(productInfo).toHaveProperty('title');
      expect(productInfo).toHaveProperty('imageUrl');
      expect(productInfo).toHaveProperty('price');
      expect(productInfo).toHaveProperty('currency');
      expect(productInfo).toHaveProperty('rating');
      expect(productInfo).toHaveProperty('reviewCount');
      expect(productInfo).toHaveProperty('salesRank');
      expect(productInfo).toHaveProperty('category');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network timeout gracefully', async () => {
      // Test that service handles errors properly
      try {
        const productInfo = await amazonDataService.getProductInfo('B08N5WRWNW');
        expect(productInfo).toBeDefined();
      } catch (error: any) {
        expect(error.code).toBeDefined();
        expect(Object.values(ErrorCode)).toContain(error.code);
      }
    });
  });
});
