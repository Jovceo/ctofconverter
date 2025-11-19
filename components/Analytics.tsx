'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Analytics() {
  // Initialize Google Analytics dataLayer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      (window as any).gtag = gtag;
    }
  }, []);

  // Load Google AdSense on user interaction (for better performance)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scriptsLoaded = false;

    const loadAdSense = () => {
      if (scriptsLoaded) return;
      scriptsLoaded = true;

      // Check if AdSense script is already loaded
      const existingScript = document.querySelector(
        'script[src*="adsbygoogle.js"]'
      );
      if (existingScript) {
        // Script already loaded, try to push if there are ins elements
        const insElements = document.querySelectorAll('ins.adsbygoogle');
        if (insElements.length > 0 && window.adsbygoogle) {
          const uninitializedElements = Array.from(insElements).filter(
            (ins) => !ins.hasAttribute('data-adsbygoogle-status')
          );
          if (uninitializedElements.length > 0) {
            try {
              (window.adsbygoogle as any).push({});
            } catch (e) {
              // Silently ignore if already initialized
            }
          }
        }
        return;
      }

      // Load Google AdSense script
      const adsScript = document.createElement('script');
      adsScript.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1199889942562451';
      adsScript.async = true;
      adsScript.crossOrigin = 'anonymous';
      document.head.appendChild(adsScript);

      adsScript.onload = () => {
        if (window.adsbygoogle) {
          // Check if there are any ins.adsbygoogle elements
          const insElements = document.querySelectorAll('ins.adsbygoogle');
          if (insElements.length > 0) {
            try {
              (window.adsbygoogle as any).push({});
            } catch (e) {
              // Silently ignore errors
            }
          }
        }
      };
    };

    const loadOnInteraction = () => {
      loadAdSense();
      document.removeEventListener('scroll', loadOnInteraction);
      document.removeEventListener('click', loadOnInteraction);
      document.removeEventListener('mousemove', loadOnInteraction);
      document.removeEventListener('touchstart', loadOnInteraction);
    };

    // Load on user interaction for better performance
    document.addEventListener('scroll', loadOnInteraction, { once: true, passive: true });
    document.addEventListener('click', loadOnInteraction, { once: true });
    document.addEventListener('mousemove', loadOnInteraction, { once: true });
    document.addEventListener('touchstart', loadOnInteraction, { once: true, passive: true });

    // Fallback: Load after 5 seconds if no interaction occurs
    const timeout = setTimeout(() => {
      if (!scriptsLoaded) {
        loadAdSense();
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('scroll', loadOnInteraction);
      document.removeEventListener('click', loadOnInteraction);
      document.removeEventListener('mousemove', loadOnInteraction);
      document.removeEventListener('touchstart', loadOnInteraction);
    };
  }, []);

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-7KGQPN84Z6"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('js', new Date());
            (window as any).gtag('config', 'G-7KGQPN84Z6');
          }
        }}
      />
    </>
  );
}

