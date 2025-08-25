import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon, 
  ArrowUpward as ArrowUpwardIcon, 
  ArrowDownward as ArrowDownwardIcon, 
  Close as CloseIcon,
  Sort as SortIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import '../../../styles/dashboard-tables.css';

// 회원 롤링 데이터
const rollingSummaryData = {
  totalMembers: 1250,
  activeRollings: 867,
  todaysTransactions: 342,
  totalAmount: '₩324,580,000'
};

// 샘플 데이터
const members = [
  { 
    id: 'user1001', 
    nickname: '강백호',
    level: 'VIP',
    loginTime: '2023-05-20 14:30:25', 
    isOnline: true,
    rollingAmount: 18500000, 
    convertedRollingAmount: 12500000,
    totalRollingAmount: 31000000,
    totalTransactions: 87,
    lastTransaction: '2023-05-20 15:42:18' 
  },
  { 
    id: 'user1002', 
    nickname: '서태웅',
    level: '골드',
    loginTime: '2023-05-20 12:15:40', 
    isOnline: true,
    rollingAmount: 7650000, 
    convertedRollingAmount: 5200000,
    totalRollingAmount: 12850000,
    totalTransactions: 42,
    lastTransaction: '2023-05-20 14:30:52' 
  },
  { 
    id: 'user1003', 
    nickname: '채치수',
    level: '골드',
    loginTime: '2023-05-20 10:08:33', 
    isOnline: false,
    rollingAmount: 5230000, 
    convertedRollingAmount: 3800000,
    totalRollingAmount: 9030000,
    totalTransactions: 31,
    lastTransaction: '2023-05-20 11:42:05' 
  },
  { 
    id: 'user1004', 
    nickname: '정대만',
    level: '실버',
    loginTime: '2023-05-20 16:45:12', 
    isOnline: true,
    rollingAmount: 3180000, 
    convertedRollingAmount: 2100000,
    totalRollingAmount: 5280000,
    totalTransactions: 24,
    lastTransaction: '2023-05-20 17:20:11' 
  },
  { 
    id: 'user1005', 
    nickname: '송태섭',
    level: '실버',
    loginTime: '2023-05-20 11:30:15', 
    isOnline: false,
    rollingAmount: 1950000, 
    convertedRollingAmount: 1200000,
    totalRollingAmount: 3150000,
    totalTransactions: 18,
    lastTransaction: '2023-05-20 13:15:40' 
  },
  { 
    id: 'user1006', 
    nickname: '이정환',
    level: 'VIP',
    loginTime: '2023-05-20 09:22:18', 
    isOnline: true,
    rollingAmount: 12450000, 
    convertedRollingAmount: 8300000,
    totalRollingAmount: 20750000,
    totalTransactions: 56,
    lastTransaction: '2023-05-20 12:34:27' 
  },
  { 
    id: 'user1007', 
    nickname: '김민재',
    level: '골드',
    loginTime: '2023-05-20 10:45:33', 
    isOnline: true,
    rollingAmount: 8730000, 
    convertedRollingAmount: 6100000,
    totalRollingAmount: 14830000,
    totalTransactions: 47,
    lastTransaction: '2023-05-20 15:18:09' 
  },
  { 
    id: 'user1008', 
    nickname: '이승우',
    level: '실버',
    loginTime: '2023-05-20 13:12:54', 
    isOnline: false,
    rollingAmount: 2850000, 
    convertedRollingAmount: 1900000,
    totalRollingAmount: 4750000,
    totalTransactions: 21,
    lastTransaction: '2023-05-20 14:05:32' 
  },
  { 
    id: 'user1009', 
    nickname: '김연아',
    level: 'VIP',
    loginTime: '2023-05-20 09:15:22', 
    isOnline: true,
    rollingAmount: 15800000, 
    convertedRollingAmount: 10500000,
    totalRollingAmount: 26300000,
    totalTransactions: 64,
    lastTransaction: '2023-05-20 11:45:38' 
  },
  { 
    id: 'user1010', 
    nickname: '박지성',
    level: '골드',
    loginTime: '2023-05-20 10:33:17', 
    isOnline: false,
    rollingAmount: 6420000, 
    convertedRollingAmount: 4300000,
    totalRollingAmount: 10720000,
    totalTransactions: 39,
    lastTransaction: '2023-05-20 13:27:41' 
  },
  { 
    id: 'user1011', 
    nickname: '손흥민',
    level: 'VIP',
    loginTime: '2023-05-20 11:45:08', 
    isOnline: true,
    rollingAmount: 19350000, 
    convertedRollingAmount: 13200000,
    totalRollingAmount: 32550000,
    totalTransactions: 92,
    lastTransaction: '2023-05-20 14:52:19' 
  },
  { 
    id: 'user1012', 
    nickname: '이강인',
    level: '실버',
    loginTime: '2023-05-20 13:24:56', 
    isOnline: true,
    rollingAmount: 3210000, 
    convertedRollingAmount: 2100000,
    totalRollingAmount: 5310000,
    totalTransactions: 24,
    lastTransaction: '2023-05-20 15:37:02' 
  }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
    .format(amount)
    .replace('₩', '₩ ');
};

