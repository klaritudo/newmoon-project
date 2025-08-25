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
import { 
  dailySettlementColumns,
  periodOptions,
  generateDailySettlementData
} from './data/dailySettlementData';
import usePageData from '../../hooks/usePageData';

/**
 * 일자별 정산 페이지
 * 일자별 베팅/당첨/수익 정산 내역 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const DailySettlementPage = () => {
  const theme = useTheme();

  // 범용 페이지 데이터 훅 사용
  const {
    data,
    isLoading,
    error,
    isInitialized,
    refreshPageData
  } = usePageData({
    pageType: 'dailySettlement',
    requiresMembersData: false
  });

  // 실제 API 데이터 사용
  const finalData = useMemo(() => {
    return data || [];
  }, [data]);

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
    console.log('일자별 정산 엑셀 다운로드');
    alert('일자별 정산을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('일자별 정산 인쇄');
    alert('일자별 정산을 인쇄합니다.');
  }, []);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // 합계 표시 옵션 (전체 또는 현재 페이지)
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);

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
    data: finalData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return dailySettlementColumns.map(column => {
      // 필요한 경우 여기에 특별한 액션을 추가할 수 있음
      return column;
    });
  }, []);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return [
      {
        id: 'period',
        label: '기간',
        items: [
          { value: '', label: '전체' },
          ...periodOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      }
    ];
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
    columns: columnsWithActions,
    data: finalData,
    defaultRowsPerPage: 25,
    hierarchical: false,
    filterOptions: {
      initialFilters: { period: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: finalData.length,
      onExcelDownload: handleExcelDownload,
      onPrint: handlePrint
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
    setGridReady
  } = useTableHeader({
    initialTotalItems: finalData.length,
    onSearch: (value) => {
      console.log(`일자별 정산 검색: ${value}`);
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      console.log(`컬럼 고정 토글: ${hasPinned}`);
      if (hasPinned) {
        setDefaultPinnedColumns();
      } else {
        clearAllPinnedColumns();
      }
    }
  });

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  // 컬럼 드래그 앤 드롭 관련 훅 사용
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
    initialColumns: columnsWithActions,
    tableId: 'daily_settlement_table',
    initialPinnedColumns: ['index', 'date'],
    onColumnOrderChange: (newColumns) => {
      console.log('일자별 정산 테이블 컬럼 순서 변경:', newColumns);
    }
  });

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
    alwaysVisibleColumns: ['index', 'date'],
    tableId: 'daily_settlement_table'
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

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'period':
        if (filterValue === 'all' || filterValue === '') return result;
        
        const today = new Date();
        let startDate;
        
        switch (filterValue) {
          case 'daily':
            startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'weekly':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            return result;
        }
        
        return result.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate;
        });
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`일자별 정산 필터 변경: ${filterId} = ${value}`);
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
    data: finalData,
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

  // 필터링된 데이터 처리 (계층 구조 없이 일반 배열로 처리)
  const filteredFlatData = useMemo(() => {
    // 필터가 적용되지 않았거나 검색어가 없는 경우 모든 데이터 반환
    const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    if (!hasActiveFilters && !hasSearchText) {
      return finalData;
    }
    
    // 필터가 있는 경우에만 filteredIds로 필터링
    if (!finalData || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    return finalData.filter(item => filteredIds.includes(item.id));
  }, [finalData, filteredIds, safeActiveFilters, searchText]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산 (일반 배열이므로 단순 길이)
  const totalFlattenedItems = safeFilteredData.length;

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`일자별 정산 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`일자별 정산 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('일자별 정산 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`일자별 정산 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`일자별 정산 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`일자별 정산 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 전체합계 설정 - 일자별정산 페이지용
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all'
    },
    columns: {
      slotBetting: { type: 'sum', format: 'currency' },
      slotWinning: { type: 'sum', format: 'currency' },
      slotProfit: { type: 'sum', format: 'currency' },
      casinoBetting: { type: 'sum', format: 'currency' },
      casinoWinning: { type: 'sum', format: 'currency' },
      casinoProfit: { type: 'sum', format: 'currency' },
      totalBetting: { type: 'sum', format: 'currency' },
      totalWinning: { type: 'sum', format: 'currency' },
      totalProfit: { type: 'sum', format: 'currency' }
    },
    ui: {
      label: '전체합계',
      toggleable: true,
      toggleLabel: '현재 페이지만',
      styling: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold'
      }
    }
  }), [showCurrentPageOnly]);

  // 드래그 앤 드롭 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // 로딩 중이거나 에러가 있는 경우 처리 - 회원관리처럼 제거
  // 데이터가 없어도 UI를 표시하여 사용자 경험 개선

  // 일자별 정산 그룹별 색상 스타일
  const dailySettlementGroupStyles = `
    /* 슬롯 그룹 - 초록색 계열 */
    [data-column-id="slotGroup"],
    [data-column-id*="slot"] {
      background-color: rgba(76, 175, 80, 0.15) !important;
    }
    
    /* 카지노 그룹 - 보라색 계열 */
    [data-column-id="casinoGroup"],
    [data-column-id*="casino"] {
      background-color: rgba(156, 39, 176, 0.15) !important;
    }
    
    /* 합계 그룹 - 주황색 계열 */
    [data-column-id="totalGroup"],
    [data-column-id*="total"] {
      background-color: rgba(255, 152, 0, 0.15) !important;
    }
    
    /* 테이블 바디의 셀에도 동일한 색상 적용 - 모든 가능한 선택자 */
    .MuiTableBody-root .MuiTableCell-root[data-column-id="slotGroup"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="slot"],
    tbody .MuiTableCell-root[data-column-id="slotGroup"],
    tbody .MuiTableCell-root[data-column-id*="slot"],
    table tbody tr td[data-column-id="slotGroup"],
    table tbody tr td[data-column-id*="slot"],
    td[data-column-id="slotGroup"],
    td[data-column-id*="slot"] {
      background-color: rgba(76, 175, 80, 0.08) !important;
    }
    
    .MuiTableBody-root .MuiTableCell-root[data-column-id="casinoGroup"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="casino"],
    tbody .MuiTableCell-root[data-column-id="casinoGroup"],
    tbody .MuiTableCell-root[data-column-id*="casino"],
    table tbody tr td[data-column-id="casinoGroup"],
    table tbody tr td[data-column-id*="casino"],
    td[data-column-id="casinoGroup"],
    td[data-column-id*="casino"] {
      background-color: rgba(156, 39, 176, 0.08) !important;
    }
    
    .MuiTableBody-root .MuiTableCell-root[data-column-id="totalGroup"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="total"],
    tbody .MuiTableCell-root[data-column-id="totalGroup"],
    tbody .MuiTableCell-root[data-column-id*="total"],
    table tbody tr td[data-column-id="totalGroup"],
    table tbody tr td[data-column-id*="total"],
    td[data-column-id="totalGroup"],
    td[data-column-id*="total"] {
      background-color: rgba(255, 152, 0, 0.08) !important;
    }
  `;

  return (
    <PageContainer>
      {/* 그룹별 색상 스타일 적용 */}
      <style>{dailySettlementGroupStyles}</style>

      {/* 페이지 헤더 */}
      <PageHeader
        title="일자별 정산"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={refreshPageData}
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
          title="일자별 정산 목록"
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
          searchPlaceholder="날짜로 검색..."
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
            key={`daily-settlement-table-${tableKey}`}
            columns={visibleColumns}
            data={safeFilteredData}
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
            fixedFooter={true}
            maxHeight={tableHeight}
            tableHeaderRef={tableHeaderRef}
            headerStyle={getTableHeaderStyles()}
            pinnedColumns={pinnedColumns}
            summary={summaryConfig}
            sx={{
              '& table': {
                tableLayout: 'fixed !important',
                width: '100% !important'
              }
            }}
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

      {/* 디버그 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <TableDebugInfo
          data={{
            totalCount: totalFlattenedItems,
            filteredCount: totalFlattenedItems,
            visibleDataCount: safeFilteredData?.length || 0,
            currentPage,
            currentRowsPerPage,
            isLoading: false,
            filters: safeActiveFilters,
            searchText
          }}
        />
      )}
    </PageContainer>
  );
};

export default DailySettlementPage; 