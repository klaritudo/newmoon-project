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
import api from '../../services/api';

// 커미션내역 페이지 컬럼 설정
const commissionHistoryColumns = [
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
    align: 'center',
    pinnable: true
  },
  {
    id: 'userId',
    header: '아이디(닉네임)',
    type: 'multiline',
    width: 150,
    sortable: true,
    clickable: true,
    pinnable: true
  },
  {
    id: 'memberType',
    header: '유형',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    chipConfig: {
      member: { label: '회원', color: 'primary' },
      agent: { label: '에이전트', color: 'secondary' }
    }
  },
  {
    id: 'bettingId',
    header: '베팅ID',
    type: 'text',
    width: 150,
    sortable: true,
    ellipsis: true
  },
  {
    id: 'betAmount',
    header: '베팅금액',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true
  },
  {
    id: 'winAmount',
    header: '당첨금액',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true
  },
  {
    id: 'commissionRate',
    header: '커미션율(%)',
    type: 'text',
    width: 100,
    align: 'center',
    sortable: true,
    formatter: (value) => `${value}%`
  },
  {
    id: 'commissionAmount',
    header: '커미션금액',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    style: { color: '#f44336', fontWeight: 'bold' }
  },
  {
    id: 'type',
    header: '타입',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    chipConfig: {
      betting: { label: '베팅', color: 'info' },
      manual: { label: '수동', color: 'default' }
    }
  },
  {
    id: 'status',
    header: '상태',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    chipConfig: {
      applied: { label: '적용', color: 'success' },
      refunded: { label: '환불', color: 'warning' },
      cancelled: { label: '취소', color: 'error' }
    }
  },
  {
    id: 'note',
    header: '비고',
    type: 'text',
    width: 200,
    sortable: false,
    ellipsis: true
  },
  {
    id: 'processTime',
    header: '처리시간',
    type: 'datetime',
    width: 150,
    sortable: true
  }
];

