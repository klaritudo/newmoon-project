import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
// 머니처리내역 페이지 컬럼 설정
const moneyHistoryColumns = [
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
    id: 'memberType',
    header: '유형',
    type: 'hierarchical',
    cellRenderer: 'chip',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processAmount',
    header: '처리금',
    type: 'currency',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'beforeBalance',
    header: '처리전보유금',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'afterBalance',
    header: '처리후보유금',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'type',
    header: '타입',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processor',
    header: '처리자',
    type: 'default',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processTime',
    header: '처리시간',
    type: 'default',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  }
];

// 타입 옵션
const typeOptions = [
  { value: 'charge', label: '입금' },
  { value: 'exchange', label: '출금' },
  { value: 'bonus', label: '보너스' },
  { value: 'adjustment', label: '조정' }
];

// 처리자 옵션
const processorOptions = [
  { value: 'admin1', label: '관리자1' },
  { value: 'admin2', label: '관리자2' },
  { value: 'admin3', label: '관리자3' },
  { value: 'system', label: '시스템' }
];
import { apiOptions, bankList } from './agent-management/data/membersData';
import usePageData from '../hooks/usePageData';
import MemberDetailDialog from '../components/dialogs/MemberDetailDialog';
import dayjs from 'dayjs';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../contexts/NotificationContext';

