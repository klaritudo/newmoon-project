/**
 * 브라우저 레벨 팝업 에디터 디버깅 검증 스크립트
 * 
 * 개발자 도구 콘솔에서 실행하여 QuillEditor 사라짐 현상을 실시간 모니터링
 * 
 * 사용법:
 * 1. 팝업 설정 페이지에서 F12로 개발자 도구 열기
 * 2. Console 탭에서 이 스크립트 전체를 복사 후 실행
 * 3. 팝업 등록/수정 다이얼로그를 열고 폼 필드 변경하며 관찰
 */

console.log('🔍 브라우저 레벨 QuillEditor 디버깅 검증 시작');

// 전역 디버깅 상태
window.quillEditorDebugger = {
  isActive: true,
  logs: [],
  mutations: [],
  domObserver: null,
  performanceObserver: null,
  reactFiberRoots: new Set(),
  
  // 로그 기록 함수
  log: function(type, message, data = {}) {
    if (!this.isActive) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data: JSON.stringify(data, null, 2)
    };
    
    this.logs.push(logEntry);
    console.log(`[${type}] ${message}`, data);
    
    // 최대 100개 로그만 유지
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }
};

// 1. 콘솔 로그 패턴 분석
console.log('📊 1. 콘솔 로그 패턴 분석 시작');

// 기존 콘솔 로그 가로채기
const originalConsoleLog = console.log;
console.log = function(...args) {
  // QuillEditor 관련 로그 필터링
  const logText = args.join(' ');
  
  if (logText.includes('[QuillEditor]') || logText.includes('[PopupPage]')) {
    window.quillEditorDebugger.log('CONSOLE', 'Relevant log captured', {
      args,
      stack: new Error().stack
    });
    
    // contentCleared 감지
    if (logText.includes('contentCleared: true')) {
      window.quillEditorDebugger.log('ALERT', '⚠️ CONTENT CLEARED DETECTED!', {
        logText,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
    }
  }
  
  return originalConsoleLog.apply(console, args);
};

// 2. React DevTools 상태 변경 모니터링
console.log('⚛️ 2. React 컴포넌트 상태 모니터링 시작');

// React Fiber 탐지 및 모니터링
function findReactFiberRoot() {
  // React 18의 경우
  const rootNodes = document.querySelectorAll('[data-reactroot], #root');
  
  rootNodes.forEach(node => {
    const keys = Object.keys(node);
    const reactFiberKey = keys.find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
    
    if (reactFiberKey && node[reactFiberKey]) {
      window.quillEditorDebugger.reactFiberRoots.add(node[reactFiberKey]);
      window.quillEditorDebugger.log('REACT', 'React Fiber Root found', {
        rootElement: node.tagName,
        fiberKey: reactFiberKey
      });
    }
  });
}

// React 상태 변경 감지
function monitorReactState() {
  // React DevTools가 있는 경우 활용
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    // Fiber 커밋 감지
    const originalOnCommitFiber = devTools.onCommitFiberRoot;
    devTools.onCommitFiberRoot = function(id, root, ...args) {
      window.quillEditorDebugger.log('REACT', 'Fiber commit detected', {
        rootId: id,
        timestamp: new Date().toISOString()
      });
      
      return originalOnCommitFiber?.call(this, id, root, ...args);
    };
  }
}

// 3. DOM 변화 감지 (MutationObserver)
console.log('👁️ 3. DOM 변화 감지 시작');

window.quillEditorDebugger.domObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // QuillEditor 관련 DOM 변화 감지
    const isQuillRelated = (node) => {
      if (!node.classList) return false;
      return node.classList.contains('quill-editor-container') ||
             node.classList.contains('ql-editor') ||
             node.classList.contains('ql-container') ||
             node.closest?.('.quill-editor-container');
    };
    
    if (mutation.type === 'childList') {
      // 노드 추가/제거 감지
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && isQuillRelated(node)) {
          window.quillEditorDebugger.log('DOM_ALERT', '🚨 QuillEditor DOM 요소 제거됨!', {
            removedNode: node.outerHTML?.substring(0, 200),
            parentNode: mutation.target?.tagName,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && isQuillRelated(node)) {
          window.quillEditorDebugger.log('DOM', 'QuillEditor DOM 요소 추가됨', {
            addedNode: node.outerHTML?.substring(0, 200),
            parentNode: mutation.target?.tagName
          });
        }
      });
    }
    
    if (mutation.type === 'attributes') {
      const target = mutation.target;
      if (isQuillRelated(target)) {
        const attrName = mutation.attributeName;
        const newValue = target.getAttribute(attrName);
        
        if (attrName === 'style') {
          // display:none, visibility:hidden 등 감지
          if (newValue?.includes('display: none') || newValue?.includes('visibility: hidden')) {
            window.quillEditorDebugger.log('DOM_ALERT', '🚨 QuillEditor 숨김 스타일 적용됨!', {
              element: target.tagName,
              className: target.className,
              newStyle: newValue,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
  });
});

// DOM 감시 시작
window.quillEditorDebugger.domObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeOldValue: true,
  attributeFilter: ['style', 'class', 'hidden']
});

