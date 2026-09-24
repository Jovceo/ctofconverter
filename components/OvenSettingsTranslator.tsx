import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { track } from '../utils/track';

/**
 * Oven Settings Translator — the v3 single-product widget.
 *
 * Input : what the recipe says (value + °C / °F / Gas Mark + whether it says "fan")
 * Output: all four oven settings at once (conventional / fan / gas mark / air-fryer guidance),
 *         snapped to values that actually exist on UK/EU dials, with the rounding and
 *         fan-ambiguity decisions shown explicitly.
 *
 * Data red line: every published number comes from config/datasets/oven-conversions.json
 * (passed in via props from getStaticProps). No temperature values are hard-coded here;
 * the only constants are the stated fan-reduction convention and °F↔°C arithmetic.
 */

export type OvenRow = {
  gas_mark: string;
  conventional_c: number;
  conventional_f: number;
  fan_c: number;
  fan_f: number;
  descriptor: string;
  typical_uses: string;
};

type Unit = 'c' | 'f' | 'gas';

const FAN_REDUCTION_C = 20; // stated convention from the dataset notes (published range 15–20 °C)
const cToF = (c: number): number => Math.round((c * 9) / 5 + 32);
const fToC = (f: number): number => ((f - 32) * 5) / 9;

const GAS_OPTIONS = [
  '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

export default function OvenSettingsTranslator({ rows }: { rows: OvenRow[] }) {
  const [unit, setUnit] = useState<Unit>('f');
  const [value, setValue] = useState<string>('350');
  const [gasValue, setGasValue] = useState<string>('4');
  const [saysFan, setSaysFan] = useState<'no' | 'yes'>('no');

  const result = useMemo(() => {
    const parseOk = unit === 'gas' ? true : Number.isFinite(parseFloat(value));
    if (!parseOk || rows.length === 0) return null;

    // Step 1: normalise the recipe to a conventional-oven °C target.
    let conventionalC: number;
    let exactNote = '';
    if (unit === 'gas') {
      const row = rows.find((r) => r.gas_mark === gasValue);
      if (!row) return null;
      conventionalC = row.conventional_c;
    } else {
      const raw = parseFloat(value);
      if (unit === 'f') {
        const exactC = fToC(raw);
        conventionalC = exactC;
        exactNote = `${raw} °F = ${exactC.toFixed(1)} °C`;
      } else {
        conventionalC = raw;
      }
      if (saysFan === 'yes') {
        // Recipe already states a fan temperature → conventional is 20 °C higher.
        conventionalC = conventionalC + FAN_REDUCTION_C;
      }
    }

    // Step 2: snap to the nearest published table row (a value that exists on dials).
    // Tie-break (e.g. 160 sits between 150 and 170) goes to the higher setting,
    // matching the official 350 °F → 180 °C rounding direction.
    let best = rows[0];
    for (const r of rows) {
      if (Math.abs(r.conventional_c - conventionalC) <= Math.abs(best.conventional_c - conventionalC)) {
        best = r;
      }
    }

    // Step 3 (fan-ambiguity resolution): if the recipe did not say "fan", also compute
    // what to set if it actually meant a fan oven — recipe values like 160 °C are
    // usually fan specs, so the alternative matters as much as the default.
    let fanAlternative: { fan_c: number; conventional_c: number } | null = null;
    if (unit !== 'gas' && saysFan === 'no') {
      const rawC = unit === 'f' ? fToC(parseFloat(value)) : parseFloat(value);
      let alt = rows[0];
      for (const r of rows) {
        if (Math.abs(r.fan_c - rawC) <= Math.abs(alt.fan_c - rawC)) alt = r;
      }
        if (Math.abs(alt.fan_c - rawC) <= Math.abs(best.conventional_c - rawC)) {
        fanAlternative = { fan_c: alt.fan_c, conventional_c: alt.conventional_c };
      }
    }

    // Step 3: fan interpretation of the snapped row.
    // The recipe value maps to the conventional column; fan settings come from the table.
    const rounded = Math.round(conventionalC);
    const snapDiff = Math.abs(best.conventional_c - conventionalC);
    const needsSnap = unit !== 'gas' && snapDiff >= 1;
    const roundingNote = needsSnap
      ? `Exact target ≈ ${Math.round(conventionalC * 10) / 10} °C. Dials step in larger increments — set ${best.conventional_c} °C (the closest standard setting; ${snapDiff < 5 ? 'a few' : snapDiff.toFixed(0)} degrees will not ruin a bake).`
      : '';

    const ambiguityNote =
      unit !== 'gas' && saysFan === 'no'
        ? `The recipe does not mention "fan", so it is treated as a conventional-oven temperature.${
            fanAlternative ? ` If the recipe actually meant a fan oven (common in UK recipes): set ${fanAlternative.fan_c} °C fan / ${fanAlternative.conventional_c} °C conventional instead.` : ''
          }`
        : unit !== 'gas' && saysFan === 'yes'
          ? 'The recipe states a fan temperature, so the conventional setting below is 20 °C higher than the recipe value.'
          : '';

    return { best, exactNote, roundingNote, ambiguityNote };
  }, [rows, unit, value, gasValue, saysFan]);

  const reportUse = () => {
    track('conversion_completed', { tool: 'oven_settings_translator', unit, saysFan });
  };

  const tile = (label: string, main: React.ReactNode, sub?: React.ReactNode) => (
    <div className="ost-tile">
      <div className="ost-tile-label">{label}</div>
      <div className="ost-tile-main">{main}</div>
      {sub ? <div className="ost-tile-sub">{sub}</div> : null}
    </div>
  );

  return (
    <section className="ost-wrap" aria-label="Oven settings translator">
      <h2>Oven Settings Translator</h2>
      <p className="ost-lede">
        Enter what your recipe says, get what to actually set — conventional, fan, gas mark and
        air-fryer at once, rounded to settings that exist on the dial.
      </p>

      <div className="ost-controls">
        <div className="ost-field">
          <label className="ost-label" htmlFor="ost-unit">Recipe temperature is in</label>
          <select id="ost-unit" className="ost-select" value={unit} onChange={(e) => { setUnit(e.target.value as Unit); }}>
            <option value="f">°F (US recipe)</option>
            <option value="c">°C (metric recipe)</option>
            <option value="gas">Gas Mark (UK recipe)</option>
          </select>
        </div>

        {unit === 'gas' ? (
          <div className="ost-field">
            <label className="ost-label" htmlFor="ost-gas">Gas Mark</label>
            <select id="ost-gas" className="ost-select" value={gasValue} onChange={(e) => setGasValue(e.target.value)}>
              {GAS_OPTIONS.map((g) => (
                <option key={g} value={g}>Gas Mark {g}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="ost-field">
            <label className="ost-label" htmlFor="ost-value">Recipe says</label>
            <input
              id="ost-value"
              className="ost-input"
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={reportUse}
            />
            <span className="ost-unit-suffix">{unit === 'f' ? '°F' : '°C'}</span>
          </div>
        )}

        {unit !== 'gas' && (
          <div className="ost-field">
            <span className="ost-label">Does the recipe say “fan”?</span>
            <div className="ost-radio-row" role="radiogroup" aria-label="Fan notation">
              <label className="ost-radio">
                <input type="radio" name="ost-fan" checked={saysFan === 'no'} onChange={() => setSaysFan('no')} />
                <span>No fan mention</span>
              </label>
              <label className="ost-radio">
                <input type="radio" name="ost-fan" checked={saysFan === 'yes'} onChange={() => setSaysFan('yes')} />
                <span>Recipe says fan</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {result ? (
        <>
          <div className="ost-tiles">
            {tile('Conventional oven', `${result.best.conventional_c} °C`, `${result.best.conventional_f} °F · ${result.best.descriptor}`)}
            {tile('Fan / convection oven', `${result.best.fan_c} °C`, `${result.best.fan_f} °F`)}
            {tile('UK gas mark', `Mark ${result.best.gas_mark}`, result.best.descriptor)}
            {tile(
              'Air fryer',
              `Start at ${result.best.fan_c} °C`,
              <>Same as fan; check ~20% early — <Link href="/oven-to-air-fryer">air-fryer guide</Link></>
            )}
          </div>

          {result.exactNote ? <p className="ost-note">{result.exactNote}</p> : null}
          {result.roundingNote ? <p className="ost-note">{result.roundingNote}</p> : null}
          {result.ambiguityNote ? <p className="ost-note">{result.ambiguityNote}</p> : null}

          <p className="ost-source">
            Source: gas-mark and conventional values from the{' '}
            <a href="https://en.wikipedia.org/wiki/Gas_mark">published conversion guides</a> (BBC Good
            Food / The Guardian via Wikipedia); fan values apply the UK 20 °C-lower convention. Full
            provenance in our{' '}
            <a href="/data/oven-conversions.json">open dataset</a>.
          </p>
        </>
      ) : (
        <p className="ost-note">Enter a recipe temperature to see all four settings.</p>
      )}

      <style jsx>{`
        .ost-wrap {
          margin: 2.5rem 0;
          padding: 1.5rem;
          border: 1px solid #d7e3ee;
          border-radius: 12px;
          background: #f8fbfe;
        }
        .ost-lede {
          color: #334155;
          margin: 0.25rem 0 1.25rem;
        }
        .ost-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }
        .ost-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .ost-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
        }
        .ost-select,
        .ost-input {
          padding: 0.5rem 0.65rem;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          font-size: 1rem;
          background: #ffffff;
          min-width: 9rem;
        }
        .ost-input {
          max-width: 8rem;
        }
        .ost-unit-suffix {
          align-self: flex-start;
          font-size: 0.85rem;
          color: #475569;
        }
        .ost-radio-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding-top: 0.35rem;
        }
        .ost-radio {
          display: flex;
          gap: 0.35rem;
          align-items: center;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .ost-tiles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
          gap: 0.75rem;
          margin-top: 1.25rem;
        }
        .ost-tile {
          border: 1px solid #cbd9e6;
          border-radius: 10px;
          padding: 0.85rem;
          background: #ffffff;
        }
        .ost-tile-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #475569;
          font-weight: 700;
        }
        .ost-tile-main {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0.25rem;
        }
        .ost-tile-sub {
          font-size: 0.85rem;
          color: #475569;
          margin-top: 0.2rem;
        }
        .ost-note {
          font-size: 0.9rem;
          color: #334155;
          margin: 0.6rem 0 0;
        }
        .ost-source {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 1rem;
        }
        @media (max-width: 480px) {
          .ost-wrap {
            padding: 1rem;
          }
          .ost-tiles {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media print {
          .ost-controls,
          .ost-lede {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
