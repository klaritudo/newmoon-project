// 모든 상수를 한 곳에서 export - Single Source of Truth

export * from './permissions';

// API 옵션 (전체 앱에서 사용)
export const API_OPTIONS = [
  { value: 'Honor API', label: 'Honor API' },
  { value: 'disabled', label: '비활성' }
];

// 은행 목록 (전체 앱에서 사용)
export const BANK_LIST = [
  '국민은행',
  '신한은행', 
  '우리은행',
  '하나은행',
  '농협은행',
  '기업은행',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  'SC제일은행',
  '씨티은행',
  '부산은행',
  '대구은행',
  '광주은행',
  '전북은행',
  '경남은행',
  '제주은행',
  '새마을금고',
  '신협',
  '우체국',
  '수협'
];

// 연결 상태
export const CONNECTION_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  SUSPENDED: 'suspended'
};

// 연결 상태 라벨 (한국어)
export const CONNECTION_STATUS_LABELS = {
  [CONNECTION_STATUS.ONLINE]: '온라인',
  [CONNECTION_STATUS.OFFLINE]: '오프라인', 
  [CONNECTION_STATUS.SUSPENDED]: '정지'
};

// 회원 상태
export const MEMBER_STATUS = {
  NORMAL: 'normal',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  DELETED: 'deleted'
};

// 회원 상태 라벨 (한국어)
export const MEMBER_STATUS_LABELS = {
  [MEMBER_STATUS.NORMAL]: '정상',
  [MEMBER_STATUS.INACTIVE]: '비활성',
  [MEMBER_STATUS.BLOCKED]: '차단',
  [MEMBER_STATUS.DELETED]: '삭제'
};

// 게임 타입
export const GAME_TYPES = {
  SLOT: 'slot',
  CASINO: 'casino'
};

// 게임 타입 라벨
export const GAME_TYPE_LABELS = {
  [GAME_TYPES.SLOT]: '슬롯',
  [GAME_TYPES.CASINO]: '카지노'
};

// 정렬 방향
export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
};

// 페이지 크기 옵션
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// 날짜 형식
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss'
};

// 숫자 형식
export const NUMBER_FORMAT = {
  CURRENCY: {
    style: 'decimal',
    maximumFractionDigits: 0
  },
  PERCENT: {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }
};