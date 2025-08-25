/**
 * 권한 관리를 위한 메뉴 및 버튼 데이터 정의
 * 기존 사이드바 메뉴 구조를 기반으로 권한 제어 가능한 항목들을 정의
 */

// 사이드바 메뉴 항목들 (권한 제어 대상)
export const menuPermissions = [
  {
    id: 'dashboard',
    name: '대시보드',
    path: '/dashboard',
    category: 'main'
  },
  {
    id: 'agent-management',
    name: '에이전트/회원관리',
    category: 'management',
    children: [
      { id: 'members', name: '회원관리', path: '/agent-management/members' },
      { id: 'rolling-history', name: '롤링금전환내역', path: '/agent-management/rolling-history' },
      { id: 'money-history', name: '머니처리내역', path: '/agent-management/money-history' },
      { id: 'money-transfer', name: '머니이동내역', path: '/agent-management/money-transfer' }
    ]
  },
  {
    id: 'betting',
    name: '배팅상세내역',
    category: 'betting',
    children: [
      { id: 'slot-casino', name: '슬롯/카지노', path: '/betting/slot-casino' }
    ]
  },
  {
    id: 'settlement',
    name: '정산관리',
    category: 'finance',
    children: [
      { id: 'today', name: '당일정산', path: '/settlement/today' },
      { id: 'daily', name: '일자별', path: '/settlement/daily' },
      { id: 'third-party', name: '서드파티별', path: '/settlement/third-party' },
      { id: 'member', name: '회원별', path: '/settlement/member' },
      { id: 'deposit-withdrawal', name: '입출금', path: '/settlement/deposit-withdrawal' }
    ]
  },
  {
    id: 'transactions',
    name: '입출금관리',
    category: 'finance',
    children: [
      { id: 'deposit', name: '입금신청처리', path: '/transactions/deposit' },
      { id: 'withdrawal', name: '출금신청처리', path: '/transactions/withdrawal' },
      { id: 'history', name: '충환내역', path: '/transactions/history' }
    ]
  },
  {
    id: 'customer-service',
    name: '고객센터',
    category: 'service',
    children: [
      { id: 'messages', name: '문의관리', path: '/customer-service/messages' },
      { id: 'templates', name: '템플릿관리', path: '/customer-service/templates' }
    ]
  },
  {
    id: 'board',
    name: '게시판',
    category: 'content',
    children: [
      { id: 'notices', name: '공지사항', path: '/board/notices' },
      { id: 'events', name: '이벤트', path: '/board/events' },
      { id: 'popup', name: '팝업 설정', path: '/board/popup' }
    ]
  },
  {
    id: 'game-settings',
    name: '게임설정',
    category: 'game',
    children: [
      { id: 'slot', name: '슬롯', path: '/game-settings/slot' },
      { id: 'casino', name: '카지노', path: '/game-settings/casino' }
    ]
  },
  {
    id: 'site-settings',
    name: '사이트설정',
    category: 'admin',
    children: [
      { id: 'admin-info', name: '관리자정보', path: '/site-settings/admin-info' },
      { id: 'design', name: '디자인 설정', path: '/site-settings/design' },
      { id: 'menu', name: '메뉴 설정', path: '/site-settings/menu' },
      { id: 'domain', name: '도메인 설정', path: '/site-settings/domain' },
      { id: 'sms', name: '문자인증 설정', path: '/site-settings/sms' },
      { id: 'notification', name: '알림음 설정', path: '/site-settings/notification' },
      { id: 'bank', name: '계좌/은행 설정', path: '/site-settings/bank' },
      { id: 'agent-level', name: '단계/권한설정', path: '/site-settings/agent-level' },
      { id: 'agent', name: '에이전트 설정', path: '/site-settings/agent' },
      { id: 'api', name: 'API 설정', path: '/site-settings/api' },
      { id: 'registration', name: '회원가입 설정', path: '/site-settings/registration' },
      { id: 'events-setting', name: '이벤트 설정', path: '/site-settings/events' },
      { id: 'change-username', name: '아이디바꿔주기', path: '/site-settings/change-username' },
      { id: 'maintenance', name: '점검설정', path: '/site-settings/maintenance' },
      { id: 'other', name: '기타설정', path: '/site-settings/other' }
    ]
  },
  {
    id: 'logs',
    name: '로그관리',
    category: 'system',
    children: [
      { id: 'auth', name: '인/아웃로그', path: '/logs/auth' },
      { id: 'member-changes', name: '회원변경로그', path: '/logs/member-changes' },
      { id: 'system', name: '시스템로그', path: '/logs/system' }
    ]
  },
  {
    id: 'base-template',
    name: '기본템플릿',
    path: '/base-template',
    category: 'development'
  }
];

