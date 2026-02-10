#!/usr/bin/env node
/**
 * 翻译验证脚本
 * 确保所有语言文件结构完整，无缺失 key
 * 检测可能的未翻译英文内容
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'pt-br', 'hi', 'ar', 'id'];

// 获取所有温度页面
function getTemperaturePages() {
  const pagesDir = path.join(process.cwd(), 'pages');
  const files = fs.readdirSync(pagesDir);
  
  return files
    .filter(file => file.match(/^\d+(?:-\d+)?-c-to-f\.tsx$/))
    .map(file => file.replace('.tsx', ''));
}

// 提取所有键（递归）
function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys.push(...extractKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// 获取嵌套值
function getValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

// 检测英文内容（简单启发式）
function containsEnglish(text) {
  if (typeof text !== 'string') return false;
  // 检测常见的英文单词（3个字母以上）
  const commonEnglishWords = /\b(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|man|new|now|old|see|two|way|who|boy|did|its|let|put|say|she|too|use|fever|temperature|oral|adult|baby|normal|celsius|fahrenheit)\b/gi;
  const matches = text.match(commonEnglishWords);
  return matches && matches.length >= 2; // 至少2个英文单词
}

// 验证单个页面
function validatePage(page, locale, enKeys, enJSON) {
  const issues = [];
  const localePath = path.join('locales', locale, `${page}.json`);
  
  if (!fs.existsSync(localePath)) {
    issues.push({
      type: 'missing_file',
      message: `❌ Missing file: ${locale}/${page}.json`,
      severity: 'error'
    });
    return issues;
  }
  
  const localeJSON = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  
  for (const key of enKeys) {
    const value = getValue(localeJSON, key);
    
    if (value === undefined) {
      issues.push({
        type: 'missing_key',
        key,
        message: `❌ Missing key: ${locale}/${page}.json: ${key}`,
        severity: 'error'
      });
    } else if (value === '') {
      issues.push({
        type: 'empty_key',
        key,
        message: `⚠️  Empty key: ${locale}/${page}.json: ${key}`,
        severity: 'warning'
      });
    } else if (typeof value === 'string' && locale !== 'en') {
      // 检查占位符是否保留
      const enValue = getValue(enJSON, key);
      if (typeof enValue === 'string') {
        const enPlaceholders = enValue.match(/\{[^}]+\}/g) || [];
        const localePlaceholders = value.match(/\{[^}]+\}/g) || [];
        
        for (const placeholder of enPlaceholders) {
          if (!localePlaceholders.includes(placeholder)) {
            issues.push({
              type: 'missing_placeholder',
              key,
              placeholder,
              message: `⚠️  Missing placeholder ${placeholder}: ${locale}/${page}.json: ${key}`,
              severity: 'error'
            });
          }
        }
      }
      
      // 检测可能的未翻译内容（排除包含占位符的字符串）
      if (!value.includes('{') && containsEnglish(value)) {
        issues.push({
          type: 'possible_english',
          key,
          value: value.substring(0, 50),
          message: `⚠️  Possible untranslated: ${locale}/${page}.json: ${key} = "${value.substring(0, 50)}..."`,
          severity: 'warning'
        });
      }
    }
  }
  
  return issues;
}

// 主验证函数
function validate() {
  console.log('🔍 Starting translation validation...\n');
  
  const pages = getTemperaturePages();
  console.log(`Found ${pages.length} temperature pages: ${pages.join(', ')}\n`);
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const page of pages) {
    const enPath = path.join('locales', 'en', `${page}.json`);
    if (!fs.existsSync(enPath)) {
      console.log(`⏩ Skipping ${page}: No English translation file found`);
      continue;
    }
    
    const enJSON = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const enKeys = extractKeys(enJSON);
    
    console.log(`\n📄 Checking ${page} (${enKeys.length} keys)...`);
    
    for (const locale of LOCALES) {
      if (locale === 'en') continue;
      
      const issues = validatePage(page, locale, enKeys, enJSON);
      
      for (const issue of issues) {
        console.log(issue.message);
        if (issue.severity === 'error') {
          totalErrors++;
        } else {
          totalWarnings++;
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Summary');
  console.log('='.repeat(50));
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('\n✅ All translations validated successfully!');
    process.exit(0);
  } else if (totalErrors === 0) {
    console.log('\n⚠️  Validation completed with warnings only');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed with errors');
    process.exit(1);
  }
}

// 运行验证
validate();
