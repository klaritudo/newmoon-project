import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Paper, Typography, useTheme, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { CheckCircle, Schedule, Cancel } from '@mui/icons-material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TableHeightSetting, 
  TableResizeHandle, 
  ColumnVisibilityDialog, 
  PageHeader, 
  PageContainer,
  TableDebugInfo,
  DateFilterPopover 
} from '../components/baseTemplate/components';
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
import dayjs from 'dayjs';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../contexts/NotificationContext';
import depositInquiriesService from '../services/depositInquiriesService';

// 입금 문의 페이지 컬럼 설정
const depositInquiriesColumns = [
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
    id: 'superAgent',
    header: '상위에이전트',
    type: 'custom',
    cellRenderer: 'parentChips',
    width: 200,
    sortable: false,
    pinnable: true
  },
  {
    id: 'amount',
    header: '금액',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'depositorName',
    header: '입금자명',
    type: 'default',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'status',
    header: '상태',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'createdAt',
    header: '신청시간',
    type: 'default',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'actions',
    header: '액션',
    type: 'custom',
    cellRenderer: 'actions',
    width: 150,
    align: 'center',
    sortable: false,
    pinnable: false
  }
];

// 상태 옵션
const statusOptions = [
  { value: '', label: '전체' },
  { value: 'pending', label: '요청중' },
  { value: 'waiting', label: '대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '비승인' }
];

/**
 * 입금 문의 관리 페이지
 * 입금 문의 목록 조회, 상태 변경, 일괄 처리 등의 기능을 제공합니다.
 */
const DepositInquiriesPage = () => {
  const theme = useTheme();
  
  // Socket 서비스 사용
  const { socketService } = useSocket();
  
  // 전역 알림 사용
  const { handleRefresh } = useNotification();
  
  // 데이터 상태
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 실시간 데이터 업데이트를 위한 state
  const [realtimeUpdates, setRealtimeUpdates] = useState({});
  const lastSequenceRef = useRef(0);
  
  // 비승인 사유 입력 다이얼로그 상태
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await depositInquiriesService.getInquiries();
      
      // 데이터 변환
      const transformedData = response.data.map((item, index) => ({
        id: item.id,
        number: index + 1,
        userId: `${item.username}\n${item.nickname || ''}`,
        superAgent: item.parentAgents || [],
        amount: item.amount,
        depositorName: item.depositor_name,
        status: {
          label: getStatusLabel(item.status),
          color: getStatusColor(item.status),
          value: item.status
        },
        createdAt: new Date(item.created_at).toLocaleString(),
        rejectReason: item.reject_reason,
        originalData: item
      }));
      
      setData(transformedData);
    } catch (err) {
      console.error('입금 문의 데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 상태 라벨 변환 함수
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '요청중';
      case 'waiting': return '대기';
      case 'approved': return '승인';
      case 'rejected': return '비승인';
      default: return status;
    }
  };

  // 상태 색상 변환 함수
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'waiting': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // 상태 변경 함수
  const handleStatusChange = useCallback(async (inquiry, newStatus) => {
    if (newStatus === 'rejected') {
      // 비승인인 경우 사유 입력 다이얼로그 열기
      setSelectedInquiry(inquiry);
      setRejectDialogOpen(true);
      return;
    }

    try {
      await depositInquiriesService.updateStatus(inquiry.id, {
        status: newStatus
      });
      
      // 데이터 새로고침
      loadData();
      
      // 성공 알림
      alert(`입금 문의가 ${getStatusLabel(newStatus)} 처리되었습니다.`);
    } catch (err) {
      console.error('상태 변경 오류:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  }, [loadData]);

  // 비승인 처리 함수
  const handleReject = useCallback(async () => {
    if (!selectedInquiry || !rejectReason.trim()) {
      alert('비승인 사유를 입력해주세요.');
      return;
    }

    try {
      await depositInquiriesService.updateStatus(selectedInquiry.id, {
        status: 'rejected',
        rejectReason: rejectReason.trim()
      });
      
      // 다이얼로그 닫기
      setRejectDialogOpen(false);
      setSelectedInquiry(null);
      setRejectReason('');
      
      // 데이터 새로고침
      loadData();
      
      // 성공 알림
      alert('입금 문의가 비승인 처리되었습니다.');
    } catch (err) {
      console.error('비승인 처리 오류:', err);
      alert('비승인 처리 중 오류가 발생했습니다.');
    }
  }, [selectedInquiry, rejectReason, loadData]);

  // 액션 버튼 렌더러
  const renderActionButtons = useCallback((row) => {
    const inquiry = row.originalData;
    
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          color="success"
          onClick={() => handleStatusChange(row, 'approved')}
          disabled={inquiry.status === 'approved'}
          title="승인"
        >
          <CheckCircle fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="info"
          onClick={() => handleStatusChange(row, 'waiting')}
          disabled={inquiry.status === 'waiting'}
          title="대기"
        >
          <Schedule fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleStatusChange(row, 'rejected')}
          disabled={inquiry.status === 'rejected'}
          title="비승인"
        >
          <Cancel fontSize="small" />
        </IconButton>
      </Box>
    );
  }, [handleStatusChange]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 실시간 웹소켓 이벤트 리스너
  useEffect(() => {
    if (!socketService) return;
    
    const handleDepositUpdate = (event) => {
      console.log('💰 입금문의: 실시간 업데이트:', event);
      
      // 시퀀스 체크 (중복/누락 방지)
      if (event.sequence <= lastSequenceRef.current) {
        console.warn('⚠️ 중복 이벤트 감지:', event.sequence);
        return;
      }
      lastSequenceRef.current = event.sequence;
      
      if (event.type === 'deposit:inquiry:new' || event.type === 'deposit:inquiry:status:changed') {
        // 데이터 새로고침
        setTimeout(() => {
          loadData();
        }, 500);
      }
    };
    
    // 이벤트 리스너 등록
    socketService.on('deposit:inquiry:new', handleDepositUpdate);
    socketService.on('deposit:inquiry:status:changed', handleDepositUpdate);
    
    // cleanup
    return () => {
      socketService.off('deposit:inquiry:new', handleDepositUpdate);
      socketService.off('deposit:inquiry:status:changed', handleDepositUpdate);
    };
  }, [socketService, loadData]);

  // 테이블 높이 자동 조정
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

  // 테이블 리사이즈 기능
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
  
  // 헤더 행 고정 기능
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    zIndex: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(() => {
    console.log('입금 문의 엑셀 다운로드');
    alert('입금 문의 내역을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('입금 문의 인쇄');
    alert('입금 문의 내역을 인쇄합니다.');
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

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return depositInquiriesColumns.map(column => {
      // actions 컬럼에 렌더러 추가
      if (column.id === 'actions') {
        return {
          ...column,
          cellRenderer: renderActionButtons
        };
      }
      
      return column;
    });
  }, [renderActionButtons]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return [
      {
        id: 'status',
        label: '상태',
        items: statusOptions
      }
    ];
  }, []);

  // useTableFilterAndPagination 훅 사용
  const {
    activeFilters,
    handleFilterChange,
    isDateFilterActive,
    isDateFilterOpen,
    dateFilterAnchorEl,
    handleOpenDateFilter,
    handleCloseDateFilter,
    handleDateRangeChange,
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
    columns: columnsWithActions,
    data: data,
    defaultRowsPerPage: 25,
    hierarchical: false,
    filterOptions: {
      initialFilters: { status: '' }
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
      console.log(`입금 문의 검색: ${value}`);
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      console.log(`컬럼 고정 토글: ${hasPinned}`);
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
    tableId: 'deposit_inquiries_table',
    onColumnOrderChange: (newColumns) => {
      console.log('입금 문의 테이블 컬럼 순서 변경:', newColumns);
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
    tableId: 'deposit_inquiries_table'
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

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'status':
        if (filterValue === '' || filterValue === 'all') return result;
        
        return result.filter(item => {
          return item.status.value === filterValue;
        });
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`입금 문의 필터 변경: ${filterId} = ${value}`);
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
    isDateFilterActive: false,
    dateRange: null,
    filterCallback
  });
  
  // 필터링된 데이터 처리
  const filteredFlatData = useMemo(() => {
    const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    if (!hasActiveFilters && !hasSearchText) {
      return data;
    }
    
    if (!computedFilteredData || computedFilteredData.length === 0) {
      return [];
    }
    
    return computedFilteredData;
  }, [data, computedFilteredData, safeActiveFilters, searchText]);
  
  // 실제 전체 항목 수 계산
  const totalFlattenedItems = filteredFlatData.length;
  
  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`입금 문의 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('입금 문의 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`입금 문의 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!filteredFlatData || filteredFlatData.length === 0) return [];
    
    return filteredFlatData;
  }, [filteredFlatData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="입금 문의 관리"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={loadData}
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
          title="입금 문의 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##건의 문의"
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
          searchPlaceholder="입금 문의 검색..."
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
              isDateFilterActive: false,
              handleOpenDateFilter: null,
              resetDateFilter: null
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
            key={`deposit-inquiries-table-${tableKey}`}
            columns={visibleColumns}
            data={visibleData}
            checkable={true}
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

      {/* 비승인 사유 입력 다이얼로그 */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>비승인 사유 입력</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="비승인 사유"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="비승인 사유를 입력해주세요."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>취소</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            비승인 처리
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DepositInquiriesPage;