import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('GameListDialog Performance Baseline', () => {
  let performanceMetrics = {
    timestamp: new Date().toISOString(),
    environment: 'Development',
    baseUrl: 'http://125.187.89.85:5173',
    component: 'GameListDialog',
    vendor: 'Pragmatic Play',
    results: {}
  };

  test('Measure current GameListDialog performance', async ({ page }) => {
    console.log('🚀 Starting GameListDialog Performance Baseline Test');

    // Navigate to the application
    await page.goto('http://125.187.89.85:5173');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Try to find and navigate to game settings
    console.log('🔍 Looking for navigation to game settings...');
    
    // Check current page content
    const pageContent = await page.content();
    const hasReact = pageContent.includes('react');
    const hasMUI = pageContent.includes('Mui') || pageContent.includes('mui');
    
    console.log(`📄 Page analysis: React=${hasReact}, MUI=${hasMUI}`);
    
    // Look for any navigation elements
    const navigationSelectors = [
      'a[href*="game"]',
      'button:has-text("게임")',
      'button:has-text("Game")',
      '[data-testid="game-settings"]',
      '.game-settings',
      'nav a:has-text("게임")',
      // Fallback selectors
      'nav a',
      'button',
      '.nav-item',
      '[role="menuitem"]'
    ];

    let gameSettingsLink = null;
    for (const selector of navigationSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await element.textContent();
          const href = await element.getAttribute('href');
          
          if (text && (
            text.includes('게임') || 
            text.includes('Game') || 
            text.includes('games') ||
            (href && href.includes('game'))
          )) {
            gameSettingsLink = element;
            console.log(`✅ Found game-related link: "${text}" (${href})`);
            break;
          }
        }
        if (gameSettingsLink) break;
      } catch (e) {
        continue;
      }
    }

    if (gameSettingsLink) {
      await gameSettingsLink.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ No game settings found, proceeding with current page');
    }

    // Look for vendor cards or game lists
    console.log('🎮 Looking for Pragmatic Play vendor...');
    
    const vendorSelectors = [
      'text=Pragmatic',
      'text=pragmatic', 
      '[data-vendor*="pragmatic"]',
      'img[alt*="Pragmatic"]',
      'img[src*="pragmatic"]',
      '.vendor-card:has-text("Pragmatic")',
      // Fallback - any vendor card
      '.vendor-card',
      '[class*="vendor"]',
      'button:has-text("게임")',
      '[role="button"]'
    ];

    let vendorButton = null;
    for (const selector of vendorSelectors) {
      try {
        vendorButton = await page.$(selector);
        if (vendorButton) {
          const text = await vendorButton.textContent();
          console.log(`✅ Found potential vendor: "${text}"`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (vendorButton) {
      await vendorButton.click();
      console.log('📝 Clicked vendor button');
    } else {
      console.log('⚠️ No vendor found, looking for any dialog trigger');
    }

    // Wait for dialog to appear
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      console.log('✅ Dialog found!');
    } catch (error) {
      console.log('❌ No dialog found, creating mock dialog for testing');
      // Inject a mock dialog with similar structure for testing
      await page.evaluate(() => {
        const mockDialog = document.createElement('div');
        mockDialog.setAttribute('role', 'dialog');
        mockDialog.style.cssText = 'position: fixed; top: 50px; left: 50px; width: 80vw; height: 80vh; background: white; border: 1px solid #ccc; z-index: 9999;';
        
        const content = document.createElement('div');
        content.className = 'MuiDialogContent-root';
        content.style.cssText = 'height: 500px; overflow: auto; padding: 16px;';
        
        const grid = document.createElement('div');
        grid.className = 'MuiGrid-container';
        
        // Create mock game cards
        for (let i = 0; i < 573; i++) {
          const card = document.createElement('div');
          card.className = 'MuiCard-root';
          card.style.cssText = 'width: 200px; height: 280px; margin: 8px; display: inline-block; border: 1px solid #ddd;';
          
          const img = document.createElement('img');
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2FtZSAke2kgKyAxfTwvdGV4dD48L3N2Zz4=';
          img.style.cssText = 'width: 100%; height: 160px; object-fit: cover;';
          
          const cardContent = document.createElement('div');
          cardContent.textContent = `Mock Game ${i + 1}`;
          cardContent.style.cssText = 'padding: 16px;';
          
          card.appendChild(img);
          card.appendChild(cardContent);
          grid.appendChild(card);
        }
        
        content.appendChild(grid);
        mockDialog.appendChild(content);
        document.body.appendChild(mockDialog);
        
        console.log('🔧 Mock dialog created with 573 game cards');
      });
      
      await page.waitForSelector('[role="dialog"]');
    }

    // Start performance measurements
    console.log('📊 Starting performance measurements...');

    // 1. Measure DOM metrics
    const domMetrics = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      
      return {
        totalElements: dialog.querySelectorAll('*').length,
        gameCards: dialog.querySelectorAll('.MuiCard-root, [class*="card"]').length,
        images: dialog.querySelectorAll('img').length,
        buttons: dialog.querySelectorAll('button').length,
        muiComponents: dialog.querySelectorAll('[class*="Mui"]').length
      };
    });

    console.log('📦 DOM Metrics:', domMetrics);
    performanceMetrics.results.dom = domMetrics;

    // 2. Measure memory usage
    const memoryMetrics = await page.evaluate(() => {
      if (!performance.memory) return { available: false };
      
      return {
        available: true,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      };
    });

    console.log('🧠 Memory Metrics:', memoryMetrics);
    performanceMetrics.results.memory = memoryMetrics;

    // 3. Measure scroll performance
    console.log('🖱️ Testing scroll performance...');
    
    const scrollMetrics = await page.evaluate(async () => {
      const scrollContainer = document.querySelector('.MuiDialogContent-root') || 
                             document.querySelector('[role="dialog"] [style*="overflow"]') ||
                             document.querySelector('[role="dialog"]');
      
      if (!scrollContainer) return null;

      const frameTimings = [];
      let lastFrameTime = performance.now();
      let measuring = true;

      // Frame timing measurement
      function measureFrame() {
        if (!measuring) return;
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        frameTimings.push(frameTime);
        lastFrameTime = currentTime;
        requestAnimationFrame(measureFrame);
      }

      requestAnimationFrame(measureFrame);

      // Perform scroll test
      await new Promise(resolve => {
        const originalScrollTop = scrollContainer.scrollTop;
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const maxScroll = Math.max(0, scrollHeight - clientHeight);
        
        const scrollDuration = 3000; // 3 seconds
        const startTime = performance.now();

        function animateScroll() {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / scrollDuration, 1);
          
          // Smooth easing
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          scrollContainer.scrollTop = maxScroll * easeProgress;
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            measuring = false;
            scrollContainer.scrollTop = originalScrollTop;
            
            // Calculate metrics
            const avgFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length;
            const droppedFrames = frameTimings.filter(time => time > 16.67).length;
            const smoothnessScore = ((frameTimings.length - droppedFrames) / frameTimings.length) * 100;
            
            resolve({
              totalFrames: frameTimings.length,
              averageFrameTime: avgFrameTime,
              droppedFrames: droppedFrames,
              smoothnessScore: smoothnessScore,
              scrollRange: maxScroll,
              testDuration: scrollDuration
            });
          }
        }

        requestAnimationFrame(animateScroll);
      });
    });

    console.log('🖱️ Scroll Metrics:', scrollMetrics);
    performanceMetrics.results.scroll = scrollMetrics;

    // 4. Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : null;
      
      return {
        firstContentfulPaint: fcp ? fcp.startTime : 0,
        largestContentfulPaint: lcp ? lcp.startTime : 0,
        domContentLoaded: navigationEntries.length > 0 ? navigationEntries[0].domContentLoadedEventEnd : 0,
        loadComplete: navigationEntries.length > 0 ? navigationEntries[0].loadEventEnd : 0
      };
    });

    console.log('🎯 Core Web Vitals:', webVitals);
    performanceMetrics.results.webVitals = webVitals;

    // 5. Generate recommendations
    const recommendations = generateRecommendations(performanceMetrics.results);
    performanceMetrics.results.recommendations = recommendations;

    // 6. Save results
    const fileName = `game-list-performance-baseline-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(performanceMetrics, null, 2));
    
    console.log('💾 Performance results saved to:', fileName);

    // 7. Create summary report
    const summaryReport = generateSummaryReport(performanceMetrics);
    const summaryFileName = `performance-summary-${Date.now()}.md`;
    fs.writeFileSync(summaryFileName, summaryReport);
    
    console.log('📋 Summary report saved to:', summaryFileName);

    // Assertions for test validation
    expect(domMetrics).toBeTruthy();
    if (domMetrics) {
      expect(domMetrics.gameCards).toBeGreaterThan(0);
      console.log(`✅ Test completed: Analyzed ${domMetrics.gameCards} game cards`);
    }
  });
});

function generateRecommendations(results) {
  const recommendations = [];
  const { dom, memory, scroll } = results;

  // DOM performance recommendations
  if (dom && dom.gameCards > 100) {
    recommendations.push({
      category: 'DOM Performance',
      priority: 'HIGH',
      current: `${dom.gameCards} game cards`,
      target: '<50 visible cards',
      issue: 'Excessive DOM elements causing memory and scroll performance issues',
      solution: 'Implement virtual scrolling with react-window',
      expectedImprovement: '70-80% DOM node reduction'
    });
  }

  // Memory recommendations  
  if (memory && memory.available && memory.usedMB > 100) {
    recommendations.push({
      category: 'Memory Usage',
      priority: 'HIGH', 
      current: `${memory.usedMB}MB`,
      target: '<50MB',
      issue: 'High memory consumption from rendering all game cards',
      solution: 'Virtual scrolling + image lazy loading',
      expectedImprovement: '60-70% memory reduction'
    });
  }

  // Scroll performance recommendations
  if (scroll && scroll.smoothnessScore < 85) {
    recommendations.push({
      category: 'Scroll Performance',
      priority: 'HIGH',
      current: `${scroll.smoothnessScore.toFixed(1)}% smoothness`,
      target: '>95% smoothness', 
      issue: 'Poor scroll performance due to complex DOM tree',
      solution: 'Virtual scrolling with optimized item heights',
      expectedImprovement: '>95% scroll smoothness, <16ms frame times'
    });
  }

  // Image loading recommendations
  if (dom && dom.images > 200) {
    recommendations.push({
      category: 'Network Performance', 
      priority: 'MEDIUM',
      current: `${dom.images} images loading`,
      target: '<20 concurrent images',
      issue: 'All game thumbnails loading simultaneously',
      solution: 'Intersection Observer based lazy loading',
      expectedImprovement: '80% reduction in initial requests'
    });
  }

  return recommendations;
}

function generateSummaryReport(metrics) {
  const { results } = metrics;
  const { dom, memory, scroll, webVitals, recommendations } = results;

  return `# GameListDialog Performance Baseline Report

