/**
 * 문의관리 데이터
 */

// 상태 옵션 - 새로운 enum 값에 맞춰 업데이트
export const statusOptions = [
  { value: 'all', label: '전체', color: 'default' },
  { value: 'requesting', label: '문의 중', color: 'warning' },
  { value: 'waiting', label: '대기', color: 'info' },
  { value: 'replied', label: '답변완료', color: 'success' },
  { value: 'no_reply', label: '미답변완료', color: 'default' }
];

// 문의 유형 옵션
export const messageTypeOptions = [
  { value: 'inquiry', label: '일반문의' },
  { value: 'complaint', label: '불만사항' },
  { value: 'suggestion', label: '건의사항' },
  { value: 'technical', label: '기술지원' },
  { value: 'payment', label: '결제문의' },
  { value: 'account', label: '계정문의' }
];

// 문의관리 컬럼 정의
export const messagesColumns = [
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
    id: 'memberType',
    label: '유형',
    width: 120,
    align: 'center',
    type: 'chip',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'memberInfo',
    label: '아이디(닉네임)',
    width: 180,
    align: 'center',
    type: 'member',
    clickable: true,
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'superAgent',
    label: '상위에이전트',
    width: 200,
    align: 'center',
    type: 'horizontal',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'inquiryType',
    label: '문의유형',
    width: 120,
    align: 'center',
    type: 'chip',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'title',
    label: '제목',
    width: 300,
    align: 'center',
    type: 'clickable',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'createdDate',
    label: '등록날짜',
    width: 180,
    align: 'center',
    type: 'datetime',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'readDate',
    label: '읽은날짜',
    width: 180,
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
    type: 'chip',
    sx: { textAlign: 'center !important' },
    pinnable: true
  },
  {
    id: 'actions',
    label: '액션',
    width: 250,
    align: 'center',
    type: 'button',
    sx: { textAlign: 'center !important' },
    pinnable: false,
    buttons: [
      {
        type: 'reply',
        label: '회신',
        variant: 'outlined',
        color: 'primary',
        size: 'small',
        show: (row) => {
          const statusLabel = row.statusLabel || row.status || '문의 중';
          return statusLabel !== '답변완료' && statusLabel !== '미답변완료';
        }
      },
      {
        type: 'pending',
        label: '대기',
        variant: 'outlined',
        color: 'warning',
        size: 'small',
        show: (row) => {
          const statusLabel = row.statusLabel || row.status || '문의 중';
          // 문의 중 상태에서 대기로 변경 가능
          return statusLabel === '문의 중';
        }
      },
      {
        type: 'delete',
        label: '삭제',
        variant: 'outlined',
        color: 'error',
        size: 'small',
        show: (row) => {
          return true; // 모든 상태에서 삭제 버튼 표시
        }
      }
    ]
  }
];

// 랜덤 문의 제목 생성용 배열
const inquiryTitles = [
  '게임 중 오류가 발생했습니다',
  '출금 처리가 지연되고 있습니다',
  '보너스 지급에 대한 문의',
  '계정 로그인이 안됩니다',
  '비밀번호 변경 요청',
  '슬롯게임 결과에 대한 이의제기',
  '카지노 게임 규칙 문의',
  '입금 내역 확인 요청',
  '회원 등급 상향 요청',
  '이벤트 참여 방법 문의',
  '모바일 앱 사용법 문의',
  '게임 이용 제한 해제 요청',
  '개인정보 수정 요청',
  '탈퇴 절차 문의',
  '추천인 등록 문의',
  '포인트 적립 오류 신고',
  '게임 머니 누락 신고',
  '베팅 취소 요청',
  '계정 보안 강화 문의',
  '고객센터 운영시간 문의'
];

// 랜덤 문의 내용 생성용 배열
const inquiryContents = [
  '안녕하세요. 게임 이용 중 문제가 발생하여 문의드립니다.\n\n상세 내용:\n- 발생 시간: 오늘 오후 3시경\n- 게임명: 슬롯게임\n- 증상: 갑자기 게임이 멈춤\n\n빠른 처리 부탁드립니다.',
  '출금 신청을 했는데 처리가 지연되고 있습니다.\n\n신청 정보:\n- 신청일: 어제\n- 금액: 100만원\n- 은행: 국민은행\n\n언제쯤 처리될지 알려주세요.',
  '이번 달 보너스가 지급되지 않았습니다.\n\n회원 정보:\n- 등급: VIP\n- 이용 기간: 6개월\n\n확인 후 처리 부탁드립니다.',
  '계정 로그인이 안되어 문의드립니다.\n\n오류 메시지: "아이디 또는 비밀번호가 잘못되었습니다"\n\n비밀번호는 분명히 맞는데 로그인이 안됩니다.',
  '비밀번호를 변경하고 싶습니다.\n\n현재 비밀번호를 분실하여 재설정이 필요합니다.\n\n본인 확인 절차 안내 부탁드립니다.'
];

// 문의관리 데이터 생성 함수
export const generateMessagesData = (dynamicTypes = {}, dynamicTypeHierarchy = {}, membersData = []) => {
  // 항상 기본 데이터 생성 (조건 제거)
  const data = [];
  
  for (let i = 0; i < 50; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const statusRandom = Math.random();
    let status, readDate = null;
    
    if (statusRandom < 0.25) {
      status = 'requesting';
    } else if (statusRandom < 0.5) {
      status = 'waiting';
      readDate = new Date(createdDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
    } else if (statusRandom < 0.75) {
      status = 'replied';
      readDate = new Date(createdDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
    } else {
      status = 'no_reply';
      readDate = new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
    }
    
    const memberName = `user${String(i + 1).padStart(3, '0')}`;
    const nickname = `닉네임${i + 1}`;
    
    const messageTypeOption = messageTypeOptions[Math.floor(Math.random() * messageTypeOptions.length)];
    
    // 다양한 회원 유형 생성 (동적 유형이 없을 때 기본값)
    const defaultTypes = [
      { id: 'member', label: '회원', color: 'primary' },
      { id: 'agent', label: '에이전트', color: 'secondary' },
      { id: 'dealer', label: '딜러', color: 'success' },
      { id: 'admin', label: '관리자', color: 'error' }
    ];
    
    const typeIdx = Math.floor(Math.random() * defaultTypes.length);
    const type = defaultTypes[typeIdx];
    
    data.push({
      id: i + 1,
      memberType: {
        id: type.id,
        label: type.label,
        color: type.color,
        variant: 'outlined'
      },
      memberInfo: `${memberName}\n${nickname}`,
      username: memberName,
      nickname: nickname,
      superAgent: [],
      inquiryType: {
        label: messageTypeOption.label,
        color: 'default',
        variant: 'outlined'
      },
      title: inquiryTitles[i % inquiryTitles.length],
      content: inquiryContents[i % inquiryContents.length],
      createdDate: createdDate.toISOString().split('T')[0],
      readDate: readDate ? readDate.toISOString().split('T')[0] : null,
      status: {
        label: statusOptions.find(opt => opt.value === status)?.label || '문의 중',
        color: statusOptions.find(opt => opt.value === status)?.color || 'warning',
        variant: 'outlined'
      },
      messageType: messageTypeOption.value
    });
  }
  
  return data;
}; 