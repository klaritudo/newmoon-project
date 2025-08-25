import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Paper, Typography, useTheme, Button, Tabs, Tab } from '@mui/material';
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
  depositInquiriesColumns,
  depositStatusOptions,
  getDepositStatusChipStyle,
  getStatusText,
  DEPOSIT_INQUIRIES_COLUMNS_VERSION
} from './data/depositInquiriesData.jsx';
import { apiOptions, bankList } from '../agent-management/data/membersData';
import useDynamicTypes from '../../hooks/useDynamicTypes';
import MemberDetailDialog from '../../components/dialogs/MemberDetailDialog';
import usePageData from '../../hooks/usePageData';
import apiService from '../../services/api';
import depositInquiriesService from '../../services/depositInquiriesService';
import { useSocket } from '../../context/SocketContext';
import RejectReasonDialog from '../../components/dialogs/RejectReasonDialog';

/**
 * 입금신청처리 페이지
 * 입금 신청 내역 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const DepositPage = () => {
  const theme = useTheme();
  const { socketService } = useSocket();
  
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState('pending');
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 상태 관리
  const [data, setData] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    waiting: 0,
    rejected: 0,
    approved: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 비승인 사유 다이얼로그 상태
  const [rejectReasonDialog, setRejectReasonDialog] = useState({
    open: false,
    reason: ''
  });

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 상태별 카운트 조회
      const countsResponse = await depositInquiriesService.getCounts();
      if (countsResponse.success) {
        setCounts({
          all: countsResponse.data.total || 0,
          pending: countsResponse.data.pending || 0,
          waiting: countsResponse.data.waiting || 0,
          rejected: countsResponse.data.rejected || 0,
          approved: countsResponse.data.approved || 0
        });
      }
      
      // 탭에 따른 필터링
      const params = {
        page: 1,
        limit: 1000,
        status: activeTab === 'all' ? null : activeTab
      };
      
      // 데이터 조회
      const response = await depositInquiriesService.getAll(params);
      console.log('API 응답:', response);
      if (response.success) {
        console.log('데이터 설정:', response.data);
        setData(response.data || []);
      }
      
      setError(null);
    } catch (err) {
      console.error('입금문의 데이터 로드 실패:', err);
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // 탭 변경 시 데이터 재로드
  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  // 컬럼 버전 체크 및 초기화
  useEffect(() => {
    const savedVersion = localStorage.getItem('depositPage_columnsVersion');
    const currentVersion = DEPOSIT_INQUIRIES_COLUMNS_VERSION.toString();
    
    if (savedVersion !== currentVersion) {
      // 버전이 다르면 저장된 컬럼 설정 초기화
      localStorage.removeItem('depositPage_columnVisibility');
      localStorage.removeItem('depositPage_columnOrder');
      localStorage.removeItem('depositPage_pinnedColumns');
      localStorage.setItem('depositPage_columnsVersion', currentVersion);
      
      // 페이지 새로고침
      window.location.reload();
    }
  }, []);

  // WebSocket 이벤트 리스너
  useEffect(() => {
    if (!socketService) return;

    // 입금문의 생성 이벤트
    const handleDepositInquiryCreated = (data) => {
      console.log('새 입금문의:', data);
      loadData();
    };

    // 입금문의 상태 변경 이벤트
    const handleDepositInquiryStatusChanged = (data) => {
      console.log('입금문의 상태 변경:', data);
      if (data.pendingCount !== undefined || data.waitingCount !== undefined) {
        setCounts(prev => ({
          ...prev,
          pending: data.pendingCount || prev.pending,
          waiting: data.waitingCount || prev.waiting
        }));
      }
      loadData();
    };

    socketService.on('deposit:inquiry:created', handleDepositInquiryCreated);
    socketService.on('deposit:inquiry:status:changed', handleDepositInquiryStatusChanged);

    return () => {
      socketService.off('deposit:inquiry:created', handleDepositInquiryCreated);
      socketService.off('deposit:inquiry:status:changed', handleDepositInquiryStatusChanged);
    };
  }, [socketService, loadData]);

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
    console.log('입금신청 목록 엑셀 다운로드');
    alert('입금신청 목록을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('입금신청 목록 인쇄');
    alert('입금신청 목록을 인쇄합니다.');
  }, []);

  // 다이얼로그 핸들러들
  const handleMemberDetailOpen = useCallback((member) => {
    setSelectedMemberForDetail(member);
    setMemberDetailDialogOpen(true);
  }, []);

  const handleMemberDetailClose = useCallback(() => {
    setMemberDetailDialogOpen(false);
    setSelectedMemberForDetail(null);
  }, []);

  const handleMemberDetailSave = useCallback((updatedMember) => {
    console.log('회원정보 저장:', updatedMember);
    alert(`${updatedMember.nickname || updatedMember.username}님의 정보가 저장되었습니다.`);
    handleMemberDetailClose();
  }, [handleMemberDetailClose]);

  // 상태 변경 핸들러
  const handleStatusChange = useCallback(async (row, newStatus, rejectReason = '') => {
    try {
      const response = await depositInquiriesService.updateStatus(row.id, {
        status: newStatus,
        rejectReason
      });
      
      if (response.success) {
        alert(`입금문의가 ${getStatusText(newStatus)} 처리되었습니다.`);
        loadData();
      }
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    }
  }, [loadData]);

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return depositInquiriesColumns.map(column => {
      // username 컬럼에 클릭 핸들러 추가
      if (column.id === 'username') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('아이디 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      // actions 컬럼에 핸들러 추가
      if (column.id === 'actions') {
        return {
          ...column,
          render: (row) => column.render(row, {
            onApprove: (row) => handleStatusChange(row, 'approved'),
            onWait: (row) => handleStatusChange(row, 'waiting'),
            onReject: (row) => {
              const reason = prompt('비승인 사유를 입력하세요:');
              if (reason !== null) {
                handleStatusChange(row, 'rejected', reason);
              }
            }
          })
        };
      }
      
      // reject_reason 컬럼에 핸들러 추가
      if (column.id === 'reject_reason') {
        return {
          ...column,
          render: (row) => column.render(row, {
            onViewRejectReason: (row) => {
              setRejectReasonDialog({
                open: true,
                reason: row.reject_reason
              });
            }
          })
        };
      }
      
      // 다른 모든 컬럼도 원본 render 함수 유지
      return column;
    });
  }, [handleMemberDetailOpen, handleStatusChange]);

  // 컬럼 표시/숨김 관련 훅 사용 (순서 중요 - 가장 먼저 호출)
  const {
    columnVisibility,
    toggleableColumns,
    visibleColumns,
    hiddenColumnsCount,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(depositInquiriesColumns, {
    defaultHiddenColumns: [],
    tableId: 'depositPage_columnVisibility'
  });

  // 컬럼 드래그 앤 드롭 관련 훅 사용 (visibleColumns를 입력으로 받음)
  const {
    columns,
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
      console.log('입금신청 컬럼 순서 변경:', newColumns.map(col => col.id));
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

  // 회원 상세 다이얼로그 상태
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);

  // 페이지 관련 상태 추가 (먼저 정의)
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // 합계 표시 옵션 (전체 또는 현재 페이지)
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);

  // 테이블 통합 관리 훅
  const {
    // 체크박스 관련
    checkedItems: tableCheckedItems,
    allChecked: tableAllChecked,
    handleCheck: tableHandleCheck,
    handleToggleAll: tableHandleToggleAll,
    
    // 확장/접기 관련
    expandedRows: tableExpandedRows,
    handleToggleExpand: handleToggleExpand2,
    
    // 정렬 관련
    sortConfig: tableSortConfig,
    handleSort: tableHandleSort,
    
    // 테이블 상태 업데이트
    updateTableKey: updateTableKeyFunction
  } = useTable({
    data: data,
    initialSortConfig: { key: 'applicationTime', direction: 'desc' }
  });

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    const baseOptions = [
      {
        id: 'status',
        label: '상태',
        items: [
          { value: '', label: '전체' },
          ...depositStatusOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
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
    hierarchical: false,
    filterOptions: {
      initialFilters: { status: '', paymentMethod: '', processor: '', memberType: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: data.length,
      onExcelDownload: handleExcelDownload,
      onPrint: handlePrint
    }
  });

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

  // TableHeader 훅 사용 (searchText를 먼저 정의하기 위해 앞으로 이동)
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
      // 로그 제거 - 성능 개선
      if (page !== 0) {
        handlePageChange(null, 0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      // 로그 제거 - 성능 개선
      if (hasPinned) {
        setDefaultPinnedColumns();
      } else {
        clearAllPinnedColumns();
      }
    }
  });

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'status':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => item.status === filterValue);
        
      case 'date':
        let dateFilteredResult = [...result];
        
        if (filterValue.startDate) {
          dateFilteredResult = dateFilteredResult.filter(item => {
            const itemDate = new Date(item.created_at);
            const startDate = new Date(filterValue.startDate);
            startDate.setHours(0, 0, 0, 0);
            return itemDate >= startDate;
          });
        }
        
        if (filterValue.endDate) {
          dateFilteredResult = dateFilteredResult.filter(item => {
            const itemDate = new Date(item.created_at);
            const endDate = new Date(filterValue.endDate);
            endDate.setHours(23, 59, 59, 999);
            return itemDate <= endDate;
          });
        }
        
        return dateFilteredResult;
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    // 로그 제거 - 성능 개선
    handleFilterChange(filterId, value);
  }, [handleFilterChange]);

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

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산 (일반 배열이므로 단순 길이)
  const totalFlattenedItems = safeFilteredData.length;
  
  const safeDisplayData = safeFilteredData;

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    // 로그 제거 - 성능 개선
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    // 로그 제거 - 성능 개선
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('입금페이지 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    // 로그 제거 - 성능 개선
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    // 로그 제거 - 성능 개선
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    // 로그 제거 - 성능 개선
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터 (전체 데이터를 BaseTable에 전달)
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    // 로그 제거 - 성능 개선
    return safeFilteredData;
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  // visibleColumns에 액션 핸들러와 columnsWithActions의 변경사항을 적용
  const finalColumns = useMemo(() => {
    // columnsWithActions를 ID로 매핑하여 빠른 검색을 위한 Map 생성
    const columnsWithActionsMap = new Map(columnsWithActions.map(col => [col.id, col]));
    
    return columns.map(column => {
      // columnsWithActions에서 해당 컬럼의 정의를 가져옴
      const columnWithAction = columnsWithActionsMap.get(column.id);
      
      // columnsWithActions의 정의가 있으면 그것을 사용
      if (columnWithAction) {
        return {
          ...column,
          ...columnWithAction,
          // visibleColumns의 속성 중 일부는 유지 (예: 표시 순서 등)
          id: column.id,
          label: column.label
        };
      }
      
      return column;
    });
  }, [columns, columnsWithActions]);

  // 전체합계 설정 - 입금문의 페이지용
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all'
    },
    columns: {
      amount: { type: 'sum', format: 'currency' },
      before_balance: { type: 'sum', format: 'currency' },
      after_balance: { type: 'sum', format: 'currency' }
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

  // 행 클릭 핸들러
  const handleRowClick = (row) => {
    console.log('입금신청 행 클릭:', row);
  };

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="입금문의"
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

      {/* 탭 메뉴 */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`전체 (${counts.all})`} 
            value="all" 
            sx={{ minWidth: 100 }}
          />
          <Tab 
            label={`요청 중 (${counts.pending})`} 
            value="pending"
            sx={{ minWidth: 120, color: theme.palette.warning.main }}
          />
          <Tab 
            label={`대기 (${counts.waiting})`} 
            value="waiting"
            sx={{ minWidth: 100, color: theme.palette.info.main }}
          />
          <Tab 
            label={`승인 (${counts.approved})`} 
            value="approved"
            sx={{ minWidth: 100, color: theme.palette.success.main }}
          />
          <Tab 
            label={`비승인 (${counts.rejected})`} 
            value="rejected"
            sx={{ minWidth: 100, color: theme.palette.error.main }}
          />
        </Tabs>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        {/* 테이블 헤더 컴포넌트 */}
        <TableHeader
          title="입금문의 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##건의 입금문의"
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
          searchPlaceholder="입금신청 검색..."
          sx={{ mb: 2 }}
        />

        {/* 일괄 액션 버튼 */}
        {tableCheckedItems.length > 0 && activeTab === 'pending' && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={async () => {
                if (confirm(`선택한 ${tableCheckedItems.length}건을 승인하시겠습니까?`)) {
                  try {
                    const response = await depositInquiriesService.bulkUpdate({
                      ids: tableCheckedItems,
                      status: 'approved'
                    });
                    if (response.success) {
                      alert(response.message);
                      loadData();
                      tableHandleToggleAll(false);
                    }
                  } catch (err) {
                    alert('일괄 승인에 실패했습니다.');
                  }
                }
              }}
            >
              선택 승인 ({tableCheckedItems.length})
            </Button>
            <Button
              variant="contained"
              color="info"
              size="small"
              onClick={async () => {
                if (confirm(`선택한 ${tableCheckedItems.length}건을 대기 처리하시겠습니까?`)) {
                  try {
                    const response = await depositInquiriesService.bulkUpdate({
                      ids: tableCheckedItems,
                      status: 'waiting'
                    });
                    if (response.success) {
                      alert(response.message);
                      loadData();
                      tableHandleToggleAll(false);
                    }
                  } catch (err) {
                    alert('일괄 대기 처리에 실패했습니다.');
                  }
                }
              }}
            >
              선택 대기 ({tableCheckedItems.length})
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={async () => {
                const reason = prompt('비승인 사유를 입력하세요:');
                if (reason !== null) {
                  if (confirm(`선택한 ${tableCheckedItems.length}건을 비승인하시겠습니까?`)) {
                    try {
                      const response = await depositInquiriesService.bulkUpdate({
                        ids: tableCheckedItems,
                        status: 'rejected',
                        rejectReason: reason
                      });
                      if (response.success) {
                        alert(response.message);
                        loadData();
                        tableHandleToggleAll(false);
                      }
                    } catch (err) {
                      alert('일괄 비승인에 실패했습니다.');
                    }
                  }
                }
              }}
            >
              선택 비승인 ({tableCheckedItems.length})
            </Button>
          </Box>
        )}

        <Box sx={{ width: '100%' }}>
          <TableFilterAndPagination
            filterProps={{
              columns: columnsWithActions,
              filterValues: filterValues || {},
              activeFilters: activeFilters || {},
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

          {/* 테이블 높이 설정 */}
          {/* <TableHeightSetting
            autoHeight={autoHeight}
            tableHeight={tableHeight}
            toggleAutoHeight={toggleAutoHeight}
            setManualHeight={setManualHeight}
            sx={{ mb: 1 }}
          /> */}
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
          {console.log('BaseTable 렌더링:', {
            columnsCount: finalColumns.length,
            dataCount: visibleData.length,
            firstData: visibleData[0],
            finalColumns: finalColumns.map(col => ({
              id: col.id,
              label: col.label,
              type: col.type,
              hasRender: !!col.render,
              renderFunction: col.render ? col.render.toString().substring(0, 100) : 'no render'
            }))
          })}
          <BaseTable
            key={`deposit-table-${tableKey}`}
            columns={finalColumns}
            data={visibleData}
            checkable={true}
            hierarchical={false}
            indentMode={false}
            checkedItems={tableCheckedItems}
            expandedRows={tableExpandedRows}
            allChecked={tableAllChecked}
            onCheck={tableHandleCheck}
            onToggleAll={tableHandleToggleAll}
            onToggleExpand={handleToggleExpand2}
            onSort={tableHandleSort}
            sortConfig={tableSortConfig}
            page={currentPage}
            rowsPerPage={currentRowsPerPage}
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
          />
        </Box>
      </Paper>

      {/* 회원 상세정보 다이얼로그 */}
      <MemberDetailDialog
        open={memberDetailDialogOpen}
        onClose={handleMemberDetailClose}
        member={selectedMemberForDetail}
        onSave={handleMemberDetailSave}
        title="회원 상세정보"
      />
      
      {/* 비승인 사유 다이얼로그 */}
      <RejectReasonDialog
        open={rejectReasonDialog.open}
        onClose={() => setRejectReasonDialog({ open: false, reason: '' })}
        reason={rejectReasonDialog.reason}
        title="입금문의 비승인 사유"
      />
    </PageContainer>
  );
};

export default DepositPage; 