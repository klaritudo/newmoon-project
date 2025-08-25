import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Paper, Typography, Grid, /* Switch, FormControlLabel, Stack */ } from '@mui/material';
import { TableFilterAndPagination, TableHeader, BaseTable, TypeTreeView, TableHeightSetting, TableResizeHandle, ColumnVisibilityDialog, PageHeader, PageContainer, TableDebugInfo } from '../components';
import { 
  useTableFilterAndPagination, 
  useTableHeader, 
  useTableColumnDrag,
  useTableData,
  useTypeHierarchy,
  useTableIndent,
  useTableHeaderFixed,
  useTableAutoHeight,
  useTableResize,
  useColumnVisibility,
  useTable,
  useDynamicTypes
} from '../hooks';
import { initialColumns, filterOptions, defaultTypes, defaultTypeHierarchy } from './data/tableExampleData';
import agentLevelService from '../../../services/agentLevelService';

/**
 * TableFilterAndPagination 컴포넌트 사용 예제
 * 필터링과 페이지네이션이 결합된 UI를 보여줍니다.
 */
const TableFilterAndPaginationExample = () => {
  // agentLevelService에 getRawData 메서드 추가 (호환성을 위해)
  if (!agentLevelService.getRawData) {
    agentLevelService.getRawData = () => agentLevelService.getAgentLevels();
  }

  // 동적 유형 관리 훅 사용 (베이스템플릿 버전)
  const {
    types,
    typeHierarchy,
    isLoading: typesLoading,
    error: typesError,
    isInitialized: typesInitialized,
    convertToHierarchicalData,
    generateDataByTypes
  } = useDynamicTypes({
    dataService: agentLevelService
  });

  // 디버깅 로그 추가
  useEffect(() => {
    console.log('=== TableFilterAndPaginationExample 동적 유형 상태 ===');
    console.log('typesInitialized:', typesInitialized);
    console.log('typesLoading:', typesLoading);
    console.log('typesError:', typesError);
    console.log('types:', types);
    console.log('typeHierarchy:', typeHierarchy);
    console.log('Object.keys(types).length:', Object.keys(types).length);
  }, [typesInitialized, typesLoading, typesError, types, typeHierarchy]);

  // 동적 샘플 데이터 생성 함수
  const generateSampleData = useCallback((dynamicTypes, dynamicTypeHierarchy) => {
    if (!dynamicTypes || Object.keys(dynamicTypes).length === 0) {
      return []; // 동적 유형이 없으면 빈 배열 반환
    }

    const typeKeys = Object.keys(dynamicTypes);
    const sampleData = [];

    // 각 유형별로 샘플 데이터 생성
    typeKeys.forEach((typeKey, index) => {
      const type = dynamicTypes[typeKey];
      
      console.log(`샘플 데이터 생성 - typeKey: ${typeKey}, type:`, type);
      
      // 상위 유형들 계산
      const getParentTypes = (currentTypeKey) => {
        const parents = [];
        const findParents = (key, visited = new Set()) => {
          if (visited.has(key)) return;
          visited.add(key);
          
          Object.entries(dynamicTypeHierarchy).forEach(([parentKey, children]) => {
            if (children.includes(key) && !visited.has(parentKey)) {
              const parentType = dynamicTypes[parentKey];
              parents.unshift({ 
                label: parentType?.label || parentKey, 
                color: parentType?.color || 'default',
                backgroundColor: parentType?.backgroundColor,
                borderColor: parentType?.borderColor
              });
              findParents(parentKey, visited);
            }
          });
        };
        findParents(currentTypeKey);
        return parents;
      };

      const parentTypes = getParentTypes(typeKey);
      
      sampleData.push({
        id: index + 1,
        index: index + 1,
        userId: `${typeKey}_user${index + 1}\n${type.label}${index + 1}`,
        type: { 
          label: type.label || typeKey, 
          color: type.color || 'default',
          backgroundColor: type.backgroundColor,
          borderColor: type.borderColor
        },
        parentTypes: parentTypes,
        parentType: parentTypes, // 유형2 컬럼용
        description: `${type.label || typeKey} 계정입니다.`,
        phone: `010-${String(1000 + index).slice(-4)}-${String(1000 + index * 2).slice(-4)}`,
        email: `${typeKey}${index + 1}@example.com`,
        child1: `A${index + 1}`,
        child2: `B${index + 1}`,
        child3: `C${index + 1}`,
        child4: `D${index + 1}`,
        child5: `E${index + 1}`,
        child6: `F${index + 1}`
      });
    });

    console.log('생성된 샘플 데이터:', sampleData);

    return sampleData;
  }, []);

  // 테이블 데이터 (동적 유형으로 생성) - 베이스템플릿 방식 사용
  const tableData = useMemo(() => {
    return generateDataByTypes((dynamicTypes, dynamicTypeHierarchy, helpers) => {
      const typeKeys = Object.keys(dynamicTypes);
      const sampleData = [];

      // 각 유형별로 샘플 데이터 생성
      typeKeys.forEach((typeKey, index) => {
        const type = dynamicTypes[typeKey];
        const parentTypes = helpers.getParentTypes(typeKey);
        
        sampleData.push({
          id: index + 1,
          index: index + 1,
          userId: `${typeKey}_user${index + 1}\n${type.label}${index + 1}`,
          type: { 
            label: type.label || typeKey, 
            color: type.color || 'default',
            backgroundColor: type.backgroundColor,
            borderColor: type.borderColor
          },
          parentTypes: parentTypes,
          parentType: parentTypes, // 유형2 컬럼용
          description: `${type.label || typeKey} 계정입니다.`,
          phone: `010-${String(1000 + index).slice(-4)}-${String(1000 + index * 2).slice(-4)}`,
          email: `${typeKey}${index + 1}@example.com`,
          child1: `A${index + 1}`,
          child2: `B${index + 1}`,
          child3: `C${index + 1}`,
          child4: `D${index + 1}`,
          child5: `E${index + 1}`,
          child6: `F${index + 1}`
        });
      });

      return sampleData;
    });
  }, [generateDataByTypes]);

  // 테이블 높이 자동 조정 - useTableAutoHeight 훅 사용
  const {
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight
  } = useTableAutoHeight({
    defaultHeight: '400px',
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
    maxHeight: null, // 고정 최대 높이 제한 없음
    useViewportLimit: true, // 뷰포트 기반 제한 사용
    viewportMargin: 50, // 하단 여백 50px
    onResize: (newHeight) => {
      // 자동 높이 조정을 비활성화하고 수동으로 높이 설정
      if (autoHeight) {
        toggleAutoHeight(false);
      }
      setManualHeight(`${newHeight}px`);
    }
  });

  // 들여쓰기 모드 - useTableIndent 훅 사용
  const { indentMode, toggleIndentMode } = useTableIndent(true);
  
  // 동적 유형이 로드된 후 데이터 변환
  const processedData = useMemo(() => {
    if (!typesInitialized || Object.keys(types).length === 0 || tableData.length === 0) {
      return []; // 동적 유형이나 테이블 데이터가 없으면 빈 배열 반환
    }
    
    // 동적으로 생성된 테이블 데이터는 이미 올바른 형식이므로 그대로 사용
    return tableData;
  }, [typesInitialized, types, tableData]);

  // 유형 계층 관리 훅 사용 (동적 유형 사용)
  const {
    hierarchicalData,
    expandedTypes,
    toggleTypeExpand,
    setAllExpanded
  } = useTypeHierarchy({
    data: processedData,
    types: typesInitialized ? types : {},
    typeHierarchy: typesInitialized ? typeHierarchy : {},
    expandAll: true
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
    console.log('엑셀 다운로드 기능 호출');
    alert('엑셀 다운로드 기능이 호출되었습니다');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('인쇄 기능 호출');
    alert('인쇄 기능이 호출되었습니다');
  }, []);

  // 페이지네이션 직접 제어 로직 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(10);

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
    data: hierarchicalData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: true,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

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
    totalPages, // 총 페이지 수 추가
    handlePageChange,
    handleRowsPerPageChange,
    filteredData,
    displayData,
    filterValues,
    handleFilter,
    handleClearFilters
  } = useTableFilterAndPagination({
    columns: initialColumns,
    data: hierarchicalData,
    defaultRowsPerPage: 10,
    hierarchical: true,
    filterOptions: {
      initialFilters: { status: 'all', category: 'all' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 10,
      totalItems: tableData.length,
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
    initialTotalItems: tableData.length,
    onSearch: (value) => {
      console.log(`검색어: ${value}`);
      // 검색어 변경 시 첫 페이지로 이동
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      console.log(`컬럼 고정 토글: ${hasPinned}`);
      if (hasPinned) {
        // 고정 활성화 - 기본 컬럼들 고정
        setDefaultPinnedColumns();
      } else {
        // 고정 해제 - 모든 고정 해제
        clearAllPinnedColumns();
      }
    }
  });

  // 검색어 디버깅
  useEffect(() => {
    console.log(`현재 검색어 상태: "${searchText}"`);
  }, [searchText]);

  // 그리드 준비 상태로 설정 (컬럼고정 버튼 활성화)
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
    initialColumns,
    tableId: 'main_table',
    onColumnOrderChange: (newColumns) => {
      console.log('컬럼 순서 변경:', newColumns);
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
    defaultHiddenColumns: [], // 기본적으로 모든 컬럼 표시
    alwaysVisibleColumns: ['checkbox'], // 체크박스는 항상 표시
    tableId: 'main_table'
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

  // 드래그 앤 드롭은 상시 활성화
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
    console.log('Row clicked:', row);
  };

  // 계층 펼치기/접기 핸들러
  const handleToggleExpand2 = useCallback((id) => {
    console.log(`유형 토글: ${id}`);
    // TypeHierarchy 토글 호출
    toggleTypeExpand(id);
    
    // tableHandleToggleExpand가 정의된 경우에만 호출
    if (typeof tableHandleToggleExpand === 'function') {
      tableHandleToggleExpand(id);
    } else {
      console.log('tableHandleToggleExpand 함수가 정의되지 않았습니다.');
      
      // expandedRows 상태 직접 업데이트 (주석 처리: setExpandedRows 함수가 없음)
      // if (expandedRows) {
      //   const newExpandedRows = { ...expandedRows };
      //   newExpandedRows[id] = !newExpandedRows[id];
      //   // 상태 업데이트 함수가 있다면 호출
      //   if (typeof setExpandedRows === 'function') {
      //     setExpandedRows(newExpandedRows);
      //   }
      // }
    }
  }, [toggleTypeExpand, tableHandleToggleExpand]);

  // 필터 콜백 함수 - 각 필터 타입에 맞는 로직 적용
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'status':
        if (filterValue === 'all') return result;
        
        // 상태별 필터링 - 중앙화된 types 정보 사용
        return result.filter(item => {
          // 항목의 유형 라벨을 찾아서 해당하는 유형 ID 찾기
          const typeId = Object.keys(types).find(
            key => types[key].label === (item.type && item.type.label)
          );
          
          // 찾은 유형 ID가 있고 해당 유형의 카테고리가 필터값과 일치하면 포함
          return typeId && types[typeId].category === filterValue;
        });
        
      case 'category':
        if (filterValue === 'all') return result;
        
        // 특정 유형 필터링
        const targetType = types[filterValue];
        if (!targetType) return result;
        
        return result.filter(item => 
          item.type && item.type.label === targetType.label
        );
        
      case 'date':
        let dateFilteredResult = [...result];
        
        // 시작 날짜 필터 (예시로 id 기준 필터링)
        if (filterValue.startDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id >= 10);
        }
        
        // 종료 날짜 필터 (예시로 id 기준 필터링)
        if (filterValue.endDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id <= 20);
        }
        
        return dateFilteredResult;
      default:
        return result;
    }
  }, []);
  
  // 추가: 커스텀 handleFilterChange 함수 생성
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`필터 변경: ${filterId} = ${value}`);
    // 기존 handleFilter 함수 호출
    handleFilter({
      [filterId]: value
    });
  }, [handleFilter]);
  
  // 추가: 기본 필터 옵션 생성
  const defaultFilterOptions = [
    {
      id: 'status',
      label: '상태',
      items: [
        { value: '', label: '전체' },
        { value: 'active', label: '활성' },
        { value: 'inactive', label: '비활성' }
      ]
    },
    {
      id: 'type',
      label: '유형',
      items: [
        { value: '', label: '전체' },
        ...Object.keys(types).map(typeId => ({
          value: typeId,
          label: types[typeId].label
        }))
      ]
    }
  ];
  
  // 기본 필터 값 설정 (기존 activeFilters이 없거나 all을 포함할 경우 빈 문자열로 대체)
  const safeActiveFilters = useMemo(() => {
    const result = { ...activeFilters };
    
    // 각 필터 키에 대해 'all' 값을 빈 문자열로 변경
    Object.keys(result).forEach(key => {
      if (result[key] === 'all') {
        result[key] = '';
      }
    });
    
    return result;
  }, [activeFilters]);
  
  // useTableData 훅을 사용하여 필터링된 데이터 다시 계산
  const computedFilteredData = useTableData({
    data: processedData, // 동적으로 생성된 데이터 사용
    activeFilters: safeActiveFilters,
    searchText,
    isDateFilterActive,
    dateRange,
    filterCallback
  });
  
  // 필터링된 데이터를 useTypeHierarchy에 적용하여 계층 유지
  // 필터링된 데이터의 ID 목록 생성
  const filteredIds = useMemo(() => {
    return computedFilteredData ? computedFilteredData.map(item => item.id) : [];
  }, [computedFilteredData]);
  
  // hierarchicalData에서 filteredIds에 포함된 항목만 필터링
  const filteredHierarchicalData = useMemo(() => {
    if (!hierarchicalData || !filteredIds || filteredIds.length === 0) return [];
    
    return hierarchicalData.filter(item => filteredIds.includes(item.id));
  }, [hierarchicalData, filteredIds]);
  
  // 페이지 관련 효과 추가
  useEffect(() => {
    // BaseTable에서 직접 페이지네이션을 처리하도록 변경됨
    console.log(`페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredHierarchicalData || [];
  
  // 실제 전체 항목 수 계산 (계층 구조가 평면화되었을 때의 전체 항목 수)
  const totalFlattenedItems = useMemo(() => {
    // 재귀적으로 계층 구조의 모든 항목 카운트
    const countAllItems = (items) => {
      if (!items || !items.length) return 0;
      
      let count = 0;
      items.forEach(item => {
        // 현재 항목 카운트
        count++;
        
        // 자식 항목이 있으면 재귀적으로 카운트
        if (item.children && item.children.length > 0) {
          count += countAllItems(item.children);
        }
      });
      
      return count;
    };
    
    return countAllItems(safeFilteredData);
  }, [safeFilteredData]);
  
  // 이전에 추가했던 복잡한 페이지네이션 관련 코드 대신 심플한 방식으로 처리
  // BaseTable 컴포넌트 내부에서 페이지네이션 처리하므로 여기서는 단순 전달만 함
  const safeDisplayData = safeFilteredData;

  // 필터링된 데이터가 변경될 때 TableHeader의 totalItems 값도 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      console.log(`검색/필터 결과: ${safeFilteredData.length}개 항목 찾음 (평면화: ${totalFlattenedItems}개)`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 변경 핸들러 (디버그 로깅 추가)
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    // 페이지 번호 정규화
    let pageIndex = newPageIndex;
    
    // 매개변수가 하나만 전달된 경우
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`직접 페이지 변경: ${currentPage} -> ${pageIndex} (타입: ${typeof pageIndex})`);
    
    // 숫자가 아닌 경우 현재 페이지 유지
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    // 페이지 상태 업데이트
    setCurrentPage(pageIndex);
    
    // 원래 핸들러 호출
    handlePageChange(pageIndex);
    
    console.log(`페이지 ${pageIndex + 1}의 데이터 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러 (디버그 로깅 추가)
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    // 이벤트 객체 확인
    if (!event || !event.target || !event.target.value) {
      console.error('행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`직접 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    // 상태 업데이트
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // 첫 페이지로 이동
    
    // 원래 핸들러 호출
    handleRowsPerPageChange(event);
    
    console.log(`새 행 수 ${newRowsPerPage}로 테이블 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 현재 rowsPerPage 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    console.log(`페이지네이션 변수: 페이지=${currentPage}, 행수=${currentRowsPerPage}, 총=${totalFlattenedItems}`);
    return safeFilteredData; // TableBody에서 직접 페이지네이션 적용
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
        <PageHeader
        title="테이블 필터링 및 페이지네이션 예제"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={false}
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
        <Typography variant="h5" gutterBottom>
          TableFilterAndPagination 컴포넌트 사용 예시
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          아래는 <code>TableFilterAndPagination</code> 컴포넌트를 사용한 예시입니다.
          테이블 상단에 위치하여 필터링과 페이지 이동 기능을 제공합니다.
          하단에는 구분선이 추가되어 테이블 콘텐츠와의 경계를 명확히 합니다.
          <strong> 상단의 "표시 옵션" 버튼을 클릭하여 컬럼 표시/숨김을 제어할 수 있습니다.</strong>
        </Typography>

        {/* 유형 계층 트리 뷰 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            유형 계층 구조 {typesLoading && '(로딩 중...)'} {typesError && '(오류 발생)'}
          </Typography>
          {typesInitialized && Object.keys(types).length > 0 ? (
            <TypeTreeView 
              types={types}
              typeHierarchy={typeHierarchy}
              expandedTypes={expandedTypes}
              onTypeToggle={toggleTypeExpand}
              onExpandAll={setAllExpanded}
              direction="horizontal"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {typesLoading ? '동적 유형을 로드하는 중...' : 
               typesError ? `오류: ${typesError}` : 
               '동적 유형이 설정되지 않았습니다.'}
            </Typography>
          )}
        </Box>
        
        {/* 테이블 설정 옵션 */}
        <TableHeightSetting
          tableHeight={tableHeight}
          autoHeight={autoHeight}
          toggleAutoHeight={toggleAutoHeight}
          setManualHeight={setManualHeight}
          minHeight={200}
          maxHeight={1200}
          step={50}
        />

        {/* 테이블 헤더 컴포넌트 */}
        <TableHeader
          title="회원 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##명의 회원"
          indentMode={indentMode}
          toggleIndentMode={toggleIndentMode}
          sequentialPageNumbers={sequentialPageNumbers}
          togglePageNumberMode={togglePageNumberMode}
          hasPinnedColumns={hasPinnedColumns}
          isGridReady={isGridReady}
          toggleColumnPin={headerToggleColumnPin}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          showIndentToggle={true}
          showPageNumberToggle={true}
          showColumnPinToggle={true}
          showSearch={true}
          searchPlaceholder="회원 검색..."
          sx={{ mb: 2 }}
        />

        <Box sx={{ width: '100%' }}>
          <TableFilterAndPagination
            filterProps={{
              columns: columns,
              filterValues: filterValues || {},
              activeFilters: safeActiveFilters || {},
              filterOptions: defaultFilterOptions,
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
        <Box sx={{ width: '100%', mt: 2 }} ref={containerRef}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            현재 페이지: {currentPage + 1} / {Math.ceil(totalFlattenedItems / currentRowsPerPage)} (페이지당 {currentRowsPerPage}행)
            {' - 컬럼을 드래그하여 순서를 변경할 수 있습니다.'}
          </Typography>
                      <BaseTable
              key={`table-${tableKey}`}
              columns={visibleColumns}
              data={visibleData}
              checkable={true}
              hierarchical={true}
              indentMode={indentMode}
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
          
          {/* 디버깅용 정보 */}
          <TableDebugInfo
            totalItems={totalFlattenedItems}
            totalPages={Math.ceil(totalFlattenedItems / currentRowsPerPage)}
            currentPage={currentPage}
            currentRowsPerPage={currentRowsPerPage}
            totalCount={totalFlattenedItems}
            searchText={searchText}
            sequentialPageNumbers={sequentialPageNumbers}
            isDragging={isDragging}
            tableHeight={tableHeight}
            calculateMaxHeight={calculateMaxHeight}
            pinnedColumns={pinnedColumns}
            visibleColumns={visibleColumns}
            hiddenColumnsCount={hiddenColumnsCount}
            columnVisibility={columnVisibility}
          />
        </Box>
        </Paper>
    </PageContainer>
  );
};

export default TableFilterAndPaginationExample; 