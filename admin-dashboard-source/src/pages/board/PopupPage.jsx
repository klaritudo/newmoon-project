import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, FormControlLabel, Switch, Snackbar, Alert, Divider, LinearProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
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
  popupColumns, 
  popupTypeOptions, 
  popupPositionOptions, 
  popupStatusOptions, 
  popupTargetOptions, 
  generatePopupData 
} from './data/popupData';
import SimpleRichTextEditor from '../../components/common/SimpleRichTextEditor';
import { usePopups } from '../../hooks/usePopups';
import apiService from '../../services/api';
import { format, parseISO } from 'date-fns';

/**
 * 팝업 설정 페이지 (API 연동)
 */
const PopupPage = () => {
  // 팝업 데이터 상태
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState(null);
  
  // 다이얼로그 상태
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create or edit
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    popupType: 'modal',
    status: 'active',
    position: 'custom',
    target: 'all',
    width: 400,
    height: 300,
    heightType: 'fixed',  // 'fixed' or 'auto'
    topPosition: 0,
    leftPosition: 0,
    startDate: new Date(),
    endDate: new Date(),
    closeOnClick: false,
    showOnce: false,
    imageUrl: '',
    linkUrl: '',
    writer: '관리자',
    closeAfterHours: 12  // 기본값 12시간
  });

  // 파일 업로드 상태
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // 숨김 팝업 관리 상태
  const [showHiddenDialog, setShowHiddenDialog] = useState(false);

  // usePopups hook에서 uploadImage 함수 가져오기
  const { uploadImage } = usePopups();

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

  // 팝업 데이터 가져오기
  const fetchPopups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.popups.getAll();
      console.log('Popups API Response:', response);
      
      if (response.data.success) {
        // API 응답 데이터를 테이블 형식에 맞게 변환
        const popupsData = response.data.data.map((popup, index) => ({
          ...popup,
          no: index + 1,
          // snake_case를 camelCase로 변환
          topPosition: popup.top_position || popup.topPosition || 0,
          leftPosition: popup.left_position || popup.leftPosition || 0,
          displayPage: popup.display_page || popup.target || 'all',
          target: popup.display_page || popup.target || 'all',
          startDate: popup.start_date || popup.startDate,
          endDate: popup.end_date || popup.endDate,
          createdAt: popup.created_at || popup.createdAt,
          updatedAt: popup.updated_at || popup.updatedAt,
          writer: popup.created_by_username ? 
            `${popup.created_by_username}${popup.created_by_nickname ? `\n${popup.created_by_nickname}` : ''}` : 
            popup.writer || '관리자'
        }));
        
        setPopups(popupsData);
      }
    } catch (error) {
      console.error('팝업 조회 오류:', error);
      showNotification('팝업 목록을 불러오는데 실패했습니다.', 'error');
      setPopups([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    fetchPopups();
  }, [fetchPopups]);

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
    console.log('팝업 엑셀 다운로드');
    showNotification('팝업을 엑셀로 다운로드합니다.', 'info');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    console.log('팝업 인쇄');
    showNotification('팝업을 인쇄합니다.', 'info');
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
    data: popups,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: false,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 행 클릭 핸들러
  const handleRowClick = useCallback((row) => {
    setSelectedPopup(row);
    setIsDetailDialogOpen(true);
  }, []);

  // 액션 핸들러
  const handleEdit = useCallback((popup) => {
    setSelectedPopup(popup);
    setFormMode('edit');
    setFormData({
      title: popup.title,
      content: popup.content,
      popupType: popup.popupType,
      status: popup.status,
      position: popup.position,
      target: popup.target,
      width: popup.width,
      height: popup.height === 'auto' ? 'auto' : popup.height,
      heightType: popup.height === 'auto' ? 'auto' : 'fixed',
      startDate: new Date(popup.startDate),
      topPosition: popup.top_position || popup.topPosition || 0,
      leftPosition: popup.left_position || popup.leftPosition || 0,
      endDate: new Date(popup.endDate),
      closeOnClick: popup.closeOnClick,
      showOnce: popup.showOnce,
      imageUrl: popup.imageUrl || '',
      linkUrl: popup.linkUrl || '',
      writer: popup.writer,
      closeAfterHours: popup.close_after_hours || 12  // 기본값 12시간
    });
    // 업로드 상태 초기화 (기존 이미지 URL 유지)
    setUploadedImageUrl(popup.imageUrl || '');
    setUploading(false);
    setIsFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (popup) => {
    if (window.confirm(`"${popup.title}" 팝업을 삭제하시겠습니까?`)) {
      try {
        const response = await apiService.popups.delete(popup.id);
        if (response.data.success) {
          await fetchPopups(); // 목록 새로고침
          showNotification('팝업이 삭제되었습니다.', 'success');
        }
      } catch (error) {
        console.error('팝업 삭제 오류:', error);
        showNotification('팝업 삭제에 실패했습니다.', 'error');
      }
    }
  }, [fetchPopups, showNotification]);

  // 버튼 액션이 포함된 컬럼 설정 및 formatter 처리
  const columnsWithActions = useMemo(() => {
    return popupColumns.map(column => {
      // formatter를 사용하는 컬럼의 경우 render 함수로 변환
      if (column.formatter && !column.render) {
        return {
          ...column,
          render: (params) => {
            const value = params.row[column.id];
            return column.formatter(value, params.row);
          }
        };
      }
      
      // actions 컬럼의 경우 onActionClick 핸들러 추가
      if (column.id === 'actions' && column.type === 'button') {
        return {
          ...column,
          onActionClick: (buttonType, row) => {
            console.log('onActionClick called:', buttonType, row);
            if (buttonType === 'edit') {
              handleEdit(row);
            } else if (buttonType === 'delete') {
              handleDelete(row);
            }
          }
        };
      }
      
      return column;
    });
  }, [handleEdit, handleDelete]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    return [
      {
        id: 'status',
        label: '상태',
        items: [
          { value: '', label: '전체' },
          ...popupStatusOptions
        ]
      },
      {
        id: 'target',
        label: '대상',
        items: [
          { value: '', label: '전체' },
          ...popupTargetOptions
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
    data: popups,
    defaultRowsPerPage: 10,
    hierarchical: false,
    filterOptions: {
      initialFilters: { status: '', target: '' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 10,
      totalItems: popups.length,
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
    initialTotalItems: popups.length,
    initialSequentialPageNumbers: true,
    onSearch: (value) => {
      console.log(`팝업 검색: ${value}`);
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
    columns: dragColumns,
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
    tableId: 'popup_table',
    initialPinnedColumns: ['no', 'title', 'actions'],
    onColumnOrderChange: (newColumns) => {
      console.log('팝업 테이블 컬럼 순서 변경:', newColumns);
    }
  });

  // dragColumns에 onActionClick 핸들러 다시 적용 (버튼 type 속성 유지)
  const finalColumns = useMemo(() => {
    return dragColumns.map(column => {
      if (column.id === 'actions' && column.type === 'button') {
        // columnsWithActions에서 원본 컬럼 찾기
        const originalColumn = columnsWithActions.find(col => col.id === 'actions');
        return {
          ...column,
          buttons: originalColumn ? originalColumn.buttons : column.buttons,
          onActionClick: (buttonType, row) => {
            if (buttonType === 'edit') {
              handleEdit(row);
            } else if (buttonType === 'delete') {
              handleDelete(row);
            }
          }
        };
      }
      return column;
    });
  }, [dragColumns, columnsWithActions, handleEdit, handleDelete]);

  // 컬럼 표시옵션 관련 훅 사용
  const {
    columnVisibility,
    visibleColumns,
    hiddenColumnsCount,
    toggleableColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(finalColumns, {
    defaultHiddenColumns: [],
    alwaysVisibleColumns: ['no', 'title', 'actions'], // actions 컬럼도 항상 표시
    tableId: 'popup_table'
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
    console.log(`팝업 필터 변경: ${filterId} = ${value}`);
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
    data: popups,
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
      return popups;
    }
    
    // 필터가 있는 경우에만 filteredIds로 필터링
    if (!popups || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    return popups.filter(item => filteredIds.includes(item.id));
  }, [popups, filteredIds, safeActiveFilters, searchText]);

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
    
    console.log(`팝업 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    console.log(`팝업 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('팝업 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`팝업 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    console.log(`팝업 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    console.log(`팝업 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
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

  // 숨김 팝업 카운트 함수 (DB 기반으로 변경되어 제거)
  // 실제 개수는 API 응답의 affectedRows로 확인

  // 숨김 팝업 보기 버튼 클릭 핸들러
  const handleShowHiddenPopups = useCallback(() => {
    // DB 기반이므로 다이얼로그 바로 표시
    // 실제 개수는 API 호출 후 확인
    setShowHiddenDialog(true);
  }, []);

  // 숨김 팝업 복원 확인 핸들러
  const handleConfirmRestore = useCallback(async () => {
    try {
      // 데이터베이스의 dismiss 기록 삭제 (개발환경 전용)
      try {
        const response = await apiService.popups.clearAllDismissals();
        if (response.success) {
          console.log(`Database dismissals cleared: ${response.affectedRows} records`);
          showNotification(`${response.affectedRows}개의 숨김 기록이 삭제되었습니다.`, 'success');
        }
      } catch (apiError) {
        console.error('API call error:', apiError);
        showNotification('팝업 복원 중 오류가 발생했습니다.', 'error');
        return;
      }
      
      // 다이얼로그 닫기
      setShowHiddenDialog(false);
      
      // 팝업 데이터 새로고침
      fetchPopups();
    } catch (error) {
      console.error('팝업 복원 오류:', error);
      showNotification('팝업 복원 중 오류가 발생했습니다.', 'error');
    }
  }, [showNotification, fetchPopups]);

  // 등록 버튼 클릭 핸들러
  const handleAddClick = () => {
    setFormMode('create');
    setFormData({
      title: '',
      content: '',
      popupType: 'modal',
      status: 'active',
      position: 'custom',
      target: 'all',
      width: 400,
      height: 300,
      heightType: 'fixed',
      topPosition: 0,
      leftPosition: 0,
      startDate: new Date(),
      endDate: new Date(),
      closeOnClick: false,
      showOnce: false,
      imageUrl: '',
      linkUrl: '',
      writer: '관리자',
      closeAfterHours: 12  // 기본값 12시간 추가
    });
    // 업로드 상태 초기화
    setUploadedImageUrl('');
    setUploading(false);
    setIsFormDialogOpen(true);
  };

  // 새로고침 버튼 클릭 핸들러
  const handleRefreshClick = () => {
    fetchPopups();
    showNotification('데이터를 새로고침했습니다.', 'success');
  };

  // 폼 제출 핸들러
  const handleFormSubmit = async () => {
    try {
      const popupData = {
        title: formData.title,
        content: formData.content,
        type: formData.popupType,
        status: formData.status,
        position: formData.position,
        display_page: formData.target,
        width: parseInt(formData.width),
        height: formData.heightType === 'auto' ? 'auto' : parseInt(formData.height),
        top_position: formData.position === 'custom' ? parseInt(formData.topPosition || 0) : 0,
        left_position: formData.position === 'custom' ? parseInt(formData.leftPosition || 0) : 0,
        start_date: formData.startDate ? formData.startDate.toISOString().split('T')[0] : null,
        end_date: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
        close_on_click: formData.closeOnClick,
        show_once: formData.showOnce,
        image_url: formData.imageUrl,
        link_url: formData.linkUrl,
        link_target: formData.linkUrl ? '_blank' : null,
        click_action: formData.linkUrl ? 'url' : 'none',
        close_after_hours: formData.closeAfterHours ? parseInt(formData.closeAfterHours) : null
      };

      if (formMode === 'create') {
        const response = await apiService.popups.create(popupData);
        if (response.data.success) {
          await fetchPopups();
          showNotification('새 팝업이 등록되었습니다.', 'success');
        }
      } else {
        const response = await apiService.popups.update(selectedPopup.id, popupData);
        if (response.data.success) {
          await fetchPopups();
          showNotification('팝업이 수정되었습니다.', 'success');
        }
      }
      
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error('팝업 저장 오류:', error);
      showNotification(
        formMode === 'create' ? '팝업 등록에 실패했습니다.' : '팝업 수정에 실패했습니다.',
        'error'
      );
    }
  };

  // 폼 필드 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'closeOnClick' || name === 'showOnce' ? checked : value
    }));
  };

  // 날짜 변경 핸들러
  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      showNotification('이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('파일 크기는 5MB를 초과할 수 없습니다.', 'error');
      return;
    }

    try {
      setUploading(true);
      
      // uploadImage 함수 호출
      const imageUrl = await uploadImage(file);
      
      if (imageUrl) {
        // 전체 URL 생성 (실제 서버 IP 사용)
        const fullImageUrl = `http://125.187.89.85:5100${imageUrl}`;
        console.log('Generated image URL:', fullImageUrl);
        
        // 이미지를 팝업 내용에 자동 삽입 (max-width 제거하여 전체 너비 사용)
        const imgTag = `<img src="${fullImageUrl}" alt="팝업 이미지" style="width: 100%; height: auto; display: block; margin: 0;" />`;
        
        setFormData(prev => ({
          ...prev,
          imageUrl: fullImageUrl,
          // 기존 내용에 이미지 추가 (내용이 비어있으면 이미지만, 있으면 이미지 + 기존 내용)
          content: prev.content ? `${imgTag}<br/>${prev.content}` : imgTag
        }));
        
        showNotification('이미지가 업로드되어 팝업 내용에 추가되었습니다.', 'success');
      } else {
        throw new Error('업로드 응답이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      showNotification('이미지 업로드에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setUploading(false);
      // 파일 입력 필드 초기화
      event.target.value = '';
    }
  };

  // 개발 환경에서만 표시할 커스텀 액션 버튼
  const customActions = import.meta.env.DEV && (
    <Button
      variant="outlined"
      color="warning"
      startIcon={<VisibilityIcon />}
      onClick={handleShowHiddenPopups}
      size="small"
      sx={{
        borderColor: '#ff9800',
        color: '#ff9800',
        '&:hover': {
          borderColor: '#f57c00',
          backgroundColor: 'rgba(255, 152, 0, 0.04)'
        }
      }}
    >
      숨김팝업보기
    </Button>
  );

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="팝업 설정"
        onAddClick={handleAddClick}
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={true}
        showRefreshButton={true}
        onRefreshClick={handleRefreshClick}
        addButtonText="팝업 등록"
        customActions={customActions}
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
          title="팝업 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##개의 팝업"
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
          searchPlaceholder="팝업 검색..."
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
              columns: finalColumns,
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
            key={`popup-table-${tableKey}`}
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

      {/* 팝업 상세 다이얼로그 */}
      <Dialog
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPopup && (
          <>
            <DialogTitle>
              팝업 상세 정보
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {selectedPopup.title}
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                <Typography variant="body2">
                  작성자: {selectedPopup.writer} | 
                  등록일: {selectedPopup.createdAt} | 
                  수정일: {selectedPopup.updatedAt}
                </Typography>
                <Typography variant="body2">
                  상태: {
                    popupStatusOptions.find(opt => opt.value === selectedPopup.status)?.label
                  }
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                <Typography variant="body2">
                  위치: {
                    popupPositionOptions.find(opt => opt.value === selectedPopup.position)?.label
                  } | 
                  대상: {
                    popupTargetOptions.find(opt => opt.value === selectedPopup.target)?.label
                  }
                </Typography>
                <Typography variant="body2">
                  크기: {selectedPopup.width}x{selectedPopup.height}px | 
                  시작일: {selectedPopup.startDate} | 
                  종료일: {selectedPopup.endDate}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                <Typography variant="body2">
                  노출수: {selectedPopup.viewCount?.toLocaleString() || 0}회 | 
                  클릭수: {selectedPopup.clickCount?.toLocaleString() || 0}회
                </Typography>
                <Typography variant="body2">
                  클릭시 닫기: {selectedPopup.closeOnClick ? '예' : '아니오'} | 
                  한번만 표시: {selectedPopup.showOnce ? '예' : '아니오'}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedPopup.content}
              </Typography>
              
              {selectedPopup.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    이미지 URL: {selectedPopup.imageUrl}
                  </Typography>
                </Box>
              )}
              
              {selectedPopup.linkUrl && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    링크 URL: {selectedPopup.linkUrl}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDetailDialogOpen(false)}>닫기</Button>
              <Button onClick={() => {
                setIsDetailDialogOpen(false);
                handleEdit(selectedPopup);
              }}>수정</Button>
              <Button color="error" onClick={() => {
                setIsDetailDialogOpen(false);
                handleDelete(selectedPopup);
              }}>삭제</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 팝업 등록/수정 다이얼로그 */}
      <Dialog
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formMode === 'create' ? '팝업 등록' : '팝업 수정'}
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="팝업명"
                  value={formData.title}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              
              {/* 팝업 타입은 모달로 고정 */}
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>상태</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="상태"
                  >
                    {popupStatusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>위치</InputLabel>
                  <Select
                    name="position"
                    value={formData.position}
                    onChange={handleFormChange}
                    label="위치"
                  >
                    {popupPositionOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>대상</InputLabel>
                  <Select
                    name="target"
                    value={formData.target}
                    onChange={handleFormChange}
                    label="대상"
                  >
                    {popupTargetOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* 커스텀 위치 입력 필드 */}
              {formData.position === 'custom' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="topPosition"
                      label="상단 위치"
                      type="number"
                      value={formData.topPosition}
                      onChange={handleFormChange}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: 'px'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="leftPosition"
                      label="좌측 위치"
                      type="number"
                      value={formData.leftPosition}
                      onChange={handleFormChange}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: 'px'
                      }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="width"
                  label="가로 크기"
                  type="number"
                  value={formData.width}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: 'px'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>세로 크기</InputLabel>
                  <Select
                    name="heightType"
                    value={formData.heightType}
                    onChange={handleFormChange}
                    label="세로 크기"
                  >
                    <MenuItem value="fixed">고정 크기</MenuItem>
                    <MenuItem value="auto">자동 크기</MenuItem>
                  </Select>
                </FormControl>
                {formData.heightType === 'fixed' && (
                  <TextField
                    name="height"
                    label="높이 (px)"
                    type="number"
                    value={formData.height}
                    onChange={handleFormChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      endAdornment: 'px'
                    }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="시작일"
                  value={formData.startDate}
                  onChange={(value) => handleDateChange('startDate', value)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="종료일"
                  value={formData.endDate}
                  onChange={(value) => handleDateChange('endDate', value)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="closeOnClick"
                      checked={formData.closeOnClick}
                      onChange={handleFormChange}
                    />
                  }
                  label="클릭시 닫기"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="showOnce"
                      checked={formData.showOnce}
                      onChange={handleFormChange}
                    />
                  }
                  label="한번만 표시"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  이미지 업로드 (선택사항)
                </Typography>
                
                {/* 파일 업로드 버튼 */}
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploading}
                  sx={{ mb: 2 }}
                >
                  {uploading ? '업로드 중...' : '이미지 파일 선택'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {/* 업로드 진행 상태 */}
                {uploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      이미지를 업로드 중입니다...
                    </Typography>
                  </Box>
                )}
                
                {/* 이미지 URL 입력 필드 (수동 입력용) */}
                <TextField
                  name="imageUrl"
                  label="이미지 URL (직접 입력 또는 업로드)"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  helperText="이미지 파일을 업로드하거나 직접 URL을 입력하세요"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="linkUrl"
                  label="링크 URL (선택사항)"
                  value={formData.linkUrl}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <SimpleRichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  label="팝업 내용"
                  height={300}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="closeAfterHours"
                  label="시간 동안 보지 않기 (시간)"
                  type="number"
                  value={formData.closeAfterHours}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    inputProps: { 
                      min: 0,
                      max: 168  // 최대 7일(168시간)
                    }
                  }}
                  helperText="0 입력 시 '보지 않기' 버튼이 표시되지 않습니다. (기본값: 12시간)"
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
          </LocalizationProvider>
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

      {/* 숨김 팝업 복원 확인 다이얼로그 */}
      <Dialog
        open={showHiddenDialog}
        onClose={() => setShowHiddenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            숨김팝업 일괄 복원
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            현재 사용자에게 숨겨진 팝업이 있을 수 있습니다.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            이 작업을 수행하면:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              모든 숨겨진 팝업이 다시 표시됩니다
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              사용자가 설정한 "시간 동안 보지 않기" 설정이 초기화됩니다
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              사용자 페이지 새로고침 시 팝업이 즉시 노출됩니다
            </Typography>
          </Box>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>주의:</strong> 이는 개발환경 전용 기능입니다. 
              복원 후 사용자는 다시 "시간 동안 보지 않기"를 설정할 수 있습니다.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowHiddenDialog(false)}>
            취소
          </Button>
          <Button 
            variant="contained"
            color="warning"
            onClick={handleConfirmRestore}
          >
            복원하기
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PopupPage;
