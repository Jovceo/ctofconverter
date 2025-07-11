import os
import glob
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 配置
BASE_URL = "https://ctofconverter.com"
OUTPUT_FILE = "sitemap.xml"

# 查找所有HTML文件
def find_html_files():
    try:
        files = glob.glob('**/*.html', recursive=True)
        logger.info(f"Found {len(files)} HTML files")
        return files
    except Exception as e:
        logger.error(f"Error finding HTML files: {e}")
        return []

# 生成sitemap内容
def generate_sitemap():
    html_files = find_html_files()
    if not html_files:
        logger.warning("No HTML files found")
        return

    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''

    for file in html_files:
        # 跳过sitemap.xml本身
        if file == OUTPUT_FILE:
            continue

        try:
            # 转换路径格式
            path = file.replace(os.sep, '/')
            url = f"{BASE_URL}/{path}"

            # 获取文件修改时间
            lastmod = datetime.fromtimestamp(os.path.getmtime(file))
                      .strftime('%Y-%m-%d')

            sitemap += f'''  <url>
    <loc>{url}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
'''
        except Exception as e:
            logger.error(f"Error processing {file}: {e}")
            continue

    sitemap += '</urlset>'

    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(sitemap)
        logger.info(f"Sitemap generated successfully: {OUTPUT_FILE}")
    except Exception as e:
        logger.error(f"Error writing sitemap: {e}")

if __name__ == "__main__":
    generate_sitemap()