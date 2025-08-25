import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { PageContainer, PageHeader } from '../../components/baseTemplate/components';
import apiService from '../../services/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MasterIpSettings = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [ipList, setIpList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 마스터 계정 체크
  useEffect(() => {
    if (user?.username !== 'master' && user?.agent_level_id !== 999) {
      alert('마스터 계정만 접근 가능합니다.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // IP 목록 조회
  const fetchIpList = async () => {
    try {
      const response = await apiService.get('/master-ip');
      if (response.data.success) {
        setIpList(response.data.data);
      }
    } catch (error) {
      console.error('IP 목록 조회 실패:', error);
      setError('IP 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로그 조회
  const fetchLogs = async () => {
    try {
      const response = await apiService.get('/master-ip/logs?limit=20');
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('로그 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchIpList();
    fetchLogs();
  }, []);


  // IP 활성화/비활성화 토글
  const handleToggleIp = async (id) => {
    try {
      const response = await apiService.put(`/master-ip/${id}/toggle`);
      if (response.data.success) {
        fetchIpList();
        fetchLogs();
      }
    } catch (error) {
      setError('IP 상태 변경에 실패했습니다.');
    }
  };

  // IP 삭제
  const handleDeleteIp = async (id) => {
    if (!window.confirm('정말로 이 IP를 삭제하시겠습니까?')) return;
    
    try {
      const response = await apiService.delete(`/master-ip/${id}`);
      if (response.data.success) {
        fetchIpList();
        fetchLogs();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'IP 삭제에 실패했습니다.');
    }
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <PageContainer>
      <PageHeader
        title="마스터 IP 관리"
        description="마스터 계정 접속 허용 IP 관리"
        icon={<SecurityIcon />}
      />

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* IP 목록 */}
      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>IP 주소</TableCell>
                <TableCell>설명</TableCell>
                <TableCell align="center">상태</TableCell>
                <TableCell>등록일</TableCell>
                <TableCell>등록자</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ipList.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {ip.ip_address}
                    </Typography>
                  </TableCell>
                  <TableCell>{ip.description || '-'}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={ip.is_active}
                      onChange={() => handleToggleIp(ip.id)}
                      disabled={['127.0.0.1', '::1', 'localhost'].includes(ip.ip_address)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(ip.created_at).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell>{ip.created_by || 'system'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleDeleteIp(ip.id)}
                      disabled={['127.0.0.1', '::1', 'localhost'].includes(ip.ip_address)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 접근 로그 */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>최근 접근 로그</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>액션</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>사용자</TableCell>
                <TableCell>상세</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={
                        log.action === 'LOGIN_SUCCESS' ? 'success' :
                        log.action === 'LOGIN_BLOCKED' ? 'error' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {log.ip_address}
                    </Typography>
                  </TableCell>
                  <TableCell>{log.username || '-'}</TableCell>
                  <TableCell>{log.details || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

    </PageContainer>
  );
};

export default MasterIpSettings;