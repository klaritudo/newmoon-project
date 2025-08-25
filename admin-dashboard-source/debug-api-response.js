// 브라우저 개발자 도구 콘솔에서 실행할 디버그 스크립트

console.log('🔍 API Response Debugging Script Starting...');

// 1. 토큰 확인
const token = localStorage.getItem('token');
console.log('🔑 Token status:', token ? 'Present' : 'Not found');

// 2. API 호출 함수 정의
async function debugApiCall() {
  try {
    const startDate = '2025-08-01';
    const endDate = '2025-08-07';
    
    console.log('📡 Making API call to settlement dashboard...');
    
    const response = await fetch(`/api/settlement-api/dashboard?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Raw response status:', response.status);
    console.log('📊 Raw response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Raw API response data:', data);
    
    // 데이터 구조 분석
    if (data) {
      console.log('🔍 Data structure analysis:');
      console.log('- Has success field:', 'success' in data);
      console.log('- Has data field:', 'data' in data);
      console.log('- Data keys:', Object.keys(data));
      
      if (data.data) {
        console.log('- data.data keys:', Object.keys(data.data));
        console.log('- data.data structure:', data.data);
      }
      
      if (data.success && data.data) {
        console.log('✅ API response follows {success: true, data: {...}} pattern');
        console.log('📦 Processed data would be:', data.data);
      } else {
        console.log('⚠️ API response is direct data or different structure');
        console.log('📦 Processed data would be:', data);
      }
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error);
  }
}

// 3. User Status API 호출
async function debugUserStatusApi() {
  try {
    console.log('📡 Making API call to user status...');
    
    const response = await fetch('/api/user-status/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('👥 User status response status:', response.status);
    const data = await response.json();
    console.log('👥 User status API response:', data);
    
    if (data && data.statistics) {
      console.log('👥 User statistics:', data.statistics);
    }
    
  } catch (error) {
    console.error('❌ User status API call failed:', error);
  }
}

// 4. 실행
debugApiCall();
setTimeout(debugUserStatusApi, 1000); // 1초 후 실행

console.log('🎯 Debug script loaded. Check the console for API response details.');