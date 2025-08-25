import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, useTheme, useMediaQuery, CircularProgress, Typography, Button, FormControl, Select, MenuItem, InputLabel, IconButton, Tooltip, Chip } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useSelector, useDispatch } from 'react-redux';
import StatsCardItem from './StatsCardItem';
import DisplayOptionsPanel from './DisplayOptionsPanel';
import { 
  selectStatsCards, 
  selectStatsLayouts, 
  setStatsLayouts,
  selectPeriod,
  setPeriod
} from '../../features/dashboard/dashboardSlice';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Info as InfoIcon, Timer as TimerIcon, TimerOff as TimerOffIcon } from '@mui/icons-material';
import '../../styles/react-grid-layout.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { DragIndicator as DragIndicatorIcon } from '@mui/icons-material';

// 반응형 그리드 레이아웃 설정
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * 통계 카드 그리드 컴포넌트
 * 반응형 그리드 레이아웃으로 통계 카드를 표시합니다.
 * 
 * @param {boolean} loading - 로딩 상태
 * @param {function} onRefresh - 새로고침 핸들러
 * @param {function} onResetLayout - 레이아웃 초기화 핸들러
 * @param {Object} apiData - API에서 받은 데이터
 * @param {number} refreshInterval - 새로고침 간격
 * @param {function} onIntervalChange - 간격 변경 핸들러
 * @param {boolean} autoRefreshEnabled - 자동 새로고침 활성화 여부
 * @param {number} remainingTime - 남은 시간
 * @param {boolean} isRefreshing - 새로고침 중 여부
 * @returns {JSX.Element} 통계 카드 그리드 컴포넌트
 */
