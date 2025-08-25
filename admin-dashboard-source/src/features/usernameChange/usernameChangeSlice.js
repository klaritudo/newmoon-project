import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: [],
  onlineChangeableUsers: [],
  changeableUsers: [],
  isLoading: false,
  error: null,
  selectedUser: null,
  changeDialog: {
    open: false,
    userId: null,
    agentId: null
  },
  toggleLoading: false, // 토글 작업 로딩 상태
  toggleError: null // 토글 작업 에러 상태
};

const usernameChangeSlice = createSlice({
  name: 'usernameChange',
  initialState,
  reducers: {
    // 아이디 변경 이력 관련
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    addHistoryRecord: (state, action) => {
      state.history.unshift(action.payload);
    },
    
    // 온라인 변경 가능 사용자 관련
    setOnlineChangeableUsers: (state, action) => {
      state.onlineChangeableUsers = action.payload;
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;
      const user = state.onlineChangeableUsers.find(u => u.userId === userId);
      if (user) {
        user.gameStatus = status;
      }
    },
    
    // 변경 가능 사용자 목록 관련
    setChangeableUsers: (state, action) => {
      state.changeableUsers = action.payload;
    },
    clearChangeableUsers: (state) => {
      state.changeableUsers = [];
    },
    
    // 선택된 사용자 관련
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    
    // 다이얼로그 관련
    openChangeDialog: (state, action) => {
      state.changeDialog = {
        open: true,
        userId: action.payload.userId,
        agentId: action.payload.agentId
      };
    },
    closeChangeDialog: (state) => {
      state.changeDialog = {
        open: false,
        userId: null,
        agentId: null
      };
      state.changeableUsers = [];
    },
    
    // 로딩 및 에러 상태
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // 아이디 변경 활성화 토글
    toggleUsernameChangeEnabled: (state, action) => {
      const { userId, enabled } = action.payload;
      // API 호출은 컴포넌트에서 처리하고, 여기서는 상태만 관리
      // 필요한 경우 여기에 로컬 상태 업데이트 로직 추가 가능
    },
    
    // 토글 로딩 상태 관리
    setToggleLoading: (state, action) => {
      state.toggleLoading = action.payload;
    },
    setToggleError: (state, action) => {
      state.toggleError = action.payload;
    },
    
    // 아이디 변경 실행
    executeUsernameChange: (state, action) => {
      const { oldUserId, newUserId, agentId, reason } = action.payload;
      
      // 이력에 추가
      const newRecord = {
        id: `UCH${Date.now()}`,
        changeDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        agentId: agentId,
        oldUsername: oldUserId,
        newUsername: newUserId,
        changeReason: reason || '사용자 요청',
        changedBy: 'admin', // 실제로는 현재 로그인한 관리자
        // ... 기타 필요한 정보
      };
      
      state.history.unshift(newRecord);
      
      // 온라인 사용자 목록에서 제거
      state.onlineChangeableUsers = state.onlineChangeableUsers.filter(
        user => user.userId !== oldUserId
      );
      
      // 다이얼로그 닫기
      state.changeDialog = {
        open: false,
        userId: null,
        agentId: null
      };
      state.changeableUsers = [];
    }
  }
});

export const {
  setHistory,
  addHistoryRecord,
  setOnlineChangeableUsers,
  updateUserStatus,
  setChangeableUsers,
  clearChangeableUsers,
  setSelectedUser,
  clearSelectedUser,
  openChangeDialog,
  closeChangeDialog,
  setLoading,
  setError,
  clearError,
  toggleUsernameChangeEnabled,
  setToggleLoading,
  setToggleError,
  executeUsernameChange
} = usernameChangeSlice.actions;

export default usernameChangeSlice.reducer;