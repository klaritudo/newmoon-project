import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Paper, Typography, Button, Tabs, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import usePermission from '../../hooks/usePermission';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  PageHeader, 
  PageContainer,
  ColumnVisibilityDialog
} from '../../components/baseTemplate/components';
import { 
  useTableFilterAndPagination, 
  useTableHeader, 
  useTableColumnDrag,
  useTableIndent,
  useTableHeaderFixed,
  useTableAutoHeight,
  useTableResize,
  useColumnVisibility,
  useTable
} from '../../components/baseTemplate/hooks';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useSocket } from '../../context/SocketContext';
import { 
  registrationRequestsColumns,
  apiOptions,
  statusOptions,
  REGISTRATION_REQUESTS_COLUMNS_VERSION
} from './data/registrationRequestsData.jsx';
import apiService from '../../services/api';
import dayjs from 'dayjs';

/**
 * 회원가입요청 페이지
 * 회원가입 요청 목록 조회, 승인/대기/비승인 처리 기능을 제공합니다.
 */
const RegistrationRequestsPage = () => {
  const currentUser = useSelector(state => state.auth.user);
  const { hasPermission } = usePermission();
  const { handleRefresh, showNotification } = useNotification();
  const { socketService } = useSocket();
  
  // 상태별 탭
  const [activeTab, setActiveTab] = useState('all');
  
  // 데이터 관리
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    waiting: 0,
    rejected: 0
  });
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);

  // 테이블 hooks
  const tableFilterAndPagination = useTableFilterAndPagination({
    pageSize: apiOptions.pageSize,
    filterableFields: apiOptions.filterableFields,
    searchableFields: apiOptions.searchableFields,
    sortableFields: apiOptions.sortableFields
  });
  
  // useTable 훅 사용
  const {
    checkedItems: tableCheckedItems,
    allChecked: tableAllChecked,
    handleCheck: tableHandleCheck,
    handleToggleAll: tableHandleToggleAll,
    sortConfig: tableSortConfig,
    handleSort: tableHandleSort,
  } = useTable({
    data: data,
    page: tableFilterAndPagination.currentPage,
    rowsPerPage: tableFilterAndPagination.pageSize
  });
  
  const tableHeader = useTableHeader({
    searchPlaceholder: '아이디, 닉네임, 이름, 전화번호 검색',
    onRefresh: handleRefresh
  });

  // 컬럼 드래그 앤 드롭 관련 훅
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
    initialColumns: registrationRequestsColumns,
    tableId: 'registration_requests_table',
    version: REGISTRATION_REQUESTS_COLUMNS_VERSION
  });

  // 컬럼 표시옵션 관련 훅
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
    alwaysVisibleColumns: ['checkbox'],
    tableId: 'registration_requests_table'
  });

  const tableResize = useTableResize({
    columns: visibleColumns,
    storageKey: 'registrationRequestsColumnWidths',
    onColumnResize: (columnId, newWidth) => {
      updateColumns(prevColumns => prevColumns.map(col =>
        col.id === columnId ? { ...col, width: newWidth } : col
      ));
    }
  });

  const tableAutoHeight = useTableAutoHeight({
    minHeight: 300,
    offset: 420 // 헤더와 필터 영역 높이
  });

  const tableIndent = useTableIndent({
    enabled: false // 회원가입요청은 계층구조 없음
  });

  const tableHeaderFixed = useTableHeaderFixed({
    enabled: true
  });

  // fetchData를 위한 임시 참조 생성
  const fetchDataRef = useRef(null);

  // 액션 처리 함수를 먼저 정의
  const handleActionClick = useCallback(async (actionType, row) => {
    try {
      if (actionType === 'approve') {
        const confirmMessage = `${row.username}(${row.nickname}) 회원가입을 승인하시겠습니까?`;
        if (!window.confirm(confirmMessage)) return;
        
        const response = await apiService.post(`/registration-requests/${row.id}/approve`);
        if (response.data.success) {
          showNotification('회원가입이 승인되었습니다.', 'success');
          if (fetchDataRef.current) {
            await fetchDataRef.current();
          }
        }
      } else if (actionType === 'wait') {
        const response = await apiService.put(`/registration-requests/${row.id}/status`, {
          status: 'waiting'
        });
        if (response.data.success) {
          showNotification('대기 상태로 변경되었습니다.', 'success');
          if (fetchDataRef.current) {
            await fetchDataRef.current();
          }
        }
      } else if (actionType === 'reject') {
        const reason = window.prompt('비승인 사유를 입력하세요:');
        if (!reason) return;
        
        const response = await apiService.put(`/registration-requests/${row.id}/status`, {
          status: 'rejected',
          rejectionReason: reason
        });
        if (response.data.success) {
          showNotification('비승인 처리되었습니다.', 'success');
          if (fetchDataRef.current) {
            await fetchDataRef.current();
          }
        }
      }
    } catch (error) {
      console.error('액션 처리 실패:', error);
      showNotification(error.response?.data?.error || '처리 중 오류가 발생했습니다.', 'error');
    }
  }, [showNotification]);

  // 최종 표시할 컬럼 (표시 설정이 적용된 컬럼)
  const finalColumns = useMemo(() => {
    return visibleColumns.map(column => {
      if (column.id === 'actions') {
        // 원본 컬럼에서 buttons 정보 가져오기
        const originalColumn = registrationRequestsColumns.find(col => col.id === 'actions');
        return {
          ...column,
          buttons: originalColumn?.buttons || column.buttons,
          onActionClick: handleActionClick
        };
      }
      return column;
    });
  }, [visibleColumns, handleActionClick]);

  // 데이터 조회
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: tableFilterAndPagination.currentPage + 1, // 백엔드는 1부터 시작
        limit: tableFilterAndPagination.pageSize,
        search: tableFilterAndPagination.searchTerm,
        status: activeTab === 'all' ? undefined : activeTab
      };
      
      // 정렬 파라미터 추가
      if (tableFilterAndPagination.sortBy) {
        params.sortBy = tableFilterAndPagination.sortBy;
        params.sortDirection = tableFilterAndPagination.sortDirection || 'desc';
      }
      
      // 필터 파라미터 추가
      if (tableFilterAndPagination.activeFilters) {
        Object.entries(tableFilterAndPagination.activeFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value;
          }
        });
      }

      const response = await apiService.get(apiOptions.url, { params });
      
      if (response.data.success) {
        console.log('[RegistrationRequestsPage] API Response:', response.data);
        console.log('[RegistrationRequestsPage] Setting data:', response.data.data);
        console.log('[RegistrationRequestsPage] Setting total items:', response.data.pagination.total);
        
        setData(response.data.data);
        tableFilterAndPagination.setTotalItems(response.data.pagination.total);
        
        // Calculate counts properly
        const responseCounts = response.data.counts || {};
        const newCounts = {
          all: responseCounts.all || response.data.pagination.total || 0,
          pending: responseCounts.pending || 0,
          waiting: responseCounts.waiting || 0,
          rejected: responseCounts.rejected || 0
        };
        setCounts(newCounts);
        
        console.log('[RegistrationRequestsPage] Data state after set:', data);
        console.log('[RegistrationRequestsPage] Counts after set:', newCounts);
        console.log('[RegistrationRequestsPage] TableFilterAndPagination totalCount:', tableFilterAndPagination.totalCount);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      setError(error.message);
      showNotification('데이터 조회에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    tableFilterAndPagination.currentPage,
    tableFilterAndPagination.pageSize,
    tableFilterAndPagination.searchTerm,
    tableFilterAndPagination.sortBy,
    tableFilterAndPagination.sortOrder,
    tableFilterAndPagination.filters,
    activeTab
  ]);

  // fetchDataRef를 실제 fetchData 함수와 연결
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // WebSocket 이벤트 리스너
  useEffect(() => {
    if (!socketService) return;

    const handleNewRegistration = (data) => {
      console.log('새 회원가입 요청:', data);
      fetchData();
      showNotification(`새로운 회원가입 요청: ${data.username}`, 'info');
    };

    const handleStatusChanged = (data) => {
      console.log('회원가입 상태 변경:', data);
      fetchData();
    };

    socketService.on('registration:new', handleNewRegistration);
    socketService.on('registration:status:changed', handleStatusChanged);

    return () => {
      socketService.off('registration:new', handleNewRegistration);
      socketService.off('registration:status:changed', handleStatusChanged);
    };
  }, [socketService, fetchData]);

  // 데이터 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 탭 변경
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    tableFilterAndPagination.setPage(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title="회원가입요청"
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={fetchData}
      />

      <Paper elevation={0} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`전체 (${counts.all})`} 
            value="all" 
          />
          <Tab 
            label={`요청 중 (${counts.pending})`} 
            value="pending"
            sx={{ 
              color: counts.pending > 0 ? '#F64E60' : 'inherit',
              '&.Mui-selected': { color: '#F64E60' }
            }}
          />
          <Tab 
            label={`대기 (${counts.waiting})`} 
            value="waiting"
            sx={{ 
              color: counts.waiting > 0 ? '#FFA800' : 'inherit',
              '&.Mui-selected': { color: '#FFA800' }
            }}
          />
          <Tab 
            label={`비승인 (${counts.rejected})`} 
            value="rejected"
          />
        </Tabs>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <TableHeader
            {...tableHeader.headerProps}
            title="회원가입 요청 목록"
            showColumnVisibility={true}
            onColumnVisibilityClick={(event) => setDisplayOptionsAnchor(event.currentTarget)}
          />
          
          <TableFilterAndPagination
            filterProps={{
              activeFilters: tableFilterAndPagination.activeFilters || {},
              handleFilterChange: tableFilterAndPagination.handleFilterChange,
              filterOptions: apiOptions.filterableFields?.map(field => ({
                id: field,
                label: field === 'status' ? '상태' : field === 'created_at' ? '가입신청일' : field,
                items: field === 'status' ? statusOptions : []
              })) || [],
              showDateFilter: true,
              handleOpenDateFilter: tableFilterAndPagination.handleOpenDateFilter,
              isDateFilterActive: tableFilterAndPagination.isDateFilterActive
            }}
            paginationProps={{
              count: tableFilterAndPagination.totalCount || 0,
              page: tableFilterAndPagination.currentPage || 0,
              rowsPerPage: tableFilterAndPagination.pageSize || 25,
              onPageChange: tableFilterAndPagination.handlePageChange,
              onRowsPerPageChange: tableFilterAndPagination.handleRowsPerPageChange,
              rowsPerPageOptions: [10, 25, 50, 100]
            }}
          />
          
          <Box sx={{ mt: 2 }}>
            {console.log('[RegistrationRequestsPage] Passing to BaseTable:', {
              columnsCount: finalColumns.length,
              columns: finalColumns.map(col => ({ id: col.id, type: col.type, label: col.label })),
              dataCount: data.length,
              page: tableFilterAndPagination.currentPage,
              rowsPerPage: tableFilterAndPagination.pageSize,
              sequentialPageNumbers: true
            })}
            <BaseTable
              columns={finalColumns}
              data={data}
              loading={isLoading}
              checkable={true}
              hierarchical={false}
              onActionClick={handleActionClick}
              rowHeight={52}
              showColumnLines={true}
              striped={true}
              dragInfo={dragInfo}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              resizingColumn={tableResize.resizingColumn}
              onColumnResize={tableResize.handleMouseDown}
              onColumnResizeEnd={tableResize.handleMouseUp}
              tableHeight={tableAutoHeight.tableHeight}
              checkedItems={tableCheckedItems}
              allChecked={tableAllChecked}
              onCheck={tableHandleCheck}
              onToggleAll={tableHandleToggleAll}
              onSort={tableHandleSort}
              sortConfig={tableSortConfig}
              page={tableFilterAndPagination.currentPage}
              rowsPerPage={tableFilterAndPagination.pageSize}
              sequentialPageNumbers={true}
            />
          </Box>
        </Box>
      </Paper>

      <ColumnVisibilityDialog
        open={!!displayOptionsAnchor}
        onClose={() => setDisplayOptionsAnchor(null)}
        columns={toggleableColumns}
        columnVisibility={columnVisibility}
        onToggle={toggleColumnVisibility}
        onShowAll={showAllColumns}
        onReset={resetToDefault}
        hiddenCount={hiddenColumnsCount}
        title="회원가입요청 컬럼 설정"
      />
    </PageContainer>
  );
};

export default RegistrationRequestsPage;