import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  ButtonGroup,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import koLocale from 'date-fns/locale/ko';

const RollingPaymentTab = ({ selectedAgent, formatCurrency }) => {
  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [gameType, setGameType] = useState('all');
  
  // 페이지 변경 핸들러
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // 페이지당 행 수 변경 핸들러
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // 기간 필터 핸들러
  const handlePeriodChange = (period) => {
    setPeriodFilter(period);
    const today = new Date();
    let start = new Date();
    
    switch(period) {
      case 'daily':
        // 오늘
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'weekly':
        // 이번 주 (일요일부터)
        const day = today.getDay();
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day);
        break;
      case 'monthly':
        // 이번 달
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        break;
    }
    
    setStartDate(start);
    setEndDate(today);
  };
  
  // 검색 핸들러
  const handleSearch = () => {
    console.log('검색:', { searchTerm, startDate, endDate, periodFilter, gameType });
    // 실제 구현에서는 API 호출 필요
    setPage(0);
  };
  
  // 샘플 데이터 생성
  const generateSampleData = () => {
    return [...Array(10)].map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      
      const gameTypes = ['슬롯', '카지노', '스포츠', '미니게임'];
      const selectedGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
      
      const bettingAmount = Math.floor(Math.random() * 5000000);
      const rollingRate = (Math.random() * 2).toFixed(2);
      const rollingAmount = Math.floor(bettingAmount * (rollingRate / 100));
      
      return {
        id: `rolling-${index + 1}`,
        date: date,
        gameType: selectedGameType,
        bettingAmount: bettingAmount,
        rollingRate: parseFloat(rollingRate),
        rollingAmount: rollingAmount,
        status: Math.random() > 0.2 ? '지급완료' : '대기중',
        paymentDate: Math.random() > 0.2 ? new Date(date.getTime() + 24 * 60 * 60 * 1000) : null
      };
    });
  };
  
  // 샘플 데이터
  const rollingData = generateSampleData();
  
  // 요약 통계 계산
  const calculateSummary = () => {
    const totalBetting = rollingData.reduce((sum, item) => sum + item.bettingAmount, 0);
    const totalRolling = rollingData.reduce((sum, item) => sum + item.rollingAmount, 0);
    const completedCount = rollingData.filter(item => item.status === '지급완료').length;
    const pendingCount = rollingData.filter(item => item.status === '대기중').length;
    
    return {
      totalBetting,
      totalRolling,
      completedCount,
      pendingCount,
      averageRate: rollingData.length > 0 ? (totalRolling / totalBetting * 100).toFixed(2) : 0
    };
  };
  
  const summary = calculateSummary();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>롤링/정산 내역</Typography>
      
      {/* 요약 통계 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="primary">
                {formatCurrency ? formatCurrency(summary.totalBetting) : summary.totalBetting}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 베팅금액
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalanceIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="success.main">
                {formatCurrency ? formatCurrency((selectedAgent?.rolling_slot_amount || 0) + (selectedAgent?.rolling_casino_amount || 0)) : ((selectedAgent?.rolling_slot_amount || 0) + (selectedAgent?.rolling_casino_amount || 0))}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 롤링금액
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDownIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="warning.main">
                {summary.averageRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                평균 롤링율
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Chip label={`완료: ${summary.completedCount}`} color="success" size="small" />
                <Chip label={`대기: ${summary.pendingCount}`} color="warning" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                처리 현황
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper elevation={1} sx={{ p: 2 }}>
        {/* 검색 및 필터 */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="검색어 입력"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>게임 유형</InputLabel>
                <Select
                  value={gameType}
                  label="게임 유형"
                  onChange={(e) => setGameType(e.target.value)}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="슬롯">슬롯</MenuItem>
                  <MenuItem value="카지노">카지노</MenuItem>
                  <MenuItem value="스포츠">스포츠</MenuItem>
                  <MenuItem value="미니게임">미니게임</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DatePicker
                    label="시작일"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <Box sx={{ mx: 1 }}>~</Box>
                  <DatePicker
                    label="종료일"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ ml: 1 }}
                    onClick={handleSearch}
                  >
                    검색
                  </Button>
                </Box>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <ButtonGroup variant="outlined" size="small" fullWidth>
                <Button 
                  onClick={() => handlePeriodChange('daily')}
                  variant={periodFilter === 'daily' ? 'contained' : 'outlined'}
                >
                  일별
                </Button>
                <Button 
                  onClick={() => handlePeriodChange('weekly')}
                  variant={periodFilter === 'weekly' ? 'contained' : 'outlined'}
                >
                  주별
                </Button>
                <Button 
                  onClick={() => handlePeriodChange('monthly')}
                  variant={periodFilter === 'monthly' ? 'contained' : 'outlined'}
                >
                  월별
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>날짜</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>게임유형</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>베팅금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>롤링율</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>롤링금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>지급일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rollingData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center">{row.date.toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.gameType} 
                      size="small"
                      color={
                        row.gameType === '슬롯' ? 'primary' :
                        row.gameType === '카지노' ? 'secondary' :
                        row.gameType === '스포츠' ? 'success' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">{formatCurrency ? formatCurrency(row.bettingAmount) : row.bettingAmount} 원</TableCell>
                  <TableCell align="center">{row.rollingRate}%</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                    {formatCurrency ? formatCurrency(row.rollingAmount) : row.rollingAmount} 원
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={row.status === '지급완료' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.paymentDate ? row.paymentDate.toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={100}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};

export default RollingPaymentTab; 