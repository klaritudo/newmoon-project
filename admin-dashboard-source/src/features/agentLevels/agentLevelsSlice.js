import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// 비동기 액션 생성
export const fetchAgentLevels = createAsyncThunk(
  'agentLevels/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // API 호출 시도 (DB가 유일한 데이터 소스)
      const response = await apiService.agentLevels.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || '데이터를 불러오는데 실패했습니다.');
    }
  }
);

export const createAgentLevel = createAsyncThunk(
  'agentLevels/create',
  async (levelData, { rejectWithValue }) => {
    try {
      const response = await apiService.agentLevels.create(levelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAgentLevel = createAsyncThunk(
  'agentLevels/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.agentLevels.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAgentLevel = createAsyncThunk(
  'agentLevels/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.agentLevels.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 초기 상태
const initialState = {
  levels: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedLevel: null,
};

// 슬라이스 생성
const agentLevelsSlice = createSlice({
  name: 'agentLevels',
  initialState,
  reducers: {
    setSelectedLevel: (state, action) => {
      state.selectedLevel = action.payload;
    },
    clearSelectedLevel: (state) => {
      state.selectedLevel = null;
    },
    setLevels: (state, action) => {
      state.levels = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAgentLevels
      .addCase(fetchAgentLevels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgentLevels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.levels = action.payload;
      })
      .addCase(fetchAgentLevels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '단계 정보를 불러오는데 실패했습니다.';
      })
      
      // createAgentLevel
      .addCase(createAgentLevel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAgentLevel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.levels.push(action.payload);
      })
      .addCase(createAgentLevel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '단계 생성에 실패했습니다.';
      })
      
      // updateAgentLevel
      .addCase(updateAgentLevel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAgentLevel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.levels.findIndex(level => level.id === action.payload.id);
        if (index !== -1) {
          state.levels[index] = action.payload;
        }
      })
      .addCase(updateAgentLevel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '단계 업데이트에 실패했습니다.';
      })
      
      // deleteAgentLevel
      .addCase(deleteAgentLevel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAgentLevel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.levels = state.levels.filter(level => level.id !== action.payload);
      })
      .addCase(deleteAgentLevel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '단계 삭제에 실패했습니다.';
      });
  },
});

// 액션 생성자 내보내기
export const { setSelectedLevel, clearSelectedLevel, setLevels, clearError } = agentLevelsSlice.actions;

// 선택자 함수 내보내기
export const selectAllLevels = (state) => state.agentLevels.levels;
export const selectLevelById = (state, levelId) => 
  state.agentLevels.levels.find(level => level.id === levelId);
export const selectLevelStatus = (state) => state.agentLevels.status;
export const selectLevelError = (state) => state.agentLevels.error;
export const selectSelectedLevel = (state) => state.agentLevels.selectedLevel;

// 리듀서 내보내기
export default agentLevelsSlice.reducer;