const RollingStatusTable = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members);
  const [selectedMember, setSelectedMember] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [sortColumn, setSortColumn] = useState('rollingAmount');
  const [sortDirection, setSortDirection] = useState('desc');
  const [periodFilter, setPeriodFilter] = useState('total'); // 'today', 'month', 'total'
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const isSmallScreen = useMediaQuery('(max-width:1000px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:700px)');
  
  const rowsPerPage = 5;

  // 검색 및 필터링
  useEffect(() => {
    let filtered = members;
    
    // 검색 필터링
    if (searchText) {
      filtered = filtered.filter(member => 
        member.nickname.toLowerCase().includes(searchText.toLowerCase()) || 
        member.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 기간 필터링 (실제 구현에서는 날짜 기반 필터링 로직이 들어갈 수 있음)
    // 여기서는 샘플 데이터이므로 필터링 효과만 보여주기 위한 간단한 로직 적용
    if (periodFilter === 'today') {
      // 당일 데이터만 필터링 (예시: 롤링 금액의 30%만 표시)
      filtered = filtered.map(member => ({
        ...member,
        rollingAmount: Math.round(member.rollingAmount * 0.3),
        convertedRollingAmount: Math.round(member.convertedRollingAmount * 0.3),
        totalRollingAmount: Math.round(member.totalRollingAmount * 0.3)
      }));
    } else if (periodFilter === 'month') {
      // 당월 데이터만 필터링 (예시: 롤링 금액의 70%만 표시)
      filtered = filtered.map(member => ({
        ...member,
        rollingAmount: Math.round(member.rollingAmount * 0.7),
        convertedRollingAmount: Math.round(member.convertedRollingAmount * 0.7),
        totalRollingAmount: Math.round(member.totalRollingAmount * 0.7)
      }));
    }
    // 'total'인 경우 모든 데이터 표시 (기본값)
    
    // 정렬
    filtered = [...filtered].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    });
    
    setFilteredMembers(filtered);
  }, [searchText, sortColumn, sortDirection, periodFilter]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleSortChange = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
  };

  // 핸들러 함수 추가
  const handleSettlement = (member) => {
    // 정산 처리 로직
    console.log(`${member.nickname}(${member.id}) 회원 전환 처리`, member);
    // 실제 구현에서는 API 호출 등의 로직이 들어갈 수 있습니다
    alert(`${member.nickname} 회원의 롤링 금액 ${formatCurrency(member.rollingAmount)}이 전환되었습니다.`);
  };

  const handleReset = (member) => {
    // 초기화 처리 로직
    console.log(`${member.nickname}(${member.id}) 회원 리셋 처리`, member);
    // 실제 구현에서는 API 호출 등의 로직이 들어갈 수 있습니다
    alert(`${member.nickname} 회원의 롤링 상태가 리셋되었습니다.`);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodFilterChange = (period) => {
    setPeriodFilter(period);
    handleMenuClose();
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 현재 페이지의 데이터
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // 정렬 방향 아이콘 렌더링
  const renderSortIcon = (column) => {
    if (sortColumn !== column) {
      return <SortIcon fontSize="small" sx={{ opacity: 0.3, ml: 0.5 }} />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUpwardIcon fontSize="small" sx={{ color: '#009ef7', ml: 0.5 }} /> : 
      <ArrowDownwardIcon fontSize="small" sx={{ color: '#009ef7', ml: 0.5 }} />;
  };

  // 행 확장/축소 토글 함수
  const handleToggleRow = (id, event) => {
    event.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Box 
      className="table-root-container" 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box className="table-controls" sx={{ borderBottom: 'none', paddingBottom: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#181c32', fontWeight: 600, fontSize: '1.075rem' }}>
            회원 롤링 상태
          </Typography>
          <Chip 
            label={`${filteredMembers.length}명`}
            size="small"
            sx={{ 
              backgroundColor: '#f1faff', 
              color: '#009ef7',
              height: '22px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            className="search-field"
            placeholder="회원 검색..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#a1a5b7' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="outlined" 
            className="filter-button"
            onClick={handleMenuOpen}
            startIcon={<FilterListIcon fontSize="small" />}
            endIcon={
              <Chip 
                label={periodFilter === 'today' ? '당일' : periodFilter === 'month' ? '당월' : '누적'} 
                size="small" 
                sx={{ 
                  backgroundColor: '#f1faff', 
                  color: '#009ef7',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    padding: '0 8px',
                    fontSize: '10px'
                  }
                }}
              />
            }
            sx={{ 
              borderColor: '#e4e6ef',
              color: '#7e8299',
              fontSize: '13px',
              '&:hover': {
                backgroundColor: '#f5f8fa',
                borderColor: '#d6d6e0'
              }
            }}
          >
            기간
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '8px',
                boxShadow: '0 0 50px 0 rgba(82, 63, 105, 0.15)',
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  fontSize: '13px',
                  py: 1,
                },
              },
            }}
          >
            <MenuItem onClick={() => handlePeriodFilterChange('today')}>
              당일
            </MenuItem>
            <MenuItem onClick={() => handlePeriodFilterChange('month')}>
              당월
            </MenuItem>
            <MenuItem onClick={() => handlePeriodFilterChange('total')}>
              누적
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* 테이블 컨테이너 */}
      <TableContainer className="table-container" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table className="table-wrapper" size="small">
          <TableHead>
            <TableRow>
              <TableCell className="table-header-cell" onClick={() => handleSortChange('nickname')} sx={{ width: isExtraSmallScreen ? '50%' : isSmallScreen ? '30%' : '25%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>회원</Typography>
                  {renderSortIcon('nickname')}
                </Box>
              </TableCell>
              {!isExtraSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('isOnline')} sx={{ width: '15%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>접속 상태</Typography>
                    {renderSortIcon('isOnline')}
                  </Box>
                </TableCell>
              )}
              <TableCell className="table-header-cell" onClick={() => handleSortChange('rollingAmount')} sx={{ width: isExtraSmallScreen ? '40%' : isSmallScreen ? '30%' : '15%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>롤링 금액</Typography>
                  {renderSortIcon('rollingAmount')}
                </Box>
              </TableCell>
              {!isExtraSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('convertedRollingAmount')} sx={{ width: '15%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>전환롤링금</Typography>
                    {renderSortIcon('convertedRollingAmount')}
                  </Box>
                </TableCell>
              )}
              {!isExtraSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('totalRollingAmount')} sx={{ width: '15%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>총롤링금</Typography>
                    {renderSortIcon('totalRollingAmount')}
                  </Box>
                </TableCell>
              )}
              {!isSmallScreen && (
                <TableCell className="table-header-cell actions" sx={{ width: '15%' }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>액션</Typography>
                </TableCell>
              )}
              {(isSmallScreen || isExtraSmallScreen) && (
                <TableCell className="table-header-cell" sx={{ width: '10%' }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>비고</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <React.Fragment key={member.id}>
                  <TableRow 
                    className="table-row"
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell className="table-cell" sx={{ width: isExtraSmallScreen ? '50%' : isSmallScreen ? '30%' : '25%', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '14px',
                            color: '#181c32',
                            lineHeight: 1.2
                          }}
                        >
                          {member.id}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9e9e9e', 
                            fontSize: '12px',
                            lineHeight: 1.2
                          }}
                        >
                          ({member.nickname})
                        </Typography>
                      </Box>
                    </TableCell>
                    {!isExtraSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: '15%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box className="online-status">
                            <Box 
                              className={`online-status-indicator ${member.isOnline ? 'online' : ''}`}
                            />
                            <Typography 
                              variant="body2" 
                              className={`online-status-text ${member.isOnline ? 'online' : ''}`}
                            >
                              {member.isOnline ? '온라인' : '오프라인'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell className="table-cell" sx={{ width: isExtraSmallScreen ? '40%' : isSmallScreen ? '30%' : '15%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" className="rolling-amount">
                          {formatCurrency(member.rollingAmount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    {!isExtraSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: '15%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" className="converted-rolling-amount">
                            {formatCurrency(member.convertedRollingAmount)}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isExtraSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: '15%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" className="total-rolling-amount">
                            {formatCurrency(member.totalRollingAmount)}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell className="table-cell actions" sx={{ width: '15%' }}>
                        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                          <Button 
                            className="table-action-button view"
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '10px', 
                              padding: '1px 6px',
                              minWidth: '36px',
                              height: '22px',
                              borderColor: '#e4e6ef',
                              color: '#7e8299',
                              '&:hover': {
                                backgroundColor: '#f5f8fa',
                                borderColor: '#d6d6e0'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(member);
                            }}
                          >
                            상세보기
                          </Button>
                        </Box>
                      </TableCell>
                    )}
                    {(isSmallScreen || isExtraSmallScreen) && (
                      <TableCell className="table-cell" sx={{ width: '10%' }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleToggleRow(member.id, e)}
                          sx={{ padding: '4px' }}
                        >
                          {expandedRows[member.id] ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                  {(isSmallScreen || isExtraSmallScreen) && (
                    <TableRow>
                      <TableCell colSpan={isExtraSmallScreen ? 3 : 4} sx={{ padding: 0, border: 'none' }}>
                        <Collapse in={expandedRows[member.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 3, backgroundColor: '#f9f9f9' }}>
                            {isExtraSmallScreen && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#5e6278' }}>
                                  접속 상태:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    className={`online-status-indicator ${member.isOnline ? 'online' : ''}`}
                                    sx={{ marginRight: '4px' }}
                                  />
                                  <Typography 
                                    variant="body2" 
                                    className={`online-status-text ${member.isOnline ? 'online' : ''}`}
                                  >
                                    {member.isOnline ? '온라인' : '오프라인'}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            {isExtraSmallScreen && (
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#5e6278' }}>
                                    전환롤링금:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatCurrency(member.convertedRollingAmount)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#5e6278' }}>
                                    총롤링금:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatCurrency(member.totalRollingAmount)}
                                  </Typography>
                                </Box>
                              </>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <Button 
                                className="table-action-button view"
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontSize: '11px', 
                                  padding: '2px 8px',
                                  minWidth: '60px',
                                  height: '26px',
                                  borderColor: '#e4e6ef',
                                  color: '#7e8299',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(member);
                                }}
                              >
                                상세보기
                              </Button>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isExtraSmallScreen ? 3 : isSmallScreen ? 4 : 6} className="table-empty-state">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      <Box className="table-footer" sx={{ 
        borderTop: '1px solid #E4E6EF',
        backgroundColor: '#F5F8FA',
        mt: 'auto'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#a1a5b7', fontSize: '13px' }}>
            페이지당 행: {rowsPerPage}
          </Typography>
        </Box>
        
        <Pagination
          count={Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage))}
          page={page}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          size="small"
          showFirstButton
          showLastButton
          className="table-pagination"
        />
      </Box>

      {/* 회원 상세 정보 다이얼로그 */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="user-detail-dialog"
      >
        {selectedMember && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    {selectedMember.nickname} 회원 상세 정보
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a5b7' }}>
                    {periodFilter === 'today' ? '당일' : periodFilter === 'month' ? '당월' : '누적'} 롤링 정보
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDialog} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">회원 ID</Typography>
                  <Typography className="detail-field-value">{selectedMember.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">회원 등급</Typography>
                  <Typography className="detail-field-value">
                    <Chip 
                      label={selectedMember.level} 
                      size="small"
                      className={`level-${selectedMember.level.toLowerCase()}`}
                      sx={{ height: '22px', fontSize: '11px' }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">접속 상태</Typography>
                  <Typography className="detail-field-value">
                    <Box className="online-status">
                      <Box 
                        className={`online-status-indicator ${selectedMember.isOnline ? 'online' : ''}`}
                      />
                      <Typography 
                        variant="body2" 
                        className={`online-status-text ${selectedMember.isOnline ? 'online' : ''}`}
                      >
                        {selectedMember.isOnline ? '온라인' : '오프라인'}
                      </Typography>
                    </Box>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">로그인 시간</Typography>
                  <Typography className="detail-field-value">{selectedMember.loginTime}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography className="detail-field-label">롤링 금액</Typography>
                  <Typography className="detail-field-value rolling-amount">
                    {formatCurrency(selectedMember.rollingAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography className="detail-field-label">전환롤링금</Typography>
                  <Typography className="detail-field-value rolling-amount">
                    {formatCurrency(selectedMember.convertedRollingAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography className="detail-field-label">총롤링금</Typography>
                  <Typography className="detail-field-value rolling-amount">
                    {formatCurrency(selectedMember.totalRollingAmount)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDialog} 
                variant="outlined"
                sx={{ 
                  borderColor: '#eff2f5',
                  color: '#7e8299',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '13px',
                }}
              >
                닫기
              </Button>
              <Button 
                className="table-action-button transition"
                variant="contained"
                sx={{ fontWeight: 500, textTransform: 'none', fontSize: '13px' }}
                onClick={() => {
                  handleSettlement(selectedMember);
                  handleCloseDialog();
                }}
              >
                전환
              </Button>
              <Button 
                className="table-action-button reset"
                variant="contained"
                color="error"
                sx={{ fontWeight: 500, textTransform: 'none', fontSize: '13px' }}
                onClick={() => {
                  handleReset(selectedMember);
                  handleCloseDialog();
                }}
              >
                리셋
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RollingStatusTable; 