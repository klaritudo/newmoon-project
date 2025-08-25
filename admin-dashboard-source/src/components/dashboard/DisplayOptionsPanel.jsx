import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Divider, 
  IconButton,
  Tooltip,
  Grid,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { 
  selectStatsCards, 
  selectDashboardItems,
  setCardVisibility,
  setDashboardItemVisibility,
  resetStatsLayout,
  resetDashboardLayout
} from '../../features/dashboard/dashboardSlice';
import useDynamicTypes from '../../hooks/useDynamicTypes';

/**
 * 대시보드 표시 옵션 컨트롤 패널 컴포넌트
 * 대시보드에 표시할 항목을 선택할 수 있는 체크박스 패널을 제공합니다.
 * 
 * @param {string} buttonVariant - 버튼 표시 방식 ('icon' 또는 'text')
 * @param {React.RefObject} containerRef - 컨테이너 요소의 ref
 * @returns {JSX.Element} 표시 옵션 컨트롤 패널 컴포넌트
 */
const DisplayOptionsPanel = ({ buttonVariant = 'icon', containerRef }) => {
  const dispatch = useDispatch();
  const cards = useSelector(selectStatsCards);
  const dashboardItems = useSelector(selectDashboardItems);
  const [tabValue, setTabValue] = useState(0);
  const [menuWidth, setMenuWidth] = useState('100%');
  
  // 동적 에이전트 레벨 데이터 가져오기
  const { agentLevels, isLoading: levelsLoading } = useDynamicTypes();
  
  // 메뉴 상태
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // 컨테이너 너비 계산
  useEffect(() => {
    if (containerRef && containerRef.current && open) {
      const width = containerRef.current.offsetWidth;
      setMenuWidth(`${width}px`);
    }
  }, [containerRef, open]);
  
  // 표시 옵션 변경 핸들러 (통계 카드)
  const handleStatsOptionChange = (event) => {
    const { name, checked } = event.target;
    dispatch(setCardVisibility({ cardId: name, visible: checked }));
  };
  
  // 표시 옵션 변경 핸들러 (대시보드 항목)
  const handleDashboardOptionChange = (event) => {
    const { name, checked } = event.target;
    dispatch(setDashboardItemVisibility({ itemId: name, visible: checked }));
  };
  
  // 메뉴 열기 핸들러
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    
    // 컨테이너 너비 계산
    if (containerRef && containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setMenuWidth(`${width}px`);
    }
  };
  
  // 메뉴 닫기 핸들러
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
    
    dispatch(resetStatsLayout());
    dispatch(resetDashboardLayout());
    handleCloseMenu();
    
    // 페이지 새로고침으로 모든 레이아웃 초기화
    window.location.reload();
  };
  
  // 동적 탭 생성을 위한 레벨 정보
  const dynamicTabs = useMemo(() => {
    if (!agentLevels || agentLevels.length === 0) {
      // 데이터가 없을 때 기본 탭 표시
      return [];
    }
    
    // agentLevels를 level 순서대로 정렬
    return agentLevels
      .sort((a, b) => a.level - b.level)
      .map(level => ({
        id: level.id,
        typeKey: `level_${level.id}`,
        name: level.name,
        displayName: level.name.replace(/[0-9]+$/, '') || level.name // 숫자 제거
      }));
  }, [agentLevels]);
  
  // 카드 타입별 그룹화 (동적)
  const cardGroups = useMemo(() => {
    const groups = {};
    
    // agentLevels 데이터를 기반으로 카드 그룹 생성
    if (agentLevels && agentLevels.length > 0) {
      agentLevels.forEach(level => {
        const typeKey = `agent_level_${level.id}`;
        groups[typeKey] = cards.filter(card => card.type === typeKey);
      });
    }
    
    return groups;
  }, [cards, agentLevels]);
  
  // 표시되지 않는 카드/항목 개수 계산
  const invisibleCount = React.useMemo(() => {
    const invisibleCards = cards.filter(card => !card.visible).length;
    const invisibleItems = dashboardItems.filter(item => !item.visible).length;
    return invisibleCards + invisibleItems;
  }, [cards, dashboardItems]);
  
  // 동적 탭 데이터 생성
  const tabData = useMemo(() => {
    const tabs = [];
    
    // agentLevels가 로드되면 동적으로 탭 생성
    if (agentLevels && agentLevels.length > 0) {
      // DB의 모든 레벨을 순서대로 탭으로 생성
      agentLevels
        .sort((a, b) => a.level - b.level)
        .forEach(level => {
          const typeKey = `agent_level_${level.id}`; // 실제 서비스에서 사용하는 형식
          tabs.push({
            type: typeKey,
            label: level.name || level.levelType, // 실제 데이터 필드 사용
            cards: cardGroups[typeKey] || []
          });
        });
    } else if (levelsLoading) {
      // 로딩 중일 때
      tabs.push({ type: 'loading', label: '로딩 중...', cards: [] });
    } else {
      // 데이터가 없을 때 빈 상태
      tabs.push({ type: 'empty', label: '데이터 없음', cards: [] });
    }
    
    // 대시보드 탭 추가
    tabs.push({ type: 'dashboard', label: '대시보드', cards: dashboardItems });
    
    return tabs;
  }, [agentLevels, levelsLoading, cardGroups, dashboardItems]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 탭 패널 렌더링 함수
  const renderTabPanel = (index, cardGroup, handler) => {
    if (tabValue !== index) return null;
    
    return (
      <Grid container spacing={1}>
        {cardGroup.map(item => (
          <Grid item xs={6} key={item.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.visible}
                  onChange={handler}
                  name={item.id}
                  size="small"
                />
              }
              label={item.title}
            />
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box>
      {buttonVariant === 'icon' ? (
        <Tooltip title="표시 옵션">
          <IconButton 
            onClick={handleOpenMenu} 
            size="small" 
            color="primary"
            sx={{ ml: 1, zIndex: 20 }}
          >
            <TuneIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<TuneIcon />}
          onClick={handleOpenMenu}
          sx={{ 
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            minWidth: { xs: '100px', sm: 'auto' },
            flex: { xs: '1 1 auto', sm: '0 0 auto' }
          }}
        >
          표시 옵션
        </Button>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { 
            width: menuWidth,
            maxWidth: menuWidth,
            maxHeight: '80vh', 
            zIndex: 1400
          }
        }}
        sx={{ zIndex: 1400 }}
        MenuListProps={{
          sx: { width: '100%' }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem sx={{ display: 'block', p: 0 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              표시 옵션
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 40, mb: 2 }}
            >
              {tabData.map((tab, index) => (
                <Tab 
                  key={tab.type}
                  label={levelsLoading ? '로딩 중...' : tab.label} 
                  sx={{ minHeight: 40, py: 0 }}
                  disabled={levelsLoading}
                />
              ))}
            </Tabs>
            
            <Box sx={{ mb: 2, minHeight: '200px' }}>
              {tabData.map((tab, index) => {
                if (tabValue !== index) return null;
                
                const handler = tab.type === 'dashboard' ? handleDashboardOptionChange : handleStatsOptionChange;
                
                return (
                  <Grid container spacing={1} key={tab.type}>
                    {tab.cards.map(item => (
                      <Grid item xs={6} key={item.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={item.visible}
                              onChange={handler}
                              name={item.id}
                              size="small"
                            />
                          }
                          label={item.title}
                        />
                      </Grid>
                    ))}
                    {tab.cards.length === 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          {levelsLoading ? '데이터를 불러오는 중...' : '표시할 항목이 없습니다.'}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                );
              })}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<ResetIcon />}
                onClick={handleResetLayout}
                sx={{ fontWeight: 500 }}
              >
                레이아웃 초기화
              </Button>
            </Box>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DisplayOptionsPanel; 