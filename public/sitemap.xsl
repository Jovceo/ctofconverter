<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
			<head>
				<title>XML Sitemap - C to F Converter</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
					body {
						font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
						font-size: 14px;
						color: #334155;
						margin: 0;
						padding: 40px 20px;
						background-color: #f8fafc;
					}
					.container {
						max-width: 1000px;
						margin: 0 auto;
						background: #fff;
						padding: 40px;
						border-radius: 16px;
						box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
					}
					h1 {
						color: #1e293b;
						font-size: 28px;
						font-weight: 700;
						margin: 0 0 10px 0;
					}
					p.description {
						color: #64748b;
						margin-bottom: 30px;
						line-height: 1.5;
					}
					table {
						width: 100%;
						border-collapse: collapse;
						margin-top: 20px;
					}
					th {
						text-align: left;
						padding: 12px 16px;
						background-color: #f1f5f9;
						color: #475569;
						font-weight: 600;
						border-bottom: 2px solid #e2e8f0;
					}
					td {
						padding: 12px 16px;
						border-bottom: 1px solid #f1f5f9;
						word-break: break-all;
					}
					tr:hover td {
						background-color: #f8fafc;
					}
					a {
						color: #3b82f6;
						text-decoration: none;
						font-weight: 500;
					}
					a:hover {
						text-decoration: underline;
					}
					.count {
						display: inline-block;
						padding: 4px 12px;
						background: #e0f2fe;
						color: #0369a1;
						border-radius: 9999px;
						font-size: 12px;
						font-weight: 600;
						margin-left: 10px;
					}
					.priority-high { color: #16a34a; font-weight: 600; }
					.priority-mid { color: #ca8a04; }
					.priority-low { color: #94a3b8; }
					.footer {
						margin-top: 40px;
						text-align: center;
						color: #94a3b8;
						font-size: 12px;
					}
					.lang-tag {
						display: inline-block;
						padding: 2px 6px;
						background: #f1f5f9;
						color: #64748b;
						border-radius: 4px;
						font-size: 11px;
						margin-right: 4px;
						margin-top: 4px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>XML Sitemap</h1>
					<p class="description">
						This is a sitemap for <a href="https://ctofconverter.com">ctofconverter.com</a>.
						<xsl:if test="sitemap:urlset">
							It contains <span class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs</span>
						</xsl:if>
						<xsl:if test="sitemap:sitemapindex">
							This is a sitemap index containing <span class="count"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps</span>
						</xsl:if>
					</p>

					<xsl:if test="sitemap:sitemapindex">
						<table id="sitemap-index">
							<thead>
								<tr>
									<th>Sitemap URL</th>
									<th>Last Modified</th>
								</tr>
							</thead>
							<tbody>
								<xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
									<tr>
										<td>
											<a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
										</td>
										<td>
											<xsl:value-of select="substring(sitemap:lastmod, 0, 11)"/>
										</td>
									</tr>
								</xsl:for-each>
							</tbody>
						</table>
					</xsl:if>

					<xsl:if test="sitemap:urlset">
						<table id="sitemap">
							<thead>
								<tr>
									<th width="50%">URL</th>
									<th width="15%">Priority</th>
									<th width="15%">Change Freq.</th>
									<th width="20%">Last Modified</th>
								</tr>
							</thead>
							<tbody>
								<xsl:for-each select="sitemap:urlset/sitemap:url">
									<xsl:sort select="sitemap:priority" order="descending"/>
									<tr>
										<td>
											<a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
											<xsl:if test="xhtml:link">
												<div style="margin-top: 8px;">
													<xsl:for-each select="xhtml:link">
														<span class="lang-tag">
															<xsl:value-of select="@hreflang"/>
														</span>
													</xsl:for-each>
												</div>
											</xsl:if>
										</td>
										<td>
											<xsl:variable name="p" select="sitemap:priority"/>
											<span>
												<xsl:attribute name="class">
													<xsl:choose>
														<xsl:when test="$p &gt;= 0.9">priority-high</xsl:when>
														<xsl:when test="$p &gt;= 0.7">priority-mid</xsl:when>
														<xsl:otherwise>priority-low</xsl:otherwise>
													</xsl:choose>
												</xsl:attribute>
												<xsl:value-of select="sitemap:priority"/>
											</span>
										</td>
										<td><xsl:value-of select="sitemap:changefreq"/></td>
										<td>
											<xsl:value-of select="substring(sitemap:lastmod, 0, 11)"/>
										</td>
									</tr>
								</xsl:for-each>
							</tbody>
						</table>
					</xsl:if>

					<div class="footer">
						Generated by next-sitemap | Visual Styling by Antigravity AI
					</div>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
