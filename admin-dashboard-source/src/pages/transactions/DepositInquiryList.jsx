import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Check as CheckIcon,
  Pause as PauseIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TableResizeHandle, 
  PageContainer
} from '../../components/baseTemplate/components';
import { 
  useTableFilterAndPagination, 
  useTableHeader, 
  useTable,
  useTableAutoHeight,
  useTableResize
} from '../../components/baseTemplate/hooks';
import depositInquiriesService from '../../services/depositInquiriesService';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

/**
 * 입금신청 리스트 컴포넌트
 * 입금 신청 내역을 조회하고 상태를 관리합니다.
 */
const DepositInquiryList = () => {
  // 데이터 상태
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    pending: 0,
    waiting: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  
  // 탭 상태 (0: 전체, 1: 요청중, 2: 대기, 3: 비허용)
  const [currentTab, setCurrentTab] = useState(0);
  const tabStatusMap = ['all', 'pending', 'waiting', 'rejected'];
  
  // 상태 변경 다이얼로그
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    inquiry: null,
    status: '',
    rejectReason: ''
  });
  
  // 일괄 처리
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatusDialog, setBulkStatusDialog] = useState({
    open: false,
    status: '',
    rejectReason: ''
  });
  
  // 웹소켓
  const { socketService } = useSocket();
  
  // 테이블 높이 자동 조정
  const {
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight
  } = useTableAutoHeight({
    defaultHeight: '600px',
    defaultAutoHeight: true,
    minHeight: 300,
    bottomMargin: 100
  });
  
  // 테이블 리사이즈
  const {
    isDragging,
    getResizeHandleProps
  } = useTableResize({
    minHeight: 200,
    onResize: (newHeight) => {
      if (autoHeight) {
        toggleAutoHeight(false);
      }
      setManualHeight(`${newHeight}px`);
    }
  });
  
  // 컬럼 정의
  const columns = useMemo(() => [
    { 
      id: 'checkbox', 
      label: '', 
      width: 50,
      type: 'checkbox'
    },
    { 
      id: 'id', 
      label: '번호', 
      width: 80,
      sortable: true 
    },
    { 
      id: 'username', 
      label: '아이디', 
      width: 120,
      sortable: true 
    },
    { 
      id: 'nickname', 
      label: '닉네임', 
      width: 120 
    },
    { 
      id: 'amount', 
      label: '신청금액', 
      width: 150,
      sortable: true,
      align: 'right',
      type: 'custom',
      render: (row) => {
        const requestedAmount = Math.floor(row.requested_amount || row.amount || 0);
        const bonusAmount = Math.floor(row.bonus_amount || 0);
        
        // 보너스가 있는 경우
        if (bonusAmount > 0) {
          return (
            <span>
              {requestedAmount.toLocaleString()}
              <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                ({bonusAmount.toLocaleString()})
              </span>
              원
            </span>
          );
        }
        
        // 보너스가 없는 경우
        return `${requestedAmount.toLocaleString()}원`;
      }
    },
    { 
      id: 'depositor_name', 
      label: '입금자명', 
      width: 120 
    },
    { 
      id: 'bank_info', 
      label: '입금계좌', 
      width: 200,
      render: (row) => {
        if (!row.deposit_bank_name) return '-';
        return `${row.deposit_bank_name} ${row.deposit_account_number}`;
      }
    },
    { 
      id: 'status', 
      label: '상태', 
      width: 100,
      type: 'chip',
      render: (row) => {
        const statusMap = {
          pending: { label: '요청 중', color: 'error' },
          waiting: { label: '대기', color: 'warning' },
          approved: { label: '승인', color: 'success' },
          rejected: { label: '비승인', color: 'default' }
        };
        const status = statusMap[row.status] || { label: row.status, color: 'default' };
        return { label: status.label, color: status.color };
      }
    },
    { 
      id: 'created_at', 
      label: '신청시간', 
      width: 150,
      sortable: true,
      format: 'datetime'
    },
    { 
      id: 'processed_at', 
      label: '처리시간', 
      width: 150,
      format: 'datetime',
      render: (row) => row.processed_at || '-'
    },
    { 
      id: 'processor_username', 
      label: '처리자', 
      width: 100,
      render: (row) => row.processor_username || '-'
    },
    { 
      id: 'actions', 
      label: '액션', 
      width: 150,
      type: 'actions',
      render: (row) => {
        if (row.status === 'approved' || row.status === 'rejected') {
          return null;
        }
        
        return (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleStatusChange(row, 'approved')}
              title="승인"
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="warning"
              onClick={() => handleStatusChange(row, 'waiting')}
              title="대기"
            >
              <PauseIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleStatusChange(row, 'rejected')}
              title="비승인"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      }
    }
  ], []);
  
  // 데이터 로드
  const loadData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // 탭에 따른 상태 필터 추가
      const statusFilter = tabStatusMap[currentTab];
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // 카운트 조회
      const countsResponse = await depositInquiriesService.getCounts();
      if (countsResponse.success) {
        setCounts(countsResponse.data);
      }
      
      // 데이터 조회
      const response = await depositInquiriesService.getAll(params);
      if (response.success) {
        setInquiries(response.data);
        return {
          data: response.data,
          pagination: response.pagination
        };
      }
    } catch (err) {
      console.error('입금신청 목록 로드 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      toast.error('입금신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentTab, tabStatusMap]);
  
  // 상태 변경 핸들러
  const handleStatusChange = useCallback((inquiry, status) => {
    setStatusDialog({
      open: true,
      inquiry,
      status,
      rejectReason: ''
    });
  }, []);
  
  // 상태 변경 확인
  const handleStatusChangeConfirm = useCallback(async () => {
    const { inquiry, status, rejectReason } = statusDialog;
    
    try {
      const response = await depositInquiriesService.updateStatus(inquiry.id, {
        status,
        rejectReason: status === 'rejected' ? rejectReason : undefined
      });
      
      if (response.success) {
        toast.success('상태가 변경되었습니다.');
        setStatusDialog({ open: false, inquiry: null, status: '', rejectReason: '' });
        loadData();
      }
    } catch (err) {
      console.error('상태 변경 실패:', err);
      toast.error('상태 변경에 실패했습니다.');
    }
  }, [statusDialog, loadData]);
  
  // 일괄 처리 핸들러
  const handleBulkStatusChange = useCallback(async () => {
    const { status, rejectReason } = bulkStatusDialog;
    
    try {
      const response = await depositInquiriesService.bulkUpdate({
        ids: selectedIds,
        status,
        rejectReason: status === 'rejected' ? rejectReason : undefined
      });
      
      if (response.success) {
        toast.success(response.message);
        setBulkStatusDialog({ open: false, status: '', rejectReason: '' });
        setSelectedIds([]);
        loadData();
      }
    } catch (err) {
      console.error('일괄 처리 실패:', err);
      toast.error('일괄 처리에 실패했습니다.');
    }
  }, [bulkStatusDialog, selectedIds, loadData]);
  
  // 체크박스 핸들러
  const handleCheck = useCallback((id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  }, []);
  
  const handleToggleAll = useCallback((checked) => {
    if (checked) {
      const availableIds = inquiries
        .filter(item => item.status === 'pending' || item.status === 'waiting')
        .map(item => item.id);
      setSelectedIds(availableIds);
    } else {
      setSelectedIds([]);
    }
  }, [inquiries]);
  
  // 필터 옵션 (상태 필터 제거 - 탭으로 대체)
  const filterOptions = useMemo(() => [], []);
  
  // 테이블 훅
  const {
    checkedItems,
    allChecked,
    handleCheck: tableHandleCheck,
    handleToggleAll: tableHandleToggleAll,
    sortConfig,
    handleSort
  } = useTable({
    data: inquiries,
    initialSortConfig: { key: 'created_at', direction: 'desc' }
  });
  
  // 필터 및 페이지네이션 훅
  const {
    page,
    rowsPerPage,
    totalCount,
    handlePageChange,
    handleRowsPerPageChange,
    filterValues,
    handleFilterChange,
    handleFilter,
    handleClearFilters
  } = useTableFilterAndPagination({
    columns,
    data: inquiries,
    defaultRowsPerPage: 25,
    onDataLoad: loadData
  });
  
  // 헤더 훅
  const {
    searchText,
    handleSearchChange,
    handleClearSearch
  } = useTableHeader({
    onSearch: (value) => {
      loadData({ search: value });
    }
  });
  
  // 웹소켓 이벤트 리스너
  useEffect(() => {
    if (!socketService) return;
    
    const handleNewInquiry = (data) => {
      console.log('[입금신청] 새 입금문의:', data);
      loadData();
    };
    
    const handleStatusChanged = (data) => {
      console.log('[입금신청] 상태 변경:', data);
      loadData();
    };
    
    socketService.on('deposit:inquiry:new', handleNewInquiry);
    socketService.on('deposit:inquiry:status:changed', handleStatusChanged);
    
    return () => {
      socketService.off('deposit:inquiry:new', handleNewInquiry);
      socketService.off('deposit:inquiry:status:changed', handleStatusChanged);
    };
  }, [socketService, loadData]);
  
  // 초기 데이터 로드 및 탭 변경 시 재로드
  useEffect(() => {
    loadData();
  }, [loadData, currentTab]);
  
  // 탭 변경 핸들러
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);
  
  if (loading && inquiries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>데이터를 불러오는 중...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <>
      {/* 상단 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={`전체 (${counts.total})`} />
          <Tab label={`요청중 (${counts.pending})`} />
          <Tab label={`대기 (${counts.waiting})`} />
          <Tab label={`비허용 (${counts.rejected})`} />
        </Tabs>
      </Box>
      
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        {/* 우측 상단 새로고침 버튼 */}
        <Box mb={2} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadData()}
          >
            새로고침
          </Button>
        </Box>
        
        {/* 테이블 헤더 */}
        <TableHeader
          title="입금신청 리스트"
          totalItems={totalCount}
          countLabel="총 ##count##건의 입금신청"
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          showSearch={true}
          searchPlaceholder="아이디, 닉네임, 입금자명 검색..."
          sx={{ mb: 2 }}
        />
        
        {/* 필터 및 페이지네이션 */}
        <TableFilterAndPagination
          filterProps={{
            columns,
            filterValues,
            activeFilters: filterValues,
            filterOptions,
            handleFilterChange,
            onFilter: handleFilter,
            onClearFilters: handleClearFilters
          }}
          paginationProps={{
            count: totalCount,
            page,
            rowsPerPage,
            onPageChange: handlePageChange,
            onRowsPerPageChange: handleRowsPerPageChange
          }}
        />
        
        {/* 일괄 처리 버튼 */}
        {selectedIds.length > 0 && (
          <Box mt={2} mb={2}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => setBulkStatusDialog({ open: true, status: 'approved', rejectReason: '' })}
              >
                선택 항목 승인 ({selectedIds.length}건)
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => setBulkStatusDialog({ open: true, status: 'waiting', rejectReason: '' })}
              >
                선택 항목 대기
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setBulkStatusDialog({ open: true, status: 'rejected', rejectReason: '' })}
              >
                선택 항목 비승인
              </Button>
            </Stack>
          </Box>
        )}
        
        {/* 테이블 */}
        <Box ref={containerRef} sx={{ width: '100%', mt: 2 }}>
          <BaseTable
            columns={columns}
            data={inquiries}
            checkable={true}
            checkedItems={selectedIds}
            allChecked={allChecked}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            maxHeight={tableHeight}
          />
          
          {/* 테이블 리사이즈 핸들 */}
          <TableResizeHandle 
            resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
            showIcon={true}
            isDragging={isDragging}
          />
        </Box>
      </Paper>
      
      {/* 상태 변경 다이얼로그 */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, inquiry: null, status: '', rejectReason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          입금신청 상태 변경
        </DialogTitle>
        <DialogContent>
          {statusDialog.inquiry && (
            <Box>
              <Typography variant="body2" gutterBottom>
                아이디: {statusDialog.inquiry.username}
              </Typography>
              <Typography variant="body2" gutterBottom>
                금액: {new Intl.NumberFormat('ko-KR').format(statusDialog.inquiry.amount)}원
              </Typography>
              <Typography variant="body2" gutterBottom>
                상태: {statusDialog.status === 'approved' ? '승인' : 
                       statusDialog.status === 'waiting' ? '대기' : '비승인'}
              </Typography>
              
              {statusDialog.status === 'rejected' && (
                <TextField
                  fullWidth
                  label="비승인 사유"
                  multiline
                  rows={3}
                  value={statusDialog.rejectReason}
                  onChange={(e) => setStatusDialog(prev => ({ ...prev, rejectReason: e.target.value }))}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, inquiry: null, status: '', rejectReason: '' })}>
            취소
          </Button>
          <Button 
            onClick={handleStatusChangeConfirm} 
            variant="contained"
            color={statusDialog.status === 'approved' ? 'success' : 
                   statusDialog.status === 'waiting' ? 'warning' : 'error'}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 일괄 처리 다이얼로그 */}
      <Dialog
        open={bulkStatusDialog.open}
        onClose={() => setBulkStatusDialog({ open: false, status: '', rejectReason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          입금신청 일괄 처리
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            선택한 {selectedIds.length}건의 입금신청을 
            {bulkStatusDialog.status === 'approved' ? ' 승인' : 
             bulkStatusDialog.status === 'waiting' ? ' 대기' : ' 비승인'}
            처리하시겠습니까?
          </Typography>
          
          {bulkStatusDialog.status === 'rejected' && (
            <TextField
              fullWidth
              label="비승인 사유"
              multiline
              rows={3}
              value={bulkStatusDialog.rejectReason}
              onChange={(e) => setBulkStatusDialog(prev => ({ ...prev, rejectReason: e.target.value }))}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkStatusDialog({ open: false, status: '', rejectReason: '' })}>
            취소
          </Button>
          <Button 
            onClick={handleBulkStatusChange} 
            variant="contained"
            color={bulkStatusDialog.status === 'approved' ? 'success' : 
                   bulkStatusDialog.status === 'waiting' ? 'warning' : 'error'}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DepositInquiryList;