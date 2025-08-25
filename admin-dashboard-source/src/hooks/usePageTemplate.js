import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  useTableFilterAndPagination, 
  useTableHeader, 
  useTableColumnDrag,
  useTableData,
  useTableHeaderFixed,
  useTableAutoHeight,
  useTableResize,
  useColumnVisibility,
  useTable
} from '../components/baseTemplate/hooks';

/**
 * 페이지 템플릿 훅
 * 모든 테이블 페이지에서 공통으로 사용하는 훅들을 통합하여 제공합니다.
 * 
 * @param {Object} config - 설정 객체
 * @param {Array} config.columns - 테이블 컬럼 정의
 * @param {Array} config.data - 테이블 데이터
 * @param {Array} config.filterOptions - 필터 옵션
 * @param {Object} config.tableOptions - 테이블 옵션
 * @param {Object} config.pageOptions - 페이지 옵션
 * @returns {Object} 통합된 테이블 관리 상태와 핸들러
 */
const usePageTemplate = (config = {}) => {
  const {
    columns = [],
    data = [],
    filterOptions = [],
    tableOptions = {},
    pageOptions = {}
  } = config;

  const {
    defaultRowsPerPage = 25,
    hierarchical = false,
    defaultHeight = '500px',
    defaultAutoHeight = true,
    minHeight = 300,
    bottomMargin = 100,
    defaultHiddenColumns = [],
    tableId = 'defaultTable',
    initialSortConfig = { key: 'id', direction: 'desc' }
  } = tableOptions;

  const {
    title = '데이터 목록',
    countLabel = '총 ##count##건',
    searchPlaceholder = '검색...',
    onExcelDownload,
    onPrint
  } = pageOptions;

  // 컬럼 표시/숨김 관련 훅
  const {
    columnVisibility,
    toggleableColumns,
    visibleColumns,
    hiddenColumnsCount,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(columns, {
    defaultHiddenColumns,
    tableId: `${tableId}_columnVisibility`
  });

  // 컬럼 드래그 앤 드롭 관련 훅
  const {
    columns: dragColumns,
    dragInfo,
    pinnedColumns,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateColumns,
    toggleColumnPin,
    resetColumnOrder,
    setDefaultPinnedColumns,
    clearAllPinnedColumns
  } = useTableColumnDrag({
    initialColumns: visibleColumns,
    onColumnOrderChange: (newColumns) => {
      console.log(`${tableId} 컬럼 순서 변경:`, newColumns.map(col => col.id));
    }
  });

  // 테이블 높이 자동 조정 훅
  const {
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight
  } = useTableAutoHeight({
    defaultHeight,
    defaultAutoHeight,
    minHeight,
    bottomMargin
  });

  // 테이블 리사이즈 기능 훅
  const {
    isDragging,
    getResizeHandleProps,
    calculateMaxHeight
  } = useTableResize({
    minHeight: 200,
    maxHeight: null,
    useViewportLimit: true,
    viewportMargin: 50,
    onResize: (newHeight) => {
      if (autoHeight) {
        toggleAutoHeight(false);
      }
      setManualHeight(`${newHeight}px`);
    }
  });

  // 헤더 행 고정 기능 훅
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    zIndex: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });

  // 테이블 통합 관리 훅
  const {
    checkedItems: tableCheckedItems,
    allChecked: tableAllChecked,
    handleCheck: tableHandleCheck,
    handleToggleAll: tableHandleToggleAll,
    expandedRows: tableExpandedRows,
    handleToggleExpand: handleToggleExpand2,
    sortConfig: tableSortConfig,
    handleSort: tableHandleSort,
    updateTableKey: updateTableKeyFunction
  } = useTable({
    data: data,
    initialSortConfig
  });

  // 필터링 및 페이지네이션 훅
  const {
    activeFilters,
    handleFilterChange,
    isDateFilterActive,
    handleOpenDateFilter,
    resetDateFilter,
    dateRange,
    page,
    rowsPerPage,
    totalCount,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    filteredData,
    displayData,
    filterValues,
    handleFilter,
    handleClearFilters
  } = useTableFilterAndPagination({
    columns: dragColumns,
    data: data,
    defaultRowsPerPage,
    hierarchical,
    filterOptions: {
      initialFilters: filterOptions.reduce((acc, option) => {
        acc[option.id] = '';
        return acc;
      }, {})
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: defaultRowsPerPage,
      totalItems: data.length,
      onExcelDownload,
      onPrint
    }
  });

  // 테이블 헤더 훅
  const {
    searchText,
    totalItems,
    sequentialPageNumbers,
    hasPinnedColumns,
    isGridReady,
    handleSearchChange,
    handleClearSearch,
    togglePageNumberMode,
    toggleColumnPin: headerToggleColumnPin,
    setGridReady
  } = useTableHeader({
    initialTotalItems: data.length,
    onSearch: (value) => {
      console.log(`${tableId} 검색: ${value}`);
      if (page !== 0) {
        handlePageChange(null, 0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      console.log(`${tableId} 컬럼 고정 토글: ${hasPinned}`);
      if (hasPinned) {
        setDefaultPinnedColumns();
      } else {
        clearAllPinnedColumns();
      }
    }
  });

  // 컬럼 표시/숨김 다이얼로그 상태
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  const isDisplayOptionsOpen = Boolean(displayOptionsAnchor);

  const handleDisplayOptionsClick = useCallback((anchorElement) => {
    setDisplayOptionsAnchor(anchorElement);
  }, []);

  const handleDisplayOptionsClose = useCallback(() => {
    setDisplayOptionsAnchor(null);
  }, []);

  // 페이지 관련 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(defaultRowsPerPage);

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`${tableId} 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
  }, [currentPage, handlePageChange, tableId]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error(`${tableId} 행 수 변경 이벤트 오류:`, event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`${tableId} 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
  }, [currentRowsPerPage, handleRowsPerPageChange, tableId]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
  }, [currentPage, currentRowsPerPage]);

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  return {
    // 컬럼 관련
    columns: dragColumns,
    columnVisibility,
    toggleableColumns,
    visibleColumns,
    hiddenColumnsCount,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault,
    
    // 드래그 앤 드롭 관련
    dragInfo,
    pinnedColumns,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateColumns,
    toggleColumnPin,
    resetColumnOrder,
    setDefaultPinnedColumns,
    clearAllPinnedColumns,
    
    // 테이블 높이 관련
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight,
    
    // 리사이즈 관련
    isDragging,
    getResizeHandleProps,
    
    // 헤더 고정 관련
    tableHeaderRef,
    getTableHeaderStyles,
    
    // 테이블 상태 관련
    tableCheckedItems,
    tableAllChecked,
    tableHandleCheck,
    tableHandleToggleAll,
    tableExpandedRows,
    handleToggleExpand2,
    tableSortConfig,
    tableHandleSort,
    updateTableKeyFunction,
    
    // 필터링 및 페이지네이션 관련
    activeFilters,
    handleFilterChange,
    isDateFilterActive,
    handleOpenDateFilter,
    resetDateFilter,
    dateRange,
    page,
    rowsPerPage,
    totalCount,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    filteredData,
    displayData,
    filterValues,
    handleFilter,
    handleClearFilters,
    
    // 헤더 관련
    searchText,
    totalItems,
    sequentialPageNumbers,
    hasPinnedColumns,
    isGridReady,
    handleSearchChange,
    handleClearSearch,
    togglePageNumberMode,
    headerToggleColumnPin,
    setGridReady,
    
    // 다이얼로그 관련
    displayOptionsAnchor,
    isDisplayOptionsOpen,
    handleDisplayOptionsClick,
    handleDisplayOptionsClose,
    
    // 페이지 상태 관련
    currentPage,
    currentRowsPerPage,
    handlePageChangeWithLog,
    handleRowsPerPageChangeWithLog,
    tableKey,
    
    // 설정
    tableId,
    title,
    countLabel,
    searchPlaceholder
  };
};

export default usePageTemplate; 