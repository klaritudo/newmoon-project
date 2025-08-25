import React from 'react';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as BettingIcon,
  Calculate as CalculationIcon,
  CurrencyExchange as DepositIcon,
  Headset as CustomerServiceIcon,
  ForumOutlined as BoardIcon,
  Casino as GameSettingIcon,
  Web as SiteSettingIcon,
  ListAlt as LogIcon,
  DesignServices as TemplateIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

// 사이드바 메뉴 아이템 정의 - 모든 곳에서 공통으로 사용
export const menuItems = [
  {
    id: 'dashboard',
    text: '대시보드',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'agent-management',
    text: '에이전트/회원관리',
    icon: <PeopleIcon />,
    children: [
      { id: 'members', text: '회원관리', path: '/agent-management/members' },
      { id: 'registration-requests', text: '회원가입요청', path: '/agent-management/registration-requests' },
      { id: 'rolling-history', text: '롤링금전환내역', path: '/agent-management/rolling-history' },
      { id: 'commission-history', text: '커미션내역', path: '/agent-management/commission-history' },
      { id: 'money-history', text: '머니처리내역', path: '/money-history' },
      { id: 'money-transfer', text: '머니이동내역', path: '/agent-management/money-transfer' },
      { id: 'username-change-history', text: '아이디바꿔주기내역', path: '/agent-management/username-change-history' },
    ],
  },
  {
    id: 'betting',
    text: '배팅상세내역',
    icon: <BettingIcon />,
    children: [
      { id: 'slot-casino', text: '슬롯/카지노', path: '/betting/slot-casino' },
    ],
  },
  {
    id: 'settlement',
    text: '정산관리',
    icon: <CalculationIcon />,
    children: [
      { id: 'today', text: '당일정산', path: '/settlement/today' },
      { id: 'daily', text: '일자별', path: '/settlement/daily' },
      { id: 'third-party', text: '게임사별', path: '/settlement/third-party' },
    ],
  },
  {
    id: 'transactions',
    text: '입출금관리',
    icon: <DepositIcon />,
    children: [
      { id: 'deposit', text: '입금신청처리', path: '/transactions/deposit' },
      { id: 'withdrawal', text: '출금신청처리', path: '/transactions/withdrawal' },
      { id: 'history', text: '충환내역', path: '/transactions/history' },
    ],
  },
  {
    id: 'customer-service',
    text: '고객센터',
    icon: <CustomerServiceIcon />,
    children: [
      { id: 'messages', text: '문의관리', path: '/customer-service/messages' },
      { id: 'templates', text: '템플릿관리', path: '/customer-service/templates' },
    ],
  },
  {
    id: 'board',
    text: '게시판',
    icon: <BoardIcon />,
    children: [
      { id: 'notices', text: '공지사항', path: '/board/notices' },
      { id: 'events', text: '이벤트', path: '/board/events' },
      { id: 'popup', text: '팝업 설정', path: '/board/popup' },
    ],
  },
  {
    id: 'game-settings',
    text: '게임설정',
    icon: <GameSettingIcon />,
    children: [
      { id: 'slot', text: '슬롯', path: '/game-settings/slot' },
      { id: 'casino', text: '카지노', path: '/game-settings/casino' },
    ],
  },
  {
    id: 'site-settings',
    text: '사이트설정',
    icon: <SiteSettingIcon />,
    children: [
      { id: 'admin-info', text: '관리자/IP설정', path: '/site-settings/admin-info' },
      { id: 'design', text: '디자인설정', path: '/site-settings/design' },
      { id: 'menu', text: '메뉴설정', path: '/site-settings/menu' },
      { id: 'domain', text: '도메인설정', path: '/site-settings/domain' },
      { id: 'bank', text: '계좌/은행설정', path: '/site-settings/bank' },
      { id: 'agent-level', text: '단계/권한설정', path: '/site-settings/agent-level' },
      { id: 'registration', text: '회원가입설정', path: '/site-settings/registration' },
      { id: 'events-settings', text: '이벤트설정', path: '/site-settings/events' },
      { id: 'change-username', text: '아이디바꿔주기', path: '/site-settings/change-username' },
      { id: 'maintenance', text: '점검설정', path: '/site-settings/maintenance' },
      { id: 'other', text: '기타설정', path: '/site-settings/other' },
      { id: 'master-ip', text: '마스터 IP 설정', path: '/site-settings/master-ip', requireMaster: true },
    ],
  },
  {
    id: 'logs',
    text: '로그관리',
    icon: <LogIcon />,
    children: [
      { id: 'auth', text: '접속로그', path: '/logs/auth' },
      { id: 'member-changes', text: '회원변경로그', path: '/logs/member-changes' },
      { id: 'system', text: '시스템로그', path: '/logs/system' },
    ],
  },
  {
    id: 'base-template',
    text: '기본템플릿',
    icon: <TemplateIcon />,
    path: '/base-template',
  },
  {
    id: 'logout',
    text: '로그아웃',
    icon: <LogoutIcon />,
    path: '/logout',
    isSpecial: true, // 특별한 처리가 필요한 메뉴 표시
  },
];