// 공통 버튼 권한 (각 페이지에서 사용되는 버튼들)
export const buttonPermissions = [
  // 공통 액션 버튼
  { id: 'add-button', name: '추가 버튼', description: '새 항목 추가 버튼', category: 'action' },
  { id: 'edit-button', name: '수정 버튼', description: '항목 수정 버튼', category: 'action' },
  { id: 'delete-button', name: '삭제 버튼', description: '항목 삭제 버튼', category: 'action' },
  { id: 'save-button', name: '저장 버튼', description: '변경사항 저장 버튼', category: 'action' },
  { id: 'cancel-button', name: '취소 버튼', description: '작업 취소 버튼', category: 'action' },
  
  // 데이터 관련 버튼
  { id: 'export-excel', name: '엑셀 다운로드', description: '데이터 엑셀 내보내기', category: 'data' },
  { id: 'print-button', name: '인쇄 버튼', description: '데이터 인쇄', category: 'data' },
  { id: 'refresh-button', name: '새로고침 버튼', description: '데이터 새로고침', category: 'data' },
  { id: 'search-button', name: '검색 버튼', description: '데이터 검색', category: 'data' },
  { id: 'filter-button', name: '필터 버튼', description: '데이터 필터링', category: 'data' },
  
  // 설정 관련 버튼
  { id: 'display-options', name: '표시 옵션', description: '컬럼 표시 설정', category: 'settings' },
  { id: 'column-settings', name: '컬럼 설정', description: '테이블 컬럼 설정', category: 'settings' },
  { id: 'api-sync-settings', name: 'API 잔액 연동 설정', description: 'API 잔액 연동을 설정할 수 있는 권한', category: 'settings' },
  { id: 'dashboard-auto-refresh', name: '대시보드 자동 새로고침', description: '대시보드 자동 새로고침 설정을 사용할 수 있는 권한', category: 'settings' },
  
  // 금융 관련 버튼
  { id: 'approve-button', name: '승인 버튼', description: '입출금 승인', category: 'finance' },
  { id: 'reject-button', name: '거부 버튼', description: '입출금 거부', category: 'finance' },
  { id: 'transfer-button', name: '이체 버튼', description: '머니 이체', category: 'finance' },
  
  // 관리 관련 버튼
  { id: 'ban-button', name: '정지 버튼', description: '회원 정지', category: 'management' },
  { id: 'unban-button', name: '정지해제 버튼', description: '회원 정지 해제', category: 'management' },
  { id: 'reset-password', name: '비밀번호 초기화', description: '회원 비밀번호 초기화', category: 'management' },
  
  // 회원 정보 데이터 (민감 정보)
  { id: 'change_subordinate_password', name: '하위 회원 비밀번호 변경', description: '하위 회원의 비밀번호를 변경할 수 있는 권한', category: 'member-data' },
  { id: 'member-phone', name: '전화번호', description: '회원 전화번호 정보 조회/수정', category: 'member-data' },
  { id: 'member-account', name: '계좌번호', description: '회원 계좌번호 정보 조회/수정', category: 'member-data' },
  { id: 'member-email', name: '이메일', description: '회원 이메일 정보 조회/수정', category: 'member-data' },
  { id: 'member-address', name: '주소', description: '회원 주소 정보 조회/수정', category: 'member-data' },
  { id: 'member-birth', name: '생년월일', description: '회원 생년월일 정보 조회/수정', category: 'member-data' },
  { id: 'member-identity', name: '신분증 정보', description: '회원 신분증 정보 조회/수정', category: 'member-data' },
  { id: 'member-bank-info', name: '은행 정보', description: '회원 은행 정보 조회/수정', category: 'member-data' },
  
  // 회원 활동 데이터
  { id: 'member-login-history', name: '로그인 기록', description: '회원 로그인 기록 조회', category: 'member-activity' },
  { id: 'member-betting-history', name: '배팅 기록', description: '회원 배팅 기록 조회', category: 'member-activity' },
  { id: 'member-transaction-history', name: '거래 기록', description: '회원 입출금 거래 기록 조회', category: 'member-activity' },
  { id: 'member-point-history', name: '포인트 기록', description: '회원 포인트 적립/사용 기록 조회', category: 'member-activity' },
  { id: 'member-bonus-history', name: '보너스 기록', description: '회원 보너스 지급/사용 기록 조회', category: 'member-activity' },
  
  // 회원 통계 데이터
  { id: 'member-statistics', name: '회원 통계', description: '개별 회원 통계 정보 조회', category: 'member-stats' },
  { id: 'member-revenue', name: '수익 정보', description: '회원별 수익 정보 조회', category: 'member-stats' },
  { id: 'member-loss', name: '손실 정보', description: '회원별 손실 정보 조회', category: 'member-stats' },
  { id: 'member-profit-rate', name: '수익률', description: '회원별 수익률 정보 조회', category: 'member-stats' },
  
  // API 잔액 표시 권한
  { id: 'view-api-balance', name: 'API 잔액 보기', description: '사이드바에 API 총 잔액 표시', category: 'api-balance' },
  { id: 'view-own-balance-only', name: '본인 보유금만 보기', description: '다른 회원의 보유금 숨김', category: 'member-data' },
  
  // 에이전트 요청 버튼 권한
  { id: '계좌신청', name: '계좌신청 버튼', description: '상위 관리자에게 계좌 정보 요청', category: 'agent-request' },
  { id: '입금신청', name: '입금신청 버튼', description: '상위 관리자에게 입금 요청', category: 'agent-request' },
  { id: '출금신청', name: '출금신청 버튼', description: '상위 관리자에게 출금 요청', category: 'agent-request' },
  { id: '문의하기', name: '문의하기 버튼', description: '상위 관리자에게 문의 전송', category: 'agent-request' }
];

