# ctofconverter.com — Public Single-Line Ledger

> **中文导读**（此行为内部说明，非外发内容）
> 本文件是**对外公开材料**，英文为主 —— 供 HN / Indie Hackers / r/juststart 等社区阅读。
> 只记录 ctofconverter.com **一条线**。内部规格见 `docs/规格-执行-2026-09-23.md`（`docs/` 不进公开仓）。
> **位置说明**：本文件放在 `ledger/` 而非 `docs/` —— `docs/` 被 `.gitignore` 排除（内含其他 11 站信息，见 §6 红线）。
> `ledger/` 是**唯一**约定为"可公开的 ctof 单线数据"的目录。**往这里加文件前，先确认它只含 ctof。**
> 更新纪律：触达当日记账；读数日（2026-10-23 起）补指标。

---

**Scope promise.** This ledger covers **ctofconverter.com only**. No other site is referenced, counted, or implied.

**Obligation.** Reporting is tied to the judgment dates, not to any sequel post. There is no promise of a follow-up article.
Data is current as of the "last updated" line below. Results — **pass or fail** — will be published on:

- **2026-12-03** — traffic line: keep or cut the 8h/month
- **2027-01-21** — renewal line: renew the domain or let it lapse

**Reading rule.** Every number carries a provenance tag (`direct` / `derived-verified` / `derived-unverified` / `derived-falsified` / `provisional`).
A number without a tag is `provisional` and must not be used to judge anything.

_Last updated: 2026-09-24_

---

## A. Renewal gate metrics

Gate (2027-01-21): `search_clicks_month >= 300` **AND** `measured_revenue_usd_month >= 10`.

| Month | search_clicks_month | measured_revenue_usd_month | Source | Tag |
|---|---|---|---|---|
| 2026-09 | _pending — first read 2026-10-23_ | 0 | GSC | — |

---

## B. Outreach log

Gate: **≥5 outreach actions per month**, counted **when sent**, not when answered.

A qualifying action is one of:

- 1 targeted email
- 1 substantive reply in a relevant thread
- 1 directory / resource-page submission
- 1 post

**Bulk mail and template messages do not count.**

**Gate starts 2026-10.** (September 2026 is treated as a buffer month and is not counted.)

| # | Date | Month | Type | Target | One-line summary | Line | Response |
|---|---|---|---|---|---|---|---|
| — | — | — | — | _none yet_ | — | — | — |

**Monthly count**

| Month | Sent | Gate | Pass |
|---|---|---|---|
| 2026-09 | 0 | — (buffer) | — |
| 2026-10 | 0 | ≥5 | ❌ |

---

## C. Renewal positive signals

"Close but not through" is **not** a gate pass. It is recorded here as a **renewal signal** for the 2027-01-21 decision.
Format: `{query, position start, position now, consecutive weeks qualifying}`.

| Query | Pos start | Pos now | Consecutive weeks | First recorded |
|---|---|---|---|---|
| _pending — first read 2026-10-23_ | | | | |

---

## D. Target queries tracked

Eight long-tail queries, selected from the **pre-crash exclusive** impression set (the current-window truth is zero).
This is a **secondary signal only** — it does not feed the stage-① gate.

| # | Query | Pre-crash impressions |
|---|---|---|
| 1 | `175c to f oven` | 1,353 |
| 2 | `170c to f oven` | 712 |
| 3 | `230c to f oven` | 515 |
| 4 | `175 celsius to fahrenheit oven` | 608 |
| 5 | `what is 175 celsius in fahrenheit for baking` | 255 |
| 6 | `44 celsius to fahrenheit` | 179 |
| 7 | `175 degrees celsius to fahrenheit` | 279 |
| 8 | `175c in fahrenheit` | 856 |

Checked on **2026-10-23**.
