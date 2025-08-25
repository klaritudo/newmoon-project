import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  getDateRangeByPreset, 
  validateDateRange, 
  formatDateRangeForAPI,
  DATE_RANGE_PRESETS,
  createDate
} from '../utils/enhancedDateUtils';

// 액션 타입
const DateFilterActionTypes = {
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  SET_COMPARISON_RANGE: 'SET_COMPARISON_RANGE',
  APPLY_PRESET: 'APPLY_PRESET',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
  ENABLE_COMPARISON: 'ENABLE_COMPARISON',
  DISABLE_COMPARISON: 'DISABLE_COMPARISON'
};

// 초기 상태
const initialState = {
  // 기본 날짜 범위
  primary: {
    startDate: null,
    endDate: null,
    preset: null,
    isValid: false
  },
  
  // 비교 날짜 범위
  comparison: {
    startDate: null,
    endDate: null,
    isValid: false,
    enabled: false
  },
  
  // UI 상태
  loading: false,
  error: null,
  
  // 설정
  config: {
    timezone: 'Asia/Seoul',
    maxRange: 365,
    autoApply: false
  }
};

// 리듀서
const dateFilterReducer = (state, action) => {
  switch (action.type) {
    case DateFilterActionTypes.SET_DATE_RANGE: {
      const { startDate, endDate, preset } = action.payload;
      const validation = validateDateRange(startDate, endDate);
      
      return {
        ...state,
        primary: {
          startDate,
          endDate,
          preset: preset || null,
          isValid: validation.isValid
        },
        error: validation.isValid ? null : validation.error
      };
    }
    
    case DateFilterActionTypes.SET_COMPARISON_RANGE: {
      const { startDate, endDate } = action.payload;
      const validation = validateDateRange(startDate, endDate);
      
      return {
        ...state,
        comparison: {
          ...state.comparison,
          startDate,
          endDate,
          isValid: validation.isValid
        }
      };
    }
    
    case DateFilterActionTypes.APPLY_PRESET: {
      const { preset, target = 'primary' } = action.payload;
      const range = getDateRangeByPreset(preset, state.config.timezone);
      
      if (target === 'comparison') {
        return {
          ...state,
          comparison: {
            ...state.comparison,
            startDate: range.startDate,
            endDate: range.endDate,
            isValid: true
          }
        };
      }
      
      return {
        ...state,
        primary: {
          startDate: range.startDate,
          endDate: range.endDate,
          preset,
          isValid: true
        },
        error: null
      };
    }
    
    case DateFilterActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case DateFilterActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case DateFilterActionTypes.ENABLE_COMPARISON:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          enabled: true
        }
      };
    
    case DateFilterActionTypes.DISABLE_COMPARISON:
      return {
        ...state,
        comparison: {
          ...initialState.comparison,
          enabled: false
        }
      };
    
    case DateFilterActionTypes.RESET:
      return {
        ...state,
        primary: initialState.primary,
        comparison: {
          ...initialState.comparison,
          enabled: state.comparison.enabled
        },
        error: null,
        loading: false
      };
    
    default:
      return state;
  }
};

// 컨텍스트 생성
const DateFilterContext = createContext(null);

/**
 * 날짜 필터 프로바이더 컴포넌트
 * 전역적으로 날짜 필터 상태를 관리하고 공유
 */
