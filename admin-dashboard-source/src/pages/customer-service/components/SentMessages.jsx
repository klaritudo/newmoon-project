import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, useTheme, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Divider, CircularProgress, Alert } from '@mui/material';
import { Close as CloseIcon, Refresh } from '@mui/icons-material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TableHeightSetting, 
  TableResizeHandle, 
  TableDebugInfo 
} from '../../../components/baseTemplate/components';
import { 
  useTableFilterAndPagination, 
  useTableHeader, 
  useTableColumnDrag,
  useTableData,
  useTableHeaderFixed,
  useTableAutoHeight,
  useTableResize,
  useTable
} from '../../../components/baseTemplate/hooks';
import { 
  sentMessagesColumns,
  sentStatusOptions,
  recipientTypeOptions
} from '../data/sentMessagesData';
import useCustomerService from '../../../hooks/useCustomerService';

/**
 * 보낸문의 컴포넌트
 * 관리자가 고객/에이전트에게 보낸 문의 목록을 관리합니다.
 */
const SentMessages = () => {
  const theme = useTheme();

  // useCustomerService 훅 사용
  const { 
    sentMessages, 
    sentLoading, 
    fetchSentMessages,
    sendMessage,
    resendMessage,
    deleteMessage,
    cancelMessage
  } = useCustomerService();

  // 로컬 상태로 데이터 관리
  const [localSentMessagesData, setLocalSentMessagesData] = useState([]);

  // API 데이터로 로컬 상태 업데이트
  useEffect(() => {
    console.log('🔍 sentMessages 원본 데이터:', sentMessages);
    if (sentMessages && sentMessages.length > 0) {
      console.log('🔍 첫 번째 sentMessage 구조:', sentMessages[0]);
      console.log('🔍 recipientType:', sentMessages[0].recipientType);
      console.log('🔍 status:', sentMessages[0].status);
    }
    setLocalSentMessagesData(sentMessages || []);
  }, [sentMessages]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSentMessages();
  }, [fetchSentMessages]);

  // 보낸문의 상세보기 다이얼로그 상태
  const [selectedSentMessage, setSelectedSentMessage] = useState(null);
  const [openSentDetailDialog, setOpenSentDetailDialog] = useState(false);

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

  // 보낸문의 상세보기 핸들러
  const handleViewSentMessage = useCallback((sentMessage) => {
    console.log('보낸문의 상세보기:', sentMessage);
    setSelectedSentMessage(sentMessage);
    setOpenSentDetailDialog(true);
  }, []);

  // 재발송 핸들러
  const handleResend = useCallback(async (messageId) => {
    console.log('재발송:', messageId);
    if (confirm('이 문의를 재발송하시겠습니까?')) {
      try {
        // API 호출
        const result = await resendMessage(messageId);
        if (result.success) {
          // 성공 시 목록 새로고침 (useCustomerService에서 이미 처리)
          console.log('재발송 성공');
        }
      } catch (error) {
        console.error('재발송 오류:', error);
      }
    }
  }, [resendMessage]);

  // 보낸문의 삭제 핸들러
  const handleDeleteSentMessage = useCallback(async (messageId) => {
    console.log('보낸문의 삭제:', messageId);
    if (confirm('이 보낸문의를 삭제하시겠습니까?')) {
      try {
        // API 호출
        const result = await deleteMessage(messageId);
        if (result.success) {
          // 성공 시 목록 새로고침 (useCustomerService에서 이미 처리)
          console.log('삭제 성공');
        }
      } catch (error) {
        console.error('삭제 오류:', error);
      }
    }
  }, [deleteMessage]);

  // 발송취소 핸들러
  const handleCancelSentMessage = useCallback(async (messageId) => {
    console.log('발송취소:', messageId);
    if (confirm('아직 읽지 않은 수신자들에게 발송을 취소하시겠습니까?')) {
      try {
        // API 호출
        const result = await cancelMessage(messageId);
        if (result.success) {
          // 성공 시 목록 새로고침 (useCustomerService에서 이미 처리)
          console.log('발송취소 성공');
        }
      } catch (error) {
        console.error('발송취소 오류:', error);
      }
    }
  }, [cancelMessage]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // useTable 훅 사용
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
    data: localSentMessagesData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 수신자 유형 렌더링 함수
  const renderRecipientType = useCallback((row) => {
    if (!row) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">-</Typography>
        </Box>
      );
    }
    
    // recipientType이 객체인지 문자열인지 확인
    let typeInfo;
    if (typeof row.recipientType === 'object' && row.recipientType !== null) {
      typeInfo = row.recipientType;
    } else if (row.recipientTypeInfo) {
      typeInfo = row.recipientTypeInfo;
    } else {
      // 문자열인 경우 기본값 사용
      typeInfo = {
        label: row.recipientType || '-',
        color: 'default',
        variant: 'outlined'
      };
    }
    
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Chip 
          label={typeInfo.label} 
          color={typeInfo.color || 'default'}
          variant={typeInfo.variant || 'filled'}
          size="small"
        />
      </Box>
    );
  }, []);

  // 상태 렌더링 함수
  const renderStatus = useCallback((row) => {
    if (!row) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">-</Typography>
        </Box>
      );
    }
    
    // status가 객체인지 문자열인지 확인
    let statusInfo;
    if (typeof row.status === 'object' && row.status !== null) {
      statusInfo = row.status;
    } else if (row.statusInfo) {
      statusInfo = row.statusInfo;
    } else {
      // 문자열인 경우 기본값 사용
      statusInfo = {
        label: row.status || '-',
        color: 'default',
        variant: 'outlined'
      };
    }
    
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Chip 
          label={statusInfo.label} 
          color={statusInfo.color || 'default'}
          variant={statusInfo.variant || 'filled'}
          size="small"
        />
      </Box>
    );
  }, []);

  // 수신자수 렌더링 함수
  const renderRecipientCount = useCallback((row) => {
    // 안전한 데이터 처리
    if (!row || !row.recipientCount) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">-</Typography>
        </Box>
      );
    }
    
    const recipientCount = row.recipientCount;
    
    // recipientCount가 객체인지 확인
    if (typeof recipientCount !== 'object' || recipientCount === null) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">-</Typography>
        </Box>
      );
    }
    
    const firstRecipient = recipientCount.firstRecipient || 'user001';
    const total = Number(recipientCount.total) || 0;
    const remainingCount = total - 1;
    
    // 총 1명인 경우
    if (total === 1) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {firstRecipient}
          </Typography>
        </Box>
      );
    }
    
    // 총 2명 이상인 경우 "xxxx 외 x명" 형태로 표시
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {firstRecipient} 외 {remainingCount}명
        </Typography>
      </Box>
    );
  }, []);

  // 읽음여부 렌더링 함수
  const renderReadStatus = useCallback((row) => {
    // 안전한 데이터 처리
    if (!row || !row.readStatus) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">-</Typography>
        </Box>
      );
    }
    
    const readStatus = row.readStatus;
    
    // 발송실패인 경우
    if (readStatus.failed) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Chip
            label="발송실패"
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>
      );
    }
    
    // 발송중인 경우
    if (readStatus.sending) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Chip
            label="발송중"
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>
      );
    }
    
    // 발송취소된 경우
    if (readStatus.cancelled) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Chip
            label="발송취소"
            size="small"
            color="default"
            variant="outlined"
          />
        </Box>
      );
    }
    
    const read = Number(readStatus.read) || 0;
    const unread = Number(readStatus.unread) || 0;
    const total = Number(readStatus.total) || 0;
    
    // 모두 읽은 경우
    if (unread === 0) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Chip
            label="모두 읽음"
            size="small"
            color="success"
            variant="outlined"
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {read}/{total}
          </Typography>
        </Box>
      );
    }
    
    // 일부만 읽은 경우
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Chip
          label="일부 읽음"
          size="small"
          color="warning"
          variant="outlined"
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          {read}/{total} (미읽음 {unread})
        </Typography>
      </Box>
    );
  }, []);

  // 액션 버튼 렌더링 함수
  const renderSentActions = useCallback((row) => {
    // 안전한 데이터 처리
    if (!row) {
      return (
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}>
          <Typography variant="body2">-</Typography>
        </Box>
      );
    }
    
    const statusValue = row.status?.value || row.status || 'unknown';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        gap: 0.5, 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* 상세보기 버튼 (모든 상태) */}
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleViewSentMessage(row);
          }}
          sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
        >
          상세
        </Button>
        
        {/* 발송취소 버튼 (읽지 않은 메시지가 있는 경우에만) */}
        {row.hasUnreadMessages && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelSentMessage(row.id);
            }}
            sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
          >
            발송취소
          </Button>
        )}
        
        {/* 재발송 버튼 (발송실패 시에만) */}
        {statusValue === 'failed' && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={(e) => {
              e.stopPropagation();
              handleResend(row.id);
            }}
            sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
          >
            재발송
          </Button>
        )}
        
        {/* 삭제 버튼 (발송완료, 발송실패 시) */}
        {(statusValue === 'completed' || statusValue === 'failed') && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSentMessage(row.id);
            }}
            sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
          >
            삭제
          </Button>
        )}
        
        {/* 발송중일 때는 상태 표시만 */}
        {statusValue === 'sending' && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'warning.main',
            fontSize: '0.75rem'
          }}>
            발송중...
          </Box>
        )}
      </Box>
    );
  }, [handleViewSentMessage, handleResend, handleDeleteSentMessage, handleCancelSentMessage]);

  // 컬럼에 렌더링 함수 추가
  const columnsWithActions = useMemo(() => {
    console.log('🔧 columnsWithActions 생성 중...');
    return sentMessagesColumns.map(column => {
      if (column.id === 'subject') {
        console.log('✅ subject 컬럼에 onClick 핸들러 추가');
        return {
          ...column,
          clickable: true,
          onClick: (rowData) => {
            console.log('🎯 보낸문의 제목 클릭:', rowData);
            handleViewSentMessage(rowData);
          }
        };
      }
      if (column.id === 'recipientType') {
        console.log('✅ recipientType 컬럼에 render 함수 추가');
        return {
          ...column,
          render: renderRecipientType
        };
      }
      if (column.id === 'status') {
        console.log('✅ status 컬럼에 render 함수 추가');
        return {
          ...column,
          render: renderStatus
        };
      }
      if (column.id === 'recipientCount') {
        console.log('✅ recipientCount 컬럼에 render 함수 추가:', !!renderRecipientCount);
        return {
          ...column,
          render: renderRecipientCount
        };
      }
      if (column.id === 'readStatus') {
        console.log('✅ readStatus 컬럼에 render 함수 추가:', !!renderReadStatus);
        return {
          ...column,
          render: renderReadStatus
        };
      }
      if (column.id === 'actions') {
        console.log('✅ actions 컬럼에 render 함수 추가:', !!renderSentActions);
        return {
          ...column,
          render: renderSentActions
        };
      }
      return column;
    });
  }, [handleViewSentMessage, renderRecipientType, renderStatus, renderRecipientCount, renderReadStatus, renderSentActions]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return [
      {
        id: 'recipientType',
        label: '수신자 유형',
        items: [
          { value: '', label: '전체' },
          ...recipientTypeOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      },
      {
        id: 'status',
        label: '발송 상태',
        items: [
          { value: '', label: '전체' },
          ...sentStatusOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      }
    ];
  }, []);

  // useTableFilterAndPagination 훅 사용
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
    columns: columnsWithActions,
    data: localSentMessagesData,
    defaultRowsPerPage: 25,
    hierarchical: false,
    filterOptions: {
      initialFilters: { recipientType: '', status: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: localSentMessagesData.length,
      onExcelDownload: () => {
        console.log('보낸문의 엑셀 다운로드');
        alert('보낸문의를 엑셀로 다운로드합니다.');
      },
      onPrint: () => {
        console.log('보낸문의 인쇄');
        alert('보낸문의를 인쇄합니다.');
      }
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
    initialTotalItems: localSentMessagesData.length,
    onSearch: (value) => {
      console.log(`보낸문의 검색: ${value}`);
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
    tableId: 'sent_messages_table',
    initialPinnedColumns: ['index', 'recipientType'],
    onColumnOrderChange: (newColumns) => {
      console.log('보낸문의 테이블 컬럼 순서 변경:', newColumns);
    }
  });

  // 컬럼 드래그 후 render 함수 확인
  useEffect(() => {
    console.log('🔍 최종 columns 확인:');
    columns.forEach(col => {
      if (col.id === 'recipientCount' || col.id === 'readStatus' || col.id === 'actions') {
        console.log(`- ${col.id} 컬럼의 render 함수:`, !!col.render, typeof col.render);
      }
      if (col.id === 'subject') {
        console.log(`- ${col.id} 컬럼의 onClick 핸들러:`, !!col.onClick, typeof col.onClick);
        console.log(`- ${col.id} 컬럼의 clickable:`, col.clickable);
      }
    });
  }, [columns]);

  // 최종 컬럼 설정 - 드래그 후에도 render 함수와 onClick 핸들러 보존
  const finalColumns = useMemo(() => {
    return columns.map(column => {
      const originalColumn = columnsWithActions.find(original => original.id === column.id);
      if (originalColumn) {
        return {
          ...column,
          render: originalColumn.render,
          onClick: originalColumn.onClick,
          clickable: originalColumn.clickable
        };
      }
      return column;
    });
  }, [columns, columnsWithActions]);

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'recipientType':
        if (filterValue === 'all' || filterValue === '') return result;
        return result.filter(item => {
          const typeValue = typeof item.recipientType === 'object' ? item.recipientType.value : item.recipientType;
          return typeValue === filterValue;
        });
        
      case 'status':
        if (filterValue === 'all' || filterValue === '') return result;
        return result.filter(item => {
          const statusValue = typeof item.status === 'object' ? item.status.value : item.status;
          return statusValue === filterValue;
        });
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`보낸문의 필터 변경: ${filterId} = ${value}`);
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
    data: localSentMessagesData,
    activeFilters: safeActiveFilters,
    searchText,
    isDateFilterActive,
    dateRange,
    filterCallback
  });

  // 필터링된 데이터 처리
  const filteredFlatData = useMemo(() => {
    const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    if (!hasActiveFilters && !hasSearchText) {
      return localSentMessagesData;
    }
    
    return computedFilteredData || [];
  }, [localSentMessagesData, computedFilteredData, safeActiveFilters, searchText]);

  const safeFilteredData = filteredFlatData || [];
  const totalFlattenedItems = safeFilteredData.length;

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`보낸문의 페이지 변경: ${currentPage} -> ${pageIndex}`);
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`보낸문의 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    handleRowsPerPageChange(event);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  useEffect(() => {
    setTableKey(Date.now());
  }, [currentPage, currentRowsPerPage]);
  
  const draggableColumns = true;
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // 로딩 상태 처리
  if (sentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>보낸 문의 목록을 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* 테이블 헤더 컴포넌트 */}
      <TableHeader
        title="보낸문의 목록"
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
        searchPlaceholder="제목 또는 수신자로 검색..."
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
            onExcelDownload: () => {
              console.log('보낸문의 엑셀 다운로드');
              alert('보낸문의를 엑셀로 다운로드합니다.');
            },
            onPrint: () => {
              console.log('보낸문의 인쇄');
              alert('보낸문의를 인쇄합니다.');
            }
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
          key={`sent-messages-table-${tableKey}`}
          columns={finalColumns}
          data={safeFilteredData}
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

      {/* 보낸문의 상세 다이얼로그 */}
      {selectedSentMessage && (
        <Dialog
          open={openSentDetailDialog}
          onClose={() => setOpenSentDetailDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { minHeight: '600px' }
          }}
        >
          <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              보낸문의 상세 정보
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOpenSentDetailDialog(false)}
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* 발송 기본 정보 */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        수신자 유형
                      </Typography>
                      <Chip
                        label={
                          typeof selectedSentMessage.recipientType === 'object' 
                            ? selectedSentMessage.recipientType?.label 
                            : selectedSentMessage.recipientTypeInfo?.label || selectedSentMessage.recipientType || '전체'
                        }
                        color={
                          typeof selectedSentMessage.recipientType === 'object'
                            ? selectedSentMessage.recipientType?.color
                            : selectedSentMessage.recipientTypeInfo?.color || 'default'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        발송일시
                      </Typography>
                      <Typography variant="body1">
                        {selectedSentMessage.sentDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        수신자 정보
                      </Typography>
                      <Typography variant="body1">
                        {selectedSentMessage.recipientCount?.firstRecipient} 
                        {selectedSentMessage.recipientCount?.total > 1 && 
                          ` 외 ${selectedSentMessage.recipientCount.total - 1}명`
                        }
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        발송 상태
                      </Typography>
                      <Chip
                        label={
                          typeof selectedSentMessage.status === 'object'
                            ? selectedSentMessage.status?.label
                            : selectedSentMessage.statusInfo?.label || selectedSentMessage.status || '발송완료'
                        }
                        color={
                          typeof selectedSentMessage.status === 'object'
                            ? selectedSentMessage.status?.color
                            : selectedSentMessage.statusInfo?.color || 'default'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        읽음 상태
                      </Typography>
                      {selectedSentMessage.readStatus ? (
                        <Box>
                          {selectedSentMessage.readStatus.failed && (
                            <Chip label="발송실패" size="small" color="error" variant="outlined" />
                          )}
                          {selectedSentMessage.readStatus.sending && (
                            <Chip label="발송중" size="small" color="warning" variant="outlined" />
                          )}
                          {selectedSentMessage.readStatus.cancelled && (
                            <Chip label="발송취소" size="small" color="default" variant="outlined" />
                          )}
                          {!selectedSentMessage.readStatus.failed && 
                           !selectedSentMessage.readStatus.sending && 
                           !selectedSentMessage.readStatus.cancelled && (
                            <>
                              <Chip 
                                label={selectedSentMessage.readStatus.unread === 0 ? "모두 읽음" : "일부 읽음"}
                                size="small" 
                                color={selectedSentMessage.readStatus.unread === 0 ? "success" : "warning"}
                                variant="outlined" 
                              />
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                읽음: {selectedSentMessage.readStatus.read}/{selectedSentMessage.readStatus.total}
                                {selectedSentMessage.readStatus.unread > 0 && ` (미읽음: ${selectedSentMessage.readStatus.unread})`}
                              </Typography>
                            </>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2">-</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        발송자
                      </Typography>
                      <Typography variant="body1">
                        {selectedSentMessage.senderInfo?.name || '관리자'} ({selectedSentMessage.senderInfo?.role || 'admin'})
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* 문의 제목 */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  제목
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {selectedSentMessage.subject}
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* 문의 내용 */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  내용
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.6
                  }}
                >
                  <Typography variant="body1">
                    {selectedSentMessage.content || '내용이 없습니다.'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={() => setOpenSentDetailDialog(false)} 
              variant="outlined"
            >
              닫기
            </Button>
            {selectedSentMessage.hasUnreadMessages && (
              <Button 
                onClick={() => {
                  handleCancelSentMessage(selectedSentMessage.id);
                  setOpenSentDetailDialog(false);
                }} 
                variant="contained" 
                color="secondary"
              >
                발송취소
              </Button>
            )}
            {selectedSentMessage.status?.value === 'failed' && (
              <Button 
                onClick={() => {
                  handleResend(selectedSentMessage.id);
                  setOpenSentDetailDialog(false);
                }} 
                variant="contained" 
                color="warning"
              >
                재발송
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default SentMessages; 