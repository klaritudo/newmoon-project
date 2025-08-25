import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  Collapse,
  ListItemButton,
  Avatar,
  Button,
  Tooltip,
  alpha,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  SportsEsports as GamesIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle as AdminIcon,
  Money as MoneyIcon,
  Receipt as BettingIcon,
  Calculate as CalculationIcon,
  CurrencyExchange as DepositIcon,
  EmojiEvents as GameResultIcon,
  Headset as CustomerServiceIcon,
  ForumOutlined as BoardIcon,
  Casino as GameSettingIcon,
  Web as SiteSettingIcon,
  ListAlt as LogIcon,
  Person,
  ChevronRight,
  ViewSidebar as ViewSidebarIcon,
  ViewStream as ViewStreamIcon,
  DesignServices as TemplateIcon,
  AccountBalance as BalanceIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { selectSidebarMode, toggleSidebarMode } from '../../features/ui/uiSlice';
import { menuItems } from '../../config/menuConfig';
import apiBalanceService from '../../services/apiBalanceService';
import apiService from '../../services/api';
import usePermission from '../../hooks/usePermission';
import { useSocket } from '../../context/SocketContext';
import { setUser } from '../../features/auth/authSlice';
import '../../styles/sidebar.css';

// 메뉴 아이템정의는 menuConfig.jsx에서 import하여 사용

/**
 * 사이드바 컴포넌트
 * 
 * @param {Object} props
 * @param {Window} props.window - 창 객체
 * @param {boolean} props.mobileOpen - 모바일에서 사이드바 열림 상태
 * @param {Function} props.handleDrawerToggle - 사이드바 토글 함수
 * @returns {React.ReactElement} 사이드바 컴포넌트
 */
