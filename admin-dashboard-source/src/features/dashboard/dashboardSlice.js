import { createSlice } from '@reduxjs/toolkit';
import { generateAllCards, mergeCardsWithExisting } from './cardGenerator';

// 동적 카드 시스템 - 초기값 빈 배열
// 실제 카드는 initializeCards 액션으로 동적 생성됨
const statsCards = [];

// 대시보드 아이템 정의
const dashboardItems = [
  { id: 'bettingWinningComparison', title: '베팅/당첨금 금액 비교', type: 'section', visible: true, periodType: 'monthly' },
  { id: 'depositWithdrawalComparison', title: '입금/출금 금액 비교', type: 'section', visible: true, periodType: 'monthly' },
  { id: 'rollingAmountComparison', title: '롤링금 비교', type: 'section', visible: true, periodType: 'monthly' },
  { id: 'rolling-status', title: '롤링금 상태', type: 'table', visible: true, periodType: 'monthly' },
  { id: 'active-users', title: '접속자 현황', type: 'table', visible: true, periodType: 'monthly' },
  { id: 'deposit-withdrawal-graph', title: '입금/출금 그래프', type: 'graph', visible: true, periodType: 'daily' },
  { id: 'betting-winning-graph', title: '베팅/당첨금 그래프', type: 'graph', visible: true, periodType: 'daily' },
];

// 기본 레이아웃 생성
const generateDefaultLayout = (items, type) => {
  return items
    .filter(item => item.visible && (type === 'all' || item.type === type))
    .map((item, index) => {
      // 통계 카드의 경우 6개 까지 한 줄에 표시
      if (type === 'all' && items[0].title && items[0].title.includes('베팅금')) {
        const row = Math.floor(index / 6);
        const col = index % 6;
        return {
          i: item.id,
          x: col * 2,
          y: row,
          w: 2,
          h: 1,
          minW: 2,
          maxW: 4,
          minH: 1,
          maxH: 1,
        };
      } 
      // 차트의 경우 3개씩 표시
      else {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {
          i: item.id,
          x: col * 4,
          y: row,
          w: 4,
          h: type === 'table' ? 2 : 1, // 테이블은 높이를 더 크게
          minW: 3,
          maxW: 12,
          minH: type === 'table' ? 2 : 1,
          maxH: type === 'table' ? 4 : 2,
        };
      }
    });
};

// 초기 상태 정의
const initialState = {
  // 통계 데이터
  statsData: {
    cards: statsCards,
    period: 'daily', // daily, weekly, monthly
    layouts: {
      lg: generateDefaultLayout(statsCards, 'all'),
      md: generateDefaultLayout(statsCards, 'all'),
      sm: generateDefaultLayout(statsCards, 'all'),
      xs: generateDefaultLayout(statsCards, 'all')
    }
  },
  
  // 대시보드 데이터
  dashboardData: {
    items: dashboardItems,
    layouts: {
      lg: generateDefaultLayout(dashboardItems, 'all'),
      md: generateDefaultLayout(dashboardItems, 'all'),
      sm: generateDefaultLayout(dashboardItems, 'all'),
      xs: generateDefaultLayout(dashboardItems, 'all')
    }
  },
  
  // UI 상태
  uiState: {
    statsDisplayOptionsExpanded: false,
    dashboardDisplayOptionsExpanded: false,
    loading: false,
    error: null
  }
};

