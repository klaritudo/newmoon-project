const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * GameListDialog Performance Analysis Script
 * 
 * This script analyzes the current performance metrics of the GameListDialog
 * component to establish baseline measurements for virtual scrolling comparison.
 */

class GameListPerformanceAnalyzer {
  constructor() {
    this.baseUrl = 'http://125.187.89.85:5173';
    this.results = {
      timestamp: new Date().toISOString(),
      environment: 'Development',
      component: 'GameListDialog',
      vendor: 'Pragmatic Play',
      gameCount: 573,
      metrics: {},
      recommendations: []
    };
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false
    });

    // Enable performance timeline
    this.page = await this.context.newPage();
    await this.page.addInitScript(() => {
      window.performanceObserver = new PerformanceObserver((list) => {
        window.performanceEntries = window.performanceEntries || [];
        window.performanceEntries.push(...list.getEntries());
      });
      window.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    });
  }

  async navigateToGameSettings() {
    console.log('🚀 Navigating to application...');
    
    // Navigate to the application
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
    
    // Wait for page load and measure initial metrics
    await this.page.waitForSelector('body');
    const navigationMetrics = await this.measureNavigationMetrics();
    this.results.metrics.navigation = navigationMetrics;
    
    console.log('📊 Initial page load metrics captured');
  }

  async openGameListDialog() {
    console.log('🎮 Opening GameListDialog...');
    
    try {
      // Look for game settings or similar navigation
      const gameSettingsSelectors = [
        'a[href*="game"]',
        'button:has-text("게임")',
        'button:has-text("Game")',
        '[data-testid="game-settings"]',
        '.game-settings',
        'nav a:has-text("게임")'
      ];
      
      let gameSettingsFound = false;
      for (const selector of gameSettingsSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          gameSettingsFound = true;
          console.log(`✅ Found and clicked game settings: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!gameSettingsFound) {
        console.log('⚠️ Game settings navigation not found, checking current page content...');
        await this.analyzeCurrentPageContent();
      }
      
      // Look for Pragmatic Play vendor or similar
      await this.page.waitForTimeout(2000);
      
      const vendorSelectors = [
        'button:has-text("Pragmatic")',
        'div:has-text("Pragmatic")',
        '[data-vendor="pragmatic"]',
        '.vendor-card:has-text("Pragmatic")',
        'img[alt*="Pragmatic"]'
      ];
      
      let vendorFound = false;
      for (const selector of vendorSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          vendorFound = true;
          console.log(`✅ Found and clicked Pragmatic vendor: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!vendorFound) {
        console.log('⚠️ Pragmatic vendor not found, looking for any game list...');
        await this.findAndOpenAnyGameList();
      }
      
      // Wait for dialog to open
      await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      console.log('✅ GameListDialog opened successfully');
      
    } catch (error) {
      console.error('❌ Error opening GameListDialog:', error.message);
      throw error;
    }
  }

  async analyzeCurrentPageContent() {
    const content = await this.page.content();
    const textContent = await this.page.textContent('body');
    
    console.log('📄 Current page analysis:');
    console.log('- URL:', this.page.url());
    console.log('- Title:', await this.page.title());
    console.log('- Has React:', content.includes('react'));
    console.log('- Has MUI:', content.includes('MuiBox') || content.includes('mui'));
    console.log('- Text content length:', textContent.length);
    
    // Look for common admin dashboard elements
    const adminElements = await this.page.$$eval('*', elements => 
      elements.some(el => 
        el.textContent?.includes('게임') || 
        el.textContent?.includes('Game') || 
        el.textContent?.includes('Dashboard') ||
        el.textContent?.includes('Admin')
      )
    );
    
    console.log('- Has admin/game elements:', adminElements);
  }

  async findAndOpenAnyGameList() {
    // Try to find any element that might open a game list
    const gameListSelectors = [
      'button:has-text("목록")',
      'button:has-text("List")',
      '[data-testid*="game"]',
      '.game-list-button',
      'button[aria-label*="game"]'
    ];
    
    for (const selector of gameListSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          await element.click();
          console.log(`✅ Clicked potential game list opener: ${selector}`);
          await this.page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  async measureDialogPerformance() {
    console.log('📊 Measuring GameListDialog performance...');
    
    const startTime = performance.now();
    
    // Wait for dialog content to load
    await this.page.waitForSelector('.MuiGrid-container', { timeout: 15000 });
    
    const loadTime = performance.now() - startTime;
    
    // Measure various performance metrics
    const metrics = await this.page.evaluate(() => {
      const now = performance.now();
      
      // Count DOM elements
      const totalElements = document.querySelectorAll('*').length;
      const gameCards = document.querySelectorAll('[role="dialog"] .MuiCard-root').length;
      const images = document.querySelectorAll('[role="dialog"] img').length;
      
      // Memory usage (approximate)
      const memInfo = performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null;
      
      // Performance entries
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      
      return {
        loadTime: now,
        domElements: {
          total: totalElements,
          gameCards,
          images
        },
        memory: memInfo,
        paintMetrics: paintEntries,
        navigationMetrics: navigationEntries,
        lcpMetrics: lcpEntries
      };
    });
    
    this.results.metrics.dialogLoad = {
      loadTime: loadTime,
      ...metrics
    };
    
    console.log(`✅ Dialog loaded in ${loadTime.toFixed(2)}ms`);
    console.log(`📦 Found ${metrics.domElements.gameCards} game cards`);
  }

  async measureScrollPerformance() {
    console.log('🖱️ Measuring scroll performance...');
    
    const scrollMetrics = {
      tests: [],
      averageFrameTime: 0,
      droppedFrames: 0,
      smoothnessScore: 0
    };
    
    // Find the scrollable container
    const scrollContainer = await this.page.$('.MuiDialogContent-root > div[style*="overflow"]');
    if (!scrollContainer) {
      console.log('⚠️ Scroll container not found, using dialog content');
    }
    
    // Perform multiple scroll tests
    for (let i = 0; i < 5; i++) {
      console.log(`📊 Scroll test ${i + 1}/5`);
      
      const testResult = await this.performScrollTest(scrollContainer || '.MuiDialogContent-root');
      scrollMetrics.tests.push(testResult);
      
      // Wait between tests
      await this.page.waitForTimeout(1000);
    }
    
    // Calculate averages
    scrollMetrics.averageFrameTime = scrollMetrics.tests.reduce((sum, test) => sum + test.averageFrameTime, 0) / scrollMetrics.tests.length;
    scrollMetrics.droppedFrames = scrollMetrics.tests.reduce((sum, test) => sum + test.droppedFrames, 0);
    scrollMetrics.smoothnessScore = scrollMetrics.tests.reduce((sum, test) => sum + test.smoothnessScore, 0) / scrollMetrics.tests.length;
    
    this.results.metrics.scrollPerformance = scrollMetrics;
    
    console.log(`📊 Average frame time: ${scrollMetrics.averageFrameTime.toFixed(2)}ms`);
    console.log(`📉 Total dropped frames: ${scrollMetrics.droppedFrames}`);
    console.log(`🎯 Smoothness score: ${scrollMetrics.smoothnessScore.toFixed(2)}%`);
  }

  async performScrollTest(scrollSelector) {
    const startTime = performance.now();
    
    // Start performance monitoring
    await this.page.evaluate(() => {
      window.frameTimings = [];
      window.lastFrameTime = performance.now();
      
      function measureFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - window.lastFrameTime;
        window.frameTimings.push(frameTime);
        window.lastFrameTime = currentTime;
        requestAnimationFrame(measureFrame);
      }
      requestAnimationFrame(measureFrame);
    });
    
    // Perform smooth scroll to bottom
    await this.page.$eval(scrollSelector, (element) => {
      return new Promise((resolve) => {
        const startScroll = element.scrollTop;
        const targetScroll = element.scrollHeight - element.clientHeight;
        const duration = 2000; // 2 seconds scroll
        const startTime = performance.now();
        
        function animateScroll(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing function
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          element.scrollTop = startScroll + (targetScroll - startScroll) * easeOutCubic;
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(animateScroll);
      });
    });
    
    // Get performance data
    const performanceData = await this.page.evaluate(() => {
      const frameTimings = window.frameTimings;
      const averageFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length;
      const droppedFrames = frameTimings.filter(time => time > 16.67).length; // 60fps = 16.67ms
      const smoothnessScore = ((frameTimings.length - droppedFrames) / frameTimings.length) * 100;
      
      return {
        totalFrames: frameTimings.length,
        averageFrameTime,
        droppedFrames,
        smoothnessScore,
        frameTimings: frameTimings.slice(0, 100) // Sample of frame timings
      };
    });
    
    const testDuration = performance.now() - startTime;
    
    return {
      ...performanceData,
      testDuration
    };
  }

  async measureMemoryUsage() {
    console.log('🧠 Measuring memory usage...');
    
    // Force garbage collection if available
    try {
      await this.page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
    } catch (e) {
      // GC not available
    }
    
    const memoryMetrics = await this.page.evaluate(() => {
      const memory = performance.memory;
      if (!memory) {
        return { available: false };
      }
      
      return {
        available: true,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    });
    
    this.results.metrics.memory = memoryMetrics;
    
    if (memoryMetrics.available) {
      console.log(`🧠 Memory usage: ${memoryMetrics.usedMB}MB / ${memoryMetrics.totalMB}MB`);
    }
  }

  async measureNetworkPerformance() {
    console.log('🌐 Measuring network performance...');
    
    const networkEntries = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries
        .filter(entry => entry.name.includes('image') || entry.name.includes('.jpg') || entry.name.includes('.png'))
        .map(entry => ({
          name: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize,
          decodedBodySize: entry.decodedBodySize,
          startTime: entry.startTime,
          responseEnd: entry.responseEnd
        }));
    });
    
    const imageMetrics = {
      totalImages: networkEntries.length,
      totalTransferSize: networkEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      averageLoadTime: networkEntries.reduce((sum, entry) => sum + entry.duration, 0) / networkEntries.length,
      slowestImage: networkEntries.reduce((slowest, entry) => 
        entry.duration > (slowest?.duration || 0) ? entry : slowest, null
      )
    };
    
    this.results.metrics.network = {
      images: imageMetrics,
      entries: networkEntries.slice(0, 20) // Sample of entries
    };
    
    console.log(`🖼️ Loaded ${imageMetrics.totalImages} images`);
    console.log(`📦 Total transfer size: ${Math.round(imageMetrics.totalTransferSize / 1024)}KB`);
    console.log(`⏱️ Average image load time: ${imageMetrics.averageLoadTime.toFixed(2)}ms`);
  }

  async measureNavigationMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
      
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
        loadComplete: navigation?.loadEventEnd || 0,
        firstContentfulPaint: fcp?.startTime || 0,
        largestContentfulPaint: lcp?.startTime || 0,
        timeToInteractive: navigation?.loadEventEnd || 0 // Simplified TTI
      };
    });
  }

  async measureCoreWebVitals() {
    console.log('📊 Measuring Core Web Vitals...');
    
    const webVitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          fcp: 0,
          lcp: 0,
          cls: 0,
          fid: 0
        };
        
        // Get paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) vitals.fcp = fcpEntry.startTime;
        
        // Get LCP
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }
        
        // Simple CLS measurement
        let cumulativeShift = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              cumulativeShift += entry.value;
            }
          }
          vitals.cls = cumulativeShift;
        });
        
        try {
          observer.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          // Layout shift not supported
        }
        
        setTimeout(() => {
          observer.disconnect();
          resolve(vitals);
        }, 1000);
      });
    });
    
    this.results.metrics.coreWebVitals = webVitals;
    
    console.log(`🎯 FCP: ${webVitals.fcp.toFixed(2)}ms`);
    console.log(`🎯 LCP: ${webVitals.lcp.toFixed(2)}ms`);
    console.log(`🎯 CLS: ${webVitals.cls.toFixed(3)}`);
  }

  async generateRecommendations() {
    console.log('💡 Generating performance recommendations...');
    
    const metrics = this.results.metrics;
    const recommendations = [];
    
    // Dialog load time analysis
    if (metrics.dialogLoad?.loadTime > 3000) {
      recommendations.push({
        category: 'Load Performance',
        issue: 'Slow dialog load time',
        current: `${metrics.dialogLoad.loadTime.toFixed(2)}ms`,
        target: '< 2000ms',
        priority: 'HIGH',
        solution: 'Implement virtual scrolling to reduce DOM nodes'
      });
    }
    
    // DOM elements analysis
    if (metrics.dialogLoad?.domElements?.gameCards > 100) {
      recommendations.push({
        category: 'DOM Performance',
        issue: 'High number of DOM elements',
        current: `${metrics.dialogLoad.domElements.gameCards} game cards`,
        target: '< 50 visible cards',
        priority: 'HIGH',
        solution: 'Virtual scrolling with windowing'
      });
    }
    
    // Memory usage analysis
    if (metrics.memory?.usedMB > 100) {
      recommendations.push({
        category: 'Memory Usage',
        issue: 'High memory consumption',
        current: `${metrics.memory.usedMB}MB`,
        target: '< 50MB',
        priority: 'MEDIUM',
        solution: 'Virtual scrolling and image lazy loading'
      });
    }
    
    // Scroll performance analysis
    if (metrics.scrollPerformance?.smoothnessScore < 80) {
      recommendations.push({
        category: 'Scroll Performance',
        issue: 'Poor scroll smoothness',
        current: `${metrics.scrollPerformance.smoothnessScore.toFixed(1)}%`,
        target: '> 90%',
        priority: 'HIGH',
        solution: 'Virtual scrolling with optimized rendering'
      });
    }
    
    // Image loading analysis
    if (metrics.network?.images?.totalTransferSize > 5 * 1024 * 1024) {
      recommendations.push({
        category: 'Network Performance',
        issue: 'Large image payload',
        current: `${Math.round(metrics.network.images.totalTransferSize / 1024 / 1024)}MB`,
        target: '< 2MB',
        priority: 'MEDIUM',
        solution: 'Image lazy loading and optimization'
      });
    }
    
    this.results.recommendations = recommendations;
    
    recommendations.forEach(rec => {
      console.log(`⚠️ ${rec.category}: ${rec.issue} (${rec.current} → ${rec.target})`);
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async saveResults() {
    const filename = `game-list-performance-baseline-${Date.now()}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    
    console.log(`📊 Results saved to: ${filepath}`);
    
    // Also create a summary report
    const summaryFilename = `performance-summary-${Date.now()}.txt`;
    const summaryPath = path.join(__dirname, summaryFilename);
    
    const summary = this.generateSummaryReport();
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`📋 Summary report saved to: ${summaryPath}`);
  }

  generateSummaryReport() {
    const { metrics, recommendations } = this.results;
    
    return `
GameListDialog Performance Analysis Summary
==========================================

Analysis Date: ${this.results.timestamp}
Environment: ${this.results.environment}
Game Count: ${this.results.gameCount}

CURRENT PERFORMANCE METRICS
----------------------------

1. Load Performance:
   - Dialog Load Time: ${metrics.dialogLoad?.loadTime?.toFixed(2) || 'N/A'}ms
   - DOM Elements: ${metrics.dialogLoad?.domElements?.total || 'N/A'}
   - Game Cards: ${metrics.dialogLoad?.domElements?.gameCards || 'N/A'}
   - Images: ${metrics.dialogLoad?.domElements?.images || 'N/A'}

2. Memory Usage:
   - Used Memory: ${metrics.memory?.usedMB || 'N/A'}MB
   - Total Memory: ${metrics.memory?.totalMB || 'N/A'}MB

3. Scroll Performance:
   - Average Frame Time: ${metrics.scrollPerformance?.averageFrameTime?.toFixed(2) || 'N/A'}ms
   - Dropped Frames: ${metrics.scrollPerformance?.droppedFrames || 'N/A'}
   - Smoothness Score: ${metrics.scrollPerformance?.smoothnessScore?.toFixed(2) || 'N/A'}%

4. Network Performance:
   - Total Images: ${metrics.network?.images?.totalImages || 'N/A'}
   - Transfer Size: ${metrics.network?.images?.totalTransferSize ? Math.round(metrics.network.images.totalTransferSize / 1024) : 'N/A'}KB
   - Avg Load Time: ${metrics.network?.images?.averageLoadTime?.toFixed(2) || 'N/A'}ms

5. Core Web Vitals:
   - First Contentful Paint: ${metrics.coreWebVitals?.fcp?.toFixed(2) || 'N/A'}ms
   - Largest Contentful Paint: ${metrics.coreWebVitals?.lcp?.toFixed(2) || 'N/A'}ms
   - Cumulative Layout Shift: ${metrics.coreWebVitals?.cls?.toFixed(3) || 'N/A'}

PERFORMANCE RECOMMENDATIONS
---------------------------

${recommendations.map((rec, i) => `
${i + 1}. ${rec.category} (${rec.priority} Priority)
   Issue: ${rec.issue}
   Current: ${rec.current}
   Target: ${rec.target}
   Solution: ${rec.solution}
`).join('')}

BASELINE ESTABLISHED FOR VIRTUAL SCROLLING COMPARISON
====================================================

This baseline will be compared against virtual scrolling implementation
to measure performance improvements in:

- DOM node reduction
- Memory usage optimization  
- Scroll performance enhancement
- Load time improvements
- Network optimization through lazy loading

Next Steps:
1. Implement virtual scrolling with react-window
2. Add image lazy loading
3. Optimize rendering pipeline
4. Re-run this analysis to measure improvements

Analysis completed: ${new Date().toLocaleString()}
`;
  }

  async run() {
    try {
      console.log('🚀 Starting GameListDialog Performance Analysis...');
      
      await this.initialize();
      await this.navigateToGameSettings();
      await this.openGameListDialog();
      
      await this.measureDialogPerformance();
      await this.measureScrollPerformance();
      await this.measureMemoryUsage();
      await this.measureNetworkPerformance();
      await this.measureCoreWebVitals();
      
      await this.generateRecommendations();
      await this.saveResults();
      
      console.log('✅ Performance analysis completed successfully!');
      console.log('📊 Check the generated JSON and summary files for detailed results');
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the analysis
const analyzer = new GameListPerformanceAnalyzer();
analyzer.run().catch(console.error);