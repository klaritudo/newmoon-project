import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Box, Paper, Typography, useTheme, Button } from '@mui/material';
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
  transactionColumns,
  transactionStatusOptions,
  paymentMethodOptions,
  processorOptions
} from './data/transactionsData';
import { apiOptions, bankList } from '../agent-management/data/membersData';
import useDynamicTypes from '../../hooks/useDynamicTypes';
import MemberDetailDialog from '../../components/dialogs/MemberDetailDialog';
import usePageData from '../../hooks/usePageData';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * 충환내역 페이지
 * 충환 내역 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const TransactionHistoryPage = () => {
  const theme = useTheme();
  
  // Socket 서비스 사용
  const { socketService } = useSocket();
  
  // 전역 알림 사용
  const { handleRefresh } = useNotification();
  
  // 실시간 데이터 업데이트를 위한 state
  const [realtimeUpdates, setRealtimeUpdates] = useState({});
  const lastSequenceRef = useRef(0);

  // 범용 페이지 데이터 훅 사용 (2단계 구조)
  const {
    data: originalData,
    membersData,
    types,
    typeHierarchy,
    isLoading,
    error,
    isInitialized: typesInitialized,
    refreshPageData
  } = usePageData({
    pageType: 'history',
    requiresMembersData: false  // 실제 API 데이터 사용
  });
  
  // 실시간 업데이트가 반영된 데이터
  const data = useMemo(() => {
    if (!originalData) return [];
    
    // 데이터 디버깅
    if (originalData.length > 0) {
      console.log('=== 거래내역 첫 번째 데이터 분석 ===');
      const firstItem = originalData[0];
      Object.entries(firstItem).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          console.log(`${key}:`, value, '← 객체입니다!');
        }
      });
      console.log('===================================');
    }
    
    // 실시간 업데이트가 없으면 원본 데이터 그대로 반환
    if (Object.keys(realtimeUpdates).length === 0) {
      return originalData;
    }
    
    // 실시간 업데이트 반영
    return originalData.map(item => {
      const update = realtimeUpdates[`transaction_${item.id}`];
      if (update) {
        return {
          ...item,
          status: update.status,
          processor: update.processor,
          processTime: update.processTime,
          processorBalanceAfter: update.processorBalanceAfter || item.processorBalanceAfter,
          afterBalance: update.afterBalance || item.afterBalance,
          _realtimeUpdated: true,
          _updateTimestamp: update.timestamp
        };
      }
      return item;
    });
  }, [originalData, realtimeUpdates]);

  // 실시간 웹소켓 이벤트 리스너
  useEffect(() => {
    if (!socketService) return;
    
    const handleMoneyUpdate = (event) => {
      console.log('💰 충환내역: 실시간 머니 업데이트:', event);
      
      // 시퀀스 체크 (중복/누락 방지)
      if (event.sequence <= lastSequenceRef.current) {
        console.warn('⚠️ 중복 이벤트 감지:', event.sequence);
        return;
      }
      lastSequenceRef.current = event.sequence;
      
      if (event.type === 'money:status' || event.type === 'money:created') {
        // 충환내역 표시를 위한 데이터 변환
        const transactionType = event.data.transactionType;
        if (transactionType === 'charge' || transactionType === 'exchange') {
          setRealtimeUpdates(prev => ({
            ...prev,
            [`transaction_${event.data.historyId}`]: {
              ...event.data,
              status: {
                label: event.data.status === 'completed' ? '완료' : 
                       event.data.status === 'pending' ? '대기' : 
                       event.data.status === 'rejected' ? '거절' : '중지',
                color: event.data.status === 'completed' ? 'success' : 
                       event.data.status === 'pending' ? 'warning' : 'error',
                variant: 'outlined'
              },
              processor: event.data.processedBy ? `처리자${event.data.processedBy}` : '-',
              processTime: event.data.status === 'completed' ? 
                new Date(event.timestamp).toLocaleString('ko-KR') : '-',
              timestamp: event.timestamp
            }
          }));
          
          // 데이터 새로고침 (새로운 항목이 추가된 경우)
          if (event.type === 'money:created') {
            setTimeout(() => {
              refreshPageData();
            }, 500);
          }
        }
      }
    };
    
    // 이벤트 리스너 등록
    socketService.on('realtime:money', handleMoneyUpdate);
    
    // cleanup
    return () => {
      socketService.off('realtime:money', handleMoneyUpdate);
    };
  }, [socketService, refreshPageData]);
  
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
    console.log('충환내역 목록 엑셀 다운로드');
    alert('충환내역 목록을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('충환내역 목록 인쇄');
    alert('충환내역 목록을 인쇄합니다.');
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

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return transactionColumns.map(column => {
      // userId 컬럼에 클릭 핸들러 추가
      if (column.id === 'userId') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('아이디 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      return column;
    });
  }, [handleMemberDetailOpen]);

  // 컬럼 표시/숨김 관련 훅 사용 (순서 중요 - 가장 먼저 호출)
  const {
    columnVisibility,
    toggleableColumns,
    visibleColumns,
    hiddenColumnsCount,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(columnsWithActions, {
    defaultHiddenColumns: [],
    tableId: 'transactionHistoryPage_columnVisibility'
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
      console.log('충환내역 컬럼 순서 변경:', newColumns.map(col => col.id));
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
          ...transactionStatusOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      },
      {
        id: 'paymentMethod',
        label: '수단',
        items: [
          { value: '', label: '전체' },
          ...paymentMethodOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      },
      {
        id: 'processor',
        label: '처리자',
        items: [
          { value: '', label: '전체' },
          ...processorOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      },
      {
        id: 'memberType',
        label: '회원유형',
        items: [
          { value: '', label: '전체' },
          ...(typesInitialized && types ? Object.keys(types).map(typeId => ({
            value: typeId,
            label: types[typeId].label || typeId
          })) : [])
        ]
      }
    ];
    
    return baseOptions;
  }, [typesInitialized, types]);

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
        
        return result.filter(item => {
          // 상태가 객체 형태인 경우 처리
          const statusLabel = item.status?.label || item.status;
          
          switch (filterValue) {
            case 'pending':
              return statusLabel === '대기';
            case 'completed':
              return statusLabel === '완료';
            case 'suspended':
              return statusLabel === '중지';
            default:
              return true;
          }
        });
        
      case 'paymentMethod':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          const methodValue = item.paymentMethod?.value || item.paymentMethod;
          return methodValue === filterValue;
        });
        
      case 'processor':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          switch (filterValue) {
            case 'admin1':
              return item.processor?.includes('관리자1');
            case 'admin2':
              return item.processor?.includes('관리자2');
            case 'admin3':
              return item.processor?.includes('관리자3');
            case 'system':
              return item.processor?.includes('시스템');
            default:
              return true;
          }
        });
        
      case 'memberType':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          const memberTypeLabel = item.memberType?.label || item.memberType;
          const targetType = types[filterValue];
          return memberTypeLabel === (targetType?.label || filterValue);
        });
        
      case 'date':
        let dateFilteredResult = [...result];
        
        if (filterValue.startDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id >= 3010);
        }
        
        if (filterValue.endDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id <= 3040);
        }
        
        return dateFilteredResult;
      default:
        return result;
    }
  }, [types]);
  
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
      console.error('충환내역 행 수 변경 이벤트 오류:', event);
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
    
    // status 필드가 객체인 경우 label 값만 추출하도록 데이터 변환
    const normalizedData = safeFilteredData.map(item => {
      const normalized = { ...item };
      
      // status가 객체인 경우 label 값으로 변환
      if (normalized.status && typeof normalized.status === 'object' && normalized.status.label) {
        normalized.status = normalized.status.label;
      }
      
      // paymentMethod가 객체인 경우 label 값으로 변환
      if (normalized.paymentMethod && typeof normalized.paymentMethod === 'object' && normalized.paymentMethod.label) {
        normalized.paymentMethod = normalized.paymentMethod.label;
      }
      
      return normalized;
    });
    
    return normalizedData;
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  // visibleColumns에 버튼 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    return columns.map(column => {
      // userId 컬럼에 클릭 핸들러 추가
      if (column.id === 'userId') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('아이디 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      return column;
    });
  }, [columns, handleMemberDetailOpen]);

  // 전체합계 설정 - 충환내역 페이지용
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all'
    },
    columns: {
      applicationAmount: { type: 'sum', format: 'currency' },
      previousBalance: { type: 'sum', format: 'currency' },
      afterBalance: { type: 'sum', format: 'currency' },
      processorBalance: { type: 'sum', format: 'currency' },
      processorBalanceAfter: { type: 'sum', format: 'currency' }
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
    console.log('충환내역 행 클릭:', row);
  };

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="충환내역"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={() => alert('충환내역 목록 새로고침')}
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
          title="충환내역 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##건의 충환내역"
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
          searchPlaceholder="충환내역 검색..."
          sx={{ mb: 2 }}
        />

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
              resetDateFilter: resetDateFilter,
              showDateFilter: true
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
          <BaseTable
            key={`transaction-history-table-${tableKey}`}
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
    </PageContainer>
  );
};

export default TransactionHistoryPage; 