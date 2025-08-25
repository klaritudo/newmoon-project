/**
 * Virtual Scroll Prototype Test Script
 * 브라우저 콘솔에서 실행하여 프로토타입 검증
 */

console.log('🔍 Virtual Scroll Prototype Test Started');

// 페이지 이동
window.location.href = 'http://125.187.89.85:5173/virtual-scroll-test';

// 페이지 로드 후 실행할 테스트
setTimeout(() => {
  console.log('📊 Testing Virtual Scroll Implementation...');
  
  // 1. react-window Grid 존재 확인
  const gridElement = document.querySelector('[data-testid*="grid"], [class*="react-window"]');
  if (gridElement) {
    console.log('✅ react-window Grid found');
    console.log('Grid dimensions:', {
      width: gridElement.style.width,
      height: gridElement.style.height
    });
  } else {
    console.error('❌ react-window Grid not found');
  }
  
  // 2. DOM 노드 수 확인
  const visibleCards = document.querySelectorAll('[class*="MuiCard"]').length;
  console.log(`📦 Visible cards in DOM: ${visibleCards}`);
  console.log('Expected: ~8-12 cards (only visible items)');
  
  // 3. 컨테이너 크기 확인
  const container = document.querySelector('[class*="MuiPaper-root"]');
  if (container) {
    const rect = container.getBoundingClientRect();
    console.log('📐 Container size:', {
      width: Math.floor(rect.width),
      height: Math.floor(rect.height)
    });
  }
  
  // 4. 스크롤 테스트
  if (gridElement) {
    console.log('🔄 Testing scroll...');
    const scrollContainer = gridElement.querySelector('[style*="overflow"]');
    if (scrollContainer) {
      // 스크롤 다운
      scrollContainer.scrollTop = 500;
      setTimeout(() => {
        const newVisibleCards = document.querySelectorAll('[class*="MuiCard"]').length;
        console.log(`After scroll - Visible cards: ${newVisibleCards}`);
        
        if (newVisibleCards <= 20) {
          console.log('✅ Virtual scrolling is working! Only visible items are rendered.');
        } else {
          console.warn('⚠️ Too many cards rendered. Virtual scrolling may not be working properly.');
        }
      }, 500);
    }
  }
  
  // 5. 메모리 사용량 체크
  if (performance.memory) {
    console.log('💾 Memory usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
    });
  }
  
  console.log('✅ Test completed. Check results above.');
  
}, 2000);