import { describe, it, expect } from 'vitest';
import { validateAsin, normalizeAsin } from './validators';

describe('ASIN Validation', () => {
  describe('validateAsin', () => {
    it('should validate correct ASIN format', () => {
      expect(validateAsin('B08N5WRWNW')).toBe(true);
      expect(validateAsin('B001234567')).toBe(true);
      expect(validateAsin('A123456789')).toBe(true);
    });

    it('should reject invalid ASIN length', () => {
      expect(validateAsin('B08N5WRW')).toBe(false);
      expect(validateAsin('B08N5WRWNW1')).toBe(false);
      expect(validateAsin('')).toBe(false);
    });

    it('should reject ASIN with special characters', () => {
      expect(validateAsin('B08N5WRW-W')).toBe(false);
      expect(validateAsin('B08N5WRW_W')).toBe(false);
      expect(validateAsin('B08N5WRW W')).toBe(false);
    });

    it('should handle lowercase ASIN', () => {
      expect(validateAsin('b08n5wrwnw')).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateAsin(null as any)).toBe(false);
      expect(validateAsin(undefined as any)).toBe(false);
    });
  });

  describe('normalizeAsin', () => {
    it('should convert to uppercase', () => {
      expect(normalizeAsin('b08n5wrwnw')).toBe('B08N5WRWNW');
    });

    it('should trim whitespace', () => {
      expect(normalizeAsin(' B08N5WRWNW ')).toBe('B08N5WRWNW');
    });
  });
});
