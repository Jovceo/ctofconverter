const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = 'e:/Trae-CN/ctofconverter/locales/en/f-to-c.json';
const content = fs.readFileSync(filePath, 'utf8');

// 删除第99-162行的重复practical定义
const lines = content.split('\n');
const filtered = [
    ...lines.slice(0, 96),  // 保留前96行（到maxOven为止）
    '            "maxOven": "Maximum home oven temperature",',
    '            "bakingTemp": "Baking temperature",',
    '            "broilingTemp": "Broiling temperature"',
    '        }',
    '    },',
    ...lines.slice(163)  // 从第163行开始继续（第二个practical开始）
];

fs.writeFileSync(filePath, filtered.join('\n'), '征8');
console.log('Fixed!');
