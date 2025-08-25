import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, useTheme, Button, Chip, Tabs, Tab, CircularProgress, Alert, Stack } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectNotificationById } from '../../features/notifications/notificationsSlice';
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
import MessageDetailDialog from '../../components/dialogs/MessageDetailDialog';
import MemberDetailDialog from '../../components/dialogs/MemberDetailDialog';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  messagesColumns,
  statusOptions,
  messageTypeOptions
} from './data/messagesData';
import useCustomerService from '../../hooks/useCustomerService';
import SentMessages from './components/SentMessages';
import SendMessage from './components/SendMessage';
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

/**
 * 문의관리 페이지
 * 고객 문의 목록 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const MessagesPage = () => {
  const theme = useTheme();
  const location = useLocation();

  // 탭 상태 (0: 받은문의, 1: 보낸문의, 2: 문의보내기)
  // location.state에서 activeTab이 있으면 사용, 없으면 0
  const [currentTab, setCurrentTab] = useState(location.state?.activeTab || 0);

  // Redux에서 고객센터 알림 상태 가져오기
  const customerServiceNotification = useSelector(state => 
    selectNotificationById(state, 'customer-service')
  );
  
  // 실시간 카운트 (Redux 상태 우선, 없으면 0)
  const realtimePendingCount = customerServiceNotification?.requests || 0;
  const realtimeWaitingCount = customerServiceNotification?.pending || 0;

  // 전역 알림 사용
  const { handleRefresh } = useNotification();

  // 탭 변경 핸들러
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // 새로고침 핸들러
  const handleRefreshClick = useCallback(() => {
    handleRefresh('문의관리');
  }, [handleRefresh]);

  // 고객 서비스 데이터 훅 사용
  const {
    messages: data,
    allMessages: allData,
    loading: isLoading,
    allLoading: isAllLoading,
    error,
    fetchMessages,
    fetchAllMessages,
    updateMessageStatus: updateStatus,
    replyToMessage,
    deleteMessage,
    sendMessage
  } = useCustomerService();
  
  // isInitialized와 기타 필요한 변수 설정
  const isInitialized = !isLoading;
  const membersData = [];
  const types = {};
  const typeHierarchy = {};

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

  // 컬럼 가시성 관리 - useColumnVisibility 훅 사용
  const {
    visibleColumns,
    toggleColumnVisibility,
    resetToDefault,
    columnVisibility,
    toggleableColumns,
    hiddenColumnsCount,
    showAllColumns
  } = useColumnVisibility(messagesColumns || [], {
    storageKey: 'messages-column-visibility'
  });

  // 다이얼로그 상태
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  const isDisplayOptionsOpen = Boolean(displayOptionsAnchor);

  // 표시 옵션 다이얼로그 핸들러
  const handleDisplayOptionsClick = useCallback((anchorEl) => {
    setDisplayOptionsAnchor(anchorEl);
  }, []);

  const handleDisplayOptionsClose = useCallback(() => {
    setDisplayOptionsAnchor(null);
  }, []);

  // API에서 가져온 데이터를 직접 사용 (Single Source of Truth)
  // 현재 탭에 따라 다른 데이터 소스 사용
  const finalData = useMemo(() => {
    // 전체문의 탭(0)일 때는 allData 사용, 나머지는 data 사용
    return currentTab === 0 ? (allData || []) : (data || []);
  }, [currentTab, allData, data]);

  // 문의상세정보 다이얼로그 상태
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // 회원상세정보 다이얼로그 상태 (아이디 클릭 시)
  const [selectedMember, setSelectedMember] = useState(null);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);

  // 상태 라벨 매핑
  const statusLabelMap = {
    'unread': '미읽음',
    'read': '읽음',  
    'pending': '대기',
    'replied': '회신',
    'resolved': '해결'
  };

  // 상태 변경 핸들러
  const handleStatusChange = useCallback(async (messageId, newStatus) => {
    console.log('handleStatusChange 호출됨, messageId:', messageId, 'newStatus:', newStatus);
    try {
      // API 호출하여 상태 변경 (useCustomerService에서 로컬 상태 업데이트 처리)
      await updateStatus(messageId, newStatus);
      console.log('updateStatus 성공');
      
      // 선택된 메시지도 업데이트
      if (selectedMessage && selectedMessage.id === messageId) {
        const updatedMessage = data?.find(msg => msg.id === messageId);
        if (updatedMessage) {
          setSelectedMessage(updatedMessage);
        }
      }
      
    } catch (error) {
      console.error('상태 변경 오류:', error);
      // 에러 발생 시 데이터 새로고침하여 서버 상태와 동기화
      await fetchMessages();
    }
  }, [updateStatus, fetchMessages, selectedMessage, data]);

  // 문의 삭제 핸들러
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (window.confirm('이 문의를 삭제하시겠습니까?')) {
      try {
        // API 호출하여 삭제 (useCustomerService에서 로컬 상태 업데이트 처리)
        await deleteMessage(messageId);
        
        // 선택된 메시지가 삭제된 메시지인 경우 다이얼로그 닫기
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
          setOpenDetailDialog(false);
        }
      } catch (error) {
        console.error('삭제 오류:', error);
        // 에러 발생 시 데이터 새로고침
        await fetchMessages();
      }
    }
  }, [deleteMessage, selectedMessage, fetchMessages]);

  // 문의 상세보기 핸들러 (제목 클릭 시)
  const handleViewMessage = useCallback(async (message) => {
    console.log('handleViewMessage 호출됨, message:', message);
    console.log('message.status:', message.status);
    console.log('message.statusValue:', message.statusValue);
    
    setSelectedMessage(message);
    setOpenDetailDialog(true);
    
    // 미읽음 상태인 경우 읽음으로 변경
    if (message.status?.id === 'unread' || message.status?.label === '미읽음' || message.statusValue === 'unread') {
      console.log('읽음 상태로 변경 시도, message.id:', message.id);
      await handleStatusChange(message.id, 'read');
    }
  }, [handleStatusChange]);

  // 회원 상세보기 핸들러 (아이디 클릭 시)
  const handleMemberDetailOpen = useCallback((member) => {
    setSelectedMember(member);
    setOpenMemberDialog(true);
  }, []);

  // 테이블 필터 및 페이지네이션 설정
  const {
    currentPage,
    currentRowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    searchText,
    handleSearchChange,
    handleClearSearch,
    handleFilterChange,
    activeFilters,
    sequentialPageNumbers,
    togglePageNumberMode
  } = useTableFilterAndPagination({
    data: finalData || [],
    storageKey: 'messages-table-pagination',
    searchFields: ['title', 'memberInfo', 'username', 'nickname'],
    defaultRowsPerPage: 25,
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25
    }
  });

  // 수동으로 데이터 필터링
  const safeFilteredData = useMemo(() => {
    let filtered = [...(finalData || [])];
    
    // 검색어 필터링
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.memberInfo?.toLowerCase().includes(searchLower) ||
        item.username?.toLowerCase().includes(searchLower) ||
        item.nickname?.toLowerCase().includes(searchLower)
      );
    }
    
    // 다른 필터 적용
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        filtered = filtered.filter(item => {
          if (key === 'memberType' && item.memberType) {
            return item.memberType.id === value;
          }
          if (key === 'status' && item.status) {
            const statusValue = typeof item.status === 'string' ? item.status : item.status.label;
            return statusValue === value || (statusOptions.find(opt => opt.label === statusValue)?.value === value);
          }
          if (key === 'inquiryType' && item.inquiryType) {
            const typeValue = typeof item.inquiryType === 'string' ? item.inquiryType : item.inquiryType.label;
            return typeValue === value || (messageTypeOptions.find(opt => opt.label === typeValue)?.value === value);
          }
          return true;
        });
      }
    });
    
    return filtered;
  }, [finalData, searchText, activeFilters]);

  const totalCount = safeFilteredData.length;

  // 필터 옵션 정의
  const filterOptions = [
    {
      id: 'memberType',
      label: '회원 유형',
      items: [
        { value: '', label: '전체' },
        { value: 'member', label: '회원' },
        { value: 'agent', label: '에이전트' },
        { value: 'dealer', label: '딜러' },
        { value: 'admin', label: '관리자' }
      ]
    },
    {
      id: 'status',
      label: '상태',
      items: [
        { value: '', label: '전체' },
        ...statusOptions.map(option => ({
          value: option.value,
          label: option.label
        }))
      ]
    },
    {
      id: 'inquiryType',
      label: '문의 유형',
      items: [
        { value: '', label: '전체' },
        ...messageTypeOptions.map(option => ({
          value: option.value,
          label: option.label
        }))
      ]
    }
  ];

  // 테이블 컬럼 드래그 훅 사용
  const {
    dragHandlers,
    dragInfo,
    handleColumnOrderChange,
    pinnedColumns,
    toggleColumnPin,
    isColumnPinned,
    clearAllPinnedColumns,
    hasPinnedColumns
  } = useTableColumnDrag({
    initialColumns: visibleColumns,
    tableId: 'messages-table',
    enableColumnPinning: true,
    initialPinnedColumns: ['index', 'memberType', 'memberInfo']
  });

  // 테이블 헤더 설정
  const { 
    isGridReady, 
    setGridReady,
    headerToggleColumnPin
  } = useTableHeader({
    initialTotalItems: totalCount,
    onSearch: (value) => {
      console.log(`문의 검색어: ${value}`);
      if (currentPage !== 0) {
        handlePageChange(0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      if (pinnedColumns.length > 0) {
        clearAllPinnedColumns();
      } else {
        if (!isColumnPinned('index')) toggleColumnPin('index');
        if (!isColumnPinned('memberType')) toggleColumnPin('memberType');
        if (!isColumnPinned('memberInfo')) toggleColumnPin('memberInfo');
      }
    }
  });

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  // 전체문의 탭 선택 시 데이터 로드
  useEffect(() => {
    if (currentTab === 0) {
      fetchAllMessages();
    }
  }, [currentTab, fetchAllMessages]);

  // 최종 컬럼 (가시성 적용)
  const finalColumns = useMemo(() => {
    if (!visibleColumns || visibleColumns.length === 0) {
      return [];
    }
    
    return visibleColumns.map(column => {
      if (column.id === 'title') {
        return {
          ...column,
          type: 'clickable',
          clickable: true,
          onClick: (row) => {
            handleViewMessage(row);
          }
        };
      }
      
      if (column.id === 'memberInfo') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => handleMemberDetailOpen(row)
        };
      }
      
      if (column.id === 'memberType') {
        return {
          ...column,
          type: 'chip',
          render: (row) => {
            if (!row.memberTypeLabel) return { label: '미분류', color: 'default', variant: 'outlined' };
            return {
              label: row.memberTypeLabel,
              color: row.memberTypeColor || 'default',
              variant: 'outlined'
            };
          }
        };
      }
      
      if (column.id === 'inquiryType') {
        return {
          ...column,
          type: 'chip',
          render: (row) => {
            if (!row.inquiryTypeLabel) return { label: '미분류', color: 'default', variant: 'outlined' };
            return {
              label: row.inquiryTypeLabel,
              color: row.inquiryTypeColor || 'default',
              variant: 'outlined'
            };
          }
        };
      }
      
      if (column.id === 'status') {
        return {
          ...column,
          type: 'chip',
          render: (row) => {
            if (!row.statusLabel) return { label: '미읽음', color: 'error', variant: 'outlined' };
            return {
              label: row.statusLabel,
              color: row.statusColor || 'default',
              variant: row.statusVariant || 'outlined'
            };
          }
        };
      }
      
      if (column.id === 'actions') {
        // buttons 배열의 각 버튼에 onClick 핸들러 추가
        const buttonsWithHandlers = column.buttons.map(button => ({
          ...button,
          onClick: (row) => {
            switch(button.type) {
              case 'reply':
                handleViewMessage(row);
                // 회신 다이얼로그에서 회신 완료 시 상태를 'replied'로 변경
                // 여기서는 다이얼로그만 열고, 실제 상태 변경은 다이얼로그에서 처리
                break;
              case 'pending':
                handleStatusChange(row.id, 'pending');
                break;
              case 'delete':
                handleDeleteMessage(row.id);
                break;
            }
          }
        }));
        
        return {
          ...column,
          buttons: buttonsWithHandlers
        };
      }
      
      return column;
    });
  }, [visibleColumns, handleViewMessage, handleMemberDetailOpen, handleStatusChange, handleDeleteMessage]);

  // 행 클릭 핸들러 - 제거 (제목 클릭으로만 처리)
  const handleRowClick = null;

  // 체크박스 관련 상태 및 핸들러
  const [selectedItems, setSelectedItems] = useState([]);
  
  // 선택된 아이템 상태를 객체 형태로 변환
  const checkedItems = useMemo(() => {
    const result = {};
    selectedItems.forEach(id => {
      result[id] = true;
    });
    return result;
  }, [selectedItems]);

  // 모든 아이템이 선택되었는지 확인
  const allChecked = useMemo(() => {
    // safeFilteredData가 없거나 길이가 0이면 false 반환
    if (!safeFilteredData || safeFilteredData.length === 0) {
      return false;
    }
    
    const currentPageData = safeFilteredData.slice(
      (currentPage || 0) * (currentRowsPerPage || 25),
      ((currentPage || 0) + 1) * (currentRowsPerPage || 25)
    );
    
    // 현재 페이지에 데이터가 없으면 false 반환
    if (!currentPageData || currentPageData.length === 0) {
      return false;
    }
    
    // 모든 아이템이 선택되었는지 확인
    return currentPageData.every(item => selectedItems.includes(item.id));
  }, [safeFilteredData, currentPage, currentRowsPerPage, selectedItems]);

  // 체크박스 변경 핸들러
  const handleCheck = useCallback((id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  }, []);

  // 모든 체크박스 토글 핸들러
  const handleToggleAll = useCallback((checked) => {
    // safeFilteredData가 없거나 길이가 0이면 아무 작업도 하지 않음
    if (!safeFilteredData || safeFilteredData.length === 0) {
      return;
    }
    
    if (checked) {
      const currentPageIds = safeFilteredData
        .slice(
          (currentPage || 0) * (currentRowsPerPage || 25),
          ((currentPage || 0) + 1) * (currentRowsPerPage || 25)
        )
        .map(item => item.id);
      
      setSelectedItems(prev => {
        const newItems = [...prev];
        currentPageIds.forEach(id => {
          if (!newItems.includes(id)) {
            newItems.push(id);
          }
        });
        return newItems;
      });
    } else {
      const currentPageIds = safeFilteredData
        .slice(
          (currentPage || 0) * (currentRowsPerPage || 25),
          ((currentPage || 0) + 1) * (currentRowsPerPage || 25)
        )
        .map(item => item.id);
      
      setSelectedItems(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  }, [safeFilteredData, currentPage, currentRowsPerPage]);

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // 정렬 핸들러
  const handleSort = useCallback((columnId, direction) => {
    setSortConfig({ key: columnId, direction });
  }, []);

  // 액션 버튼들
  const actionButtons = useMemo(() => [
    {
      label: '선택 삭제',
      variant: 'outlined',
      color: 'error',
      disabled: selectedItems.length === 0,
      onClick: () => {
        if (window.confirm(`선택된 ${selectedItems.length}개의 문의를 삭제하시겠습니까?`)) {
          setLocalMessagesData(prevData => {
            return prevData.filter(message => !selectedItems.includes(message.id));
          });
          setSelectedItems([]);
        }
      }
    }
  ], [selectedItems]);

  // 전체문의 탭 렌더링
  const renderAllMessages = () => {

    if (isAllLoading) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>데이터를 불러오는 중...</Typography>
          </Box>
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            데이터를 불러오는 중 오류가 발생했습니다: {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => fetchAllMessages()}
            startIcon={<Refresh />}
          >
            다시 시도
          </Button>
        </Paper>
      );
    }

    // allData를 사용하여 localMessagesData 설정
    const allMessagesData = allData || [];

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* 테이블 헤더 */}
        <TableHeader
          title="전체 문의"
          totalItems={allMessagesData.length}
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
          searchPlaceholder="문의 검색..."
          sx={{ mb: 2 }}
        />

        {/* 테이블 높이 설정 */}
        <TableHeightSetting
          autoHeight={autoHeight}
          tableHeight={tableHeight}
          toggleAutoHeight={toggleAutoHeight}
          setManualHeight={setManualHeight}
        />

        {/* 테이블 필터 및 페이지네이션 */}
        <TableFilterAndPagination
          filterProps={{
            activeFilters: activeFilters,
            handleFilterChange: (filterId, filterValue) => {
              const newFilters = { ...activeFilters, [filterId]: filterValue };
              handleFilterChange(newFilters);
            },
            filterOptions: [
              {
                id: 'direction',
                label: '유형',
                items: [
                  { value: '', label: '전체' },
                  { value: 'received', label: '받은' },
                  { value: 'sent', label: '보낸' }
                ]
              },
              ...filterOptions
            ],
            showDateFilter: false
          }}
          paginationProps={{
            count: allMessagesData.length || 0,
            page: currentPage || 0,
            rowsPerPage: currentRowsPerPage || 25,
            onPageChange: handlePageChange,
            onRowsPerPageChange: handleRowsPerPageChange
          }}
        />

        {/* 테이블 컨테이너 */}
        <Box ref={containerRef} sx={{ position: 'relative' }}>
          <BaseTable
            data={(() => {
              const slicedData = allMessagesData.slice(
                (currentPage || 0) * (currentRowsPerPage || 25),
                ((currentPage || 0) + 1) * (currentRowsPerPage || 25)
              ).map(item => {
                const normalized = { ...item };
                
                // status 처리
                if (normalized.status && typeof normalized.status === 'object') {
                  normalized.statusLabel = normalized.status.label;
                  normalized.statusColor = normalized.status.color;
                  normalized.statusVariant = normalized.status.variant;
                  normalized.status = normalized.status.label;
                }
                
                // direction 처리
                if (normalized.directionInfo) {
                  normalized.directionLabel = normalized.directionInfo.label;
                  normalized.directionColor = normalized.directionInfo.color;
                }
                
                // memberType 처리
                if (normalized.memberType && typeof normalized.memberType === 'object') {
                  normalized.memberTypeLabel = normalized.memberType.label;
                  normalized.memberTypeColor = normalized.memberType.color;
                  normalized.memberType = normalized.memberType.label;
                }
                
                // inquiryType 처리
                if (normalized.inquiryType && typeof normalized.inquiryType === 'object') {
                  normalized.inquiryTypeLabel = normalized.inquiryType.label;
                  normalized.inquiryTypeColor = normalized.inquiryType.color;
                  normalized.inquiryType = normalized.inquiryType.label;
                }
                
                return normalized;
              });
              return slicedData;
            })()}
            columns={(() => {
              // 기존 컬럼에 direction 컬럼 추가
              const allColumns = [
                ...finalColumns.slice(0, 2), // index, memberType
                {
                  id: 'direction',
                  label: '유형',
                  width: 80,
                  type: 'chip',
                  render: (row) => ({
                    label: row.directionLabel || '받은',
                    color: row.directionColor || 'secondary',
                    variant: 'outlined'
                  })
                },
                ...finalColumns.slice(2) // 나머지 컬럼들
              ];
              return allColumns;
            })()}
            checkable={true}
            checkedItems={checkedItems}
            allChecked={allChecked}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
            sortConfig={sortConfig}
            onSort={handleSort}
            onRowClick={handleRowClick}
            page={currentPage || 0}
            rowsPerPage={currentRowsPerPage || 25}
            totalCount={allMessagesData.length || 0}
            sequentialPageNumbers={sequentialPageNumbers || false}
            tableHeaderRef={tableHeaderRef}
            headerStyle={getTableHeaderStyles()}
            fixedHeader={true}
            maxHeight={tableHeight}
            draggableColumns={true}
            onColumnOrderChange={handleColumnOrderChange}
            dragHandlers={dragHandlers}
            dragInfo={dragInfo}
            pinnedColumns={pinnedColumns}
          />

          {/* 테이블 리사이즈 핸들 */}
          <TableResizeHandle 
            resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
            isDragging={isDragging}
          />
        </Box>
      </Paper>
    );
  };

  // 받은문의 탭 렌더링
  const renderReceivedMessages = () => {
    if (isLoading) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>데이터를 불러오는 중...</Typography>
          </Box>
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            데이터를 불러오는 중 오류가 발생했습니다: {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => fetchMessages()}
            startIcon={<Refresh />}
          >
            다시 시도
          </Button>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* 테이블 헤더 */}
        <TableHeader
        title="받은 문의"
        totalItems={totalCount}
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
        searchPlaceholder="문의 검색..."
        sx={{ mb: 2 }}
      />

      {/* 테이블 높이 설정 */}
      <TableHeightSetting
        autoHeight={autoHeight}
        tableHeight={tableHeight}
        toggleAutoHeight={toggleAutoHeight}
        setManualHeight={setManualHeight}
      />

      {/* 테이블 필터 및 페이지네이션 */}
      <TableFilterAndPagination
        filterProps={{
          activeFilters: activeFilters,
          handleFilterChange: (filterId, filterValue) => {
            const newFilters = { ...activeFilters, [filterId]: filterValue };
            handleFilterChange(newFilters);
          },
          filterOptions: filterOptions,
          showDateFilter: false
        }}
        paginationProps={{
          count: totalCount || 0,
          page: currentPage || 0,
          rowsPerPage: currentRowsPerPage || 25,
          onPageChange: handlePageChange,
          onRowsPerPageChange: handleRowsPerPageChange
        }}
      />

      {/* 테이블 컨테이너 */}
      <Box ref={containerRef} sx={{ position: 'relative' }}>
        <BaseTable
          data={(() => {
            const slicedData = safeFilteredData.slice(
              (currentPage || 0) * (currentRowsPerPage || 25),
              ((currentPage || 0) + 1) * (currentRowsPerPage || 25)
            ).map(item => {
              // 객체를 문자열로 변환하여 React 렌더링 오류 방지
              const normalized = { ...item };
              
              // status 처리
              if (normalized.status && typeof normalized.status === 'object') {
                normalized.statusLabel = normalized.status.label;
                normalized.statusColor = normalized.status.color;
                normalized.statusVariant = normalized.status.variant;
                normalized.status = normalized.status.label;
              }
              
              // memberType 처리
              if (normalized.memberType && typeof normalized.memberType === 'object') {
                normalized.memberTypeLabel = normalized.memberType.label;
                normalized.memberTypeColor = normalized.memberType.color;
                normalized.memberType = normalized.memberType.label;
              }
              
              // inquiryType 처리
              if (normalized.inquiryType && typeof normalized.inquiryType === 'object') {
                normalized.inquiryTypeLabel = normalized.inquiryType.label;
                normalized.inquiryTypeColor = normalized.inquiryType.color;
                normalized.inquiryType = normalized.inquiryType.label;
              }
              
              return normalized;
            });
            return slicedData;
          })()}
          columns={finalColumns || []}
          checkable={true}
          checkedItems={checkedItems}
          allChecked={allChecked}
          onCheck={handleCheck}
          onToggleAll={handleToggleAll}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={handleRowClick}
          page={currentPage || 0}
          rowsPerPage={currentRowsPerPage || 25}
          totalCount={totalCount || 0}
          sequentialPageNumbers={sequentialPageNumbers || false}
          tableHeaderRef={tableHeaderRef}
          headerStyle={getTableHeaderStyles()}
          fixedHeader={true}
          maxHeight={tableHeight}
          draggableColumns={true}
          onColumnOrderChange={handleColumnOrderChange}
          dragHandlers={dragHandlers}
          dragInfo={dragInfo}
          pinnedColumns={pinnedColumns}
        />

        {/* 테이블 리사이즈 핸들 */}
        <TableResizeHandle 
          resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
          isDragging={isDragging}
        />
      </Box>
    </Paper>
    );
  };

  return (
    <PageContainer>
      <PageHeader 
        title="문의관리"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        onRefresh={handleRefreshClick}
        showDisplayOptionsButton={true}
        showRefreshButton={true}
        showAddButton={false}
        titleTabs={
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 'auto',
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
              },
              '& .MuiTab-root': {
                minHeight: 'auto',
                padding: '6px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#666',
                '&.Mui-selected': {
                  color: '#1976d2',
                },
              },
            }}
          >
            <Tab label="전체문의" />
            <Tab label="받은문의" />
            <Tab label="보낸문의" />
            <Tab label="문의보내기" />
          </Tabs>
        }
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

      {/* 탭 내용 */}
      {currentTab === 0 && renderAllMessages()}
      {currentTab === 1 && renderReceivedMessages()}
      {currentTab === 2 && <SentMessages />}
      {currentTab === 3 && <SendMessage />}

      {/* 문의 상세 다이얼로그 */}
      <MessageDetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        message={selectedMessage}
        onStatusChange={handleStatusChange}
        onReply={replyToMessage}
      />

      {/* 회원 상세 다이얼로그 */}
      <MemberDetailDialog
        open={openMemberDialog}
        onClose={() => setOpenMemberDialog(false)}
        member={selectedMember}
      />
    </PageContainer>
  );
};

export default MessagesPage;