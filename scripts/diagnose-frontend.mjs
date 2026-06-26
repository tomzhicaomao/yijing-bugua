import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const pages = [
  { url: 'http://localhost:5174/', name: 'home' },
  { url: 'http://localhost:5174/divine', name: 'divine' },
  { url: 'http://localhost:5174/history', name: 'history' },
  { url: 'http://localhost:5174/stats', name: 'stats' },
  { url: 'http://localhost:5174/settings', name: 'settings' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }
});

const results = [];

for (const page of pages) {
  console.log(`\n🔍 扫描页面: ${page.name}`);

  const tab = await context.newPage();
  const errors = [];

  tab.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  tab.on('pageerror', err => {
    errors.push(err.message);
  });

  try {
    await tab.goto(page.url, { waitUntil: 'networkidle', timeout: 10000 });
    await tab.waitForTimeout(2000);

    await tab.screenshot({
      path: `/tmp/page-${page.name}.png`,
      fullPage: true
    });

    const analysis = await tab.evaluate(() => {
      const issues = [];

      // Check for empty elements with significant size
      const emptyElements = document.querySelectorAll(':empty');
      const significantEmpty = Array.from(emptyElements).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 50 || rect.height > 50;
      });
      if (significantEmpty.length > 0) {
        issues.push(`${significantEmpty.length} 个大尺寸空元素`);
      }

      // Check for elements outside viewport
      const allElements = document.querySelectorAll('div, section, main, nav');
      let outsideCount = 0;
      let outsideDetails = [];
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.x < -10 || rect.x > window.innerWidth + 10) {
          outsideCount++;
          if (outsideDetails.length < 3) {
            outsideDetails.push(`${el.tagName}.${el.className?.substring(0, 30)}`);
          }
        }
      });
      if (outsideCount > 0) {
        issues.push(`${outsideCount} 个元素超出水平视口: ${outsideDetails.join(', ')}`);
      }

      // Check main content height
      const main = document.querySelector('main');
      if (main) {
        const mainRect = main.getBoundingClientRect();
        const contentHeight = main.scrollHeight;
        const visibleHeight = mainRect.height;
        const ratio = contentHeight / visibleHeight;
        if (ratio < 0.5 && visibleHeight > 500) {
          issues.push(`内容高度仅为容器的 ${Math.round(ratio * 100)}%，存在大量空白`);
        }
      }

      // Check button accessibility
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
          issues.push(`按钮缺少文本和 aria-label`);
        }
      });

      // Check for z-index stacking issues
      const fixedElements = document.querySelectorAll('.fixed');
      if (fixedElements.length > 2) {
        issues.push(`${fixedElements.length} 个固定定位元素`);
      }

      // Check for overlapping clickable elements
      const clickables = document.querySelectorAll('button, a, [onClick]');
      const clickableRects = Array.from(clickables).map(el => ({
        rect: el.getBoundingClientRect(),
        text: el.textContent?.trim().substring(0, 30)
      }));

      for (let i = 0; i < clickableRects.length; i++) {
        for (let j = i + 1; j < clickableRects.length; j++) {
          const a = clickableRects[i].rect;
          const b = clickableRects[j].rect;
          if (a.x < b.x + b.width && a.x + a.width > b.x &&
              a.y < b.y + b.height && a.y + a.height > b.y) {
            const overlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
            if (overlap > 20) {
              issues.push(`按钮重叠: "${clickableRects[i].text}" 和 "${clickableRects[j].text}"`);
            }
          }
        }
      }

      return { issues, buttonCount: buttons.length };
    });

    results.push({
      page: page.name,
      url: page.url,
      errors,
      analysis,
      screenshot: `/tmp/page-${page.name}.png`
    });

    console.log(`  ✅ 截图已保存`);
    if (errors.length > 0) {
      console.log(`  ❌ 控制台错误: ${errors.length} 个`);
      errors.forEach(e => console.log(`     ${e}`));
    }
    if (analysis.issues.length > 0) {
      console.log(`  ⚠️  布局问题: ${analysis.issues.length} 个`);
      analysis.issues.forEach(i => console.log(`     ${i}`));
    }

  } catch (err) {
    console.log(`  ❌ 页面加载失败: ${err.message}`);
    results.push({
      page: page.name,
      url: page.url,
      errors: [err.message],
      analysis: null,
      screenshot: null
    });
  }

  await tab.close();
}

// Generate detailed report
console.log('\n' + '='.repeat(70));
console.log('📊 前端诊断报告');
console.log('='.repeat(70));

let totalIssues = 0;
const report = [];

results.forEach(result => {
  console.log(`\n📄 ${result.page.toUpperCase()}`);
  console.log(`   URL: ${result.url}`);

  const pageReport = { page: result.page, issues: [] };

  if (result.errors.length > 0) {
    console.log(`   ❌ 控制台错误 (${result.errors.length}):`);
    result.errors.forEach(err => {
      console.log(`      • ${err}`);
      pageReport.issues.push({ type: 'error', detail: err });
    });
    totalIssues += result.errors.length;
  }

  if (result.analysis) {
    if (result.analysis.issues.length > 0) {
      console.log(`   ⚠️  布局问题 (${result.analysis.issues.length}):`);
      result.analysis.issues.forEach(issue => {
        console.log(`      • ${issue}`);
        pageReport.issues.push({ type: 'layout', detail: issue });
      });
      totalIssues += result.analysis.issues.length;
    }

    if (result.analysis.issues.length === 0 && result.errors.length === 0) {
      console.log(`   ✅ 未发现明显问题`);
    }
  }

  report.push(pageReport);
});

console.log('\n' + '='.repeat(70));
console.log(`📈 总计发现 ${totalIssues} 个问题`);
console.log('='.repeat(70));

// Save report
writeFileSync('/tmp/frontend-diagnosis.json', JSON.stringify(report, null, 2));
console.log('\n💾 详细报告已保存: /tmp/frontend-diagnosis.json');

await browser.close();
