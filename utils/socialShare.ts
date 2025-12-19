/**
 * 社交分享工具模块
 * 提供生成各种社交媒体分享链接的功能
 */

interface SocialShareOptions {
  url: string;
  title: string;
  description: string;
  conversionResult: string;
  imageUrl?: string;
}

interface SocialShareLinks {
  twitter: string;
  facebook: string;
  linkedin: string;
  pinterest: string;
  whatsapp: string;
  email: string;
  reddit: string;
}

/**
 * 生成社交分享链接
 * @param options 分享选项
 * @returns 各种社交平台的分享链接
 */
export function generateSocialShareLinks(options: SocialShareOptions): SocialShareLinks {
  const { url, title, description, conversionResult, imageUrl } = options;
  
  // 对URL和文本进行编码
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${title} - ${conversionResult}`);
  const encodedDescription = encodeURIComponent(description);
  const encodedImageUrl = imageUrl ? encodeURIComponent(imageUrl) : '';
  
  return {
    // Twitter分享
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    
    // Facebook分享
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    
    // LinkedIn分享
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    
    // Pinterest分享
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImageUrl}&description=${encodedTitle}`,
    
    // WhatsApp分享
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    
    // 邮件分享
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    
    // Reddit分享
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
  };
}

/**
 * 生成转换结果卡片图片的HTML模板（用于分享）
 * @param celsius 摄氏度值
 * @param fahrenheit 华氏度值
 * @param title 卡片标题
 * @returns HTML字符串
 */
export function generateResultCardHTML(celsius: number, fahrenheit: number, title: string = '温度转换结果'): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .result-card {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
          width: 90%;
        }
        .card-title {
          color: #333;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        .temperature-conversion {
          font-size: 36px;
          font-weight: bold;
          margin: 30px 0;
        }
        .celsius {
          color: #ff6b6b;
        }
        .arrow {
          margin: 0 20px;
          color: #666;
        }
        .fahrenheit {
          color: #4ecdc4;
        }
        .source-info {
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="result-card">
        <div class="card-title">${title}</div>
        <div class="temperature-conversion">
          <span class="celsius">${celsius}°C</span>
          <span class="arrow">→</span>
          <span class="fahrenheit">${fahrenheit.toFixed(1)}°F</span>
        </div>
        <div class="source-info">
          <div>精确计算，可信赖的温度转换</div>
          <div>来自: ctofconverter.com</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 生成可复制的转换结果文本
 * @param celsius 摄氏度值
 * @param fahrenheit 华氏度值
 * @param format 格式类型
 * @returns 格式化的文本
 */
export function generateCopyableResult(
  celsius: number, 
  fahrenheit: number, 
  format: 'simple' | 'detailed' | 'formula' = 'simple'
): string {
  switch (format) {
    case 'detailed':
      return `温度转换结果:
${celsius}°C (摄氏度) = ${fahrenheit.toFixed(1)}°F (华氏度)

转换公式:
(°C × 9/5) + 32 = °F
(${celsius} × 9/5) + 32 = ${fahrenheit.toFixed(1)}

了解更多: https://ctofconverter.com`;
      
    case 'formula':
      return `温度转换公式: °C 到 °F
公式: (°C × 9/5) + 32 = °F
示例: ${celsius}°C = ${fahrenheit.toFixed(1)}°F`;
      
    default:
      return `${celsius}°C = ${fahrenheit.toFixed(1)}°F`;
  }
}
