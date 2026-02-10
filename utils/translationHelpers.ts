/**
 * 安全翻译辅助函数
 * 完全消除硬编码，确保翻译缺失时明显可见
 */

/**
 * 安全获取翻译值
 * 当翻译缺失时返回明显的标记格式 [locale:path]
 * @param translations - 翻译对象
 * @param path - 点分隔的路径，如 'bodyTempRanges.ranges.adult'
 * @param locale - 当前语言代码
 * @returns 翻译值或标记字符串
 */
export function safeTranslate(
  translations: any,
  path: string,
  locale: string
): string {
  const keys = path.split('.');
  let value = translations;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // 翻译路径不存在 - 明显标记
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing: ${path} in ${locale}`);
      }
      return `[${locale}:${path}]`;
    }
  }
  
  if (typeof value !== 'string' || value.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Empty: ${path} in ${locale}`);
    }
    return `[${locale}:${path}]`;
  }
  
  return value;
}

/**
 * 批量翻译路径
 * 一次性获取多个翻译值
 * @param translations - 翻译对象
 * @param paths - 路径映射，如 { adult: 'bodyTempRanges.ranges.adult', baby: 'bodyTempRanges.ranges.baby' }
 * @param locale - 当前语言代码
 * @returns 翻译值映射
 */
export function translatePaths(
  translations: any,
  paths: Record<string, string>,
  locale: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, path] of Object.entries(paths)) {
    result[key] = safeTranslate(translations, path, locale);
  }
  return result;
}

/**
 * 安全翻译并替换占位符
 * 支持 {fahrenheit}, {celsius} 等占位符替换
 * @param translations - 翻译对象
 * @param path - 点分隔的路径
 * @param locale - 当前语言代码
 * @param replacements - 占位符替换对象
 * @returns 处理后的字符串
 */
export function safeTranslateWithReplacements(
  translations: any,
  path: string,
  locale: string,
  replacements: Record<string, string | number>
): string {
  let value = safeTranslate(translations, path, locale);
  
  // 替换占位符
  for (const [key, replacement] of Object.entries(replacements)) {
    value = value.replace(new RegExp(`{${key}}`, 'g'), String(replacement));
  }
  
  return value;
}

/**
 * 检查翻译是否完整
 * 用于验证所有必需的翻译键是否存在
 * @param translations - 翻译对象
 * @param requiredPaths - 必需的翻译路径数组
 * @param locale - 当前语言代码
 * @returns 缺失的路径数组
 */
export function checkMissingTranslations(
  translations: any,
  requiredPaths: string[],
  locale: string
): string[] {
  const missing: string[] = [];
  
  for (const path of requiredPaths) {
    const keys = path.split('.');
    let value = translations;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        missing.push(path);
        break;
      }
    }
    
    if (typeof value !== 'string' || value.trim() === '') {
      if (!missing.includes(path)) {
        missing.push(path);
      }
    }
  }
  
  if (missing.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(`[i18n] ${locale} missing ${missing.length} translations:`, missing);
  }
  
  return missing;
}

/**
 * 获取嵌套对象值
 * 辅助函数，用于安全访问嵌套对象
 * @param obj - 对象
 * @param path - 点分隔的路径
 * @returns 值或 undefined
 */
export function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}
