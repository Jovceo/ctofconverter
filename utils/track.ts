/**
 * GA4 业务事件层（执行方案 Phase 2「GA4 业务事件」落地）。
 *
 * 目的：广告位与联盟位的 CRO 决策不能靠会话级数据猜。没有这些事件，
 * 「哪个页面值得挂广告」只能凭展示量拍脑袋。
 *
 * 约定事件名（GA4 后台需建为 Key event 才会进转化报表）：
 *   conversion_completed      —— 用户完成一次换算（有有效结果）
 *   copy_result               —— 用户复制结果
 *   chart_download            —— 用户点对照表 PDF
 *   related_page_click        —— 用户点站内相关推荐/相邻温度
 *   reverse_conversion_used   —— 用户在 F→C 方向输入
 *
 * SSR 安全：服务端一律 no-op；客户端若 gtag 尚未就绪，先落 dataLayer 队列，
 * gtag.js 加载后会自动消费（Analytics.tsx 已建好 dataLayer）。
 */

export type TrackParams = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: TrackParams = {}): void {
  if (typeof window === 'undefined') return;

  const clean: TrackParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) clean[key] = value;
  }

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, clean);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    (window.dataLayer as unknown[]).push(['event', event, clean]);
  } catch {
    // 埋点永远不能把业务打断
  }
}

/** 同一会话内同一事件只报一次的守卫（避免每次按键都刷 GA4） */
const sent = new Set<string>();

export function trackOnce(event: string, key: string, params: TrackParams = {}): void {
  const id = `${event}:${key}`;
  if (sent.has(id)) return;
  sent.add(id);
  track(event, params);
}
