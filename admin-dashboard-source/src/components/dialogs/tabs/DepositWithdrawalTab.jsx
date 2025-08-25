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
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PendingIcon from '@mui/icons-material/Pending';
import koLocale from 'date-fns/locale/ko';

const DepositWithdrawalTab = ({ selectedAgent, formatCurrency }) => {
  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [transactionType, setTransactionType] = useState('all');
  const [status, setStatus] = useState('all');
  
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
    console.log('검색:', { searchTerm, startDate, endDate, periodFilter, transactionType, status });
    // 실제 구현에서는 API 호출 필요
    setPage(0);
  };
  
  // 샘플 데이터 생성
  const generateSampleData = () => {
    return [...Array(12)].map((_, index) => {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 24 * 30)); // 최근 한 달
      
      const types = ['입금', '출금'];
      const statuses = ['완료', '대기중', '취소', '실패'];
      const methods = ['계좌이체', '무통장입금', '카드결제', '전자지갑'];
      
      const selectedType = types[Math.floor(Math.random() * types.length)];
      const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const selectedMethod = methods[Math.floor(Math.random() * methods.length)];
      
      const amount = Math.floor(Math.random() * 2000000) + 50000;
      const fee = selectedType === '출금' ? Math.floor(amount * 0.01) : 0;
      const actualAmount = selectedType === '출금' ? amount - fee : amount;
      
      return {
        id: `transaction-${index + 1}`,
        date: date,
        type: selectedType,
        amount: amount,
        fee: fee,
        actualAmount: actualAmount,
        method: selectedMethod,
        status: selectedStatus,
        bankName: '국민은행',
        accountNumber: '123-456-789012',
        accountHolder: selectedAgent?.username || 'user123',
        memo: `${selectedType} 요청 ${index + 1}`,
        processedAt: selectedStatus === '완료' ? new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null
      };
    });
  };
  
  // 샘플 데이터
  const transactionData = generateSampleData();
  
  // 요약 통계 계산
  const calculateSummary = () => {
    const deposits = transactionData.filter(item => item.type === '입금');
    const withdrawals = transactionData.filter(item => item.type === '출금');
    
    const totalDeposits = deposits.reduce((sum, item) => sum + (item.status === '완료' ? item.amount : 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, item) => sum + (item.status === '완료' ? item.actualAmount : 0), 0);
    const pendingDeposits = deposits.filter(item => item.status === '대기중').length;
    const pendingWithdrawals = withdrawals.filter(item => item.status === '대기중').length;
    
    return {
      totalDeposits,
      totalWithdrawals,
      netAmount: totalDeposits - totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      totalTransactions: transactionData.length
    };
  };
  
  const summary = calculateSummary();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>입출금 내역</Typography>
      
      {/* 요약 통계 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="success.main">
                {formatCurrency ? formatCurrency(summary.totalDeposits) : summary.totalDeposits}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 입금액
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDownIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="error.main">
                {formatCurrency ? formatCurrency(summary.totalWithdrawals) : summary.totalWithdrawals}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 출금액
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalanceIcon 
                color={summary.netAmount >= 0 ? "primary" : "warning"} 
                sx={{ fontSize: 40, mb: 1 }} 
              />
              <Typography 
                variant="h6" 
                color={summary.netAmount >= 0 ? "primary.main" : "warning.main"}
              >
                {formatCurrency ? formatCurrency(Math.abs(summary.netAmount)) : Math.abs(summary.netAmount)}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.netAmount >= 0 ? '순 입금액' : '순 출금액'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Chip label={`입금: ${summary.pendingDeposits}`} color="success" size="small" />
                <Chip label={`출금: ${summary.pendingWithdrawals}`} color="error" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                대기중 건수
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper elevation={1} sx={{ p: 2 }}>
        {/* 검색 및 필터 */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
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
                <InputLabel>거래 유형</InputLabel>
                <Select
                  value={transactionType}
                  label="거래 유형"
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="입금">입금</MenuItem>
                  <MenuItem value="출금">출금</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>처리 상태</InputLabel>
                <Select
                  value={status}
                  label="처리 상태"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                  <MenuItem value="대기중">대기중</MenuItem>
                  <MenuItem value="취소">취소</MenuItem>
                  <MenuItem value="실패">실패</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
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
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>날짜/시간</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>구분</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>수수료</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>실제금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>결제방법</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>계좌정보</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>처리일시</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {row.date.toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.date.toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.type} 
                      size="small"
                      color={row.type === '입금' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency ? formatCurrency(row.amount) : row.amount} 원
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={row.fee > 0 ? 'warning.main' : 'text.secondary'}>
                      {row.fee > 0 ? `${formatCurrency ? formatCurrency(row.fee) : row.fee} 원` : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium',
                        color: row.type === '입금' ? 'success.main' : 'error.main'
                      }}
                    >
                      {formatCurrency ? formatCurrency(row.actualAmount) : row.actualAmount} 원
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{row.method}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {row.bankName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.accountNumber}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={
                        row.status === '완료' ? 'success' :
                        row.status === '대기중' ? 'warning' :
                        row.status === '취소' ? 'default' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.processedAt ? (
                      <>
                        <Typography variant="body2">
                          {row.processedAt.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.processedAt.toLocaleTimeString()}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
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

export default DepositWithdrawalTab; 