import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';

export default function Document(props: DocumentProps) {
  const { locale } = props.__NEXT_DATA__ || { locale: 'en' };

  // Map locale to precise language codes for better i18n SEO
  const langMap: Record<string, string> = {
    'zh': 'zh-CN',      // 简体中文（中国大陆）
    'pt-br': 'pt-BR',   // 葡萄牙语（巴西）
    'en': 'en',
    'es': 'es',
    'hi': 'hi',
    'ar': 'ar',
    'ja': 'ja',
    'fr': 'fr',
    'de': 'de',
    'id': 'id'
  };

  const htmlLang = locale ? (langMap[locale] || locale) : 'en';

  return (
    <Html lang={htmlLang}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

