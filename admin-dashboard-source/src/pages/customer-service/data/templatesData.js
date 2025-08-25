/**
 * 템플릿 관리 데이터 구조
 */

// 템플릿 카테고리 옵션
export const templateCategoryOptions = [
  { value: 'all', label: '전체' },
  { value: '일반문의', label: '일반문의' },
  { value: '계정문의', label: '계정문의' },
  { value: '결제문의', label: '결제문의' },
  { value: '기술지원', label: '기술지원' },
  { value: '불만사항', label: '불만사항' },
  { value: '건의사항', label: '건의사항' },
  { value: '환불요청', label: '환불요청' },
  { value: '공지사항', label: '공지사항' },
  { value: '기타', label: '기타' }
];

// 템플릿 상태 옵션
export const templateStatusOptions = [
  { value: 'all', label: '전체' },
  { value: '활성', label: '활성' },
  { value: '비활성', label: '비활성' }
];

// 템플릿 컬럼 정의
export const templatesColumns = [
  {
    id: 'checkbox',
    label: '',
    type: 'checkbox',
    width: 50,
    sortable: false,
    visible: true,
    pinnable: false
  },
  {
    id: 'no',
    label: 'No.',
    type: 'number',
    width: 80,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'title',
    label: '템플릿명',
    type: 'clickable',
    width: 250,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'category',
    label: '카테고리',
    type: 'text',
    width: 120,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'status',
    label: '상태',
    type: 'chip',
    width: 100,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'usageCount',
    label: '사용횟수',
    type: 'number',
    width: 100,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'createdAt',
    label: '생성일',
    type: 'date',
    width: 120,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'updatedAt',
    label: '수정일',
    type: 'date',
    width: 120,
    sortable: true,
    visible: true,
    align: 'center',
    pinnable: true
  },
  {
    id: 'actions',
    label: '액션',
    type: 'actions',
    width: 150,
    sortable: false,
    visible: true,
    align: 'center',
    pinnable: false
  }
];

// 템플릿 샘플 데이터 생성 함수
export const generateTemplatesData = () => {
  const templates = [
    {
      id: 1,
      no: 1,
      title: '환영 메시지',
      category: '일반문의',
      status: '활성',
      content: '안녕하세요! 문의해 주셔서 감사합니다. 빠른 시일 내에 답변드리겠습니다.',
      description: '고객 문의 시 첫 응답으로 사용하는 환영 메시지 템플릿',
      usageCount: 45,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: 2,
      no: 2,
      title: '계정 잠금 해제 안내',
      category: '계정문의',
      status: '활성',
      content: '계정 잠금 해제를 위해 본인 확인 절차가 필요합니다. 신분증을 첨부하여 문의해 주세요.',
      description: '계정 잠금 시 해제 절차를 안내하는 템플릿',
      usageCount: 23,
      createdAt: '2024-01-16',
      updatedAt: '2024-01-22'
    },
    {
      id: 3,
      no: 3,
      title: '결제 오류 처리 방법',
      category: '결제문의',
      status: '활성',
      content: '결제 오류가 발생한 경우, 거래 내역을 확인하여 중복 결제 여부를 점검해 드리겠습니다.',
      description: '결제 관련 오류 발생 시 처리 방법을 안내하는 템플릿',
      usageCount: 18,
      createdAt: '2024-01-17',
      updatedAt: '2024-01-23'
    },
    {
      id: 4,
      no: 4,
      title: '기술 지원 요청',
      category: '기술지원',
      status: '활성',
      content: '기술적인 문제가 발생하셨군요. 상세한 오류 내용과 스크린샷을 첨부해 주시면 빠르게 해결해 드리겠습니다.',
      description: '기술적 문제 해결을 위한 추가 정보 요청 템플릿',
      usageCount: 31,
      createdAt: '2024-01-18',
      updatedAt: '2024-01-24'
    },
    {
      id: 5,
      no: 5,
      title: '환불 처리 안내',
      category: '환불요청',
      status: '활성',
      content: '환불 요청을 접수하였습니다. 환불 정책에 따라 3-5일 내에 처리해 드리겠습니다.',
      description: '환불 요청 접수 확인 및 처리 일정 안내 템플릿',
      usageCount: 12,
      createdAt: '2024-01-19',
      updatedAt: '2024-01-25'
    },
    {
      id: 6,
      no: 6,
      title: '서비스 점검 안내',
      category: '공지사항',
      status: '비활성',
      content: '시스템 점검으로 인해 일시적으로 서비스 이용이 제한될 수 있습니다.',
      description: '정기 점검 시 고객에게 안내하는 템플릿',
      usageCount: 8,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-26'
    },
    {
      id: 7,
      no: 7,
      title: '불만사항 접수 확인',
      category: '불만사항',
      status: '활성',
      content: '불편을 끼쳐드려 죄송합니다. 담당자가 확인 후 개선 방안을 마련하여 연락드리겠습니다.',
      description: '고객 불만사항 접수 시 사용하는 사과 및 처리 안내 템플릿',
      usageCount: 7,
      createdAt: '2024-01-21',
      updatedAt: '2024-01-27'
    },
    {
      id: 8,
      no: 8,
      title: '건의사항 감사 인사',
      category: '건의사항',
      status: '활성',
      content: '소중한 의견을 주셔서 감사합니다. 서비스 개선에 적극 반영하도록 하겠습니다.',
      description: '고객 건의사항에 대한 감사 인사 템플릿',
      usageCount: 15,
      createdAt: '2024-01-22',
      updatedAt: '2024-01-28'
    },
    {
      id: 9,
      no: 9,
      title: '임시 비활성 템플릿',
      category: '기타',
      status: '비활성',
      content: '임시로 비활성화된 템플릿입니다.',
      description: '테스트용 임시 템플릿',
      usageCount: 0,
      createdAt: '2024-01-23',
      updatedAt: '2024-01-29'
    },
    {
      id: 10,
      no: 10,
      title: '일반 문의 응답',
      category: '일반문의',
      status: '활성',
      content: '문의사항을 확인하였습니다. 관련 부서에서 검토 후 답변드리겠습니다.',
      description: '일반적인 문의에 대한 기본 응답 템플릿',
      usageCount: 52,
      createdAt: '2024-01-24',
      updatedAt: '2024-01-30'
    }
  ];

  return templates;
};

// 필터 필드 정의
export const templateFilterFields = [
  {
    key: 'category',
    type: 'select',
    label: '카테고리',
    options: templateCategoryOptions
  },
  {
    key: 'status',
    type: 'select',
    label: '상태',
    options: templateStatusOptions
  }
];

// 검색 필드 정의
export const templateSearchFields = ['title', 'content', 'category'];

export default {
  templatesColumns,
  generateTemplatesData,
  templateCategoryOptions,
  templateStatusOptions,
  templateFilterFields,
  templateSearchFields
}; 