import { createSlice } from '@reduxjs/toolkit';

// localStorage에서 사용자 설정 가져오기
const getSavedSidebarMode = () => {
  try {
    const savedMode = localStorage.getItem('sidebarMode');
    return savedMode ? savedMode : 'vertical'; // 저장된 값이 없으면 'vertical'을 기본값으로 사용
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
    return 'vertical'; // 오류 발생 시 'vertical'을 기본값으로 사용
  }
};

const initialState = {
  sidebarMode: getSavedSidebarMode(), // localStorage에서 가져온 값 또는 'vertical'
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebarMode: (state) => {
      state.sidebarMode = state.sidebarMode === 'vertical' ? 'horizontal' : 'vertical';
      // 변경된 설정을 localStorage에 저장
      try {
        localStorage.setItem('sidebarMode', state.sidebarMode);
      } catch (error) {
        console.error('localStorage 저장 오류:', error);
      }
    },
    setSidebarMode: (state, action) => {
      state.sidebarMode = action.payload;
      // 변경된 설정을 localStorage에 저장
      try {
        localStorage.setItem('sidebarMode', state.sidebarMode);
      } catch (error) {
        console.error('localStorage 저장 오류:', error);
      }
    },
  },
});

export const { toggleSidebarMode, setSidebarMode } = uiSlice.actions;

export const selectSidebarMode = (state) => state.ui.sidebarMode;

export default uiSlice.reducer; 