// 이벤트 관리 데이터 및 컬럼 정의

// 컬럼 버전 (컬럼 구조 변경 시 증가)
export const EVENTS_COLUMNS_VERSION = 6;

// 이벤트 타입 옵션
export const eventTypeOptions = [
  { value: 'promotion', label: '프로모션' },
  { value: 'bonus', label: '보너스' },
  { value: 'tournament', label: '토너먼트' },
  { value: 'special', label: '특별 이벤트' },
  { value: 'seasonal', label: '시즌 이벤트' }
];

// 이벤트 상태 옵션
export const eventStatusOptions = [
  { value: 'scheduled', label: '예정', color: 'info' },
  { value: 'active', label: '진행중', color: 'success' },
  { value: 'paused', label: '일시정지', color: 'warning' },
  { value: 'ended', label: '종료', color: 'default' },
  { value: 'cancelled', label: '취소', color: 'error' }
];

// 이벤트 대상 옵션
export const eventTargetOptions = [
  { value: 'all', label: '전체 회원' },
  { value: 'new', label: '신규 회원' },
  { value: 'vip', label: 'VIP 회원' },
  { value: 'active', label: '활성 회원' },
  { value: 'inactive', label: '비활성 회원' }
];

// 이벤트 테이블 컬럼 정의
export const eventsColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 80,
    align: 'center',
    type: 'number',
    sortable: true,
    pinnable: true
  },
  {
    id: 'title',
    label: '이벤트명',
    width: 250,
    align: 'left',
    type: 'string',
    sortable: true,
    pinnable: true
  },
  {
    id: 'event_type',
    label: '타입',
    width: 120,
    align: 'center',
    type: 'chip',
    sortable: true,
    render: (row) => {
      const typeOption = eventTypeOptions.find(opt => opt.value === row.event_type);
      if (!typeOption) return { label: row.event_type || '미분류', color: 'default', variant: 'outlined' };
      return {
        label: typeOption.label,
        color: 'default',
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
      const statusOption = eventStatusOptions.find(opt => opt.value === row.status);
      if (!statusOption) return { label: row.status || '미정', color: 'default', variant: 'outlined' };
      return {
        label: statusOption.label,
        color: statusOption.color,
        variant: 'outlined'
      };
    }
  },
  // target 필드는 DB에 없음 - 추후 추가 필요
  // {
  //   id: 'target',
  //   label: '대상',
  //   width: 120,
  //   align: 'center',
  //   type: 'chip',
  //   sortable: true,
  //   render: (row) => {
  //     const targetOption = eventTargetOptions.find(opt => opt.value === row.target);
  //     return targetOption ? targetOption.label : row.target;
  //   }
  // },
  {
    id: 'start_date',
    label: '시작일',
    width: 180,
    align: 'center',
    type: 'datetime',
    sortable: true
  },
  {
    id: 'end_date',
    label: '종료일',
    width: 180,
    align: 'center',
    type: 'datetime',
    sortable: true
  },
  {
    id: 'current_participants',
    label: '참여자수',
    width: 100,
    align: 'right',
    type: 'number',
    sortable: true,
    render: (row) => {
      return row.current_participants ? row.current_participants.toLocaleString() : '0';
    }
  },
  // rewardAmount 필드는 DB에 없음 - 추후 추가 필요
  // {
  //   id: 'rewardAmount',
  //   label: '보상금액',
  //   width: 120,
  //   align: 'right',
  //   type: 'currency',
  //   sortable: true,
  //   render: (row) => {
  //     return row.rewardAmount ? `${row.rewardAmount.toLocaleString()}원` : '0원';
  //   }
  // },
  {
    id: 'view_count',
    label: '조회수',
    width: 100,
    align: 'right',
    type: 'number',
    sortable: true
  },
  {
    id: 'created_by',
    label: '작성자',
    width: 150,
    align: 'center',
    type: 'multiline',
    sortable: true
  },
  {
    id: 'created_at',
    label: '등록일',
    width: 180,
    align: 'center',
    type: 'datetime',
    sortable: true
  },
  {
    id: 'actions',
    label: '관리',
    width: 320,
    align: 'center',
    sortable: false,
    pinnable: false
  }
];

// 이벤트 데이터 생성 함수
export const generateEventsData = (count = 30) => {
  const events = [];
  const eventTitles = [
    '신규 회원 가입 보너스',
    '주말 특별 프로모션',
    '슬롯 토너먼트 대회',
    '첫 입금 보너스 이벤트',
    'VIP 회원 전용 이벤트',
    '월말 정산 보너스',
    '친구 추천 이벤트',
    '생일 축하 보너스',
    '연속 접속 보상',
    '대박 잭팟 이벤트',
    '카지노 챌린지',
    '럭키 드로우 이벤트',
    '시즌 특별 보너스',
    '출석체크 이벤트',
    '레벨업 축하 보너스'
  ];

  const eventDescriptions = [
    '신규 회원을 위한 특별한 혜택을 제공합니다.',
    '주말 동안 진행되는 특별 프로모션입니다.',
    '슬롯 게임 토너먼트에 참여하여 상금을 획득하세요.',
    '첫 입금 시 추가 보너스를 받을 수 있습니다.',
    'VIP 회원만을 위한 독점 이벤트입니다.',
    '월말 정산 시 추가 보너스를 지급합니다.',
    '친구를 추천하고 보상을 받으세요.',
    '생일을 맞은 회원에게 특별한 선물을 드립니다.',
    '연속으로 접속하면 보상이 증가합니다.',
    '대박 잭팟을 터뜨릴 기회입니다.',
    '다양한 카지노 게임 챌린지에 도전하세요.',
    '운이 좋은 회원에게 특별한 상품을 드립니다.',
    '시즌을 맞아 특별한 보너스를 제공합니다.',
    '매일 출석체크하고 보상을 받으세요.',
    '레벨업을 축하하는 특별한 보너스입니다.'
  ];

  for (let i = 1; i <= count; i++) {
    const titleIndex = Math.floor(Math.random() * eventTitles.length);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    const now = new Date();
    let status;
    if (startDate > now) {
      status = 'scheduled';
    } else if (endDate < now) {
      status = Math.random() > 0.8 ? 'cancelled' : 'ended';
    } else {
      status = Math.random() > 0.1 ? 'active' : 'paused';
    }

    events.push({
      id: i,
      no: i,
      title: `${eventTitles[titleIndex]} ${i}`,
      content: eventDescriptions[titleIndex],
      event_type: eventTypeOptions[Math.floor(Math.random() * eventTypeOptions.length)].value,
      status: status,
      // target: eventTargetOptions[Math.floor(Math.random() * eventTargetOptions.length)].value,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      current_participants: Math.floor(Math.random() * 5000),
      max_participants: Math.floor(Math.random() * 10000) + 1000,
      // rewardAmount: Math.floor(Math.random() * 10000000) + 100000,
      view_count: Math.floor(Math.random() * 10000),
      created_by: ['관리자', '이벤트팀', '마케팅팀'][Math.floor(Math.random() * 3)],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_pinned: i <= 3 ? true : false, // 처음 3개는 메인고정으로 설정
      is_active: status !== 'cancelled' && status !== 'ended'
    });
  }

  // 정렬하지 않고 원래 순서 그대로 반환
  return events;
};
