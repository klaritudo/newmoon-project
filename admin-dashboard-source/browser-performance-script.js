/**
 * GameListDialog Performance Measurement Script
 * 
 * INSTRUCTIONS FOR USE:
 * 1. Navigate to http://125.187.89.85:5173
 * 2. Open the GameListDialog (preferably with Pragmatic Play games)
 * 3. Open Browser DevTools (F12) > Console tab
 * 4. Copy and paste this entire script
 * 5. Results will be logged and stored in window.performanceResults
 * 
 * This script measures the CURRENT performance to establish baseline
 * metrics for comparison with virtual scrolling implementation.
 */

(function() {
  'use strict';

  class GameListPerformanceMeasurer {
    constructor() {
      this.startTime = performance.now();
      this.results = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        url: window.location.href,
        measurements: {}
      };
    }

    // Check if we're in the right context
    validateContext() {
      const dialog = document.querySelector('[role="dialog"]');
      const hasGameCards = document.querySelectorAll('[role="dialog"] .MuiCard-root').length > 0;
      
      if (!dialog) {
        console.error('❌ No dialog found! Please open the GameListDialog first.');
        return false;
      }
      
      if (!hasGameCards) {
        console.warn('⚠️ No game cards found in dialog. Results may not be representative.');
      }
      
      console.log('✅ GameListDialog detected, starting measurements...');
      return true;
    }

    // Measure DOM complexity
    measureDOMMetrics() {
      console.log('📊 Measuring DOM metrics...');
      
      const dialog = document.querySelector('[role="dialog"]');
      const dialogContent = document.querySelector('[role="dialog"] .MuiDialogContent-root');
      
      const metrics = {
        totalElements: dialog.querySelectorAll('*').length,
        gameCards: dialog.querySelectorAll('.MuiCard-root').length,
        images: dialog.querySelectorAll('img').length,
        buttons: dialog.querySelectorAll('button').length,
        inputs: dialog.querySelectorAll('input, textarea, select').length,
        muiComponents: dialog.querySelectorAll('[class*="Mui"]').length,
        eventTargets: dialog.querySelectorAll('[onclick], [onchange], [onmouseover]').length,
        dialogDimensions: {
          width: dialog.offsetWidth,
          height: dialog.offsetHeight,
          contentHeight: dialogContent ? dialogContent.scrollHeight : 0
        }
      };

      console.log(`📦 DOM Elements: ${metrics.totalElements.toLocaleString()}`);
      console.log(`🎮 Game Cards: ${metrics.gameCards}`);
      console.log(`🖼️ Images: ${metrics.images}`);
      console.log(`🔘 Interactive Elements: ${metrics.buttons + metrics.inputs}`);

      this.results.measurements.dom = metrics;
      return metrics;
    }

    // Measure current memory usage
    measureMemory() {
      console.log('🧠 Measuring memory usage...');
      
      let memoryMetrics = { available: false };
      
      if (performance.memory) {
        memoryMetrics = {
          available: true,
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        console.log(`🧠 Memory: ${memoryMetrics.usedMB}MB used / ${memoryMetrics.totalMB}MB total`);
        
        if (memoryMetrics.usedMB > 100) {
          console.warn(`⚠️ High memory usage detected: ${memoryMetrics.usedMB}MB`);
        }
      } else {
        console.log('🧠 Memory API not available');
      }

      this.results.measurements.memory = memoryMetrics;
      return memoryMetrics;
    }

    // Measure rendering performance
    async measureRenderingPerformance() {
      console.log('🎨 Measuring rendering performance...');
      
      const dialog = document.querySelector('[role="dialog"]');
      const startTime = performance.now();
      
      // Force a layout recalculation
      const computedStyle = window.getComputedStyle(dialog);
      const height = dialog.offsetHeight;
      const width = dialog.offsetWidth;
      
      const layoutTime = performance.now() - startTime;
      
      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      const resourceEntries = performance.getEntriesByType('resource');
      
      const renderingMetrics = {
        layoutRecalcTime: layoutTime,
        dialogDimensions: { width, height },
        paintEntries: paintEntries.map(entry => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration
        })),
        navigationTiming: navigationEntries.length > 0 ? {
          domContentLoaded: navigationEntries[0].domContentLoadedEventEnd,
          loadComplete: navigationEntries[0].loadEventEnd,
          domInteractive: navigationEntries[0].domInteractive
        } : null,
        resourceCount: resourceEntries.length
      };

      console.log(`🎨 Layout recalc: ${layoutTime.toFixed(2)}ms`);
      console.log(`📏 Dialog size: ${width}x${height}px`);

      this.results.measurements.rendering = renderingMetrics;
      return renderingMetrics;
    }

    // Measure scroll performance with actual scroll test
    async measureScrollPerformance() {
      console.log('🖱️ Measuring scroll performance...');
      
      const scrollContainer = document.querySelector('.MuiDialogContent-root') ||
                             document.querySelector('[role="dialog"] [style*="overflow"]') ||
                             document.querySelector('[role="dialog"]');
      
      if (!scrollContainer) {
        console.warn('⚠️ No scrollable container found');
        return null;
      }

      const originalScrollTop = scrollContainer.scrollTop;
      const maxScroll = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      
      if (maxScroll === 0) {
        console.log('📏 Content fits in view, no scrolling needed');
        return { contentFitsInView: true };
      }

      return new Promise((resolve) => {
        const frameTimings = [];
        let lastFrameTime = performance.now();
        let animationId;
        const testDuration = 2000; // 2 seconds
        const startTime = performance.now();

        // Frame timing measurement
        function measureFrame() {
          const currentTime = performance.now();
          const frameTime = currentTime - lastFrameTime;
          frameTimings.push(frameTime);
          lastFrameTime = currentTime;
          
          if (performance.now() - startTime < testDuration + 500) {
            animationId = requestAnimationFrame(measureFrame);
          }
        }

        animationId = requestAnimationFrame(measureFrame);

        // Smooth scroll animation
        function smoothScroll() {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / testDuration, 1);
          
          // Smooth easing function
          const easeProgress = progress < 0.5 
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
          
          scrollContainer.scrollTop = maxScroll * easeProgress;
          
          if (progress < 1) {
            requestAnimationFrame(smoothScroll);
          } else {
            // Test complete, restore position
            setTimeout(() => {
              scrollContainer.scrollTop = originalScrollTop;
              cancelAnimationFrame(animationId);
              
              // Calculate metrics
              const avgFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length;
              const droppedFrames = frameTimings.filter(time => time > 16.67).length; // 60fps threshold
              const smoothnessScore = ((frameTimings.length - droppedFrames) / frameTimings.length) * 100;
              const maxFrameTime = Math.max(...frameTimings);
              const minFrameTime = Math.min(...frameTimings);
              
              const scrollMetrics = {
                totalFrames: frameTimings.length,
                averageFrameTime: avgFrameTime,
                maxFrameTime: maxFrameTime,
                minFrameTime: minFrameTime,
                droppedFrames: droppedFrames,
                smoothnessScore: smoothnessScore,
                scrollRange: maxScroll,
                testDuration: testDuration,
                frameTimeSamples: frameTimings.slice(0, 50) // First 50 frames
              };
              
              console.log(`🖱️ Scroll test: ${scrollMetrics.smoothnessScore.toFixed(1)}% smooth`);
              console.log(`⏱️ Avg frame: ${avgFrameTime.toFixed(2)}ms`);
              console.log(`📉 Dropped: ${droppedFrames} frames`);
              
              if (smoothnessScore < 80) {
                console.warn(`⚠️ Poor scroll performance: ${smoothnessScore.toFixed(1)}%`);
              }
              
              resolve(scrollMetrics);
            }, 100);
          }
        }

        requestAnimationFrame(smoothScroll);
      });
    }

    // Measure image loading performance
    measureImageMetrics() {
      console.log('🖼️ Analyzing image loading...');
      
      const dialog = document.querySelector('[role="dialog"]');
      const images = dialog.querySelectorAll('img');
      
      let totalEstimatedSize = 0;
      let loadedCount = 0;
      let errorCount = 0;
      let pendingCount = 0;

      images.forEach(img => {
        if (img.complete) {
          if (img.naturalWidth > 0) {
            loadedCount++;
            // Rough size estimation
            totalEstimatedSize += img.naturalWidth * img.naturalHeight * 3; // RGB
          } else {
            errorCount++;
          }
        } else {
          pendingCount++;
        }
      });

      const imageMetrics = {
        totalImages: images.length,
        loadedImages: loadedCount,
        errorImages: errorCount,
        pendingImages: pendingCount,
        loadSuccessRate: images.length > 0 ? (loadedCount / images.length) * 100 : 0,
        estimatedTotalSizeBytes: totalEstimatedSize,
        estimatedSizeMB: Math.round(totalEstimatedSize / 1024 / 1024)
      };

      console.log(`🖼️ Images: ${loadedCount}/${images.length} loaded (${imageMetrics.loadSuccessRate.toFixed(1)}%)`);
      console.log(`📦 Estimated size: ${imageMetrics.estimatedSizeMB}MB`);

      if (images.length > 200) {
        console.warn(`⚠️ High image count: ${images.length} images`);
      }

      this.results.measurements.images = imageMetrics;
      return imageMetrics;
    }

    // Measure network performance from resource timing
    measureNetworkPerformance() {
      console.log('🌐 Analyzing network performance...');
      
      const resourceEntries = performance.getEntriesByType('resource');
      const imageResources = resourceEntries.filter(entry => 
        entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/) ||
        entry.name.includes('image') ||
        entry.initiatorType === 'img'
      );

      const networkMetrics = {
        totalResources: resourceEntries.length,
        imageResources: imageResources.length,
        totalTransferSize: resourceEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        imageTransferSize: imageResources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        averageImageLoadTime: imageResources.length > 0 
          ? imageResources.reduce((sum, entry) => sum + entry.duration, 0) / imageResources.length 
          : 0,
        slowestImageLoad: imageResources.reduce((slowest, entry) => 
          entry.duration > (slowest?.duration || 0) ? entry : slowest, null
        ),
        resourceTimingSample: resourceEntries.slice(0, 20).map(entry => ({
          name: entry.name.substring(entry.name.lastIndexOf('/') + 1),
          duration: entry.duration,
          transferSize: entry.transferSize
        }))
      };

      console.log(`🌐 Network: ${networkMetrics.imageResources} images, ${Math.round(networkMetrics.imageTransferSize / 1024)}KB`);
      if (networkMetrics.averageImageLoadTime > 100) {
        console.warn(`⚠️ Slow image loading: ${networkMetrics.averageImageLoadTime.toFixed(2)}ms avg`);
      }

      this.results.measurements.network = networkMetrics;
      return networkMetrics;
    }

    // Generate performance recommendations
    generateRecommendations() {
      console.log('💡 Generating performance recommendations...');
      
      const { dom, memory, scroll, images, network } = this.results.measurements;
      const recommendations = [];

      // DOM recommendations
      if (dom && dom.gameCards > 100) {
        recommendations.push({
          category: '🏗️ DOM Performance',
          priority: 'HIGH',
          issue: `${dom.gameCards} game cards create ${dom.totalElements.toLocaleString()} DOM elements`,
          impact: 'Memory bloat, slow layout calculations, poor scroll performance',
          solution: 'Virtual scrolling with react-window (render only visible items)',
          expectedGain: '80-90% DOM reduction, 60fps scroll performance'
        });
      }

      // Memory recommendations
      if (memory && memory.available && memory.usedMB > 100) {
        recommendations.push({
          category: '🧠 Memory Usage',
          priority: 'HIGH',
          issue: `${memory.usedMB}MB memory consumption is excessive`,
          impact: 'Mobile device strain, garbage collection pauses',
          solution: 'Virtual scrolling + image lazy loading',
          expectedGain: '60-70% memory reduction'
        });
      }

      // Scroll performance recommendations
      if (scroll && !scroll.contentFitsInView && scroll.smoothnessScore < 85) {
        recommendations.push({
          category: '🖱️ Scroll Performance',
          priority: 'HIGH',
          issue: `${scroll.smoothnessScore.toFixed(1)}% smoothness with ${scroll.droppedFrames} dropped frames`,
          impact: 'Janky user experience, interaction lag',
          solution: 'Virtual scrolling with optimized item heights',
          expectedGain: '>95% scroll smoothness'
        });
      }

      // Image loading recommendations
      if (images && images.totalImages > 200) {
        recommendations.push({
          category: '🖼️ Image Loading',
          priority: 'MEDIUM',
          issue: `${images.totalImages} images (${images.estimatedSizeMB}MB) loading simultaneously`,
          impact: 'Slow initial load, network congestion',
          solution: 'Intersection Observer lazy loading',
          expectedGain: '80% reduction in initial image requests'
        });
      }

      // Network recommendations  
      if (network && network.imageTransferSize > 5 * 1024 * 1024) {
        recommendations.push({
          category: '🌐 Network Performance',
          priority: 'MEDIUM',
          issue: `${Math.round(network.imageTransferSize / 1024 / 1024)}MB image payload`,
          impact: 'Long load times on slower connections',
          solution: 'Progressive image loading + WebP format',
          expectedGain: '50% bandwidth reduction'
        });
      }

      this.results.recommendations = recommendations;
      return recommendations;
    }

    // Display comprehensive results
    displayResults() {
      const totalTime = performance.now() - this.startTime;
      
      console.log('\n🎯 GAMELISTDIALOG PERFORMANCE BASELINE');
      console.log('=====================================\n');
      
      console.log(`⏱️ Analysis completed in ${totalTime.toFixed(2)}ms`);
      console.log(`🕐 Timestamp: ${this.results.timestamp}`);
      console.log(`🌐 URL: ${this.results.url}`);
      console.log(`📱 Viewport: ${this.results.viewport.width}x${this.results.viewport.height}\n`);

      // DOM Metrics
      if (this.results.measurements.dom) {
        const dom = this.results.measurements.dom;
        console.log('🏗️ DOM STRUCTURE ANALYSIS:');
        console.log(`   📦 Total Elements: ${dom.totalElements.toLocaleString()}`);
        console.log(`   🎮 Game Cards: ${dom.gameCards}`);
        console.log(`   🖼️ Images: ${dom.images}`);
        console.log(`   🔘 Interactive Elements: ${dom.buttons + dom.inputs}`);
        console.log(`   📏 Dialog: ${dom.dialogDimensions.width}x${dom.dialogDimensions.height}px\n`);
      }

      // Memory Metrics
      if (this.results.measurements.memory && this.results.measurements.memory.available) {
        const mem = this.results.measurements.memory;
        console.log('🧠 MEMORY CONSUMPTION:');
        console.log(`   💾 Used: ${mem.usedMB}MB`);
        console.log(`   📊 Allocated: ${mem.totalMB}MB`);
        console.log(`   🏠 Limit: ${mem.limitMB}MB\n`);
      }

      // Scroll Performance
      if (this.results.measurements.scroll && !this.results.measurements.scroll.contentFitsInView) {
        const scroll = this.results.measurements.scroll;
        console.log('🖱️ SCROLL PERFORMANCE:');
        console.log(`   📊 Smoothness: ${scroll.smoothnessScore.toFixed(1)}%`);
        console.log(`   ⏱️ Avg Frame: ${scroll.averageFrameTime.toFixed(2)}ms`);
        console.log(`   📉 Dropped Frames: ${scroll.droppedFrames}`);
        console.log(`   📏 Scroll Range: ${scroll.scrollRange}px\n`);
      }

      // Image Analysis
      if (this.results.measurements.images) {
        const img = this.results.measurements.images;
        console.log('🖼️ IMAGE LOADING ANALYSIS:');
        console.log(`   📸 Total Images: ${img.totalImages}`);
        console.log(`   ✅ Loaded: ${img.loadedImages} (${img.loadSuccessRate.toFixed(1)}%)`);
        console.log(`   📦 Estimated Size: ${img.estimatedSizeMB}MB\n`);
      }

      // Recommendations
      if (this.results.recommendations.length > 0) {
        console.log('💡 PERFORMANCE RECOMMENDATIONS:');
        console.log('===============================\n');
        
        this.results.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.category} (${rec.priority} Priority)`);
          console.log(`   ⚠️ Issue: ${rec.issue}`);
          console.log(`   📈 Impact: ${rec.impact}`);
          console.log(`   🔧 Solution: ${rec.solution}`);
          console.log(`   🎯 Expected: ${rec.expectedGain}\n`);
        });
      }

      // Virtual Scrolling Roadmap
      console.log('🚀 VIRTUAL SCROLLING IMPLEMENTATION ROADMAP:');
      console.log('===========================================\n');
      console.log('1. 📦 Install dependencies: react-window, react-window-infinite-loader');
      console.log('2. 🔧 Replace MUI Grid with FixedSizeList component');
      console.log('3. 📏 Calculate optimal item height (estimated: 280px)');
      console.log('4. 🖼️ Implement intersection observer image lazy loading');
      console.log('5. ⚛️ Add React.memo optimization for game cards');
      console.log('6. 📊 Re-run this analysis to measure improvements\n');
      
      console.log('🎯 SUCCESS TARGETS:');
      console.log('- DOM Elements: <2,000 (vs current ' + this.results.measurements.dom?.totalElements.toLocaleString() + ')');
      console.log('- Memory Usage: <25MB (vs current ' + (this.results.measurements.memory?.usedMB || 'unknown') + 'MB)');
      console.log('- Scroll Smoothness: >95% (vs current ' + (this.results.measurements.scroll?.smoothnessScore?.toFixed(1) || 'unknown') + '%)');
      console.log('- Image Requests: <20 concurrent (vs current ' + (this.results.measurements.images?.totalImages || 'unknown') + ')\n');
      
      console.log('💾 Results stored in: window.performanceResults');
      console.log('📤 Export with: JSON.stringify(window.performanceResults, null, 2)');
      
      // Store results globally
      window.performanceResults = this.results;
    }

    // Main execution method
    async run() {
      console.log('🚀 Starting GameListDialog performance analysis...\n');
      
      if (!this.validateContext()) {
        return;
      }

      try {
        // Run all measurements
        this.measureDOMMetrics();
        this.measureMemory();
        await this.measureRenderingPerformance();
        const scrollResults = await this.measureScrollPerformance();
        this.results.measurements.scroll = scrollResults;
        this.measureImageMetrics();
        this.measureNetworkPerformance();
        
        // Generate insights
        this.generateRecommendations();
        
        // Display results
        this.displayResults();
        
        console.log('\n✅ Performance baseline analysis complete!');
        console.log('🔄 Ready for virtual scrolling implementation and comparison.');
        
      } catch (error) {
        console.error('❌ Analysis failed:', error);
      }
    }
  }

  // Create and run analyzer
  const analyzer = new GameListPerformanceMeasurer();
  
  // Check if dialog is available
  if (document.querySelector('[role="dialog"]')) {
    console.log('✅ GameListDialog detected, running analysis...');
    analyzer.run();
  } else {
    console.log('⏳ No dialog detected. Please open GameListDialog first, then run:');
    console.log('   window.runGameListPerformanceAnalysis()');
    window.runGameListPerformanceAnalysis = () => analyzer.run();
  }

})();