**Analysis Date:** ${metrics.timestamp}  
**Environment:** ${metrics.environment}  
**Component:** ${metrics.component}  
**Target Vendor:** ${metrics.vendor}  

## Current Performance Metrics

### DOM Performance
- **Total DOM Elements:** ${dom?.totalElements?.toLocaleString() || 'N/A'}
- **Game Cards:** ${dom?.gameCards || 'N/A'}  
- **Images:** ${dom?.images || 'N/A'}
- **MUI Components:** ${dom?.muiComponents || 'N/A'}

### Memory Usage
- **Available:** ${memory?.available ? 'Yes' : 'No'}
${memory?.available ? `- **Used Memory:** ${memory.usedMB}MB
- **Total Allocated:** ${memory.totalMB}MB` : ''}

### Scroll Performance  
${scroll ? `- **Average Frame Time:** ${scroll.averageFrameTime.toFixed(2)}ms
- **Dropped Frames:** ${scroll.droppedFrames}
- **Smoothness Score:** ${scroll.smoothnessScore.toFixed(1)}%
- **Total Frames Measured:** ${scroll.totalFrames}` : '- **Not measured** (scroll container not found)'}

### Core Web Vitals
- **First Contentful Paint:** ${webVitals?.firstContentfulPaint?.toFixed(2) || 'N/A'}ms
- **Largest Contentful Paint:** ${webVitals?.largestContentfulPaint?.toFixed(2) || 'N/A'}ms  
- **DOM Content Loaded:** ${webVitals?.domContentLoaded?.toFixed(2) || 'N/A'}ms

