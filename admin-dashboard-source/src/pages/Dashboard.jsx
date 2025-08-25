import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button, 
  ButtonGroup, 
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  RestartAlt as RestartAltIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  TimerOff as TimerOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/dashboard.css';
import '../styles/stats-card.css';

// 컴포넌트 가져오기
import StatsCardGrid from '../components/dashboard/StatsCardGrid';
import DashboardChartsSection from '../components/dashboard/DashboardChartsSection';
import useAutoRefresh from '../hooks/useAutoRefresh';

// Redux 액션 및 선택자 가져오기
import { 
  setPeriod, 
  setLoading, 
  selectPeriod, 
  selectLoading,
  resetStatsLayout,
  resetDashboardLayout,
  initializeCards
} from '../features/dashboard/dashboardSlice';

// 권한 관련 Redux 액션 및 선택자 가져오기
import { 
  selectRolePermissions,
  fetchRolePermissions
} from '../features/permissions/permissionsSlice';

// 동적 타입 및 카드 생성
import useDynamicTypes from '../hooks/useDynamicTypes';
import { generateAllCards } from '../features/dashboard/cardGenerator';

// Dashboard Data Service import
import { getAllDashboardData } from '../services/dashboardDataService';

/**
 * 대시보드 컴포넌트
 * 관리자 대시보드의 메인 페이지로 통계 카드와 데이터 시각화를 제공합니다.
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const period = useSelector(selectPeriod);
  const loading = useSelector(selectLoading);
  
  // 현재 사용자의 역할 ID 가져오기 (로컬 스토리지 또는 세션에서)
  const getCurrentUserRoleId = () => {
    // 먼저 세션 스토리지에서 확인
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.roleId || parsed.role_id || 1; // 기본값 1 (슈퍼관리자)
    }
    
    // 로컬 스토리지에서 확인
    const localUserInfo = localStorage.getItem('userInfo');
    if (localUserInfo) {
      const parsed = JSON.parse(localUserInfo);
      return parsed.roleId || parsed.role_id || 1;
    }
    
    // 기본값 반환 (슈퍼관리자)
    return 1;
  };
  
  const currentUserRoleId = getCurrentUserRoleId();
  
  // 현재 사용자의 권한 가져오기
  const userPermissions = useSelector((state) => selectRolePermissions(state, currentUserRoleId));
  
  // 자동 새로고침 권한 확인 (권한 ID 103)
  const hasAutoRefreshPermission = userPermissions && userPermissions.includes(103);
  
  // 동적 에이전트 레벨 데이터 가져오기
  const { agentLevels, isLoading: levelsLoading } = useDynamicTypes();
  const [cardsInitialized, setCardsInitialized] = useState(false);
  
  // API 데이터 상태 관리
  const [apiData, setApiData] = useState(null);
  
  // 자동 새로고침 상태 관리 (권한이 없으면 비활성화)
  const [refreshInterval, setRefreshInterval] = useState(hasAutoRefreshPermission ? 30000 : 0); // 권한에 따라 기본값 설정
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(hasAutoRefreshPermission); // 권한에 따라 활성화 여부 설정
  
  // 레이아웃 초기화 - 렌더링 전에 로컬 스토리지 정리
  useLayoutEffect(() => {
    // 모든 그리드 레이아웃 관련 로컬 스토리지 데이터 삭제
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rgl-') || key.includes('Layout'))) {
        localStorage.removeItem(key);
      }
    }
  }, []);
  
  // 기간 변경 핸들러
  const handlePeriodChange = (newPeriod) => {
    dispatch(setPeriod(newPeriod));
    dispatch(setLoading(true));
    
    // API 호출을 시뮬레이션하기 위한 타임아웃
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 800);
  };
  
  // 레이아웃 초기화 핸들러
  const handleResetLayout = () => {
    // 모든 그리드 레이아웃 관련 로컬 스토리지 데이터 삭제
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rgl-') || key.includes('Layout'))) {
        localStorage.removeItem(key);
      }
    }
    
    // 레이아웃 리셋 액션 디스패치
    dispatch(resetStatsLayout());
    dispatch(resetDashboardLayout());
    
    // 페이지 새로고침으로 모든 레이아웃 초기화
    window.location.reload();
  };
  
  // API 데이터 가져오기 함수 (useCallback으로 메모이제이션)
  const fetchApiData = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 Dashboard: Fetching API data for period:', period);
    }
    
    try {
      const data = await getAllDashboardData(period);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Dashboard: Raw API response:', data);
      }
      setApiData(data);
      
      if (data && data.hasData) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Dashboard: API data loaded successfully:', data);
          console.log('📊 Dashboard: overview data:', data.overview);
          console.log('👥 Dashboard: userMetrics data:', data.userMetrics);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Dashboard: API returned no data, using fallback');
        }
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching API data:', error);
      setApiData(null);
    }
  }, [period]);

  // 대시보드 새로고침 핸들러
  const handleRefresh = async () => {
    dispatch(setLoading(true));
    await fetchApiData();
    dispatch(setLoading(false));
    
    // 자동 새로고침 타이머 리셋
    if (resetTimer) {
      resetTimer();
    }
  };
  
  // 자동 새로고침 훅 사용
  const { remainingTime, resetTimer, isRefreshing } = useAutoRefresh(
    fetchApiData,
    refreshInterval,
    autoRefreshEnabled
  );
  
  // 새로고침 간격 변경 핸들러
  const handleIntervalChange = (event) => {
    // 권한이 없으면 변경 불가
    if (!hasAutoRefreshPermission) {
      console.warn('자동 새로고침 권한이 없습니다.');
      return;
    }
    
    const newInterval = event.target.value;
    setRefreshInterval(newInterval);
    
    // 0이면 자동 새로고침 비활성화
    if (newInterval === 0) {
      setAutoRefreshEnabled(false);
    } else {
      setAutoRefreshEnabled(true);
    }
    
    // localStorage에 설정 저장
    localStorage.setItem('dashboardRefreshInterval', newInterval);
  };
  
  // 컴포넌트 마운트 시 권한 데이터 로드
  useEffect(() => {
    // 현재 사용자의 권한 데이터 로드
    if (currentUserRoleId) {
      dispatch(fetchRolePermissions(currentUserRoleId));
    }
  }, [currentUserRoleId, dispatch]);
  
  // 권한 변경 시 자동 새로고침 설정 업데이트
  useEffect(() => {
    if (hasAutoRefreshPermission) {
      // 권한이 있는 경우 저장된 설정 불러오기
      const savedInterval = localStorage.getItem('dashboardRefreshInterval');
      if (savedInterval !== null) {
        const interval = parseInt(savedInterval, 10);
        setRefreshInterval(interval);
        setAutoRefreshEnabled(interval > 0);
      } else {
        // 저장된 설정이 없으면 기본값 사용
        setRefreshInterval(30000);
        setAutoRefreshEnabled(true);
      }
    } else {
      // 권한이 없는 경우 자동 새로고침 비활성화
      setRefreshInterval(0);
      setAutoRefreshEnabled(false);
    }
  }, [hasAutoRefreshPermission]);
  
  // 동적 카드 초기화
  useEffect(() => {
    if (agentLevels && agentLevels.length > 0 && !cardsInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 에이전트 레벨 데이터로 카드 초기화:', agentLevels);
      }
      
      // 카드 생성
      const dynamicCards = generateAllCards(agentLevels);
      
      // Redux store에 카드 초기화
      dispatch(initializeCards({ cards: dynamicCards }));
      setCardsInitialized(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${dynamicCards.length}개 카드가 초기화되었습니다.`);
      }
    }
  }, [agentLevels, cardsInitialized, dispatch]);
  
  // API 데이터 로드 (초기 로드 및 period 변경 시)
  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]); // fetchApiData가 변경되면 (period 변경 시) 데이터 다시 가져오기

  // 대시보드 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      dispatch(setLoading(true));
      try {
        // API 요청을 모방한 비동기 작업
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 실제 구현에서는 여기서 API 호출
        // const response = await fetch('/api/dashboard/stats');
        // const data = await response.json();
        // setStatsData(data);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // 리사이즈 타이머 관리
  const resizeTimerRef = useRef(null);
  
  // 리사이즈 이벤트 핸들러
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      
      resizeTimerRef.current = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        resizeTimerRef.current = null;
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, []);
    
  return (
    <Box 
      className="dashboard-container"
      sx={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        p: 3,
        position: 'relative'
      }}
    >
      <Paper 
        className="dashboard-header"
        elevation={1}
        sx={{ 
          width: '100%', 
          mb: 3, 
          position: 'relative', 
          zIndex: 10,
          p: 2,
          borderRadius: '8px',
          boxShadow: '0px 0px 20px rgba(76, 87, 125, 0.05)',
          border: '1px solid #E4E6EF',
        }}
      >
        <Box 
          className="dashboard-title"
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h5" fontWeight={600} color="#181C32" sx={{ display: 'flex', alignItems: 'center' }}>
            대시보드
            <Tooltip 
              title="대시보드에서는 사이트의 전반적인 통계와 현황을 확인할 수 있습니다. 각 카드는 드래그하여 위치를 변경할 수 있으며, 크기도 조절 가능합니다."
              arrow
              placement="right"
            >
              <IconButton size="small" sx={{ ml: 0.5, color: '#5E6278', padding: '2px' }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="body2" color="#5E6278" mt={0.5}>
            사이트 통계 및 현황을 한 눈에 확인하세요
          </Typography>
        </Box>
      </Paper>

      {/* StatsCardGrid 컴포넌트 */}
      <Box 
        className="stats-cards-container"
        sx={{ width: '100%', mb: 2 }}
      >
        <StatsCardGrid 
          loading={loading} 
          onRefresh={handleRefresh} 
          onResetLayout={handleResetLayout}
          apiData={apiData}
          refreshInterval={refreshInterval}
          onIntervalChange={handleIntervalChange}
          autoRefreshEnabled={autoRefreshEnabled}
          remainingTime={remainingTime}
          isRefreshing={isRefreshing}
          hasAutoRefreshPermission={hasAutoRefreshPermission}
        />
      </Box>

      <Divider 
        sx={{ 
          my: 3, 
          borderColor: '#E4E6EF',
          borderWidth: '1px',
          width: '100%',
          '&::before, &::after': {
            borderColor: '#E4E6EF',
          }
        }} 
      />

      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mt: 4,
          mb: 3,
          px: 1
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight={600} 
          color="#181C32" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            position: 'relative',
            paddingBottom: '8px',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '40px',
              height: '3px',
              backgroundColor: '#3699FF',
              borderRadius: '2px'
            }
          }}
        >
          대시보드
          <Tooltip 
            title="다양한 통계 데이터를 차트로 시각화하여 보여줍니다. 각 차트는 사이트의 주요 지표와 추세를 파악하는데 도움이 됩니다. 기본 월별로 표기되며, 롤링금은 기본 누적된 금액으로 표시됩니다."
            arrow
            placement="right"
          >
            <IconButton size="small" sx={{ ml: 0.5, color: '#5E6278', padding: '2px' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ButtonGroup size="small" variant="outlined" sx={{ mr: 2 }}>
            <Button 
              onClick={() => handlePeriodChange('daily')}
              variant={period === 'daily' ? 'contained' : 'outlined'}
            >
              일별
            </Button>
            <Button 
              onClick={() => handlePeriodChange('weekly')}
              variant={period === 'weekly' ? 'contained' : 'outlined'}
            >
              주별
            </Button>
            <Button 
              onClick={() => handlePeriodChange('monthly')}
              variant={period === 'monthly' ? 'contained' : 'outlined'}
            >
              월별
            </Button>
          </ButtonGroup>
          
          <Tooltip title="레이아웃 초기화">
            <IconButton 
              onClick={handleResetLayout}
              size="small"
              sx={{ 
                color: '#3699FF',
                '&:hover': {
                  backgroundColor: 'rgba(54, 153, 255, 0.04)',
                }
              }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* DashboardChartsSection 컴포넌트 */}
      <Box 
        className="dashboard-charts-container"
        sx={{ width: '100%' }}
      >
        <DashboardChartsSection loading={loading} />
      </Box>
    </Box>
  );
};

export default Dashboard; 

