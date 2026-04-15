/**
 * ASIN格式验证函数
 * ASIN必须是10位字母数字组合
 * @param asin - 待验证的ASIN字符串
 * @returns 是否为有效的ASIN格式
 */
export function validateAsin(asin: string): boolean {
  if (!asin || typeof asin !== 'string') {
    return false;
  }
  
  // ASIN必须是10位字母数字组合
  const asinRegex = /^[A-Z0-9]{10}$/;
  return asinRegex.test(asin.trim().toUpperCase());
}

/**
 * 标准化ASIN（转大写并去除空格）
 * @param asin - 待标准化的ASIN字符串
 * @returns 标准化后的ASIN
 */
export function normalizeAsin(asin: string): string {
  return asin.trim().toUpperCase();
}
