import { createSlice } from '@reduxjs/toolkit';

// 초기 상태 정의
const initialState = {
  isVisible: true,
  soundEnabled: true, // 알림음 전역 설정
  notifications: {
    'member-registration': {
      id: 'member-registration',
      title: '회원가입',
      icon: 'PersonIcon',
      color: '#9c27b0',
      requests: 0,
      pending: 0
    },
    'deposit-inquiry': {
      id: 'deposit-inquiry',
      title: '입금문의',
      icon: 'ArrowUpwardIcon',
      color: '#f44336',
      requests: 0,
      pending: 0
    },
    'withdrawal-inquiry': {
      id: 'withdrawal-inquiry',
      title: '출금문의',
      icon: 'ArrowDownwardIcon',
      color: '#2196f3',
      requests: 0,
      pending: 0
    },
    'customer-service': {
      id: 'customer-service',
      title: '고객센터',
      icon: 'SupportAgentIcon',
      color: '#ff9800',
      requests: 0,
      pending: 0
    },
  }
};

// 알림판 슬라이스 생성
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // 알림판 표시 여부 변경
    toggleNotificationPanel: (state) => {
      state.isVisible = !state.isVisible;
    },
    
    // 알림음 설정 토글
    toggleNotificationSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    
    // 알림 카운트 업데이트
    updateNotificationCount: (state, action) => {
      const { id, requests, pending } = action.payload;
      
      // 에이전트 문의와 보유금 불일치는 무시
      if (id === 'agent-inquiry' || id === 'balance-mismatch') {
        console.warn(`[Redux] ${id} 업데이트 시도 차단됨`);
        return;
      }
      
      if (state.notifications[id]) {
        if (requests !== undefined) {
          state.notifications[id].requests = requests;
        }
        if (pending !== undefined) {
          state.notifications[id].pending = pending;
        }
      }
    },
    
    // 모든 알림 카운트 업데이트
    updateAllNotifications: (state, action) => {
      const updates = action.payload;
      Object.keys(updates).forEach(id => {
        if (state.notifications[id]) {
          const { requests, pending } = updates[id];
          if (requests !== undefined) {
            state.notifications[id].requests = requests;
          }
          if (pending !== undefined) {
            state.notifications[id].pending = pending;
          }
        }
      });
    },
    
    // 테스트용 랜덤 알림 생성
    generateRandomNotifications: (state) => {
      Object.keys(state.notifications).forEach(id => {
        state.notifications[id].requests = Math.floor(Math.random() * 10);
        state.notifications[id].pending = Math.floor(Math.random() * 10);
      });
    },
    
    // 실제 데이터로 알림 초기화
    initializeNotifications: (state, action) => {
      const data = action.payload;
      
      // 허용된 알림 타입만 업데이트 (에이전트 문의, 보유금 불일치 제외)
      const allowedTypes = ['member-registration', 'deposit-inquiry', 'withdrawal-inquiry', 'customer-service'];
      
      allowedTypes.forEach(id => {
        if (data[id] && state.notifications[id]) {
          state.notifications[id].requests = data[id].requests || 0;
          state.notifications[id].pending = data[id].pending || 0;
        }
      });
      
      // 명시적으로 에이전트 문의와 보유금 불일치 제거
      delete state.notifications['agent-inquiry'];
      delete state.notifications['balance-mismatch'];
    }
  }
});

// 액션 생성자 내보내기
export const { 
  toggleNotificationPanel,
  toggleNotificationSound,
  updateNotificationCount,
  updateAllNotifications,
  generateRandomNotifications,
  initializeNotifications
} = notificationsSlice.actions;

// 선택자 함수 내보내기
export const selectNotificationPanelVisibility = state => state.notifications.isVisible;
export const selectNotificationSoundEnabled = state => state.notifications.soundEnabled;
export const selectAllNotifications = state => state.notifications.notifications;
export const selectNotificationById = (state, id) => state.notifications.notifications[id];
export const selectTotalNotifications = state => {
  const notifications = state.notifications.notifications;
  return Object.values(notifications).reduce(
    (total, notification) => total + notification.requests + notification.pending, 
    0
  );
};

export default notificationsSlice.reducer; 