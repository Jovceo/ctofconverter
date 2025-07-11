import os
import glob
from bs4 import BeautifulSoup
from datetime import datetime

# 配置
BASE_URL = "https://ctofconverter.com"
OUTPUT_FILE = "sitemap.xml"

# 查找所有HTML文件
def find_html_files():
    return glob.glob('**/*.html', recursive=True)

# 生成sitemap内容
def generate_sitemap():
    html_files = find_html_files()
    
    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''
    
    for file in html_files:
        # 跳过sitemap.xml本身
        if file == OUTPUT_FILE:
            continue
            
        # 转换路径格式
        path = file.replace('\\', '/')
        url = f"{BASE_URL}/{path}"
        
        # 获取文件修改时间
        lastmod = datetime.fromtimestamp(os.path.getmtime(file))\
                  .strftime('%Y-%m-%d')
        
        sitemap += f'''  <url>
    <loc>{url}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
'''
    
    sitemap += '</urlset>'
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(sitemap)

if __name__ == "__main__":
    generate_sitemap()