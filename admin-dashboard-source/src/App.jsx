import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from './theme/ThemeProvider'; // 커스텀 테마 프로바이더 임포트
import { SocketProvider } from './context/SocketContext'; // Socket Context 추가
import { NotificationProvider } from './contexts/NotificationContext.jsx'; // 알림 컨텍스트 추가
import { suppressSearchBoxLogs } from './utils/consoleFilter'; // SearchBox 로그 필터 추가
import PermissionLoader from './components/layout/PermissionLoader'; // 권한 로더 추가
import CheckPermissions from './components/layout/CheckPermissions'; // 권한 체크 추가
import PermissionRefreshManager from './components/layout/PermissionRefreshManager'; // 권한 실시간 업데이트 추가
import CssPermissionManager from './components/layout/CssPermissionManager'; // CSS 권한 관리 추가
import MaintenanceMode from './components/MaintenanceMode'; // 점검 모드 컴포넌트 추가
import { API_CONFIG } from './config/apiConfig'; // API 설정 가져오기

// 개발 환경에서 로그 제어
if (process.env.NODE_ENV === 'development') {
  import('./utils/silenceAllLogs');
}

// 페이지 컴포넌트 가져오기
import Dashboard from './pages/Dashboard';
import BaseTemplatePage from './pages/BaseTemplatePage';
import AgentLevelPage from './pages/site-settings/AgentLevelPage';
import PermissionPage from './pages/site-settings/PermissionPage';
import MembersPage from './pages/agent-management/MembersPage';
import RegistrationRequestsPage from './pages/agent-management/RegistrationRequestsPage';
import RollingHistoryPage from './pages/agent-management/RollingHistoryPage';
import CommissionHistoryPage from './pages/agent-management/CommissionHistoryPage';
import MoneyHistoryPage from './pages/MoneyHistoryPage';
import MoneyTransferPage from './pages/agent-management/MoneyTransferPage';
import TodaySettlementPage from './pages/settlement/TodaySettlementPage';
import DepositPage from './pages/transactions/DepositPage';
import WithdrawalPage from './pages/transactions/WithdrawalPage';
import TransactionHistoryPage from './pages/transactions/TransactionHistoryPage';
import ThirdPartySettlementPage from './pages/settlement/ThirdPartySettlementPage';
import DailySettlementPage from './pages/settlement/DailySettlementPage';
import SlotCasinoPage from './pages/betting/SlotCasinoPage';
import MessagesPage from './pages/customer-service/MessagesPage';
import TemplatesPage from './pages/customer-service/TemplatesPage'; // 템플릿 관리 페이지 추가
import NoticesPageAPI from './pages/board/NoticesPageAPI'; // 공지사항 페이지 추가 (API 연동)
import EventsPage from './pages/board/EventsPage'; // 이벤트 페이지 추가
import PopupPage from './pages/board/PopupPage'; // 팝업설정 페이지 추가
import PopupManager from "./components/PopupManager"; // 팝업 표시 컴포넌트 추가
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import SlotSettingPage from './pages/game-settings/SlotSettingPage';
import CasinoSettingPage from './pages/game-settings/CasinoSettingPage';
import VirtualScrollTest from './pages/VirtualScrollTest'; // Virtual scroll test page
import AdminIPSettingsPage from './pages/site-settings/AdminIPSettingsPage'; // 관리자/IP설정 페이지
import DesignSettingsPage from './pages/site-settings/DesignSettingsPage'; // 디자인설정 페이지
import MenuSettingsPage from './pages/site-settings/MenuSettingsPage'; // 메뉴설정 페이지
import DomainSettingsPage from './pages/site-settings/DomainSettingsPage'; // 도메인설정 페이지
import BankSettingsPage from './pages/site-settings/BankSettingsPage'; // 계좌/은행설정 페이지
import MaintenancePage from './pages/site-settings/MaintenancePage'; // 점검설정 페이지
import MasterIpSettings from './pages/site-settings/MasterIpSettings'; // 마스터 IP 설정 페이지
import RegistrationSettingsPage from './pages/site-settings/RegistrationSettingsPage'; // 회원가입설정 페이지
import OtherSettingsPage from './pages/site-settings/OtherSettingsPage'; // 기타설정 페이지
import EventSettingsPage from './pages/site-settings/EventSettingsPage'; // 이벤트설정 페이지
import ChangeUsernamePage from './pages/site-settings/ChangeUsernamePage'; // 아이디바꿔주기 페이지
import UsernameChangeHistoryPage from './pages/agent-management/UsernameChangeHistoryPage'; // 아이디바꿔주기내역 페이지
import AuthLogsPage from './pages/logs/AuthLogsPage'; // 접속로그 페이지
import MemberChangesPage from './pages/logs/MemberChangesPage'; // 회원변경로그 페이지
import SystemLogsPage from './pages/logs/SystemLogsPage'; // 시스템로그 페이지
import DepositInquiriesPage from './pages/DepositInquiriesPage'; // 입금 문의 관리 페이지

