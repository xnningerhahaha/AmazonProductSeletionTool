import { describe, it, expect } from 'vitest';
import { validateAsin, getAsinValidationError } from './validators';

describe('Frontend ASIN Validation', () => {
  describe('validateAsin', () => {
    it('should validate correct ASIN format', () => {
      expect(validateAsin('B08N5WRWNW')).toBe(true);
      expect(validateAsin('B001234567')).toBe(true);
      expect(validateAsin('a123456789')).toBe(true);
    });

    it('should reject invalid ASIN length', () => {
      expect(validateAsin('B08N5WRW')).toBe(false);
      expect(validateAsin('B08N5WRWNW1')).toBe(false);
      expect(validateAsin('')).toBe(false);
    });

    it('should reject ASIN with special characters', () => {
      expect(validateAsin('B08N5WRW-W')).toBe(false);
      expect(validateAsin('B08N5WRW_W')).toBe(false);
    });
  });

  describe('getAsinValidationError', () => {
    it('should return empty string for valid ASIN', () => {
      expect(getAsinValidationError('B08N5WRWNW')).toBe('');
    });

    it('should return error for wrong length', () => {
      expect(getAsinValidationError('B08N5')).toBe('ASIN必须是10位字符');
    });

    it('should return error for invalid characters', () => {
      expect(getAsinValidationError('B08N5WRW-W')).toBe('ASIN只能包含字母和数字');
    });

    it('should return empty string for empty input', () => {
      expect(getAsinValidationError('')).toBe('');
    });
  });
});
