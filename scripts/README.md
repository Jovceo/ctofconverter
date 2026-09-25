# scripts/ — 操作惯例与脚本索引

## 操作惯例：`*.prev.json`（2026-09-24 双方约定，不进规格正文）

**凡会覆盖 `docs/data/*.json` 的脚本，覆盖前必须先把旧文件复制为同目录 `*.prev.json`。**

理由：`docs/data/` 不进 git（`.gitignore` 排除 `/docs/`），**没有版本历史**。
不落 `prev` 则旧基线无法复算 —— 违反规格 §7.1 的「≥1 条可复算路径」要求。

已发生过一次：`orphan-groups.json` 被原地覆盖，旧 `provisional` 值一度只能靠散文里的记录保底。

## 会写 `docs/data/` 的脚本（改动时保持头注里的惯例说明）

| 脚本 | 产出 |
|---|---|
| `baseline-upgrade.mjs` | `precrash-baseline-verified.json` |
| `orphan-groups.mjs` | `orphan-groups.json` |
| `orphan-link-audit.mjs` | `orphan-link-edges.json` |
| `pull-gsc-page-date.mjs` | `<END>__gsc_page_date.json` |
| `pull-target-queries.mjs` | `target-queries.json` |

## 复算工具（只读，不写 data）

| 脚本 | 用途 |
|---|---|
| `verify-bing-monthly.mjs` | Bing `TrafficStats` 日度行按月求和。**Bing 有两个口径、系统性差 ≈2.6 倍**（API 日度求和 vs 后台月度报表），引用月度必须同源 |
| `verify-current-window.mjs` | 当期窗口页级展示核验（**禁用分摊法** —— 分摊法已被证伪三次） |

## 战略文档的位置

`docs/` 与 `docs/data/` **不进本公开仓**（含其他站信息，见规格 §6 红线）。

私有镜像：https://github.com/Jovceo/ctofconverter-docs
