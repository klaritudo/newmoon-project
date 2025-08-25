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
  Divider,
  Tab,
  Tabs,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon, 
  ArrowUpward as ArrowUpwardIcon, 
  ArrowDownward as ArrowDownwardIcon, 
  Close as CloseIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Sort as SortIcon,
  CellTower as CellTowerIcon,
  Computer as ComputerIcon,
  PhoneAndroid as PhoneAndroidIcon,
  TabletMac as TabletMacIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import '../../../styles/dashboard-tables.css';

// 사용자 통계 데이터
const userSummaryData = {
  totalUsers: 8750,
  activeUsers: 1256,
  newUsersToday: 128,
  avgSessionTime: '28분 45초'
};

// 사용자 샘플 데이터
const users = [
  { 
    id: 'user2001', 
    nickname: '김태희',
    level: 'VIP',
    loginTime: '2023-05-20 14:30:25', 
    loginLocation: '서울시 강남구',
    deviceType: 'mobile',
    isOnline: true,
    sessionTime: 3600 // 초 단위
  },
  { 
    id: 'user2002', 
    nickname: '이민호',
    level: 'VIP',
    loginTime: '2023-05-20 12:15:40', 
    loginLocation: '부산시 해운대구',
    deviceType: 'desktop',
    isOnline: true,
    sessionTime: 2750
  },
  { 
    id: 'user2003', 
    nickname: '전지현',
    level: '골드',
    loginTime: '2023-05-20 10:08:33', 
    loginLocation: '인천시 남동구',
    deviceType: 'tablet',
    isOnline: false,
    sessionTime: 1820
  },
  { 
    id: 'user2004', 
    nickname: '송중기',
    level: '골드',
    loginTime: '2023-05-20 16:45:12', 
    loginLocation: '대전시 유성구',
    deviceType: 'mobile',
    isOnline: true,
    sessionTime: 4250
  },
  { 
    id: 'user2005', 
    nickname: '현빈',
    level: 'VIP',
    loginTime: '2023-05-20 11:30:15', 
    loginLocation: '광주시 서구',
    deviceType: 'desktop',
    isOnline: false,
    sessionTime: 1450
  },
  { 
    id: 'user2006', 
    nickname: '손예진',
    level: '실버',
    loginTime: '2023-05-20 09:22:18', 
    loginLocation: '서울시 용산구',
    deviceType: 'mobile',
    isOnline: true,
    sessionTime: 5100
  },
  { 
    id: 'user2007', 
    nickname: '박서준',
    level: '골드',
    loginTime: '2023-05-20 10:45:33',
    loginLocation: '대구시 중구',
    deviceType: 'desktop',
    isOnline: true,
    sessionTime: 3200
  },
  { 
    id: 'user2008', 
    nickname: '이종석',
    level: '실버',
    loginTime: '2023-05-20 13:12:54', 
    loginLocation: '울산시 남구',
    deviceType: 'tablet',
    isOnline: false,
    sessionTime: 950
  },
  { 
    id: 'user2009', 
    nickname: '공유',
    level: 'VIP',
    loginTime: '2023-05-20 08:45:32', 
    loginLocation: '서울시 마포구',
    deviceType: 'desktop',
    isOnline: true,
    sessionTime: 5880
  },
  { 
    id: 'user2010', 
    nickname: '이병헌',
    level: '골드',
    loginTime: '2023-05-20 11:27:14', 
    loginLocation: '서울시 강북구',
    deviceType: 'mobile',
    isOnline: false,
    sessionTime: 2320
  },
  { 
    id: 'user2011', 
    nickname: '김수현',
    level: 'VIP',
    loginTime: '2023-05-20 13:37:52', 
    loginLocation: '부산시 수영구',
    deviceType: 'tablet',
    isOnline: true,
    sessionTime: 3780
  },
  { 
    id: 'user2012', 
    nickname: '한효주',
    level: '실버',
    loginTime: '2023-05-20 15:12:28', 
    loginLocation: '대구시 수성구',
    deviceType: 'mobile',
    isOnline: false,
    sessionTime: 1560
  }
];

