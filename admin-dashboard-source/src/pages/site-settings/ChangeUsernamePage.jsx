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
import { useDispatch, useSelector } from 'react-redux';
import { changeUsernameColumns } from './data/changeUsernameColumns';
import { generateOnlineChangeableUsers } from '../agent-management/data/usernameChangeHistoryData';
import usePageData from '../../hooks/usePageData';
import { openChangeDialog, setOnlineChangeableUsers, closeChangeDialog, setLoading, setError } from '../../features/usernameChange/usernameChangeSlice';
import UsernameChangeDialog from '../../components/dialogs/UsernameChangeDialog';
import apiService from '../../services/api';

/**
 * 아이디변경 페이지
 * 온라인 상태의 변경 가능한 사용자 목록을 표시하고 아이디 변경 기능을 제공합니다.
 */
const ChangeUsernamePage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { changeDialog } = useSelector(state => state.usernameChange);

  // API 데이터 상태 관리
  const [data, setData] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 온라인 변경 가능한 사용자 목록 가져오기
  const fetchOnlineChangeableUsers = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    dispatch(setLoading(true));
    
    try {
      const response = await apiService.usernameChange.getOnlineChangeableUsers();
      const users = response.data || [];
      setData(users);
      dispatch(setOnlineChangeableUsers(users));
    } catch (error) {
      console.error('API 호출 실패:', error);
      setApiError(error.message || 'API 호출에 실패했습니다.');
      
      // API 실패 시 임시로 mock 데이터 사용
      const mockData = generateOnlineChangeableUsers(50);
      setData(mockData);
      dispatch(setOnlineChangeableUsers(mockData));
    } finally {
      setApiLoading(false);
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchOnlineChangeableUsers();
  }, [fetchOnlineChangeableUsers, refreshKey]);

  // 30초마다 데이터 자동 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOnlineChangeableUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOnlineChangeableUsers]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    console.log('아이디변경 목록 새로고침');
    setRefreshKey(prev => prev + 1);
  }, []);
  
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
    console.log('아이디변경 목록 엑셀 다운로드');
    alert('아이디변경 목록을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('아이디변경 목록 인쇄');
    alert('아이디변경 목록을 인쇄합니다.');
  }, []);

  // 페이지네이션 직접 제어 로직
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // 아이디 변경 핸들러
  const handleChangeUsername = useCallback((row) => {
    console.log('아이디바꿔주기 클릭:', row);
    // UsernameChangeDialog를 열기 위해 Redux action 디스패치
    dispatch(openChangeDialog({ 
      userId: row.userId, 
      agentId: row.agentId 
    }));
  }, [dispatch]);

  // 다이얼로그 닫힐 때 데이터 새로고침
  useEffect(() => {
    if (!changeDialog.open && refreshKey > 0) {
      fetchOnlineChangeableUsers();
    }
  }, [changeDialog.open, fetchOnlineChangeableUsers, refreshKey]);

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
    indentMode: false, // 계층 기능 비활성화
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return changeUsernameColumns.map(column => {
      // actions 컬럼에 클릭 핸들러 추가
      if (column.id === 'actions') {
        return {
          ...column,
          onClick: handleChangeUsername
        };
      }
      
      return column;
    });
  }, [handleChangeUsername]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    const baseOptions = [
      {
        id: 'gameStatus',
        label: '접속상태',
        items: [
          { value: '', label: '전체' },
          { value: '로비대기', label: '로비대기' },
          { value: '게임중', label: '게임중' }
        ]
      },
      {
        id: 'device',
        label: '접속기기',
        items: [
          { value: '', label: '전체' },
          { value: 'PC', label: 'PC' },
          { value: 'Mobile', label: 'Mobile' },
          { value: 'Tablet', label: 'Tablet' }
        ]
      },
      {
        id: 'level',
        label: '레벨',
        items: [
          { value: '', label: '전체' },
          { value: '일반', label: '일반' },
          { value: '실버', label: '실버' },
          { value: '골드', label: '골드' },
          { value: 'VIP', label: 'VIP' },
          { value: '플래티넘', label: '플래티넘' }
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
    columns: columnsWithActions,
    data: data,
    defaultRowsPerPage: 25,
    hierarchical: false, // 계층 기능 비활성화
    filterOptions: {
      initialFilters: { gameStatus: '', device: '', level: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: data.length,
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
    initialTotalItems: data.length,
    onSearch: (value) => {
      console.log(`아이디변경 검색: ${value}`);
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
    tableId: 'change_username_table',
    onColumnOrderChange: (newColumns) => {
      console.log('아이디변경 테이블 컬럼 순서 변경:', newColumns);
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
    alwaysVisibleColumns: ['userId', 'actions'],
    tableId: 'change_username_table'
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
    console.log('아이디변경 행 클릭:', row);
  };

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'gameStatus':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.gameStatus === filterValue);
        
      case 'device':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.device === filterValue);
        
      case 'level':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.level === filterValue);
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`아이디변경 필터 변경: ${filterId} = ${value}`);
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
  
  // 필터링된 데이터 처리 (계층 구조 없이 일반 배열로 처리)
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
    console.log(`아이디변경 페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산 (일반 배열이므로 단순 길이)
  const totalFlattenedItems = safeFilteredData.length;
  
  const safeDisplayData = safeFilteredData;

  // 필터링된 데이터가 변경될 때 totalItems 값 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      console.log(`아이디변경 검색/필터 결과: ${safeFilteredData.length}개 항목`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`아이디변경 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`아이디변경 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('아이디변경 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`아이디변경 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`아이디변경 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`아이디변경 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    console.log(`아이디변경 페이지네이션 변수: 페이지=${currentPage}, 행수=${currentRowsPerPage}, 총=${totalFlattenedItems}`);
    return safeFilteredData;
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  // visibleColumns에 버튼 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    return visibleColumns.map(column => {
      // actions 컬럼에 클릭 핸들러 추가
      if (column.id === 'actions') {
        return {
          ...column,
          onClick: handleChangeUsername
        };
      }
      
      return column;
    });
  }, [visibleColumns, handleChangeUsername]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
        <PageHeader
          title="아이디변경"
          onDisplayOptionsClick={handleDisplayOptionsClick}
          showAddButton={false}
          showRefreshButton={true}
          onRefreshClick={handleRefresh}
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
            title="온라인 변경 가능 사용자"
            totalItems={totalFlattenedItems}
            countLabel="총 ##count##명"
            sequentialPageNumbers={sequentialPageNumbers}
            togglePageNumberMode={togglePageNumberMode}
            hasPinnedColumns={hasPinnedColumns}
            isGridReady={isGridReady}
            toggleColumnPin={headerToggleColumnPin}
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
            showIndentToggle={false} // 계층 기능 비활성화
            showPageNumberToggle={true}
            showColumnPinToggle={true}
            showSearch={true}
            searchPlaceholder="아이디, 닉네임, 에이전트 검색..."
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
              {apiError && (
                <Typography component="span" sx={{ ml: 2, color: 'error.main' }}>
                  (주의: API 연결 실패로 임시 데이터 표시 중)
                </Typography>
              )}
            </Typography>
            <BaseTable
              key={`change-username-table-${tableKey}`}
              columns={finalColumns}
              data={visibleData}
              checkable={false} // 체크박스 기능 비활성화
              hierarchical={false} // 계층 기능 비활성화
              indentMode={false} // 들여쓰기 모드 비활성화
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
      
      {/* 아이디바꿔주기 다이얼로그 */}
      {changeDialog.open && (
        <UsernameChangeDialog
          open={changeDialog.open}
          userId={changeDialog.userId}
          agentId={changeDialog.agentId}
          onClose={() => {
            dispatch(closeChangeDialog());
            // 다이얼로그 닫힐 때 데이터 새로고침
            handleRefresh();
          }}
        />
      )}
    </PageContainer>
  );
};

export default ChangeUsernamePage;