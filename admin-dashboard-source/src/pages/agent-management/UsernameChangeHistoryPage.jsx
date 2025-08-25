import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TableHeightSetting, 
  TableResizeHandle, 
  ColumnVisibilityDialog, 
  PageHeader, 
  PageContainer,
  TableDebugInfo 
} from '../../components/baseTemplate/components';
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
} from '../../components/baseTemplate/hooks';
import { generateUsernameChangeHistoryDataNew } from './data/usernameChangeHistoryDataNew';
import { usernameChangeHistoryColumns } from './data/usernameChangeHistoryColumns';
import usePageData from '../../hooks/usePageData';

/**
 * 아이디바꿔주기내역 페이지
 * 아이디 변경 내역 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const UsernameChangeHistoryPage = () => {
  const theme = useTheme();

  // 범용 페이지 데이터 훅 사용
  const {
    data,
    types,
    typeHierarchy,
    isLoading,
    error,
    isInitialized: typesInitialized
  } = usePageData({
    pageType: 'usernameChangeHistory',
    dataGenerator: generateUsernameChangeHistoryDataNew,
    requiresMembersData: false
  });
  
  // 테이블 높이 자동 조정 - useTableAutoHeight 훅 사용
  const {
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight
  } = useTableAutoHeight({
    defaultHeight: '500px',
    defaultAutoHeight: true,
    minHeight: 300,
    bottomMargin: 100
  });

  // 테이블 리사이즈 기능 - useTableResize 훅 사용
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
  
  // 헤더 행 고정 기능 - useTableHeaderFixed 훅 사용
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    zIndex: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(() => {
    console.log('아이디바꿔주기내역 엑셀 다운로드');
    alert('아이디바꿔주기내역을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('아이디바꿔주기내역 인쇄');
    alert('아이디바꿔주기내역을 인쇄합니다.');
  }, []);

  // 페이지네이션 직접 제어 로직
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // useTable 훅 사용 (체크박스 관련 기능)
  const {
    checkedItems: tableCheckedItems,
    sortConfig: tableSortConfig,
    expandedRows: tableExpandedRows,
    allChecked: tableAllChecked,
    handleSort: tableHandleSort,
    handleCheck: tableHandleCheck,
    handleToggleAll: tableHandleToggleAll,
    handleToggleExpand: tableHandleToggleExpand
  } = useTable({
    data: data,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    const baseOptions = [
      {
        id: 'changeReason',
        label: '변경사유',
        items: [
          { value: '', label: '전체' },
          { value: '사용자 요청', label: '사용자 요청' },
          { value: '보안 정책', label: '보안 정책' },
          { value: '중복 아이디 해결', label: '중복 아이디 해결' },
          { value: '관리자 권한 변경', label: '관리자 권한 변경' },
          { value: '계정 통합', label: '계정 통합' },
          { value: '정책 위반 아이디', label: '정책 위반 아이디' }
        ]
      },
      {
        id: 'gameStatus',
        label: '게임상태',
        items: [
          { value: '', label: '전체' },
          { value: '미접속', label: '미접속' },
          { value: '게임중', label: '게임중' },
          { value: '로비대기', label: '로비대기' }
        ]
      }
    ];
    
    return baseOptions;
  }, []);

  // useTableFilterAndPagination 훅 사용
  const {
    // 필터 관련 상태 및 핸들러
    activeFilters,
    handleFilterChange,
    isDateFilterActive,
    handleOpenDateFilter,
    resetDateFilter,
    dateRange,
    
    // 페이지네이션 관련 상태 및 핸들러
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
    columns: usernameChangeHistoryColumns,
    data: data,
    defaultRowsPerPage: 25,
    hierarchical: false,
    filterOptions: {
      initialFilters: { changeReason: '', gameStatus: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: data.length,
      onExcelDownload: handleExcelDownload,
      onPrint: handlePrint
    }
  });

  // 컬럼 드래그 앤 드롭 관련 훅 사용 (먼저 선언)
  const {
    columns,
    dragInfo,
    pinnedColumns,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateColumns,
    isColumnPinned,
    toggleColumnPin,
    clearAllPinnedColumns,
    setDefaultPinnedColumns
  } = useTableColumnDrag({
    initialColumns: usernameChangeHistoryColumns,
    tableId: 'username_change_history_table',
    initialPinnedColumns: ['no', 'changeDate', 'oldUsername', 'newUsername'],
    onColumnOrderChange: (newColumns) => {
      console.log('아이디바꿔주기내역 테이블 컬럼 순서 변경:', newColumns);
    }
  });

  // TableHeader 훅 사용
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
    setGridReady,
    setHasPinnedColumns
  } = useTableHeader({
    initialTotalItems: data.length,
    onSearch: (value) => {
      console.log(`아이디바꿔주기내역 검색: ${value}`);
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    onToggleColumnPin: (newHasPinned) => {
      console.log(`컬럼 고정 토글 - 새로운 상태: ${newHasPinned}`);
      console.log('현재 pinnedColumns:', pinnedColumns);
      
      if (newHasPinned) {
        // 컬럼을 고정해야 함 (현재 고정된 컬럼이 없음)
        console.log('기본 컬럼 고정 실행...');
        setDefaultPinnedColumns();
      } else {
        // 컬럼 고정을 해제해야 함 (현재 고정된 컬럼이 있음)
        console.log('모든 컬럼 고정 해제 실행...');
        clearAllPinnedColumns();
      }
    }
  });

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  // pinnedColumns 상태 변경 시 hasPinnedColumns 업데이트
  useEffect(() => {
    const hasPinned = pinnedColumns && pinnedColumns.length > 0;
    setHasPinnedColumns(hasPinned);
    console.log('고정 컬럼 상태:', { pinnedColumns, hasPinned });
  }, [pinnedColumns, setHasPinnedColumns]);

  // 컬럼 표시옵션 관련 훅 사용
  const {
    columnVisibility,
    visibleColumns,
    hiddenColumnsCount,
    toggleableColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(columns, {
    defaultHiddenColumns: [],
    alwaysVisibleColumns: ['no', 'changeDate', 'oldUsername', 'newUsername'],
    tableId: 'username_change_history_table'
  });

  // 표시옵션 다이얼로그 상태
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  const isDisplayOptionsOpen = Boolean(displayOptionsAnchor);

  // 표시옵션 버튼 클릭 핸들러
  const handleDisplayOptionsClick = useCallback((anchorElement) => {
    setDisplayOptionsAnchor(anchorElement);
  }, []);

  // 표시옵션 다이얼로그 닫기 핸들러
  const handleDisplayOptionsClose = useCallback(() => {
    setDisplayOptionsAnchor(null);
  }, []);

  // 드래그 앤 드롭 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // 행 클릭 핸들러
  const handleRowClick = (row) => {
    console.log('아이디바꿔주기내역 행 클릭:', row);
  };

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'changeReason':
        if (filterValue === '' || !filterValue) return result;
        return result.filter(item => item.changeReason === filterValue);
        
      case 'gameStatus':
        if (filterValue === '' || !filterValue) return result;
        return result.filter(item => item.gameStatus === filterValue);
        
      case 'date':
        // 날짜 필터 로직 구현
        return result;
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`아이디바꿔주기내역 필터 변경: ${filterId} = ${value}`);
    handleFilterChange(filterId, value);
  }, [handleFilterChange]);
  
  // 안전한 필터 값 설정
  const safeActiveFilters = useMemo(() => {
    const result = { ...activeFilters };
    
    Object.keys(result).forEach(key => {
      if (result[key] === 'all') {
        result[key] = '';
      }
    });
    
    return result;
  }, [activeFilters]);
  
  // useTableData 훅을 사용하여 필터링된 데이터 계산
  const computedFilteredData = useTableData({
    data: data,
    activeFilters: safeActiveFilters,
    searchText,
    isDateFilterActive,
    dateRange,
    filterCallback
  });
  
  // 필터링된 데이터의 ID 목록 생성
  const filteredIds = useMemo(() => {
    return computedFilteredData ? computedFilteredData.map(item => item.id) : [];
  }, [computedFilteredData]);
  
  // 필터링된 데이터 처리
  const filteredFlatData = useMemo(() => {
    // 필터가 적용되지 않았거나 검색어가 없는 경우 모든 데이터 반환
    const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    if (!hasActiveFilters && !hasSearchText) {
      return data;
    }
    
    // 필터가 있는 경우에만 filteredIds로 필터링
    if (!data || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    return data.filter(item => filteredIds.includes(item.id));
  }, [data, filteredIds, safeActiveFilters, searchText]);
  
  // 페이지 관련 효과
  useEffect(() => {
    console.log(`아이디바꿔주기내역 페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산
  const totalFlattenedItems = safeFilteredData.length;
  
  const safeDisplayData = safeFilteredData;

  // 필터링된 데이터가 변경될 때 totalItems 값 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      console.log(`아이디바꿔주기내역 검색/필터 결과: ${safeFilteredData.length}개 항목`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`아이디바꿔주기내역 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`아이디바꿔주기내역 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('아이디바꿔주기내역 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`아이디바꿔주기내역 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`아이디바꿔주기내역 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`아이디바꿔주기내역 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    console.log(`아이디바꿔주기내역 페이지네이션 변수: 페이지=${currentPage}, 행수=${currentRowsPerPage}, 총=${totalFlattenedItems}`);
    return safeFilteredData;
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  // visibleColumns 그대로 사용 (머니이동내역과 동일)
  const finalColumns = visibleColumns;

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
        <PageHeader
          title="아이디바꿔주기내역"
          onDisplayOptionsClick={handleDisplayOptionsClick}
          showAddButton={false}
          showRefreshButton={true}
          onRefreshClick={() => alert('아이디바꿔주기내역 새로고침')}
          sx={{ mb: 2 }}
        />

        {/* 컬럼 표시옵션 다이얼로그 */}
        <ColumnVisibilityDialog
          anchorEl={displayOptionsAnchor}
          open={isDisplayOptionsOpen}
          onClose={handleDisplayOptionsClose}
          toggleableColumns={toggleableColumns}
          columnVisibility={columnVisibility}
          onToggleColumn={toggleColumnVisibility}
          onShowAll={showAllColumns}
          onReset={resetToDefault}
          hiddenColumnsCount={hiddenColumnsCount}
          menuWidth="350px"
        />

        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          
          {/* 테이블 헤더 컴포넌트 */}
          <TableHeader
            title="아이디 변경 이력 목록"
            totalItems={totalFlattenedItems}
            countLabel="총 ##count##건의 내역"
            sequentialPageNumbers={sequentialPageNumbers}
            togglePageNumberMode={togglePageNumberMode}
            hasPinnedColumns={hasPinnedColumns}
            isGridReady={isGridReady}
            toggleColumnPin={headerToggleColumnPin}
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
            showIndentToggle={false}
            showPageNumberToggle={true}
            showColumnPinToggle={true}
            showSearch={true}
            searchPlaceholder="아이디바꿔주기내역 검색..."
            sx={{ mb: 2 }}
          />

          <Box sx={{ width: '100%' }}>
            <TableFilterAndPagination
              filterProps={{
                columns: columns,
                filterValues: filterValues || {},
                activeFilters: safeActiveFilters || {},
                filterOptions: dynamicFilterOptions,
                handleFilterChange: manualHandleFilterChange,
                onFilter: handleFilter,
                onClearFilters: handleClearFilters,
                isDateFilterActive: isDateFilterActive,
                handleOpenDateFilter: handleOpenDateFilter,
                resetDateFilter: resetDateFilter
              }}
              paginationProps={{
                count: totalFlattenedItems,
                page: currentPage,
                rowsPerPage: currentRowsPerPage,
                onPageChange: handlePageChangeWithLog,
                onRowsPerPageChange: handleRowsPerPageChangeWithLog,
                totalCount: totalFlattenedItems,
                onExcelDownload: handleExcelDownload,
                onPrint: handlePrint
              }}
            />
          </Box>
          
          {/* 테이블 콘텐츠 영역 */}
          <Box 
            sx={{ 
              width: '100%', 
              mt: 2
            }} 
            ref={containerRef}
          >
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              현재 페이지: {currentPage + 1} / {Math.ceil(totalFlattenedItems / currentRowsPerPage)} (페이지당 {currentRowsPerPage}행)
              {' - 컬럼을 드래그하여 순서를 변경할 수 있습니다.'}
            </Typography>
            <BaseTable
              key={`username-change-history-table-${tableKey}`}
              columns={finalColumns}
              data={visibleData}
              checkable={false}
              hierarchical={false}
              indentMode={false}
              checkedItems={tableCheckedItems}
              expandedRows={tableExpandedRows}
              allChecked={tableAllChecked}
              onCheck={tableHandleCheck}
              onToggleAll={tableHandleToggleAll}
              onToggleExpand={tableHandleToggleExpand}
              onSort={tableHandleSort}
              sortConfig={tableSortConfig}
              page={currentPage}
              rowsPerPage={currentRowsPerPage}
              totalCount={totalFlattenedItems}
              sequentialPageNumbers={sequentialPageNumbers}
              draggableColumns={draggableColumns}
              onColumnOrderChange={updateColumns}
              dragHandlers={dragHandlers}
              dragInfo={dragInfo}
              fixedHeader={true}
              maxHeight={tableHeight}
              tableHeaderRef={tableHeaderRef}
              headerStyle={getTableHeaderStyles()}
              pinnedColumns={pinnedColumns}
            />
            
            {/* 테이블 리사이즈 핸들 */}
            <TableResizeHandle 
              resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
              showIcon={true}
              isDragging={isDragging}
              sx={{ 
                mt: 1,
                opacity: isDragging ? 1 : 0.7,
                '&:hover': { opacity: 1 }
              }}
            />
          </Box>
        </Paper>
    </PageContainer>
  );
};

export default UsernameChangeHistoryPage;