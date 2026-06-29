/**
 * OAuth 2.0 first-time setup for ctofconverter.com analytics API
 *
 * Usage:
 *   node scripts/auth-oauth.mjs
 *
 * This script:
 *   1. Reads client ID/secret from .env.local
 *   2. Generates a Google auth URL
 *   3. Opens the URL in your default browser
 *   4. Asks you to paste the authorization code
 *   5. Exchanges code for tokens
 *   6. Saves tokens to google-oauth-token.json
 *
 * After this runs once, the API auto-refreshes tokens.
 * You never need to run this again (unless you revoke access).
 */

import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import readline from "readline";
import { HttpsProxyAgent } from "https-proxy-agent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Parse .env.local ──────────────────────────────────────────

let clientId = "";
let clientSecret = "";
let proxyUrl = "";

const envPath = path.join(ROOT, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found. Create it first.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("GOOGLE_OAUTH_CLIENT_ID=")) {
    clientId = trimmed.split("=")[1].trim();
  }
  if (trimmed.startsWith("GOOGLE_OAUTH_CLIENT_SECRET=")) {
    clientSecret = trimmed.split("=")[1].trim();
  }
  if (trimmed.startsWith("HTTPS_PROXY=")) {
    proxyUrl = trimmed.split("=")[1].trim();
  }
}

if (!clientId || !clientSecret) {
  console.error("❌ GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET not found in .env.local");
  process.exit(1);
}

// ── Proxy agent ───────────────────────────────────────────────

const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
if (proxyUrl) {
  console.log(`🌐 Using proxy: ${proxyUrl}\n`);
}

// ── OAuth flow ─────────────────────────────────────────────────

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  "http://localhost"
);

// Apply proxy to token exchange requests
if (agent) {
  oauth2Client.on("tokens", () => {});
  const originalRequest = oauth2Client.transporter.request.bind(oauth2Client.transporter);
  oauth2Client.transporter.request = async (opts, ...args) => {
    if (!opts.agent) {
      opts.agent = agent;
    }
    return originalRequest(opts, ...args);
  };
}

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("\n📋 Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n");

// Try to open browser automatically
try {
  exec(`start "" "${authUrl}"`);
  console.log("(opened in your default browser)\n");
} catch {
  // ignore
}

// ── If code passed as argument, use it directly ─────────────────

const codeArg = process.argv[2];

if (codeArg && codeArg.trim()) {
  exchangeCode(codeArg.trim(), oauth2Client);
} else {
  // Fall back to readline prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("🔑 Paste the authorization code from Google: ", async (code) => {
    rl.close();
    if (!code.trim()) {
      console.error("❌ No code provided.");
      process.exit(1);
    }
    exchangeCode(code.trim(), oauth2Client);
  });
}

async function exchangeCode(code, client) {
  try {
    const { tokens } = await client.getToken(code);
    const tokenPath = path.join(ROOT, "google-oauth-token.json");
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

    console.log(`\n✅ Tokens saved to google-oauth-token.json`);
    console.log("   The API is now ready to use.\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to exchange authorization code:", err.message);
    process.exit(1);
  }
}
