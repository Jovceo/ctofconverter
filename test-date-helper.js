// 测试 getLatestModifiedDate 函数
const { getLatestModifiedDate } = require('./utils/dateHelpers');

console.log('测试 getLatestModifiedDate 函数...\n');

// 测试1: 使用相对路径（与页面 getStaticProps 一致）
console.log('测试 41-c-to-f.tsx (相对路径):');
const date1 = getLatestModifiedDate([
    'pages/41-c-to-f.tsx',
    'pages/temperature-template.tsx'
]);
console.log('结果:', date1);
console.log('');

// 测试2: 使用绝对路径
console.log('测试 41-c-to-f.tsx (绝对路径):');
const path = require('path');
const date2 = getLatestModifiedDate([
    path.join(process.cwd(), 'pages/41-c-to-f.tsx'),
    path.join(process.cwd(), 'pages/temperature-template.tsx')
]);
console.log('结果:', date2);
console.log('');

// 测试3: 测试单个文件
console.log('测试单个文件 index.tsx:');
const date3 = getLatestModifiedDate([
    'pages/index.tsx'
]);
console.log('结果:', date3);
console.log('');

// 测试4: 测试不存在的文件
console.log('测试不存在的文件:');
const date4 = getLatestModifiedDate([
    'pages/nonexistent.tsx'
]);
console.log('结果:', date4);
console.log('');

// 测试5: 检查环境变量
console.log('环境信息:');
console.log('- 工作目录:', process.cwd());
console.log('- CI:', process.env.CI || '未设置');
console.log('- VERCEL:', process.env.VERCEL || '未设置');
console.log('- NETLIFY:', process.env.NETLIFY || '未设置');
