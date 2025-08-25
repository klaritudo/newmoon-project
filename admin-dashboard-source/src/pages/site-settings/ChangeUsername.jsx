import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon, 
  SwapHoriz as SwapIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const ChangeUsername = () => {
  // 상태 관리
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 접속자 리스트 및 미접속 아이디 상태
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [selectedOfflineUsers, setSelectedOfflineUsers] = useState({});
  
  // 컴포넌트 마운트 시 접속자 및 미접속자 데이터 로드
  useEffect(() => {
    // 실제 구현에서는 API 호출로 대체
    // 여기서는 예시 데이터 사용
    const mockOnlineUsers = [
      { id: 1, username: 'user1', nickname: '유저1', level: 6, levelName: '회원', loginTime: '2023-03-10 09:30:45', ipAddress: '192.168.1.101' },
      { id: 2, username: 'user2', nickname: '유저2', level: 6, levelName: '회원', loginTime: '2023-03-10 10:15:22', ipAddress: '192.168.1.102' },
      { id: 3, username: 'user3', nickname: '유저3', level: 6, levelName: '회원', loginTime: '2023-03-10 11:05:18', ipAddress: '192.168.1.103' },
      { id: 4, username: 'user4', nickname: '유저4', level: 6, levelName: '회원', loginTime: '2023-03-10 11:45:33', ipAddress: '192.168.1.104' },
      { id: 5, username: 'user5', nickname: '유저5', level: 6, levelName: '회원', loginTime: '2023-03-10 12:20:10', ipAddress: '192.168.1.105' }
    ];
    
    const mockOfflineUsers = [
      { id: 6, username: 'user6', nickname: '유저6', level: 6, levelName: '회원' },
      { id: 7, username: 'user7', nickname: '유저7', level: 6, levelName: '회원' },
      { id: 8, username: 'user8', nickname: '유저8', level: 6, levelName: '회원' },
      { id: 9, username: 'user9', nickname: '유저9', level: 6, levelName: '회원' },
      { id: 10, username: 'user10', nickname: '유저10', level: 6, levelName: '회원' },
      { id: 11, username: 'user11', nickname: '유저11', level: 6, levelName: '회원' },
      { id: 12, username: 'user12', nickname: '유저12', level: 6, levelName: '회원' },
      { id: 13, username: 'user13', nickname: '유저13', level: 6, levelName: '회원' },
      { id: 14, username: 'user14', nickname: '유저14', level: 6, levelName: '회원' },
      { id: 15, username: 'user15', nickname: '유저15', level: 6, levelName: '회원' }
    ];
    
    setOnlineUsers(mockOnlineUsers);
    setOfflineUsers(mockOfflineUsers);
    
    // 선택된 미접속 아이디 초기화
    const initialSelectedOfflineUsers = {};
    mockOnlineUsers.forEach(user => {
      initialSelectedOfflineUsers[user.id] = null;
    });
    setSelectedOfflineUsers(initialSelectedOfflineUsers);
  }, []);

  // 스낵바 닫기
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // 미접속 아이디 선택 핸들러
  const handleOfflineUserSelect = (onlineUserId, offlineUser) => {
    setSelectedOfflineUsers({
      ...selectedOfflineUsers,
      [onlineUserId]: offlineUser
    });
  };
  
  // 아이디 변경 일괄 처리 핸들러
  const handleBulkChangeUsername = () => {
    // 선택된 미접속 아이디가 있는지 확인
    const hasSelectedUsers = Object.values(selectedOfflineUsers).some(user => user !== null);
    
    if (!hasSelectedUsers) {
      setSnackbar({
        open: true,
        message: '변경할 아이디를 선택해주세요.',
        severity: 'error'
      });
      return;
    }
    
    // 실제 구현에서는 API 호출로 대체
    // 성공 시 스낵바 표시
    const changedCount = Object.values(selectedOfflineUsers).filter(user => user !== null).length;
    
    setSnackbar({
      open: true,
      message: `${changedCount}개의 아이디가 성공적으로 변경되었습니다.`,
      severity: 'success'
    });
    
    // 선택된 미접속 아이디 초기화
    const resetSelectedOfflineUsers = {};
    onlineUsers.forEach(user => {
      resetSelectedOfflineUsers[user.id] = null;
    });
    setSelectedOfflineUsers(resetSelectedOfflineUsers);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        아이디바꿔주기
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        회원의 아이디를 변경할 수 있습니다. 아이디 변경 시 기존 데이터는 유지됩니다.
      </Typography>
      
      {/* 접속자 리스트 및 아이디 변경 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              접속자 아이디 변경
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="info" sx={{ mb: 1 }}>
              현재 접속 중인 회원의 아이디를 미접속 아이디로 변경할 수 있습니다.
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>No</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>아이디</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>닉네임</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>레벨</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>접속시간</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>IP 주소</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>변경할 아이디</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {onlineUsers.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{user.username}</TableCell>
                      <TableCell align="center">{user.nickname}</TableCell>
                      <TableCell align="center">{user.levelName} (Lv.{user.level})</TableCell>
                      <TableCell align="center">{user.loginTime}</TableCell>
                      <TableCell align="center">{user.ipAddress}</TableCell>
                      <TableCell align="center" sx={{ minWidth: 250 }}>
                        <Autocomplete
                          value={selectedOfflineUsers[user.id]}
                          onChange={(event, newValue) => handleOfflineUserSelect(user.id, newValue)}
                          options={offlineUsers}
                          getOptionLabel={(option) => `${option.username} (${option.nickname})`}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder="아이디 선택" 
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option.id === value?.id}
                          noOptionsText="일치하는 아이디가 없습니다"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {selectedOfflineUsers[user.id] ? (
                          <Tooltip title="변경 예정">
                            <Chip 
                              icon={<CheckCircleIcon />} 
                              label="변경 예정" 
                              color="success" 
                              size="small" 
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="미선택">
                            <Chip 
                              icon={<CancelIcon />} 
                              label="미선택" 
                              color="inherit" 
                              size="small" 
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={11.6} sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBulkChangeUsername}
              startIcon={<SwapIcon />}
            >
              아이디 변경하기
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangeUsername; 