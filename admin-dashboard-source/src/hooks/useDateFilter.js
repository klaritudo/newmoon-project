import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  getDateRangeByPreset, 
  validateDateRange, 
  formatDateRangeForAPI,
  DATE_RANGE_PRESETS,
  now,
  createDate
} from '../utils/enhancedDateUtils';

/**
 * 날짜 필터 상태 관리 훅
 * 날짜 필터의 상태와 로직을 캡슐화하여 재사용 가능한 형태로 제공
 */
export const useDateFilter = ({
  // 초기 설정
  initialPreset = DATE_RANGE_PRESETS.TODAY,
  initialStartDate = null,
  initialEndDate = null,
  
  // 옵션
  enableComparison = false,
  autoApply = false, // 변경 시 자동 적용 여부
  persistKey = null, // 로컬 스토리지 키 (null이면 저장하지 않음)
  
  // 콜백
  onDateChange = null,
  onValidationError = null,
  
  // 제한
  maxRange = 365,
  timezone = 'Asia/Seoul'
} = {}) => {
  
  // 로컬 스토리지에서 초기값 복원
  const getInitialState = useCallback(() => {
    if (persistKey) {
      try {
        const stored = localStorage.getItem(`dateFilter_${persistKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            startDate: parsed.startDate ? createDate(parsed.startDate, timezone) : null,
            endDate: parsed.endDate ? createDate(parsed.endDate, timezone) : null,
            preset: parsed.preset || null,
            isValid: parsed.isValid || false
          };
        }
      } catch (error) {
        console.warn('Failed to restore date filter state:', error);
      }
    }
    
    // 초기 프리셋이 있으면 적용
    if (initialPreset && !initialStartDate && !initialEndDate) {
      const range = getDateRangeByPreset(initialPreset, timezone);
      return {
        startDate: range.startDate,
        endDate: range.endDate,
        preset: initialPreset,
        isValid: true
      };
    }
    
    return {
      startDate: initialStartDate ? createDate(initialStartDate, timezone) : null,
      endDate: initialEndDate ? createDate(initialEndDate, timezone) : null,
      preset: null,
      isValid: !!(initialStartDate && initialEndDate)
    };
  }, [initialPreset, initialStartDate, initialEndDate, persistKey, timezone]);
  
  // 기본 상태
  const [dateRange, setDateRange] = useState(getInitialState);
  
  // 비교 상태
  const [comparisonRange, setComparisonRange] = useState({
    startDate: null,
    endDate: null,
    isValid: false
  });
  
  // 로딩 상태
  const [isApplying, setIsApplying] = useState(false);
  
  // 검증 에러
  const [validationError, setValidationError] = useState(null);
  
  // 변경 감지를 위한 ref
  const previousRangeRef = useRef(dateRange);
  
  // 로컬 스토리지 저장
  const persistState = useCallback((state) => {
    if (persistKey) {
      try {
        const toStore = {
          startDate: state.startDate ? state.startDate.toISOString() : null,
          endDate: state.endDate ? state.endDate.toISOString() : null,
          preset: state.preset,
          isValid: state.isValid
        };
        localStorage.setItem(`dateFilter_${persistKey}`, JSON.stringify(toStore));
      } catch (error) {
        console.warn('Failed to persist date filter state:', error);
      }
    }
  }, [persistKey]);
  
  // 검증 함수
  const validateCurrentRange = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) {
      return { isValid: false, error: null };
    }
    
    const validation = validateDateRange(startDate, endDate);
    if (!validation.isValid) {
      return validation;
    }
    
    // 최대 범위 검증
    if (maxRange) {
      const diffDays = endDate.diff(startDate, 'day') + 1;
      if (diffDays > maxRange) {
        return {
          isValid: false,
          error: `날짜 범위는 최대 ${maxRange}일까지만 설정할 수 있습니다.`
        };
      }
    }
    
    return { isValid: true };
  }, [maxRange]);
  
  // 날짜 범위 설정
  const setDateRange = useCallback((newRange) => {
    const { startDate, endDate, preset } = newRange || {};
    
    // 검증
    const validation = validateCurrentRange(startDate, endDate);
    
    const newState = {
      startDate: startDate || null,
      endDate: endDate || null,
      preset: preset || null,
      isValid: validation.isValid
    };
    
    setDateRange(newState);
    setValidationError(validation.error || null);
    
    // 로컬 스토리지에 저장
    persistState(newState);
    
    // 검증 에러 콜백
    if (validation.error && onValidationError) {
      onValidationError(validation.error);
    }
    
    // 자동 적용
    if (autoApply && validation.isValid && onDateChange) {
      onDateChange(newState);
    }
    
    return validation.isValid;
  }, [validateCurrentRange, persistState, autoApply, onDateChange, onValidationError]);
  
  // 프리셋 적용
  const applyPreset = useCallback((preset) => {
    const range = getDateRangeByPreset(preset, timezone);
    return setDateRange({
      startDate: range.startDate,
      endDate: range.endDate,
      preset
    });
  }, [setDateRange, timezone]);
  
  // 커스텀 날짜 설정
  const setCustomRange = useCallback((startDate, endDate) => {
    return setDateRange({
      startDate: startDate ? createDate(startDate, timezone) : null,
      endDate: endDate ? createDate(endDate, timezone) : null,
      preset: null
    });
  }, [setDateRange, timezone]);
  
  // 시작일만 변경
  const setStartDate = useCallback((date) => {
    return setDateRange({
      ...dateRange,
      startDate: date ? createDate(date, timezone) : null,
      preset: null
    });
  }, [dateRange, setDateRange, timezone]);
  
  // 종료일만 변경
  const setEndDate = useCallback((date) => {
    return setDateRange({
      ...dateRange,
      endDate: date ? createDate(date, timezone) : null,
      preset: null
    });
  }, [dateRange, setDateRange, timezone]);
  
  // 비교 범위 설정 (비교 모드 활성화 시)
  const setComparisonRange = useCallback((newRange) => {
    if (!enableComparison) return false;
    
    const { startDate, endDate } = newRange || {};
    const validation = validateCurrentRange(startDate, endDate);
    
    setComparisonRange({
      startDate: startDate || null,
      endDate: endDate || null,
      isValid: validation.isValid
    });
    
    return validation.isValid;
  }, [enableComparison, validateCurrentRange]);
  
  // 초기화
  const reset = useCallback(() => {
    const initialState = getInitialState();
    setDateRange(initialState);
    setComparisonRange({
      startDate: null,
      endDate: null,
      isValid: false
    });
    setValidationError(null);
    
    if (persistKey) {
      localStorage.removeItem(`dateFilter_${persistKey}`);
    }
  }, [getInitialState, persistKey]);
  
  // 적용 (수동 적용 모드)
  const apply = useCallback(async () => {
    if (!dateRange.isValid || !onDateChange) return false;
    
    setIsApplying(true);
    
    try {
      await onDateChange(dateRange);
      return true;
    } catch (error) {
      console.error('Failed to apply date filter:', error);
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [dateRange, onDateChange]);
  
  // API 호출용 포맷
  const apiFormat = useMemo(() => {
    if (!dateRange.isValid) return null;
    
    return formatDateRangeForAPI(dateRange.startDate, dateRange.endDate, timezone);
  }, [dateRange, timezone]);
  
  // 비교용 API 포맷
  const comparisonApiFormat = useMemo(() => {
    if (!enableComparison || !comparisonRange.isValid) return null;
    
    return formatDateRangeForAPI(comparisonRange.startDate, comparisonRange.endDate, timezone);
  }, [enableComparison, comparisonRange, timezone]);
  
  // 요약 정보
  const summary = useMemo(() => {
    if (!dateRange.isValid) return null;
    
    const duration = dateRange.endDate.diff(dateRange.startDate, 'day') + 1;
    const startStr = dateRange.startDate.format('YYYY-MM-DD');
    const endStr = dateRange.endDate.format('YYYY-MM-DD');
    
    return {
      display: `${startStr} ~ ${endStr}`,
      duration,
      durationText: `${duration}일간`,
      preset: dateRange.preset,
      isPreset: !!dateRange.preset
    };
  }, [dateRange]);
  
  // 변경 감지 및 콜백 호출
  useEffect(() => {
    const previous = previousRangeRef.current;
    const current = dateRange;
    
    // 날짜 범위가 변경되었고, 자동 적용이 아닌 경우에만 콜백 호출
    if (!autoApply && 
        current.isValid && 
        (previous.startDate?.valueOf() !== current.startDate?.valueOf() ||
         previous.endDate?.valueOf() !== current.endDate?.valueOf())) {
      
      if (onDateChange) {
        onDateChange(current);
      }
    }
    
    previousRangeRef.current = current;
  }, [dateRange, autoApply, onDateChange]);
  
  return {
    // 기본 상태
    dateRange,
    comparisonRange,
    validationError,
    isApplying,
    
    // 검증 결과
    isValid: dateRange.isValid,
    isComparisonValid: comparisonRange.isValid,
    
    // 액션
    setDateRange,
    applyPreset,
    setCustomRange,
    setStartDate,
    setEndDate,
    setComparisonRange,
    reset,
    apply,
    
    // 유틸리티
    apiFormat,
    comparisonApiFormat,
    summary,
    
    // 검증 함수
    validateRange: validateCurrentRange
  };
};

/**
 * 날짜 필터 컨텍스트를 위한 훅
 * 전역 상태로 날짜 필터를 관리할 때 사용
 */
export const useDateFilterContext = () => {
  // Context에서 값을 가져오는 로직을 여기에 구현
  // 예: const context = useContext(DateFilterContext);
  // return context;
  
  console.warn('useDateFilterContext is not implemented yet. Use useDateFilter instead.');
  return useDateFilter();
};

export default useDateFilter;