// 대시보드 슬라이스 생성
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // 카드 초기화 (동적 생성)
    initializeCards: (state, action) => {
      const { cards } = action.payload;
      state.statsData.cards = cards;
      
      // 레이아웃도 새로운 카드에 맞게 업데이트
      state.statsData.layouts = {
        lg: generateDefaultLayout(cards, 'all'),
        md: generateDefaultLayout(cards, 'all'),
        sm: generateDefaultLayout(cards, 'all'),
        xs: generateDefaultLayout(cards, 'all')
      };
    },
    
    // 카드 추가
    addCard: (state, action) => {
      const newCard = action.payload;
      state.statsData.cards.push(newCard);
    },
    
    // 카드 업데이트
    updateCard: (state, action) => {
      const { cardId, updates } = action.payload;
      const cardIndex = state.statsData.cards.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        state.statsData.cards[cardIndex] = { ...state.statsData.cards[cardIndex], ...updates };
      }
    },
    
    // 카드 제거
    removeCard: (state, action) => {
      const cardId = action.payload;
      state.statsData.cards = state.statsData.cards.filter(card => card.id !== cardId);
    },
    // 카드 표시 여부 변경
    setCardVisibility: (state, action) => {
      const { cardId, visible } = action.payload;
      const cardIndex = state.statsData.cards.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        state.statsData.cards[cardIndex].visible = visible;
      }
    },
    
    // 대시보드 아이템 표시 여부 변경
    setDashboardItemVisibility: (state, action) => {
      const { itemId, visible } = action.payload;
      const itemIndex = state.dashboardData.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        state.dashboardData.items[itemIndex].visible = visible;
      }
    },
    
    // 기간 변경
    setPeriod: (state, action) => {
      state.statsData.period = action.payload;
    },
    
    // 통계 레이아웃 변경
    setStatsLayouts: (state, action) => {
      state.statsData.layouts = action.payload;
    },
    
    // 대시보드 레이아웃 변경
    setDashboardLayouts: (state, action) => {
      state.dashboardData.layouts = action.payload;
    },
    
    // 카드 순서 변경
    reorderCards: (state, action) => {
      state.statsData.cards = action.payload;
    },
    
    // 대시보드 아이템 순서 변경
    reorderDashboardItems: (state, action) => {
      state.dashboardData.items = action.payload;
    },
    
    // 표시 옵션 패널 확장/축소
    toggleStatsDisplayOptions: (state) => {
      state.uiState.statsDisplayOptionsExpanded = !state.uiState.statsDisplayOptionsExpanded;
    },
    
    // 대시보드 표시 옵션 패널 확장/축소
    toggleDashboardDisplayOptions: (state) => {
      state.uiState.dashboardDisplayOptionsExpanded = !state.uiState.dashboardDisplayOptionsExpanded;
    },
    
    // 레이아웃 초기화
    resetStatsLayout: (state) => {
      state.statsData.layouts = {
        lg: generateDefaultLayout(state.statsData.cards, 'all'),
        md: generateDefaultLayout(state.statsData.cards, 'all'),
        sm: generateDefaultLayout(state.statsData.cards, 'all'),
        xs: generateDefaultLayout(state.statsData.cards, 'all')
      };
    },
    
    // 대시보드 레이아웃 초기화
    resetDashboardLayout: (state) => {
      state.dashboardData.layouts = {
        lg: generateDefaultLayout(state.dashboardData.items, 'all'),
        md: generateDefaultLayout(state.dashboardData.items, 'all'),
        sm: generateDefaultLayout(state.dashboardData.items, 'all'),
        xs: generateDefaultLayout(state.dashboardData.items, 'all')
      };
    },
    
    // 로딩 상태 설정
    setLoading: (state, action) => {
      state.uiState.loading = action.payload;
    },
    
    // 에러 설정
    setError: (state, action) => {
      state.uiState.error = action.payload;
    }
  }
});

// 액션 생성자 내보내기
export const { 
  initializeCards,
  addCard,
  updateCard,
  removeCard,
  setCardVisibility, 
  setDashboardItemVisibility, 
  setPeriod, 
  setStatsLayouts, 
  setDashboardLayouts,
  reorderCards,
  reorderDashboardItems,
  toggleStatsDisplayOptions,
  toggleDashboardDisplayOptions,
  resetStatsLayout,
  resetDashboardLayout,
  setLoading,
  setError
} = dashboardSlice.actions;

// 선택자 함수 내보내기
export const selectStatsCards = state => state.dashboard.statsData.cards;
export const selectDashboardItems = state => state.dashboard.dashboardData.items;
export const selectStatsLayouts = state => state.dashboard.statsData.layouts;
export const selectDashboardLayouts = state => state.dashboard.dashboardData.layouts;
export const selectPeriod = state => state.dashboard.statsData.period;
export const selectStatsDisplayOptionsExpanded = state => state.dashboard.uiState.statsDisplayOptionsExpanded;
export const selectDashboardDisplayOptionsExpanded = state => state.dashboard.uiState.dashboardDisplayOptionsExpanded;
export const selectLoading = state => state.dashboard.uiState.loading;
export const selectError = state => state.dashboard.uiState.error;

export default dashboardSlice.reducer; 