export const DateFilterProvider = ({ 
  children, 
  initialPreset = DATE_RANGE_PRESETS.TODAY,
  enableComparison = false,
  timezone = 'Asia/Seoul',
  maxRange = 365,
  autoApply = false,
  onDateChange = null
}) => {
  
  // 초기 상태 설정
  const getInitialStateWithConfig = useMemo(() => {
    const state = { ...initialState };
    
    // 설정 적용
    state.config = {
      timezone,
      maxRange,
      autoApply
    };
    
    // 비교 모드 설정
    state.comparison.enabled = enableComparison;
    
    // 초기 프리셋 적용
    if (initialPreset) {
      const range = getDateRangeByPreset(initialPreset, timezone);
      state.primary = {
        startDate: range.startDate,
        endDate: range.endDate,
        preset: initialPreset,
        isValid: true
      };
    }
    
    return state;
  }, [initialPreset, enableComparison, timezone, maxRange, autoApply]);
  
  const [state, dispatch] = useReducer(dateFilterReducer, getInitialStateWithConfig);
  
  // 액션 생성자들
  const actions = useMemo(() => ({
    
    // 날짜 범위 설정
    setDateRange: (startDate, endDate, preset = null) => {
      dispatch({
        type: DateFilterActionTypes.SET_DATE_RANGE,
        payload: { startDate, endDate, preset }
      });
    },
    
    // 비교 날짜 범위 설정
    setComparisonRange: (startDate, endDate) => {
      dispatch({
        type: DateFilterActionTypes.SET_COMPARISON_RANGE,
        payload: { startDate, endDate }
      });
    },
    
    // 프리셋 적용
    applyPreset: (preset, target = 'primary') => {
      dispatch({
        type: DateFilterActionTypes.APPLY_PRESET,
        payload: { preset, target }
      });
    },
    
    // 시작일 설정
    setStartDate: (date) => {
      dispatch({
        type: DateFilterActionTypes.SET_DATE_RANGE,
        payload: {
          startDate: date ? createDate(date, timezone) : null,
          endDate: state.primary.endDate,
          preset: null
        }
      });
    },
    
    // 종료일 설정
    setEndDate: (date) => {
      dispatch({
        type: DateFilterActionTypes.SET_DATE_RANGE,
        payload: {
          startDate: state.primary.startDate,
          endDate: date ? createDate(date, timezone) : null,
          preset: null
        }
      });
    },
    
    // 로딩 상태 설정
    setLoading: (loading) => {
      dispatch({
        type: DateFilterActionTypes.SET_LOADING,
        payload: loading
      });
    },
    
    // 에러 설정
    setError: (error) => {
      dispatch({
        type: DateFilterActionTypes.SET_ERROR,
        payload: error
      });
    },
    
    // 비교 모드 활성화
    enableComparison: () => {
      dispatch({ type: DateFilterActionTypes.ENABLE_COMPARISON });
    },
    
    // 비교 모드 비활성화
    disableComparison: () => {
      dispatch({ type: DateFilterActionTypes.DISABLE_COMPARISON });
    },
    
    // 초기화
    reset: () => {
      dispatch({ type: DateFilterActionTypes.RESET });
    }
    
  }), [state.primary.startDate, state.primary.endDate, timezone]);
  
  // 선택기들 (computed values)
  const selectors = useMemo(() => ({
    
    // 기본 날짜 범위 (API 형식)
    getPrimaryApiFormat: () => {
      if (!state.primary.isValid) return null;
      return formatDateRangeForAPI(
        state.primary.startDate, 
        state.primary.endDate, 
        timezone
      );
    },
    
    // 비교 날짜 범위 (API 형식)
    getComparisonApiFormat: () => {
      if (!state.comparison.enabled || !state.comparison.isValid) return null;
      return formatDateRangeForAPI(
        state.comparison.startDate,
        state.comparison.endDate,
        timezone
      );
    },
    
    // 요약 정보
    getSummary: () => {
      if (!state.primary.isValid) return null;
      
      const duration = state.primary.endDate.diff(state.primary.startDate, 'day') + 1;
      const startStr = state.primary.startDate.format('YYYY-MM-DD');
      const endStr = state.primary.endDate.format('YYYY-MM-DD');
      
      return {
        display: `${startStr} ~ ${endStr}`,
        duration,
        durationText: `${duration}일간`,
        preset: state.primary.preset,
        isPreset: !!state.primary.preset
      };
    },
    
    // 비교 요약 정보
    getComparisonSummary: () => {
      if (!state.comparison.enabled || !state.comparison.isValid) return null;
      
      const duration = state.comparison.endDate.diff(state.comparison.startDate, 'day') + 1;
      const startStr = state.comparison.startDate.format('YYYY-MM-DD');
      const endStr = state.comparison.endDate.format('YYYY-MM-DD');
      
      return {
        display: `${startStr} ~ ${endStr}`,
        duration,
        durationText: `${duration}일간`
      };
    },
    
    // 전체 상태
    getState: () => state,
    
    // 유효성 검사
    isValid: () => state.primary.isValid,
    isComparisonValid: () => state.comparison.enabled ? state.comparison.isValid : true,
    
    // 로딩 상태
    isLoading: () => state.loading,
    
    // 에러 상태
    getError: () => state.error
    
  }), [state, timezone]);
  
  // 통합 액션 (복잡한 로직)
  const complexActions = useMemo(() => ({
    
    // 날짜 범위 적용 (콜백 포함)
    applyDateRange: useCallback(async () => {
      if (!state.primary.isValid) return false;
      
      actions.setLoading(true);
      actions.setError(null);
      
      try {
        if (onDateChange) {
          await onDateChange({
            primary: {
              startDate: state.primary.startDate,
              endDate: state.primary.endDate,
              preset: state.primary.preset
            },
            comparison: state.comparison.enabled && state.comparison.isValid ? {
              startDate: state.comparison.startDate,
              endDate: state.comparison.endDate
            } : null
          });
        }
        
        actions.setLoading(false);
        return true;
      } catch (error) {
        actions.setError(error.message || '날짜 범위 적용 중 오류가 발생했습니다.');
        return false;
      }
    }, [state, onDateChange, actions]),
    
    // 빠른 프리셋 적용 (기본 + 비교)
    applyQuickPreset: useCallback((preset, includeComparison = false) => {
      actions.applyPreset(preset, 'primary');
      
      if (includeComparison && state.comparison.enabled) {
        // 비교 기간을 동일한 기간만큼 이전으로 설정
        const range = getDateRangeByPreset(preset, timezone);
        const duration = range.endDate.diff(range.startDate, 'day');
        const comparisonStart = range.startDate.subtract(duration + 1, 'day');
        const comparisonEnd = range.endDate.subtract(duration + 1, 'day');
        
        actions.setComparisonRange(comparisonStart, comparisonEnd);
      }
      
      // 자동 적용이 활성화된 경우
      if (autoApply) {
        setTimeout(() => {
          complexActions.applyDateRange();
        }, 100);
      }
    }, [actions, state.comparison.enabled, timezone, autoApply]),
    
    // 범위 검증
    validateRange: useCallback((startDate, endDate) => {
      const validation = validateDateRange(startDate, endDate);
      
      if (!validation.isValid) {
        actions.setError(validation.error);
        return false;
      }
      
      // 최대 범위 검증
      if (maxRange) {
        const duration = endDate.diff(startDate, 'day') + 1;
        if (duration > maxRange) {
          const error = `날짜 범위는 최대 ${maxRange}일까지만 설정할 수 있습니다.`;
          actions.setError(error);
          return false;
        }
      }
      
      actions.setError(null);
      return true;
    }, [actions, maxRange])
    
  }), [state, actions, timezone, autoApply, onDateChange, maxRange]);
  
  // 컨텍스트 값
  const contextValue = useMemo(() => ({
    // 상태
    state,
    
    // 기본 액션
    ...actions,
    
    // 복합 액션
    ...complexActions,
    
    // 선택기
    ...selectors,
    
    // 설정
    config: state.config
    
  }), [state, actions, complexActions, selectors]);
  
  return (
    <DateFilterContext.Provider value={contextValue}>
      {children}
    </DateFilterContext.Provider>
  );
};

DateFilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialPreset: PropTypes.string,
  enableComparison: PropTypes.bool,
  timezone: PropTypes.string,
  maxRange: PropTypes.number,
  autoApply: PropTypes.bool,
  onDateChange: PropTypes.func
};

/**
 * 날짜 필터 컨텍스트 사용 훅
 */
export const useDateFilterContext = () => {
  const context = useContext(DateFilterContext);
  
  if (!context) {
    throw new Error('useDateFilterContext must be used within a DateFilterProvider');
  }
  
  return context;
};

/**
 * 날짜 필터 상태만 가져오는 훅
 */
export const useDateFilterState = () => {
  const { state, isValid, isLoading, getError } = useDateFilterContext();
  
  return {
    dateRange: state.primary,
    comparisonRange: state.comparison,
    isValid: isValid(),
    isLoading: isLoading(),
    error: getError()
  };
};

/**
 * 날짜 필터 액션만 가져오는 훅
 */
export const useDateFilterActions = () => {
  const context = useDateFilterContext();
  
  const {
    state,
    config,
    getSummary,
    getComparisonSummary,
    getPrimaryApiFormat,
    getComparisonApiFormat,
    ...actions
  } = context;
  
  return actions;
};

export default DateFilterContext;