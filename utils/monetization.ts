/**
 * 变现层读取口（唯一事实源：config/monetization.json）
 *
 * 设计原则：
 * 1. 关着的时候必须「什么都不发生」——不渲染 DOM、不加载第三方脚本、不影响 CWV。
 *    「Auto Ads 永久关闭」这条红线以前只存在于 AdSense 后台，这里把它变成代码护栏。
 * 2. 位点由配置决定，不由组件自己判断，避免哪天有人在模板里随手加一个 ins 标签。
 */
import monetizationConfig from '../config/monetization.json';

export type AdVariant = 'temperature' | 'chart' | 'guide';
export type OfferCluster = 'oven' | 'body' | 'general';

export interface AffiliateOffer {
  /** 商品名（须与维护者核对过的亚马逊页面一致） */
  name: string;
  /** 一句话说明为什么推荐——必须写具体判据，不写「性价比高」这类废话 */
  why: string;
  /** 亚马逊链接（含 tag 由组件统一拼接）；为空则该条不渲染 */
  url: string;
  /** 可选：价格区间说明，写「通常 $x-$y」这类可核实范围 */
  priceNote?: string;
}

interface MonetizationFile {
  ads?: {
    enabled?: boolean;
    client?: string;
    slots?: Partial<Record<AdVariant, string>>;
  };
  affiliate?: {
    enabled?: boolean;
    network?: string;
    tag?: string;
    disclosure?: string;
    offers?: Partial<Record<OfferCluster, AffiliateOffer[]>>;
  };
}

const config = monetizationConfig as unknown as MonetizationFile;

/** 广告是否真正可用：开关 + client + 该位点 slot 三者齐备 */
export function getAdSlot(variant: AdVariant): { client: string; slot: string } | null {
  const ads = config.ads;
  if (!ads?.enabled) return null;
  const client = (ads.client || '').trim();
  const slot = (ads.slots?.[variant] || '').trim();
  if (!client || !slot) return null;
  return { client, slot };
}

export function adsenseShouldLoad(): boolean {
  const ads = config.ads;
  if (!ads?.enabled) return false;
  const slots = ads.slots || {};
  return Boolean(
    (ads.client || '').trim() &&
      Object.keys(slots).some((key) => (slots[key as AdVariant] || '').trim()),
  );
}

/** AdSense 站点 ID（只在开关打开时被用到；写死在配置里，方便一次改动全站生效） */
export function getAdsenseClient(): string {
  return (config.ads?.client || '').trim();
}

/** 联盟卡片：tag 缺失一律不渲染（不做零佣金的外链导流） */
export function getAffiliateOffers(cluster: OfferCluster): {
  offers: AffiliateOffer[];
  disclosure: string;
} {
  const aff = config.affiliate;
  const empty = { offers: [], disclosure: '' };
  if (!aff?.enabled) return empty;
  const tag = (aff.tag || '').trim();
  if (!tag) return empty;

  const offers = (aff.offers?.[cluster] || []).filter(
    (offer): offer is AffiliateOffer => Boolean(offer && offer.url && offer.name),
  );
  if (offers.length === 0) return empty;

  return {
    offers: offers.map((offer) => ({ ...offer, url: withAffiliateTag(offer.url, tag) })),
    disclosure: (aff.disclosure || '').trim(),
  };
}

export function withAffiliateTag(url: string, tag: string): string {
  if (/[?&]tag=/.test(url)) return url;
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}tag=${encodeURIComponent(tag)}`;
}