const Sidebar = ({ window, mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sidebarMode = useSelector(selectSidebarMode);
  const user = useSelector(state => state.auth.user);
  const { canAccessMenu, hasPermission, permissions } = usePermission();
  const { socketService } = useSocket();
  
  // 마스터 계정 여부 확인
  const isMasterAccount = user?.level === 999 || user?.username === 'master';
  
  // API 잔액 상태
  const [apiBalance, setApiBalance] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const autoRefreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const [gamingUserCount, setGamingUserCount] = useState(0);
  
  // 현재 열린 메뉴 상태 관리
  const [openMenus, setOpenMenus] = useState({});
  const [menuSettings, setMenuSettings] = useState(() => {
    // 초기값으로 localStorage에서 바로 로드
    const stored = localStorage.getItem('menuSettings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse menu settings:', e);
        return {};
      }
    }
    return {};
  });
  const [isMenuSettingsLoaded, setIsMenuSettingsLoaded] = useState(true); // 초기 로드 완료 상태

  // localStorage에서 메뉴 설정 불러오기
  const loadMenuSettings = () => {
    const stored = localStorage.getItem('menuSettings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse menu settings:', e);
        return {};
      }
    }
    return {};
  };

  // 메뉴 설정 업데이트 리스너
  useEffect(() => {
    const handleMenuSettingsUpdate = () => {
      setMenuSettings(loadMenuSettings());
    };

    // 초기 로드는 useState에서 이미 처리했으므로 제거

    // 이벤트 리스너 등록 (전역 window 객체 사용)
    if (typeof window !== 'undefined') {
      window.addEventListener('menuSettingsUpdated', handleMenuSettingsUpdate);

      return () => {
        window.removeEventListener('menuSettingsUpdated', handleMenuSettingsUpdate);
      };
    }
  }, []);

  // API 잔액 가져오기
  useEffect(() => {
    if (!user) return;
    
    setIsBalanceLoading(true);
    
    // 1단계와 마스터(999)는 에이전트 전체 잔액을 조회
    if (user.agent_level_id === 1 || user.agent_level_id === 999) {
      // 에이전트 전체 잔액 조회
      apiService.balance.getAgent()
        .then(response => {
          if (response.data.success && response.data.data) {
            setApiBalance(response.data.data.balance || 0);
          } else {
            setApiBalance(0);
          }
          setIsBalanceLoading(false);
        })
        .catch(error => {
          console.error('에이전트 잔액 조회 실패:', error);
          setApiBalance(0);
          setIsBalanceLoading(false);
        });
      
      // 30초마다 갱신
      const interval = setInterval(() => {
        apiService.balance.getAgent()
          .then(response => {
            if (response.data.success && response.data.data) {
              setApiBalance(response.data.data.balance || 0);
            }
          })
          .catch(error => {
            console.error('에이전트 잔액 조회 실패:', error);
          });
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      // 일반 사용자는 개인 Honor 잔액 조회
      // 리스너 등록
      const unsubscribe = apiBalanceService.addListener((balance) => {
        setApiBalance(balance);
        setIsBalanceLoading(false);
      });

      // 주기적 업데이트 시작 (fetchBalance는 startPolling 내부에서 호출됨)
      apiBalanceService.startPolling();

      return () => {
        unsubscribe();
        apiBalanceService.stopPolling();
      };
    }
  }, [user]);
  
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
  const handleBalanceRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return; // 이미 새로고침 중이면 중복 실행 방지
    
    isRefreshingRef.current = true;
    setIsBalanceRefreshing(true);
    
    try {
      await apiBalanceService.fetchBalance();
    } finally {
      // 약간의 지연 후 상태 변경 (깜박임 방지)
      setTimeout(() => {
        setIsBalanceRefreshing(false);
        isRefreshingRef.current = false;
      }, 500);
    }
  }, []);

  // 게임 상태 감지 및 자동 새로고침
  useEffect(() => {
    if (!socketService) return;

    const handleGameStart = (data) => {
      console.log('[Sidebar] 게임 시작 감지:', data);
      setGamingUserCount(prev => prev + 1);
    };

    const handleGameEnd = (data) => {
      console.log('[Sidebar] 게임 종료 감지:', data);
      setGamingUserCount(prev => Math.max(0, prev - 1));
    };

    socketService.on('game:started', handleGameStart);
    socketService.on('game:ended', handleGameEnd);

    return () => {
      socketService.off('game:started', handleGameStart);
      socketService.off('game:ended', handleGameEnd);
    };
  }, [socketService]);

  // 게임 중일 때 자동 새로고침
  useEffect(() => {
    if (gamingUserCount > 0 && !isAutoRefreshing) {
      console.log('[Sidebar] 자동 새로고침 시작 - 게임 중인 사용자:', gamingUserCount);
      setIsAutoRefreshing(true);
      
      // 즉시 한 번 새로고침
      handleBalanceRefresh();
      
      // 10초마다 새로고침 (API 제한 고려)
      autoRefreshTimerRef.current = setInterval(() => {
        console.log('[Sidebar] 자동 새로고침 실행');
        handleBalanceRefresh();
      }, 10000);
    } else if (gamingUserCount === 0 && isAutoRefreshing) {
      console.log('[Sidebar] 자동 새로고침 중지');
      setIsAutoRefreshing(false);
      
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [gamingUserCount, isAutoRefreshing, handleBalanceRefresh]);

  // 메뉴 아이템이 활성화되어 있는지 확인
  const isMenuEnabled = (menuId, parentId = null) => {
    // 먼저 권한 체크
    if (!canAccessMenu(menuId)) {
      return false;
    }
    
    // 그 다음 메뉴 설정 체크
    const key = parentId ? `${parentId}.${menuId}` : menuId;
    const setting = menuSettings[key];
    // 설정이 존재하고 enabled가 false인 경우만 false 반환
    if (setting && setting.enabled === false) {
      return false;
    }
    return true;
  };
  
  // 현재 경로에 따라 활성화된 메뉴 찾기
  const findActiveParent = (items) => {
    for (const item of items) {
      // 비활성화된 메뉴는 건너뛰기
      if (item.id && !item.isSpecial && !isMenuEnabled(item.id)) {
        continue;
      }
      if (item.path && location.pathname === item.path) {
        return item.text;
      }
      if (item.children) {
        for (const child of item.children) {
          // 비활성화된 자식 메뉴는 건너뛰기
          if (child.id && !isMenuEnabled(child.id, item.id)) {
            continue;
          }
          if (location.pathname === child.path) {
            return item.text;
          }
        }
      }
    }
    return null;
  };
  
  // 초기 열린 메뉴 설정
  React.useEffect(() => {
    const activeParent = findActiveParent(menuItems);
    if (activeParent) {
      setOpenMenus({
        [activeParent]: true
      });
    } else {
      // 활성화된 메뉴가 없으면 모든 메뉴를 닫음
      setOpenMenus({});
    }
  }, [location.pathname]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleMenuItemClick = (item) => {
    if (item.id === 'logout') {
      handleLogout();
    } else if (item.path && !item.children) {
      navigate(item.path);
    }
  };
  
  // 필터링된 메뉴 아이템 (권한에 따라 필터링)
  const filteredMenuItems = useMemo(() => {
    // 마스터 계정은 모든 메뉴 표시
    if (isMasterAccount) {
      return menuItems;
    }
    
    return menuItems
      .filter(item => {
        // isSpecial 메뉴는 항상 표시 (로그아웃 등)
        if (item.isSpecial) return true;
        // id가 없는 메뉴는 표시
        if (!item.id) return true;
        
        // 권한 체크는 메뉴 ID로 직접 수행
        return canAccessMenu(item.id);
      })
      .map(item => {
        // 자식 메뉴도 필터링
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(child => {
              if (!child.id) return true;
              // 마스터 계정 필요 메뉴 체크
              if (child.requireMaster && !isMasterAccount) return false;
              
              // 권한 체크는 자식 메뉴 ID로 직접 수행
              return canAccessMenu(child.id);
            })
          };
        }
        return item;
      })
      .filter(item => {
        // 자식이 모두 필터링되어 비어있는 부모 메뉴는 제거
        if (item.children && item.children.length === 0) {
          return false;
        }
        return true;
      });
  }, [menuSettings, isMasterAccount, canAccessMenu, permissions]);
  
  const handleMenuToggle = (menuText) => {
    setOpenMenus(prev => {
      // 다른 메뉴를 클릭했을 때 이전에 열려있던 모든 메뉴를 닫고 현재 클릭한 메뉴만 토글
      const newState = {};
      // 현재 클릭한 메뉴의 상태만 토글
      newState[menuText] = !prev[menuText];
      return newState;
    });
  };

  const handleSidebarModeToggle = () => {
    dispatch(toggleSidebarMode());
  };
  
  // 중첩된 메뉴 아이템 렌더링 (세로 모드)
  const NestedMenuItem = ({ item, level = 0 }) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.text] || false;
    
    // 메뉴가 활성화되어 있는지 확인 (isSpecial 메뉴는 항상 표시)
    if (item.id && !item.isSpecial && !isMenuEnabled(item.id)) {
      return null;
    }
    
    // 자식 항목 중 현재 경로와 일치하는 항목이 있는지 확인
    const hasActiveChild = hasChildren && item.children.some(child => location.pathname === child.path);
    
    return (
      <>
        <ListItemButton
          component={item.path && !hasChildren && item.id !== 'logout' ? Link : 'div'}
          to={item.path && !hasChildren && item.id !== 'logout' ? item.path : undefined}
          onClick={() => {
            if (item.id === 'logout') {
              handleLogout();
            } else if (hasChildren) {
              handleMenuToggle(item.text);
            }
          }}
          sx={{
            pl: level * 2 + 2,
            py: 1.5,
            borderRadius: '8px',
            mb: 0.5,
            backgroundColor: (isActive || hasActiveChild) ? 'rgba(54, 153, 255, 0.1)' : 'transparent',
            color: (isActive || hasActiveChild) ? '#3699FF' : '#5e6278',
            '&:hover': {
              backgroundColor: 'rgba(54, 153, 255, 0.05)',
            },
            mx: 1,
          }}
        >
          {item.icon && (
            <ListItemIcon 
              sx={{ 
                minWidth: 36, 
                color: (isActive || hasActiveChild) ? '#3699FF' : '#5e6278',
                '& .MuiSvgIcon-root': {
                  fontSize: '20px'
                }
              }}
            >
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
              fontSize: '14px',
              fontWeight: (isActive || hasActiveChild) ? 600 : 500,
            }}
          />
          {hasChildren && (
            <Box
              sx={{
                transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            >
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </ListItemButton>
        
        {hasChildren && (
          <Collapse 
            in={isOpen} 
            timeout={600}
            unmountOnExit
            sx={{
              '& .MuiList-root': {
                transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }
            }}
          >
            <List component="div" disablePadding>
              {item.children.map((child, index) => (
                <ListItemButton
                  key={index}
                  component={Link}
                  to={child.path}
                  sx={{
                    pl: (level + 1) * 2 + 2,
                    py: 1.25,
                    borderRadius: '8px',
                    mb: 0.5,
                    backgroundColor: location.pathname === child.path ? 'rgba(54, 153, 255, 0.1)' : 'transparent',
                    color: location.pathname === child.path ? '#3699FF' : '#5e6278',
                    '&:hover': {
                      backgroundColor: 'rgba(54, 153, 255, 0.05)',
                    },
                    mx: 1,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    opacity: 1,
                    transform: 'translateX(0)',
                    animation: isOpen ? 'fadeInLeft 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 36, 
                      color: location.pathname === child.path ? '#3699FF' : '#5e6278',
                    }}
                  >
                    <ChevronRight sx={{ fontSize: '16px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={child.text} 
                    primaryTypographyProps={{ 
                      fontSize: '13px',
                      fontWeight: location.pathname === child.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  };

  // 가로 모드 메뉴 아이템 렌더링
  const HorizontalMenuItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const hasActiveChild = hasChildren && item.children.some(child => location.pathname === child.path);
    
    // 메뉴가 활성화되어 있는지 확인 (isSpecial 메뉴는 항상 표시)
    if (item.id && !item.isSpecial && !isMenuEnabled(item.id)) {
      return null;
    }
    
    // 메뉴 아이템 클릭 핸들러
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    
    const handleClick = (event) => {
      if (item.id === 'logout') {
        handleLogout();
      } else if (hasChildren) {
        setAnchorEl(event.currentTarget);
      } else if (item.path) {
        navigate(item.path);
      }
    };
    
    const handleClose = () => {
      setAnchorEl(null);
    };
    
    return (
      <Box sx={{ display: 'inline-block', flexShrink: 0 }}>
        <Tooltip title={item.text}>
          <ListItemButton
            onClick={handleClick}
            sx={{
              borderRadius: '8px',
              mx: 0.5,
              px: 1,
              py: 0.5,
              minWidth: '70px',
              backgroundColor: (isActive || hasActiveChild) ? 'rgba(54, 153, 255, 0.1)' : 'transparent',
              color: (isActive || hasActiveChild) ? '#3699FF' : '#5e6278',
              '&:hover': {
                backgroundColor: 'rgba(54, 153, 255, 0.05)',
              },
              display: 'flex',
              flexDirection: 'column', // row에서 column으로 변경
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              height: '45px',
              whiteSpace: 'nowrap',
            }}
          >
            {item.icon && (
              <ListItemIcon 
                sx={{ 
                  minWidth: 'auto',
                  color: (isActive || hasActiveChild) ? '#3699FF' : '#5e6278',
                  '& .MuiSvgIcon-root': {
                    fontSize: '20px'
                  },
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '11px',
                fontWeight: (isActive || hasActiveChild) ? 600 : 500,
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              {item.text}
            </Typography>
          </ListItemButton>
        </Tooltip>
        
        {/* 서브메뉴 */}
        {hasChildren && (
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                borderRadius: '8px',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                  fontSize: '14px',
                  fontWeight: 500,
                },
              },
            }}
          >
            {item.children.map((child, index) => (
              <MenuItem 
                key={index} 
                onClick={() => {
                  handleClose();
                  if (child.path) navigate(child.path);
                }}
                sx={{
                  color: location.pathname === child.path ? '#3699FF' : '#5e6278',
                  backgroundColor: location.pathname === child.path ? 'rgba(54, 153, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(54, 153, 255, 0.05)',
                  },
                }}
              >
                {child.icon && (
                  <ListItemIcon sx={{ color: location.pathname === child.path ? '#3699FF' : '#5e6278', minWidth: '30px' }}>
                    {child.icon}
                  </ListItemIcon>
                )}
                <ListItemText primary={child.text} />
              </MenuItem>
            ))}
          </Menu>
        )}
      </Box>
    );
  };
  
  // 세로 모드 드로어 컨텐츠
  const verticalDrawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 사이드바 헤더 */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #eff2f5',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: '#181c32',
            fontSize: '18px',
          }}
        >
          관리자 대시보드
        </Typography>
        <IconButton 
          size="small" 
          onClick={handleSidebarModeToggle}
          sx={{ 
            color: '#5e6278',
            '&:hover': {
              backgroundColor: 'rgba(54, 153, 255, 0.05)',
            }
          }}
        >
          <ViewStreamIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {/* 사용자 프로필 */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 3,
          borderBottom: '1px solid #eff2f5',
        }}
      >
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 2,
            border: '3px solid #e4e6ef',
          }}
          alt="Admin User"
          src="/static/images/avatar/1.jpg"
        />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600, 
            color: '#181c32',
            fontSize: '16px',
          }}
        >
          {user?.nickname || user?.username || '관리자'}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#a1a5b7',
            fontSize: '13px',
            mb: 2,
          }}
        >
          {user?.username || user?.userId || ''}@{isMasterAccount ? 'master' : 'admin'}
        </Typography>
        
        {/* 사용자 본인의 보유금 표시 - 2단계 이상만 */}
        {user && user.agent_level_id >= 2 && (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
              p: 1.5,
              backgroundColor: '#f5f8fa',
              borderRadius: '8px',
              border: '1px solid #e4e6ef',
              width: '100%',
            }}
          >
            <MoneyIcon sx={{ color: '#F64E60', fontSize: '20px' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#7e8299',
                  fontSize: '11px',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                내 보유금
              </Typography>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#181c32',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {user.balance ? new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  maximumFractionDigits: 0
                }).format(user.balance) : '₩0'}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* API 잔액 표시 - 1단계만 */}
        {user && user.agent_level_id === 1 && (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
              p: 1.5,
              backgroundColor: '#f5f8fa',
              borderRadius: '8px',
              border: '1px solid #e4e6ef',
              width: '100%',
            }}
          >
            <BalanceIcon sx={{ color: '#3699FF', fontSize: '20px' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#7e8299',
                  fontSize: '11px',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                API 총 잔액
              </Typography>
              {isBalanceLoading ? (
                <Skeleton width="100%" height={20} />
              ) : (
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#181c32',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {apiBalanceService.formatBalance(apiBalance)}
                </Typography>
              )}
            </Box>
          <IconButton 
            size="small"
            onClick={handleBalanceRefresh}
            disabled={isBalanceRefreshing}
            sx={{ 
              color: '#7e8299',
              p: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(54, 153, 255, 0.1)',
                color: '#3699FF',
              }
            }}
          >
            <RefreshIcon 
              sx={{ 
                fontSize: '18px',
                animation: isBalanceRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }} 
            />
          </IconButton>
          </Box>
        )}
      </Box>
      
      {/* 메뉴 리스트 */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          px: 1.5,
          py: 2,
        }}
      >
        <List component="nav" disablePadding>
          {filteredMenuItems.map((item, index) => (
            <NestedMenuItem key={index} item={item} />
          ))}
        </List>
      </Box>
      
      {/* 사이드바 푸터 */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid #eff2f5',
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#a1a5b7',
            fontSize: '12px',
          }}
        >
          © 2025 NEWMOON ADMIN
        </Typography>
      </Box>
    </Box>
  );

  // 가로 모드 컨텐츠
  const horizontalContent = (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        className="css-sidebar"
        sx={{ 
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          borderBottom: 'none', // 테두리 제거하여 겹침 방지
          zIndex: 1090,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '50px', py: 0.5, px: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            overflow: 'hidden',
            mr: 2,
            width: 0, // flexGrow와 함께 사용하여 너비 제한
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              overflowX: 'auto', 
              overflowY: 'hidden',
              height: '50px',
              px: 1,
              flexWrap: 'nowrap',
              width: '100%',
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#d6d6d6',
                borderRadius: '2px',
                '&:hover': {
                  backgroundColor: '#999',
                }
              },
            }} className="horizontal-menu">
              {filteredMenuItems.map((item, index) => (
                <HorizontalMenuItem key={index} item={item} />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {/* 사용자 본인의 보유금 표시 (가로 모드) - 2단계 이상만 */}
            {user && user.agent_level_id >= 2 && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: { xs: 0.5, sm: 1 },
                  px: { xs: 1, sm: 2 },
                  backgroundColor: '#fef5f5',
                  borderRadius: '8px',
                  border: '1px solid #F64E60',
                  minWidth: { xs: 'auto', sm: '120px' },
                  flexShrink: 0,
                  '@media (max-width: 650px)': {
                    display: 'none'  // 650px 이하에서는 헤더로 이동
                  }
                }}
              >
                <MoneyIcon sx={{ 
                  color: '#F64E60', 
                  fontSize: '18px'
                }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#7e8299',
                      fontSize: { xs: '9px', sm: '10px' },
                      display: 'block'
                    }}
                  >
                    내 보유금
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#181c32',
                      fontSize: { xs: '11px', sm: '12px' },
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {user.balance ? new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                      maximumFractionDigits: 0
                    }).format(user.balance) : '₩0'}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {/* API 잔액 표시 (가로 모드) - 1단계만 */}
            {user && user.agent_level_id === 1 && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: { xs: 0.5, sm: 1 },
                  px: { xs: 1, sm: 2 },
                  backgroundColor: '#f5f8fa',
                  borderRadius: '8px',
                  border: '1px solid #e4e6ef',
                  minWidth: { xs: 'auto', sm: '150px' },
                  '@media (max-width: 650px)': {
                    display: 'none'  // 650px 이하에서는 헤더로 이동
                  }
                }}
              >
                <BalanceIcon sx={{ 
                  color: '#3699FF', 
                  fontSize: '18px'
                }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#7e8299',
                      fontSize: { xs: '9px', sm: '10px' },
                      display: 'block'
                    }}
                  >
                    API 총잔액
                  </Typography>
                  {isBalanceLoading ? (
                    <Skeleton width={60} height={14} sx={{ '@media (max-width: 650px)': { width: 50, height: 12 } }} />
                  ) : (
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#181c32',
                        fontSize: { xs: '11px', sm: '12px' },
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      {apiBalanceService.formatBalance(apiBalance)}
                    </Typography>
                  )}
                </Box>
                <IconButton 
                  size="small"
                  onClick={handleBalanceRefresh}
                  disabled={isBalanceRefreshing}
                  sx={{ 
                    color: '#7e8299',
                    p: { xs: 0.2, sm: 0.3 },
                    '&:hover': {
                      backgroundColor: 'rgba(54, 153, 255, 0.1)',
                      color: '#3699FF',
                    }
                  }}
                >
                  <RefreshIcon 
                    sx={{ 
                      fontSize: '16px',
                      animation: isBalanceRefreshing ? 'spin 1s linear infinite' : 'none',
                    }} 
                  />
                </IconButton>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  // 세로 모드 렌더링
  if (sidebarMode === 'vertical') {
    return (
      <Box
        component="nav"
        sx={{ width: { lg: 280 }, flexShrink: { lg: 0 } }}
        className="sidebar-vertical"
      >
        {/* 모바일 드로어 */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // 모바일 성능 향상을 위해
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              className: "css-sidebar",
            },
          }}
          className="css-sidebar"
        >
          {verticalDrawer}
        </Drawer>
        
        {/* 데스크탑 드로어 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              className: "css-sidebar",
              borderRight: 'none',
            },
          }}
          className="css-sidebar"
          open
        >
          {verticalDrawer}
        </Drawer>
      </Box>
    );
  }
  
  // 가로 모드 렌더링
  return (
    <Box
      component="nav"
      sx={{ 
        width: '100%',
        backgroundColor: '#ffffff',
        position: 'relative',
        zIndex: 1090, // 알림패널보다 낮게 설정
      }}
      className="sidebar-horizontal"
    >
      {horizontalContent}
    </Box>
  );
};

Sidebar.propTypes = {
  window: PropTypes.func,
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default Sidebar;