/**
 * 머니처리내역 페이지
 * 머니 처리 내역 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const MoneyHistoryPage = () => {
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
    pageType: 'moneyHistory',
    requiresMembersData: false
  });
  
  // 실시간 업데이트가 반영된 데이터
  const data = useMemo(() => {
    if (!originalData) return [];
    
    // 실시간 업데이트가 없으면 원본 데이터 그대로 반환
    if (Object.keys(realtimeUpdates).length === 0) {
      return originalData;
    }
    
    // 실시간 업데이트 반영
    return originalData.map(item => {
      const update = realtimeUpdates[`money_${item.id}`];
      if (update) {
        return {
          ...item,
          status: update.status,
          processor: update.processor,
          processTime: update.processTime,
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
      console.log('💰 머니처리내역: 실시간 업데이트:', event);
      
      // 시퀀스 체크 (중복/누락 방지)
      if (event.sequence <= lastSequenceRef.current) {
        console.warn('⚠️ 중복 이벤트 감지:', event.sequence);
        return;
      }
      lastSequenceRef.current = event.sequence;
      
      if (event.type === 'money:status' || event.type === 'money:created') {
        // 머니 처리 상태 업데이트
        setRealtimeUpdates(prev => ({
          ...prev,
          [`money_${event.data.historyId}`]: {
            ...event.data,
            processor: event.data.processedBy ? `처리자${event.data.processedBy}` : '시스템',
            processTime: new Date(event.timestamp).toLocaleString('ko-KR'),
            timestamp: event.timestamp
          }
        }));
        
        // 데이터 새로고침 (새로운 항목이 추가된 경우)
        if (event.type === 'money:created') {
          // 약간의 지연 후 새로고침 (DB 반영 시간 고려)
          setTimeout(() => {
            refreshPageData();
          }, 500);
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
    console.log('머니처리내역 엑셀 다운로드');
    alert('머니처리내역을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('머니처리내역 인쇄');
    alert('머니처리내역을 인쇄합니다.');
  }, []);

  // 페이지네이션 직접 제어 로직
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // 합계 표시 옵션 (전체 또는 현재 페이지)
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);

  // 회원상세정보 다이얼로그 상태
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);

  // 회원상세정보 다이얼로그 핸들러들
  const handleMemberDetailOpen = useCallback((member) => {
    // 회원관리 데이터에서 해당 회원의 전체 정보 찾기
    const fullMemberData = membersData.find(m => 
      m.username === member.username || m.userId === member.userId
    );
    
    if (fullMemberData) {
      setSelectedMemberForDetail(fullMemberData);
    } else {
      // 회원 정보를 찾을 수 없는 경우 기본 정보 사용
      setSelectedMemberForDetail(member);
    }
    
    setMemberDetailDialogOpen(true);
  }, [membersData]);

  const handleMemberDetailClose = useCallback(() => {
    setMemberDetailDialogOpen(false);
    setSelectedMemberForDetail(null);
  }, []);

  const handleMemberDetailSave = useCallback((updatedMember) => {
    alert(`${updatedMember.nickname || updatedMember.username}님의 정보가 저장되었습니다.`);
    handleMemberDetailClose();
  }, [handleMemberDetailClose]);

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
    return moneyHistoryColumns.map(column => {
      // userId 컬럼에 클릭 핸들러 추가
      if (column.id === 'userId') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('아이디 클릭:', row.userId);
            const [username, nickname] = row.userId.split('\n');
            const memberInfo = {
              username: username,
              nickname: nickname || '',
              type: row.memberType,
              parentTypes: row.superAgent
            };
            handleMemberDetailOpen(memberInfo);
          }
        };
      }
      
      return column;
    });
  }, [handleMemberDetailOpen]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    const baseOptions = [
      {
        id: 'type',
        label: '타입',
        items: [
          { value: '', label: '전체' },
          ...typeOptions.map(option => ({
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
    isDateFilterOpen,
    dateFilterAnchorEl,
    handleOpenDateFilter,
    handleCloseDateFilter,
    handleDateRangeChange,
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
      initialFilters: { type: 'all', processor: 'all', memberType: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: data.length,
      onExcelDownload: handleExcelDownload,
      onPrint: handlePrint
    }
  });

  // 날짜 필터를 위한 로컬 상태 (간단한 해결책)
  const [localDateFilterAnchorEl, setLocalDateFilterAnchorEl] = useState(null);
  
  // 로컬 날짜 필터 열기 핸들러
  const handleLocalOpenDateFilter = useCallback((event) => {
    setLocalDateFilterAnchorEl(event.currentTarget);
  }, []);
  
  // 로컬 날짜 필터 닫기 핸들러
  const handleLocalCloseDateFilter = useCallback(() => {
    setLocalDateFilterAnchorEl(null);
  }, []);

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
      console.log(`머니처리내역 검색: ${value}`);
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

  // 전체합계 설정 - 머니내역 페이지용
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all'
    },
    columns: {
      processAmount: { type: 'sum', format: 'currency' },
      beforeBalance: { type: 'sum', format: 'currency' },
      afterBalance: { type: 'sum', format: 'currency' }
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
    initialColumns: columnsWithActions,
    tableId: 'money_history_table',
    onColumnOrderChange: (newColumns) => {
      console.log('머니처리내역 테이블 컬럼 순서 변경:', newColumns);
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
    tableId: 'money_history_table'
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
    console.log('머니처리내역 행 클릭:', row);
  };

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'type':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          // 타입이 객체 형태인 경우 처리
          const typeLabel = item.type?.label || item.type;
          
          switch (filterValue) {
            case 'deposit':
              return typeLabel === '입금';
            case 'withdrawal':
              return typeLabel === '출금';
            case 'bonus':
              return typeLabel === '보너스';
            case 'penalty':
              return typeLabel === '차감';
            case 'adjustment':
              return typeLabel === '조정';
            default:
              return true;
          }
        });
        
      case 'processor':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          switch (filterValue) {
            case 'admin1':
              return item.processor === '관리자1';
            case 'admin2':
              return item.processor === '관리자2';
            case 'admin3':
              return item.processor === '관리자3';
            case 'system':
              return item.processor === '시스템';
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
        
        if (filterValue.startDate || filterValue.endDate) {
          dateFilteredResult = dateFilteredResult.filter(item => {
            if (!item.processTime) return false;
            
            const itemDate = dayjs(item.processTime);
            
            if (filterValue.startDate && itemDate.isBefore(filterValue.startDate)) {
              return false;
            }
            
            if (filterValue.endDate && itemDate.isAfter(filterValue.endDate)) {
              return false;
            }
            
            return true;
          });
        }
        
        return dateFilteredResult;
      default:
        return result;
    }
  }, [types]);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`머니처리내역 필터 변경: ${filterId} = ${value}`);
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
    activeFilters: isDateFilterActive ? { ...safeActiveFilters, date: dateRange } : safeActiveFilters,
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
    console.log(`머니처리내역 페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산 (일반 배열이므로 단순 길이)
  const totalFlattenedItems = safeFilteredData.length;
  
  const safeDisplayData = safeFilteredData;

  // 필터링된 데이터가 변경될 때 totalItems 값 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      console.log(`머니처리내역 검색/필터 결과: ${safeFilteredData.length}개 항목`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`머니처리내역 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`머니처리내역 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('머니처리내역 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`머니처리내역 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`머니처리내역 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`머니처리내역 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    console.log(`머니처리내역 페이지네이션 변수: 페이지=${currentPage}, 행수=${currentRowsPerPage}, 총=${totalFlattenedItems}`);
    return safeFilteredData;
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  // visibleColumns에 버튼 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    return visibleColumns.map(column => {
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
  }, [visibleColumns, handleMemberDetailOpen]);

  // 날짜 필터 관련 상태
  const [dateFilterField, setDateFilterField] = useState('processTime');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 날짜 필터 필드 변경 핸들러
  const handleDateFilterFieldChange = useCallback((event) => {
    setDateFilterField(event.target.value);
  }, []);

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = useCallback((newValue) => {
    setStartDate(newValue);
  }, []);

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = useCallback((newValue) => {
    setEndDate(newValue);
  }, []);

  // 빠른 날짜 선택 핸들러
  const handleQuickDateSelect = useCallback((value) => {
    const now = dayjs();
    let newStartDate, newEndDate;

    switch (value) {
      case 'today':
        newStartDate = now.startOf('day');
        newEndDate = now.endOf('day');
        break;
      case 'yesterday':
        newStartDate = now.subtract(1, 'day').startOf('day');
        newEndDate = now.subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        newStartDate = now.startOf('week');
        newEndDate = now.endOf('week');
        break;
      case 'lastWeek':
        newStartDate = now.subtract(1, 'week').startOf('week');
        newEndDate = now.subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        newStartDate = now.startOf('month');
        newEndDate = now.endOf('month');
        break;
      case 'lastMonth':
        newStartDate = now.subtract(1, 'month').startOf('month');
        newEndDate = now.subtract(1, 'month').endOf('month');
        break;
      case 'allTime':
        newStartDate = null;
        newEndDate = null;
        break;
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  // 날짜 필터 적용 핸들러
  const applyDateFilter = useCallback(() => {
    if (handleDateRangeChange) {
      handleDateRangeChange({ startDate, endDate });
    }
    handleLocalCloseDateFilter();
  }, [startDate, endDate, handleDateRangeChange, handleLocalCloseDateFilter]);

  // 날짜 필터 초기화 핸들러
  const resetDateFilterLocal = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    if (resetDateFilter) {
      resetDateFilter();
    }
    handleLocalCloseDateFilter();
  }, [resetDateFilter, handleLocalCloseDateFilter]);

  // 날짜 필터 필드 옵션
  const dateFields = [
    { value: 'processTime', label: '처리시간' }
  ];

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
        <PageHeader
          title="머니처리내역"
          onDisplayOptionsClick={handleDisplayOptionsClick}
          showAddButton={false}
          showRefreshButton={true}
          onRefreshClick={() => alert('머니처리내역 새로고침')}
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
            title="머니처리내역 목록"
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
            showIndentToggle={false} // 계층 기능 비활성화
            showPageNumberToggle={true}
            showColumnPinToggle={true}
            showSearch={true}
            searchPlaceholder="머니처리내역 검색..."
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
                handleOpenDateFilter: handleLocalOpenDateFilter,
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
              key={`money-history-table-${tableKey}`}
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

        {/* 회원상세정보 다이얼로그 */}
        <MemberDetailDialog
          open={memberDetailDialogOpen}
          onClose={handleMemberDetailClose}
          onSave={handleMemberDetailSave}
          member={selectedMemberForDetail}
        />

        {/* 날짜 필터 팝오버 */}
        <DateFilterPopover
          anchorEl={localDateFilterAnchorEl}
          onClose={handleLocalCloseDateFilter}
          dateFilterField={dateFilterField}
          handleDateFilterFieldChange={handleDateFilterFieldChange}
          startDate={startDate}
          handleStartDateChange={handleStartDateChange}
          endDate={endDate}
          handleEndDateChange={handleEndDateChange}
          handleQuickDateSelect={handleQuickDateSelect}
          applyDateFilter={applyDateFilter}
          resetDateFilter={resetDateFilterLocal}
          dateFields={dateFields}
        />
    </PageContainer>
  );
};

export default MoneyHistoryPage; 