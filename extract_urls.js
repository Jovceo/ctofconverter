const fs = require('fs');
const content = fs.readFileSync('https___ctofconverter.com_-Coverage-Drilldown-2026-01-12.xlsx');
const text = content.toString('utf8');
const urls = text.match(/https?:\/\/[^\s<>"]+/g);
if (urls) {
    console.log(JSON.stringify([...new Set(urls)], null, 2));
} else {
    // Try other encodings or just look for path-like strings
    const paths = text.match(/\/[a-zA-Z0-9\-\.\/]+/g);
    if (paths) {
        console.log(JSON.stringify([...new Set(paths)].filter(p => !p.includes('xml') && p.length > 5), null, 2));
    } else {
        console.log("No URLs found");
    }
}