// 4. 네트워크 요청 모니터링
console.log('🌐 4. 네트워크 요청 모니터링 시작');

// Fetch API 가로채기
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  
  if (typeof url === 'string' && url.includes('/popups')) {
    window.quillEditorDebugger.log('NETWORK', 'Popup API 호출 감지', {
      url,
      method: args[1]?.method || 'GET',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const response = await originalFetch.apply(this, args);
    
    if (typeof url === 'string' && url.includes('/popups')) {
      window.quillEditorDebugger.log('NETWORK', 'Popup API 응답', {
        url,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    }
    
    return response;
  } catch (error) {
    window.quillEditorDebugger.log('NETWORK_ERROR', 'API 요청 실패', {
      url,
      error: error.message
    });
    throw error;
  }
};

// 5. 성능 및 메모리 모니터링
console.log('📈 5. 성능 모니터링 시작');

// Performance Observer (메모리 누수 감지)
if ('PerformanceObserver' in window) {
  window.quillEditorDebugger.performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
        window.quillEditorDebugger.log('PERFORMANCE', 'Performance entry', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    });
  });
  
  try {
    window.quillEditorDebugger.performanceObserver.observe({entryTypes: ['measure', 'navigation', 'resource']});
  } catch (e) {
    console.warn('Performance Observer 초기화 실패:', e);
  }
}

// 메모리 사용량 모니터링 (Chrome)
function checkMemoryUsage() {
  if (performance.memory) {
    const memory = performance.memory;
    window.quillEditorDebugger.log('MEMORY', 'Memory usage', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
  }
}

// 6. React.StrictMode 감지
console.log('🔒 6. React.StrictMode 효과 확인');

function detectStrictMode() {
  // StrictMode는 개발 모드에서 컴포넌트를 두 번 렌더링
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const hasStrictMode = rootElement.innerHTML.includes('react-strict-mode') || 
                         window.React?.StrictMode !== undefined;
    
    window.quillEditorDebugger.log('REACT', 'StrictMode 상태', {
      detected: hasStrictMode,
      isDevelopment: process?.env?.NODE_ENV === 'development' || !process?.env?.NODE_ENV
    });
  }
}

// 7. 에러 경계 및 예외 처리 모니터링
console.log('🚨 7. 에러 모니터링 시작');

// 전역 에러 핸들러
window.addEventListener('error', (event) => {
  if (event.message?.includes('quill') || event.filename?.includes('quill')) {
    window.quillEditorDebugger.log('ERROR', '전역 JavaScript 에러 (Quill 관련)', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
});

// Promise rejection 핸들러
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason?.message?.includes('quill') || reason?.stack?.includes('quill')) {
    window.quillEditorDebugger.log('ERROR', 'Unhandled Promise Rejection (Quill 관련)', {
      reason: reason?.message || reason,
      stack: reason?.stack
    });
  }
});

// 8. 유틸리티 함수들
console.log('🛠️ 8. 디버깅 유틸리티 함수 등록');

// 현재 QuillEditor 상태 확인
window.checkQuillEditorStatus = function() {
  const editors = document.querySelectorAll('.quill-editor-container, .ql-editor');
  
  window.quillEditorDebugger.log('STATUS', 'QuillEditor 상태 검사', {
    totalEditors: editors.length,
    visibleEditors: Array.from(editors).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }).length,
    editors: Array.from(editors).map(el => ({
      tagName: el.tagName,
      className: el.className,
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility,
      opacity: window.getComputedStyle(el).opacity,
      rect: el.getBoundingClientRect()
    }))
  });
};

// 로그 내보내기
window.exportQuillDebugLogs = function() {
  const logs = window.quillEditorDebugger.logs;
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quill-debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 디버깅 중지
window.stopQuillDebugger = function() {
  window.quillEditorDebugger.isActive = false;
  window.quillEditorDebugger.domObserver?.disconnect();
  window.quillEditorDebugger.performanceObserver?.disconnect();
  console.log('🛑 QuillEditor 디버깅이 중지되었습니다.');
};

// 초기 설정 실행
findReactFiberRoot();
monitorReactState();
detectStrictMode();

// 주기적으로 메모리 사용량 체크 (30초마다)
setInterval(checkMemoryUsage, 30000);

// 5초 후 초기 상태 검사
setTimeout(() => {
  window.checkQuillEditorStatus();
}, 5000);

console.log(`
🎯 브라우저 레벨 디버깅 설정 완료!

다음 명령어들을 사용할 수 있습니다:
- window.checkQuillEditorStatus() : 현재 QuillEditor 상태 확인
- window.exportQuillDebugLogs() : 디버그 로그를 JSON 파일로 다운로드
- window.stopQuillDebugger() : 디버깅 중지

이제 팝업 등록/수정 다이얼로그를 열고 폼 필드를 변경해보세요.
콘솔에서 실시간으로 상황을 모니터링합니다.

⚠️ 특히 다음 로그들을 주의깊게 관찰하세요:
- [ALERT] CONTENT CLEARED DETECTED!
- [DOM_ALERT] QuillEditor DOM 요소 제거됨!
- [DOM_ALERT] QuillEditor 숨김 스타일 적용됨!
`);