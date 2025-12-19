const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');

// Find all sitemap XML files
const files = fs.readdirSync(publicDir).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if it already has the stylesheet reference
    if (!content.includes('<?xml-stylesheet')) {
        // Inject right after the <?xml...?> line
        const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
        const xslLine = '\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

        if (content.startsWith(xmlHeader)) {
            content = xmlHeader + xslLine + content.substring(xmlHeader.length);
            fs.writeFileSync(filePath, content);
            console.log(`Successfully injected sitemap.xsl into ${file}`);
        } else {
            console.error(`Could not find standard XML header in ${file}`);
        }
    } else {
        console.log(`${file} already contains stylesheet reference.`);
    }
});
