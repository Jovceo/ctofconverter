import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getLocalizedLink } from '../utils/i18n';
import { datasetManifest } from '../utils/refDatasets';
import { getLatestModifiedDate } from '../utils/dateHelpers';

interface DataApiProps {
    locale: string;
    lastUpdatedIso: string;
    manifest: ReturnType<typeof datasetManifest>;
}

const SITE = 'https://ctofconverter.com';

export default function DataApi({ locale, lastUpdatedIso, manifest }: DataApiProps) {
    const title = 'Reference Temperature Datasets & Free JSON API';
    const description = 'Oven, food-safety and body-temperature reference tables as open JSON/CSV, a no-key API and an embeddable chart.';

    return (
        <Layout seo={{ title, description }}>
            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? 'font-ar' : ''}>
                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href={getLocalizedLink('/', locale)} aria-label="C to F Converter">
                                <span aria-hidden="true">C to F Converter</span>
                            </Link>
                        </div>
                        <h1>{title}</h1>
                        <p className="tagline">{description}</p>
                    </div>
                </header>
                <Navigation />
                <main id="main-content">
                    <div className="container">
                        <section className="capsule">
                            <p>
                                These are the same temperature tables this site publishes, in machine-readable form:
                                open JSON and CSV files, a read-only API with no key and no signup, and a one-line
                                embeddable chart. Every number carries the source it was checked against and the date it
                                was checked. You may use them commercially if you keep the attribution line.
                            </p>
                        </section>

                        <section className="block" id="datasets">
                            <h2>Datasets</h2>
                            <div className="table-scroll">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Dataset</th>
                                            <th>What is in it</th>
                                            <th>Rows</th>
                                            <th>Version</th>
                                            <th>Get it</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {manifest.datasets.map((d) => (
                                            <tr key={d.id}>
                                                <td><code>{d.id}</code></td>
                                                <td>{d.description}</td>
                                                <td>{d.rows}</td>
                                                <td>{d.version}<br /><small>{d.updated}</small></td>
                                                <td>
                                                    <a href={d.urls.json}>JSON</a> · <a href={d.urls.csv}>CSV</a> ·{' '}
                                                    <a href={SITE + d.urls.api}>API</a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="note">
                                Machine-readable index: <a href={`${SITE}/data/manifest.json`}>/data/manifest.json</a>{' '}
                                · browsable index: <a href={`${SITE}/data/`}>/data/</a>
                            </p>
                        </section>

                        <section className="block" id="api">
                            <h2>API</h2>
                            <p>
                                Plain HTTPS GET, <code>Access-Control-Allow-Origin: *</code>, so you can call it straight
                                from a browser. No key, no signup, no rate-limit games — cache-friendly responses
                                (<code>s-maxage=86400</code>) and versioned files, so pinning a version is possible.
                            </p>
                            <pre><code>{`# whole dataset as JSON
curl ${SITE}/api/ref/oven-conversions

# same data as CSV
curl ${SITE}/api/ref/oven-conversions?format=csv

# pick columns, filter rows
curl "${SITE}/api/ref/safe-internal-temperatures?select=product,min_fahrenheit&q=poultry"

# convert a value and classify it against the checked bands
curl "${SITE}/api/ref/lookup?value=37.8&unit=c&context=body"
curl "${SITE}/api/ref/lookup?value=180&unit=c&context=oven"

# the body dataset marks each row with the setting and the age group it belongs to;
# the lookup endpoint only applies 'home' rows unless you ask otherwise
curl "${SITE}/api/ref/lookup?value=35.4&unit=c&context=body&setting=all"
curl "${SITE}/api/ref/lookup?value=39.6&unit=c&context=body&person=infant"`}</code></pre>
                            <p className="note">
                                <code>lookup</code> only converts and matches published rows. It never interpolates a
                                value the dataset does not contain; if nothing matches you get{' '}
                                <code>matched: false</code>. Rows about inpatient or perioperative thresholds are
                                excluded from the default answer on purpose — a hospital escalation number is not a
                                home triage number. <code>person=infant|child|adult|neonate</code> narrows the answer to
                                the rows that apply to that age group.
                            </p>
                        </section>

                        <section className="block" id="embed">
                            <h2>Embed the chart</h2>
                            <p>One script tag, no build step, no dependencies, no tracking, no cookies. It renders a table styled to match the host page (including dark mode) and links back here. <a href="/embed/demo.html">See it running with three real datasets.</a></p>
                            <pre><code>{`<script src="${SITE}/embed/ref-chart.js"
        data-set="oven-conversions"></script>`}</code></pre>
                            <pre><code>{`<script src="${SITE}/embed/ref-chart.js"
        data-set="human-body-temperature"
        data-cols="label,c_min,c_max,source"
        data-title="Published fever and hypothermia thresholds"
        data-max="10"></script>`}</code></pre>
                            <div className="table-scroll">
                                <table>
                                    <thead>
                                        <tr><th>Attribute</th><th>Effect</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td><code>data-set</code></td><td>Which dataset to render (required).</td></tr>
                                        <tr><td><code>data-cols</code></td><td>Comma-separated column keys, e.g. <code>gas_mark,conventional_c,fan_c</code>.</td></tr>
                                        <tr><td><code>data-title</code></td><td>Override the heading above the table.</td></tr>
                                        <tr><td><code>data-max</code></td><td>Cap the number of rows.</td></tr>
                                        <tr><td><code>data-mount</code></td><td>Render into the element with this id instead of the script position.</td></tr>
                                        <tr><td><code>data-theme</code></td><td><code>auto</code> (default), <code>light</code> or <code>dark</code>.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="block" id="provenance">
                            <h2>Where the numbers come from</h2>
                            <p>
                                Each dataset file lists its own <code>provenance</code>: the authority, the URL, the date
                                we checked it, and a note where sources disagree. Nothing is published that has not been
                                checked against a primary source; when a value cannot be confirmed it is left out rather
                                than averaged. Corrections are shipped as a new <code>version</code> with the date in{' '}
                                <code>updated</code>, and the old files stay reachable, so a table in your app never
                                silently changes underneath you.
                            </p>
                            <p>
                                If you find a number that does not match its cited source, that is a bug: mail{' '}
                                <a href="mailto:lhqlvp@gmail.com">lhqlvp@gmail.com</a> or open an issue at{' '}
                                <a href="https://github.com/Jovceo/ctofconverter" rel="noopener">github.com/Jovceo/ctofconverter</a>.
                                We would rather be told than be quietly wrong.
                            </p>
                        </section>

                        <section className="block" id="license">
                            <h2>License and attribution</h2>
                            <p>
                                Datasets are <strong>CC-BY-4.0</strong>; the embed snippet and API code are MIT. One line
                                is enough:
                            </p>
                            <pre><code>{`Temperature data: ctofconverter.com — CC-BY-4.0
https://ctofconverter.com/data-api`}</code></pre>
                            <p className="note">
                                Attribution link must be a normal followable link (not behind a redirect farm). That is
                                the whole condition — the point of publishing this is that people can use it, not that we
                                collect traffic.
                            </p>
                        </section>

                        <section className="block" id="medical">
                            <h2>Medical note</h2>
                            <p className="disclaimer">
                                The body-temperature dataset is a reference table of published thresholds, not medical
                                advice, and it is not a diagnostic tool. It is written for software and for people
                                building reference material. For an actual decision about a sick person — especially an
                                infant under three months — follow the guidance of a clinician or your local emergency
                                number, not a table. Each row states the authority it came from so you can check the
                                original yourself.
                            </p>
                        </section>
                    </div>
                </main>
                <Footer lastUpdated={lastUpdatedIso} />
            </div>
            <style jsx>{`
                .capsule { margin: 1.6rem 0 0.4rem; }
                .capsule p { font-size: 1.05rem; line-height: 1.75; color: #2d3748; margin: 0; }
                .block { padding: 1.4rem 0 0.2rem; }
                .block h2 { margin: 0 0 .6rem; color: #2c3e50; font-size: 1.25rem; }
                .block p { line-height: 1.75; color: #4a5568; margin: 0 0 .9rem; }
                pre { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .9rem; overflow-x: auto; font-size: .85rem; line-height: 1.6; }
                code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
                .table-scroll { overflow-x: auto; }
                table { border-collapse: collapse; width: 100%; min-width: 34rem; margin-bottom: .9rem; font-size: .92rem; }
                th, td { text-align: left; padding: .55rem .6rem; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
                th { background: #f7fafc; font-weight: 600; }
                .note { font-size: .88rem; color: #718096; }
                .disclaimer { background: #fffaf0; border: 1px solid #f6ad55; border-radius: 8px; padding: .9rem 1rem; }
                @media (max-width: 640px) {
                    .block h2 { font-size: 1.15rem; }
                    table { font-size: .85rem; }
                }
            `}</style>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {
            lastUpdatedIso: getLatestModifiedDate([
                'pages/data-api.tsx',
                'config/datasets',
                'scripts/publish-dataset.js',
            ]),
            manifest: datasetManifest(),
        },
    };
};
