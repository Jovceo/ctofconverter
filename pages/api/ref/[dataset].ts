import type { NextApiRequest, NextApiResponse } from 'next';
import {
  DATASET_IDS,
  filterRows,
  getDataset,
  projectDataset,
  toCsv,
  withheldReason,
} from '../../../utils/refDatasets';
import { guardMethod, str } from '../../../utils/refApi';

/**
 * GET /api/ref/:dataset
 *   ?format=csv          返回 text/csv（带 Content-Disposition，可直接另存为）
 *   ?select=a,b           列白名单
 *   ?q=chicken            整行子串过滤
 * 也支持静态形态：/data/:dataset.json 与 /data/:dataset.csv（构建时生成，走 CDN）。
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (guardMethod(req, res)) return;

  const id = str(req, 'dataset');
  const withheld = id ? withheldReason(id) : null;
  if (withheld) {
    res.status(503).json({ error: 'dataset_withheld', message: withheld, available: DATASET_IDS });
    return;
  }
  const dataset = getDataset(id);
  if (!dataset) {
    res.status(404).json({
      error: 'unknown_dataset',
      message: `No dataset named "${id}".`,
      available: DATASET_IDS,
      index: 'https://ctofconverter.com/api/ref',
    });
    return;
  }

  const selected = projectDataset(dataset, str(req, 'select'));
  const rows = filterRows(selected.rows, str(req, 'q'));

  if (str(req, 'format') === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dataset.id}.csv"`);
    res.status(200).send(toCsv({ ...selected, rows }));
    return;
  }

  res.status(200).json({
    ...dataset,
    rows,
    filtered: rows.length !== dataset.rows.length,
    count: rows.length,
    totalRows: dataset.rows.length,
    license: dataset.license,
    citation: `${dataset.title} v${dataset.version} — ${dataset.attribution}`,
    index: 'https://ctofconverter.com/api/ref',
    manifest: 'https://ctofconverter.com/data/manifest.json',
  });
}
