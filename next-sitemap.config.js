
/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://ctofconverter.com',
    generateRobotsTxt: true,
    sitemapSize: 5000,
    exclude: [
        '/404',
        '/500',
        '/_error',
        '/temperature-template', // Template component, not a page
        '/server-sitemap.xml',   // In case we have dynamic server maps
        '/start',                // System pages
        '/api/*'                 // API routes
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/*',
                    '/temperature-template'
                ],
            },
            {
                userAgent: 'GPTBot',
                disallow: '/'
            }
        ],
    },
}
