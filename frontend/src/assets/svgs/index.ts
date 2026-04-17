/**
 * SVG 图标自动注册
 * 所有 SVG 文件将自动注册为图标，使用格式：svg:filename
 * 例如：svg:theme-light 对应 theme-light.svg 文件
 */

// 导入所有 SVG 文件
const svgFiles = import.meta.glob('./**/*.svg', { eager: true, query: '?raw', import: 'default' });

// 创建图标符号
function createSvgSprite() {
  const symbolDefs = new Map<string, string>();
  
  Object.entries(svgFiles).forEach(([path, svgContent]) => {
    // 从路径提取文件名（不含扩展名）
    const filename = path.replace(/^\.\/(.*)\.svg$/, '$1');
    const iconId = `icon-${filename}`;
    
    // 解析 SVG 内容并提取内部元素
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent as string, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    
    // 创建 symbol 元素
    const symbolId = iconId;
    const viewBox = svgElement.getAttribute('viewBox') || '0 0 52 45';
    
    // 提取 SVG 内部内容
    const innerContent = svgElement.innerHTML;
    
    symbolDefs.set(symbolId, `<symbol id="${symbolId}" viewBox="${viewBox}">${innerContent}</symbol>`);
  });
  
  // 创建 SVG sprite
  const svgSprite = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0; height: 0; overflow: hidden;">
      ${Array.from(symbolDefs.values()).join('\n')}
    </svg>
  `;
  
  return svgSprite;
}

// 在 DOM 中注入 SVG Sprite
export function initSvgSprites() {
  const container = document.createElement('div');
  container.innerHTML = createSvgSprite();
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'absolute';
  container.style.width = '0';
  container.style.height = '0';
  container.style.overflow = 'hidden';
  container.style.zIndex = '-1';
  
  document.body.insertBefore(container, document.body.firstChild);
}

export default initSvgSprites;