const StatsCardGrid = ({ 
  loading, 
  onRefresh, 
  onResetLayout, 
  apiData,
  refreshInterval,
  onIntervalChange,
  autoRefreshEnabled,
  remainingTime,
  isRefreshing,
  hasAutoRefreshPermission = true
}) => {
  const dispatch = useDispatch();
  
  // API 데이터 디버깅
  useEffect(() => {
    // console.log('🔍 StatsCardGrid received apiData:', apiData);
    if (apiData) {
      // console.log('📌 StatsCardGrid apiData structure:', {
      //   hasOverview: !!apiData.overview,
      //   hasUserMetrics: !!apiData.userMetrics,
      //   hasSystemStatus: !!apiData.systemStatus,
      //   overviewData: apiData.overview,
      //   userMetricsData: apiData.userMetrics
      // });
    }
  }, [apiData]);
  const theme = useTheme();
  const cards = useSelector(selectStatsCards);
  const layouts = useSelector(selectStatsLayouts);
  const period = useSelector(selectPeriod);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 미디어 쿼리
  const isXs = useMediaQuery(theme.breakpoints.down('sm')); // 600px 이하
  const isSm = useMediaQuery('(max-width:800px)'); // 800px 이하
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  // 700px 미만에서는 드래그 비활성화
  const isDraggableScreen = useMediaQuery('(min-width:700px)');
  
  // 현재 표시할 카드 필터링
  const visibleCards = useMemo(() => 
    cards.filter(card => card.visible),
  [cards]);
  
  // 카드 ID 문자열 - 의존성 배열에 사용
  const visibleCardIds = useMemo(() => 
    visibleCards.map(card => card.id).join(','),
  [visibleCards]);
  
  // xs 레이아웃 생성 (2개의 카드를 한 줄에 표시)
  const generateXsLayout = () => {
    return visibleCards.map((card, index) => ({
      i: card.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2),
      w: 6,
      h: 1,
    }));
  };

  // 레이아웃 설정
  const layoutsConfig = useMemo(() => {
    return {
      lg: visibleCards.map((card, index) => ({
        i: card.id,
        x: (index % 6) * 2,  // 한 줄에 6개씩
        y: Math.floor(index / 6),
        w: 2,
        h: 1,
        minW: 2,
        maxW: 4,
        minH: 1,
        maxH: 1
      })),
      md: visibleCards.map((card, index) => ({
        i: card.id,
        x: (index % 4) * 3,  // 한 줄에 4개씩
        y: Math.floor(index / 4),
        w: 3,
        h: 1,
        minW: 2,
        maxW: 4,
        minH: 1,
        maxH: 1
      })),
      sm: visibleCards.map((card, index) => ({
        i: card.id,
        x: (index % 4) * 3,
        y: Math.floor(index / 4),
        w: 3,
        h: 1,
        minW: 2,
        maxW: 6,
        minH: 1,
        maxH: 1
      })),
      xs: generateXsLayout(),
    };
  }, [visibleCards]);
  
  // 카드 선택이 변경될 때 레이아웃 재생성
  useEffect(() => {
    // 표시할 카드가 변경되었을 때 레이아웃 재생성
    if (visibleCards.length > 0) {
      // 기존 레이아웃이 없거나 카드 수가 다른 경우 새 레이아웃 생성
      if (!layouts || Object.keys(layouts).length === 0 || 
          (layouts.lg && layouts.lg.length !== visibleCards.length)) {
        dispatch(setStatsLayouts(layoutsConfig));
      }
    }
  }, [visibleCardIds, dispatch]);
  
  // localStorage에서 저장된 레이아웃 초기화
  useEffect(() => {
    localStorage.removeItem('statsLayouts');
  }, []);
  
  // 레이아웃 변경 핸들러
  const onLayoutChange = (currentLayout, allLayouts) => {
    // 드래그 중이거나 레이아웃이 변경될 때 호출됨
    // 모든 브레이크포인트에 대한 레이아웃을 저장
    if (allLayouts && Object.keys(allLayouts).length > 0) {
      // 각 브레이크포인트의 레이아웃이 유효한지 확인
      const isValidLayouts = Object.entries(allLayouts).every(([breakpoint, layout]) => {
        return layout && layout.length > 0 && layout.every(item => 
          item.i && // 아이템 ID가 있어야 함
          typeof item.x === 'number' && item.x >= 0 &&
          typeof item.y === 'number' && item.y >= 0 &&
          typeof item.w === 'number' && item.w > 0 &&
          typeof item.h === 'number' && item.h > 0
        );
      });
      
      if (isValidLayouts) {
        dispatch(setStatsLayouts(allLayouts));
      }
    }
  };

  // 기간 변경 핸들러
  const handlePeriodChange = (event) => {
    dispatch(setPeriod(event.target.value));
  };
  
  // 드래그 시작 핸들러
  const onDragStart = () => {
    setIsDragging(true);
  };
  
  // 드래그 종료 핸들러
  const onDragStop = () => {
    setIsDragging(false);
  };
  
  // API 데이터와 하드코딩된 데이터 병합 헬퍼 함수
  const getCardValue = (card, valueType = 'value') => {
    const cardKey = card.cardKey || card.key || card.id;
    
    // API 데이터가 있으면 먼저 시도
    if (apiData) {
    // console.log(`🔍 Checking API data for ${cardKey}, apiData:`, apiData);
      const apiValue = getApiValueForCard(card, apiData, valueType);
      if (apiValue !== null && apiValue !== undefined) {
    // console.log(`✅ Using API data for ${cardKey}:`, apiValue);
        return apiValue;
      }
    }
    
    // API 데이터가 없으면 하드코딩된 데이터 사용
    // console.log(`⚠️ Using fallback data for ${cardKey}:`, card[valueType]);
    return card[valueType];
  };
  
  // API 데이터에서 특정 카드에 맞는 값 추출
  const getApiValueForCard = (card, apiData, valueType) => {
    // card.cardKey가 실제 키 값
    const cardKey = card.cardKey || card.key || card.id;
    
    // console.log(`🔎 getApiValueForCard called for ${cardKey}, valueType: ${valueType}`);
    // console.log('📦 apiData structure:', {
    //   hasOverview: !!apiData.overview,
    //   overviewKeys: apiData.overview ? Object.keys(apiData.overview) : [],
    //   hasUserMetrics: !!apiData.userMetrics,
    //   userMetricsKeys: apiData.userMetrics ? Object.keys(apiData.userMetrics) : []
    // });
    
    // overview 데이터에서 찾기 (settlement-api/dashboard)
    if (apiData.overview) {
      // apiData.overview가 직접 데이터인 경우 (이미 data 필드만 포함)
      const settlementData = apiData.overview;
      
    // console.log(`📊 Settlement data for ${cardKey}:`, settlementData);
      
      switch(cardKey) {
        case 'betting':
          if (valueType === 'value') {
            if (settlementData.betting && Array.isArray(settlementData.betting)) {
              const sum = settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_bet || 0), 0);
    // console.log(`💰 Betting sum calculated:`, sum);
              return sum;
            }
            // totals에서도 확인
            if (settlementData.totals && settlementData.totals.total_bet !== undefined) {
              return parseFloat(settlementData.totals.total_bet);
            }
          }
          break;
        case 'winning':
          if (valueType === 'value') {
            if (settlementData.betting && Array.isArray(settlementData.betting)) {
              const sum = settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_win || 0), 0);
    // console.log(`🏆 Winning sum calculated:`, sum);
              return sum;
            }
            // totals에서도 확인
            if (settlementData.totals && settlementData.totals.total_win !== undefined) {
              return parseFloat(settlementData.totals.total_win);
            }
          }
          break;
        case 'deposit':
          if (valueType === 'value' && settlementData.totals) {
            const depositValue = parseFloat(settlementData.totals.total_deposit || 0);
    // console.log(`💳 Deposit value:`, depositValue);
            return depositValue;
          }
          break;
        case 'withdrawal':
          if (valueType === 'value' && settlementData.totals) {
            const withdrawalValue = parseFloat(settlementData.totals.total_withdrawal || 0);
    // console.log(`💸 Withdrawal value:`, withdrawalValue);
            return withdrawalValue;
          }
          break;
        case 'bettingProfit':
          // 베팅손익 = 베팅금 - 당첨금
          if (valueType === 'value') {
            const bettingTotal = settlementData.betting ? 
              settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_bet || 0), 0) : 0;
            const winningTotal = settlementData.betting ?
              settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_win || 0), 0) : 0;
            const profit = bettingTotal - winningTotal;
    // console.log(`💵 Betting profit:`, profit);
            return profit;
          }
          break;
        case 'depositWithdrawalProfit':
          // 충환손익 = 입금 - 출금
          if (valueType === 'value' && settlementData.totals) {
            const depositTotal = parseFloat(settlementData.totals.total_deposit || 0);
            const withdrawalTotal = parseFloat(settlementData.totals.total_withdrawal || 0);
            const profit = depositTotal - withdrawalTotal;
    // console.log(`💰 Deposit/Withdrawal profit:`, profit);
            return profit;
          }
          break;
        case 'rolling':
          // 롤링금 (totals에서 가져오기)
          if (valueType === 'value' && settlementData.totals) {
            const rollingValue = parseFloat(settlementData.totals.total_rolling || 0);
    // console.log(`🎲 Rolling value:`, rollingValue);
            return rollingValue;
          }
          break;
        case 'settlement':
          // 정산금 (현재 API에 없으므로 0 반환)
          if (valueType === 'value') {
    // console.log(`📊 Settlement value: 0 (not in API)`);
            return 0;
          }
          break;
        case 'totalProfit':
          // 총손익 = 베팅손익 + 충환손익
          if (valueType === 'value') {
            const bettingTotal = settlementData.betting ? 
              settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_bet || 0), 0) : 0;
            const winningTotal = settlementData.betting ?
              settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_win || 0), 0) : 0;
            const bettingProfit = bettingTotal - winningTotal;
            
            const depositTotal = settlementData.totals ? parseFloat(settlementData.totals.total_deposit || 0) : 0;
            const withdrawalTotal = settlementData.totals ? parseFloat(settlementData.totals.total_withdrawal || 0) : 0;
            const depositProfit = depositTotal - withdrawalTotal;
            
            const totalProfit = bettingProfit + depositProfit;
    // console.log(`💎 Total profit:`, totalProfit);
            return totalProfit;
          }
          break;
        case 'rtp':
          // RTP = (당첨금 / 베팅금) * 100
          if (valueType === 'value') {
            const bettingTotal = settlementData.betting ? 
              settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_bet || 0), 0) : 0;
            const winningTotal = settlementData.betting ?
              settlementData.betting.reduce((sum, stat) => sum + parseFloat(stat.total_win || 0), 0) : 0;
            const rtp = bettingTotal > 0 ? (winningTotal / bettingTotal) * 100 : 0;
    // console.log(`📈 RTP:`, rtp.toFixed(2));
            return rtp.toFixed(2);
          }
          break;
      }
    }
    
    // userMetrics 데이터에서 찾기 (user-status/all)
    if (apiData.userMetrics) {
      const userStatusData = apiData.userMetrics;
      
      switch(cardKey) {
        case 'activeUsers':
          if (valueType === 'value' && userStatusData.statistics) {
            return userStatusData.statistics.online || 0;
          }
          break;
        case 'totalUsers':
          if (valueType === 'value' && userStatusData.statistics) {
            return userStatusData.statistics.total || 0;
          }
          break;
      }
    }
    
    return null;
  };
  
  // 현재 사용할 레이아웃 결정
  const currentLayouts = useMemo(() => {
    // 저장된 레이아웃이 있고 유효한 경우 사용
    if (layouts && Object.keys(layouts).length > 0) {
      // 레이아웃의 카드 수가 현재 표시 카드 수와 일치하는지 확인
      const isValidLayoutCount = Object.values(layouts).every(breakpointLayout => 
        breakpointLayout.length === visibleCards.length
      );
      
      if (isValidLayoutCount) {
        // 깊은 복사로 새 객체 생성
        const copiedLayouts = {};
        Object.keys(layouts).forEach(breakpoint => {
          copiedLayouts[breakpoint] = layouts[breakpoint].map(item => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            static: item.static || false
          }));
        });
        return copiedLayouts;
      }
    }
    
    // 그렇지 않으면 기본 레이아웃 사용 (깊은 복사)
    const copiedLayouts = {};
    Object.keys(layoutsConfig).forEach(breakpoint => {
      copiedLayouts[breakpoint] = layoutsConfig[breakpoint].map(item => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        static: item.static || false
      }));
    });
    return copiedLayouts;
  }, [layouts, layoutsConfig, visibleCards.length]);
  
  return (
    <Box 
      className="stats-grid-container" 
      sx={{ 
        mb: 3,
        padding: isXs || isSm ? 0 : undefined // 800px 이하에서 패딩 제거
      }} 
      ref={containerRef}
    >
      {/* 현황판 타이틀과 필터, 버튼들 */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: { xs: 2, sm: 0 },
        px: isXs || isSm ? 1 : 2 // 작은 화면에서 좌우 패딩 조정
      }}>
        <Typography variant="h5" color="text.primary" fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}>
          현황판
          <Tooltip 
            title="현황판에서는 주요 통계 지표를 카드 형태로 확인할 수 있습니다. 각 카드는 선택한 기간에 따라 데이터가 업데이트됩니다. 기본은 데이터는 당일이며 24시간 00시 이후 리셋됩니다."
            arrow
            placement="right"
          >
            <IconButton size="small" sx={{ ml: 0.5, color: '#5E6278', padding: '2px' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <FormControl size="small" sx={{ 
            minWidth: { xs: '60px', sm: '100px' },
            flex: { xs: '1 1 auto', sm: '0 0 auto' }
          }}>
            <InputLabel id="period-select-label">기간</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              label="기간"
              onChange={handlePeriodChange}
            >
              <MenuItem value="daily">일별</MenuItem>
              <MenuItem value="weekly">주별</MenuItem>
              <MenuItem value="monthly">월별</MenuItem>
            </Select>
          </FormControl>
          
          {/* 자동 새로고침 설정 - 권한이 있는 경우에만 표시 */}
          {hasAutoRefreshPermission && (
            <>
              <FormControl size="small" sx={{ 
                minWidth: { xs: '120px', sm: '150px' },
                flex: { xs: '0 0 auto', sm: '0 0 auto' }
              }}>
                <Select
                  value={refreshInterval || 30000}
                  onChange={onIntervalChange}
                  displayEmpty
                  startAdornment={
                    refreshInterval > 0 ? (
                      <TimerIcon sx={{ mr: 0.5, fontSize: 18, color: '#5E6278' }} />
                    ) : (
                      <TimerOffIcon sx={{ mr: 0.5, fontSize: 18, color: '#5E6278' }} />
                    )
                  }
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                >
                  <MenuItem value={0}>끄기</MenuItem>
                  <MenuItem value={10000}>10초</MenuItem>
                  <MenuItem value={30000}>30초</MenuItem>
                  <MenuItem value={60000}>1분</MenuItem>
                  <MenuItem value={300000}>5분</MenuItem>
                </Select>
              </FormControl>
              
              {/* 남은 시간 표시 (데스크탑만) */}
              {autoRefreshEnabled && refreshInterval > 0 && !isXs && (
                <Chip
                  icon={<RefreshIcon sx={{ fontSize: 14 }} />}
                  label={isRefreshing ? '새로고침 중...' : `${remainingTime}초`}
                  size="small"
                  color={isRefreshing ? 'primary' : 'default'}
                  variant={isRefreshing ? 'filled' : 'outlined'}
                  sx={{
                    minWidth: 80,
                    '& .MuiChip-label': {
                      fontSize: '0.75rem'
                    },
                    display: { xs: 'none', sm: 'flex' }
                  }}
                />
              )}
            </>
          )}
          
          {onRefresh && (
            <Tooltip title={loading || isRefreshing ? "새로고침 중..." : "즉시 새로고침"}>
              <span>
                <IconButton
                  color="primary"
                  onClick={onRefresh}
                  disabled={loading || isRefreshing}
                  size="small"
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.dark',
                    },
                    '&:disabled': {
                      borderColor: 'action.disabled',
                    }
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <DisplayOptionsPanel buttonVariant="text" containerRef={containerRef} />
        </Box>
      </Box>

      {/* 카드 그리드 컨테이너 */}
      <Box 
        className="stats-card-grid-container" 
        sx={{ 
          width: '100%', 
          position: 'relative',
        }}
      >
        {/* 로딩 인디케이터 */}
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* 그리드 레이아웃 */}
        <ResponsiveGridLayout
          className="layout"
          layouts={currentLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
          rowHeight={130}
          margin={{ xs: [10, 10], sm: [15, 15], md: [20, 20], lg: [20, 20] }}
          containerPadding={{ xs: [5, 5], sm: [8, 8], md: [10, 10], lg: [10, 10] }}
          onLayoutChange={onLayoutChange}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          isDraggable={isDraggableScreen && !loading}
          isResizable={false}
          useCSSTransforms={true}
          draggableHandle=".stats-card-drag-handle"
          draggableCancel=""
          isBounded={false}
          compactType={null}
          preventCollision={false}
        >
          {visibleCards.map((card, index) => {
            const cardValue = getCardValue(card, 'value');
            const cardPreviousValue = getCardValue(card, 'previousValue');
            
            // 첫 번째 몇 개 카드만 상세 로그
            if (index < 3) {
              // console.log(`🎯 Rendering card ${index}:`, {
              //   id: card.id,
              //   cardKey: card.cardKey,
              //   key: card.key,
              //   title: card.title,
              //   value: cardValue,
              //   previousValue: cardPreviousValue,
              //   hasApiData: !!apiData
              // });
            }
            
            return (
              <Box 
                key={card.id} 
                className="stats-card"
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E4E6EF',
                  borderRadius: '12px',
                  boxShadow: '0 0 20px 0 rgba(76, 87, 125, 0.05)',
                  '&:hover': {
                    boxShadow: '0 2px 30px 0 rgba(76, 87, 125, 0.08)',
                    borderColor: '#D7DAE3'
                  }
                }}
              >
                <StatsCardItem
                  id={card.id}
                  title={card.title}
                  value={cardValue}
                  previousValue={cardPreviousValue}
                  suffix={card.suffix}
                  loading={loading}
                  icon={card.icon}
                  color={card.color}
                  type={card.type}
                  info={card.info || '지난 30일 대비'}
                  draggableProps={{
                    className: 'stats-card-header'
                  }}
                  dragHandleProps={{}}
                />
              </Box>
            );
          })}
        </ResponsiveGridLayout>
      </Box>
    </Box>
  );
};

export default StatsCardGrid;