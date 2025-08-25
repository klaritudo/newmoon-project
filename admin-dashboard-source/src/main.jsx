import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './app/store'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/theme.css'
import './styles/index.css'
import './styles/dashboard.css'
import './styles/stats-card.css'
import './styles/sidebar.css'
import './styles/header.css'
import './styles/member-table.css'

// AG Grid 스타일 임포트
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// FHD 스케일링 적용 (React 렌더링 전에 실행)
(function applyResponsiveScaling() {
  let currentScale = null;
  
  function setScale() {
    const width = window.innerWidth;
    let scale = 1;
    
    if (width <= 1920) {
      scale = 0.8;
    } else if (width < 2560) {
      scale = 0.9;
    }
    
    // 스케일이 변경된 경우에만 적용
    if (currentScale !== scale) {
      document.documentElement.style.zoom = scale;
      currentScale = scale;
      // console.log 제거 - 무한 출력 방지
    }
  }
  
  // 초기 적용
  setScale();
  
  // 리사이즈 시 재적용 (디바운싱을 300ms로 증가)
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setScale, 300);
  });
})();

// 개발 환경에서 Redux store를 window 객체에 노출 (디버깅용)
if (process.env.NODE_ENV === 'development') {
  window.store = store;
  // 디버그 로그 제어 유틸리티 로드
  import('./utils/quickDebugControl');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
