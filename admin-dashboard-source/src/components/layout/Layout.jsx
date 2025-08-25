import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, CssBaseline, Toolbar, useTheme, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationPanel from '../notifications/NotificationPanel';
import AgentRequestPanel from '../agent-requests/AgentRequestPanel';
import { selectNotificationPanelVisibility, toggleNotificationPanel } from '../../features/notifications/notificationsSlice';
import { selectSidebarMode } from '../../features/ui/uiSlice';

/**
 * 관리자 대시보드 레이아웃 컴포넌트
 * 
 * 사이드바와 헤더, 컨텐츠 영역을 포함하는 레이아웃 구조를 제공합니다.
 * 반응형으로 설계되어 모바일 환경에서는 사이드바가 숨겨지고, 헤더의 메뉴 버튼으로 열 수 있습니다.
 * React Router v6의 Outlet을 사용하여 중첩 라우팅을 지원합니다.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 레이아웃 내에 표시될 컨텐츠 (선택적)
 */
const Layout = ({ children }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isNotificationPanelVisible = useSelector(selectNotificationPanelVisibility);
  const sidebarMode = useSelector(selectSidebarMode);
  
  // 패널 높이를 추적하기 위한 refs
  const panelContainerRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);
  
  // 사용자 정보로 요청 패널 표시 여부 확인
  const user = useSelector((state) => state.auth.user);
  const showRequestPanel = user && user.agent_level_id !== 1 && user.agent_level_id !== 2;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // 패널 높이 변경 감지
  useEffect(() => {
    const updatePanelHeight = () => {
      if (panelContainerRef.current) {
        const height = panelContainerRef.current.offsetHeight;
        setPanelHeight(height);
      }
    };
    
    // 초기 측정
    updatePanelHeight();
    
    // ResizeObserver로 크기 변경 감지
    const resizeObserver = new ResizeObserver(updatePanelHeight);
    if (panelContainerRef.current) {
      resizeObserver.observe(panelContainerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isNotificationPanelVisible, showRequestPanel]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <CssBaseline />
      
      {/* 헤더 - 항상 표시 */}
      <Header handleDrawerToggle={handleDrawerToggle} />
      
      {/* 헤더 아래 공간 확보 */}
      <Toolbar sx={{ minHeight: { xs: '14px', sm: '70px' }, display: 'none' }} />
      
      {/* 가로 모드 사이드바 - 헤더 바로 아래에 표시 */}
      {sidebarMode === 'horizontal' && (
        <Box sx={{ 
          width: '100%', 
          display: 'block',
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.1)', // 그림자를 아래쪽만 나오도록 수정
          height: '50px', // 고정 높이 설정
        }}>
          <Sidebar 
            window={undefined}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
          />
        </Box>
      )}
      
      {/* 가로 모드일 때 메뉴바 높이만큼 여백 추가 */}
      {sidebarMode === 'horizontal' && (
        <Box sx={{ height: '120px' }} />
      )}
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* 사이드바 - 세로 모드 */}
        {sidebarMode === 'vertical' && (
          <Sidebar 
            window={undefined}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
          />
        )}
        
        {/* 메인 컨텐츠 컨테이너 */}
        <Box
          sx={{
            flexGrow: 1,
            width: { 
              xs: '100%',
              lg: sidebarMode === 'vertical' ? `calc(100% - 280px)` : '100%'
            },
            display: 'flex',
            flexDirection: 'column',
            position: 'static', // relative 대신 static으로 변경
          }}
        >
          {/* 세로 모드에서만 툴바 공간 필요 */}
          {sidebarMode === 'vertical' && (
            <Toolbar sx={{ minHeight: { xs: '64px', sm: '70px' } }} />
          )}
          
          {/* 알림판과 요청 패널을 하나의 고정 컨테이너로 관리 */}
          <Box
            ref={panelContainerRef}
            sx={{
              position: 'fixed',
              top: sidebarMode === 'horizontal' ? '135px' : '70px',
              left: { 
                xs: 0,
                lg: sidebarMode === 'vertical' ? '280px' : 0 
              },
              right: 0,
              width: { 
                xs: '100%',
                lg: sidebarMode === 'vertical' ? `calc(100% - 280px)` : '100%'
              },
              zIndex: 1150,
            }}
          >
            {/* 알림판 */}
            {isNotificationPanelVisible && (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: '0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  borderBottom: '1px solid #e9ecef',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <NotificationPanel />
                  <IconButton
                    size="small"
                    onClick={() => dispatch(toggleNotificationPanel())}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      color: '#B5B5C3',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      zIndex: 1101
                    }}
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
            
            {/* 에이전트 요청 패널 */}
            <AgentRequestPanel />
          </Box>
          
          {/* 스크롤 가능한 콘텐츠 영역 */}
          <Box
            component="main"
            sx={{
              position: 'fixed',
              top: sidebarMode === 'horizontal' 
                ? `${121 + panelHeight}px`  // 헤더(70px) + 가로사이드바(50px) + 1px 간격 + 패널높이
                : `${70 + panelHeight}px`,   // 헤더(70px) + 패널높이
              left: { 
                xs: 0,
                lg: sidebarMode === 'vertical' ? '280px' : 0 
              },
              right: 0,
              bottom: 0,
              width: { 
                xs: '100%',
                lg: sidebarMode === 'vertical' ? `calc(100% - 280px)` : '100%'
              },
              bgcolor: '#F5F8FA',
              overflowY: 'auto',
              overflowX: 'hidden',
              transition: 'top 0.3s ease', // 부드러운 전환 효과
            }}
          >
            <Box sx={{ 
              p: 0,
              pt: 0,
            }}>
              {/* React Router v6의 Outlet을 사용하여 중첩 라우팅 지원 */}
              {children || <Outlet />}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout; 