// 레이아웃 컴포넌트 가져오기
import Layout from './components/layout/Layout';

// 인증 컴포넌트 가져오기
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthCheck from './hooks/useAuthCheck';

/**
 * 애플리케이션 메인 컴포넌트
 */
function App() {
  // 초기 인증 상태 체크
  useAuthCheck();
  
  // 점검 모드 상태
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceSettings, setMaintenanceSettings] = useState(null);
  
  // 점검 설정 로드 함수
  const loadMaintenanceSettings = useCallback(async () => {
    try {
      console.log('관리자 페이지: 점검 설정 로드 시작...');
      
      // URL 파라미터 확인 - bypass 파라미터가 있으면 점검 모드 무시
      const urlParams = new URLSearchParams(window.location.search);
      const bypassMaintenance = urlParams.get('bypass') === 'maintenance';
      
      if (bypassMaintenance) {
        console.log('관리자 페이지: 점검 모드 우회 파라미터 감지');
        setMaintenanceMode(false);
        setMaintenanceSettings(null);
        return;
      }
      
      // API에서 점검 설정 가져오기
      const response = await fetch(`${API_CONFIG.BASE_URL}/maintenance-settings`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('관리자 페이지: API 응답:', result);
        
        if (result.success && result.data) {
          const settings = result.data;
          console.log('관리자 페이지: 점검 대상:', settings.target);
          
          // 점검 대상이 'admin' 또는 'all'인 경우 점검 모드 활성화
          if (settings.target === 'admin' || settings.target === 'all') {
            console.log('관리자 페이지: 점검 모드 활성화');
            setMaintenanceMode(true);
            setMaintenanceSettings(settings);
          } else {
            console.log('관리자 페이지: 점검 모드 비활성화');
            setMaintenanceMode(false);
            setMaintenanceSettings(null);
          }
        }
      } else {
        console.log('관리자 페이지: API 응답 실패, localStorage 확인');
        // API 실패시 localStorage에서 백업 확인
        const savedSettings = localStorage.getItem('maintenanceSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          console.log('관리자 페이지: localStorage 설정:', settings);
          
          if (settings.target === 'admin' || settings.target === 'all') {
            setMaintenanceMode(true);
            setMaintenanceSettings(settings);
          } else {
            setMaintenanceMode(false);
            setMaintenanceSettings(null);
          }
        }
      }
    } catch (error) {
      console.error('관리자 페이지: 점검 설정 로드 오류:', error);
      
      // 에러 발생시 localStorage 백업 사용
      const savedSettings = localStorage.getItem('maintenanceSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.target === 'admin' || settings.target === 'all') {
            setMaintenanceMode(true);
            setMaintenanceSettings(settings);
          }
        } catch (parseError) {
          console.error('관리자 페이지: localStorage 파싱 오류:', parseError);
        }
      }
    }
  }, []);
  
  // Emotion 중복 로드 경고 무시 (개발 환경에서 정상적인 현상)
  useEffect(() => {
    // SearchBox 관련 console.log 필터링 활성화
    const restoreConsoleLog = suppressSearchBoxLogs();
    
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('You are loading @emotion/react when it is already loaded')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      restoreConsoleLog(); // 컴포넌트 언마운트 시 원래 console.log 복원
    };
  }, []);
  
  // URL 파라미터 확인 (초기 렌더링 시)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bypassMaintenance = urlParams.get('bypass') === 'maintenance';
    
    if (bypassMaintenance) {
      console.log('관리자 페이지: 초기 로드 시 우회 파라미터 감지');
      // 우회 모드일 때는 점검 설정을 로드하지 않음
      setMaintenanceMode(false);
      setMaintenanceSettings(null);
      return;
    }
    
    // 우회 모드가 아닐 때만 점검 설정 로드
    loadMaintenanceSettings();
  }, []); // 초기 렌더링 시 한 번만 실행
  
  // 점검 설정 변경 감지
  useEffect(() => {
    // localStorage 변경 감지 (다른 탭에서 변경시)
    const handleStorageChange = (e) => {
      if (e.key === 'maintenanceSettings') {
        console.log('관리자 페이지: localStorage 변경 감지');
        
        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const bypassMaintenance = urlParams.get('bypass') === 'maintenance';
        
        if (!bypassMaintenance) {
          loadMaintenanceSettings();
        }
      }
    };
    
    // 커스텀 이벤트 감지 (같은 탭에서 변경시)
    const handleMaintenanceChange = () => {
      console.log('관리자 페이지: 점검 설정 변경 이벤트 감지');
      
      // URL 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search);
      const bypassMaintenance = urlParams.get('bypass') === 'maintenance';
      
      if (!bypassMaintenance) {
        loadMaintenanceSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('maintenanceSettingsChanged', handleMaintenanceChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('maintenanceSettingsChanged', handleMaintenanceChange);
    };
  }, [loadMaintenanceSettings]);

  // 점검 모드인 경우 점검 페이지만 표시
  if (maintenanceMode) {
    return (
      <ThemeProvider>
        <MaintenanceMode settings={maintenanceSettings} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <SocketProvider>
          <NotificationProvider>
            <PermissionLoader />
            <CheckPermissions />
            <PermissionRefreshManager />
            <CssPermissionManager />
            <PopupManager />
            <Routes>
            {/* 공개 페이지 */}
            <Route path="/login" element={<Login />} />
            
            {/* 보호된 페이지들 */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* 기본 리다이렉트 */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* 대시보드 */}
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* 베이스 템플릿 */}
                <Route path="base-template" element={<BaseTemplatePage />} />
                
                {/* 에이전트 관리 */}
                <Route path="agent-management/members" element={<MembersPage />} />
                <Route path="agent-management/registration-requests" element={<RegistrationRequestsPage />} />
                <Route path="agent-management/rolling-history" element={<RollingHistoryPage />} />
                <Route path="agent-management/commission-history" element={<CommissionHistoryPage />} />
                <Route path="agent-management/money-transfer" element={<MoneyTransferPage />} />
                <Route path="agent-management/username-change-history" element={<UsernameChangeHistoryPage />} />
                
                {/* 머니 관리 */}
                <Route path="money-history" element={<MoneyHistoryPage />} />
                
                {/* 정산 관리 */}
                <Route path="settlement/today" element={<TodaySettlementPage />} />
                <Route path="settlement/third-party" element={<ThirdPartySettlementPage />} />
                <Route path="settlement/daily" element={<DailySettlementPage />} />
                
                {/* 베팅상세내역 */}
                <Route path="betting/slot-casino" element={<SlotCasinoPage />} />
                
                {/* 고객 서비스 */}
                <Route path="customer-service/messages" element={<MessagesPage />} />
                <Route path="customer-service/templates" element={<TemplatesPage />} />
                
                {/* 게시판 관리 */}
                <Route path="board/notices" element={<NoticesPageAPI />} />
                <Route path="board/events" element={<EventsPage />} />
                <Route path="board/popup" element={<PopupPage />} />
                
                {/* 사이트 설정 */}
                <Route path="site-settings/admin-info" element={<AdminIPSettingsPage />} />
                <Route path="site-settings/agent-level" element={<AgentLevelPage />} />
                <Route path="site-settings/permission" element={<PermissionPage />} />
                <Route path="site-settings/design" element={<DesignSettingsPage />} />
                <Route path="site-settings/menu" element={<MenuSettingsPage />} />
                <Route path="site-settings/domain" element={<DomainSettingsPage />} />
                <Route path="site-settings/bank" element={<BankSettingsPage />} />
                <Route path="site-settings/maintenance" element={<MaintenancePage />} />
                <Route path="site-settings/registration" element={<RegistrationSettingsPage />} />
                <Route path="site-settings/other" element={<OtherSettingsPage />} />
                <Route path="site-settings/events" element={<EventSettingsPage />} />
                <Route path="site-settings/change-username" element={<ChangeUsernamePage />} />
                <Route path="site-settings/master-ip" element={<MasterIpSettings />} />
                
                {/* 입금신청처리 */}
                <Route path="transactions/deposit" element={<DepositPage />} />
                
                {/* 입금 문의 관리 */}
                <Route path="transactions/deposit-inquiries" element={<DepositInquiriesPage />} />
                
                {/* 출금신청처리 */}
                <Route path="transactions/withdrawal" element={<WithdrawalPage />} />
                
                {/* 충환내역 페이지 */}
                <Route path="transactions/history" element={<TransactionHistoryPage />} />

                {/* 게임설정 */}
                <Route path="game-settings/slot" element={<SlotSettingPage />} />
                <Route path="game-settings/casino" element={<CasinoSettingPage />} />
                
                {/* Virtual Scroll Test */}
                <Route path="virtual-scroll-test" element={<VirtualScrollTest />} />
                
                {/* 로그 관리 */}
                <Route path="logs/auth" element={<AuthLogsPage />} />
                <Route path="logs/member-changes" element={<MemberChangesPage />} />
                <Route path="logs/system" element={<SystemLogsPage />} />
                
                {/* 404 페이지 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </NotificationProvider>
      </SocketProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
