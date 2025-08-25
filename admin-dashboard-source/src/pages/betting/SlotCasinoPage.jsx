import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  slotCasinoColumns
} from './data/slotCasinoData';
import { apiOptions, bankList } from '../agent-management/data/membersData';
import MemberDetailDialog from '../../components/dialogs/MemberDetailDialog';
import BettingDetailDialog from '../../components/dialogs/BettingDetailDialog';
import usePageData from '../../hooks/usePageData';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * 슬롯/카지노 베팅상세내역 페이지
 * 슬롯/카지노 베팅 내역 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const SlotCasinoPage = () => {
  const theme = useTheme();

  // 전역 알림 사용
  const { handleRefresh } = useNotification();

  // 새로고침 핸들러
  const handleRefreshClick = useCallback(() => {
    handleRefresh('슬롯/카지노 베팅내역');
  }, [handleRefresh]);

  // 이전 데이터를 저장하기 위한 ref
  const previousDataRef = useRef([]);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(() => {
    console.log('슬롯/카지노 베팅내역 엑셀 다운로드');
    alert('슬롯/카지노 베팅내역을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('슬롯/카지노 베팅내역 인쇄');
    alert('슬롯/카지노 베팅내역을 인쇄합니다.');
  }, []);

  // 페이지네이션 직접 제어 로직 (롤링금전환내역 페이지와 동일)
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);
  
  // usePageData 훅 사용 (페이지네이션 제거 - 클라이언트 사이드로 처리)
  const {
    data: rawData,
    membersData,
    types,
    typeHierarchy,
    isLoading,
    error,
    isInitialized: typesInitialized
  } = usePageData({
    pageType: 'slotCasino',
    requiresMembersData: false
    // pagination 파라미터 제거 - RollingHistoryPage처럼 클라이언트 사이드에서 처리
  });
  
  // 데이터가 있으면 이전 데이터로 저장
  useEffect(() => {
    if (rawData && rawData.length > 0) {
      previousDataRef.current = rawData;
    }
  }, [rawData]);
  
  // 데이터가 비어있으면 이전 데이터 사용
  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      console.log('[SlotCasinoPage] 데이터가 비어있음 - 이전 데이터 사용:', previousDataRef.current.length);
      return previousDataRef.current;
    }
    return rawData;
  }, [rawData]);
  
  
  

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

  // 다이얼로그 상태
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);
  const [bettingDetailDialogOpen, setBettingDetailDialogOpen] = useState(false);
  const [selectedBettingForDetail, setSelectedBettingForDetail] = useState(null);

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

  // 베팅상세정보 다이얼로그 핸들러들
  const handleBettingDetailOpen = useCallback(async (row) => {
    console.log('베팅상세보기 클릭:', row);
    try {
      // API에서 베팅 상세 정보 가져오기
      const response = await fetch(`/api/betting/detail/${row.bettingId || row.betting_id || row.id}`);
      if (!response.ok) {
        throw new Error('베팅 상세 정보를 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setSelectedBettingForDetail(result.data);
        setBettingDetailDialogOpen(true);
      } else {
        console.error('베팅 상세 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('베팅 상세 정보 조회 오류:', error);
      alert('베팅 상세 정보를 가져오는데 실패했습니다.');
    }
  }, []);

  const handleBettingDetailClose = useCallback(() => {
    setBettingDetailDialogOpen(false);
    setSelectedBettingForDetail(null);
  }, []);

  // 공베팅 액션 핸들러들
  const handleVoidApply = useCallback((row) => {
    console.log('공베팅적용:', row);
    alert(`${row.transId} 베팅에 대해 공베팅이 적용되었습니다.`);
    // 실제 API 호출 로직 추가
  }, []);

  const handleVoidCancel = useCallback((row) => {
    console.log('공베팅취소:', row);
    alert(`${row.transId} 베팅에 대해 공베팅이 취소되었습니다.`);
    // 실제 API 호출 로직 추가
  }, []);

  // 페이지 관련 상태 - 삭제 (useTableFilterAndPagination 훅에서 관리)

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
    initialSortConfig: { key: 'bettingDate', direction: 'desc' }
  });

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return slotCasinoColumns.map(column => {
      // memberInfo 컬럼에 클릭 핸들러 추가
      if (column.id === 'memberInfo') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('회원정보 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      // detailView 컬럼에 클릭 핸들러 추가
      if (column.id === 'detailView') {
        return {
          ...column,
          onClick: (row) => {
            console.log('상세보기 클릭:', row);
            handleBettingDetailOpen(row);
          }
        };
      }

      // remarks 컬럼에 공베팅 액션 핸들러 추가
      if (column.id === 'remarks') {
        return {
          ...column,
          onVoidApply: handleVoidApply,
          onVoidCancel: handleVoidCancel
        };
      }
      
      return column;
    });
  }, [handleMemberDetailOpen, handleBettingDetailOpen, handleVoidApply, handleVoidCancel]);

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
    tableId: 'slotCasinoPage_columnVisibility'
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
    isColumnPinned,
    toggleColumnPin,
    resetColumnOrder,
    setDefaultPinnedColumns,
    clearAllPinnedColumns
  } = useTableColumnDrag({
    initialColumns: visibleColumns,
    tableId: 'slot_casino_table',
    initialPinnedColumns: ['no', 'memberInfo'],
    onColumnOrderChange: (newColumns) => {
      console.log('슬롯/카지노 컬럼 순서 변경:', newColumns.map(col => col.id));
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

  // 동적 필터 옵션 생성 - 실제 데이터에서 추출
  const dynamicFilterOptions = useMemo(() => {
    // 데이터에서 고유한 값들 추출
    const uniqueGameTypes = [...new Set(data.map(item => item.gameType).filter(Boolean))];
    const uniqueGameCompanies = [...new Set(data.map(item => item.gameCompany).filter(Boolean))];
    const uniqueBettingSections = [...new Set(data.map(item => item.bettingSection).filter(Boolean))];
    
    const baseOptions = [
      {
        id: 'gameType',
        label: '게임유형',
        items: [
          { value: '', label: '전체' },
          ...uniqueGameTypes.sort().map(type => ({
            value: type,
            label: type
          }))
        ]
      },
      {
        id: 'gameCompany',
        label: '게임사',
        items: [
          { value: '', label: '전체' },
          ...uniqueGameCompanies.sort().map(company => ({
            value: company,
            label: company
          }))
        ]
      },
      {
        id: 'bettingSection',
        label: '베팅섹션',
        items: [
          { value: '', label: '전체' },
          ...uniqueBettingSections.sort().map(section => ({
            value: section,
            label: section
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
  }, [data, typesInitialized, types]);

  // useTableFilterAndPagination 훅 사용 (롤링금전환내역과 동일)
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
      initialFilters: { gameType: '', gameCompany: '', bettingSection: '', memberType: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: data.length,
      onExcelDownload: handleExcelDownload,
      onPrint: handlePrint
    }
  });

  // 페이지 변경 핸들러 (롤링금전환내역과 동일)
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`슬롯/카지노 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`슬롯/카지노 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러 (롤링금전환내역과 동일)
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('슬롯/카지노 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`슬롯/카지노 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`슬롯/카지노 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

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
    hasPinnedColumns: headerHasPinnedColumns,
    isGridReady,
    handleSearchChange,
    handleClearSearch,
    togglePageNumberMode,
    toggleColumnPin: headerToggleColumnPin,
    setGridReady
  } = useTableHeader({
    initialTotalItems: data.length || 0,
    tableId: 'slotCasinoPage', // 페이지별 고유 ID 추가
    onSearch: (value) => {
      console.log(`슬롯/카지노 검색: ${value}`);
      if (currentPage !== 0) {
        // 페이지를 0으로 리셋
        setCurrentPage(0);
        if (handlePageChange) {
          handlePageChange(0);
        }
      }
    },
    onTogglePageNumberMode: (sequentialMode) => {
      console.log(`슬롯/카지노 페이지 번호 모드 토글: ${sequentialMode ? '연속번호' : '페이지별번호'}`);
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

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'gameType':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          return item._gameTypeValue === filterValue;
        });
        
      case 'gameCompany':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          return item._gameCompanyValue === filterValue;
        });
        
      case 'bettingSection':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          return item._bettingSectionValue === filterValue;
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
          dateFilteredResult = dateFilteredResult.filter(item => item.id >= 10);
        }
        
        if (filterValue.endDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id <= 40);
        }
        
        return dateFilteredResult;
      default:
        return result;
    }
  }, [types]);
  
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`슬롯/카지노 필터 변경: ${filterId} = ${value}`);
    handleFilter({
      [filterId]: value
    });
  }, [handleFilter]);

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
    console.log(`슬롯/카지노 페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산 (일반 배열이므로 단순 길이)
  const totalFlattenedItems = safeFilteredData.length;
  
  const safeDisplayData = safeFilteredData;

  // 필터링된 데이터가 변경될 때 totalItems 값 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      console.log(`슬롯/카지노 검색/필터 결과: ${safeFilteredData.length}개 항목`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 관련 효과
  useEffect(() => {
    console.log(`슬롯/카지노 페이지네이션 설정: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`슬롯/카지노 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    // BaseTable이 자체적으로 페이지네이션을 처리하므로 전체 데이터 반환
    return safeFilteredData;
  }, [safeFilteredData]);

  // visibleColumns에 버튼 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    return columns.map(column => {
      // memberInfo 컬럼에 클릭 핸들러 추가
      if (column.id === 'memberInfo') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('회원정보 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      // detailView 컬럼에 클릭 핸들러 추가
      if (column.id === 'detailView') {
        return {
          ...column,
          onClick: (row) => {
            console.log('상세보기 클릭:', row);
            handleBettingDetailOpen(row);
          }
        };
      }

      // remarks 컬럼에 공베팅 액션 핸들러 추가
      if (column.id === 'remarks') {
        return {
          ...column,
          onVoidApply: handleVoidApply,
          onVoidCancel: handleVoidCancel
        };
      }
      
      return column;
    });
  }, [columns, handleMemberDetailOpen, handleBettingDetailOpen, handleVoidApply, handleVoidCancel]);

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  // 행 클릭 핸들러
  const handleRowClick = (row) => {
    console.log('슬롯/카지노 베팅내역 행 클릭:', row);
  };

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="슬롯/카지노 베팅상세내역"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefreshClick}
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
          title="슬롯/카지노 베팅내역 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##건의 베팅내역"
          sequentialPageNumbers={sequentialPageNumbers}
          togglePageNumberMode={togglePageNumberMode}
          hasPinnedColumns={headerHasPinnedColumns}
          isGridReady={isGridReady}
          toggleColumnPin={headerToggleColumnPin}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          showIndentToggle={false}
          showPageNumberToggle={true}
          showColumnPinToggle={true}
          showSearch={true}
          searchPlaceholder="베팅내역 검색..."
          sx={{ mb: 2 }}
        />

        <Box sx={{ width: '100%' }}>
          <TableFilterAndPagination
            filterProps={{
              columns: columnsWithActions,
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
            key={`slot-casino-table-${tableKey}`}
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

      {/* 베팅 상세정보 다이얼로그 */}
      <BettingDetailDialog
        open={bettingDetailDialogOpen}
        onClose={handleBettingDetailClose}
        bettingData={selectedBettingForDetail}
      />
    </PageContainer>
  );
};

export default SlotCasinoPage; 