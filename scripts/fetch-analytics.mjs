/**
 * fetch-analytics.mjs — Standalone script
 *
 * Fetches GSC + GA4 data for ctofconverter.com and outputs JSON.
 * No Next.js dev server needed. Uses OAuth token directly.
 *
 * Usage:
 *   node scripts/fetch-analytics.mjs
 *   node scripts/fetch-analytics.mjs > data.json
 */

import { GoogleAuth } from "google-auth-library";
import { ProxyAgent } from "undici";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// === Auto-load .env.local ===
const envLocalPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// === Config ===
const TOKEN_PATH = path.join(ROOT, "google-oauth-token.json");
const GSC_SITE = "https://ctofconverter.com/";
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID || "";
const DAYS = parseInt(process.argv[2], 10) || 28;
const PROXY = process.env.HTTPS_PROXY || "";

// === Auth ===
async function getToken() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`OAuth token not found at ${TOKEN_PATH}. Run auth-oauth.mjs first.`);
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));

  const auth = new GoogleAuth({
    credentials: {
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      type: "authorized_user",
    },
    scopes: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
  });

  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

// === HTTP helper ===
async function fetchJson(url, init = {}) {
  const options = { ...init };
  if (PROXY) {
    options.dispatcher = new ProxyAgent(PROXY);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.substring(0, 500)}`);
  }
  return res.json();
}

// === Date helpers ===
function dateRange(days = DAYS) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

// === GSC ===
async function fetchGsc(token) {
  const { startDate, endDate } = dateRange();

  const body = {
    startDate,
    endDate,
    dimensions: ["query"],
    rowLimit: 50,
    aggregationType: "auto",
  };

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`;

  const data = await fetchJson(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const queries = (data.rows || []).map((row) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  // Also get page-level data
  const pageBody = {
    startDate,
    endDate,
    dimensions: ["page"],
    rowLimit: 20,
    aggregationType: "auto",
  };

  const pageData = await fetchJson(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pageBody),
  });

  const pages = (pageData.rows || []).map((row) => ({
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  // Per-page keyword breakdown
  const pageQueryBody = {
    startDate,
    endDate,
    dimensions: ["page", "query"],
    rowLimit: 100,
    aggregationType: "auto",
  };

  const pageQueryData = await fetchJson(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pageQueryBody),
  });

  const pageKeywords = (pageQueryData.rows || []).map((row) => ({
    page: row.keys[0],
    query: row.keys[1],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  const pageKeywordMap = {};
  for (const item of pageKeywords) {
    const pagePath = new URL(item.page).pathname;
    if (!pageKeywordMap[pagePath]) {
      pageKeywordMap[pagePath] = [];
    }
    pageKeywordMap[pagePath].push({
      query: item.query,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: item.ctr,
      position: item.position,
    });
  }

  return {
    totalClicks: queries.reduce((s, q) => s + q.clicks, 0),
    totalImpressions: queries.reduce((s, q) => s + q.impressions, 0),
    avgCtr: queries.length > 0
      ? queries.reduce((s, q) => s + q.ctr, 0) / queries.length
      : 0,
    avgPosition: queries.length > 0
      ? queries.reduce((s, q) => s + q.position, 0) / queries.length
      : 0,
    topQueries: queries.slice(0, 20),
    topPages: pages.slice(0, 15),
    pageKeywords: pageKeywordMap,
  };
}

// === GA4 ===
async function fetchGa4(token) {
  if (!GA4_PROPERTY) {
    return null; // GA4 not configured
  }

  const { startDate, endDate } = dateRange();
  const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`;
  const dateRangeParam = { startDate, endDate };

  async function runReport(body) {
    return fetchJson(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  // Overview
  const overviewData = await runReport({
    dateRanges: [dateRangeParam],
    metrics: [
      { name: "activeUsers" },
      { name: "totalUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  const m = overviewData.rows?.[0]?.metricValues || [];
  const overview = {
    activeUsers: parseInt(m[0]?.value || "0"),
    totalUsers: parseInt(m[1]?.value || "0"),
    sessions: parseInt(m[2]?.value || "0"),
    pageViews: parseInt(m[3]?.value || "0"),
    avgSessionDuration: Math.round(parseFloat(m[4]?.value || "0")),
    bounceRate: parseFloat(m[5]?.value || "0").toFixed(1),
  };

  // Traffic sources
  const trafficData = await runReport({
    dateRanges: [dateRangeParam],
    dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  const trafficSources = (trafficData.rows || []).map((r) => ({
    source: r.dimensionValues?.[0]?.value || "(unknown)",
    medium: r.dimensionValues?.[1]?.value || "(unknown)",
    users: parseInt(r.metricValues?.[0]?.value || "0"),
    sessions: parseInt(r.metricValues?.[1]?.value || "0"),
  }));

  // Top pages
  const pagesData = await runReport({
    dateRanges: [dateRangeParam],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 20,
  });

  const topPages = (pagesData.rows || []).map((r) => ({
    path: r.dimensionValues?.[0]?.value || "/",
    views: parseInt(r.metricValues?.[0]?.value || "0"),
    users: parseInt(r.metricValues?.[1]?.value || "0"),
  }));

  // Device category breakdown
  const deviceData = await runReport({
    dateRanges: [dateRangeParam],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  const deviceBreakdown = (deviceData.rows || []).map((r) => ({
    device: r.dimensionValues?.[0]?.value || "(unknown)",
    users: parseInt(r.metricValues?.[0]?.value || "0"),
    sessions: parseInt(r.metricValues?.[1]?.value || "0"),
    pageViews: parseInt(r.metricValues?.[2]?.value || "0"),
    avgSessionDuration: Math.round(parseFloat(r.metricValues?.[3]?.value || "0")),
    bounceRate: parseFloat(r.metricValues?.[4]?.value || "0").toFixed(1),
  }));

  // Landing page analysis
  const landingData = await runReport({
    dateRanges: [dateRangeParam],
    dimensions: [{ name: "landingPage" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20,
  });

  const landingPages = (landingData.rows || []).map((r) => ({
    page: r.dimensionValues?.[0]?.value || "/",
    sessions: parseInt(r.metricValues?.[0]?.value || "0"),
    users: parseInt(r.metricValues?.[1]?.value || "0"),
    pageViews: parseInt(r.metricValues?.[2]?.value || "0"),
    avgSessionDuration: Math.round(parseFloat(r.metricValues?.[3]?.value || "0")),
    bounceRate: parseFloat(r.metricValues?.[4]?.value || "0").toFixed(1),
  }));

  // User journey: page path + previous page path
  const journeyData = await runReport({
    dateRanges: [dateRangeParam],
    dimensions: [{ name: "pagePath" }, { name: "pageReferrer" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 50,
  });

  const userJourney = (journeyData.rows || [])
    .map((r) => ({
      from: r.dimensionValues?.[1]?.value || "(direct / entry)",
      to: r.dimensionValues?.[0]?.value || "/",
      views: parseInt(r.metricValues?.[0]?.value || "0"),
      users: parseInt(r.metricValues?.[1]?.value || "0"),
    }))
    .filter((item) => item.to !== "/(not set)");

  return { overview, trafficSources, topPages, deviceBreakdown, landingPages, userJourney };
}

// === Main ===
async function main() {
  console.error("🔑 Authenticating...");
  const token = await getToken();

  console.error("📊 Fetching GSC data...");
  const gsc = await fetchGsc(token);

  console.error("📈 Fetching GA4 data...");
  const ga4 = await fetchGa4(token);

  const result = {
    site: "ctofconverter.com",
    period: `${dateRange().startDate} ~ ${dateRange().endDate}`,
    generatedAt: new Date().toISOString(),
    gsc,
    ga4,
  };

  const json = JSON.stringify(result, null, 2);
  const dataDir = path.join(ROOT, "docs", "谷歌数据");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const today = new Date().toISOString().split("T")[0];
  const outPath = path.join(dataDir, `${today}-${DAYS}d.json`);
  fs.writeFileSync(outPath, json.trim(), "utf-8");
  console.error(`✅ Done. Written to ${outPath}`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
