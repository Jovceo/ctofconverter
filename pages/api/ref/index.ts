import type { NextApiRequest, NextApiResponse } from 'next';
import { datasetManifest } from '../../../utils/refDatasets';
import { guardMethod } from '../../../utils/refApi';

/**
 * GET /api/ref  和  GET /api/ref/datasets
 * 返回数据集清单（可发现性入口）。无鉴权、无 key、允许跨域。
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (guardMethod(req, res)) return;
  const m = datasetManifest();
  res.status(200).json({
    ...m,
    usage: {
      dataset_json: 'https://ctofconverter.com/api/ref/{id}',
      dataset_csv: 'https://ctofconverter.com/api/ref/{id}?format=csv',
      static_json: 'https://ctofconverter.com/data/{id}.json',
      static_csv: 'https://ctofconverter.com/data/{id}.csv',
      lookup: 'https://ctofconverter.com/api/ref/lookup?value=180&unit=c&context=oven',
      embed: 'https://ctofconverter.com/data-api#embed',
    },
    filters: {
      select: 'comma-separated column keys, e.g. ?select=gas_mark,conventional_c',
      q: 'case-insensitive substring match across the whole row, e.g. ?q=chicken',
      format: 'json (default) | csv',
      setting: '/api/ref/lookup?context=body only: home (default) | hospital | reference | device | all',
      person: '/api/ref/lookup?context=body only: adult | child | infant | neonate (rows marked "any" always apply)',
    },
  });
}
