import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Grid,
  MenuItem,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  CardGiftcard as CouponIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { 
  PageContainer, 
  PageHeader,
  BaseTable,
  TableFilterAndPagination
} from '../../components/baseTemplate/components';
import { 
  useTableHeader,
  useTable
} from '../../components/baseTemplate/hooks';
import { usePageData } from '../../hooks/usePageData';
import { 
  couponListColumns, 
  couponHistoryColumns,
  generateCouponData, 
  generateCouponHistoryData 
} from './data/eventSettingsData.jsx';

/**
 * 탭 패널 컴포넌트
 */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * 이벤트설정 통합 페이지
 */
const EventSettingsPage = () => {
  // 탭 상태
  const [currentTab, setCurrentTab] = useState(0);

  // 쿠폰 코드 생성 데이터
  const { data: coupons, setData: setCoupons } = usePageData({
    pageType: 'couponCreate',
    dataGenerator: generateCouponData,
    requiresMembersData: false
  });

  // 쿠폰 지급 내역 데이터
  const { data: history, setData: setHistory } = usePageData({
    pageType: 'couponHistory',
    dataGenerator: generateCouponHistoryData,
    requiresMembersData: false
  });

  // 페이지네이션 상태
  const [couponPage, setCouponPage] = useState(0);
  const [couponRowsPerPage, setCouponRowsPerPage] = useState(10);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);

  // 쿠폰 생성 폼 상태
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    gameMoney: '',
    maxUses: '',
    expiryDate: '',
    description: '',
    targetType: 'all'
  });

  // 쿠폰 지급 폼 상태
  const [grantFormData, setGrantFormData] = useState({
    userId: '',
    gameMoney: '',
    description: ''
  });

  // UI 상태
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 테이블 헤더 훅 사용
  const couponTableHeader = useTableHeader();
  const historyTableHeader = useTableHeader();
  
  // 테이블 훅 사용
  const couponTable = useTable();
  const historyTable = useTable();

  // 알림 표시
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // 탭 변경
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // === 쿠폰 코드 생성 관련 함수들 ===
  const handleCouponFormChange = useCallback((field) => (event) => {
    setCouponFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const generateCouponCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponFormData(prev => ({ ...prev, code }));
  }, []);

  const handleCreateCoupon = useCallback(() => {
    if (!couponFormData.code || !couponFormData.gameMoney) {
      showNotification('쿠폰 코드와 게임머니를 입력해주세요.', 'error');
      return;
    }

    if (coupons.some(c => c.code === couponFormData.code)) {
      showNotification('이미 존재하는 쿠폰 코드입니다.', 'error');
      return;
    }

    const newCoupon = {
      id: Date.now().toString(),
      code: couponFormData.code,
      gameMoney: `${Number(couponFormData.gameMoney).toLocaleString()}원`,
      gameMoneyRaw: Number(couponFormData.gameMoney),
      maxUses: couponFormData.maxUses || '무제한',
      usedCount: 0,
      expiryDate: couponFormData.expiryDate || '무제한',
      status: 'active',
      targetType: couponFormData.targetType,
      description: couponFormData.description || '-',
      createdAt: new Date().toISOString()
    };

    setCoupons([newCoupon, ...coupons]);
    showNotification('게임머니 쿠폰이 생성되었습니다.');
    
    setCouponFormData({
      code: '',
      gameMoney: '',
      maxUses: '',
      expiryDate: '',
      description: '',
      targetType: 'all'
    });
  }, [couponFormData, coupons, setCoupons, showNotification]);

  const handleDeleteSelectedCoupons = useCallback(() => {
    if (selectedCoupons.length === 0) {
      showNotification('삭제할 쿠폰을 선택해주세요.', 'warning');
      return;
    }

    setCoupons(coupons.filter(coupon => !selectedCoupons.includes(coupon.id)));
    setSelectedCoupons([]);
    showNotification(`${selectedCoupons.length}개의 쿠폰이 삭제되었습니다.`);
  }, [selectedCoupons, coupons, setCoupons, showNotification]);

  const handleToggleStatus = useCallback((couponId) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, status: coupon.status === 'active' ? 'inactive' : 'active' }
        : coupon
    ));
    showNotification('쿠폰 상태가 변경되었습니다.');
  }, [coupons, setCoupons, showNotification]);

  // === 쿠폰 지급 관련 함수들 ===
  const handleGrantFormChange = useCallback((field) => (event) => {
    setGrantFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const searchUser = useCallback((userId) => {
    const dummyUsers = {
      'user123': { name: '홍길동', level: 'VIP', balance: '1,500,000원' },
      'test001': { name: '김철수', level: '일반', balance: '300,000원' },
      'vip777': { name: '이영희', level: 'VVIP', balance: '5,200,000원' }
    };
    return dummyUsers[userId] || null;
  }, []);

  const handleUserSearch = useCallback(() => {
    if (!grantFormData.userId.trim()) {
      showNotification('회원 ID를 입력해주세요.', 'warning');
      return;
    }

    const user = searchUser(grantFormData.userId);
    if (user) {
      setSelectedUser({ ...user, userId: grantFormData.userId });
      showNotification('회원이 확인되었습니다.', 'success');
    } else {
      setSelectedUser(null);
      showNotification('해당 회원을 찾을 수 없습니다.', 'error');
    }
  }, [grantFormData.userId, searchUser, showNotification]);

  const handleCouponGrant = useCallback(async () => {
    if (!selectedUser) {
      showNotification('회원을 먼저 검색해주세요.', 'warning');
      return;
    }

    if (!grantFormData.gameMoney) {
      showNotification('지급할 게임머니를 입력해주세요.', 'warning');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newHistory = {
      id: Date.now().toString(),
      userId: selectedUser.userId,
      userName: selectedUser.name,
      couponCode: '관리자 직접 지급',
      gameMoney: `${Number(grantFormData.gameMoney).toLocaleString()}원`,
      grantType: 'admin',
      status: 'success',
      description: grantFormData.description || '-',
      grantedAt: new Date().toISOString(),
      adminId: 'admin123'
    };

    setHistory([newHistory, ...history]);
    showNotification(`${selectedUser.name}님에게 게임머니 ${Number(grantFormData.gameMoney).toLocaleString()}원이 지급되었습니다.`, 'success');
    
    setGrantFormData({
      userId: '',
      gameMoney: '',
      description: ''
    });
    setSelectedUser(null);
    setIsProcessing(false);
  }, [selectedUser, grantFormData, history, setHistory, showNotification]);

  // 페이지네이션 핸들러
  const handleCouponPageChange = useCallback((eventOrPage, newPage) => {
    // TablePagination은 페이지 번호만 전달
    const pageNumber = typeof eventOrPage === 'number' ? eventOrPage : newPage;
    if (typeof pageNumber === 'number') {
      setCouponPage(pageNumber);
    }
  }, []);

  const handleCouponRowsPerPageChange = useCallback((event) => {
    setCouponRowsPerPage(parseInt(event.target.value, 10));
    setCouponPage(0);
  }, []);

  const handleHistoryPageChange = useCallback((eventOrPage, newPage) => {
    // TablePagination은 페이지 번호만 전달
    const pageNumber = typeof eventOrPage === 'number' ? eventOrPage : newPage;
    if (typeof pageNumber === 'number') {
      setHistoryPage(pageNumber);
    }
  }, []);

  const handleHistoryRowsPerPageChange = useCallback((event) => {
    setHistoryRowsPerPage(parseInt(event.target.value, 10));
    setHistoryPage(0);
  }, []);

  // 필터링된 데이터
  const filteredCoupons = React.useMemo(() => {
    let result = [...coupons];
    
    if (couponTableHeader.searchText) {
      const searchLower = couponTableHeader.searchText.toLowerCase();
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchLower) ||
        coupon.description.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [coupons, couponTableHeader.searchText]);

  const filteredHistory = React.useMemo(() => {
    let result = [...history];
    
    if (historyTableHeader.searchText) {
      const searchLower = historyTableHeader.searchText.toLowerCase();
      result = result.filter(item =>
        item.couponCode.toLowerCase().includes(searchLower) ||
        item.userName.toLowerCase().includes(searchLower) ||
        item.userId.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [history, historyTableHeader.searchText]);

  // 페이지네이션된 데이터
  const paginatedCoupons = useMemo(() => {
    const start = couponPage * couponRowsPerPage;
    const end = start + couponRowsPerPage;
    return filteredCoupons.slice(start, end);
  }, [filteredCoupons, couponPage, couponRowsPerPage]);

  const paginatedHistory = useMemo(() => {
    const start = historyPage * historyRowsPerPage;
    const end = start + historyRowsPerPage;
    return filteredHistory.slice(start, end);
  }, [filteredHistory, historyPage, historyRowsPerPage]);

  const actionHandlers = { handleToggleStatus };

  return (
    <PageContainer>
      <PageHeader
        title="이벤트설정"
        showAddButton={false}
        sx={{ mb: 3 }}
      />

      <Paper elevation={1}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="쿠폰코드 생성" />
          <Tab label="쿠폰 지급" />
        </Tabs>

        {/* 쿠폰코드 생성 탭 */}
        <TabPanel value={currentTab} index={0}>
          {/* 쿠폰 생성 폼 */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>새 게임머니 쿠폰 생성</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="쿠폰 코드"
                    value={couponFormData.code}
                    onChange={handleCouponFormChange('code')}
                    placeholder="예: WELCOME2024"
                    required
                  />
                  <Button
                    variant="outlined"
                    onClick={generateCouponCode}
                    sx={{ minWidth: 100 }}
                  >
                    자동생성
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="지급 게임머니"
                  type="number"
                  value={couponFormData.gameMoney}
                  onChange={handleCouponFormChange('gameMoney')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">원</InputAdornment>
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="지급 대상"
                  value={couponFormData.targetType}
                  onChange={handleCouponFormChange('targetType')}
                >
                  <MenuItem value="all">모든 회원</MenuItem>
                  <MenuItem value="specific">특정 회원</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="최대 사용 횟수"
                  type="number"
                  value={couponFormData.maxUses}
                  onChange={handleCouponFormChange('maxUses')}
                  placeholder="무제한"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="만료일"
                  type="date"
                  value={couponFormData.expiryDate}
                  onChange={handleCouponFormChange('expiryDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="쿠폰 설명"
                  value={couponFormData.description}
                  onChange={handleCouponFormChange('description')}
                  multiline
                  rows={2}
                  placeholder="쿠폰 설명을 입력하세요"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCoupon}
                  >
                    게임머니 쿠폰 생성
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* 쿠폰 목록 */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                생성된 쿠폰 목록
              </Typography>
            </Box>

            {/* 검색 및 액션 영역 */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="쿠폰 코드 검색..."
                value={couponTableHeader.searchText}
                onChange={(e) => couponTableHeader.handleSearchChange(e.target.value)}
                sx={{ width: 300 }}
              />
              {selectedCoupons.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelectedCoupons}
                >
                  선택 삭제 ({selectedCoupons.length})
                </Button>
              )}
            </Box>

            {/* 필터 및 페이지네이션 */}
            <TableFilterAndPagination
              filterProps={{
                filterOptions: [],
                activeFilters: {},
                handleFilterChange: () => {},
                showDateFilter: false
              }}
              paginationProps={{
                count: filteredCoupons.length,
                page: couponPage,
                rowsPerPage: couponRowsPerPage,
                onPageChange: handleCouponPageChange,
                onRowsPerPageChange: handleCouponRowsPerPageChange
              }}
            />

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <BaseTable
                columns={couponListColumns}
                data={paginatedCoupons}
                sortConfig={couponTable.sortConfig}
                onSort={couponTable.handleSort}
                onRowSelect={setSelectedCoupons}
                selectedRows={selectedCoupons}
                actionHandlers={actionHandlers}
                sx={{
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }
                }}
              />
            </Box>
          </Paper>
        </TabPanel>

        {/* 쿠폰 지급 탭 */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            {/* 회원 검색 및 쿠폰 지급 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonAddIcon color="primary" />
                  회원 검색 및 쿠폰 지급
                </Typography>
                
                {/* 회원 검색 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="회원 ID"
                      value={grantFormData.userId}
                      onChange={handleGrantFormChange('userId')}
                      placeholder="회원 ID 입력"
                      disabled={isProcessing}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUserSearch();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleUserSearch}
                      disabled={isProcessing}
                      sx={{ minWidth: 100 }}
                    >
                      검색
                    </Button>
                  </Box>
                  
                  {/* 검색된 회원 정보 */}
                  {selectedUser && (
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">ID</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedUser.userId}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">이름</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedUser.name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">등급</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedUser.level}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">현재 잔액</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedUser.balance}</Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  )}
                </Box>

                {/* 쿠폰 지급 폼 */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="지급 게임머니"
                    type="number"
                    value={grantFormData.gameMoney}
                    onChange={handleGrantFormChange('gameMoney')}
                    placeholder="지급할 금액 입력"
                    disabled={!selectedUser || isProcessing}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="지급 사유"
                    value={grantFormData.description}
                    onChange={handleGrantFormChange('description')}
                    placeholder="예: 이벤트 보상, VIP 특별 혜택 등"
                    disabled={!selectedUser || isProcessing}
                    multiline
                    rows={2}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCouponGrant}
                  disabled={isProcessing || !selectedUser || !grantFormData.gameMoney}
                >
                  {isProcessing ? '처리 중...' : '게임머니 지급'}
                </Button>

                {/* 테스트용 회원 ID */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    테스트용 회원 ID:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['user123', 'test001', 'vip777'].map(userId => (
                      <Chip
                        key={userId}
                        label={userId}
                        size="small"
                        onClick={() => setGrantFormData(prev => ({ ...prev, userId }))}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* 쿠폰 지급 안내 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  쿠폰 지급 안내
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🎮 게임머니 쿠폰이란?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    게임머니 쿠폰은 회원에게 게임을 할 수 있는 포인트를 제공하는 시스템입니다.
                    보유금액과는 별도로 관리되며, 게임 전용으로 사용됩니다.
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📌 지급 방법
                  </Typography>
                  <Typography variant="body2" component="div" color="text.secondary">
                    1. 회원 ID로 검색하여 회원 확인<br />
                    2. 지급할 게임머니 금액 입력<br />
                    3. 지급 사유 입력 (선택사항)<br />
                    4. 지급 버튼 클릭하여 즉시 지급
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    ⚠️ 주의사항
                  </Typography>
                  <Typography variant="body2" component="div" color="text.secondary">
                    • 관리자가 직접 지급한 쿠폰은 취소 불가<br />
                    • 모든 지급 내역은 로그에 기록됨<br />
                    • 지급 전 회원 정보를 반드시 확인
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* 쿠폰 지급 히스토리 */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    쿠폰 지급 내역
                  </Typography>
                </Box>

                {/* 검색 영역 */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="회원 ID, 이름, 쿠폰 코드 검색..."
                    value={historyTableHeader.searchText}
                    onChange={(e) => historyTableHeader.handleSearchChange(e.target.value)}
                    sx={{ width: 300 }}
                  />
                </Box>

                {/* 필터 및 페이지네이션 */}
                <TableFilterAndPagination
                  filterProps={{
                    filterOptions: [],
                    activeFilters: {},
                    handleFilterChange: () => {},
                    showDateFilter: false
                  }}
                  paginationProps={{
                    count: filteredHistory.length,
                    page: historyPage,
                    rowsPerPage: historyRowsPerPage,
                    onPageChange: handleHistoryPageChange,
                    onRowsPerPageChange: handleHistoryRowsPerPageChange
                  }}
                />

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <BaseTable
                    columns={couponHistoryColumns}
                    data={paginatedHistory}
                    sortConfig={historyTable.sortConfig}
                    onSort={historyTable.handleSort}
                    sx={{
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default EventSettingsPage;