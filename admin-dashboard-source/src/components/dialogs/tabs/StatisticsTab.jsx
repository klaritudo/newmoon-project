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
  TextField,
  InputAdornment,
  IconButton,
  ButtonGroup,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import koLocale from 'date-fns/locale/ko';

const StatisticsTab = ({ selectedAgent, formatCurrency }) => {
  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('daily');
  
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
    console.log('검색:', { searchTerm, startDate, endDate, periodFilter });
    // 실제 구현에서는 API 호출 필요
    setPage(0);
  };
  
  // 샘플 데이터 생성
  const generateSampleData = () => {
    return [...Array(10)].map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      
      const deposit = Math.floor(Math.random() * 2000000);
      const withdraw = Math.floor(Math.random() * 1500000);
      const depositProfit = deposit - withdraw;
      
      const betting = Math.floor(Math.random() * 3000000);
      const winning = Math.floor(betting * (0.7 + Math.random() * 0.6));
      const bettingProfit = winning - betting;
      
      const rolling = Math.floor(Math.random() * 500000);
      const balance = Math.floor(Math.random() * 10000000);
      
      return {
        id: `stat-${index + 1}`,
        date: date,
        deposit: deposit,
        withdraw: withdraw,
        depositProfit: depositProfit,
        betting: betting,
        winning: winning,
        bettingProfit: bettingProfit,
        rolling: rolling,
        balance: balance
      };
    });
  };
  
  // 샘플 데이터
  const statisticsData = generateSampleData();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>종합 통계</Typography>
      
      <Paper elevation={1} sx={{ p: 2 }}>
        {/* 검색 및 필터 */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={6}>
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
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>입금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>출금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>입출금 손익</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>베팅액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>당첨액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>베팅 손익</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>롤링액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>보유금액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statisticsData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center">{row.date.toLocaleDateString()}</TableCell>
                  <TableCell align="center">{formatCurrency(row.deposit)} 원</TableCell>
                  <TableCell align="center">{formatCurrency(row.withdraw)} 원</TableCell>
                  <TableCell align="center" sx={{ 
                    color: row.depositProfit >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}>
                    {formatCurrency(Math.abs(row.depositProfit))} {row.depositProfit >= 0 ? '원' : '원 손실'}
                  </TableCell>
                  <TableCell align="center">{formatCurrency(row.betting)} 원</TableCell>
                  <TableCell align="center">{formatCurrency(row.winning)} 원</TableCell>
                  <TableCell align="center" sx={{ 
                    color: row.bettingProfit >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}>
                    {formatCurrency(Math.abs(row.bettingProfit))} {row.bettingProfit >= 0 ? '원' : '원 손실'}
                  </TableCell>
                  <TableCell align="center">{formatCurrency(row.rolling)} 원</TableCell>
                  <TableCell align="center">{formatCurrency(row.balance)} 원</TableCell>
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

export default StatisticsTab; 