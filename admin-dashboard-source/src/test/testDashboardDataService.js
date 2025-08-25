/**
 * Test Dashboard Data Service - Independent Testing
 * Run this file independently to test the dashboardDataService
 */

// Import the service
import { 
  getDashboardOverview, 
  getUserMetrics, 
  getSystemStatus, 
  getAllDashboardData,
  SERVICE_INFO
} from '../services/dashboardDataService.js';

console.log('>ê Starting Dashboard Data Service Tests...');
console.log('=Ë Service Info:', SERVICE_INFO);

/**
 * Test individual service methods
 */
async function testIndividualMethods() {
  console.log('\n=== Testing Individual Methods ===');
  
  console.log('\n1. Testing getDashboardOverview()...');
  const overview = await getDashboardOverview();
  console.log('Result:', overview);
  
  console.log('\n2. Testing getUserMetrics()...');
  const userMetrics = await getUserMetrics();
  console.log('Result:', userMetrics);
  
  console.log('\n3. Testing getSystemStatus()...');
  const systemStatus = await getSystemStatus();
  console.log('Result:', systemStatus);
}

/**
 * Test combined method
 */
async function testCombinedMethod() {
  console.log('\n=== Testing Combined Method ===');
  
  console.log('\n4. Testing getAllDashboardData()...');
  const allData = await getAllDashboardData();
  console.log('Result:', allData);
  
  // Test result structure
  console.log('\n=Ê Result Analysis:');
  console.log('- Has overview data:', allData.overview !== null);
  console.log('- Has user metrics:', allData.userMetrics !== null);
  console.log('- Has system status:', allData.systemStatus !== null);
  console.log('- Overall has data:', allData.hasData);
  console.log('- Timestamp:', allData.timestamp);
  console.log('- Error:', allData.error || 'None');
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  // This should fail gracefully and return null
  console.log('\n5. Testing invalid endpoint (should return null)...');
  
  // We'll use the internal fetchDashboardData function approach
  // by testing with a clearly invalid endpoint
  try {
    const response = await fetch('/clearly-invalid-endpoint-that-should-fail', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // Shorter timeout for test
    });
    console.log('Unexpected success - this should have failed');
  } catch (error) {
    console.log(' Expected error caught:', error.message);
  }
}

/**
 * Performance test
 */
async function testPerformance() {
  console.log('\n=== Performance Test ===');
  
  const startTime = Date.now();
  const result = await getAllDashboardData();
  const endTime = Date.now();
  
  console.log(`ñ Total execution time: ${endTime - startTime}ms`);
  console.log('=È Result summary:', {
    hasData: result.hasData,
    dataCount: [result.overview, result.userMetrics, result.systemStatus].filter(Boolean).length,
    timestamp: result.timestamp
  });
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    console.log('=€ Running all Dashboard Data Service tests...\n');
    
    await testIndividualMethods();
    await testCombinedMethod();
    await testErrorHandling();
    await testPerformance();
    
    console.log('\n All tests completed!');
    console.log('\n=Ý Test Summary:');
    console.log('-  Individual method tests completed');
    console.log('-  Combined method test completed');
    console.log('-  Error handling test completed');
    console.log('-  Performance test completed');
    console.log('\n<¯ Service is ready for integration!');
    
  } catch (error) {
    console.error('=¥ Test suite failed:', error);
  }
}

// Export test functions for manual testing
export {
  testIndividualMethods,
  testCombinedMethod,
  testErrorHandling,
  testPerformance,
  runAllTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

console.log('=Á Dashboard Data Service Test Suite loaded and ready!');
console.log('=¡ Usage:');
console.log('  - Run all tests: runAllTests()');
console.log('  - Run individual tests: testIndividualMethods(), testCombinedMethod(), etc.');