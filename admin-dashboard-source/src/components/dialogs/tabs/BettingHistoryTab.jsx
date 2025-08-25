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
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CasinoIcon from '@mui/icons-material/Casino';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import koLocale from 'date-fns/locale/ko';

const BettingHistoryTab = ({ selectedAgent, formatCurrency }) => {
  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [gameType, setGameType] = useState('all');
  const [betStatus, setBetStatus] = useState('all');
  
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
    console.log('검색:', { searchTerm, startDate, endDate, periodFilter, gameType, betStatus });
    // 실제 구현에서는 API 호출 필요
    setPage(0);
  };
  
  // 샘플 데이터 생성
  const generateSampleData = () => {
    return [...Array(15)].map((_, index) => {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 24 * 7)); // 최근 일주일
      
      const gameTypes = ['슬롯', '카지노', '스포츠', '미니게임'];
      const gameProviders = ['프라그마틱', '에볼루션', '마이크로게이밍', '넷엔트', '플레이테크'];
      const statuses = ['당첨', '낙첨', '진행중', '취소'];
      
      const selectedGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
      const selectedProvider = gameProviders[Math.floor(Math.random() * gameProviders.length)];
      const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const betAmount = Math.floor(Math.random() * 500000) + 10000;
      const winAmount = selectedStatus === '당첨' ? Math.floor(betAmount * (1 + Math.random() * 5)) : 0;
      const profit = winAmount - betAmount;
      
      return {
        id: `bet-${index + 1}`,
        date: date,
        gameType: selectedGameType,
        provider: selectedProvider,
        gameName: `${selectedGameType} 게임 ${index + 1}`,
        betAmount: betAmount,
        winAmount: winAmount,
        profit: profit,
        status: selectedStatus,
        odds: selectedGameType === '스포츠' ? (1.5 + Math.random() * 3).toFixed(2) : null
      };
    });
  };
  
  // 샘플 데이터
  const bettingData = generateSampleData();
  
  // 요약 통계 계산
  const calculateSummary = () => {
    const totalBets = bettingData.length;
    const totalBetAmount = bettingData.reduce((sum, item) => sum + item.betAmount, 0);
    const totalWinAmount = bettingData.reduce((sum, item) => sum + item.winAmount, 0);
    const totalProfit = totalWinAmount - totalBetAmount;
    const winCount = bettingData.filter(item => item.status === '당첨').length;
    const winRate = totalBets > 0 ? ((winCount / totalBets) * 100).toFixed(1) : 0;
    
    return {
      totalBets,
      totalBetAmount,
      totalWinAmount,
      totalProfit,
      winCount,
      winRate
    };
  };
  
  const summary = calculateSummary();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>베팅 내역</Typography>
      
      {/* 요약 통계 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsEsportsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="primary">
                {summary.totalBets}건
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 베팅 건수
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="info.main">
                {formatCurrency ? formatCurrency(summary.totalBetAmount) : summary.totalBetAmount}원
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
              <CasinoIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="success.main">
                {formatCurrency ? formatCurrency(summary.totalWinAmount) : summary.totalWinAmount}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 당첨금액
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDownIcon 
                color={summary.totalProfit >= 0 ? "success" : "error"} 
                sx={{ fontSize: 40, mb: 1 }} 
              />
              <Typography 
                variant="h6" 
                color={summary.totalProfit >= 0 ? "success.main" : "error.main"}
              >
                {formatCurrency ? formatCurrency(Math.abs(summary.totalProfit)) : Math.abs(summary.totalProfit)}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.totalProfit >= 0 ? '총 수익' : '총 손실'} (승률: {summary.winRate}%)
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>베팅 상태</InputLabel>
                <Select
                  value={betStatus}
                  label="베팅 상태"
                  onChange={(e) => setBetStatus(e.target.value)}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="당첨">당첨</MenuItem>
                  <MenuItem value="낙첨">낙첨</MenuItem>
                  <MenuItem value="진행중">진행중</MenuItem>
                  <MenuItem value="취소">취소</MenuItem>
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
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>게임유형</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>제공사</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>게임명</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>베팅금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>당첨금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>손익</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>배당률</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bettingData.map((row) => (
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
                      label={row.gameType} 
                      size="small"
                      color={
                        row.gameType === '슬롯' ? 'primary' :
                        row.gameType === '카지노' ? 'secondary' :
                        row.gameType === '스포츠' ? 'success' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{row.provider}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{row.gameName}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatCurrency ? formatCurrency(row.betAmount) : row.betAmount} 원
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={row.winAmount > 0 ? 'success.main' : 'text.secondary'}>
                      {formatCurrency ? formatCurrency(row.winAmount) : row.winAmount} 원
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color={row.profit > 0 ? 'success.main' : row.profit < 0 ? 'error.main' : 'text.secondary'}
                      sx={{ fontWeight: 'medium' }}
                    >
                      {row.profit > 0 ? '+' : ''}{formatCurrency ? formatCurrency(row.profit) : row.profit} 원
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={
                        row.status === '당첨' ? 'success' :
                        row.status === '낙첨' ? 'error' :
                        row.status === '진행중' ? 'info' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {row.odds ? `${row.odds}배` : '-'}
                    </Typography>
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

export default BettingHistoryTab; 