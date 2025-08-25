import { useState, useCallback } from 'react';

/**
 * 테이블 필터 상태와 기능을 관리하는 커스텀 훅
 * 
 * @param {Object} options - 훅 옵션
 * @param {Object} options.initialFilters - 초기 필터 상태 (기본값: {})
 * @param {Function} options.onFilterChange - 필터 변경 시 호출될 콜백 함수
 * @param {boolean} options.initialDateFilterActive - 초기 날짜 필터 활성화 상태 (기본값: false)
 * @param {Object} options.initialDateRange - 초기 날짜 범위 (기본값: { startDate: null, endDate: null })
 * @returns {Object} 필터 관련 상태와 핸들러 함수들
 */
const useTableFilter = (options = {}) => {
  const {
    initialFilters = {},
    onFilterChange,
    initialDateFilterActive = false,
    initialDateRange = { startDate: null, endDate: null }
  } = options;

  // 필터 상태 관리
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  
  // 날짜 필터 상태 관리
  const [isDateFilterActive, setDateFilterActive] = useState(initialDateFilterActive);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [isDateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  
  /**
   * 필터 값 변경 핸들러
   * 
   * @param {string} filterId - 필터 식별자
   * @param {string} value - 새 필터 값
   */
  const handleFilterChange = useCallback((filterId, value) => {
    // console.log('useTableFilter - handleFilterChange 호출:', { filterId, value, prevFilters: activeFilters });
    
    const newFilters = {
      ...activeFilters,
      [filterId]: value
    };
    
    setActiveFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  }, [activeFilters, onFilterChange]);
  
  /**
   * 날짜 필터 열기
   */
  const handleOpenDateFilter = useCallback((event) => {
    setDateFilterAnchorEl(event.currentTarget);
    setDateFilterOpen(true);
  }, []);
  
  /**
   * 날짜 필터 닫기
   */
  const handleCloseDateFilter = useCallback(() => {
    setDateFilterAnchorEl(null);
    setDateFilterOpen(false);
  }, []);
  
  /**
   * 날짜 범위 설정
   * 
   * @param {Object} newDateRange - 새 날짜 범위 ({ startDate, endDate })
   */
  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
    setDateFilterActive(true);
    setDateFilterOpen(false);
    
    if (onFilterChange) {
      onFilterChange({
        ...activeFilters,
        dateRange: newDateRange
      });
    }
  }, [activeFilters, onFilterChange]);
  
  /**
   * 날짜 필터 초기화
   */
  const resetDateFilter = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
    setDateFilterActive(false);
    
    if (onFilterChange) {
      const { dateRange, ...filtersWithoutDate } = activeFilters;
      onFilterChange(filtersWithoutDate);
    }
  }, [activeFilters, onFilterChange]);
  
  /**
   * 모든 필터 초기화
   */
  const resetAllFilters = useCallback(() => {
    setActiveFilters({});
    setDateRange({ startDate: null, endDate: null });
    setDateFilterActive(false);
    
    if (onFilterChange) {
      onFilterChange({});
    }
  }, [onFilterChange]);

  // 계층형 데이터 필터링 최적화
  const filterHierarchicalData = useCallback((data, filters) => {
    if (!data || data.length === 0) return [];
    
    const filterItem = (item) => {
      // 현재 항목이 필터 조건을 만족하는지 확인
      const matchesFilter = Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;
        
        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;
        
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      });
      
      // 자식 항목들 재귀적으로 필터링
      let filteredChildren = [];
      if (item.children && item.children.length > 0) {
        filteredChildren = item.children
          .map(child => filterItem(child))
          .filter(child => child !== null);
      }
      
      // 현재 항목이 조건을 만족하거나 자식 중 하나라도 조건을 만족하면 포함
      if (matchesFilter || filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren
        };
      }
      
      return null;
    };
    
    return data
      .map(item => filterItem(item))
      .filter(item => item !== null);
  }, []);

  return {
    activeFilters,
    setActiveFilters,
    handleFilterChange,
    isDateFilterActive,
    isDateFilterOpen,
    dateFilterAnchorEl,
    dateRange,
    handleOpenDateFilter,
    handleCloseDateFilter,
    handleDateRangeChange,
    resetDateFilter,
    resetAllFilters,
    filterHierarchicalData
  };
};

export default useTableFilter; 