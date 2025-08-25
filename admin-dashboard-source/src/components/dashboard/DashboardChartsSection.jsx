import React, { useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography, Paper, Grid, useTheme, Card, CardContent, Divider } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import BettingWinningChart from '../dashboard/charts/BettingWinningChart';
import DepositWithdrawalChart from '../dashboard/charts/DepositWithdrawalChart';
import RollingAmountChart from '../dashboard/charts/RollingAmountChart';
import RollingStatusTable from '../dashboard/tables/RollingStatusTable';
import ActiveUsersTable from '../dashboard/tables/ActiveUsersTable';
import DepositWithdrawalGraph from '../dashboard/charts/DepositWithdrawalGraph';
import BettingWinningActivityGraph from '../dashboard/charts/BettingWinningActivityGraph';
import { 
  selectDashboardItems, 
  selectDashboardLayouts, 
  setDashboardLayouts 
} from '../../features/dashboard/dashboardSlice';
import '../../styles/react-grid-layout.css';
import '../../styles/dashboard-comparison-card.css';

// 반응형 그리드 레이아웃 설정
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * 대시보드 차트 섹션 컴포넌트
 * 
 * @param {Object} props
 * @param {boolean} props.loading - 로딩 상태
 * @returns {JSX.Element} 대시보드 차트 섹션 컴포넌트
 */
