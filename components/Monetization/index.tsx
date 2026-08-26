import React, { useEffect } from 'react';
import styles from './index.module.css';
import {
  adsenseShouldLoad,
  getAdSlot,
  getAffiliateOffers,
  type AdVariant,
  type OfferCluster,
} from '../../utils/monetization';
import { track } from '../../utils/track';

/**
 * 内容区唯一变现挂载点。
 *
 * 位置红线：只允许出现在正文内容块之后、FAQ 之前；绝不允许出现在 H1 与答案区之间。
 * 关闭状态（config/monetization.json）下返回 null —— 不渲染 DOM、不加载第三方脚本。
 */

interface MonetizationProps {
  /** 广告位（同时决定用哪个 data-ad-slot） */
  variant?: AdVariant;
  /** 联盟商品集群：oven / body / general */
  cluster?: OfferCluster;
  /** 埋点用的页面标识 */
  page?: string;
  className?: string;
}

function AdUnit({ client, slot, page }: { client: string; slot: string; page?: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.adsbygoogle = window.adsbygoogle || [];
    try {
      window.adsbygoogle.push({});
      track('ad_unit_requested', { slot, page });
    } catch {
      // 广告请求失败不影响正文（AdSense 自身会重试/填充空位）
    }
  }, [slot, page]);

  return (
    <div className={styles.adFrame} data-ad-slot={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default function Monetization({
  variant = 'temperature',
  cluster = 'general',
  page,
  className,
}: MonetizationProps) {
  // SSR 与 CSR 都读同一份构建期配置，不存在水合不一致
  const ad = getAdSlot(variant);
  const { offers, disclosure } = getAffiliateOffers(cluster);

  if (!ad && offers.length === 0) {
    return null;
  }

  const rootClass = className ? `${styles.wrap} ${className}` : styles.wrap;

  return (
    <section className={rootClass} aria-label="Tools and resources we recommend" data-monetization="on">
      {disclosure ? <p className={styles.disclosure}>{disclosure}</p> : null}

      {offers.length > 0 ? (
        <ul className={styles.offers}>
          {offers.map((offer) => (
            <li key={offer.url} className={styles.offer}>
              <a
                className={styles.offerLink}
                href={offer.url}
                rel="sponsored noopener nofollow"
                target="_blank"
                onClick={() =>
                  track('affiliate_link_click', {
                    offer: offer.name,
                    cluster,
                    page,
                  })
                }
              >
                <span className={styles.offerName}>{offer.name}</span>
                <span className={styles.offerWhy}>{offer.why}</span>
                {offer.priceNote ? (
                  <span className={styles.offerPrice}>{offer.priceNote}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {ad && adsenseShouldLoad() ? <AdUnit {...ad} page={page} /> : null}
    </section>
  );
}