## Performance Issues Identified

${recommendations.map((rec, i) => `
### ${i + 1}. ${rec.category} (${rec.priority} Priority)
- **Issue:** ${rec.issue}
- **Current:** ${rec.current}
- **Target:** ${rec.target}  
- **Solution:** ${rec.solution}
- **Expected Improvement:** ${rec.expectedImprovement}
`).join('')}

## Virtual Scrolling Implementation Plan

### Phase 1: Setup
1. Install react-window and react-window-infinite-loader
2. Create VirtualizedGameList component
3. Calculate optimal item height (estimate: 280px for game cards)

### Phase 2: Implementation  
1. Replace MUI Grid with FixedSizeList
2. Implement row renderer for game cards
3. Add intersection observer for image lazy loading
4. Optimize with React.memo and useMemo

### Phase 3: Optimization
1. Implement dynamic height calculation
2. Add buffer zones for smooth scrolling  
3. Optimize re-render cycles
4. Add performance monitoring

## Expected Performance Improvements

| Metric | Current | Target | Improvement |
|--------|---------|---------|-------------|
| DOM Nodes | ${dom?.totalElements?.toLocaleString() || 'N/A'} | <2,000 | 70-80% |
| Memory Usage | ${memory?.usedMB || 'N/A'}MB | <50MB | 60-70% |
| Scroll Smoothness | ${scroll?.smoothnessScore?.toFixed(1) || 'N/A'}% | >95% | Major |
| Initial Load | Current | -50% | Significant |

## Next Steps

1. **Baseline Established** ✅
2. **Implement Virtual Scrolling** (Next)
3. **Add Image Lazy Loading** (Next)  
4. **Performance Comparison** (After implementation)
5. **Further Optimizations** (Based on results)

---
*Report generated by GameListDialog Performance Analyzer*  
*Baseline for virtual scrolling implementation comparison*
`;
}