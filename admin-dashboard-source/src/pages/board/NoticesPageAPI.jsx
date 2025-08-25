import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, FormControlLabel, Switch, Snackbar, Alert, Divider } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from 'date-fns/locale/ko';
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
import SimpleRichTextEditor from '../../components/common/SimpleRichTextEditor';
import apiService from '../../services/api';
import { format, parseISO } from 'date-fns';
import { noticesColumns, NOTICES_COLUMNS_VERSION } from './data/noticesData';

// 컬럼 버전 (컬럼 구조 변경 시 증가)
const NOTICES_API_COLUMNS_VERSION = NOTICES_COLUMNS_VERSION;


// 필터 옵션
const targetOptions = [
  { value: 'all', label: '전체' },
  { value: 'member', label: '회원' },
  { value: 'agent', label: '에이전트' }
];

const priorityOptions = [
  { value: 'urgent', label: '긴급' },
  { value: 'important', label: '중요' },
  { value: 'normal', label: '일반' }
];

const statusOptions = [
  { value: '1', label: '활성' },
  { value: '0', label: '비활성' }
];

/**
 * 공지사항 관리 페이지 (API 연동)
 */
const NoticesPageAPI = () => {
  // 공지사항 데이터 상태
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  // 다이얼로그 상태
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create or edit
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_type: 'all',
    priority: 'normal',
    pinned: false,
    start_time: null,
    end_time: null
  });

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 알림 표시 함수
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // 알림 닫기 함수
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // 공지사항 데이터 가져오기
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.notices.getAll({ include_expired: true });
      console.log('Notices API Response:', response); // 디버깅용
      if (response.data.success) {
        console.log('Notices Data:', response.data.data); // 데이터 구조 확인
        console.log('First Notice:', response.data.data[0]); // 첫 번째 항목 확인
        
        // 작성자 정보 포맷팅 및 필드명 매핑
        const noticesWithAuthorInfo = response.data.data.map((notice, index) => {
          // API에서 이미 created_by_username과 created_by_nickname을 반환
          const writer = notice.created_by_username && notice.created_by_nickname
            ? `${notice.created_by_username}\n${notice.created_by_nickname}`
            : notice.created_by_username || notice.created_by || 'admin\n관리자';
          
          return {
            ...notice,
            no: index + 1,
            writer: writer,
            // snake_case를 camelCase로 변환
            viewCount: notice.view_count,
            createdAt: notice.created_at,
            updatedAt: notice.updated_at
          };
        });
        
        setNotices(noticesWithAuthorInfo);
      }
    } catch (error) {
      console.error('공지사항 조회 오류:', error);
      
      // API 실패 시 빈 데이터로 처리
      showNotification('공지사항을 불러오는데 실패했습니다.', 'error');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

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
  const handleRowClick = useCallback(async (row) => {
    try {
      const response = await apiService.notices.getById(row.id);
      if (response.data.success) {
        setSelectedNotice(response.data.data);
        setIsDetailDialogOpen(true);
        // 조회수 증가
        await apiService.notices.incrementView(row.id);
      }
    } catch (error) {
      console.error('공지사항 상세 조회 오류:', error);
      showNotification('공지사항을 불러오는데 실패했습니다.', 'error');
    }
  }, [showNotification]);

  // 액션 핸들러
  const handleEdit = useCallback((notice) => {
    setSelectedNotice(notice);
    setFormMode('edit');
    setFormData({
      title: notice.title,
      content: notice.content,
      target_type: notice.target_type,
      priority: notice.priority,
      pinned: notice.pinned === 1,
      start_time: notice.start_time ? parseISO(notice.start_time) : null,
      end_time: notice.end_time ? parseISO(notice.end_time) : null
    });
    setIsFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (notice) => {
    if (window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) {
      try {
        const response = await apiService.notices.delete(notice.id);
        if (response.data.success) {
          showNotification('공지사항이 삭제되었습니다.', 'success');
          // fetchNotices를 직접 호출하는 대신 상태 업데이트로 처리
          setNotices(prev => prev.filter(item => item.id !== notice.id));
        }
      } catch (error) {
        console.error('공지사항 삭제 오류:', error);
        showNotification('공지사항 삭제에 실패했습니다.', 'error');
      }
    }
  }, [showNotification]);

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    const result = noticesColumns.map(column => {
      if (column.id === 'title') {
        return {
          ...column,
          clickable: true,  // type이 아닌 clickable 속성 사용
          onClick: (row) => {
            console.log('Title clicked:', row);
            handleRowClick(row);
          }
        };
      }
      
      if (column.id === 'is_pinned') {
        return {
          ...column,
          type: 'chip',
          render: (row) => {
            if (row.is_pinned) {
              return {
                label: '고정',
                color: 'warning',
                variant: 'outlined'
              };
            }
            return {
              label: '일반',
              color: 'primary',
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
            const statusMap = {
              'active': { label: '게시중', color: 'success' },
              'inactive': { label: '미게시', color: 'secondary' },
              'scheduled': { label: '예약', color: 'info' }
            };
            const statusInfo = statusMap[row.status];
            if (!statusInfo) return { label: row.status || '미정', color: 'primary', variant: 'outlined' };
            return {
              label: statusInfo.label,
              color: statusInfo.color,
              variant: 'outlined'
            };
          }
        };
      }
      
      if (column.id === 'importance') {
        return {
          ...column,
          type: 'chip',
          render: (row) => {
            const importanceMap = {
              'high': { label: '중요', color: 'error' },
              'medium': { label: '보통', color: 'warning' },
              'low': { label: '일반', color: 'success' }
            };
            const importanceInfo = importanceMap[row.importance];
            if (!importanceInfo) return { label: row.importance || '미정', color: 'primary', variant: 'outlined' };
            return {
              label: importanceInfo.label,
              color: importanceInfo.color,
              variant: 'outlined'
            };
          }
        };
      }
      
      if (column.id === 'actions') {
        return {
          ...column,
          type: 'button',  // button 타입으로 변경
          width: 250,      // 텍스트 버튼을 위한 너비 증가
          buttons: [
            {
              label: '상세보기',
              variant: 'outlined',
              color: 'primary',
              size: 'small',
              onClick: (row) => {
                handleRowClick(row);
              }
            },
            {
              label: '수정',
              variant: 'outlined',
              color: 'primary',
              size: 'small',
              onClick: (row) => {
                handleEdit(row);
              }
            },
            {
              label: '삭제',
              variant: 'outlined',
              color: 'error',
              size: 'small',
              onClick: (row) => {
                handleDelete(row);
              }
            }
          ]
        };
      }
      return column;
    });
    return result;
  }, [handleEdit, handleDelete, handleRowClick]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return [
      {
        id: 'target_type',
        label: '대상',
        items: [
          { value: '', label: '전체' },
          ...targetOptions
        ]
      },
      {
        id: 'priority',
        label: '우선순위',
        items: [
          { value: '', label: '전체' },
          ...priorityOptions
        ]
      },
      {
        id: 'active',
        label: '상태',
        items: [
          { value: '', label: '전체' },
          ...statusOptions
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
    data: notices,
    defaultRowsPerPage: 10,
    hierarchical: false,
    filterOptions: {
      initialFilters: { target_type: '', priority: '', active: '' }
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
    tableId: `notices_table_v${NOTICES_API_COLUMNS_VERSION}`,
    initialPinnedColumns: ['id', 'title'],
    onColumnOrderChange: (newColumns) => {
      console.log('공지사항 테이블 컬럼 순서 변경:', newColumns);
    }
  });

  // 드래그 앤 드롭 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

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
    alwaysVisibleColumns: ['id', 'title'],
    tableId: `notices_table_v${NOTICES_API_COLUMNS_VERSION}`
  });

  // visibleColumns에 액션 핸들러와 columnsWithActions의 변경사항을 적용
  const finalColumns = useMemo(() => {
    // columnsWithActions를 ID로 매핑하여 빠른 검색을 위한 Map 생성
    const columnsWithActionsMap = new Map(columnsWithActions.map(col => [col.id, col]));
    
    return visibleColumns.map(column => {
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
  }, [visibleColumns, columnsWithActions]);

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
      case 'target_type':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.target_type === filterValue);
        
      case 'priority':
        if (filterValue === '' || filterValue === 'all') return result;
        return result.filter(item => item.priority === filterValue);
        
      case 'active':
        if (filterValue === '') return result;
        return result.filter(item => item.active === parseInt(filterValue));
        
      default:
        return result;
    }
  }, []);

  // useTableData 훅을 사용하여 필터링된 데이터 계산
  const computedFilteredData = useTableData({
    data: notices,
    activeFilters: activeFilters,
    searchText,
    isDateFilterActive,
    dateRange,
    filterCallback
  });

  // 필터링된 데이터의 ID 목록 생성
  const filteredIds = useMemo(() => {
    return computedFilteredData ? computedFilteredData.map(item => item.id) : [];
  }, [computedFilteredData]);

  // 필터링된 데이터 처리
  const filteredFlatData = useMemo(() => {
    const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    if (!hasActiveFilters && !hasSearchText) {
      return notices;
    }
    
    if (!notices || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    return notices.filter(item => filteredIds.includes(item.id));
  }, [notices, filteredIds, activeFilters, searchText]);

  // 안전한 필터링된 데이터
  const safeFilteredData = filteredFlatData || [];
  const totalFlattenedItems = safeFilteredData.length;

  // 등록 버튼 클릭 핸들러
  const handleAddClick = () => {
    setFormMode('create');
    setFormData({
      title: '',
      content: '',
      target_type: 'all',
      priority: 'normal',
      pinned: false,
      start_time: null,
      end_time: null
    });
    setIsFormDialogOpen(true);
  };

  // 새로고침 버튼 클릭 핸들러
  const handleRefreshClick = () => {
    fetchNotices();
    showNotification('데이터를 새로고침했습니다.', 'success');
  };

  // 폼 제출 핸들러
  const handleFormSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        pinned: formData.pinned ? 1 : 0,
        start_time: formData.start_time ? format(formData.start_time, 'yyyy-MM-dd HH:mm:ss') : null,
        end_time: formData.end_time ? format(formData.end_time, 'yyyy-MM-dd HH:mm:ss') : null
      };

      if (formMode === 'create') {
        const response = await apiService.notices.create(submitData);
        if (response.data.success) {
          showNotification('새 공지사항이 등록되었습니다.', 'success');
          fetchNotices();
        }
      } else {
        const response = await apiService.notices.update(selectedNotice.id, submitData);
        if (response.data.success) {
          showNotification('공지사항이 수정되었습니다.', 'success');
          fetchNotices();
        }
      }
      
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error('공지사항 저장 오류:', error);
      showNotification('공지사항 저장에 실패했습니다.', 'error');
    }
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
              activeFilters: activeFilters || {},
              filterOptions: dynamicFilterOptions,
              handleFilterChange: handleFilterChange,
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
              onPageChange: (event, newPage) => {
                setCurrentPage(newPage);
                handlePageChange(newPage);
              },
              onRowsPerPageChange: (event) => {
                const newRowsPerPage = parseInt(event.target.value, 10);
                setCurrentRowsPerPage(newRowsPerPage);
                setCurrentPage(0);
                handleRowsPerPageChange(event);
              },
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
          <BaseTable
            key={`notices-table-${currentPage}-${currentRowsPerPage}`}
            columns={finalColumns}  // 액션 핸들러가 포함된 finalColumns 사용
            data={safeFilteredData}
            loading={loading}
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
                {selectedNotice.pinned === 1 && (
                  <Box component="span" sx={{ ml: 1, color: 'error.main' }}>
                    [상단고정]
                  </Box>
                )}
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                <Typography variant="body2">
                  작성일: {format(parseISO(selectedNotice.created_at), 'yyyy-MM-dd HH:mm')} | 
                  조회수: {selectedNotice.view_count}
                </Typography>
                <Typography variant="body2">
                  우선순위: {
                    priorityOptions.find(opt => opt.value === selectedNotice.priority)?.label
                  } | 
                  대상: {
                    targetOptions.find(opt => opt.value === selectedNotice.target_type)?.label
                  }
                </Typography>
              </Box>
              
              {(selectedNotice.start_time || selectedNotice.end_time) && (
                <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">
                    표시 기간: {
                      selectedNotice.start_time 
                        ? format(parseISO(selectedNotice.start_time), 'yyyy-MM-dd HH:mm')
                        : '시작일 없음'
                    } ~ {
                      selectedNotice.end_time
                        ? format(parseISO(selectedNotice.end_time), 'yyyy-MM-dd HH:mm')
                        : '종료일 없음'
                    }
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
              />
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
                <InputLabel>대상</InputLabel>
                <Select
                  name="target_type"
                  value={formData.target_type}
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
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>우선순위</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  label="우선순위"
                >
                  {priorityOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="pinned"
                    checked={formData.pinned}
                    onChange={handleFormChange}
                  />
                }
                label="상단 고정"
                sx={{ mt: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                  label="표시 시작일시"
                  value={formData.start_time}
                  onChange={(newValue) => {
                    setFormData(prev => ({ ...prev, start_time: newValue }));
                  }}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                  label="표시 종료일시"
                  value={formData.end_time}
                  onChange={(newValue) => {
                    setFormData(prev => ({ ...prev, end_time: newValue }));
                  }}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                내용
              </Typography>
              <SimpleRichTextEditor
                value={formData.content}
                onChange={(value) => handleFormChange({ target: { name: 'content', value } })}
                fullWidth
                minHeight={200}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormDialogOpen(false)}>취소</Button>
          <Button 
            variant="contained" 
            onClick={handleFormSubmit}
            disabled={!formData.title || !formData.content}
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

export default NoticesPageAPI;