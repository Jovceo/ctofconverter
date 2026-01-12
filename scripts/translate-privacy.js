const fs = require('fs');
const path = require('path');
const translate = require('@vitalets/google-translate-api');

// 读取 next.config.js 中的 locales 配置
const nextConfig = require('../next.config');
const locales = nextConfig.i18n.locales;
const defaultLocale = nextConfig.i18n.defaultLocale;

// 读取英文原文 JSON
const enFile = path.join(__dirname, '..', 'public', 'locales', 'en', 'privacy-policy.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

// 需要翻译的字段
const fields = ['title', 'description', 'content'];

async function translateField(text, target) {
    const res = await translate(text, { from: 'en', to: target });
    return res.text;
}

async function main() {
    for (const locale of locales) {
        if (locale === defaultLocale) continue; // 已有英文
        console.log(`Translating to ${locale}...`);
        const out = {};
        for (const field of fields) {
            const src = enData[field];
            // content 包含 HTML，直接翻译可能破坏标签，故只翻译文本部分
            if (field === 'content') {
                // 简单处理：去掉标签，仅翻译纯文本后再拼回（这里使用原始 content，实际可改进）
                out[field] = src; // 暂时保留英文，后续人工校对
            } else {
                out[field] = await translateField(src, locale);
            }
        }
        const outPath = path.join(__dirname, '..', 'public', 'locales', locale, 'privacy-policy.json');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
        console.log(`✅ ${locale} done`);
    }
}

main().catch(err => console.error('Translation error:', err));
