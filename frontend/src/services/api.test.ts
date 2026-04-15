import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeProduct, clearCache, ApiError } from './api';

// Mock fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe('analyzeProduct', () => {
    it('should make POST request with correct parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          productInfo: {
            asin: 'B08N5WRWNW',
            title: 'Test Product',
            imageUrl: 'https://example.com/image.jpg',
            price: 29.99,
            currency: 'USD',
            rating: 4.5,
            reviewCount: 500,
            salesRank: 5000,
            category: 'Electronics'
          },
          analysis: {
            conclusion: 'recommended' as const,
            overallScore: 75,
            dimensions: {
              competition: { score: 70, level: 'medium', description: 'Test' },
              pricing: { score: 80, profitMargin: '30-40%', description: 'Test' },
              demand: { score: 75, level: 'high', description: 'Test' }
            }
          }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await analyzeProduct('B08N5WRWNW', false);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asin: 'B08N5WRWNW' })
        })
      );

      expect(result.success).toBe(true);
      expect(result.data?.productInfo.asin).toBe('B08N5WRWNW');
    });

    it('should throw ApiError on failed response', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_ASIN',
          message: 'ASIN格式无效'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse
      });

      await expect(analyzeProduct('INVALID')).rejects.toThrow(ApiError);
    });

    it('should use cache for repeated requests', async () => {
      const mockResponse = {
        success: true,
        data: {
          productInfo: {
            asin: 'B08N5WRWNW',
            title: 'Test Product',
            imageUrl: 'https://example.com/image.jpg',
            price: 29.99,
            currency: 'USD',
            rating: 4.5,
            reviewCount: 500,
            salesRank: 5000,
            category: 'Electronics'
          },
          analysis: {
            conclusion: 'recommended' as const,
            overallScore: 75,
            dimensions: {
              competition: { score: 70, level: 'medium', description: 'Test' },
              pricing: { score: 80, profitMargin: '30-40%', description: 'Test' },
              demand: { score: 75, level: 'high', description: 'Test' }
            }
          }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // First call
      await analyzeProduct('B08N5WRWNW', true);
      
      // Second call should use cache
      await analyzeProduct('B08N5WRWNW', true);

      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(analyzeProduct('B08N5WRWNW')).rejects.toThrow(ApiError);
    });
  });

  describe('clearCache', () => {
    it('should clear cached data', async () => {
      const mockResponse = {
        success: true,
        data: {
          productInfo: {
            asin: 'B08N5WRWNW',
            title: 'Test Product',
            imageUrl: 'https://example.com/image.jpg',
            price: 29.99,
            currency: 'USD',
            rating: 4.5,
            reviewCount: 500,
            salesRank: 5000,
            category: 'Electronics'
          },
          analysis: {
            conclusion: 'recommended' as const,
            overallScore: 75,
            dimensions: {
              competition: { score: 70, level: 'medium', description: 'Test' },
              pricing: { score: 80, profitMargin: '30-40%', description: 'Test' },
              demand: { score: 75, level: 'high', description: 'Test' }
            }
          }
        }
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      // First call
      await analyzeProduct('B08N5WRWNW', true);
      
      // Clear cache
      clearCache();
      
      // Second call should not use cache
      await analyzeProduct('B08N5WRWNW', true);

      // Fetch should be called twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