// 세션 시간 포맷팅
const formatSessionTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  if (hours > 0) {
    result += `${hours}시간 `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes}분 `;
  }
  result += `${remainingSeconds}초`;
  
  return result;
};

// 디바이스 아이콘 렌더링
const renderDeviceIcon = (deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return <PhoneAndroidIcon fontSize="small" sx={{ color: '#3699ff' }} />;
    case 'tablet':
      return <TabletMacIcon fontSize="small" sx={{ color: '#8950fc' }} />;
    case 'desktop':
    default:
      return <ComputerIcon fontSize="small" sx={{ color: '#1bc5bd' }} />;
  }
};

const generateUsers = () => {
  return users;
};

const ActiveUsersTable = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(generateUsers());
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [sortColumn, setSortColumn] = useState('sessionTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('online');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const isSmallScreen = useMediaQuery('(max-width:1000px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:700px)');
  
  const rowsPerPage = 5;

  // 검색 및 필터링
  useEffect(() => {
    let filtered = filteredUsers;
    
    // 검색 필터링
    if (searchText) {
      filtered = filtered.filter(user => 
        user.nickname.toLowerCase().includes(searchText.toLowerCase()) || 
        user.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 상태 필터링
    if (statusFilter !== 'all') {
      const isOnline = statusFilter === 'online';
      filtered = filtered.filter(user => user.isOnline === isOnline);
    }

    // 디바이스 필터링
    if (deviceFilter !== 'all') {
      filtered = filtered.filter(user => user.deviceType === deviceFilter);
    }
    
    // 정렬
    filtered = [...filtered].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    });
    
    setFilteredUsers(filtered);
  }, [searchText, statusFilter, deviceFilter, sortColumn, sortDirection]);

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleMenuClose();
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handleDeviceFilterChange = (device) => {
    setDeviceFilter(device);
    handleMenuClose();
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 행 확장/축소 토글 함수
  const handleToggleRow = (id, event) => {
    event.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 현재 페이지의 데이터
  const paginatedUsers = filteredUsers.slice(
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

  return (
    <Box className="table-root-container" sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box className="table-controls" sx={{ borderBottom: 'none', paddingBottom: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#181c32', fontWeight: 600, fontSize: '1.075rem' }}>
            활동 중인 사용자
          </Typography>
          <Chip 
            label={`${filteredUsers.length}명`}
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
            placeholder="사용자 검색..."
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
                label={`${statusFilter === 'online' ? '온라인' : ''}${statusFilter === 'online' && deviceFilter !== 'all' ? ' + ' : ''}${deviceFilter !== 'all' ? deviceFilter === 'desktop' ? '데스크톱' : deviceFilter === 'mobile' ? '모바일' : '태블릿' : ''}`} 
                size="small" 
                className="filter-chip"
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
            필터
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
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                minHeight: '36px',
                '& .MuiTab-root': {
                  fontSize: '12px',
                  minHeight: '36px',
                  fontWeight: 500,
                  textTransform: 'none',
                  color: '#5e6278',
                },
                '& .Mui-selected': {
                  color: '#009ef7 !important',
                }
              }}
            >
              <Tab label="상태" />
              <Tab label="디바이스" />
            </Tabs>
            <Divider sx={{ my: 1 }} />
            
            {tabValue === 0 && [
                <MenuItem key="online" onClick={() => handleStatusFilterChange('online')}>
                  온라인
                </MenuItem>
            ]}
            
            {tabValue === 1 && [
                <MenuItem key="all" onClick={() => handleDeviceFilterChange('all')}>
                  모든 디바이스
                </MenuItem>,
                <MenuItem key="desktop" onClick={() => handleDeviceFilterChange('desktop')}>
                  <ComputerIcon fontSize="small" sx={{ mr: 1, color: '#1bc5bd' }} />
                  데스크톱
                </MenuItem>,
                <MenuItem key="mobile" onClick={() => handleDeviceFilterChange('mobile')}>
                  <PhoneAndroidIcon fontSize="small" sx={{ mr: 1, color: '#3699ff' }} />
                  모바일
                </MenuItem>,
                <MenuItem key="tablet" onClick={() => handleDeviceFilterChange('tablet')}>
                  <TabletMacIcon fontSize="small" sx={{ mr: 1, color: '#8950fc' }} />
                  태블릿
                </MenuItem>
            ]}
          </Menu>
        </Box>
      </Box>

      {/* 테이블 컨테이너 */}
      <TableContainer className="table-container" sx={{ flexGrow: 1 }}>
        <Table className="table-wrapper" size="small">
          <TableHead>
            <TableRow>
              <TableCell className="table-header-cell" onClick={() => handleSortChange('nickname')} sx={{ width: isExtraSmallScreen ? '45%' : isSmallScreen ? '35%' : '25%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>회원</Typography>
                  {renderSortIcon('nickname')}
                </Box>
              </TableCell>
              <TableCell className="table-header-cell" onClick={() => handleSortChange('loginTime')} sx={{ width: isExtraSmallScreen ? '45%' : isSmallScreen ? '25%' : '15%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>로그인 시간</Typography>
                  {renderSortIcon('loginTime')}
                </Box>
              </TableCell>
              {!isExtraSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('isOnline')} sx={{ width: isSmallScreen ? '25%' : '12%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>접속 상태</Typography>
                    {renderSortIcon('isOnline')}
                  </Box>
                </TableCell>
              )}
              {!isExtraSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('loginLocation')} sx={{ width: '12%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>로그인 위치</Typography>
                    {renderSortIcon('loginLocation')}
                  </Box>
                </TableCell>
              )}
              {!isSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('deviceType')} sx={{ width: '12%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>디바이스</Typography>
                    {renderSortIcon('deviceType')}
                  </Box>
                </TableCell>
              )}
              {!isExtraSmallScreen && (
                <TableCell className="table-header-cell" onClick={() => handleSortChange('sessionTime')} sx={{ width: '12%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>세션 시간</Typography>
                    {renderSortIcon('sessionTime')}
                  </Box>
                </TableCell>
              )}
              {!isSmallScreen && (
                <TableCell className="table-header-cell actions" sx={{ width: '12%' }}>
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
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow 
                    className="table-row"
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell className="table-cell" sx={{ width: isExtraSmallScreen ? '45%' : isSmallScreen ? '35%' : '25%', textAlign: 'center' }}>
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
                          {user.id}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9e9e9e', 
                            fontSize: '12px',
                            lineHeight: 1.2
                          }}
                        >
                          ({user.nickname || "닉네임없음"})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell className="table-cell" sx={{ width: isExtraSmallScreen ? '45%' : isSmallScreen ? '25%' : '15%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user.loginTime}
                      </Box>
                    </TableCell>
                    {!isExtraSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: isSmallScreen ? '25%' : '12%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box className="online-status">
                            <Box 
                              className={`online-status-indicator ${user.isOnline ? 'online' : ''}`}
                            />
                            <Typography 
                              variant="body2" 
                              className={`online-status-text ${user.isOnline ? 'online' : ''}`}
                            >
                              {user.isOnline ? '온라인' : '오프라인'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    )}
                    {!isExtraSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: '12%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" className="location-text">
                            {user.loginLocation}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: '12%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tooltip title={user.deviceType}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {renderDeviceIcon(user.deviceType)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {user.deviceType}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                    {!isExtraSmallScreen && (
                      <TableCell className="table-cell" sx={{ width: '12%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" className="session-time">
                            {formatSessionTime(user.sessionTime)}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell className="table-cell actions" sx={{ width: '12%' }}>
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
                              handleViewDetails(user);
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRow(user.id, e);
                          }}
                        >
                          {expandedRows[user.id] ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                  {(isSmallScreen || isExtraSmallScreen) && expandedRows[user.id] && (
                    <TableRow>
                      <TableCell colSpan={isExtraSmallScreen ? 3 : 4} sx={{ padding: 0, border: 0 }}>
                        <Collapse in={expandedRows[user.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            {isExtraSmallScreen && (
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>접속 상태:</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box 
                                      className={`online-status-indicator ${user.isOnline ? 'online' : ''}`}
                                      sx={{ mr: 1 }}
                                    />
                                    <Typography variant="body2">
                                      {user.isOnline ? '온라인' : '오프라인'}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    로그인 위치:
                                  </Typography>
                                  <Typography variant="body2">
                                    {user.loginLocation}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    세션 시간:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatSessionTime(user.sessionTime)}
                                  </Typography>
                                </Box>
                              </>
                            )}
                            {(isSmallScreen || isExtraSmallScreen) && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#5e6278' }}>
                                  디바이스:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {renderDeviceIcon(user.deviceType)}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {user.deviceType}
                                  </Typography>
                                </Box>
                              </Box>
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
                                  handleViewDetails(user);
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
                <TableCell colSpan={isExtraSmallScreen ? 3 : isSmallScreen ? 4 : 7} className="table-empty-state">
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
          count={Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))}
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

      {/* 사용자 상세 정보 다이얼로그 */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="user-detail-dialog"
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                  {selectedUser.nickname} 사용자 상세 정보
                </Typography>
                <IconButton onClick={handleCloseDialog} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">사용자 ID</Typography>
                  <Typography className="detail-field-value">{selectedUser.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">사용자 등급</Typography>
                  <Typography className="detail-field-value">
                    <Chip 
                      label={selectedUser.level} 
                      size="small"
                      className={`level-${selectedUser.level.toLowerCase()}`}
                      sx={{ height: '22px', fontSize: '11px' }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">접속 상태</Typography>
                  <Typography className="detail-field-value">
                    <Box className="online-status">
                      <Box 
                        className={`online-status-indicator ${selectedUser.isOnline ? 'online' : ''}`}
                      />
                      <Typography 
                        variant="body2" 
                        className={`online-status-text ${selectedUser.isOnline ? 'online' : ''}`}
                      >
                        {selectedUser.isOnline ? '온라인' : '오프라인'}
                      </Typography>
                    </Box>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">로그인 시간</Typography>
                  <Typography className="detail-field-value">{selectedUser.loginTime}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">로그인 위치</Typography>
                  <Typography className="detail-field-value">{selectedUser.loginLocation}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="detail-field-label">디바이스</Typography>
                  <Typography className="detail-field-value">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {renderDeviceIcon(selectedUser.deviceType)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {selectedUser.deviceType === 'mobile' ? '모바일' : 
                         selectedUser.deviceType === 'tablet' ? '태블릿' : '데스크톱'}
                      </Typography>
                    </Box>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography className="detail-field-label">세션 시간</Typography>
                  <Typography className="detail-field-value">
                    {formatSessionTime(selectedUser.sessionTime)}
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
              >
                메세지 보내기
              </Button>
              <Button 
                className="table-action-button reset"
                variant="contained"
                color="error"
                sx={{ fontWeight: 500, textTransform: 'none', fontSize: '13px' }}
              >
                계정 잠금
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ActiveUsersTable; 