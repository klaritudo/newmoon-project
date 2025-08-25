import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Chip,
  FormControlLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  useTheme,
  IconButton,
  InputAdornment
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShieldIcon from '@mui/icons-material/Shield';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { PageContainer, PageHeader, TableHeader, BaseTable } from '../../components/baseTemplate/components';
import { useTableHeader, useTable } from '../../components/baseTemplate/hooks';

/**
 * 관리자/IP설정 페이지
 */
const AdminIPSettingsPage = () => {
  const theme = useTheme();
  
  // 서브 아이디 관련 상태
  const [subAccounts, setSubAccounts] = useState([
    { id: 1, parentType: '총판', parentId: 'agent001', userId: 'sub001', password: '****', enabled: true, createdAt: '2024-01-15' },
    { id: 2, parentType: '매장', parentId: 'store001', userId: 'sub002', password: '****', enabled: true, createdAt: '2024-01-16' },
    { id: 3, parentType: '총판', parentId: 'agent002', userId: 'sub003', password: '****', enabled: false, createdAt: '2024-01-17' },
  ]);
  
  // IP 관련 상태
  const [allowedIPs, setAllowedIPs] = useState([
    { id: 1, ip: '192.168.1.100', memo: '본사 사무실', enabled: true, createdAt: '2024-01-10' },
    { id: 2, ip: '192.168.1.101', memo: '개발팀', enabled: true, createdAt: '2024-01-11' },
    { id: 3, ip: '10.0.0.5', memo: '외부 협력사', enabled: false, createdAt: '2024-01-12' },
  ]);
  
  const [blockedIPs, setBlockedIPs] = useState([
    { id: 1, ip: '123.45.67.89', memo: '의심스러운 접근', enabled: true, createdAt: '2024-01-13' },
    { id: 2, ip: '98.76.54.32', memo: '해킹 시도', enabled: true, createdAt: '2024-01-14' },
  ]);
  
  // 토글 상태
  const [useIPAllowList, setUseIPAllowList] = useState(true);
  const [useIPBlockList, setUseIPBlockList] = useState(true);
  
  // 입력 필드 상태
  const [newSubAccount, setNewSubAccount] = useState({
    parentType: '',
    parentId: '',
    userId: '',
    password: ''
  });
  
  const [newAllowedIP, setNewAllowedIP] = useState({
    ip: '',
    memo: ''
  });
  
  const [newBlockedIP, setNewBlockedIP] = useState({
    ip: '',
    memo: ''
  });
  
  // 에이전트 목록 (실제로는 API에서 가져와야 함)
  const [agentList, setAgentList] = useState({
    '총판': ['agent001', 'agent002', 'agent003'],
    '매장': ['store001', 'store002', 'store003'],
    '부본': ['sub001', 'sub002']
  });
  
  // 수정 다이얼로그 상태
  const [editDialog, setEditDialog] = useState({
    open: false,
    type: '', // 'subAccount', 'allowedIP', 'blockedIP'
    data: null
  });
  
  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 페이지 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(10);
  
  // 테이블 헤더 훅 사용
  const {
    searchText: subAccountSearchText,
    handleSearchChange: handleSubAccountSearchChange,
    handleClearSearch: handleSubAccountClearSearch,
  } = useTableHeader({
    initialTotalItems: subAccounts.length,
    tableId: 'adminSubAccounts',
    showSearch: true,
  });

  const {
    searchText: allowedIPSearchText,
    handleSearchChange: handleAllowedIPSearchChange,
    handleClearSearch: handleAllowedIPClearSearch,
  } = useTableHeader({
    initialTotalItems: allowedIPs.length,
    tableId: 'adminAllowedIPs',
    showSearch: true,
  });

  const {
    searchText: blockedIPSearchText,
    handleSearchChange: handleBlockedIPSearchChange,
    handleClearSearch: handleBlockedIPClearSearch,
  } = useTableHeader({
    initialTotalItems: blockedIPs.length,
    tableId: 'adminBlockedIPs',
    showSearch: true,
  });
  
  // 알림 표시
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // 서브 아이디 추가
  const handleAddSubAccount = useCallback(() => {
    if (!newSubAccount.parentType || !newSubAccount.parentId || !newSubAccount.userId || !newSubAccount.password) {
      showNotification('모든 필드를 입력해주세요.', 'error');
      return;
    }
    
    const newAccount = {
      id: Date.now(),
      ...newSubAccount,
      password: '****', // 실제로는 암호화 처리
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setSubAccounts([...subAccounts, newAccount]);
    setNewSubAccount({ parentType: '', parentId: '', userId: '', password: '' });
    showNotification('서브 아이디가 추가되었습니다.');
  }, [newSubAccount, subAccounts]);
  
  // IP 추가
  const handleAddAllowedIP = useCallback(() => {
    if (!newAllowedIP.ip || !newAllowedIP.memo) {
      showNotification('IP 주소와 메모를 입력해주세요.', 'error');
      return;
    }
    
    const newIP = {
      id: Date.now(),
      ...newAllowedIP,
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setAllowedIPs([...allowedIPs, newIP]);
    setNewAllowedIP({ ip: '', memo: '' });
    showNotification('허용 IP가 추가되었습니다.');
  }, [newAllowedIP, allowedIPs]);
  
  const handleAddBlockedIP = useCallback(() => {
    if (!newBlockedIP.ip || !newBlockedIP.memo) {
      showNotification('IP 주소와 메모를 입력해주세요.', 'error');
      return;
    }
    
    const newIP = {
      id: Date.now(),
      ...newBlockedIP,
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setBlockedIPs([...blockedIPs, newIP]);
    setNewBlockedIP({ ip: '', memo: '' });
    showNotification('차단 IP가 추가되었습니다.');
  }, [newBlockedIP, blockedIPs]);
  
  // 토글 핸들러
  const handleToggleSubAccount = useCallback((id) => {
    setSubAccounts(prev => prev.map(account => 
      account.id === id ? { ...account, enabled: !account.enabled } : account
    ));
  }, []);
  
  const handleToggleAllowedIP = useCallback((id) => {
    setAllowedIPs(prev => prev.map(ip => 
      ip.id === id ? { ...ip, enabled: !ip.enabled } : ip
    ));
  }, []);
  
  const handleToggleBlockedIP = useCallback((id) => {
    setBlockedIPs(prev => prev.map(ip => 
      ip.id === id ? { ...ip, enabled: !ip.enabled } : ip
    ));
  }, []);
  
  // 삭제 핸들러
  const handleDeleteSubAccount = useCallback((id) => {
    setSubAccounts(prev => prev.filter(account => account.id !== id));
    showNotification('서브 아이디가 삭제되었습니다.');
  }, []);
  
  const handleDeleteAllowedIP = useCallback((id) => {
    setAllowedIPs(prev => prev.filter(ip => ip.id !== id));
    showNotification('허용 IP가 삭제되었습니다.');
  }, []);
  
  const handleDeleteBlockedIP = useCallback((id) => {
    setBlockedIPs(prev => prev.filter(ip => ip.id !== id));
    showNotification('차단 IP가 삭제되었습니다.');
  }, []);
  
  // 수정 다이얼로그 열기
  const handleOpenEditDialog = useCallback((type, data) => {
    setEditDialog({ open: true, type, data });
  }, []);
  
  // 수정 다이얼로그 닫기
  const handleCloseEditDialog = useCallback(() => {
    setEditDialog({ open: false, type: '', data: null });
  }, []);
  
  // 타입별 색상 설정
  const getTypeColor = (type) => {
    switch (type) {
      case '총판': return 'primary';
      case '매장': return 'success';
      case '부본': return 'warning';
      default: return 'default';
    }
  };

  // 필터링된 데이터
  const filteredSubAccounts = useMemo(() => {
    if (!subAccountSearchText) return subAccounts;
    return subAccounts.filter(account => 
      account.userId.toLowerCase().includes(subAccountSearchText.toLowerCase()) ||
      account.parentId.toLowerCase().includes(subAccountSearchText.toLowerCase())
    );
  }, [subAccounts, subAccountSearchText]);

  const filteredAllowedIPs = useMemo(() => {
    if (!allowedIPSearchText) return allowedIPs;
    return allowedIPs.filter(ip => 
      ip.ip.includes(allowedIPSearchText) ||
      ip.memo.toLowerCase().includes(allowedIPSearchText.toLowerCase())
    );
  }, [allowedIPs, allowedIPSearchText]);

  const filteredBlockedIPs = useMemo(() => {
    if (!blockedIPSearchText) return blockedIPs;
    return blockedIPs.filter(ip => 
      ip.ip.includes(blockedIPSearchText) ||
      ip.memo.toLowerCase().includes(blockedIPSearchText.toLowerCase())
    );
  }, [blockedIPs, blockedIPSearchText]);
  
  // 서브 계정 테이블 컬럼 정의
  const subAccountColumns = useMemo(() => [
    {
      id: 'parentType',
      label: '유형',
      type: 'chip',
      width: 100,
      sortable: true,
      align: 'center',
      render: (row) => ({
        label: row.parentType,
        color: getTypeColor(row.parentType),
        variant: 'filled'
      })
    },
    {
      id: 'parentId',
      label: '상위 아이디',
      type: 'text',
      width: 150,
      sortable: true,
      align: 'center'
    },
    {
      id: 'userId',
      label: '아이디',
      type: 'text',
      width: 150,
      sortable: true,
      align: 'center'
    },
    {
      id: 'enabled',
      label: '상태',
      type: 'toggle',
      width: 100,
      align: 'center',
      onToggle: (row, checked) => {
        handleToggleSubAccount(row.id);
      }
    },
    {
      id: 'createdAt',
      label: '생성일',
      type: 'text',
      width: 150,
      sortable: true,
      align: 'center'
    },
    {
      id: 'actions',
      label: '액션',
      type: 'button',
      width: 120,
      align: 'center',
      buttons: [
        {
          label: '수정',
          variant: 'outlined',
          color: 'primary',
          size: 'small',
          onClick: (row) => handleOpenEditDialog('subAccount', row)
        },
        {
          label: '삭제',
          variant: 'outlined',
          color: 'error',
          size: 'small',
          onClick: (row) => handleDeleteSubAccount(row.id)
        }
      ]
    }
  ], [handleToggleSubAccount, handleOpenEditDialog, handleDeleteSubAccount]);
  
  // 허용 IP 테이블 컬럼 정의
  const allowedIPColumns = useMemo(() => [
    {
      id: 'ip',
      label: 'IP 주소',
      type: 'text',
      width: 200,
      sortable: true,
      align: 'center'
    },
    {
      id: 'memo',
      label: '메모',
      type: 'text',
      width: 250,
      sortable: true,
      align: 'center'
    },
    {
      id: 'enabled',
      label: '상태',
      type: 'toggle',
      width: 100,
      align: 'center',
      onToggle: (row, checked) => {
        handleToggleAllowedIP(row.id);
      }
    },
    {
      id: 'createdAt',
      label: '등록일',
      type: 'text',
      width: 150,
      sortable: true,
      align: 'center'
    },
    {
      id: 'actions',
      label: '액션',
      type: 'button',
      width: 120,
      align: 'center',
      buttons: [
        {
          label: '수정',
          variant: 'outlined',
          color: 'primary',
          size: 'small',
          disabled: !useIPAllowList,
          onClick: (row) => handleOpenEditDialog('allowedIP', row)
        },
        {
          label: '삭제',
          variant: 'outlined',
          color: 'error',
          size: 'small',
          disabled: !useIPAllowList,
          onClick: (row) => handleDeleteAllowedIP(row.id)
        }
      ]
    }
  ], [handleToggleAllowedIP, handleOpenEditDialog, handleDeleteAllowedIP, useIPAllowList]);
  
  // 차단 IP 테이블 컬럼 정의
  const blockedIPColumns = useMemo(() => [
    {
      id: 'ip',
      label: 'IP 주소',
      type: 'text',
      width: 200,
      sortable: true,
      align: 'center'
    },
    {
      id: 'memo',
      label: '메모',
      type: 'text',
      width: 250,
      sortable: true,
      align: 'center'
    },
    {
      id: 'enabled',
      label: '상태',
      type: 'toggle',
      width: 100,
      align: 'center',
      onToggle: (row, checked) => {
        handleToggleBlockedIP(row.id);
      }
    },
    {
      id: 'createdAt',
      label: '등록일',
      type: 'text',
      width: 150,
      sortable: true,
      align: 'center'
    },
    {
      id: 'actions',
      label: '액션',
      type: 'button',
      width: 120,
      align: 'center',
      buttons: [
        {
          label: '수정',
          variant: 'outlined',
          color: 'primary',
          size: 'small',
          disabled: !useIPBlockList,
          onClick: (row) => handleOpenEditDialog('blockedIP', row)
        },
        {
          label: '삭제',
          variant: 'outlined',
          color: 'error',
          size: 'small',
          disabled: !useIPBlockList,
          onClick: (row) => handleDeleteBlockedIP(row.id)
        }
      ]
    }
  ], [handleToggleBlockedIP, handleOpenEditDialog, handleDeleteBlockedIP, useIPBlockList]);
  
  // useTable 훅 사용 - 서브 계정
  const {
    checkedItems: subAccountCheckedItems,
    sortConfig: subAccountSortConfig,
    allChecked: subAccountAllChecked,
    handleSort: subAccountHandleSort,
    handleCheck: subAccountHandleCheck,
    handleToggleAll: subAccountHandleToggleAll
  } = useTable({
    data: filteredSubAccounts,
    initialSort: { key: 'createdAt', direction: 'desc' },
    initialCheckedItems: {},
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });
  
  // useTable 훅 사용 - 허용 IP
  const {
    checkedItems: allowedIPCheckedItems,
    sortConfig: allowedIPSortConfig,
    allChecked: allowedIPAllChecked,
    handleSort: allowedIPHandleSort,
    handleCheck: allowedIPHandleCheck,
    handleToggleAll: allowedIPHandleToggleAll
  } = useTable({
    data: filteredAllowedIPs,
    initialSort: { key: 'createdAt', direction: 'desc' },
    initialCheckedItems: {},
    page: 0,
    rowsPerPage: 10
  });
  
  // useTable 훅 사용 - 차단 IP
  const {
    checkedItems: blockedIPCheckedItems,
    sortConfig: blockedIPSortConfig,
    allChecked: blockedIPAllChecked,
    handleSort: blockedIPHandleSort,
    handleCheck: blockedIPHandleCheck,
    handleToggleAll: blockedIPHandleToggleAll
  } = useTable({
    data: filteredBlockedIPs,
    initialSort: { key: 'createdAt', direction: 'desc' },
    initialCheckedItems: {},
    page: 0,
    rowsPerPage: 10
  });
  
  return (
    <PageContainer>
      <PageHeader
        title="관리자/IP설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={() => showNotification('데이터를 새로고침했습니다.')}
      />
      
      {/* 서브 아이디 관리 섹션 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
            backgroundColor: '#f5f7fa',
            borderRadius: 1.5,
            p: 2.5,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* 왼쪽: 제목, 개수 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '1.1rem'
            }}>
              서브 아이디 관리
            </Typography>
            <Chip
              label={`총 ${filteredSubAccounts.length}개`}
              color="primary"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>
          
          {/* 오른쪽: 검색 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="아이디 검색..."
              value={subAccountSearchText}
              onChange={handleSubAccountSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: subAccountSearchText ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={handleSubAccountClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  bgcolor: '#ffffff',
                  borderRadius: '25px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                    borderRadius: '25px'
                  }
                }
              }}
              sx={{
                width: '240px',
                '& .MuiInputBase-root': {
                  height: '36px',
                  fontSize: '0.875rem',
                  borderRadius: '25px'
                }
              }}
            />
          </Box>
        </Box>
        
        {/* 서브 아이디 추가 폼 */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>유형</InputLabel>
                <Select
                  value={newSubAccount.parentType}
                  onChange={(e) => setNewSubAccount({ ...newSubAccount, parentType: e.target.value, parentId: '' })}
                  label="유형"
                >
                  <MenuItem value="총판">총판</MenuItem>
                  <MenuItem value="매장">매장</MenuItem>
                  <MenuItem value="부본">부본</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!newSubAccount.parentType}>
                <InputLabel>상위 아이디</InputLabel>
                <Select
                  value={newSubAccount.parentId}
                  onChange={(e) => setNewSubAccount({ ...newSubAccount, parentId: e.target.value })}
                  label="상위 아이디"
                >
                  {newSubAccount.parentType && agentList[newSubAccount.parentType]?.map(agent => (
                    <MenuItem key={agent} value={agent}>{agent}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="아이디"
                value={newSubAccount.userId}
                onChange={(e) => setNewSubAccount({ ...newSubAccount, userId: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={newSubAccount.password}
                onChange={(e) => setNewSubAccount({ ...newSubAccount, password: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={1}>
              <IconButton
                color="primary"
                onClick={handleAddSubAccount}
                sx={{ 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  width: '56px',
                  height: '56px',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
        
        {/* 서브 아이디 테이블 */}
        <Box sx={{ mt: 2 }}>
          <BaseTable
            columns={subAccountColumns}
            data={filteredSubAccounts}
            checkable={false}
            fixedHeader={true}
            maxHeight="400px"
            sortConfig={subAccountSortConfig}
            onSort={subAccountHandleSort}
            page={0}
            rowsPerPage={10}
            totalCount={filteredSubAccounts.length}
            sequentialPageNumbers={false}
          />
        </Box>
      </Paper>
      
      {/* IP 허용 목록 섹션 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3, opacity: useIPAllowList ? 1 : 0.5 }}>
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
              backgroundColor: '#f5f7fa',
              borderRadius: 1.5,
              p: 2.5,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* 왼쪽: 제목, 개수, 토글 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                fontSize: '1.1rem'
              }}>
                IP 허용 목록
              </Typography>
              <Chip
                label={`${filteredAllowedIPs.length}개 IP`}
                color="primary"
                size="small"
                sx={{ fontWeight: 500 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={useIPAllowList}
                    onChange={(e) => setUseIPAllowList(e.target.checked)}
                    color="success"
                    size="small"
                  />
                }
                label="허용 목록 사용"
                sx={{ ml: 1 }}
              />
            </Box>
            
            {/* 오른쪽: 검색 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="IP 주소 검색..."
                value={allowedIPSearchText}
                onChange={handleAllowedIPSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: allowedIPSearchText ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleAllowedIPClearSearch}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    bgcolor: '#ffffff',
                    borderRadius: '25px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                      borderRadius: '25px'
                    }
                  }
                }}
                sx={{
                  width: '240px',
                  '& .MuiInputBase-root': {
                    height: '36px',
                    fontSize: '0.875rem',
                    borderRadius: '25px'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
        
        {/* IP 추가 폼 */}
        <Box sx={{ mb: 3, opacity: useIPAllowList ? 1 : 0.5 }}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="IP 주소"
                value={newAllowedIP.ip}
                onChange={(e) => setNewAllowedIP({ ...newAllowedIP, ip: e.target.value })}
                disabled={!useIPAllowList}
                placeholder="예: 192.168.1.100"
              />
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="메모"
                value={newAllowedIP.memo}
                onChange={(e) => setNewAllowedIP({ ...newAllowedIP, memo: e.target.value })}
                disabled={!useIPAllowList}
                placeholder="예: 본사 사무실"
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <IconButton
                color="success"
                onClick={handleAddAllowedIP}
                disabled={!useIPAllowList}
                sx={{ 
                  backgroundColor: 'success.main',
                  color: 'white',
                  width: '56px',
                  height: '56px',
                  '&:hover': {
                    backgroundColor: 'success.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabledBackground',
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
        
        {/* 허용 IP 테이블 */}
        <Box sx={{ mt: 2, opacity: useIPAllowList ? 1 : 0.5 }}>
          <BaseTable
            columns={allowedIPColumns}
            data={filteredAllowedIPs}
            checkable={false}
            fixedHeader={true}
            maxHeight="300px"
            sortConfig={allowedIPSortConfig}
            onSort={allowedIPHandleSort}
            page={0}
            rowsPerPage={10}
            totalCount={filteredAllowedIPs.length}
            sequentialPageNumbers={false}
          />
        </Box>
      </Paper>
      
      {/* IP 차단 목록 섹션 */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, opacity: useIPBlockList ? 1 : 0.5 }}>
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
              backgroundColor: '#f5f7fa',
              borderRadius: 1.5,
              p: 2.5,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* 왼쪽: 제목, 개수, 토글 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                fontSize: '1.1rem'
              }}>
                IP 차단 목록
              </Typography>
              <Chip
                label={`${filteredBlockedIPs.length}개 IP`}
                color="error"
                size="small"
                sx={{ fontWeight: 500 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={useIPBlockList}
                    onChange={(e) => setUseIPBlockList(e.target.checked)}
                    color="error"
                    size="small"
                  />
                }
                label="차단 목록 사용"
                sx={{ ml: 1 }}
              />
            </Box>
            
            {/* 오른쪽: 검색 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="IP 주소 검색..."
                value={blockedIPSearchText}
                onChange={handleBlockedIPSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: blockedIPSearchText ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleBlockedIPClearSearch}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    bgcolor: '#ffffff',
                    borderRadius: '25px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                      borderRadius: '25px'
                    }
                  }
                }}
                sx={{
                  width: '240px',
                  '& .MuiInputBase-root': {
                    height: '36px',
                    fontSize: '0.875rem',
                    borderRadius: '25px'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
        
        {/* IP 추가 폼 */}
        <Box sx={{ mb: 3, opacity: useIPBlockList ? 1 : 0.5 }}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="IP 주소"
                value={newBlockedIP.ip}
                onChange={(e) => setNewBlockedIP({ ...newBlockedIP, ip: e.target.value })}
                disabled={!useIPBlockList}
                placeholder="예: 123.45.67.89"
              />
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="메모"
                value={newBlockedIP.memo}
                onChange={(e) => setNewBlockedIP({ ...newBlockedIP, memo: e.target.value })}
                disabled={!useIPBlockList}
                placeholder="예: 의심스러운 접근"
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <IconButton
                color="error"
                onClick={handleAddBlockedIP}
                disabled={!useIPBlockList}
                sx={{ 
                  backgroundColor: 'error.main',
                  color: 'white',
                  width: '56px',
                  height: '56px',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabledBackground',
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
        
        {/* 차단 IP 테이블 */}
        <Box sx={{ mt: 2, opacity: useIPBlockList ? 1 : 0.5 }}>
          <BaseTable
            columns={blockedIPColumns}
            data={filteredBlockedIPs}
            checkable={false}
            fixedHeader={true}
            maxHeight="300px"
            sortConfig={blockedIPSortConfig}
            onSort={blockedIPHandleSort}
            page={0}
            rowsPerPage={10}
            totalCount={filteredBlockedIPs.length}
            sequentialPageNumbers={false}
          />
        </Box>
      </Paper>
      
      {/* 수정 다이얼로그 */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editDialog.type === 'subAccount' && '서브 아이디 수정'}
          {editDialog.type === 'allowedIP' && '허용 IP 수정'}
          {editDialog.type === 'blockedIP' && '차단 IP 수정'}
        </DialogTitle>
        <DialogContent>
          {/* 수정 폼 내용은 추가 구현 필요 */}
          <Typography sx={{ mt: 2 }}>수정 기능은 추가 구현이 필요합니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>취소</Button>
          <Button variant="contained" onClick={handleCloseEditDialog}>저장</Button>
        </DialogActions>
      </Dialog>
      
      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AdminIPSettingsPage;