const DashboardChartsSection = ({ loading }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const dashboardItems = useSelector(selectDashboardItems);
  const savedLayouts = useSelector(selectDashboardLayouts);
  
  // 이전 레이아웃 저장용 ref
  const layoutsRef = useRef(null);
  
  // 현재 표시할 아이템 필터링
  const visibleItems = useMemo(() => 
    dashboardItems.filter(item => item.visible),
  [dashboardItems]);

  // 화면 옵션에 따라 표시할 컴포넌트 ID 확인
  const visibleComponentIds = useMemo(() => {
    return visibleItems.map(item => item.id);
  }, [visibleItems]);
  
  // 롤링금 상태 테이블 표시 여부
  const showRollingStatus = useMemo(() => 
    visibleComponentIds.includes('rolling-status'),
  [visibleComponentIds]);
  
  // 접속자 현황 테이블 표시 여부
  const showActiveUsers = useMemo(() => 
    visibleComponentIds.includes('active-users'),
  [visibleComponentIds]);

  // 입금/출금 그래프 표시 여부
  const showDepositWithdrawalGraph = useMemo(() => 
    visibleComponentIds.includes('deposit-withdrawal-graph'),
  [visibleComponentIds]);

  // 베팅/당첨금 그래프 표시 여부
  const showBettingWinningGraph = useMemo(() => 
    visibleComponentIds.includes('betting-winning-graph'),
  [visibleComponentIds]);

  // 레이아웃 초기화 - useLayoutEffect를 사용하여 렌더링 전에 실행
  useLayoutEffect(() => {
    // 저장된 레이아웃 데이터 삭제
    localStorage.removeItem('dashboardLayouts');
    localStorage.removeItem('rgl-8');
    
    // 모든 rgl 관련 저장 데이터 삭제
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rgl-')) {
        localStorage.removeItem(key);
      }
    }
  }, []);
  
  // 저장된 레이아웃이 있으면 로드
  useEffect(() => {
    if (savedLayouts) {
      layoutsRef.current = savedLayouts;
    }
  }, [savedLayouts]);

  // 섹션 데이터
  const sectionData = [
    {
      id: "bettingWinningComparison",
      title: "베팅/당첨금 금액 비교",
      items: [
        {
          id: "betting",
          title: "베팅금액",
          currentValue: 97500000,
          previousValue: 85300000,
        },
        {
          id: "winning",
          title: "당첨금액",
          currentValue: 90250000,
          previousValue: 78450000,
        }
      ]
    },
    {
      id: "depositWithdrawalComparison",
      title: "입금/출금 금액 비교",
      items: [
        {
          id: "deposit",
          title: "입금액",
          currentValue: 24300000,
          previousValue: 21750000,
        },
        {
          id: "withdraw",
          title: "출금액",
          currentValue: 18500000,
          previousValue: 16200000,
        }
      ]
    },
    {
      id: "rollingAmountComparison",
      title: "롤링금 비교",
      items: [
        {
          id: "rolling",
          title: "롤링금액",
          currentValue: 13200000,
          previousValue: 12100000,
        },
        {
          id: "rollingConversion",
          title: "롤링전환액",
          currentValue: 8650000,
          previousValue: 7980000,
        }
      ]
    }
  ];
  
  // 기본 레이아웃 설정
  const defaultLayouts = {
    lg: [
      { i: 'bettingWinningComparison', x: 0, y: 0, w: 4, h: 2, static: false },
      { i: 'depositWithdrawalComparison', x: 4, y: 0, w: 4, h: 2, static: false },
      { i: 'rollingAmountComparison', x: 8, y: 0, w: 4, h: 2, static: false },
      { i: 'rolling-status', x: 0, y: 2, w: 12, h: 3.1, static: false },
      { i: 'active-users', x: 0, y: 5.1, w: 12, h: 3.1, static: false },
      { i: 'deposit-withdrawal-graph', x: 0, y: 8.2, w: 12, h: 3, static: false },
      { i: 'betting-winning-graph', x: 0, y: 11.2, w: 12, h: 3, static: false }
    ],
    md: [
      { i: 'bettingWinningComparison', x: 0, y: 0, w: 4, h: 2.5, static: false },
      { i: 'depositWithdrawalComparison', x: 4, y: 0, w: 4, h: 2.5, static: false },
      { i: 'rollingAmountComparison', x: 8, y: 0, w: 4, h: 2.5, static: false },
      { i: 'rolling-status', x: 0, y: 3, w: 12, h: 3.1, static: false },
      { i: 'active-users', x: 0, y: 6.1, w: 12, h: 3.1, static: false },
      { i: 'deposit-withdrawal-graph', x: 0, y: 9.2, w: 12, h: 3, static: false },
      { i: 'betting-winning-graph', x: 0, y: 12.2, w: 12, h: 3, static: false }
    ],
    sm: [
      { i: 'bettingWinningComparison', x: 0, y: 0, w: 6, h: 2.5, static: false },
      { i: 'depositWithdrawalComparison', x: 6, y: 0, w: 6, h: 2.5, static: false },
      { i: 'rollingAmountComparison', x: 0, y: 2, w: 6, h: 2.5, static: false },
      { i: 'rolling-status', x: 0, y: 8, w: 12, h: 3.1, static: false },
      { i: 'active-users', x: 0, y: 8, w: 12, h: 3.1, static: false },
      { i: 'deposit-withdrawal-graph', x: 0, y: 12, w: 12, h: 3, static: false },
      { i: 'betting-winning-graph', x: 0, y: 15, w: 12, h: 3, static: false }
    ],
    xs: [
      { i: 'bettingWinningComparison', x: 0, y: 0, w: 12, h: 2.5, static: false },
      { i: 'depositWithdrawalComparison', x: 0, y: 2, w: 12, h: 2.5, static: false },
      { i: 'rollingAmountComparison', x: 0, y: 4, w: 12, h: 2.5, static: false },
      { i: 'rolling-status', x: 0, y: 6, w: 12, h: 3.1, static: false },
      { i: 'active-users', x: 0, y: 6, w: 12, h: 3.1, static: false },
      { i: 'deposit-withdrawal-graph', x: 0, y: 14, w: 12, h: 3, static: false },
      { i: 'betting-winning-graph', x: 0, y: 17, w: 12, h: 3, static: false }
    ]
  };
  
  // 현재 레이아웃 계산
  const currentLayouts = useMemo(() => {
    // 결과 레이아웃 초기화
    const result = { lg: [], md: [], sm: [], xs: [] };
    
    // 각 브레이크포인트별로 처리
    Object.keys(defaultLayouts).forEach(breakpoint => {
      // 표시할 아이템만 필터링하여 레이아웃 생성
      visibleComponentIds.forEach(id => {
        // 저장된 레이아웃에서 아이템 찾기
        let layoutItem = null;
        if (savedLayouts && savedLayouts[breakpoint]) {
          layoutItem = savedLayouts[breakpoint].find(item => item.i === id);
        }
        
        // 저장된 레이아웃이 없으면 기본 레이아웃에서 찾기
        if (!layoutItem) {
          layoutItem = defaultLayouts[breakpoint].find(item => item.i === id);
        }
        
        // 레이아웃 아이템이 있으면 깊은 복사로 추가
        if (layoutItem) {
          result[breakpoint].push({
            i: layoutItem.i,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
            static: layoutItem.static || false
          });
        }
      });
    });
    
    return result;
  }, [visibleComponentIds, savedLayouts]);
  
  // 레이아웃 변경 핸들러
  const handleLayoutChange = (currentLayout, allLayouts) => {
    if (allLayouts) {
      // 레이아웃 저장
      dispatch(setDashboardLayouts(allLayouts));
      localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts));
      
      // 현재 레이아웃을 ref에 저장
      layoutsRef.current = allLayouts;
    }
  };
  
  // 섹션 카드 컴포넌트
  const SectionCard = ({ title, items }) => (
    <Card className="comparison-card" sx={{ height: '100%', width: '100%' }}>
      <CardContent sx={{ p: 0, height: '100%' }}>
        <Box className="comparison-card-header">
          <Typography variant="subtitle1" fontWeight={500}>
            {title}
          </Typography>
        </Box>
        
        <Box className="comparison-card-content">
          {items.map((item, index) => (
            <Box key={index} className="comparison-item">
              <Typography variant="body2" className="comparison-item-title">
                {item.title}
              </Typography>
              <Box className="comparison-values">
                <Box className="comparison-value-item">
                  <Typography variant="caption" className="comparison-value-label">
                    당월
                  </Typography>
                  <Typography variant="subtitle2" className="comparison-value current">
                    ₩{item.currentValue.toLocaleString()}
                  </Typography>
                </Box>
                <Box className="comparison-value-item">
                  <Typography variant="caption" className="comparison-value-label">
                    전월
                  </Typography>
                  <Typography variant="subtitle2" className="comparison-value previous">
                    ₩{item.previousValue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
  
  // 렌더링할 컴포넌트 목록
  const renderComponents = () => {
    const components = [];
    
    // 섹션 카드 추가
    sectionData
      .filter(section => visibleComponentIds.includes(section.id))
      .forEach(section => {
        components.push(
          <div key={section.id} style={{ height: '100%', width: '100%' }}>
            <SectionCard 
              title={section.title}
              items={section.items}
            />
          </div>
        );
      });
    
    // 롤링금 상태 테이블 추가
    if (showRollingStatus) {
      components.push(
        <div key="rolling-status" style={{ height: '100%', width: '100%' }}>
          <Paper 
            elevation={0} 
            className="dashboard-panel"
            sx={{ 
              height: '100%', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box className="panel-header">
              <Typography variant="subtitle1" fontWeight={500}>
                롤링금 상태
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 40px)', width: '100%', overflow: 'hidden' }}>
              <RollingStatusTable />
            </Box>
          </Paper>
        </div>
      );
    }
    
    // 접속자 현황 테이블 추가
    if (showActiveUsers) {
      components.push(
        <div key="active-users" style={{ height: '100%', width: '100%' }}>
          <Paper 
            elevation={0} 
            className="dashboard-panel"
            sx={{ 
              height: '100%', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box className="panel-header">
              <Typography variant="subtitle1" fontWeight={500}>
                접속자 현황
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 40px)', width: '100%', overflow: 'hidden' }}>
              <ActiveUsersTable />
            </Box>
          </Paper>
        </div>
      );
    }
    
    // 입금/출금 그래프 추가
    if (showDepositWithdrawalGraph) {
      components.push(
        <div key="deposit-withdrawal-graph" style={{ height: '100%', width: '100%' }}>
          <Paper 
            elevation={0} 
            className="dashboard-panel"
            sx={{ 
              height: '100%', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box className="panel-header">
              <Typography variant="subtitle1" fontWeight={500}>
                입금/출금 그래프
              </Typography>
            </Box>
            <Box className="panel-content" sx={{ height: 'calc(100% - 40px)', width: '100%', overflow: 'hidden' }}>
              <DepositWithdrawalGraph height="100%" />
            </Box>
          </Paper>
        </div>
      );
    }
    
    // 베팅/당첨금 그래프 추가
    if (showBettingWinningGraph) {
      components.push(
        <div key="betting-winning-graph" style={{ height: '100%', width: '100%' }}>
          <Paper 
            elevation={0} 
            className="dashboard-panel"
            sx={{ 
              height: '100%', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box className="panel-header">
              <Typography variant="subtitle1" fontWeight={500}>
                베팅/당첨금 그래프
              </Typography>
            </Box>
            <Box className="panel-content" sx={{ height: 'calc(100% - 40px)', width: '100%', overflow: 'hidden' }}>
              <BettingWinningActivityGraph height="100%" />
            </Box>
          </Paper>
        </div>
      );
    }
    
    return components;
  };
  
  return (
    <Box 
      className="dashboard-charts-container" 
      sx={{ 
        width: '100%', 
        maxWidth: '100%', 
      }}
    >
      {loading ? (
        <Box className="loading-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <ResponsiveGridLayout
          className="dashboard-layout"
          layouts={defaultLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
          rowHeight={150}
          containerPadding={[0, 0]}
          margin={[16, 16]}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          useCSSTransforms={true}
          draggableHandle=".comparison-card-header, .panel-header"
          style={{ width: '100%' }}
          compactType={null}
          preventCollision={false}
          autoSize={false}
        >
          {renderComponents()}
        </ResponsiveGridLayout>
      )}
    </Box>
  );
};

export default DashboardChartsSection;