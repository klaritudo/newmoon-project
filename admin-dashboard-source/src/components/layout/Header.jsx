import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Paper,
  Button,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsNone as NotificationsNoneIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  ViewSidebar as ViewSidebarIcon,
  ViewStream as ViewStreamIcon,
  Money as MoneyIcon,
  AccountBalance as BalanceIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { toggleNotificationPanel, toggleNotificationSound, selectTotalNotifications, selectAllNotifications, selectNotificationSoundEnabled } from '../../features/notifications/notificationsSlice';
import { selectSidebarMode, toggleSidebarMode } from '../../features/ui/uiSlice';
import '../../styles/header.css';
import ThemeToggle from '../../components/ThemeToggle';
import apiBalanceService from '../../services/apiBalanceService';
import usePermission from '../../hooks/usePermission';
import { Skeleton } from '@mui/material';
import { useSocket } from '../../context/SocketContext';
import { setUser } from '../../features/auth/authSlice';

/**
 * 관리자 대시보드 헤더 컴포넌트
 * 
 * @param {Object} props
 * @param {Function} props.handleDrawerToggle - 사이드바 토글 함수
 */
const Header = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const totalNotifications = useSelector(selectTotalNotifications);
  const allNotifications = useSelector(selectAllNotifications);
  const soundEnabled = useSelector(selectNotificationSoundEnabled);
  const sidebarMode = useSelector(selectSidebarMode);
  const user = useSelector((state) => state.auth.user);
  const { hasPermission } = usePermission();
  const { socketService } = useSocket();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [anchorElTools, setAnchorElTools] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // API 잔액 상태
  const [apiBalance, setApiBalance] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);

  // 요청 및 대기 숫자 계산
  const totalRequests = React.useMemo(() => {
    return Object.values(allNotifications).reduce(
      (total, notification) => total + notification.requests, 
      0
    );
  }, [allNotifications]);
  
  const totalPending = React.useMemo(() => {
    return Object.values(allNotifications).reduce(
      (total, notification) => total + notification.pending, 
      0
    );
  }, [allNotifications]);

  useEffect(() => {
    // 1초마다 현재 시간 업데이트
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(timer);
  }, []);

  // API 잔액 로드 및 리스너 설정
  useEffect(() => {
    // 1단계와 마스터(999)는 개인 API 잔액을 조회하지 않음 (사이드바의 총액만 표시)
    if (user?.agent_level_id === 1 || user?.agent_level_id === 999) {
      return;
    }
    
    const canViewApiBalance = hasPermission('view-api-balance');
    if (!canViewApiBalance) return;

    // 초기 로드
    setIsBalanceLoading(true);
    // 현재 잔액 가져오기 (이미 로드된 경우 즉시 반환)
    const currentBalance = apiBalanceService.getBalance();
    if (currentBalance > 0) {
      setApiBalance(currentBalance);
      setIsBalanceLoading(false);
    } else {
      // 아직 로드되지 않은 경우에만 fetch
      apiBalanceService.fetchBalance().then(balance => {
        setApiBalance(balance);
        setIsBalanceLoading(false);
      });
    }

    // 리스너 등록 (Sidebar에서 업데이트될 때 반영)
    const unsubscribe = apiBalanceService.addListener((balance) => {
      setApiBalance(balance);
    });

    // Header에서는 polling을 시작하지 않음 (Sidebar에서만 관리)

    return () => {
      unsubscribe();
      // Header에서는 polling을 중지하지 않음 (Sidebar에서만 관리)
    };
  }, [user, hasPermission]);

  // 웹소켓으로 사용자 잔액 실시간 업데이트
  useEffect(() => {
    if (!socketService || !user) return;
    
    const handleBalanceUpdate = (data) => {
      console.log('💰 실시간 잔액 업데이트:', data);
      
      // 자신의 잔액 업데이트인 경우
      if (data.memberId === user.id || data.userId === user.id) {
        const updatedUser = {
          ...user,
          balance: data.balance || data.newBalance || 0
        };
        dispatch(setUser(updatedUser));
      }
    };
    
    // 리스너 등록
    socketService.on('balance:update', handleBalanceUpdate);
    socketService.on('realtime:balance', handleBalanceUpdate);
    socketService.on('member:balance:update', handleBalanceUpdate);
    
    return () => {
      socketService.off('balance:update', handleBalanceUpdate);
      socketService.off('realtime:balance', handleBalanceUpdate);
      socketService.off('member:balance:update', handleBalanceUpdate);
    };
  }, [socketService, user, dispatch]);

  // 잔액 새로고침
  const handleBalanceRefresh = async () => {
    setIsBalanceRefreshing(true);
    try {
      await apiBalanceService.fetchBalance();
    } catch (error) {
      console.error('Failed to refresh API balance:', error);
    } finally {
      setIsBalanceRefreshing(false);
    }
  };

  // 날짜 및 시간 포맷팅 함수
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleOpenToolsMenu = (event) => {
    setAnchorElTools(event.currentTarget);
  };

  const handleCloseToolsMenu = () => {
    setAnchorElTools(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    dispatch(logout());
    navigate('/login');
  };
  
  const handleSearchToggle = () => {
    setSearchExpanded(prev => !prev);
  };

  const handleSoundToggle = () => {
    dispatch(toggleNotificationSound());
  };

  const handleSidebarModeToggle = () => {
    dispatch(toggleSidebarMode());
  };

  // 가상의 알림 데이터
  const notifications = [
    { 
      id: 1, 
      message: '새로운 회원이 가입했습니다: user123', 
      time: '5분 전',
      unread: true
    },
    { 
      id: 2, 
      message: '신규 결제가 완료되었습니다: #ORD-12345', 
      time: '10분 전',
      unread: true
    },
    { 
      id: 3, 
      message: '시스템 업데이트가 완료되었습니다.', 
      time: '1시간 전',
      unread: false
    },
    { 
      id: 4, 
      message: '새로운 게시글이 등록되었습니다.', 
      time: '2시간 전',
      unread: false
    },
    { 
      id: 5, 
      message: '서버 점검이 예정되어 있습니다.', 
      time: '3시간 전',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(notification => notification.unread).length;

  // 현재 경로에 따른 브레드크럼 생성
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    // 경로에 따른 이름 매핑
    const nameMap = {
      'dashboard': '대시보드',
      'members': '회원관리',
      'betting': '배팅내역',
      'settlement': '정산관리',
      'transaction': '입출금관리',
      'game-results': '게임결과',
      'customer-service': '고객센터',
      'board': '게시판관리',
      'game-settings': '게임설정',
      'site-settings': '사이트설정',
      'logs': '로그관리',
      'tree-view': '트리뷰',
      'management': '회원관리',
      'rolling-transfer': '롤링금전환내역',
      'money-processing': '머니처리내역',
      'money-transfer': '머니이동내역',
      'create': '회원생성',
    };
    
    return (
      <Breadcrumbs 
        separator={<KeyboardArrowRightIcon sx={{ fontSize: 16, color: '#5E6278' }} />}
        aria-label="breadcrumb"
      >
        <MuiLink
          component={Link}
          to="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#5E6278',
            textDecoration: 'none',
            '&:hover': {
              color: '#3699FF',
              textDecoration: 'none',
            }
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
          홈
        </MuiLink>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return isLast ? (
            <Typography 
              key={name} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#181C32',
                fontWeight: 600,
              }}
            >
              {nameMap[name] || name}
            </Typography>
          ) : (
            <MuiLink
              component={Link}
              key={name}
              to={routeTo}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#5E6278',
                textDecoration: 'none',
                '&:hover': {
                  color: '#3699FF',
                  textDecoration: 'none',
                }
              }}
            >
              {nameMap[name] || name}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <AppBar 
      position="fixed" 
      className="header css-header"
      sx={{
        width: { 
          xs: '100%', // 모바일에서는 항상 100%
          lg: sidebarMode === 'vertical' ? `calc(100% - 280px)` : '100%' // lg 브레이크포인트 사용
        },
        ml: { 
          xs: 0, // 모바일에서는 항상 0
          lg: sidebarMode === 'vertical' ? '280px' : 0 // lg 브레이크포인트 사용
        },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: '64px', sm: '70px' } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            mr: 2, 
            display: { 
              xs: sidebarMode === 'horizontal' ? 'none' : 'block',
              lg: sidebarMode === 'vertical' ? 'none' : 'block' 
            } 
          }}
        >
          <MenuIcon sx={{ fontSize: '24px', color: '#7e8299' }} />
        </IconButton>
        
        {/* 로고 및 타이틀 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              fontWeight: 700, 
              fontSize: '18px',
              color: '#181c32'
            }}
          >
            관리자 대시보드
          </Typography>
        </Box>

        {/* 브레드크럼 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
          {getBreadcrumbs()}
        </Box>

        {/* 현재 날짜 및 시간 */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          alignItems: 'center',
          mr: 2,
          ml: 'auto'
        }}>
          <Typography
            variant="body1"
            className="date-time-display"
            sx={{ fontSize: '1rem !important' }}
          >
            {formatDateTime(currentDateTime)}
          </Typography>
        </Box>

        {/* 650px 이하에서 보유금/API 잔액 표시 */}
        <Box sx={{ 
          display: 'none',
          '@media (max-width: 650px)': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 'auto',
            mr: 1
          }
        }}>
          {/* 사용자 본인의 보유금 표시 - 2단계 이하만 표시 */}
          {user && user.agent_level_id >= 2 && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: '6px 10px',
                backgroundColor: '#fef5f5',
                borderRadius: '6px',
                border: '1px solid #F64E60',
              }}
            >
              <MoneyIcon sx={{ color: '#F64E60', fontSize: '16px' }} />
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#7e8299',
                    fontSize: '9px',
                    display: 'block',
                    lineHeight: 1,
                    mb: 0.25
                  }}
                >
                  내 보유금
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#181c32',
                    fontSize: '11px',
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {user?.balance !== undefined && user?.balance !== null ? new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                    maximumFractionDigits: 0
                  }).format(user.balance) : '₩0'}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* API 잔액 표시 - 1단계만 표시 */}
          {user && user.agent_level_id === 1 && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: '6px 10px',
                backgroundColor: '#f5f8fa',
                borderRadius: '6px',
                border: '1px solid #e4e6ef',
              }}
            >
              <BalanceIcon sx={{ color: '#3699FF', fontSize: '16px' }} />
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#7e8299',
                    fontSize: '9px',
                    display: 'block',
                    lineHeight: 1,
                    mb: 0.25
                  }}
                >
                  API 총잔액
                </Typography>
                {isBalanceLoading ? (
                  <Skeleton width={50} height={12} />
                ) : (
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#181c32',
                      fontSize: '11px',
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {apiBalanceService.formatBalance(apiBalance)}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* 검색 영역 */}
        <Box 
          sx={{ 
            flexGrow: 0, 
            display: 'flex', 
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {searchExpanded && (
            <Paper
              component="form"
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', sm: 400 },
                position: { xs: 'absolute', sm: 'static' },
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e4e6ef',
              }}
            >
              <IconButton sx={{ p: '10px', color: '#7e8299' }}>
                <SearchIcon />
              </IconButton>
              <Box
                component="input"
                sx={{
                  ml: 1,
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  color: '#181c32',
                  '&::placeholder': {
                    color: '#a1a5b7',
                    opacity: 1,
                  },
                }}
                placeholder="검색어를 입력하세요..."
                autoFocus
              />
              <IconButton 
                sx={{ p: '10px', color: '#7e8299' }}
                onClick={handleSearchToggle}
              >
                <CloseIcon />
              </IconButton>
            </Paper>
          )}
        </Box>

        {/* 우측 아이콘 메뉴 */}
        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
          {/* 650px 이상에서만 표시되는 개별 버튼들 */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', '@media (max-width: 650px)': { display: 'none' } }}>
            {/* 검색 버튼 */}
            <Tooltip title="검색">
              <IconButton 
                onClick={handleSearchToggle}
                className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium"
                sx={{ 
                  ml: 1
                }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            {/* 사이드바 모드 전환 버튼 */}
            <Tooltip title={sidebarMode === 'vertical' ? "가로 모드로 전환" : "세로 모드로 전환"}>
              <IconButton
                onClick={handleSidebarModeToggle}
                className="sidebar-mode-toggle"
                sx={{ 
                  ml: 1
                }}
              >
                {sidebarMode === 'vertical' ? <ViewStreamIcon /> : <ViewSidebarIcon />}
              </IconButton>
            </Tooltip>
            
            {/* 소리 제어 버튼 */}
            <Tooltip title={soundEnabled ? "소리 끄기" : "소리 켜기"}>
              <IconButton
                onClick={handleSoundToggle}
                className={`sound-control-button ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                sx={{ 
                  ml: 1
                }}
              >
                {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
            </Tooltip>
            
            {/* 알림판 토글 버튼 */}
            <Tooltip title="알림판">
              <IconButton
                onClick={() => dispatch(toggleNotificationPanel())}
                className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium notification-panel-button"
                sx={{ 
                  ml: 1
                }}
              >
                <Badge 
                  badgeContent={totalRequests + totalPending} 
                  color="error"
                  max={99}
                >
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* 알림 버튼 */}
            <Tooltip title="알림">
              <IconButton
                onClick={handleOpenNotifications}
                className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium"
                sx={{ 
                  ml: 1
                }}
              >
                <Badge badgeContent={totalRequests} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* 테마 토글 버튼 - 알림 아이콘 오른쪽에 배치 */}
            <ThemeToggle />
          </Box>

          {/* 650px 이하에서만 표시되는 메뉴 */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', '@media (min-width: 651px)': { display: 'none' } }}>
            {/* 사이드바 모드 전환 버튼 */}
            <Tooltip title={sidebarMode === 'vertical' ? "가로 모드로 전환" : "세로 모드로 전환"}>
              <IconButton
                onClick={handleSidebarModeToggle}
                sx={{ ml: 1 }}
              >
                {sidebarMode === 'vertical' ? <ViewStreamIcon /> : <ViewSidebarIcon />}
              </IconButton>
            </Tooltip>
            
            {/* 톱니바퀴 메뉴 버튼 */}
            <Tooltip title="도구">
              <IconButton 
                onClick={handleOpenToolsMenu}
                sx={{ ml: 1 }}
              >
                <SettingsIcon sx={{ fontSize: '22px' }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 사용자 아바타 */}
          <Tooltip title="계정 메뉴">
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{ 
                ml: 1,
                p: 0,
                border: '2px solid #e4e6ef',
                '&:hover': {
                  border: '2px solid #3699FF',
                }
              }}
            >
              <Avatar 
                alt="Admin User" 
                src="/static/images/avatar/1.jpg" 
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* 도구 메뉴 (650px 이하에서 사용) */}
      <Menu
        anchorEl={anchorElTools}
        id="tools-menu"
        open={Boolean(anchorElTools)}
        onClose={handleCloseToolsMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 240,
            borderRadius: '8px',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* 검색 */}
        <MenuItem onClick={() => { handleSearchToggle(); handleCloseToolsMenu(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <SearchIcon fontSize="small" sx={{ color: '#7e8299' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            검색
          </Typography>
        </MenuItem>

        {/* 알림 */}
        <MenuItem onClick={() => { handleOpenNotifications({ currentTarget: anchorElTools }); handleCloseToolsMenu(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Badge 
              badgeContent={totalRequests} 
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  height: '16px',
                  minWidth: '16px',
                  padding: '0 4px',
                }
              }}
            >
              <NotificationsIcon fontSize="small" sx={{ color: '#7e8299' }} />
            </Badge>
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            알림 {totalRequests > 0 ? `(${totalRequests})` : ''}
          </Typography>
        </MenuItem>
        
        {/* 소리 제어 */}
        <MenuItem onClick={() => { handleSoundToggle(); handleCloseToolsMenu(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            {soundEnabled ? <VolumeUpIcon fontSize="small" sx={{ color: '#7e8299' }} /> : <VolumeOffIcon fontSize="small" sx={{ color: '#7e8299' }} />}
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            {soundEnabled ? '소리 끄기' : '소리 켜기'}
          </Typography>
        </MenuItem>
        
        {/* 알림판 토글 */}
        <MenuItem onClick={() => { dispatch(toggleNotificationPanel()); handleCloseToolsMenu(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Badge 
              badgeContent={totalRequests + totalPending} 
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  height: '16px',
                  minWidth: '16px',
                  padding: '0 4px',
                }
              }}
            >
              <NotificationsNoneIcon fontSize="small" sx={{ color: '#7e8299' }} />
            </Badge>
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            알림판 {totalRequests + totalPending > 0 ? `(${totalRequests + totalPending})` : ''}
          </Typography>
        </MenuItem>
        
        <Divider />
        
        {/* 테마 전환 - 텍스트로 표시 */}
        <MenuItem sx={{ py: 1.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32', mr: 'auto' }}>
              테마
            </Typography>
            <ThemeToggle />
          </Box>
        </MenuItem>
      </Menu>

      {/* 알림 메뉴 */}
      <Menu
        anchorEl={anchorElNotifications}
        id="notifications-menu"
        open={Boolean(anchorElNotifications)}
        onClose={handleCloseNotifications}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 320,
            borderRadius: '8px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #eff2f5' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px', color: '#181c32' }}>
            알림
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a5b7', fontSize: '13px' }}>
            {unreadCount}개의 읽지 않은 알림이 있습니다
          </Typography>
        </Box>
        
        {notifications.map((notification) => (
          <MenuItem 
            key={notification.id} 
            onClick={handleCloseNotifications}
            sx={{ 
              py: 1.5, 
              px: 2,
              borderLeft: notification.unread ? '3px solid #3699FF' : 'none',
              backgroundColor: notification.unread ? 'rgba(54, 153, 255, 0.05)' : 'transparent',
              '&:hover': {
                backgroundColor: '#f5f8fa',
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: notification.unread ? 600 : 400, fontSize: '13px', color: '#181c32' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" sx={{ color: '#a1a5b7', fontSize: '11px', ml: 1 }}>
                  {notification.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
        
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid #eff2f5' }}>
          <Button 
            size="small" 
            sx={{ 
              fontSize: '13px', 
              fontWeight: 500,
              color: '#3699FF',
              '&:hover': {
                backgroundColor: 'rgba(54, 153, 255, 0.1)',
              }
            }}
          >
            모든 알림 보기
          </Button>
        </Box>
      </Menu>

      {/* 사용자 메뉴 */}
      <Menu
        anchorEl={anchorElUser}
        id="account-menu"
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 200,
            borderRadius: '8px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #eff2f5' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px', color: '#181c32' }}>
            {user?.nickname || user?.username || '관리자'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a5b7', fontSize: '13px' }}>
            {user?.username || user?.userId || ''}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleCloseUserMenu} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: '#7e8299' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            내 프로필
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={handleCloseUserMenu} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: '#7e8299' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            설정
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={handleCloseUserMenu} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <HelpIcon fontSize="small" sx={{ color: '#7e8299' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#181c32' }}>
            도움말
          </Typography>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#f1416c' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#f1416c' }}>
            로그아웃
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

Header.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default Header; 