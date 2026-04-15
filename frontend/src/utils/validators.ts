/**
 * Validates ASIN format
 * ASIN must be exactly 10 alphanumeric characters
 * @param asin - The ASIN string to validate
 * @returns true if valid, false otherwise
 */
export function validateAsin(asin: string): boolean {
  if (!asin) return false;
  
  // ASIN must be exactly 10 characters
  if (asin.length !== 10) return false;
  
  // ASIN must contain only alphanumeric characters
  const asinRegex = /^[A-Z0-9]{10}$/i;
  return asinRegex.test(asin);
}

/**
 * Gets validation error message for ASIN
 * @param asin - The ASIN string to validate
 * @returns error message or empty string if valid
 */
export function getAsinValidationError(asin: string): string {
  if (!asin) return '';
  
  if (asin.length !== 10) {
    return 'ASIN必须是10位字符';
  }
  
  const asinRegex = /^[A-Z0-9]{10}$/i;
  if (!asinRegex.test(asin)) {
    return 'ASIN只能包含字母和数字';
  }
  
  return '';
}
