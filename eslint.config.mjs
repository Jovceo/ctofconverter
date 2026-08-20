// ESLint 9 flat config（Next 16 移除了 `next lint`，改为直接跑 eslint CLI）
// 规则与原 .eslintrc.json 等价；eslint-config-next 16 原生导出 flat 配置
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**', 'public/**', 'docs/**'] },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // 水合模式下「effect 里读 localStorage 再 setState」是合理写法（避免 SSR/客户端不一致），降级为 warn 保留信号
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler 场景的规则，对未启用编译器的存量代码误报极多（208 处），关闭
      'react-hooks/preserve-manual-memoization': 'off',
      'prefer-const': 'off',
    },
  },
];
