import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { 
  PageHeader, 
  PageContainer,
  ColumnVisibilityDialog,
  TableFilterAndPagination,
  TableHeader,
  BaseTable,
  TableResizeHandle,
  TableHeightSetting,
  TableDebugInfo
} from '../../../components/baseTemplate/components';
import { 
  useColumnVisibility,
  useTableFilterAndPagination,
  useTableHeader,
  useTable,
  useTableAutoHeight,
  useTableColumnDrag,
  useTableData,
  useTableResize
} from '../../../components/baseTemplate/hooks';
import { 
  permissionColumns, 
  permissionFilterOptions as filterOptions 
} from './data';
import { PermissionDialog, DeleteConfirmDialog } from './components';
import permissionApi from '../../../services/permissionApi';
import { agentLevelApi } from '../../../services/agentLevelApi';

/**
 * 권한 관리 페이지
 * 시스템 권한 설정 및 관리 기능을 제공합니다.
 */
const PermissionPage = () => {
  // React Router 네비게이션
  const navigate = useNavigate();

  // 탭 상태 (0: 단계설정, 1: 권한설정)
  const [currentTab, setCurrentTab] = useState(1); // 권한설정 탭이 활성

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(10);

  // 필터 상태
  const [filterValues, setFilterValues] = useState({});
  const [activeFilters, setActiveFilters] = useState({ 
    status: 'all'
  });

  // 데이터 상태 (API에서 로드)
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 0) {
      // 단계설정 탭
      navigate('/site-settings/agent-level');
    } else if (newValue === 1) {
      // 권한설정 탭 - 현재 페이지 유지
      // 이미 권한설정 페이지이므로 별도 네비게이션 불필요
    }
  }, [navigate]);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionApi.getAll();
      setLocalData(data);
      console.log('권한 데이터가 API에서 로드되었습니다:', data);
    } catch (err) {
      console.error('권한 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 다이얼로그 상태
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPermission, setCurrentPermission] = useState({
    permissionName: '',
    description: '',
    isActive: true
  });

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // 데이터 처리 (간단한 필터링과 페이지네이션)
  const filteredData = useMemo(() => {
    let result = [...localData];
    
    // 상태별 필터링
    if (activeFilters.status && activeFilters.status !== 'all') {
      if (activeFilters.status === 'active') {
        result = result.filter(item => item.isActive === true);
      } else if (activeFilters.status === 'inactive') {
        result = result.filter(item => item.isActive === false);
      }
    }
    
    return result;
  }, [localData, activeFilters]);

  const displayData = useMemo(() => {
    return filteredData;
  }, [filteredData]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / currentRowsPerPage);

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
    data: displayData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false, // 권한은 계층 구조가 아님
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // useTableColumnDrag 훅: 원본 permissionColumns를 사용
  const {
    columns: orderedColumnsFromHook,
    pinnedColumns,
    toggleColumnPin,
    clearAllPinnedColumns: resetColumnPin,
    isColumnPinned
  } = useTableColumnDrag({
    initialColumns: permissionColumns,
    initialPinnedColumns: ['checkbox', 'number', 'permissionName'],
    tableId: 'permission_table_v1',
    enableColumnPinning: true
  });

  // 다이얼로그 관련 함수들 (다른 함수들이 참조하므로 먼저 정의)
  const handleOpenDialog = useCallback((permission = null) => {
    if (permission) {
      setCurrentPermission({ 
        ...permission,
        restrictions: permission.restrictions || { menus: [], buttons: [], layouts: [], cssSelectors: [] }
      });
      setEditMode(true);
    } else {
      setCurrentPermission({
        permissionName: '',
        description: '',
        isActive: true,
        restrictions: { menus: [], buttons: [], layouts: [], cssSelectors: [] }
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  // 입력 필드 핸들러
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentPermission(prev => ({ ...prev, [name]: value }));
  }, []);

  // 권한명 변경 시 단계 설정 업데이트 함수
  const updateAgentLevelPermissions = useCallback(async (oldPermissionName, newPermissionName) => {
    try {
      // 모든 단계 데이터 조회
      const agentLevels = await agentLevelApi.getAll();
      
      // 해당 권한을 사용하는 단계들 찾기
      const levelsToUpdate = agentLevels.filter(level => 
        level.permission === oldPermissionName  // 's' 제거 - 실제 DB 필드명
      );
      
      // 각 단계의 권한명 업데이트
      for (const level of levelsToUpdate) {
        await agentLevelApi.update(level.id, {
          ...level,
          permission: newPermissionName  // 's' 제거 - 실제 DB 필드명
        });
      }
      
      if (levelsToUpdate.length > 0) {
        console.log(`${levelsToUpdate.length}개의 단계에서 권한명이 업데이트되었습니다.`);
      }
    } catch (error) {
      console.error('단계 설정 권한명 업데이트 실패:', error);
      // 에러가 발생해도 권한 저장은 성공했으므로 경고만 표시
      alert('권한은 저장되었지만, 단계 설정의 권한명 업데이트에 실패했습니다.');
    }
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    // 입력 검증
    if (!currentPermission.permissionName.trim()) {
      alert('권한명을 입력해주세요.');
      return;
    }
    
    if (!currentPermission.description.trim()) {
      alert('설명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      if (editMode) {
        // 수정 모드: 권한명 변경 여부 확인
        const originalPermission = localData.find(item => item.id === currentPermission.id);
        const permissionNameChanged = originalPermission && 
          originalPermission.permissionName !== currentPermission.permissionName.trim();
        
        // API로 데이터 업데이트
        const updatedPermission = await permissionApi.update(currentPermission.id, {
          permissionName: currentPermission.permissionName.trim(),
          description: currentPermission.description.trim(),
          isActive: currentPermission.isActive,
          restrictions: currentPermission.restrictions
        });
        
        // 권한명이 변경된 경우 단계 설정도 업데이트
        if (permissionNameChanged) {
          await updateAgentLevelPermissions(
            originalPermission.permissionName, 
            updatedPermission.permissionName
          );
        }
        
        // 로컬 상태 업데이트
        setLocalData(prevData => 
          prevData.map(item => 
            item.id === currentPermission.id ? updatedPermission : item
          )
        );
        
        console.log('권한 수정 완료:', updatedPermission.permissionName);
      } else {
        // 추가 모드: API로 새 데이터 추가
        const newPermission = await permissionApi.create({
          permissionName: currentPermission.permissionName.trim(),
          description: currentPermission.description.trim(),
          isActive: currentPermission.isActive,
          restrictions: currentPermission.restrictions || { menus: [], buttons: [], layouts: [], cssSelectors: [] }
        });
        
        // 로컬 상태 업데이트
        setLocalData(prevData => [...prevData, newPermission]);
        console.log('새 권한 추가 완료:', newPermission);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('저장 실패:', err);
      alert(`저장에 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPermission, editMode, handleCloseDialog, localData, updateAgentLevelPermissions]);

  // 액션 버튼 핸들러들
  const handleEdit = useCallback((row) => {
    console.log('=== handleEdit 함수 호출됨 ===');
    console.log('수정 버튼 클릭:', row);
    try {
      handleOpenDialog(row);
      console.log('handleOpenDialog 호출 완료');
    } catch (error) {
      console.error('handleOpenDialog 호출 중 에러:', error);
    }
  }, [handleOpenDialog]);

  const handleDelete = useCallback((row) => {
    console.log('=== handleDelete 함수 호출됨 ===');
    console.log('삭제 버튼 클릭:', row);
    try {
      setDeleteTargetId(row.id);
      setDeleteTargetName(row.permissionName);
      setDeleteDialogOpen(true);
      console.log('삭제 다이얼로그 상태 설정 완료');
    } catch (error) {
      console.error('삭제 다이얼로그 설정 중 에러:', error);
    }
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTargetId) {
      try {
        setLoading(true);
        
        // 삭제할 권한명 저장
        const permissionToDelete = localData.find(item => item.id === deleteTargetId);
        
        // API로 데이터 삭제
        await permissionApi.delete(deleteTargetId);
        
        // 해당 권한을 사용하는 단계들의 권한을 빈 값으로 업데이트
        if (permissionToDelete) {
          await updateAgentLevelPermissions(permissionToDelete.permissionName, '');
        }
        
        // 로컬 상태 업데이트
        setLocalData(prevData => prevData.filter(item => item.id !== deleteTargetId));
        console.log('권한 삭제 완료:', deleteTargetName);
      } catch (err) {
        console.error('삭제 실패:', err);
        alert(`삭제에 실패했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetName('');
  }, [deleteTargetId, deleteTargetName, localData, updateAgentLevelPermissions]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetName('');
  }, []);

  // 토글 변경 핸들러
  const handleToggleActive = useCallback(async (row, newValue) => {
    try {
      console.log('활성 상태 변경:', row.id, newValue);
      
      // API 호출로 상태 업데이트
      await permissionApi.update(row.id, { ...row, isActive: newValue });
      
      // 로컬 데이터 업데이트
      setLocalData(prevData => 
        prevData.map(item => 
          item.id === row.id 
            ? { ...item, isActive: newValue }
            : item
        )
      );
      
      console.log('활성 상태가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('활성 상태 변경 실패:', error);
      // 에러 발생 시 원래 상태로 되돌리기 위해 데이터 다시 로드
      loadData();
    }
  }, [loadData]);

  // orderedColumnsFromHook을 기반으로 최종 테이블 컬럼 생성 (핸들러 재연결)
  const finalColumnsForTable = useMemo(() => {
    return orderedColumnsFromHook.map(column => {
      if (column.id === 'actions' && column.buttons) {
        return {
          ...column,
          buttons: column.buttons.map(button => {
            let newOnClick = button.onClick;
            if (button.label === '수정') {
              newOnClick = handleEdit;
            } else if (button.label === '삭제') {
              newOnClick = handleDelete;
            }
            return {
              ...button,
              onClick: newOnClick,
            };
          })
        };
      } else if (column.id === 'isActive' && column.type === 'toggle') {
        return {
          ...column,
          onToggle: handleToggleActive
        };
      }
      return column;
    });
  }, [orderedColumnsFromHook, handleEdit, handleDelete, handleToggleActive]);

  // 컬럼 표시옵션 관련 훅 사용 (finalColumnsForTable 기반)
  const {
    columnVisibility,
    visibleColumns,
    hiddenColumnsCount,
    toggleableColumns: originalToggleableColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(finalColumnsForTable, {
    defaultHiddenColumns: [], // 기본적으로 모든 컬럼 표시
    alwaysVisibleColumns: ['checkbox', 'number', 'permissionName'], // 체크박스, No., 권한명은 항상 표시
    tableId: 'permission_table_v1'
  });

  // 표시옵션 다이얼로그 상태
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  const isDisplayOptionsOpen = Boolean(displayOptionsAnchor);

  // 테이블 높이 자동 조정
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

  // 기타 핸들러 함수들
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
  }, []);

  const handleFilter = useCallback((values) => {
    setFilterValues(values);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({ status: 'all' });
    setFilterValues({});
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  }, []);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(() => {
    console.log('권한 엑셀 다운로드');
    alert('권한 엑셀 다운로드 기능이 호출되었습니다');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('권한 인쇄');
    alert('권한 인쇄 기능이 호출되었습니다');
  }, []);

  // 표시옵션 버튼 클릭 핸들러
  const handleDisplayOptionsClick = useCallback((anchorElement) => {
    setDisplayOptionsAnchor(anchorElement);
  }, []);

  // 표시옵션 다이얼로그 닫기 핸들러
  const handleDisplayOptionsClose = useCallback(() => {
    setDisplayOptionsAnchor(null);
  }, []);

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    console.log('권한 데이터 새로고침');
    await loadData();
    console.log('데이터가 새로고침되었습니다.');
  }, [loadData]);

  // 추가 버튼 핸들러 (권한 추가 다이얼로그 열기)
  const handleAdd = useCallback(() => {
    handleOpenDialog();
  }, [handleOpenDialog]);

  // finalColumnsForTable과 일치하는 toggleableColumns 생성
  const toggleableColumns = useMemo(() => {
    return finalColumnsForTable.filter(column => {
      // hideable이 false가 아닌 컬럼들만 토글 가능
      return column.hideable !== false;
    });
  }, [finalColumnsForTable]);

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
    initialTotalItems: totalCount,
    onSearch: (value) => {
      console.log(`권한 검색어: ${value}`);
      if (currentPage !== 0) {
        setCurrentPage(0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      if (pinnedColumns.length > 0) {
        resetColumnPin();
      } else {
        if (!isColumnPinned('checkbox')) toggleColumnPin('checkbox');
        if (!isColumnPinned('number')) toggleColumnPin('number');
        if (!isColumnPinned('permissionName')) toggleColumnPin('permissionName');
      }
    }
  });

  // 행 클릭 핸들러
  const handleRowClick = useCallback((row) => {
    console.log('권한 행 클릭:', row);
    // 필요한 경우 여기에 행 클릭 관련 로직 추가
  }, []);

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="단계/권한설정"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        onRefreshClick={handleRefresh}
        onAddClick={handleAdd}
        showAddButton={true}
        showRefreshButton={true}
        addButtonText="권한 추가"
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
            <Tab label="단계설정" />
            <Tab label="권한설정" />
          </Tabs>
        }
        sx={{ mb: 3 }}
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

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 로딩 상태 */}
      {loading && !localData.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* 메인 테이블 영역 */
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', p: 2 }}>
          {/* 테이블 헤더 */}
          <TableHeader
            title="권한 목록"
            totalItems={totalCount}
            countLabel="총 ##count##개의 권한"
            sequentialPageNumbers={sequentialPageNumbers}
            togglePageNumberMode={togglePageNumberMode}
            hasPinnedColumns={pinnedColumns.length > 0}
            isGridReady={isGridReady}
            toggleColumnPin={headerToggleColumnPin}
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
            showPageNumberToggle={true}
            showColumnPinToggle={true}
            showSearch={true}
            searchPlaceholder="권한 검색..."
            sx={{ mb: 2 }}
          />

          {/* 필터 및 페이지네이션 */}
          <TableFilterAndPagination
            filterProps={{
              activeFilters: activeFilters,
              handleFilterChange: (filterId, filterValue) => {
                const newFilters = { ...activeFilters, [filterId]: filterValue };
                handleFilterChange(newFilters);
              },
              filterOptions: filterOptions,
              showDateFilter: false // 날짜 필터는 사용하지 않음
            }}
            paginationProps={{
              count: totalCount,
              page: currentPage,
              rowsPerPage: currentRowsPerPage,
              onPageChange: handlePageChange,
              onRowsPerPageChange: (event) => {
                const newRowsPerPage = parseInt(event.target.value, 10);
                handleRowsPerPageChange(newRowsPerPage);
              },
              onExcelDownload: handleExcelDownload,
              onPrint: handlePrint
            }}
          />

          {/* 테이블 컨테이너 */}
          <Box 
            ref={containerRef}
            sx={{ 
              width: '100%',
              mt: 2,
              pb: 2
            }}
          >
            {/* 테이블 */}
            <BaseTable
              columns={finalColumnsForTable}
              data={displayData}
              checkable={true}
              fixedHeader={true}
              maxHeight={tableHeight}
              checkedItems={tableCheckedItems}
              allChecked={tableAllChecked}
              expandedRows={tableExpandedRows}
              sortConfig={tableSortConfig}
              pinnedColumns={pinnedColumns}
              onCheck={tableHandleCheck}
              onToggleAll={tableHandleToggleAll}
              onSort={tableHandleSort}
              onToggleExpand={tableHandleToggleExpand}
              onRowClick={handleRowClick}
              indentMode={false}
              sequentialPageNumbers={sequentialPageNumbers}
              page={currentPage}
              rowsPerPage={currentRowsPerPage}
              totalCount={totalCount}
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
              currentPage={currentPage}
              currentRowsPerPage={currentRowsPerPage}
              dataLength={localData.length}
              filteredDataLength={filteredData.length}
              totalFlattenedItems={totalCount}
              searchText={searchText}
              sequentialPageNumbers={sequentialPageNumbers}
              isDragging={isDragging}
              tableHeight={tableHeight}
              pinnedColumns={pinnedColumns}
              visibleColumnsCount={visibleColumns.length}
              totalColumnsCount={permissionColumns.length}
              hiddenColumnsCount={hiddenColumnsCount}
              columnVisibility={columnVisibility}
              autoHeight={autoHeight}
              calculateMaxHeight={calculateMaxHeight}
              show={true}
            />
          </Box>
        </Paper>
      )}

      {/* 권한 추가/수정 다이얼로그 */}
      <PermissionDialog
        open={openDialog}
        editMode={editMode}
        currentPermission={currentPermission}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onInputChange={handleInputChange}
      />

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="권한 삭제 확인"
        itemName={deleteTargetName}
        itemType="권한"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </PageContainer>
  );
};

export default PermissionPage;