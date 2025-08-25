import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Alert,
  Chip,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import apiService from '../../services/api';

const HonorBalanceMonitor = ({ userId, autoRefresh = false }) => {
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // 잔액 정보 조회
  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get(`/api/honor-monitoring/balance/gaming/${userId}`);
      setBalanceData(response.data);
    } catch (err) {
      console.error('잔액 조회 오류:', err);
      setError('잔액 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 실시간 동기화
  const syncBalance = async () => {
    try {
      setSyncing(true);
      setError(null);

      await apiService.post(`/api/honor-monitoring/balance/sync/${userId}`);
      
      // 동기화 후 잔액 다시 조회
      await fetchBalanceData();
    } catch (err) {
      console.error('잔액 동기화 오류:', err);
      setError('잔액 동기화에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  // 잔액 검증 및 수정
  const validateBalance = async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await apiService.post(`/api/honor-monitoring/balance/validate/${userId}`);
      
      if (response.data.fixed) {
        setError('잔액 불일치가 감지되어 수정되었습니다.');
      }
      
      // 검증 후 잔액 다시 조회
      await fetchBalanceData();
    } catch (err) {
      console.error('잔액 검증 오류:', err);
      setError('잔액 검증에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBalanceData();
    }
  }, [userId]);

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh && userId) {
      const interval = setInterval(fetchBalanceData, 30000); // 30초마다
      return () => clearInterval(interval);
    }
  }, [autoRefresh, userId]);

  if (loading && !balanceData) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Honor 잔액 모니터링</Typography>
          <Box>
            <Tooltip title="새로고침">
              <IconButton onClick={fetchBalanceData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="실시간 동기화">
              <IconButton onClick={syncBalance} disabled={syncing}>
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {balanceData && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Honor 잔액
                </Typography>
                <Typography variant="h4" color="primary">
                  {balanceData.currentBalance?.toLocaleString() || 0}원
                </Typography>
                {balanceData.lastSync && (
                  <Typography variant="caption" color="textSecondary">
                    마지막 동기화: {new Date(balanceData.lastSync).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  최근 활동 (5분)
                </Typography>
                <Box mt={1}>
                  <Chip 
                    label={`베팅: ${balanceData.recentActivity?.betTotal?.toLocaleString() || 0}원`}
                    color="error"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`당첨: ${balanceData.recentActivity?.winTotal?.toLocaleString() || 0}원`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  순손익: {balanceData.recentActivity?.netChange > 0 ? '+' : ''}
                  {balanceData.recentActivity?.netChange?.toLocaleString() || 0}원
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  동기화 상태
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                  {syncing ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography>동기화 중...</Typography>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography color="success.main">정상</Typography>
                    </>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={validateBalance}
                  disabled={syncing}
                  sx={{ mt: 1 }}
                >
                  잔액 검증
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default HonorBalanceMonitor;