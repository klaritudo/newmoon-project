/**
 * Manual Performance Test for GameListDialog
 * 
 * This script can be run in the browser console to analyze
 * the current performance of the GameListDialog component.
 * 
 * INSTRUCTIONS:
 * 1. Open http://125.187.89.85:5173 in Chrome
 * 2. Open DevTools (F12)
 * 3. Navigate to GameListDialog with Pragmatic Play games
 * 4. Copy and paste this entire script into the Console tab
 * 5. Press Enter to run the analysis
 */

class ManualGameListAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      component: 'GameListDialog',
      vendor: 'Pragmatic Play',
      metrics: {},
      recommendations: []
    };
  }

  async measureCurrentState() {
    console.log('🚀 Starting GameListDialog Performance Analysis...');
    
    // Check if we're in the right place
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) {
      console.error('❌ GameListDialog not found! Please open the dialog first.');
      return;
    }
    
    console.log('✅ GameListDialog found, starting measurements...');
    
    // Measure DOM elements
    this.measureDOMMetrics();
    
    // Measure memory
    this.measureMemoryUsage();
    
    // Measure rendering performance
    await this.measureRenderingPerformance();
    
    // Measure scroll performance
    await this.measureScrollPerformance();
    
    // Measure image loading
    this.measureImageMetrics();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Display results
    this.displayResults();
    
    console.log('✅ Analysis completed! Check the detailed results above.');
  }

  measureDOMMetrics() {
    console.log('📊 Measuring DOM metrics...');
    
    const dialog = document.querySelector('[role="dialog"]');
    
    const metrics = {
      totalElements: dialog.querySelectorAll('*').length,
      gameCards: dialog.querySelectorAll('.MuiCard-root').length,
      images: dialog.querySelectorAll('img').length,
      buttons: dialog.querySelectorAll('button').length,
      textFields: dialog.querySelectorAll('input, textarea').length,
      muiComponents: dialog.querySelectorAll('[class*="Mui"]').length
    };
    
    this.results.metrics.dom = metrics;
    
    console.log('📦 DOM Elements:', metrics);
    
    if (metrics.gameCards > 100) {
      console.warn(`⚠️ High DOM load: ${metrics.gameCards} game cards may cause performance issues`);
    }
  }

  measureMemoryUsage() {
    console.log('🧠 Measuring memory usage...');
    
    if (performance.memory) {
      const memory = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      };
      
      this.results.metrics.memory = memory;
      
      console.log(`🧠 Memory Usage: ${memory.usedMB}MB used, ${memory.totalMB}MB allocated`);
      
      if (memory.usedMB > 100) {
        console.warn(`⚠️ High memory usage: ${memory.usedMB}MB may cause performance issues`);
      }
    } else {
      console.log('🧠 Memory API not available in this browser');
      this.results.metrics.memory = { available: false };
    }
  }

  async measureRenderingPerformance() {
    console.log('🎨 Measuring rendering performance...');
    
    const startTime = performance.now();
    
    // Force a layout/paint cycle
    const dialog = document.querySelector('[role="dialog"]');
    const height = dialog.offsetHeight;
    const width = dialog.offsetWidth;
    
    const layoutTime = performance.now() - startTime;
    
    // Measure paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    const navigationEntries = performance.getEntriesByType('navigation');
    
    const renderingMetrics = {
      layoutTime: layoutTime,
      dialogDimensions: { width, height },
      paintEntries: paintEntries.map(entry => ({
        name: entry.name,
        startTime: entry.startTime
      })),
      navigationTime: navigationEntries.length > 0 ? navigationEntries[0].loadEventEnd : 0
    };
    
    this.results.metrics.rendering = renderingMetrics;
    
    console.log('🎨 Rendering Metrics:', renderingMetrics);
    
    if (layoutTime > 100) {
      console.warn(`⚠️ Slow layout: ${layoutTime.toFixed(2)}ms layout time may cause janky interactions`);
    }
  }

  async measureScrollPerformance() {
    console.log('🖱️ Measuring scroll performance...');
    
    const scrollContainer = document.querySelector('.MuiDialogContent-root');
    if (!scrollContainer) {
      console.log('⚠️ Scroll container not found');
      return;
    }
    
    const frameTimings = [];
    let lastFrameTime = performance.now();
    let measuring = true;
    
    // Measure frame timings during scroll
    function measureFrame() {
      if (!measuring) return;
      
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      frameTimings.push(frameTime);
      lastFrameTime = currentTime;
      
      requestAnimationFrame(measureFrame);
    }
    
    requestAnimationFrame(measureFrame);
    
    // Perform a scroll test
    return new Promise((resolve) => {
      const originalScrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      let currentScroll = 0;
      const scrollStep = 10;
      const scrollDuration = 2000; // 2 seconds
      const startTime = performance.now();
      
      function animateScroll() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        
        currentScroll = maxScroll * progress;
        scrollContainer.scrollTop = currentScroll;
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          measuring = false;
          
          // Restore original scroll position
          scrollContainer.scrollTop = originalScrollTop;
          
          // Calculate metrics
          const avgFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length;
          const droppedFrames = frameTimings.filter(time => time > 16.67).length; // 60fps threshold
          const smoothnessScore = ((frameTimings.length - droppedFrames) / frameTimings.length) * 100;
          
          const scrollMetrics = {
            totalFrames: frameTimings.length,
            averageFrameTime: avgFrameTime,
            droppedFrames: droppedFrames,
            smoothnessScore: smoothnessScore,
            scrollRange: maxScroll,
            testDuration: scrollDuration
          };
          
          this.results.metrics.scroll = scrollMetrics;
          
          console.log('🖱️ Scroll Performance:', scrollMetrics);
          
          if (smoothnessScore < 80) {
            console.warn(`⚠️ Poor scroll performance: ${smoothnessScore.toFixed(1)}% smoothness`);
          }
          
          resolve();
        }
      }
      
      requestAnimationFrame(animateScroll);
    });
  }

  measureImageMetrics() {
    console.log('🖼️ Measuring image metrics...');
    
    const dialog = document.querySelector('[role="dialog"]');
    const images = dialog.querySelectorAll('img');
    
    const imageMetrics = {
      totalImages: images.length,
      loadedImages: 0,
      failedImages: 0,
      placeholderImages: 0,
      estimatedSize: 0
    };
    
    images.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        imageMetrics.loadedImages++;
      } else if (img.complete && img.naturalWidth === 0) {
        imageMetrics.failedImages++;
      }
      
      if (img.src.includes('placeholder')) {
        imageMetrics.placeholderImages++;
      }
      
      // Estimate image size (rough approximation)
      if (img.naturalWidth && img.naturalHeight) {
        imageMetrics.estimatedSize += img.naturalWidth * img.naturalHeight * 3; // RGB assumption
      }
    });
    
    imageMetrics.estimatedSizeMB = Math.round(imageMetrics.estimatedSize / 1024 / 1024);
    imageMetrics.loadSuccessRate = (imageMetrics.loadedImages / imageMetrics.totalImages) * 100;
    
    this.results.metrics.images = imageMetrics;
    
    console.log('🖼️ Image Metrics:', imageMetrics);
    
    if (imageMetrics.totalImages > 200) {
      console.warn(`⚠️ High image count: ${imageMetrics.totalImages} images may cause memory issues`);
    }
    
    if (imageMetrics.loadSuccessRate < 90) {
      console.warn(`⚠️ Poor image loading: ${imageMetrics.loadSuccessRate.toFixed(1)}% success rate`);
    }
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const { dom, memory, scroll, images } = this.results.metrics;
    const recommendations = [];
    
    // DOM optimization
    if (dom.gameCards > 100) {
      recommendations.push({
        category: 'DOM Performance',
        priority: 'HIGH',
        issue: `${dom.gameCards} game cards create excessive DOM nodes`,
        solution: 'Implement virtual scrolling to render only visible cards (target: <50 DOM nodes)',
        expectedImprovement: '70-80% DOM node reduction, faster scrolling'
      });
    }
    
    // Memory optimization
    if (memory.available && memory.usedMB > 100) {
      recommendations.push({
        category: 'Memory Usage',
        priority: 'HIGH',
        issue: `${memory.usedMB}MB memory usage is excessive`,
        solution: 'Virtual scrolling + image lazy loading',
        expectedImprovement: '60-70% memory reduction'
      });
    }
    
    // Scroll performance
    if (scroll && scroll.smoothnessScore < 80) {
      recommendations.push({
        category: 'Scroll Performance',
        priority: 'HIGH',
        issue: `${scroll.smoothnessScore.toFixed(1)}% scroll smoothness is below target`,
        solution: 'Virtual scrolling with optimized item height calculation',
        expectedImprovement: '>95% scroll smoothness'
      });
    }
    
    // Image optimization
    if (images.totalImages > 200) {
      recommendations.push({
        category: 'Network Performance',
        priority: 'MEDIUM',
        issue: `${images.totalImages} images loading simultaneously`,
        solution: 'Implement image lazy loading with intersection observer',
        expectedImprovement: '80% reduction in initial network requests'
      });
    }
    
    this.results.recommendations = recommendations;
  }

  displayResults() {
    console.log('\n📊 PERFORMANCE ANALYSIS RESULTS');
    console.log('================================\n');
    
    const { dom, memory, rendering, scroll, images } = this.results.metrics;
    
    console.log('🏗️ DOM METRICS:');
    console.log(`   Game Cards: ${dom.gameCards}`);
    console.log(`   Total Elements: ${dom.totalElements.toLocaleString()}`);
    console.log(`   Images: ${dom.images}`);
    console.log(`   MUI Components: ${dom.muiComponents}`);
    console.log('');
    
    if (memory.available) {
      console.log('🧠 MEMORY METRICS:');
      console.log(`   Used Memory: ${memory.usedMB}MB`);
      console.log(`   Allocated Memory: ${memory.totalMB}MB`);
      console.log('');
    }
    
    if (rendering) {
      console.log('🎨 RENDERING METRICS:');
      console.log(`   Layout Time: ${rendering.layoutTime.toFixed(2)}ms`);
      console.log(`   Dialog Size: ${rendering.dialogDimensions.width}x${rendering.dialogDimensions.height}px`);
      console.log('');
    }
    
    if (scroll) {
      console.log('🖱️ SCROLL METRICS:');
      console.log(`   Average Frame Time: ${scroll.averageFrameTime.toFixed(2)}ms`);
      console.log(`   Dropped Frames: ${scroll.droppedFrames}`);
      console.log(`   Smoothness Score: ${scroll.smoothnessScore.toFixed(1)}%`);
      console.log('');
    }
    
    if (images) {
      console.log('🖼️ IMAGE METRICS:');
      console.log(`   Total Images: ${images.totalImages}`);
      console.log(`   Loaded Successfully: ${images.loadedImages}`);
      console.log(`   Load Success Rate: ${images.loadSuccessRate.toFixed(1)}%`);
      console.log(`   Estimated Size: ${images.estimatedSizeMB}MB`);
      console.log('');
    }
    
    console.log('💡 RECOMMENDATIONS:');
    console.log('===================\n');
    
    this.results.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.category} (${rec.priority} Priority)`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
      console.log(`   Expected: ${rec.expectedImprovement}`);
      console.log('');
    });
    
    console.log('🎯 VIRTUAL SCROLLING IMPLEMENTATION PLAN:');
    console.log('==========================================\n');
    console.log('1. Install react-window and react-window-infinite-loader');
    console.log('2. Replace Grid container with FixedSizeList');
    console.log('3. Implement card height calculation (estimate: 280px)');
    console.log('4. Add image lazy loading with intersection observer');
    console.log('5. Optimize re-renders with React.memo and useMemo');
    console.log('6. Test with this same analysis script to measure improvements');
    console.log('');
    console.log('Expected Performance Gains:');
    console.log('- DOM nodes: 70-80% reduction');
    console.log('- Memory usage: 60-70% reduction');
    console.log('- Scroll performance: >95% smoothness');
    console.log('- Initial load time: 50-60% improvement');
    console.log('');
    
    // Store results in window for export
    window.gameListPerformanceResults = this.results;
    console.log('💾 Results stored in window.gameListPerformanceResults');
    console.log('   Use JSON.stringify(window.gameListPerformanceResults, null, 2) to export');
  }

  // Quick run method
  async run() {
    await this.measureCurrentState();
  }
}

// Create global instance
window.gameListAnalyzer = new ManualGameListAnalyzer();

// Auto-run the analysis
console.log('🚀 GameListDialog Performance Analyzer loaded!');
console.log('📋 To run analysis: await gameListAnalyzer.run()');
console.log('💡 Make sure GameListDialog is open with Pragmatic Play games first!');

// If dialog is already open, offer to run immediately
if (document.querySelector('[role="dialog"]')) {
  console.log('✅ Dialog detected! Running analysis in 2 seconds...');
  setTimeout(() => {
    gameListAnalyzer.run();
  }, 2000);
} else {
  console.log('⏳ Please open the GameListDialog first, then run: await gameListAnalyzer.run()');
}