// 더미 데이터 생성 함수
const generateCommissionHistoryData = (count = 100) => {
  const data = [];
  const userIds = ['store00015', 'game01', 'test123', 'player88', 'winner2024'];
  const nicknames = ['김철수', '이영희', '박민수', '최지우', '정하늘'];
  const statuses = ['applied', 'refunded', 'cancelled'];
  const types = ['betting', 'manual'];
  
  for (let i = 1; i <= count; i++) {
    const userIndex = Math.floor(Math.random() * userIds.length);
    const betAmount = Math.floor(Math.random() * 900000) + 10000;
    const winAmount = betAmount * (Math.random() * 3 + 0.5);
    const commissionRate = [5, 10, 15][Math.floor(Math.random() * 3)];
    const commissionAmount = Math.floor(betAmount * (commissionRate / 100));
    
    data.push({
      id: i,
      number: i,
      userId: userIds[userIndex],
      nickname: nicknames[userIndex],
      memberType: Math.random() > 0.7 ? 'agent' : 'member',
      bettingId: `BET${Date.now()}-${i}`,
      transactionId: `TX${Date.now()}-${i}`,
      betAmount: betAmount,
      winAmount: Math.floor(winAmount),
      commissionRate: commissionRate,
      commissionAmount: commissionAmount,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      note: Math.random() > 0.5 ? `Honor 잔액: ${Math.floor(Math.random() * 1000000)}` : '',
      processTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return data;
};

const CommissionHistoryPage = () => {
  const theme = useTheme();
  
  // 데이터 상태
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  
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
    console.log('커미션내역 엑셀 다운로드');
    alert('커미션내역을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('커미션내역 인쇄');
    alert('커미션내역을 인쇄합니다.');
  }, []);

  // 페이지네이션 직접 제어 로직
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
        id: 'status',
        label: '상태',
        items: [
          { value: '', label: '전체' },
          { value: 'applied', label: '적용' },
          { value: 'refunded', label: '환불' },
          { value: 'cancelled', label: '취소' }
        ]
      },
      {
        id: 'type',
        label: '타입',
        items: [
          { value: '', label: '전체' },
          { value: 'betting', label: '베팅' },
          { value: 'manual', label: '수동' }
        ]
      },
      {
        id: 'memberType',
        label: '회원유형',
        items: [
          { value: '', label: '전체' },
          { value: 'member', label: '회원' },
          { value: 'agent', label: '에이전트' }
        ]
      }
    ];
    
    return baseOptions;
  }, []);

  // useTableFilterAndPagination 훅 사용 - 서버 사이드 페이지네이션 모드
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
    handleClearFilters,
    setTotalItems
  } = useTableFilterAndPagination({
    columns: commissionHistoryColumns,
    data: data,
    defaultRowsPerPage: 25,
    hierarchical: false,
    filterOptions: {
      initialFilters: { status: 'all', type: 'all', memberType: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: totalDataCount,  // data.length 대신 totalDataCount 사용
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
    initialTotalItems: totalDataCount,  // data.length 대신 totalDataCount 사용
    onSearch: (value) => {
      console.log(`커미션내역 검색: ${value}`);
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

  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`커미션내역 필터 변경: ${filterId} = ${value}`);
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

  // 서버 사이드 페이지네이션 사용 시 data를 직접 사용
  const safeFilteredData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // 실제 전체 항목 수 계산
  const totalFlattenedItems = totalDataCount || safeFilteredData.length;

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`커미션내역 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`커미션내역 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('커미션내역 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`커미션내역 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`커미션내역 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 커미션 데이터 변환 함수 - snake_case를 camelCase로 변환
  const transformCommissionData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      userId: item.username || item.member_id,
      betAmount: item.bet_amount,
      winAmount: item.win_amount,
      commissionRate: item.commission_rate,
      commissionAmount: item.commission_amount,
      processTime: item.created_at,
      memberType: item.member_type || 'member',
      bettingId: item.betting_id,
      transactionId: item.transaction_id,
      type: item.type || 'betting',
      status: item.status || 'applied',
      note: item.note || ''
    }));
  };

  // 커미션 데이터 가져오기
  const fetchCommissionHistory = useCallback(async (pageNum = 1, limit = 25, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: limit,
        ...filters
      });
      
      const response = await api.get(`/settings/betting-commission/logs?${params}`);
      
      console.log('Commission API Response:', response.data); // 디버깅용 로그
      console.log('Page:', pageNum, 'Data count:', response.data.data?.length); // 페이지별 데이터 확인
      
      if (response.data.success) {
        // 데이터 변환 적용
        const transformedData = transformCommissionData(response.data.data);
        setData(transformedData);
        setTotalDataCount(response.data.pagination.total);
        // 페이지네이션 훅의 총 아이템 수도 업데이트
        if (setTotalItems) {
          setTotalItems(response.data.pagination.total);
        }
      } else {
        // success가 false인 경우에도 데이터 처리
        if (response.data.data) {
          const transformedData = transformCommissionData(response.data.data);
          setData(transformedData);
          const total = response.data.pagination?.total || 0;
          setTotalDataCount(total);
          // 페이지네이션 훅의 총 아이템 수도 업데이트
          if (setTotalItems) {
            setTotalItems(total);
          }
        }
      }
    } catch (error) {
      console.error('커미션 내역 조회 오류:', error);
      // 오류 발생 시 빈 배열 설정
      setData([]);
      setTotalDataCount(0);
      if (setTotalItems) {
        setTotalItems(0);
      }
    } finally {
      setLoading(false);
    }
  }, [setTotalItems]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    console.log('Fetching data for page:', currentPage + 1, 'with limit:', currentRowsPerPage);
    fetchCommissionHistory(currentPage + 1, currentRowsPerPage, safeActiveFilters);
  }, [currentPage, currentRowsPerPage]); // 의존성 최소화

  // 전체합계 설정 - 커미션내역 페이지용
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all'
    },
    columns: {
      betAmount: { type: 'sum', format: 'currency' },
      winAmount: { type: 'sum', format: 'currency' },
      commissionAmount: { type: 'sum', format: 'currency' }
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
    initialColumns: commissionHistoryColumns,
    tableId: 'commission_history_table',
    onColumnOrderChange: (newColumns) => {
      console.log('커미션내역 테이블 컬럼 순서 변경:', newColumns);
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
    alwaysVisibleColumns: [],
    tableId: 'commission_history_table'
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

  // 테이블 데이터 업데이트 시 totalItems 재계산
  useEffect(() => {
    console.log(`커미션내역 데이터 변경 - 전체: ${data.length}건`);
  }, [data]);

  // 필터링된 데이터가 변경될 때마다 토탈 업데이트
  useEffect(() => {
    console.log(`커미션내역 필터링 데이터 변경 - 필터링된 항목: ${safeFilteredData.length}건`);
  }, [safeFilteredData]);

  // 표시할 컬럼 필터링
  const finalColumns = useMemo(() => {
    return visibleColumns.map(column => {
      // 필요한 경우 컬럼별 추가 처리
      return column;
    });
  }, [visibleColumns]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="커미션내역"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={() => {
          console.log('커미션내역 새로고침');
          fetchCommissionHistory(currentPage + 1, currentRowsPerPage, safeActiveFilters);
        }}
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
          title="커미션내역 목록"
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
          searchPlaceholder="커미션내역 검색..."
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
          {console.log('BaseTable render - data:', data, 'length:', data.length, 'page:', currentPage)}
          <BaseTable
            columns={finalColumns}
            data={data}
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
            page={0}  // 서버 사이드 페이지네이션 사용 시 항상 0
            rowsPerPage={data.length}  // 서버에서 받은 데이터 길이 사용
            totalCount={totalFlattenedItems}
            sequentialPageNumbers={sequentialPageNumbers}
            draggableColumns={true}
            onColumnOrderChange={updateColumns}
            dragHandlers={{
              handleDragStart,
              handleDragEnd,
              handleDragOver,
              handleDrop
            }}
            dragInfo={dragInfo}
            fixedHeader={true}
            fixedFooter={true}
            maxHeight={tableHeight}
            tableHeaderRef={tableHeaderRef}
            headerStyle={getTableHeaderStyles()}
            pinnedColumns={pinnedColumns}
            summary={summaryConfig}
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

export default CommissionHistoryPage;