import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// 초기 상태 정의
const initialState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// 로그인 비동기 액션
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // 현재 도메인 정보 추가
      const currentDomain = window.location.origin;
      
      // [중요] 로그인 API 필드 매핑 주의사항 (2025-08-08)
      // 문제 1: 엔드포인트 오류
      //   - 기존: /api/auth/admin/login (404 Not Found)
      //   - 수정: /api/auth/login (올바른 엔드포인트)
      // 
      // 문제 2: 필드명 불일치 오류
      //   - 기존: email 필드 사용 시 400 Bad Request 발생
      //   - 원인: 백엔드 API는 'username' 필드를 요구하는데 프론트엔드에서 'email' 필드를 전송
      //   - 해결: username 필드로 통일
      //
      // 백엔드 요구사항:
      //   - username: 사용자 ID (필수)
      //   - password: 비밀번호 (필수)
      //   - domain: 현재 도메인 (선택)
      const loginData = {
        username: credentials.username, // 반드시 username 필드 사용 (email 아님!)
        password: credentials.password,
        domain: currentDomain
      };
      
      // 로그인 API 호출 - 올바른 엔드포인트: /auth/login
      const response = await apiService.post('/auth/login', loginData);
      
      if (response.data.success) {
        // 토큰 저장
        console.log('로그인 성공, 토큰 저장:', response.data.token);
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // 로그인 이벤트 발생 (PopupManager가 감지)
        window.dispatchEvent(new Event('authChange'));
        
        // 사용자가 로그인한 후 권한 정보 로드
        const user = response.data.user;
        let permissions = null;
        
        try {
          // 권한 정보 조회 (1단계와 999단계도 포함)
          const permissionResponse = await apiService.get(`/permissions/member/${user.id}`);
          
          if (permissionResponse.data?.success && permissionResponse.data?.data) {
            permissions = permissionResponse.data.data.effectivePermissions;
          }
        } catch (error) {
          console.error('권한 정보 로드 실패:', error);
          // 권한 로드 실패해도 로그인은 성공으로 처리
          permissions = {
            menus: [],
            buttons: [],
            features: [],
            restrictions: {
              menus: [],
              buttons: [],
              layouts: [],
              cssSelectors: []
            }
          };
        }
        
        return {
          user: {
            ...user,
            permissions // 사용자 객체에 권한 정보 추가
          },
          token: response.data.token
        };
      } else {
        return rejectWithValue({ message: '아이디 혹은 비밀번호가 틀립니다.' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '아이디 혹은 비밀번호가 틀립니다.' });
    }
  }
);

// 로그아웃 비동기 액션
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 토큰 제거
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // 로그아웃 이벤트 발생 (PopupManager가 감지)
      window.dispatchEvent(new Event('authChange'));
      
      return;
    } catch (error) {
      // 에러가 발생해도 토큰은 제거
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // 로그아웃 이벤트 발생 (PopupManager가 감지)
      window.dispatchEvent(new Event('authChange'));
      
      return rejectWithValue(error.response?.data || { message: '로그아웃 실패' });
    }
  }
);

// 인증 슬라이스
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateUserPermissions: (state, action) => {
      if (state.user) {
        state.user.permissions = action.payload;
        console.log('사용자 권한이 업데이트되었습니다:', action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 로그인
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.error || action.payload?.message || '아이디 혹은 비밀번호가 틀립니다.';
      })
      // 로그아웃
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // 로그아웃 실패해도 상태는 초기화
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError, setUser, updateUserPermissions } = authSlice.actions;
export default authSlice.reducer;