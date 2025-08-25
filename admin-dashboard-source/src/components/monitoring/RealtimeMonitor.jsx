import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  ShowChart as ChartIcon
} from '@mui/icons-material';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const RealtimeMonitor = () => {
  const { socketService } = useSocket();
  const [metrics, setMetrics] = useState({
    system: {},
    database: {},
    api: {},
    users: {},
    performance: {}
  });
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // 실시간 메트릭 수신
    const handleMetrics = (data) => {
      setMetrics(data.metrics);
      setLastUpdate(new Date());
    };

    // 실시간 알림 수신
    const handleAlert = (data) => {
      setAlerts(prev => [{
        ...data,
        id: Date.now(),
        timestamp: new Date()
      }, ...prev].slice(0, 10)); // 최근 10개만 유지
    };

    socketService.on('monitoring:metrics', handleMetrics);
    socketService.on('monitoring:alert', handleAlert);

    return () => {
      socketService.off('monitoring:metrics', handleMetrics);
      socketService.off('monitoring:alert', handleAlert);
    };
  }, [socketService]);

  const getProgressColor = (value, threshold) => {
    if (value >= threshold) return 'error';
    if (value >= threshold * 0.8) return 'warning';
    return 'success';
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}일 ${hours}시간 ${minutes}분`;
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          실시간 시스템 모니터링
        </Typography>
        <Box>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
              마지막 업데이트: {format(lastUpdate, 'HH:mm:ss', { locale: ko })}
            </Typography>
          )}
          <Tooltip title="새로고침">
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 시스템 메트릭 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                시스템 리소스
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  CPU 사용률
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.system?.cpuUsage || 0}
                    color={getProgressColor(metrics.system?.cpuUsage || 0, 80)}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ ml: 2, minWidth: 50 }}>
                    {metrics.system?.cpuUsage || 0}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  메모리 사용률
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.system?.memoryUsage || 0}
                    color={getProgressColor(metrics.system?.memoryUsage || 0, 85)}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ ml: 2, minWidth: 50 }}>
                    {metrics.system?.memoryUsage || 0}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {metrics.system?.usedMemory || 0} MB / {metrics.system?.totalMemory || 0} MB
                </Typography>
              </Box>

              {metrics.system?.uptime && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    시스템 가동 시간: {formatUptime(metrics.system.uptime)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 데이터베이스 메트릭 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                데이터베이스
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  연결 사용률
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.database?.connectionUsage || 0}
                    color={getProgressColor(metrics.database?.connectionUsage || 0, 80)}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ ml: 2, minWidth: 50 }}>
                    {metrics.database?.connectionUsage || 0}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {metrics.database?.currentConnections || 0} / {metrics.database?.maxConnections || 0} 연결
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    총 쿼리 수
                  </Typography>
                  <Typography variant="h6">
                    {(metrics.database?.totalQueries || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    느린 쿼리
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {(metrics.database?.slowQueries || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  데이터베이스 크기: {Math.round(metrics.database?.databaseSize || 0)} MB
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 사용자 활동 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NetworkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                사용자 활동
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                    <Typography variant="h4" color="primary.contrastText">
                      {metrics.users?.activeUsers || 0}
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      현재 활성 사용자
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="h4" color="success.contrastText">
                      {metrics.users?.todayLogins || 0}
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      오늘 로그인
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {metrics.performance?.socketConnections !== undefined && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    WebSocket 연결: {metrics.performance.socketConnections}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 성능 메트릭 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                애플리케이션 성능
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    힙 메모리 사용
                  </Typography>
                  <Typography variant="h6">
                    {metrics.performance?.heapUsed || 0} MB
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / {metrics.performance?.heapTotal || 0} MB
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    이벤트 루프 지연
                  </Typography>
                  <Typography variant="h6" color={
                    (metrics.performance?.eventLoopDelay || 0) > 100 ? 'error' : 'success'
                  }>
                    {metrics.performance?.eventLoopDelay || 0} ms
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 실시간 알림 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                실시간 알림
              </Typography>
              
              <List>
                {alerts.length === 0 ? (
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="시스템이 정상 작동 중입니다"
                      secondary="현재 활성 알림이 없습니다"
                    />
                  </ListItem>
                ) : (
                  alerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon>
                          {getAlertIcon(alert.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.type.replace(/_/g, ' ').toUpperCase()}
                          secondary={
                            <>
                              {JSON.stringify(alert.details)}
                              <br />
                              {format(alert.timestamp, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                            </>
                          }
                        />
                        <Chip 
                          label={alert.severity} 
                          size="small"
                          color={
                            alert.severity === 'critical' ? 'error' :
                            alert.severity === 'warning' ? 'warning' : 'info'
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealtimeMonitor;