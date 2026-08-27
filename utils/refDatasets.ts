/**
 * 参考数据集（reference datasets）的唯一来源。2026-08-27 起。
 *
 * 设计原则（不要绕过）：
 * 1. 数据只写在 `config/datasets/*.json` 里。站点页面、公开静态文件（由
 *    `scripts/publish-dataset.js` 生成的 `public/data/*`）与只读 API（`/api/ref/*`）
 *    都从这里取，杜绝「页面上一个值、数据集里另一个值」。
 * 2. 每个数据集必须带 provenance（来源 + 核查日期）。没有核对过来源的数值不得发布。
 * 3. 行数据里同时放「展示用字符串」和「可计算数值」（如 cMin/cMax），
 *    这样调用方既能直接显示，也能做判断，不会自己去解析 "38.0–38.9°C"。
 */

import ovenConversions from '../config/datasets/oven-conversions.json';
import safeInternalTemperatures from '../config/datasets/safe-internal-temperatures.json';
import humanBodyTemperature from '../config/datasets/human-body-temperature.json';

/*
 * 暂停发布的数据集写在这里：API 会返回 503 + 理由，而不是静默 404。
 * 规矩：每一条阈值都必须能指到具名公共来源（NHS / CDC / Mayo / StatPearls / Merck / NICE）
 * 且来源 URL 当天可回取；做不到就不要发。human-body-temperature 于 2026-08-27 完成逐条核查后解禁。
 */
export const WITHHELD_DATASETS: Record<string, string> = {};

export type DatasetColumn = {
  key: string;
  label: string;
  unit?: string;
  type?: string;
  note?: string;
  /** 该列是否需要出现在导出的 CSV 里（默认 true） */
  export?: boolean;
};

export type DatasetProvenance = {
  source: string;
  url?: string;
  checkedOn: string;
  note?: string;
};

export type Dataset = {
  id: string;
  title: string;
  description: string;
  version: string;
  updated: string;
  license: string;
  attribution: string;
  languages: string[];
  provenance: DatasetProvenance[];
  columns: DatasetColumn[];
  rows: Record<string, unknown>[];
  /** 数据集在站内的对应页面（发布脚本与 manifest 用它回链） */
  page?: string;
  notes?: string[];
  disclaimer?: string;
};

export const DATASET_REGISTRY = {
  'oven-conversions': ovenConversions,
  'safe-internal-temperatures': safeInternalTemperatures,
  'human-body-temperature': humanBodyTemperature,
} as unknown as Record<string, Dataset>;

export type DatasetId = keyof typeof DATASET_REGISTRY;

export const DATASET_IDS = Object.keys(DATASET_REGISTRY);

export function getDataset(id: string | undefined | null): Dataset | null {
  if (!id) return null;
  if (WITHHELD_DATASETS[id]) return null;
  return DATASET_REGISTRY[id] || null;
}

export function withheldReason(id: string): string | null {
  return WITHHELD_DATASETS[id] || null;
}

export function listDatasets() {
  return DATASET_IDS.map((id) => {
    const d = DATASET_REGISTRY[id];
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      version: d.version,
      updated: d.updated,
      license: d.license,
      attribution: d.attribution,
      columns: d.columns.length,
      rows: d.rows.length,
      urls: {
        json: `/data/${d.id}.json`,
        csv: `/data/${d.id}.csv`,
        api: `/api/ref/${d.id}`,
        page: pageForDataset(d.id),
      },
    };
  });
}

export function datasetManifest() {
  return {
    name: 'ctofconverter reference datasets',
    homepage: 'https://ctofconverter.com/data-api',
    license: 'CC-BY-4.0',
    generatedFrom: 'config/datasets/*.json',
    withheld: WITHHELD_DATASETS,
    datasets: listDatasets(),
  };
}

export function pageForDataset(id: string): string {
  if (id === 'oven-conversions') return '/fan-oven-conversion-chart';
  if (id === 'safe-internal-temperatures') return '/180-c-to-f';
  if (id === 'human-body-temperature') return '/body-temperature-chart-fever-guide';
  return '/';
}
/** RFC 4180 引号规则。 */
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** 表头带上单位，否则 °C / °F 两列在 CSV 里会同名。 */
function csvHeader(col: DatasetColumn): string {
  const base = csvEscape(col.label || col.key);
  return col.unit ? `${base} (${col.unit})` : base;
}

/** 极简、稳定的 CSV 生成：CRLF 行尾，UTF-8（无 BOM）。 */
export function toCsv(dataset: Dataset): string {
  const cols = dataset.columns.filter((c) => c.export !== false);
  const lines = [cols.map(csvHeader).join(',')];
  dataset.rows.forEach((row) => {
    lines.push(cols.map((c) => csvEscape(row[c.key])).join(','));
  });
  return `${lines.join('\r\n')}\r\n`;
}

/** `?select=a,b` 白名单裁剪；非法列名忽略。 */
export function projectDataset(dataset: Dataset, select?: string): Dataset {
  if (!select) return dataset;
  const wanted = select.split(',').map((s) => s.trim()).filter(Boolean);
  const columns = dataset.columns.filter((c) => wanted.includes(c.key));
  if (columns.length === 0) return dataset;
  const rows = dataset.rows.map((row) => {
    const out: Record<string, unknown> = {};
    columns.forEach((c) => {
      out[c.key] = row[c.key];
    });
    return out;
  });
  return { ...dataset, columns, rows };
}

/** `?q=chicken` 在整行里做不区分大小写的子串过滤。 */
export function filterRows(rows: Record<string, unknown>[], q?: string): Record<string, unknown>[] {
  if (!q) return rows;
  const needle = q.toLowerCase();
  return rows.filter((row) =>
    Object.values(row).some((v) => typeof v === 'string' && v.toLowerCase().includes(needle))
  );
}