// CSS 선택자 기반 권한 (특정 UI 요소 숨김)
export const cssPermissions = [
  { id: 'admin-only-sections', name: '관리자 전용 섹션', selector: '.admin-only', description: '관리자만 볼 수 있는 섹션들' },
  { id: 'advanced-settings', name: '고급 설정', selector: '#advanced-settings', description: '고급 설정 영역' },
  { id: 'debug-info', name: '디버그 정보', selector: '.debug-info', description: '개발자용 디버그 정보' },
  { id: 'financial-summary', name: '재정 요약', selector: '.financial-summary', description: '재정 관련 요약 정보' },
  { id: 'system-stats', name: '시스템 통계', selector: '.system-stats', description: '시스템 통계 정보' },
  { id: 'user-sensitive-info', name: '민감 정보', selector: '.sensitive-info', description: '민감한 사용자 정보' }
];

// 레이아웃 권한 (UI 레이아웃 요소 제어)
export const layoutPermissions = [
  // 알림판 관련
  { 
    id: 'notification-panel', 
    name: '알림판', 
    selector: '.notification-panel', 
    description: '전체 알림판 영역 표시/숨김', 
    category: 'notification' 
  },
  { 
    id: 'notification-list', 
    name: '알림 목록', 
    selector: '.notification-list', 
    description: '알림 목록 표시/숨김', 
    category: 'notification' 
  },
  { 
    id: 'notification-badge', 
    name: '알림 배지', 
    selector: '.notification-badge', 
    description: '알림 개수 배지 표시/숨김', 
    category: 'notification' 
  },
  
  // 툴바 관련
  { 
    id: 'toolbar-notification-icon', 
    name: '툴바 알림 아이콘', 
    selector: '.toolbar-notification-icon', 
    description: '상단 툴바의 알림 아이콘', 
    category: 'toolbar' 
  },
  { 
    id: 'toolbar-user-menu', 
    name: '툴바 사용자 메뉴', 
    selector: '.toolbar-user-menu', 
    description: '상단 툴바의 사용자 메뉴', 
    category: 'toolbar' 
  },
  { 
    id: 'toolbar-settings-icon', 
    name: '툴바 설정 아이콘', 
    selector: '.toolbar-settings-icon', 
    description: '상단 툴바의 설정 아이콘', 
    category: 'toolbar' 
  },
  { 
    id: 'toolbar-search', 
    name: '툴바 검색', 
    selector: '.toolbar-search', 
    description: '상단 툴바의 검색 기능', 
    category: 'toolbar' 
  },
  
  // 사이드바 관련
  { 
    id: 'sidebar-toggle', 
    name: '사이드바 토글', 
    selector: '.sidebar-toggle', 
    description: '사이드바 열기/닫기 버튼', 
    category: 'sidebar' 
  },
  { 
    id: 'sidebar-user-info', 
    name: '사이드바 사용자 정보', 
    selector: '.sidebar-user-info', 
    description: '사이드바의 사용자 정보 영역', 
    category: 'sidebar' 
  },
  { 
    id: 'sidebar-footer', 
    name: '사이드바 하단', 
    selector: '.sidebar-footer', 
    description: '사이드바 하단 영역', 
    category: 'sidebar' 
  },
  
  // 대시보드 위젯
  { 
    id: 'dashboard-stats', 
    name: '대시보드 통계', 
    selector: '.dashboard-stats', 
    description: '대시보드 통계 위젯', 
    category: 'dashboard' 
  },
  { 
    id: 'dashboard-charts', 
    name: '대시보드 차트', 
    selector: '.dashboard-charts', 
    description: '대시보드 차트 위젯', 
    category: 'dashboard' 
  },
  { 
    id: 'dashboard-recent-activity', 
    name: '최근 활동', 
    selector: '.dashboard-recent-activity', 
    description: '대시보드 최근 활동 위젯', 
    category: 'dashboard' 
  },
  
  // 기타 레이아웃 요소
  { 
    id: 'breadcrumb', 
    name: '브레드크럼', 
    selector: '.breadcrumb', 
    description: '페이지 경로 표시', 
    category: 'navigation' 
  },
  { 
    id: 'page-title', 
    name: '페이지 제목', 
    selector: '.page-title', 
    description: '페이지 제목 영역', 
    category: 'navigation' 
  },
  { 
    id: 'footer', 
    name: '푸터', 
    selector: '.footer', 
    description: '페이지 하단 푸터', 
    category: 'navigation' 
  }
];

// 권한 카테고리 정의
export const permissionCategories = {
  menu: {
    main: '메인',
    management: '관리',
    betting: '배팅',
    finance: '금융',
    service: '서비스',
    content: '콘텐츠',
    game: '게임',
    admin: '관리자',
    system: '시스템',
    development: '개발'
  },
  button: {
    action: '액션',
    data: '데이터',
    settings: '설정',
    finance: '금융',
    management: '관리',
    'member-data': '회원 정보',
    'member-activity': '회원 활동',
    'agent-request': '에이전트 요청',
    'member-stats': '회원 통계'
  },
  css: {
    admin: '관리자',
    system: '시스템',
    finance: '금융',
    debug: '디버그'
  },
  layout: {
    notification: '알림',
    toolbar: '툴바',
    sidebar: '사이드바',
    dashboard: '대시보드',
    navigation: '네비게이션'
  }
}; 