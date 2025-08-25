import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// 비동기 액션 생성
export const fetchRoles = createAsyncThunk(
  'permissions/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      // 기본 역할 데이터
      const defaultRoles = [
        { id: 1, name: '슈퍼관리자', createdAt: '2023-01-01', bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '홍길동' },
        { id: 2, name: '관리자', createdAt: '2023-01-01', bankName: '국민은행', accountNumber: '123-45-67890', accountHolder: '김철수' },
        { id: 3, name: '에이전트', createdAt: '2023-01-01', bankName: '우리은행', accountNumber: '1002-123-456789', accountHolder: '이영희' },
        { id: 4, name: '회원', createdAt: '2023-01-01', bankName: '', accountNumber: '', accountHolder: '' },
      ];
      
      try {
        // API 호출 시도
        const response = await apiService.permissions.getRoles();
        return response.data;
      } catch (apiError) {
        console.error('API 호출 실패, 로컬 데이터 사용:', apiError);
        
        // 로컬 스토리지에서 데이터 가져오기 시도
        const savedRoles = localStorage.getItem('roles');
        if (savedRoles) {
          return JSON.parse(savedRoles);
        }
        
        // 로컬 스토리지에 데이터가 없으면 기본 데이터 저장 후 반환
        localStorage.setItem('roles', JSON.stringify(defaultRoles));
        return defaultRoles;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || '데이터를 불러오는데 실패했습니다.');
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'permissions/fetchRolePermissions',
  async (roleId, { rejectWithValue }) => {
    try {
      // 기본 역할별 권한 데이터
      const defaultRolePermissions = {
        1: [101, 102, 103, 201, 202, 203, 204, 205, 301, 302, 401, 402, 501, 502, 503, 601, 602, 603, 604], // 슈퍼관리자 (모든 권한)
        2: [101, 102, 103, 201, 202, 203, 204, 301, 401, 501, 502, 503, 601], // 관리자 (자동 새로고침 포함)
        3: [101, 201, 202, 301, 401, 501], // 에이전트 (자동 새로고침 없음)
        4: [101], // 회원 (자동 새로고침 없음)
      };
      
      try {
        // API 호출 시도
        const response = await apiService.permissions.getRolePermissions(roleId);
        return { roleId, permissions: response.data };
      } catch (apiError) {
        console.error('API 호출 실패, 로컬 데이터 사용:', apiError);
        
        // 로컬 스토리지에서 데이터 가져오기 시도
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        if (savedRolePermissions) {
          const parsedRolePermissions = JSON.parse(savedRolePermissions);
          if (parsedRolePermissions[roleId]) {
            return { roleId, permissions: parsedRolePermissions[roleId] };
          }
        }
        
        // 로컬 스토리지에 데이터가 없으면 기본 데이터 사용
        if (defaultRolePermissions[roleId]) {
          // 로컬 스토리지에 저장
          const rolePermissionsToSave = savedRolePermissions ? JSON.parse(savedRolePermissions) : {};
          rolePermissionsToSave[roleId] = defaultRolePermissions[roleId];
          localStorage.setItem('rolePermissions', JSON.stringify(rolePermissionsToSave));
          
          return { roleId, permissions: defaultRolePermissions[roleId] };
        }
        
        // 기본 데이터에도 없으면 빈 배열 반환
        return { roleId, permissions: [] };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || '권한 정보를 불러오는데 실패했습니다.');
    }
  }
);

export const createRole = createAsyncThunk(
  'permissions/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      try {
        // API 호출 시도
        const response = await apiService.permissions.createRole(roleData);
        return response.data;
      } catch (apiError) {
        console.error('API 호출 실패, 로컬 데이터 사용:', apiError);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        let roles = [];
        
        if (savedRoles) {
          roles = JSON.parse(savedRoles);
        }
        
        // 새 ID 생성 (기존 ID 중 최대값 + 1)
        const newId = roles.length > 0 ? Math.max(...roles.map(role => role.id)) + 1 : 1;
        
        // 새 데이터 생성
        const newRole = {
          ...roleData,
          id: newId,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify([...roles, newRole]));
        
        return newRole;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || '역할 생성에 실패했습니다.');
    }
  }
);

