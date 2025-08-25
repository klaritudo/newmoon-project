import { useState, useCallback, useEffect } from 'react';

/**
 * 테이블 페이지네이션 상태와 기능을 관리하는 커스텀 훅
 * 
 * @param {Object} options - 훅 옵션
 * @param {number} options.initialPage - 초기 페이지 (기본값: 0)
 * @param {number} options.initialRowsPerPage - 초기 페이지당 행 수 (기본값: 25)
 * @param {Array<number>} options.rowsPerPageOptions - 페이지당 행 옵션 (기본값: [10, 25, 50, 100])
 * @param {number} options.totalItems - 총 항목 수 (기본값: 0)
 * @param {Function} options.onPageChange - 페이지 변경 시 호출될 콜백 함수
 * @param {Function} options.onRowsPerPageChange - 페이지당 행 수 변경 시 호출될 콜백 함수
 * @param {Function} options.onExcelDownload - 엑셀 다운로드 시 호출될 콜백 함수
 * @param {Function} options.onPrint - 인쇄 시 호출될 콜백 함수
 * @returns {Object} 페이지네이션 관련 상태와 핸들러 함수들
 */
const useTablePagination = (options = {}) => {
  const {
    initialPage = 0,
    initialRowsPerPage = 25,
    rowsPerPageOptions = [10, 25, 50, 100],
    totalItems = 0,
    onPageChange,
    onRowsPerPageChange,
    onExcelDownload,
    onPrint
  } = options;

  // 페이지네이션 상태 관리
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalCount, setTotalCount] = useState(totalItems);
  
  // 총 항목 수가 변경되면 상태 업데이트
  useEffect(() => {
    setTotalCount(totalItems);
  }, [totalItems]);
  
  // 페이지네이션 자동 조정 (데이터 변경 시)
  useEffect(() => {
    if (totalItems > 0) {
      const maxPage = Math.max(0, Math.ceil(totalItems / rowsPerPage) - 1);
      if (page > maxPage) {
        setPage(maxPage);
        onPageChange?.(null, maxPage);
      }
    }
  }, [totalItems, rowsPerPage, page, onPageChange]);
  
  // 페이지 계산 정보
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startItem = page * rowsPerPage + 1;
  const endItem = Math.min((page + 1) * rowsPerPage, totalCount);
  
  /**
   * 페이지 변경 핸들러
   * 
   * @param {Object|Event|null} event - 이벤트 객체 (MUI와 호환)
   * @param {number|null} newPage - 새 페이지 번호
   */
  const handlePageChange = useCallback((event, newPage) => {
    // 매개변수 정규화
    let pageIndex = newPage;
    
    // event가 페이지 번호인 경우(숫자) - 단일 매개변수로 호출된 경우
    if (typeof event === 'number' && newPage === undefined) {
      pageIndex = event;
    }
    // newPage가 없는 경우
    else if (pageIndex === undefined || pageIndex === null) {
      // 현재 페이지 유지
      pageIndex = page;
    }
    
    // console.log(`useTablePagination - 페이지 변경: ${page} -> ${pageIndex} (유효한 페이지 번호: ${typeof pageIndex === 'number'})`);
    
    // 유효한 페이지 번호인지 확인
    if (typeof pageIndex !== 'number') {
      // console.warn('유효하지 않은 페이지 번호입니다:', pageIndex);
      pageIndex = 0; // 기본값으로 첫 페이지
    }
    
    // 페이지 범위 검증 (음수나 최대 페이지 수를 초과하지 않도록)
    pageIndex = Math.max(0, Math.min(pageIndex, Math.ceil(totalCount / rowsPerPage) - 1));
    
    // 페이지 번호가 변경되었을 때만 처리 (불필요한 렌더링 방지)
    if (pageIndex !== page) {
      setPage(pageIndex);
    
    if (onPageChange) {
        // MUI 호환 형식으로 전달 (event, newPage)
        onPageChange(null, pageIndex);
      }
    }
    
    return pageIndex; // 페이지 번호 반환
  }, [onPageChange, page, rowsPerPage, totalCount]);
  
  /**
   * 첫 페이지로 이동
   */
  const goToFirstPage = useCallback(() => {
    handlePageChange(null, 0);
  }, [handlePageChange]);
  
  /**
   * 마지막 페이지로 이동
   */
  const goToLastPage = useCallback(() => {
    handlePageChange(null, totalPages - 1);
  }, [handlePageChange, totalPages]);
  
  /**
   * 이전 페이지로 이동
   */
  const goToPreviousPage = useCallback(() => {
    if (page > 0) {
      handlePageChange(null, page - 1);
    }
  }, [handlePageChange, page]);
  
  /**
   * 다음 페이지로 이동
   */
  const goToNextPage = useCallback(() => {
    if (page < totalPages - 1) {
      handlePageChange(null, page + 1);
    }
  }, [handlePageChange, page, totalPages]);
  
  /**
   * 페이지당 행 수 변경 핸들러
   * 
   * @param {Object} event - 이벤트 객체
   */
  const handleRowsPerPageChange = useCallback((event) => {
    // event가 객체이고 target 속성이 있는지 확인
    let newRowsPerPage;
    
    if (event && event.target && event.target.value) {
      newRowsPerPage = parseInt(event.target.value, 10);
    } else if (typeof event === 'number') {
      // 숫자가 직접 전달된 경우
      newRowsPerPage = event;
    } else if (typeof event === 'object' && typeof event.value === 'number') {
      // {value: number} 형태로 전달된 경우
      newRowsPerPage = event.value;
    } else {
      // 기본값으로 첫 번째 옵션 사용
      newRowsPerPage = rowsPerPageOptions[0];
    }
    
    setRowsPerPage(newRowsPerPage);
    setPage(0); // 페이지당 행 수 변경 시 첫 페이지로 이동
    
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    }
    
    // event 객체에 필요한 값 설정
    const evtObj = {
      target: { value: newRowsPerPage }
    };
    
    // TablePagination 컴포넌트에서 사용하는 형식으로 전달
    return evtObj;
  }, [onRowsPerPageChange, rowsPerPageOptions]);
  
  /**
   * 엑셀 다운로드 핸들러
   * 외부에서 제공된 함수가 있으면 사용하고, 없으면 기본 구현 사용
   */
  const handleExcelDownload = useCallback(() => {
    if (onExcelDownload) {
      onExcelDownload();
    } else {
    // console.log('엑셀 다운로드 기능이 호출되었습니다.');
      // 기본 엑셀 다운로드 로직
    }
  }, [onExcelDownload]);
  
  /**
   * 인쇄 핸들러
   * 외부에서 제공된 함수가 있으면 사용하고, 없으면 기본 구현 사용
   */
  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    } else {
    // console.log('인쇄 기능이 호출되었습니다.');
      // 기본 인쇄 로직
    }
  }, [onPrint]);

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalCount,
    totalPages,
    startItem,
    endItem,
    rowsPerPageOptions,
    handlePageChange,
    handleRowsPerPageChange,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,
    handleExcelDownload,
    handlePrint
  };
};

export default useTablePagination; 