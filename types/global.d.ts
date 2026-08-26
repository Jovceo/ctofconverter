declare global {
  interface Window {
    dataLayer: any[];
    adsbygoogle: any;
    /** gtag.js 就绪前由 Analytics.tsx 先挂一个 dataLayer 推送口 */
    gtag?: (...args: unknown[]) => void;
  }
}

export {};

