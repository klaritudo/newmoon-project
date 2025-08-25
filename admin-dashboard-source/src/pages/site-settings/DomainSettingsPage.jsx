import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Language as DomainIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  AdminPanelSettings as AdminIcon,
  People as UserIcon,
} from '@mui/icons-material';
import { 
  PageContainer, 
  PageHeader, 
  TableHeader,
  BaseTable
} from '../../components/baseTemplate/components';
import { 
  useTableHeader,
  useTable
} from '../../components/baseTemplate/hooks';
import domainService from '../../services/domainService';
import agentLevelApi from '../../services/agentLevelApi';
import apiService from '../../services/api';

/**
 * 도메인 설정 페이지
 * 관리자/유저 도메인을 관리하고 접속 권한을 설정
 */
const DomainSettingsPage = () => {
  // 도메인 데이터
  const [domains, setDomains] = useState([]);
  const [agentLevels, setAgentLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 추가 폼 상태
  const [newDomain, setNewDomain] = useState({ 
    url: '', 
    domain_type: 'admin',
    permissions: []
  });
  const [isAdding, setIsAdding] = useState(false);

  // 수정 상태
  const [editingId, setEditingId] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);

  // 삭제 확인 다이얼로그
  const [deleteDialog, setDeleteDialog] = useState({ open: false, domain: null });

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


  // 테이블 헤더 훅
  const {
    searchText,
    handleSearchChange,
    handleClearSearch,
  } = useTableHeader({
    initialTotalItems: domains.length,
    tableId: 'domainSettings',
    showSearch: true,
  });

  // 테이블 훅
  const {
    checkedItems,
    sortConfig,
    allChecked,
    handleSort,
    handleCheck,
    handleToggleAll,
  } = useTable({
    data: domains,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
  });

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // 개별적으로 로드하여 어떤 API가 문제인지 파악
      try {
        console.log('도메인 목록 로드 시작...');
        const domainsResponse = await domainService.getAllDomains();
        console.log('도메인 응답:', domainsResponse);
        
        if (domainsResponse.success) {
          // 모든 도메인 표시
          setDomains(domainsResponse.data.map(domain => ({
            id: domain.id,
            domain_type: domain.domain_type,
            url: domain.url,
            permissions: domain.permissions || [],
            createdAt: domain.created_at.split('T')[0],
            updatedAt: domain.updated_at.split('T')[0],
            active: domain.is_active === 1
          })));
        }
      } catch (domainError) {
        console.error('도메인 로드 실패:', domainError);
        if (!domainError.response?.status === 401) {
          showNotification('도메인 목록을 불러오는데 실패했습니다.', 'error');
        }
      }
      
      try {
        console.log('에이전트 레벨 로드 시작...');
        const levelsData = await agentLevelApi.getAll();
        console.log('레벨 데이터:', levelsData);
        
        // 마스터 레벨 제외
        setAgentLevels(levelsData.filter(level => level.id !== 999));
      } catch (levelError) {
        console.error('레벨 로드 실패:', levelError);
        if (!levelError.response?.status === 401) {
          showNotification('에이전트 레벨을 불러오는데 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('전체 로드 실패:', error);
      
      // 인증 에러가 발생한 경우
      if (error.isAuthError) {
        showNotification('인증이 만료되었습니다. 다시 로그인해주세요.', 'error');
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        showNotification('데이터를 불러오는데 실패했습니다.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 표시
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // 도메인 추가
  const handleAddDomain = useCallback(async () => {
    if (!newDomain.url.trim()) {
      showNotification('도메인 URL을 입력해주세요.', 'error');
      return;
    }

    // URL 형식 검증
    try {
      new URL(newDomain.url);
    } catch {
      showNotification('올바른 URL 형식이 아닙니다.', 'error');
      return;
    }

    // 관리자 도메인인 경우 권한 체크 (선택사항으로 변경)
    // if (newDomain.domain_type === 'admin' && newDomain.permissions.length === 0) {
    //   showNotification('관리자 도메인은 최소 하나 이상의 접속 권한을 선택해야 합니다.', 'error');
    //   return;
    // }
    
    try {
      const response = await domainService.addDomain({
        domain_type: newDomain.domain_type,
        url: newDomain.url.trim(),
        permissions: newDomain.domain_type === 'admin' ? newDomain.permissions : []
      });
      
      if (response.success) {
        await loadData();
        setNewDomain({ url: '', domain_type: 'admin', permissions: [] });
        setIsAdding(false);
        showNotification('도메인이 추가되었습니다.');
      }
    } catch (error) {
      console.error('도메인 추가 실패:', error);
      showNotification(error.response?.data?.error || '도메인 추가에 실패했습니다.', 'error');
    }
  }, [newDomain]);

  // 도메인 수정 시작
  const handleEditStart = useCallback((domain) => {
    setEditingId(domain.id);
    setEditingDomain({ 
      ...domain,
      permissions: domain.permissions.map(p => p.agent_level_id)
    });
  }, []);

  // 도메인 수정 저장
  const handleEditSave = useCallback(async () => {
    if (!editingDomain.url.trim()) {
      showNotification('도메인 URL을 입력해주세요.', 'error');
      return;
    }

    // URL 형식 검증
    try {
      new URL(editingDomain.url);
    } catch {
      showNotification('올바른 URL 형식이 아닙니다.', 'error');
      return;
    }

    // 관리자 도메인인 경우 권한 체크 (선택사항으로 변경)
    // if (editingDomain.domain_type === 'admin' && editingDomain.permissions.length === 0) {
    //   showNotification('관리자 도메인은 최소 하나 이상의 접속 권한을 선택해야 합니다.', 'error');
    //   return;
    // }

    try {
      const response = await domainService.updateDomain(editingId, {
        url: editingDomain.url.trim(),
        permissions: editingDomain.domain_type === 'admin' ? editingDomain.permissions : []
      });
      
      if (response.success) {
        await loadData();
        setEditingId(null);
        setEditingDomain(null);
        showNotification('도메인이 수정되었습니다.');
      }
    } catch (error) {
      console.error('도메인 수정 실패:', error);
      showNotification(error.response?.data?.error || '도메인 수정에 실패했습니다.', 'error');
    }
  }, [editingId, editingDomain]);

  // 도메인 수정 취소
  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingDomain(null);
  }, []);

  // 도메인 삭제
  const handleDelete = useCallback((domain) => {
    setDeleteDialog({ open: true, domain });
  }, []);

  // 도메인 삭제 확인
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.domain) {
      try {
        const response = await domainService.deleteDomain(deleteDialog.domain.id);
        if (response.success) {
          await loadData();
          showNotification('도메인이 삭제되었습니다.');
        }
      } catch (error) {
        console.error('도메인 삭제 실패:', error);
        showNotification('도메인 삭제에 실패했습니다.', 'error');
      }
    }
    setDeleteDialog({ open: false, domain: null });
  }, [deleteDialog.domain]);

  // 활성/비활성 토글
  const handleToggleActive = useCallback(async (domain) => {
    try {
      const response = await domainService.toggleDomainStatus(domain.id);
      if (response.success) {
        await loadData();
        showNotification(response.message);
      }
    } catch (error) {
      console.error('도메인 상태 변경 실패:', error);
      showNotification('도메인 상태 변경에 실패했습니다.', 'error');
    }
  }, []);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    await loadData();
    showNotification('도메인 목록을 새로고침했습니다.');
  }, []);

  // URL 복사
  const handleCopyUrl = useCallback((url) => {
    navigator.clipboard.writeText(url);
    showNotification('URL이 클립보드에 복사되었습니다.');
  }, []);

  // URL 새창에서 열기
  const handleOpenUrl = useCallback((url) => {
    window.open(url, '_blank');
  }, []);

  // 권한 토글
  const handlePermissionToggle = useCallback((levelId, isEditing = false) => {
    if (isEditing && editingDomain) {
      const newPermissions = editingDomain.permissions.includes(levelId)
        ? editingDomain.permissions.filter(id => id !== levelId)
        : [...editingDomain.permissions, levelId];
      setEditingDomain({ ...editingDomain, permissions: newPermissions });
    } else {
      const newPermissions = newDomain.permissions.includes(levelId)
        ? newDomain.permissions.filter(id => id !== levelId)
        : [...newDomain.permissions, levelId];
      setNewDomain({ ...newDomain, permissions: newPermissions });
    }
  }, [newDomain, editingDomain]);


  // 필터링된 도메인
  const filteredDomains = useMemo(() => {
    let result = [...domains];

    // 검색 필터
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(domain =>
        domain.url.toLowerCase().includes(searchLower) ||
        domain.domain_type.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [domains, searchText]);

  // 테이블 컬럼 정의
  const columns = [
    {
      id: 'no',
      label: 'No.',
      width: 70,
      align: 'center',
      type: 'number'
    },
    {
      id: 'domain_type',
      label: '타입',
      width: 120,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row) return null;
        return (
          <Chip
            icon={row.domain_type === 'admin' ? <AdminIcon /> : <UserIcon />}
            label={row.domain_type === 'admin' ? '관리자' : '유저'}
            color={row.domain_type === 'admin' ? 'primary' : 'success'}
            size="small"
          />
        );
      }
    },
    {
      id: 'url',
      label: '도메인 URL',
      width: 350,
      align: 'left',
      type: 'custom',
      render: (row) => {
        if (!row) return null;
        if (editingId === row.id) {
          return (
            <TextField
              value={editingDomain.url}
              onChange={(e) => setEditingDomain({ ...editingDomain, url: e.target.value })}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DomainIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DomainIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ flex: 1 }}>{row.url}</Typography>
            <IconButton 
              size="small" 
              onClick={() => handleOpenUrl(row.url)}
              title="새창에서 열기"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleCopyUrl(row.url)}
              title="URL 복사"
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    },
    {
      id: 'permissions',
      label: '접속 가능 단계',
      width: 300,
      align: 'left',
      type: 'custom',
      render: (row) => {
        if (!row) return null;
        if (row.domain_type === 'user') {
          return <Typography variant="body2" color="text.secondary">-</Typography>;
        }
        
        if (editingId === row.id) {
          return (
            <FormGroup row>
              {agentLevels.map(level => (
                <FormControlLabel
                  key={level.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={editingDomain.permissions.includes(level.id)}
                      onChange={() => handlePermissionToggle(level.id, true)}
                    />
                  }
                  label={level.name || level.levelType || level.level_name}
                  sx={{ mr: 1, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              ))}
            </FormGroup>
          );
        }
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {!row.permissions || row.permissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">권한 없음</Typography>
            ) : (
              row.permissions.map(perm => (
                <Chip
                  key={perm.agent_level_id}
                  label={perm.level_name || perm.levelType}
                  size="small"
                  color="default"
                />
              ))
            )}
          </Box>
        );
      }
    },
    {
      id: 'createdAt',
      label: '등록일',
      width: 100,
      align: 'center',
      type: 'text'
    },
    {
      id: 'active',
      label: '상태',
      width: 80,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row) return null;
        return (
          <Switch
            checked={row.active}
            onChange={() => handleToggleActive(row)}
            size="small"
            color="primary"
          />
        );
      }
    },
    {
      id: 'actions',
      label: '액션',
      width: 150,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row) return null;
        if (editingId === row.id) {
          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Chip
                label="저장"
                color="primary"
                size="small"
                onClick={handleEditSave}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="취소"
                color="default"
                size="small"
                onClick={handleEditCancel}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Chip
              label="수정"
              color="primary"
              size="small"
              variant="outlined"
              onClick={() => handleEditStart(row)}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="삭제"
              color="error"
              size="small"
              variant="outlined"
              onClick={() => handleDelete(row)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        );
      }
    }
  ];

  // 번호를 포함한 표시 데이터
  const displayData = useMemo(() => {
    return filteredDomains.map((domain, index) => ({
      ...domain,
      no: index + 1
    }));
  }, [filteredDomains]);

  return (
    <PageContainer>
      <PageHeader
        title="도메인 설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefresh}
        sx={{ mb: 2 }}
      />

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>데이터를 불러오는 중...</Typography>
          </Box>
        ) : (
          <>
        <TableHeader
          title="도메인 관리"
          totalItems={domains.length}
          countLabel="총 ##count##개의 도메인"
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          showSearch={true}
          searchPlaceholder="도메인 검색..."
          showIndentToggle={false}
          showPageNumberToggle={false}
          showColumnPinToggle={false}
          sx={{ mb: 2 }}
        />

        {/* 도메인 추가 폼 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 3,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
          {!isAdding ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAdding(true)}
              sx={{ width: 'fit-content' }}
            >
              도메인 추가
            </Button>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>타입</InputLabel>
                  <Select
                    value={newDomain.domain_type}
                    label="타입"
                    onChange={(e) => setNewDomain({ ...newDomain, domain_type: e.target.value, permissions: [] })}
                  >
                    <MenuItem value="admin">관리자</MenuItem>
                    <MenuItem value="user">유저</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  placeholder="https://example.com"
                  value={newDomain.url}
                  onChange={(e) => setNewDomain({ ...newDomain, url: e.target.value })}
                  size="small"
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DomainIcon />
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDomain();
                    }
                  }}
                />
                
                <IconButton
                  color="primary"
                  onClick={handleAddDomain}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsAdding(false);
                    setNewDomain({ url: '', domain_type: 'admin', permissions: [] });
                  }}
                >
                  취소
                </Button>
              </Box>
              
              {newDomain.domain_type === 'admin' && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>접속 가능 단계 선택:</Typography>
                  {agentLevels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      에이전트 레벨 데이터를 불러오는 중...
                    </Typography>
                  ) : (
                    <FormGroup row>
                      {agentLevels.map(level => {
                        console.log('Rendering level:', level);
                        return (
                          <FormControlLabel
                            key={level.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={newDomain.permissions.includes(level.id)}
                                onChange={() => handlePermissionToggle(level.id)}
                              />
                            }
                            label={level.name || level.levelType || level.level_name || `Level ${level.id}`}
                            sx={{ mr: 2 }}
                          />
                        );
                      })}
                    </FormGroup>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        {/* 도메인 테이블 */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <BaseTable
            columns={columns}
            data={displayData}
            checkable={true}
            checkedItems={checkedItems}
            allChecked={allChecked}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            sx={{
              '& .MuiTableCell-root': {
                borderBottom: '1px solid',
                borderColor: 'divider'
              }
            }}
          />
        </Box>

        {/* 도메인이 없을 때 */}
        {filteredDomains.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              color: 'text.secondary'
            }}
          >
            <Typography variant="body1">
              {searchText ? '검색 결과가 없습니다.' : '등록된 도메인이 없습니다.'}
            </Typography>
          </Box>
        )}
        </>
        )}
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, domain: null })}
      >
        <DialogTitle>도메인 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteDialog.domain?.url}" 도메인을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, domain: null })}>
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
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

export default DomainSettingsPage;