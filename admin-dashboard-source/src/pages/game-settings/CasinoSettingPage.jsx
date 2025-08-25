import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Snackbar, Alert, Button, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
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
  useTable,
  useTableRowDrag
} from '../../components/baseTemplate/hooks';
import { 
  casinoColumns, 
  apiOptions,
  casinoFilterOptions,
  generateCasinoSettingsData 
} from './data/CasinoSettingData';
import { apiOptions as slotApiOptions } from './data/SlotSettingData';
import GameListDialog from '../../components/dialogs/GameListDialog';
import gameService from '../../services/gameService';


/**
 * 카지노 게임 설정 페이지
 */
const CasinoSettingPage = () => {
  // 게임사 데이터 상태
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // 다이얼로그 상태
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  
  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 일괄 API 변경을 위한 상태
  const [bulkApi, setBulkApi] = useState('');
  
  // 태그 모드 상태 (자동/수동)
  const [tagMode, setTagMode] = useState('manual');
  const [isLoadingTagMode, setIsLoadingTagMode] = useState(false);

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    loadVendorData();
    loadTagMode();
  }, []);

  // 벤더 데이터 로드
  const loadVendorData = async () => {
    try {
      // Honor API의 카지노 벤더 목록 가져오기
      const vendorsResponse = await gameService.getVendors('casino');
      
      if (vendorsResponse.success && vendorsResponse.data) {
        // 벤더별 게임 수 가져오기
        const gameCounts = await gameService.getVendorGameCounts('casino');
        
        // 벤더 데이터 포맷팅
        const formattedVendors = vendorsResponse.data.map((vendor, index) => ({
          id: vendor.code,
          vendorCode: vendor.code,
          vendorLogo: vendor.name_ko?.substring(0, 2) || vendor.name.substring(0, 2), // 텍스트 로고
          vendorName: vendor.name_ko || vendor.name,
          enabled: vendor.is_active !== false, // 기본값 true
          api: 'Honor API', // Honor API 고정 표시
          gameCount: gameCounts[vendor.code] || 0,
        }));
        
        setVendors(formattedVendors);
      } else {
        // API 실패 시 목업 데이터 사용
        const data = generateCasinoSettingsData(20);
        setVendors(data);
      }
    } catch (error) {
      console.error('벤더 데이터 로드 실패:', error);
      showNotification('벤더 데이터를 불러오는데 실패했습니다. 목업 데이터를 사용합니다.', 'warning');
      // 목업 데이터로 폴백
      const data = generateCasinoSettingsData(20);
      setVendors(data);
    }
  };

  // 알림 표시 함수
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // 알림 닫기 함수
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // 태그 모드 로드
  const loadTagMode = async () => {
    try {
      const response = await gameService.getTagMode('casino');
      if (response.success) {
        setTagMode(response.mode);
      }
    } catch (error) {
      console.error('태그 모드 로드 실패:', error);
    }
  };

  // 태그 모드 변경 핸들러
  const handleTagModeChange = async (event) => {
    const newMode = event.target.checked ? 'auto' : 'manual';
    setIsLoadingTagMode(true);
    
    try {
      const response = await gameService.setTagMode('casino', newMode);
      if (response.success) {
        setTagMode(newMode);
        showNotification(response.message);
      }
    } catch (error) {
      console.error('태그 모드 변경 실패:', error);
      showNotification('태그 모드 변경에 실패했습니다.', 'error');
    } finally {
      setIsLoadingTagMode(false);
    }
  };

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

  // 새로고침 핸들러
  const handleRefreshClick = async () => {
    await loadVendorData();
    showNotification('데이터를 새로고침했습니다.', 'success');
  };

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(10);
  
  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
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
    data: vendors,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 액션 핸들러들
  const handleToggleEnable = useCallback((vendor) => {
    console.log('카지노 토글 클릭:', vendor);
    setVendors(prev => {
      const updated = prev.map(v => 
        v.id === vendor.id ? { ...v, enabled: !v.enabled } : v
      );
      console.log('업데이트된 vendors:', updated.find(v => v.id === vendor.id));
      return updated;
    });
    showNotification('활성/비활성 상태가 변경되었습니다.');
  }, []);

  const handleApiChange = useCallback((vendor, newApi) => {
    console.log('카지노 API 변경:', vendor, newApi);
    setVendors(prev => {
      const updated = prev.map(v => 
        v.id === vendor.id ? { ...v, api: newApi } : v
      );
      console.log('업데이트된 vendors:', updated.find(v => v.id === vendor.id));
      return updated;
    });
    showNotification('API가 변경되었습니다.');
  }, []);

  const handleViewGames = useCallback((vendor) => {
    setSelectedVendor(vendor);
    setIsGameDialogOpen(true);
  }, []);

  // 게임 동기화 핸들러
  const handleSyncGames = useCallback(async (vendor) => {
    try {
      showNotification(`${vendor.vendorName} 게임 동기화를 시작합니다...`, 'info');
      
      const response = await gameService.syncGames(vendor.vendorCode || vendor.id, 'casino');
      
      if (response.success) {
        // 동기화 후 벤더 데이터 다시 로드
        await loadVendorData();
        const message = response.message || `${vendor.vendorName} 게임 동기화가 완료되었습니다.`;
        if (response.synced_count !== undefined) {
          showNotification(`${message} (총 ${response.synced_count}개 게임)`, 'success');
        } else {
          showNotification(message, 'success');
        }
      } else {
        showNotification('게임 동기화에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('게임 동기화 오류:', error);
      showNotification('게임 동기화 중 오류가 발생했습니다.', 'error');
    }
  }, []);
  
  // 선택된 게임사들을 활성화
  const handleEnableSelected = useCallback(() => {
    const selectedIds = Object.keys(tableCheckedItems).filter(id => tableCheckedItems[id]);
    if (selectedIds.length === 0) return;
    
    setVendors(prev => prev.map(vendor => 
      selectedIds.includes(vendor.id) ? { ...vendor, enabled: true } : vendor
    ));
    
    showNotification(`${selectedIds.length}개의 게임사가 활성화되었습니다.`, 'success');
  }, [tableCheckedItems]);
  
  // 선택된 게임사들을 비활성화
  const handleDisableSelected = useCallback(() => {
    const selectedIds = Object.keys(tableCheckedItems).filter(id => tableCheckedItems[id]);
    if (selectedIds.length === 0) return;
    
    setVendors(prev => prev.map(vendor => 
      selectedIds.includes(vendor.id) ? { ...vendor, enabled: false } : vendor
    ));
    
    showNotification(`${selectedIds.length}개의 게임사가 비활성화되었습니다.`, 'success');
  }, [tableCheckedItems]);
  
  // 일괄 API 변경 핸들러
  const handleBulkApiChange = useCallback((event) => {
    const newApi = event.target.value;
    setBulkApi(newApi);
    
    if (newApi) {
      setVendors(prev => prev.map(vendor => ({ ...vendor, api: newApi })));
      showNotification(`모든 게임사의 API가 ${newApi}로 변경되었습니다.`, 'success');
      
      // 잠시 후 선택 초기화
      setTimeout(() => setBulkApi(''), 2000);
    }
  }, []);
  
  // 체크된 항목 수 계산
  const checkedCount = useMemo(() => {
    return Object.values(tableCheckedItems).filter(checked => checked).length;
  }, [tableCheckedItems]);

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return casinoColumns.map(column => {
      if (column.id === 'enabled') {
        return {
          ...column,
          onToggle: handleToggleEnable
        };
      }
      if (column.id === 'api') {
        return {
          ...column,
          dropdownOptions: apiOptions,
          onApiChange: handleApiChange
        };
      }
      if (column.id === 'action') {
        return {
          ...column,
          actions: column.actions.map(action => {
            if (action.buttonText === '게임리스트') {
              return { ...action, onClick: handleViewGames };
            }
            if (action.buttonText === '동기화') {
              return { ...action, onClick: handleSyncGames };
            }
            return action;
          })
        };
      }
      return column;
    });
  }, [handleToggleEnable, handleApiChange, handleViewGames, handleSyncGames]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return casinoFilterOptions;
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
    data: vendors,
    defaultRowsPerPage: 10,
    hierarchical: false,
    filterOptions: {
      initialFilters: { status: '', api: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 10,
      totalItems: vendors.length
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
    initialTotalItems: vendors.length,
    tableId: 'casinoGameSettingPage', // 페이지별 고유 ID 추가 (새로운 ID로 변경)
    initialSequentialPageNumbers: false, // false로 시작하여 페이지별 번호로 시작
    onSearch: (value) => {
      console.log(`카지노 게임사 검색: ${value}`);
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    onTogglePageNumberMode: (sequentialMode) => {
      console.log(`카지노 페이지 번호 모드 토글: ${sequentialMode ? '연속번호' : '페이지별번호'}`);
      // 테이블 키 업데이트하여 강제 리렌더링
      setTableKey(Date.now());
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
    tableId: 'casino_settings_table',
    initialPinnedColumns: ['no'],
    onColumnOrderChange: (newColumns) => {
      console.log('카지노 테이블 컬럼 순서 변경:', newColumns);
    }
  });

  // 행 드래그 앤 드롭 관련 훅 사용
  const {
    isDragging: isRowDragging,
    draggedRow,
    dragOverRow,
    getDragHandleProps
  } = useTableRowDrag({
    data: vendors,
    onDataChange: async (newData) => {
      console.log('카지노 게임사 순서 변경됨:', newData.map(v => v.vendorName));
      setVendors(newData);
      
      try {
        // 서버에 순서 업데이트 요청
        await gameService.updateProviderOrder(newData);
        showNotification('게임사 순서가 변경되었습니다. 회원 페이지에도 적용됩니다.', 'success');
      } catch (error) {
        console.error('게임사 순서 업데이트 실패:', error);
        showNotification('게임사 순서 변경에 실패했습니다.', 'error');
        // 실패 시 원래 데이터로 복원
        loadVendorData();
      }
    },
    orderField: 'order',
    idField: 'id',
    enabled: true
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
  } = useColumnVisibility(columns || columnsWithActions, {
    defaultHiddenColumns: [],
    alwaysVisibleColumns: ['no'],
    tableId: 'casino_settings_table'
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
      case 'status':
        if (filterValue === '' || filterValue === 'all') return result;
        if (filterValue === 'enabled') {
          return result.filter(item => item.enabled === true);
        }
        if (filterValue === 'disabled') {
          return result.filter(item => item.enabled === false);
        }
        return result;
        
      case 'api':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.api === filterValue);
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`카지노 필터 변경: ${filterId} = ${value}`);
    handleFilter({
      [filterId]: value
    });
  }, [handleFilter]);
  
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

  // 필터링된 데이터 처리 (간소화)
  const computedFilteredData = useMemo(() => {
    // vendors가 없으면 빈 배열 반환
    if (!vendors || !Array.isArray(vendors)) {
      console.log('vendors가 아직 로드되지 않았습니다');
      return [];
    }
    
    let result = [...vendors];
    
    // 검색 필터
    if (searchText && searchText.trim() !== '') {
      result = result.filter(vendor => 
        vendor.vendorName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 상태 필터
    if (safeActiveFilters.status === 'enabled') {
      result = result.filter(vendor => vendor.enabled === true);
    } else if (safeActiveFilters.status === 'disabled') {
      result = result.filter(vendor => vendor.enabled === false);
    }
    
    // API 필터
    if (safeActiveFilters.api && safeActiveFilters.api !== '') {
      result = result.filter(vendor => vendor.api === safeActiveFilters.api);
    }
    
    return result;
  }, [vendors, searchText, safeActiveFilters]);
  
  // 실제 전체 항목 수 계산
  const totalFlattenedItems = computedFilteredData?.length || 0;

  // 페이지네이션된 데이터
  const paginatedFilteredData = useMemo(() => {
    if (!computedFilteredData || !Array.isArray(computedFilteredData)) {
      console.log('paginatedFilteredData: computedFilteredData가 없습니다');
      return [];
    }
    
    const startIndex = currentPage * currentRowsPerPage;
    const endIndex = startIndex + currentRowsPerPage;
    return computedFilteredData.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      no: startIndex + index + 1
    }));
  }, [computedFilteredData, currentPage, currentRowsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    // 매개변수 정규화 - TablePagination은 페이지 인덱스만 전달하거나 (event, page) 형태로 전달
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`카지노 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    // 유효한 페이지 번호인지 확인
    if (typeof pageIndex !== 'number' || isNaN(pageIndex)) {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    // 페이지 범위 검증
    const maxPage = Math.max(0, Math.ceil(totalFlattenedItems / currentRowsPerPage) - 1);
    pageIndex = Math.max(0, Math.min(pageIndex, maxPage));
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`카지노 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, currentRowsPerPage, totalFlattenedItems, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('카지노 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`카지노 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`카지노 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 페이지, 행 수가 변경될 때만 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`카지노 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 번호 모드 디버깅 (별도 useEffect)
  useEffect(() => {
    console.log(`카지노 번호모드: ${sequentialPageNumbers ? '연속번호' : '페이지별번호'}`);
  }, [sequentialPageNumbers]);
  
  // sequentialPageNumbers 변경 시 테이블 키 업데이트
  useEffect(() => {
    console.log('카지노 페이지 sequentialPageNumbers 변경됨:', sequentialPageNumbers);
    setTableKey(Date.now());
  }, [sequentialPageNumbers]);
  
  // 필터나 검색어가 변경될 때 페이지를 0으로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [searchText, safeActiveFilters]);
  
  // 페이지가 최대 페이지를 초과하지 않도록 확인
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(totalFlattenedItems / currentRowsPerPage) - 1);
    if (currentPage > maxPage && totalFlattenedItems > 0) {
      console.log(`카지노 페이지 범위 초과 감지: ${currentPage} > ${maxPage}, 마지막 페이지로 이동`);
      setCurrentPage(maxPage);
    }
  }, [totalFlattenedItems, currentRowsPerPage, currentPage]);
  
  // 드래그 앤 드롭 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // visibleColumns에 액션 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    console.log('finalColumns 계산 시작, visibleColumns:', visibleColumns);
    
    if (!visibleColumns || !Array.isArray(visibleColumns)) {
      console.log('finalColumns: visibleColumns가 없습니다');
      return columnsWithActions || [];
    }
    
    const result = visibleColumns.map(column => {
      if (column.id === 'enabled') {
        return {
          ...column,
          onToggle: handleToggleEnable
        };
      }
      if (column.id === 'api') {
        return {
          ...column,
          dropdownOptions: apiOptions,
          onApiChange: handleApiChange
        };
      }
      if (column.id === 'action') {
        return {
          ...column,
          actions: column.actions.map(action => {
            if (action.buttonText === '게임리스트') {
              return { ...action, onClick: handleViewGames };
            }
            if (action.buttonText === '동기화') {
              return { ...action, onClick: handleSyncGames };
            }
            return action;
          })
        };
      }
      return column;
    });
    
    // 컬럼 정보 디버깅 출력 (특히 'no' 컬럼)
    console.log('CasinoSettingPage finalColumns:', result.map(col => ({
      id: col.id,
      type: col.type,
      label: col.label
    })));
    
    const noColumn = result.find(col => col.id === 'no');
    console.log('CasinoSettingPage no 컬럼 상세:', noColumn);
    
    return result;
  }, [visibleColumns, handleToggleEnable, handleApiChange, handleViewGames]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="카지노 게임 설정"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefreshClick}
        sx={{ mb: 2 }}
        customActions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={tagMode === 'auto'}
                  onChange={handleTagModeChange}
                  disabled={isLoadingTagMode}
                />
              }
              label={tagMode === 'auto' ? '자동 태그 설정' : '수동 태그 설정'}
              sx={{ mr: 2 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>API 일괄 변경</InputLabel>
              <Select
                value={bulkApi}
                onChange={handleBulkApiChange}
                label="API 일괄 변경"
              >
                <MenuItem value="">
                  <em>선택 안함</em>
                </MenuItem>
                {apiOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        {/* 테이블 헤더 컴포넌트 */}
        <TableHeader
          title="카지노 게임사 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##개의 게임사"
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
          searchPlaceholder="게임사 검색..."
          sx={{ mb: 2 }}
        />

        {/* 테이블 높이 설정 */}
        <TableHeightSetting
          tableHeight={tableHeight}
          autoHeight={autoHeight}
          toggleAutoHeight={toggleAutoHeight}
          setManualHeight={setManualHeight}
          minHeight={200}
          maxHeight={1200}
          step={50}
        />

        <Box sx={{ width: '100%' }}>
          <TableFilterAndPagination
            filterProps={{
              columns: columns,
              filterValues: activeFilters || {},
              activeFilters: safeActiveFilters || {},
              filterOptions: dynamicFilterOptions,
              handleFilterChange: manualHandleFilterChange,
              onFilter: handleFilter,
              onClearFilters: handleClearFilters
            }}
            paginationProps={{
              count: totalFlattenedItems,
              page: currentPage,
              rowsPerPage: currentRowsPerPage,
              onPageChange: handlePageChangeWithLog,
              onRowsPerPageChange: handleRowsPerPageChangeWithLog,
              totalCount: totalFlattenedItems
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
            {' - 행을 드래그하여 게임사 순서를 변경할 수 있습니다.'}
            (번호모드: {sequentialPageNumbers ? '연속번호' : '페이지별번호'})
          </Typography>
          <BaseTable
            columns={finalColumns}
            data={computedFilteredData}
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
            draggableRows={true}
            rowDragHandlers={{ getDragHandleProps }}
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
        
        {/* 선택 활성/비활성 버튼 */}
        {checkedCount > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handleEnableSelected}
              sx={{ fontSize: '0.875rem' }}
            >
              선택 활성 ({checkedCount})
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleDisableSelected}
              sx={{ fontSize: '0.875rem' }}
            >
              선택 비활성 ({checkedCount})
            </Button>
          </Box>
        )}
      </Paper>

      {/* 게임 목록 다이얼로그 */}
      <GameListDialog 
        open={isGameDialogOpen} 
        onClose={() => setIsGameDialogOpen(false)} 
        vendorName={selectedVendor?.vendorName || ''} 
        vendorLogo={selectedVendor?.vendorLogo || null}
        vendorCode={selectedVendor?.vendorCode || selectedVendor?.id}
        games={selectedVendor?.games || []}
        gameType="casino"
        tagMode={tagMode}
        onGameUpdate={(gameId, updates) => {
          console.log('카지노 게임 업데이트:', gameId, updates);
        }}
      />

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default CasinoSettingPage;