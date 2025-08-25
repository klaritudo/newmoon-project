import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * 테이블 페이지네이션 커스텀 훅
 * AG Grid 및 일반 테이블에서 사용 가능한 페이지네이션 관련 로직을 제공합니다.
 * 
 * @param {Object} options - 훅 옵션
 * @param {number} options.initialPageSize - 초기 페이지 크기 (기본값: 10)
 * @param {number} options.initialPage - 초기 페이지 번호 (0부터 시작, 기본값: 0)
 * @param {number} options.totalItems - 전체 항목 수 (선택적)
 * @param {Array} options.pageSizeOptions - 페이지 크기 옵션 (기본값: [10, 25, 50, 100])
 * @param {Function} options.onPageChange - 페이지 변경 시 호출할 콜백 함수 (선택적)
 * @param {Function} options.onPageSizeChange - 페이지 크기 변경 시 호출할 콜백 함수 (선택적)
 * @param {Object} options.gridRef - AG Grid의 ref 객체 (선택적)
 * @param {boolean} options.serverSidePagination - 서버측 페이지네이션 사용 여부 (기본값: false)
 * @returns {Object} 페이지네이션 관련 상태 및 함수
 */
const useTablePagination = ({
  initialPageSize = 10,
  initialPage = 0,
  totalItems = 0,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  gridRef,
  serverSidePagination = false
}) => {
  // 페이지네이션 상태 관리
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [count, setCount] = useState(totalItems);
  const [loading, setLoading] = useState(false);

  // totalItems가 변경될 때 count 업데이트
  useEffect(() => {
    setCount(totalItems);
  }, [totalItems]);

  // 페이지당 표시되는 항목의 범위 계산
  const getDisplayedRange = useCallback(() => {
    if (count === 0) return { from: 0, to: 0 };
    
    const from = page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, count);
    return { from, to };
  }, [page, pageSize, count]);

  // 현재 표시되는 항목 범위
  const displayedRange = useMemo(() => getDisplayedRange(), [getDisplayedRange]);

  // 총 페이지 수 계산
  const totalPages = useMemo(() => Math.ceil(count / pageSize), [count, pageSize]);

  // 페이지 변경 핸들러
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
    
    // AG Grid API를 통한 페이지 변경 처리
    if (gridRef?.current?.api) {
      gridRef.current.api.paginationGoToPage(newPage);
    }
    
    // 외부 콜백 함수 호출
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [gridRef, onPageChange]);

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback((event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(0); // 페이지 크기 변경 시 첫 페이지로 이동
    
    // AG Grid API를 통한 페이지 크기 변경 처리
    if (gridRef?.current?.api) {
      gridRef.current.api.paginationSetPageSize(newPageSize);
    }
    
    // 외부 콜백 함수 호출
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  }, [gridRef, onPageSizeChange]);

  // AG Grid 페이지네이션 변경 이벤트 핸들러
  const handlePaginationChanged = useCallback(() => {
    if (!gridRef?.current?.api) return;
    
    const newPage = gridRef.current.api.paginationGetCurrentPage();
    const newPageSize = gridRef.current.api.paginationGetPageSize();
    
    // 상태 업데이트 (상태가 다른 경우에만)
    if (page !== newPage) {
      setPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
    
    if (pageSize !== newPageSize) {
      setPageSize(newPageSize);
      if (onPageSizeChange) onPageSizeChange(newPageSize);
    }
    
    // 서버 측 페이지네이션인 경우 전체 항목 수 업데이트
    if (serverSidePagination && gridRef.current.api.paginationGetRowCount) {
      setCount(gridRef.current.api.paginationGetRowCount());
    }
  }, [gridRef, page, pageSize, onPageChange, onPageSizeChange, serverSidePagination]);

  // AG Grid에 설정할 페이지네이션 속성
  const gridPaginationProps = useMemo(() => ({
    pagination: true,
    paginationPageSize: pageSize,
    onPaginationChanged: handlePaginationChanged,
    ...(serverSidePagination ? { paginationAutoPageSize: false } : {})
  }), [pageSize, handlePaginationChanged, serverSidePagination]);

  // 다른 페이지로 이동하는 유틸리티 함수들
  const goToFirstPage = useCallback(() => handleChangePage(null, 0), [handleChangePage]);
  const goToPreviousPage = useCallback(() => handleChangePage(null, Math.max(0, page - 1)), [handleChangePage, page]);
  const goToNextPage = useCallback(() => handleChangePage(null, Math.min(totalPages - 1, page + 1)), [handleChangePage, totalPages, page]);
  const goToLastPage = useCallback(() => handleChangePage(null, Math.max(0, totalPages - 1)), [handleChangePage, totalPages]);
  const goToPage = useCallback((pageNumber) => handleChangePage(null, pageNumber), [handleChangePage]);

  // 초기 페이지 또는 페이지 크기가 변경되었을 때 그리드 업데이트
  useEffect(() => {
    if (gridRef?.current?.api) {
      gridRef.current.api.paginationSetPageSize(pageSize);
      
      // 페이지가 변경되었고, 요청한 페이지가 유효한 경우에만 페이지 변경
      if (page >= 0 && page < totalPages) {
        gridRef.current.api.paginationGoToPage(page);
      } else if (totalPages > 0) {
        // 페이지가 유효하지 않은 경우 첫 페이지로 이동
        setPage(0);
        gridRef.current.api.paginationGoToPage(0);
      }
    }
  }, [initialPage, initialPageSize, gridRef, page, pageSize, totalPages]);

  // 페이지네이션 초기화 함수
  const resetPagination = useCallback(() => {
    setPage(0);
    if (gridRef?.current?.api) {
      gridRef.current.api.paginationGoToPage(0);
    }
  }, [gridRef]);

  // 오프셋 계산 (데이터 API 요청 시 사용)
  const offset = useMemo(() => page * pageSize, [page, pageSize]);

  return {
    // 상태
    page,
    pageSize,
    count,
    totalPages,
    loading,
    displayedRange,
    pageSizeOptions,
    offset,
    
    // 상태 설정 함수
    setPage,
    setPageSize,
    setLoading,
    setCount,
    
    // 이벤트 핸들러
    handleChangePage,
    handlePageSizeChange,
    handlePaginationChanged,
    
    // 유틸리티 함수
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    goToPage,
    resetPagination,
    
    // AG Grid 속성
    gridPaginationProps
  };
};

export default useTablePagination; 