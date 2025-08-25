import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import apiService from '../../services/api';

const HonorSyncDialog = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  // 동기화 상태 조회
  const fetchSyncStatus = async () => {
    try {
      const response = await apiService.honorSync.getSyncStatus();
      setSyncStatus(response.data.stats);
    } catch (err) {
      console.error('동기화 상태 조회 실패:', err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSyncStatus();
    }
  }, [open]);

  // 전체 회원 동기화
  const handleSyncAll = async () => {
    setLoading(true);
    setError(null);
    setSyncResult(null);

    try {
      const response = await apiService.honorSync.syncAllMembers();
      setSyncResult(response.data.results);
      await fetchSyncStatus(); // 상태 업데이트
    } catch (err) {
      setError(err.response?.data?.error || '동기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSyncResult(null);
      setError(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <CheckCircleIcon color="success" />;
      case 'already_exists':
        return <InfoIcon color="info" />;
      case 'failed':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
        return 'success';
      case 'already_exists':
        return 'info';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SyncIcon />
          Honor API 회원 동기화
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* 현재 동기화 상태 */}
        {syncStatus && !syncResult && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              현재 동기화 상태
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              <Chip 
                label={`전체: ${syncStatus.total}명`} 
                color="default" 
                variant="outlined" 
              />
              <Chip 
                label={`동기화됨: ${syncStatus.synced}명`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`미동기화: ${syncStatus.not_synced}명`} 
                color="warning" 
                variant="outlined" 
              />
              <Chip 
                label={`실패: ${syncStatus.failed}명`} 
                color="error" 
                variant="outlined" 
              />
            </Box>
            
            <Box display="flex" gap={2} flexWrap="wrap">
              <Typography variant="body2" color="textSecondary">
                총 보유금액: {(syncStatus.totalBalance || 0).toLocaleString()}원
              </Typography>
              <Typography variant="body2" color="textSecondary">
                총 게임머니: {(syncStatus.totalGameMoney || 0).toLocaleString()}원
              </Typography>
              <Typography variant="body2" color="primary">
                API 총 잔액: {(syncStatus.apiTotalBalance || 0).toLocaleString()}원
              </Typography>
            </Box>
          </Box>
        )}

        {/* 동기화 진행 중 */}
        {loading && (
          <Box textAlign="center" py={3}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="textSecondary" mt={2}>
              회원 동기화가 진행 중입니다...
            </Typography>
            <Typography variant="caption" color="textSecondary">
              회원 수에 따라 시간이 걸릴 수 있습니다.
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 동기화 결과 */}
        {syncResult && (
          <Box>
            <Typography variant="h6" gutterBottom>
              동기화 결과
            </Typography>
            
            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
              <Chip 
                label={`전체: ${syncResult.total}명`} 
                color="default" 
              />
              <Chip 
                label={`성공: ${syncResult.success}명`} 
                color="success" 
              />
              <Chip 
                label={`이미 존재: ${syncResult.alreadyExists}명`} 
                color="info" 
              />
              <Chip 
                label={`실패: ${syncResult.failed}명`} 
                color="error" 
              />
            </Box>

            {/* 상세 결과 (최대 10개만 표시) */}
            {syncResult.details && syncResult.details.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  상세 내역 (최근 10건)
                </Typography>
                <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {syncResult.details.slice(0, 10).map((detail, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getStatusIcon(detail.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={detail.username}
                        secondary={detail.message}
                      />
                      <Chip 
                        label={detail.status} 
                        size="small" 
                        color={getStatusColor(detail.status)}
                      />
                    </ListItem>
                  ))}
                </List>
                {syncResult.details.length > 10 && (
                  <Typography variant="caption" color="textSecondary" align="center" display="block">
                    ... 외 {syncResult.details.length - 10}건
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* 안내 메시지 */}
        {!loading && !syncResult && (
          <Alert severity="info" sx={{ mt: 2 }}>
            회원 동기화를 실행하면 현재 시스템의 모든 회원이 Honor API에 등록됩니다.
            <br />
            이미 등록된 회원은 건너뛰고, 신규 회원만 등록됩니다.
            <br />
            <strong>주의: 회원의 보유금액은 자동으로 이전되지 않습니다.</strong>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {!loading && !syncResult && (
          <>
            <Button onClick={handleClose} color="inherit">
              취소
            </Button>
            <Button 
              onClick={handleSyncAll} 
              variant="contained" 
              color="primary"
              startIcon={<SyncIcon />}
              disabled={syncStatus && syncStatus.not_synced === 0}
            >
              전체 회원 동기화
            </Button>
          </>
        )}
        
        {syncResult && (
          <Button onClick={handleClose} variant="contained">
            확인
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HonorSyncDialog;