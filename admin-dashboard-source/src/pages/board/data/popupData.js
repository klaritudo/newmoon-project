// 팝업 설정 데이터 및 컬럼 정의 (간소화된 버전)

// 팝업 타입 옵션 (모달 타입으로 고정)
export const popupTypeOptions = [
  { value: 'modal', label: '모달' }
];

// 팝업 위치 옵션
export const popupPositionOptions = [
  { value: 'center', label: '중앙' },
  { value: 'top', label: '상단' },
  { value: 'bottom', label: '하단' },
  { value: 'custom', label: '커스텀' }
];

// 팝업 상태 옵션
export const popupStatusOptions = [
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' }
];

// 팝업 표시 페이지 옵션
export const popupDisplayPageOptions = [
  { value: 'admin', label: '관리자' },
  { value: 'user', label: '유저페이지' },
  { value: 'all', label: '관리자+유저페이지' }
];

// 호환성을 위한 별칭 (popupTargetOptions → popupDisplayPageOptions)
export const popupTargetOptions = popupDisplayPageOptions;

// 클릭 동작 옵션
export const clickActionOptions = [
  { value: 'none', label: '동작 없음' },
  { value: 'url', label: 'URL 열기' },
  { value: 'close', label: '팝업 닫기' }
];

// 더미 팝업 데이터 생성 함수
export const generatePopupData = (count = 10) => {
  const popups = [];
  const today = new Date();
  
  for (let i = 1; i <= count; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) + 7);
    
    popups.push({
      id: i,
      no: i,
      title: `팝업 공지 ${i}`,
      status: Math.random() > 0.3 ? 'active' : 'inactive',
      type: 'modal',
      position: 'custom',
      topPosition: Math.floor(Math.random() * 100) + 50,
      leftPosition: Math.floor(Math.random() * 100) + 50,
      width: 400 + Math.floor(Math.random() * 200),
      height: 300 + Math.floor(Math.random() * 200),
      content: `<p>팝업 내용 ${i}</p>`,
      display_page: ['admin', 'user', 'all'][Math.floor(Math.random() * 3)],
      target: ['admin', 'user', 'all'][Math.floor(Math.random() * 3)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      writer: `관리자${Math.floor(Math.random() * 5) + 1}`,
      createdAt: new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  return popups;
};

// 팝업 테이블 컬럼 정의
export const popupColumns = [
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
    label: '팝업명',
    width: 200,
    align: 'left',
    sortable: true,
    pinnable: true
  },
  {
    id: 'status',
    label: '상태',
    width: 80,
    align: 'center',
    sortable: true,
    type: 'text',
    formatter: (value) => {
      const statusOption = popupStatusOptions.find(opt => opt.value === value);
      return statusOption ? statusOption.label : value;
    }
  },
  {
    id: 'topPosition',
    label: 'Top',
    width: 80,
    align: 'center',
    sortable: true,
    type: 'text',
    formatter: (value) => {
      return `${value}px`;
    }
  },
  {
    id: 'leftPosition',
    label: 'Left',
    width: 80,
    align: 'center',
    sortable: true,
    type: 'text',
    formatter: (value) => {
      return `${value}px`;
    }
  },
  {
    id: 'target',
    label: '대상',
    width: 120,
    align: 'center',
    sortable: true,
    type: 'text',
    formatter: (value, row) => {
      const targetOption = popupDisplayPageOptions.find(opt => opt.value === row.display_page);
      return targetOption ? targetOption.label : row.display_page;
    }
  },
  {
    id: 'width',
    label: '가로',
    width: 80,
    align: 'center',
    sortable: true,
    type: 'text',
    formatter: (value) => {
      return `${value}px`;
    }
  },
  {
    id: 'height',
    label: '세로',
    width: 80,
    align: 'center',
    sortable: true,
    type: 'text',
    formatter: (value) => {
      return `${value}px`;
    }
  },
  {
    id: 'startDate',
    label: '시작일',
    width: 120,
    align: 'center',
    sortable: true
  },
  {
    id: 'endDate',
    label: '종료일',
    width: 120,
    align: 'center',
    sortable: true
  },
  {
    id: 'writer',
    label: '작성자',
    width: 100,
    align: 'center',
    sortable: true
  },
  {
    id: 'createdAt',
    label: '등록일',
    width: 120,
    align: 'center',
    sortable: true
  },
  {
    id: 'actions',
    label: '액션',
    width: 140,
    align: 'center',
    sortable: false,
    pinnable: false,
    type: 'button',
    buttons: [
      { 
        label: '수정', 
        color: 'primary', 
        variant: 'outlined',
        type: 'edit'
      },
      { 
        label: '삭제', 
        color: 'error', 
        variant: 'outlined',
        type: 'delete'
      }
    ],
    buttonDirection: 'row'
  }
];