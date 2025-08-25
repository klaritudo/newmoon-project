import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import useTableFilter from './useTableFilter';
import useTablePagination from './useTablePagination';

/**
 * 테이블 필터와 페이지네이션을 통합 관리하는 커스텀 훅
 * useTableFilter와 useTablePagination을 결합하여 필터링과 페이지네이션을 함께 처리합니다.
 * 
 * @param {Object} options - 훅 옵션
 * @param {Object} options.filterOptions - useTableFilter 훅에 전달할 옵션
 * @param {Object} options.paginationOptions - useTablePagination 훅에 전달할 옵션
 * @param {Function} options.onStateChange - 필터 또는 페이지네이션 상태 변경 시 호출될 콜백 함수
 * @param {boolean} options.enableSafeFilters - 안전한 필터 처리 활성화 옵션
 * @returns {Object} 필터와 페이지네이션 관련 상태와 핸들러 함수들
 */
const useTableFilterAndPagination = (options = {}) => {
  const {
    columns = [],
    data = [],
    defaultRowsPerPage = 25,
    hierarchical = false,
    filterOptions = {},
    paginationOptions = {},
    onStateChange,
    enableSafeFilters = true // 안전한 필터 처리 활성화 옵션
  } = options;

  // 각각의 훅의 원래 콜백을 보존
  const originalFilterChange = filterOptions.onFilterChange;
  const originalPageChange = paginationOptions.onPageChange;
  const originalRowsPerPageChange = paginationOptions.onRowsPerPageChange;
  const originalExcelDownload = paginationOptions.onExcelDownload;
  const originalPrint = paginationOptions.onPrint;

  // 초기값 설정
  const initialFilters = filterOptions.initialFilters || {};
  const initialPage = paginationOptions.initialPage || 0;
  
  // 로컬 상태
  const [localPage, setLocalPage] = useState(initialPage);
  const [localFilters, setLocalFilters] = useState(initialFilters);
  
  // 참조값으로 최신 상태 유지
  const localPageRef = useRef(localPage);
  const localFiltersRef = useRef(localFilters);
  const paginationStateRef = useRef(null);
  
  // 상태 업데이트 시 참조값도 함께 업데이트
  useEffect(() => {
    localPageRef.current = localPage;
  }, [localPage]);
  
  useEffect(() => {
    localFiltersRef.current = localFilters;
  }, [localFilters]);
  
  // 통합 상태 변경 핸들러
  const handleStateChange = useCallback((filters, pagination) => {
    if (onStateChange && paginationStateRef.current) {
      onStateChange({
        filters,
        pagination: {
          page: pagination.page,
          rowsPerPage: pagination.rowsPerPage || paginationStateRef.current.rowsPerPage,
          totalCount: paginationStateRef.current.totalCount
        }
      });
    }
  }, [onStateChange]);
  
  // 필터 변경 핸들러
  const handleFilterChange = useCallback((filters) => {
    setLocalFilters(filters);
    
    // 외부에서 제공된 필터 변경 콜백이 있으면 호출
    if (originalFilterChange) {
      originalFilterChange(filters);
    }
    
    // 필터 변경 시 첫 페이지로 이동
    setLocalPage(0);
    
    // 통합 상태 변경 콜백 호출
    handleStateChange(filters, { page: 0 });
  }, [originalFilterChange, handleStateChange]);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event, newPage) => {
    // 매개변수 정규화
    let pageIndex = newPage;
    
    // TablePagination 컴포넌트가 단일 매개변수로 호출한 경우
    if (typeof event === 'number' && newPage === undefined) {
      pageIndex = event;
    }
    // event 객체가 전달된 경우
    else if (typeof event === 'object' && event !== null && newPage === undefined) {
      // console.log('이벤트 객체를 통한 페이지 변경:', event);
      pageIndex = 0; // 기본값
    }
    
    // console.log(`useTableFilterAndPagination - 페이지 변경: ${localPage} -> ${pageIndex}`);
    
    // 유효한 페이지 번호 확인
    if (pageIndex !== undefined && typeof pageIndex === 'number') {
      setLocalPage(pageIndex);
    
    // 외부에서 제공된 페이지 변경 콜백이 있으면 호출 (MUI 호환 형식)
    if (originalPageChange) {
        originalPageChange(null, pageIndex);
    }
    
    // 통합 상태 변경 콜백 호출
      handleStateChange(localFiltersRef.current, { page: pageIndex });
    } else {
      // console.warn('useTableFilterAndPagination - 잘못된 페이지 번호:', pageIndex);
    }
  }, [localPage, originalPageChange, handleStateChange, localFiltersRef]);
  
  // 행 수 변경 핸들러
  const handleRowsPerPageChange = useCallback((event) => {
    // 직접 숫자 값이 전달된 경우
    if (typeof event === 'number') {
      const newRowsPerPage = event;
      setLocalPage(0);
      
      // 외부에서 제공된 페이지당 행 수 변경 콜백이 있으면 호출
      if (originalRowsPerPageChange) {
        originalRowsPerPageChange(newRowsPerPage);
      }
      
      // 통합 상태 변경 콜백 호출
      handleStateChange(localFiltersRef.current, { page: 0, rowsPerPage: newRowsPerPage });
      return;
    }
    
    // 이벤트 객체에서 추출
    let newRowsPerPage;
    
    if (event && event.target && event.target.value) {
      newRowsPerPage = parseInt(event.target.value, 10);
    } else if (event && typeof event.value === 'number') {
      newRowsPerPage = event.value;
    } else {
      // console.warn('useTableFilterAndPagination - 잘못된 행 수 변경 이벤트:', event);
      return;
    }
    
    // console.log(`useTableFilterAndPagination - 페이지당 행 수 변경: ${paginationStateRef.current?.rowsPerPage} -> ${newRowsPerPage}`);
    
    setLocalPage(0);
    
    // 외부에서 제공된 페이지당 행 수 변경 콜백이 있으면 호출
    if (originalRowsPerPageChange) {
      originalRowsPerPageChange(newRowsPerPage);
    }
    
    // 통합 상태 변경 콜백 호출
    handleStateChange(localFiltersRef.current, { page: 0, rowsPerPage: newRowsPerPage });
  }, [localFiltersRef, originalRowsPerPageChange, handleStateChange, paginationStateRef]);
  
  // 필터 훅 사용
  const filterState = useTableFilter({
    ...filterOptions,
    initialFilters: localFilters,
    onFilterChange: handleFilterChange
  });
  
  // 총 아이템 수 상태 관리
  const [totalItems, setTotalItems] = useState(0);

  // 페이지네이션 훅 사용
  const paginationState = useTablePagination({
    ...paginationOptions,
    initialPage: localPage,
    initialRowsPerPage: paginationOptions.initialRowsPerPage || defaultRowsPerPage,
    totalItems: totalItems,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
    onExcelDownload: originalExcelDownload,
    onPrint: originalPrint
  });
  
  // 페이지네이션 상태 참조값 업데이트
  useEffect(() => {
    paginationStateRef.current = paginationState;
    
    // 컴포넌트 마운트 시 초기 상태 알림
    if (onStateChange) {
      onStateChange({
        filters: localFilters,
        pagination: {
          page: localPage,
          rowsPerPage: paginationState.rowsPerPage,
          totalCount: paginationState.totalCount
        }
      });
    }
  }, [paginationState, onStateChange, localFilters, localPage]);
  
  // 필터와 페이지네이션 모두 초기화
  const resetAllFiltersAndPagination = useCallback(() => {
    filterState.resetAllFilters();
    paginationState.setPage(0);
    setLocalPage(0);
    setLocalFilters({});
    
    // 초기화 후 상태 변경 알림
    if (onStateChange) {
      onStateChange({
        filters: {},
        pagination: {
          page: 0,
          rowsPerPage: paginationState.rowsPerPage,
          totalCount: paginationState.totalCount
        }
      });
    }
  }, [filterState, paginationState, onStateChange]);
  
  // handleFilter 함수 정의 (객체 형태의 필터를 받아서 처리)
  const handleFilter = useCallback((filters) => {
    // 각 필터를 개별적으로 처리
    Object.entries(filters).forEach(([key, value]) => {
      filterState.handleFilterChange(key, value);
    });
  }, [filterState]);
  
  // handleClearFilters 함수 정의
  const handleClearFilters = useCallback(() => {
    if (filterState && filterState.resetAllFilters) {
      filterState.resetAllFilters();
    }
  }, [filterState]);
  
  // 안전한 필터 값 처리 ('all' 값을 빈 문자열로 변환)
  const safeActiveFilters = useMemo(() => {
    if (!enableSafeFilters) return filterState.activeFilters;
    
    const result = { ...filterState.activeFilters };
    
    Object.keys(result).forEach(key => {
      if (result[key] === 'all') {
        result[key] = '';
      }
    });
    
    return result;
  }, [filterState.activeFilters, enableSafeFilters]);


  return {
    // 필터 관련
    ...filterState,
    safeActiveFilters, // 안전한 필터 값 (all -> 빈 문자열 변환)
    
    // 페이지네이션 관련
    ...paginationState,
    
    // 데이터
    filteredData: filterState.filteredData || [],
    totalCount: paginationState.totalCount || totalItems || 0,
    
    // 종합 기능
    resetAllFiltersAndPagination,
    setTotalItems,
    
    // 상태 정보
    currentPage: paginationState.page || 0,
    currentRowsPerPage: paginationState.rowsPerPage || defaultRowsPerPage,
    pageSize: paginationState.rowsPerPage || defaultRowsPerPage,
    
    // 액션 핸들러
    handlePageChange: paginationState.handlePageChange,
    handleRowsPerPageChange: paginationState.handleRowsPerPageChange,
    handleFilterChange,
    handleFilter,
    handleClearFilters,
    resetAllFilters: filterState.resetAllFilters,
    
    // 날짜 필터 관련
    isDateFilterActive: filterState.isDateFilterActive,
    isDateFilterOpen: filterState.isDateFilterOpen,
    dateFilterAnchorEl: filterState.dateFilterAnchorEl,
    dateRange: filterState.dateRange,
    handleOpenDateFilter: filterState.handleOpenDateFilter,
    handleCloseDateFilter: filterState.handleCloseDateFilter,
    handleDateRangeChange: filterState.handleDateRangeChange,
    resetDateFilter: filterState.resetDateFilter,
    
    // 유틸리티 함수
    sequentialPageNumbers: paginationState.sequentialPageNumbers || false,
    togglePageNumberMode: paginationState.togglePageNumberMode
  };
};

export default useTableFilterAndPagination; 