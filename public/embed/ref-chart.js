/*
 * ctofconverter embeddable reference chart — v1.0.0 (2026-08-27)
 *
 * Drop one tag where you want the table to appear:
 *   <script src="https://ctofconverter.com/embed/ref-chart.js" data-set="oven-conversions"></script>
 *
 * Attributes
 *   data-set    required. oven-conversions | human-body-temperature | safe-internal-temperatures
 *   data-cols   comma-separated column keys, e.g. "gas_mark,conventional_c,fan_c"
 *   data-title  replaces the heading above the table
 *   data-max    cap the number of rows (default: all of them)
 *   data-mount  id of a container element; default is the position of this script tag
 *   data-theme  auto (default) | light | dark
 *
 * No dependencies, no build step, no tracking, no cookies, one JSON request.
 * Data: CC-BY-4.0 — keep the attribution line the widget writes under the table.
 */
(function () {
  'use strict';

  // Captured while the tag is still executing: document.currentScript is null
  // inside a DOMContentLoaded callback, so it must not be read later.
  var SCRIPT = document.currentScript;
  var FALLBACK_ORIGIN = 'https://ctofconverter.com';
  var ORIGIN = FALLBACK_ORIGIN;
  if (SCRIPT && SCRIPT.src) {
    try {
      ORIGIN = new URL(SCRIPT.src, document.baseURI).origin;
    } catch (e) {
      ORIGIN = FALLBACK_ORIGIN;
    }
  }
  var STYLE_ID = 'ctof-ref-chart-style';

  function css() {
    return (
      '.ctof-rc{font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;margin:1em 0;' +
      'color:#111;max-width:100%}' +
      '.ctof-rc h3{font-size:15px;margin:0 0 .5em}' +
      '.ctof-rc .ctof-rc-wrap{overflow-x:auto;border:1px solid #0000001a;border-radius:8px}' +
      '.ctof-rc table{border-collapse:collapse;width:100%;min-width:320px}' +
      '.ctof-rc th,.ctof-rc td{text-align:left;padding:.5em .65em;border-bottom:1px solid #00000014;white-space:nowrap}' +
      '.ctof-rc th{background:#0000000d;font-weight:600}' +
      '.ctof-rc tbody tr:last-child td{border-bottom:0}' +
      '.ctof-rc .ctof-rc-foot{font-size:12px;opacity:.75;margin:.45em 0 0}' +
      '.ctof-rc a{color:inherit}' +
      '@media (prefers-color-scheme:dark){.ctof-rc{color:#eee}' +
      '.ctof-rc .ctof-rc-wrap,.ctof-rc th,.ctof-rc td{border-color:#ffffff26}' +
      '.ctof-rc th{background:#ffffff14}}' +
      '.ctof-rc[data-theme=light]{color:#111}' +
      '.ctof-rc[data-theme=dark]{color:#eee}' +
      '.ctof-rc[data-theme=dark] .ctof-rc-wrap,.ctof-rc[data-theme=dark] th,' +
      '.ctof-rc[data-theme=dark] td{border-color:#ffffff26}' +
      '.ctof-rc[data-theme=dark] th{background:#ffffff14}'
    );
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css();
    (document.head || document.documentElement).appendChild(s);
  }

  function pick(name, fallback) {
    if (!SCRIPT || !SCRIPT.getAttribute) return fallback;
    var v = SCRIPT.getAttribute(name);
    return v === null || v === '' ? fallback : v;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null && text !== '') n.textContent = String(text);
    return n;
  }

  function mountPoint() {
    var id = pick('data-mount', '');
    if (id) return document.getElementById(id);
    if (SCRIPT && SCRIPT.parentNode) return SCRIPT;
    return document.body ? document.body.firstChild : null;
  }

  function place(box, target) {
    if (target === SCRIPT) {
      // Render at the script's own position, right after the tag.
      if (SCRIPT.parentNode) SCRIPT.parentNode.insertBefore(box, SCRIPT.nextSibling);
      else if (document.body) document.body.appendChild(box);
      return;
    }
    target.appendChild(box);
  }

  function render(host, ds, wantedCols, title, maxRows, theme) {
    var all = ds.columns || [];
    var cols = wantedCols
      ? all.filter(function (c) {
          return wantedCols.indexOf(c.key) > -1;
        })
      : all.filter(function (c) {
          return c.export !== false;
        });
    if (!cols.length) cols = all;

    var box = el('div', 'ctof-rc');
    box.setAttribute('data-theme', theme || 'auto');
    if (title || ds.title) box.appendChild(el('h3', null, title || ds.title));

    var wrap = el('div', 'ctof-rc-wrap');
    var table = el('table');
    var thead = el('thead');
    var hr = el('tr');
    cols.forEach(function (c) {
      hr.appendChild(el('th', null, (c.label || c.key) + (c.unit ? ' (' + c.unit + ')' : '')));
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    var rows = ds.rows || [];
    if (maxRows) rows = rows.slice(0, Number(maxRows));
    rows.forEach(function (row) {
      var tr = el('tr');
      cols.forEach(function (c) {
        tr.appendChild(el('td', null, row[c.key]));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    box.appendChild(wrap);

    var foot = el('p', 'ctof-rc-foot');
    var ver = 'v' + (ds.version || '0') + (ds.updated ? ' · updated ' + ds.updated : '');
    foot.appendChild(document.createTextNode('Data: '));
    var a = el('a', null, 'ctofconverter.com');
    a.href = ORIGIN + '/data-api';
    a.target = '_blank';
    a.rel = 'noopener';
    foot.appendChild(a);
    foot.appendChild(document.createTextNode(' · ' + ver + ' · CC-BY-4.0'));
    box.appendChild(foot);

    place(box, host);
  }

  function unavailable(target, message) {
    var p = el('p', 'ctof-rc-foot', 'Reference chart unavailable' + (message ? ' (' + message + ')' : ''));
    var link = el('a', null, ORIGIN + '/data-api');
    link.href = ORIGIN + '/data-api';
    link.target = '_blank';
    link.rel = 'noopener';
    p.appendChild(document.createTextNode(' — '));
    p.appendChild(link);
    if (target === SCRIPT && SCRIPT.parentNode) SCRIPT.parentNode.insertBefore(p, SCRIPT.nextSibling);
    else if (target && target.appendChild) target.appendChild(p);
    else if (document.body) document.body.appendChild(p);
  }

  function boot() {
    var id = pick('data-set', '');
    if (!id) {
      console.warn('[ctof-ref-chart] missing data-set attribute');
      return;
    }
    var target = mountPoint();
    if (!target) return;
    injectStyle();

    var wanted = pick('data-cols', '');
    fetch(ORIGIN + '/data/' + encodeURIComponent(id) + '.json', { mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (ds) {
        render(
          target,
          ds,
          wanted ? wanted.split(',').map(function (s) { return s.trim(); }) : null,
          pick('data-title', ''),
          pick('data-max', ''),
          pick('data-theme', 'auto')
        );
      })
      .catch(function (e) {
        unavailable(target, e && e.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
