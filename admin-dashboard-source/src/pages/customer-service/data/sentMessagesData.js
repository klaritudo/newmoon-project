/**
 * 보낸문의 데이터
 * 관리자가 고객/에이전트에게 보낸 문의 관리
 */

// 발송 상태 옵션
export const sentStatusOptions = [
  { value: 'completed', label: '발송완료', color: 'success' },
  { value: 'sending', label: '발송중', color: 'warning' },
  { value: 'failed', label: '발송실패', color: 'error' }
];

// 수신자 유형 옵션
export const recipientTypeOptions = [
  { value: 'all', label: '전체', color: 'primary' },
  { value: 'agent', label: '에이전트', color: 'secondary' },
  { value: 'line', label: '라인', color: 'info' },
  { value: 'member', label: '회원', color: 'success' },
  { value: 'custom', label: '선택', color: 'warning' }
];

// 보낸문의 컬럼 정의
export const sentMessagesColumns = [
  {
    id: 'index',
    label: 'No.',
    width: 80,
    align: 'center',
    type: 'number',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'recipientType',
    label: '유형',
    width: 120,
    align: 'center',
    type: 'text', // chip에서 text로 변경하고 render 함수로 처리
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'recipientCount',
    label: '수신자',
    width: 200,
    align: 'center',
    type: 'custom',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'readStatus',
    label: '읽음여부',
    width: 120,
    align: 'center',
    type: 'custom',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'subject',
    label: '제목',
    width: 300,
    align: 'center',
    type: 'clickable',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'sentDate',
    label: '발송일시',
    width: 150,
    align: 'center',
    type: 'datetime',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'status',
    label: '상태',
    width: 100,
    align: 'center',
    type: 'text', // chip에서 text로 변경하고 render 함수로 처리
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'actions',
    label: '비고',
    width: 200,
    align: 'center',
    type: 'actions',
    sx: { textAlign: 'center !important' },
    pinnable: false
  }
]; 