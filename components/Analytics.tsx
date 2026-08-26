import { useEffect } from 'react';
import Script from 'next/script';
import { adsenseShouldLoad, getAdsenseClient } from '../utils/monetization';

/**
 * 全站第三方脚本装载器。
 *
 * 护栏（AGENTS.md 红线：Auto Ads 永久关闭）：
 * adsbygoogle.js 只有在 config/monetization.json 里 ads.enabled=true 且至少配了一个
 * 非空 slot 时才注入。后台开关被人手滑打开时，本站也不会自动出广告——
 * 2026-08-05 那次 9 个 Auto Ads/页 导致移动端跳出率 100% 的事故不允许靠后台配置兜底。
 */
export default function Analytics() {
  const adsEnabled = adsenseShouldLoad();

  // Initialize Google Analytics dataLayer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      const gtag = (...args: unknown[]) => {
        (window.dataLayer as unknown[]).push(args);
      };
      window.gtag = gtag;
    }
  }, []);

  // Load Google AdSense — only when an ad unit is actually configured
  useEffect(() => {
    if (typeof window === 'undefined' || !adsEnabled) return;

    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existingScript) return;

    const client = getAdsenseClient();
    if (!client) return;

    const adsScript = document.createElement('script');
    adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    adsScript.async = true;
    adsScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsScript);
  }, [adsEnabled]);

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-7KGQPN84Z6"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('js', new Date());
            window.gtag('config', 'G-7KGQPN84Z6');
          }
        }}
      />
    </>
  );
}
