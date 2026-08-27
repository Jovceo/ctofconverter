# Reference temperature datasets

Open, machine-readable versions of the temperature tables published on
[ctofconverter.com](https://ctofconverter.com). Built for other people's software: a
baking app, a fever tracker, a kitchen converter, a spreadsheet, a lesson plan.

- **No key, no signup, no quota form.** `Access-Control-Allow-Origin: *` on every API response.
- **Every number states its source and the date it was checked**, inside the file (`provenance`).
- **Two formats, same data**: `.json` (with column metadata) and `.csv` (RFC 4180, CRLF, UTF-8 without BOM).
- **Versioned.** A correction is a new `version` + `updated` date; old files keep working.

## The files

| File | Contents |
|---|---|
| `manifest.json` | Index of every dataset: row counts, columns, versions, endpoints |
| `oven-conversions.json` / `.csv` | Conventional ↔ fan ↔ °F ↔ UK gas mark, with the reduction convention and typical uses |
| `safe-internal-temperatures.json` / `.csv` | Minimum safe internal cooking temperatures (USDA), incl. the danger zone |
| `human-body-temperature.json` / `.csv` | Fever bands, age-group escalation thresholds, measurement-site normal ranges |
| `index.html` | The same index as a readable page |

## Read it

```bash
curl https://ctofconverter.com/data/manifest.json
curl https://ctofconverter.com/data/oven-conversions.json
curl https://ctofconverter.com/data/oven-conversions.csv
```

Or through the API, which adds filtering and a lookup helper:

```bash
curl "https://ctofconverter.com/api/ref/oven-conversions?select=gas_mark,conventional_c,fan_c"
curl "https://ctofconverter.com/api/ref/safe-internal-temperatures?q=poultry"
curl "https://ctofconverter.com/api/ref/lookup?value=37.8&unit=c&context=body"
```

`/data/*` are static files (CDN-cached, immutable per version). `/api/ref/*` is the same
data plus `select` / `q` / `format=csv` and the `lookup` classifier.

## File shape

```json
{
  "id": "oven-conversions",
  "version": "1.0.0",
  "updated": "2026-08-27",
  "license": "CC-BY-4.0",
  "attribution": "ctofconverter.com",
  "provenance": [
    { "source": "…", "url": "https://…", "checkedOn": "2026-08-27", "note": "where sources disagree" }
  ],
  "columns": [ { "key": "gas_mark", "label": "UK Gas Mark", "type": "string" } ],
  "rows": [ { "gas_mark": "4", "conventionalC": 180, "conventional_c": "180°C", "fan_c": "160°C" } ],
  "notes": ["Fan/convection figures use the −20 °C convention, not a measurement."],
  "disclaimer": "null for cooking data; medical note is present on the body-temperature dataset"
}
```

Two conventions worth knowing:

1. Display strings (`"180°C"`) and numeric fields (`conventionalC: 180`) both exist. Use the
   numeric one for logic; never parse the string.
2. Ranges carry `cMin` / `cMax` numbers so classification does not require text parsing.

## Embed

```html
<script src="https://ctofconverter.com/embed/ref-chart.js" data-set="oven-conversions"></script>
```

No dependencies, no tracking, no cookies; follows the host page's colour scheme. Optional
attributes: `data-cols`, `data-title`, `data-max`, `data-mount`, `data-theme`. Docs:
[ctofconverter.com/data-api](https://ctofconverter.com/data-api#embed).

## License

Data files: **CC-BY-4.0** ([deed](https://creativecommons.org/licenses/by/4.0/)). Code
(`ref-chart.js`, API implementation): **MIT**.

Attribution is one line:

```
Temperature data: ctofconverter.com — CC-BY-4.0
https://ctofconverter.com/data-api
```

A normal followable link back is the only requirement.

## Not a source of authority

These files are a *curation layer*. The authorities are the ones listed in each file's
`provenance` — read them there, and cite them there. The body-temperature dataset is a
reference table of published thresholds, **not medical advice**; it must not be the only
basis for a decision about a sick person.

## Corrections

The canonical source of these files is `config/datasets/*.json` in
[github.com/Jovceo/ctofconverter](https://github.com/Jovceo/ctofconverter); this folder is
generated from it at build time, so the site, the API and the download can never disagree.
If a number here does not match its cited source, that is a bug — open an issue, or mail
lhqlvp@gmail.com.
