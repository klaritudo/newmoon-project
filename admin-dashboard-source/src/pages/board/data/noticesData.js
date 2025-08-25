import { format } from 'date-fns';

// 컬럼 버전 (컬럼 구조 변경 시 증가)
export const NOTICES_COLUMNS_VERSION = 6;

/**
 * 공지사항 테이블 컬럼 정의
 */
export const noticesColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 70,
    align: 'center',
    type: 'number'
  },
  {
    id: 'title',
    label: '제목',
    width: 300,
    align: 'left',
    type: 'clickable',
    sortable: true
  },
  {
    id: 'writer',
    label: '작성자',
    width: 150,
    align: 'center',
    type: 'multiline',
    sortable: true
  },
  {
    id: 'importance',
    label: '중요도',
    width: 100,
    align: 'center',
    type: 'chip',
    sortable: true,
    render: (row) => {
      const importanceMap = {
        'high': { label: '중요', color: 'error' },
        'medium': { label: '보통', color: 'warning' },
        'low': { label: '일반', color: 'success' }
      };
      const importanceInfo = importanceMap[row.importance];
      if (!importanceInfo) return { label: row.importance || '미정', color: 'default', variant: 'outlined' };
      return {
        label: importanceInfo.label,
        color: importanceInfo.color,
        variant: 'outlined'
      };
    }
  },
  {
    id: 'status',
    label: '상태',
    width: 100,
    align: 'center',
    type: 'chip',
    sortable: true,
    render: (row) => {
      const statusMap = {
        'active': { label: '게시중', color: 'success' },
        'inactive': { label: '미게시', color: 'default' },
        'scheduled': { label: '예약', color: 'info' }
      };
      const statusInfo = statusMap[row.status];
      if (!statusInfo) return { label: row.status || '미정', color: 'default', variant: 'outlined' };
      return {
        label: statusInfo.label,
        color: statusInfo.color,
        variant: 'outlined'
      };
    }
  },
  {
    id: 'pinned',
    label: '상단고정',
    width: 100,
    align: 'center',
    type: 'chip',
    sortable: true,
    render: (row) => {
      if (row.pinned) {
        return {
          label: '고정',
          color: 'warning',
          variant: 'outlined'
        };
      }
      return {
        label: '일반',
        color: 'default',
        variant: 'outlined'
      };
    }
  },
  {
    id: 'target',
    label: '대상',
    width: 120,
    align: 'center',
    type: 'text',
    sortable: true
  },
  {
    id: 'viewCount',
    label: '조회수',
    width: 100,
    align: 'right',
    type: 'number',
    sortable: true
  },
  {
    id: 'createdAt',
    label: '작성일',
    width: 120,
    align: 'center',
    type: 'date',
    sortable: true
  },
  {
    id: 'updatedAt',
    label: '수정일',
    width: 120,
    align: 'center',
    type: 'date',
    sortable: true
  },
  {
    id: 'actions',
    label: '관리',
    width: 250,
    align: 'center',
    type: 'actions',
    actions: ['edit', 'delete']
  }
];

/**
 * 공지사항 중요도 옵션
 */
export const importanceOptions = [
  { value: 'high', label: '중요' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '일반' }
];

/**
 * 공지사항 상태 옵션
 */
export const statusOptions = [
  { value: 'active', label: '게시중' },
  { value: 'inactive', label: '미게시' },
  { value: 'scheduled', label: '예약' }
];

/**
 * 공지사항 대상 옵션
 */
export const targetOptions = [
  { value: 'all', label: '전체' },
  { value: 'member', label: '회원' },
  { value: 'agent', label: '에이전트' },
  { value: 'admin', label: '관리자' }
];

/**
 * 필터 필드 정의
 */
export const noticeFilterFields = [
  { id: 'importance', label: '중요도', type: 'select', options: importanceOptions },
  { id: 'status', label: '상태', type: 'select', options: statusOptions },
  { id: 'target', label: '대상', type: 'select', options: targetOptions },
  { id: 'pinned', label: '상단고정', type: 'boolean' },
  { id: 'createdAt', label: '작성일', type: 'date' },
  { id: 'updatedAt', label: '수정일', type: 'date' }
];

/**
 * 검색 필드 정의
 */
export const noticeSearchFields = [
  { id: 'title', label: '제목' },
  { id: 'content', label: '내용' },
  { id: 'writer', label: '작성자' }
];

/**
 * 더미 공지사항 데이터 생성 함수
 * @param {number} count 생성할 데이터 수
 * @returns {Array} 더미 데이터 배열
 */
export const generateNoticesData = (count = 50) => {
  const notices = [];
  const today = new Date();
  const writers = ['관리자', '운영자', '시스템', '고객센터'];
  const titles = [
    '서비스 점검 안내',
    '베팅 한도 변경 안내',
    '신규 게임사 추가 안내',
    '출금 정책 변경 안내',
    '이벤트 당첨자 발표',
    '개인정보 처리방침 개정 안내',
    '이용약관 개정 안내',
    '시스템 업그레이드 안내',
    '신규 게임 출시 안내',
    '가입 축하 이벤트 안내'
  ];
  
  const importance = ['high', 'medium', 'low'];
  const status = ['active', 'inactive', 'scheduled'];
  const targets = ['all', 'member', 'agent', 'admin'];
  
  for (let i = 0; i < count; i++) {
    const createdDate = new Date(today);
    createdDate.setDate(today.getDate() - Math.floor(Math.random() * 60));
    
    const updatedDate = new Date(createdDate);
    if (Math.random() > 0.7) {
      updatedDate.setDate(createdDate.getDate() + Math.floor(Math.random() * 10));
    }
    
    const titleIndex = Math.floor(Math.random() * titles.length);
    const title = `${titles[titleIndex]} ${Math.random() > 0.7 ? `(${i + 1})` : ''}`;
    
    const isPinned = Math.random() > 0.8;
    const importanceValue = importance[Math.floor(Math.random() * importance.length)];
    
    // 중요도가 높은 공지사항은 대부분 상단 고정
    const finalPinned = importanceValue === 'high' ? (Math.random() > 0.2) : isPinned;
    
    notices.push({
      id: i + 1,
      no: i + 1,
      title,
      content: `${title}에 대한 상세 내용입니다. 본문 내용은 에디터로 작성됩니다.`,
      writer: writers[Math.floor(Math.random() * writers.length)],
      importance: importanceValue,
      status: status[Math.floor(Math.random() * status.length)],
      pinned: finalPinned,
      target: targets[Math.floor(Math.random() * targets.length)],
      viewCount: Math.floor(Math.random() * 1000),
      createdAt: format(createdDate, 'yyyy-MM-dd'),
      updatedAt: format(updatedDate, 'yyyy-MM-dd')
    });
  }
  
  // 상단고정 항목은 앞에 오도록 정렬, no 값은 건드리지 않음
  return notices.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0; // no 값은 변경하지 않음
  });
};
