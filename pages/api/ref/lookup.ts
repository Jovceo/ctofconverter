import type { NextApiRequest, NextApiResponse } from 'next';
import { getDataset, withheldReason } from '../../../utils/refDatasets';
import { guardMethod, str } from '../../../utils/refApi';

/**
 * GET /api/ref/lookup?value=37.8&unit=c&context=body|oven|general
 *
 * 只做两件事：单位换算（精确公式）+ 把值落到数据集里已核查的那一档。
 * 不猜、不插值造数：落不进任何档就返回 matched: false。
 */
const num = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (guardMethod(req, res)) return;

  const rawValue = str(req, 'value');
  const value = rawValue === undefined ? NaN : Number(rawValue);
  if (!Number.isFinite(value)) {
    res.status(400).json({
      error: 'invalid_value',
      message: 'Pass a numeric temperature, e.g. /api/ref/lookup?value=180&unit=c&context=oven',
    });
    return;
  }

  const unitRaw = (str(req, 'unit') || 'c').toLowerCase();
  const isF = unitRaw.startsWith('f');
  const celsius = isF ? ((value - 32) * 5) / 9 : value;
  const fahrenheit = isF ? value : (value * 9) / 5 + 32;
  const context = (str(req, 'context') || 'general').toLowerCase();
  const round = (n: number) => Math.round(n * 100) / 100;

  const base = {
    input: { value, unit: isF ? 'f' : 'c' },
    celsius: round(celsius),
    fahrenheit: round(fahrenheit),
    kelvin: round(celsius + 273.15),
    formula: isF ? '°C = (°F − 32) × 5/9' : '°F = °C × 9/5 + 32',
  };

  if (context === 'body') {
    const withheld = withheldReason('human-body-temperature');
    if (withheld) {
      res.status(503).json({ error: 'dataset_withheld', context, message: withheld });
      return;
    }
    const ds = getDataset('human-body-temperature');
    const all = ds?.rows || [];
    const wantSetting = (str(req, 'setting') || 'home').toLowerCase();
    const person = (str(req, 'person') || '').toLowerCase();
    const scoped = wantSetting === 'all' ? all : all.filter((r) => (r.setting || 'home') === wantSetting);
    const rows = person
      ? scoped.filter((r) => !r.audience || r.audience === 'any' || r.audience === person)
      : scoped;
    const brief = (r: Record<string, unknown>) => ({
      id: r.id,
      topic: r.topic,
      applies_to: r.applies_to,
      audience: r.audience,
      site: r.site,
      setting: r.setting,
      label: r.label,
      c_min: r.c_min,
      c_max: r.c_max,
      action: r.action,
      source: r.source,
      source_url: r.source_url,
    });
    const active = rows
      .filter((r) => {
        const lo = num(r.c_min);
        const hi = num(r.c_max);
        if (r.rule === 'gte') return lo !== null && celsius >= lo;
        if (r.rule === 'lte') return hi !== null && celsius <= hi;
        if (r.rule === 'range') return lo !== null && hi !== null && celsius >= lo && celsius <= hi;
        return false;
      })
      .map(brief);
    // 最近的阈值边界（用于「差多少」这类问题）：只取当前 setting 下已发布的 c_min / c_max
    const edges: number[] = [];
    rows.forEach((r) => {
      const lo = num(r.c_min);
      const hi = num(r.c_max);
      if (lo !== null) edges.push(lo);
      if (hi !== null) edges.push(hi);
    });
    let nearestEdge: number | null = null;
    let edgeDist = Number.POSITIVE_INFINITY;
    edges.forEach((e) => {
      const d = Math.abs(e - celsius);
      if (d < edgeDist) {
        edgeDist = d;
        nearestEdge = e;
      }
    });
    res.status(200).json({
      ...base,
      context,
      matched: active.length > 0,
      applies: active,
      nearestPublishedThresholdC: nearestEdge,
      distanceFromNearestThresholdC: Number.isFinite(edgeDist) ? round(edgeDist) : null,
      emergencySigns: rows.filter((r) => r.rule === 'sign').map((r) => ({ label: r.label, action: r.action, source: r.source })),
      measurementOffsets: rows.filter((r) => r.rule === 'offset').map(brief),
      siteNote: 'Thresholds are site-specific. An axillary reading is not comparable with an oral cut-off (see measurementOffsets).',
      setting: wantSetting,
      person: person || null,
      plausible: celsius >= 30 && celsius <= 45,
      warning:
        celsius >= 30 && celsius <= 45
          ? null
          : 'Outside 30–45 °C, so this is not a plausible body reading; no row in this dataset is written for it.',
      scopeNote:
        wantSetting === 'all'
          ? 'setting=all includes rows published for inpatient / perioperative use; they are not home triage numbers.'
          : 'Only rows marked for the requested setting are applied. Pass ?setting=all to see hospital and reference rows too.',
      disclaimer: ds?.disclaimer || null,
      dataset: ds ? { id: ds.id, version: ds.version, updated: ds.updated, provenance: ds.provenance } : null,
    });
    return;
  }

  if (context === 'oven') {
    const ds = getDataset('oven-conversions');
    const rows = ds?.rows || [];
    const convOf = (r: Record<string, unknown>): number | null => num(r.conventional_c);
    let nearest: Record<string, unknown> | null = null;
    let best = Number.POSITIVE_INFINITY;
    rows.forEach((r) => {
      const conv = convOf(r);
      if (conv === null) return;
      const d = Math.abs(conv - celsius);
      if (d < best) {
        best = d;
        nearest = r;
      }
    });
    const targetC = Math.round(celsius * 100) / 100;
    const exact = rows.find((r) => convOf(r) === targetC) || null;
    res.status(200).json({
      ...base,
      context,
      matched: Boolean(exact) || best <= 5,
      exactMatch: Boolean(exact),
      nearestReferenceRow: nearest,
      distanceFromNearestC: best === Number.POSITIVE_INFINITY ? null : round(best),
      caveats: ds?.notes || [],
      dataset: ds ? { id: ds.id, version: ds.version, updated: ds.updated, provenance: ds.provenance } : null,
    });
    return;
  }

  const markers = [
    { label: 'Absolute zero', celsius: -273.15 },
    { label: 'Water freezes', celsius: 0 },
    { label: 'Room temperature (20°C)', celsius: 20 },
    { label: 'Normal body temperature (37°C)', celsius: 37 },
    { label: 'Water boils', celsius: 100 },
  ];
  let nearestMarker = markers[0];
  let best = Number.POSITIVE_INFINITY;
  markers.forEach((m) => {
    const d = Math.abs(m.celsius - celsius);
    if (d < best) {
      best = d;
      nearestMarker = m;
    }
  });
  res.status(200).json({
    ...base,
    context: 'general',
    nearestMarker: { ...nearestMarker, distanceC: round(best) },
  });
}
