import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, FormControlLabel, Switch, Snackbar, Alert, Divider } from '@mui/material';
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
  noticesColumns, 
  importanceOptions, 
  statusOptions, 
  targetOptions, 
  generateNoticesData 
} from './data/noticesData';
import SimpleRichTextEditor from '../../components/common/SimpleRichTextEditor';

/**
 * 공지사항 관리 페이지
 */
const NoticesPage = () => {
  // 공지사항 데이터 상태
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  // 다이얼로그 상태
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create or edit
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    writer: '관리자',
    importance: 'medium',
    status: 'active',
    pinned: false,
    target: 'all'
  });

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    const data = generateNoticesData(50);
    setNotices(data);
  }, []);

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
    console.log('공지사항 엑셀 다운로드');
    showNotification('공지사항을 엑셀로 다운로드합니다.', 'info');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('공지사항 인쇄');
    showNotification('공지사항을 인쇄합니다.', 'info');
  }, []);

  // 페이지네이션 상태
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
    data: notices,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 행 클릭 핸들러
  const handleRowClick = useCallback((row) => {
    setSelectedNotice(row);
    setIsDetailDialogOpen(true);
  }, []);

  // 액션 핸들러
  const handleEdit = useCallback((notice) => {
    setSelectedNotice(notice);
    setFormMode('edit');
    setFormData({
      title: notice.title,
      content: notice.content,
      writer: notice.writer,
      importance: notice.importance,
      status: notice.status,
      pinned: notice.pinned,
      target: notice.target
    });
    setIsFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((notice) => {
    if (window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) {
      const updatedNotices = notices.filter(item => item.id !== notice.id);
      setNotices(updatedNotices);
      showNotification('공지사항이 삭제되었습니다.', 'success');
    }
  }, [notices]);

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return noticesColumns.map(column => {
      if (column.id === 'actions') {
        return {
          ...column,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(params.row);
                }}
              >
                수정
              </Button>
              <Button
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(params.row);
                }}
              >
                삭제
              </Button>
            </Box>
          )
        };
      }
      return column;
    });
  }, [handleEdit, handleDelete]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return [
      {
        id: 'importance',
        label: '중요도',
        items: [
          { value: '', label: '전체' },
          ...importanceOptions
        ]
      },
      {
        id: 'status',
        label: '상태',
        items: [
          { value: '', label: '전체' },
          ...statusOptions
        ]
      },
      {
        id: 'target',
        label: '대상',
        items: [
          { value: '', label: '전체' },
          ...targetOptions
        ]
      }
    ];
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
    data: notices,
    defaultRowsPerPage: 10,
    hierarchical: false,
    filterOptions: {
      initialFilters: { importance: '', status: '', target: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 10,
      totalItems: notices.length,
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
    initialTotalItems: notices.length,
    initialSequentialPageNumbers: true,
    onSearch: (value) => {
      console.log(`공지사항 검색: ${value}`);
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
    tableId: 'notices_table',
    initialPinnedColumns: ['no', 'title'],
    onColumnOrderChange: (newColumns) => {
      console.log('공지사항 테이블 컬럼 순서 변경:', newColumns);
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
    alwaysVisibleColumns: ['no', 'title'],
    tableId: 'notices_table'
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
      case 'importance':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.importance === filterValue);
        
      case 'status':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.status === filterValue);
        
      case 'target':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.target === filterValue);
        
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`공지사항 필터 변경: ${filterId} = ${value}`);
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
    data: notices,
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
      return notices;
    }
    
    // 필터가 있는 경우에만 filteredIds로 필터링
    if (!notices || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    return notices.filter(item => filteredIds.includes(item.id));
  }, [notices, filteredIds, safeActiveFilters, searchText]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredFlatData || [];
  
  // 실제 전체 항목 수 계산 (일반 배열이므로 단순 길이)
  const totalFlattenedItems = safeFilteredData.length;

  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    console.log(`공지사항 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`공지사항 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('공지사항 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`공지사항 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`공지사항 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`공지사항 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 드래그 앤 드롭 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // 등록 버튼 클릭 핸들러
  const handleAddClick = () => {
    setFormMode('create');
    setFormData({
      title: '',
      content: '',
      writer: '관리자',
      importance: 'medium',
      status: 'active',
      pinned: false,
      target: 'all'
    });
    setIsFormDialogOpen(true);
  };

  // 새로고침 버튼 클릭 핸들러
  const handleRefreshClick = () => {
    const data = generateNoticesData(50);
    setNotices(data);
    showNotification('데이터를 새로고침했습니다.', 'success');
  };

  // 폼 제출 핸들러
  const handleFormSubmit = () => {
    if (formMode === 'create') {
      const newNotice = {
        id: notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1,
        no: notices.length > 0 ? Math.max(...notices.map(n => n.no)) + 1 : 1,
        title: formData.title,
        content: formData.content,
        writer: formData.writer,
        importance: formData.importance,
        status: formData.status,
        pinned: formData.pinned,
        target: formData.target,
        viewCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setNotices(prev => [newNotice, ...prev]);
      showNotification('새 공지사항이 등록되었습니다.', 'success');
    } else {
      const updatedNotices = notices.map(notice => 
        notice.id === selectedNotice.id
          ? {
              ...notice,
              title: formData.title,
              content: formData.content,
              writer: formData.writer,
              importance: formData.importance,
              status: formData.status,
              pinned: formData.pinned,
              target: formData.target,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : notice
      );
      
      setNotices(updatedNotices);
      showNotification('공지사항이 수정되었습니다.', 'success');
    }
    
    setIsFormDialogOpen(false);
  };

  // 폼 필드 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pinned' ? checked : value
    }));
  };

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="공지사항"
        onAddClick={handleAddClick}
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={true}
        showRefreshButton={true}
        onRefreshClick={handleRefreshClick}
        addButtonText="공지사항 등록"
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
          title="공지사항 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##개의 공지사항"
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
          searchPlaceholder="공지사항 검색..."
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
            key={`notices-table-${tableKey}`}
            columns={visibleColumns}
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
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
      </Paper>

      {/* 공지사항 상세 다이얼로그 */}
      <Dialog
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedNotice && (
          <>
            <DialogTitle>
              공지사항 상세 정보
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {selectedNotice.title}
                {selectedNotice.pinned && (
                  <Box component="span" sx={{ ml: 1, color: 'error.main' }}>
                    [상단고정]
                  </Box>
                )}
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                <Typography variant="body2">
                  작성자: {selectedNotice.writer} | 
                  작성일: {selectedNotice.createdAt} | 
                  수정일: {selectedNotice.updatedAt} | 
                  조회수: {selectedNotice.viewCount}
                </Typography>
                <Typography variant="body2">
                  중요도: {
                    importanceOptions.find(opt => opt.value === selectedNotice.importance)?.label
                  } | 
                  상태: {
                    statusOptions.find(opt => opt.value === selectedNotice.status)?.label
                  } | 
                  대상: {
                    targetOptions.find(opt => opt.value === selectedNotice.target)?.label
                  }
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedNotice.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDetailDialogOpen(false)}>닫기</Button>
              <Button onClick={() => {
                setIsDetailDialogOpen(false);
                handleEdit(selectedNotice);
              }}>수정</Button>
              <Button color="error" onClick={() => {
                setIsDetailDialogOpen(false);
                handleDelete(selectedNotice);
              }}>삭제</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 공지사항 등록/수정 다이얼로그 */}
      <Dialog
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formMode === 'create' ? '공지사항 등록' : '공지사항 수정'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="제목"
                value={formData.title}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>중요도</InputLabel>
                <Select
                  name="importance"
                  value={formData.importance}
                  onChange={handleFormChange}
                  label="중요도"
                >
                  {importanceOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>상태</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  label="상태"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>대상</InputLabel>
                <Select
                  name="target"
                  value={formData.target}
                  onChange={handleFormChange}
                  label="대상"
                >
                  {targetOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="pinned"
                    checked={formData.pinned}
                    onChange={handleFormChange}
                  />
                }
                label="상단 고정"
              />
            </Grid>
            
            <Grid item xs={12}>
              <SimpleRichTextEditor
                value={formData.content}
                onChange={(value) => handleFormChange({ target: { name: 'content', value } })}
                fullWidth
                minHeight={200}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="writer"
                label="작성자"
                value={formData.writer}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormDialogOpen(false)}>취소</Button>
          <Button 
            variant="contained" 
            onClick={handleFormSubmit}
            disabled={!formData.title || !formData.content || !formData.writer}
          >
            {formMode === 'create' ? '등록' : '수정'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default NoticesPage;
