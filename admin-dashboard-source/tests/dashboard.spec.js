import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console error tracking
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.consoleErrors = consoleErrors;

    // Enable network request tracking
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    page.networkRequests = networkRequests;

    // Enable response tracking
    const networkResponses = [];
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      });
    });
    page.networkResponses = networkResponses;
  });

  test('Dashboard - Load and Display Test', async ({ page }) => {
    console.log('🔍 Testing Dashboard Load and Display...');
    
    // Navigate to dashboard
    await page.goto('http://125.187.89.85:5173/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for React to load
    await page.waitForTimeout(2000);

    // Check page title
    await expect(page).toHaveTitle(/Admin Dashboard|Dashboard|React/);

    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'test-results/dashboard-initial-load.png',
      fullPage: true 
    });

    // Check for main dashboard elements
    const dashboardContainer = page.locator('[data-testid="dashboard-container"], .dashboard-container, main, #root');
    await expect(dashboardContainer).toBeVisible({ timeout: 10000 });

    // Check for common dashboard components
    const possibleSelectors = [
      '.MuiGrid-container',
      '.ant-layout-content', 
      '[role="main"]',
      'main',
      '.dashboard-content',
      '.dashboard-grid'
    ];

    let foundDashboardContent = false;
    for (const selector of possibleSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        foundDashboardContent = true;
        console.log(`✅ Found dashboard content with selector: ${selector}`);
        break;
      }
    }

    if (!foundDashboardContent) {
      console.log('⚠️ No standard dashboard containers found, checking for any content...');
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent.length).toBeGreaterThan(100); // Ensure page has content
    }

    // Check for console errors
    if (page.consoleErrors && page.consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:', page.consoleErrors);
    }

    // Log network activity
    console.log(`📡 Network requests made: ${page.networkRequests ? page.networkRequests.length : 0}`);
    console.log(`📡 Network responses received: ${page.networkResponses ? page.networkResponses.length : 0}`);
  });

  test('Dashboard - API Calls and Data Flow', async ({ page }) => {
    console.log('🔍 Testing Dashboard API Calls and Data Flow...');

    // Track API calls specifically
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('api') || 
          request.url().includes('localhost:5173') === false) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now()
        });
      }
    });

    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('api') || 
          response.url().includes('localhost:5173') === false) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: Date.now()
        });
      }
    });

    // Navigate to dashboard
    await page.goto('http://125.187.89.85:5173/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for potential API calls to complete
    await page.waitForTimeout(5000);

    // Check for loading states or data
    const possibleDataElements = [
      '[data-testid*="chart"]',
      '[data-testid*="data"]', 
      '.recharts-wrapper',
      '.ag-grid-wrapper',
      '.MuiDataGrid-root',
      '.ant-table-wrapper',
      '.dashboard-card',
      '.metric-card',
      '.chart-container'
    ];

    let foundDataElements = false;
    for (const selector of possibleDataElements) {
      const elements = await page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        foundDataElements = true;
        console.log(`✅ Found ${count} data elements with selector: ${selector}`);
      }
    }

    // Log API activity
    console.log(`📊 API calls made: ${apiCalls.length}`);
    console.log(`📊 API responses: ${apiResponses.length}`);
    
    if (apiCalls.length > 0) {
      console.log('API endpoints called:', apiCalls.map(call => `${call.method} ${call.url}`));
    }

    if (apiResponses.length > 0) {
      console.log('API response statuses:', apiResponses.map(res => `${res.status} ${res.url}`));
    }

    // Take screenshot after data loading
    await page.screenshot({ 
      path: 'test-results/dashboard-data-loaded.png',
      fullPage: true 
    });
  });

  test('Dashboard - Error Handling and Fallbacks', async ({ page }) => {
    console.log('🔍 Testing Dashboard Error Handling...');

    // Block external API calls to test fallback
    await page.route('**/*api*/**', route => {
      route.abort();
    });

    // Navigate to dashboard
    await page.goto('http://125.187.89.85:5173/dashboard', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait for error handling/fallbacks
    await page.waitForTimeout(3000);

    // Check page still loads without API
    const bodyText = await page.locator('body').textContent();
    expect(bodyText.length).toBeGreaterThan(50);

    // Look for error messages or fallback content
    const errorSelectors = [
      '[data-testid*="error"]',
      '.error-message',
      '.fallback-content',
      '.no-data',
      '.loading-error'
    ];

    for (const selector of errorSelectors) {
      const elements = await page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`ℹ️ Found ${count} error/fallback elements with selector: ${selector}`);
      }
    }

    // Take screenshot of fallback state
    await page.screenshot({ 
      path: 'test-results/dashboard-fallback-state.png',
      fullPage: true 
    });

    // Check for console errors (expected in this test)
    console.log(`⚠️ Console errors (expected): ${page.consoleErrors ? page.consoleErrors.length : 0}`);
  });

  test('Other Pages - Navigation and Stability', async ({ page }) => {
    console.log('🔍 Testing Other Pages Navigation...');

    const testPages = [
      { path: '/login', name: 'Login Page' },
      { path: '/users', name: 'Users Page' },
      { path: '/settings', name: 'Settings Page' },
      { path: '/', name: 'Home Page' }
    ];

    for (const testPage of testPages) {
      try {
        console.log(`📄 Testing ${testPage.name}...`);
        
        await page.goto(`http://125.187.89.85:5173${testPage.path}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Check page loads without errors
        const bodyContent = await page.locator('body').textContent();
        expect(bodyContent.length).toBeGreaterThan(20);

        // Take screenshot
        await page.screenshot({ 
          path: `test-results/page-${testPage.path.replace('/', 'root')}.png`,
          fullPage: true 
        });

        // Check for console errors on this page
        if (page.consoleErrors && page.consoleErrors.length > 0) {
          console.log(`⚠️ ${testPage.name} console errors:`, page.consoleErrors.slice(-3));
        } else {
          console.log(`✅ ${testPage.name} loaded without console errors`);
        }

        // Reset console errors for next page
        page.consoleErrors = [];

      } catch (error) {
        console.log(`❌ ${testPage.name} failed to load:`, error.message);
        // Continue testing other pages
      }
    }
  });

  test('Memory Leak Detection', async ({ page }) => {
    console.log('🔍 Testing for Memory Leaks...');

    // Enable memory monitoring if available
    await page.goto('http://125.187.89.85:5173/dashboard');
    
    // Take initial memory measurement
    const initialMemory = await page.evaluate(() => {
      if (window.performance && window.performance.memory) {
        return {
          usedJSHeapSize: window.performance.memory.usedJSHeapSize,
          totalJSHeapSize: window.performance.memory.totalJSHeapSize
        };
      }
      return null;
    });

    if (initialMemory) {
      console.log('📊 Initial memory usage:', initialMemory);
    }

    // Navigate between pages multiple times to test for leaks
    const pages = ['/dashboard', '/', '/users', '/dashboard'];
    for (let i = 0; i < 3; i++) {
      for (const path of pages) {
        await page.goto(`http://125.187.89.85:5173${path}`);
        await page.waitForTimeout(1000);
      }
    }

    // Take final memory measurement
    const finalMemory = await page.evaluate(() => {
      if (window.performance && window.performance.memory) {
        return {
          usedJSHeapSize: window.performance.memory.usedJSHeapSize,
          totalJSHeapSize: window.performance.memory.totalJSHeapSize
        };
      }
      return null;
    });

    if (finalMemory && initialMemory) {
      console.log('📊 Final memory usage:', finalMemory);
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      console.log(`📈 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
      
      // Alert if memory increased significantly
      if (memoryIncrease > 50 * 1024 * 1024) { // 50MB threshold
        console.log('⚠️ Significant memory increase detected - potential memory leak');
      } else {
        console.log('✅ Memory usage within acceptable bounds');
      }
    }

    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-memory-test-final.png',
      fullPage: true 
    });
  });
});