export const updateRole = createAsyncThunk(
  'permissions/updateRole',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      try {
        // API 호출 시도
        const response = await apiService.permissions.updateRole(id, data);
        return response.data;
      } catch (apiError) {
        console.error('API 호출 실패, 로컬 데이터 사용:', apiError);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        if (!savedRoles) {
          throw new Error('로컬 데이터가 없습니다.');
        }
        
        const roles = JSON.parse(savedRoles);
        const roleIndex = roles.findIndex(role => role.id === id);
        
        if (roleIndex === -1) {
          throw new Error('해당 ID의 역할을 찾을 수 없습니다.');
        }
        
        // 데이터 업데이트
        const updatedRole = { ...roles[roleIndex], ...data, id };
        roles[roleIndex] = updatedRole;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify(roles));
        
        return updatedRole;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || '역할 업데이트에 실패했습니다.');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'permissions/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      try {
        // API 호출 시도
        await apiService.permissions.deleteRole(id);
        return id;
      } catch (apiError) {
        console.error('API 호출 실패, 로컬 데이터 사용:', apiError);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        if (!savedRoles) {
          throw new Error('로컬 데이터가 없습니다.');
        }
        
        const roles = JSON.parse(savedRoles);
        
        // 데이터 삭제
        const updatedRoles = roles.filter(role => role.id !== id);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        
        // 역할 권한 정보도 삭제
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        if (savedRolePermissions) {
          const rolePermissions = JSON.parse(savedRolePermissions);
          delete rolePermissions[id];
          localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
        }
        
        return id;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || '역할 삭제에 실패했습니다.');
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  'permissions/updateRolePermissions',
  async ({ roleId, permissions }, { rejectWithValue }) => {
    try {
      try {
        // API 호출 시도
        const response = await apiService.permissions.updateRolePermissions(roleId, permissions);
        return { roleId, permissions: response.data };
      } catch (apiError) {
        console.error('API 호출 실패, 로컬 데이터 사용:', apiError);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        let rolePermissionsData = {};
        
        if (savedRolePermissions) {
          rolePermissionsData = JSON.parse(savedRolePermissions);
        }
        
        // 데이터 업데이트
        rolePermissionsData[roleId] = permissions;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('rolePermissions', JSON.stringify(rolePermissionsData));
        
        return { roleId, permissions };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || '권한 업데이트에 실패했습니다.');
    }
  }
);

// 초기 상태
const initialState = {
  roles: [],
  rolePermissions: {}, // { roleId: [permissionIds] }
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedRoleId: null,
};

// 슬라이스 생성
const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setSelectedRoleId: (state, action) => {
      state.selectedRoleId = action.payload;
    },
    clearSelectedRoleId: (state) => {
      state.selectedRoleId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '역할 정보를 불러오는데 실패했습니다.';
      })
      
      // fetchRolePermissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { roleId, permissions } = action.payload;
        state.rolePermissions[roleId] = permissions;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '권한 정보를 불러오는데 실패했습니다.';
      })
      
      // createRole
      .addCase(createRole.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '역할 생성에 실패했습니다.';
      })
      
      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '역할 업데이트에 실패했습니다.';
      })
      
      // deleteRole
      .addCase(deleteRole.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = state.roles.filter(role => role.id !== action.payload);
        // 삭제된 역할의 권한 정보도 제거
        delete state.rolePermissions[action.payload];
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '역할 삭제에 실패했습니다.';
      })
      
      // updateRolePermissions
      .addCase(updateRolePermissions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { roleId, permissions } = action.payload;
        state.rolePermissions[roleId] = permissions;
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '권한 업데이트에 실패했습니다.';
      });
  },
});

// 액션 생성자 내보내기
export const { setSelectedRoleId, clearSelectedRoleId, clearError } = permissionsSlice.actions;

// 선택자 함수 내보내기
export const selectAllRoles = (state) => state.permissions.roles;
export const selectRoleById = (state, roleId) => 
  state.permissions.roles.find(role => role.id === roleId);
export const selectRolePermissions = (state, roleId) => 
  state.permissions.rolePermissions[roleId] || [];
export const selectPermissionsStatus = (state) => state.permissions.status;
export const selectPermissionsError = (state) => state.permissions.error;
export const selectSelectedRoleId = (state) => state.permissions.selectedRoleId;

// 리듀서 내보내기
export default permissionsSlice.reducer;
