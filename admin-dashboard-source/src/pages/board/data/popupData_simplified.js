// 팝업 설정 데이터 및 컬럼 정의 (간소화된 버전)

// 팝업 상태 옵션
export const popupStatusOptions = [
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' }
];

// 팝업 표시 페이지 옵션 (새로운 타겟 시스템)
export const popupDisplayPageOptions = [
  { value: 'admin', label: '관리자' },
  { value: 'user', label: '유저페이지' },
  { value: 'all', label: '관리자+유저페이지' }
];

// 클릭 동작 옵션
export const clickActionOptions = [
  { value: 'none', label: '동작 없음' },
  { value: 'url', label: 'URL 열기' },
  { value: 'close', label: '팝업 닫기' }
];

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
    renderCell: (params) => {
      const statusOption = popupStatusOptions.find(opt => opt.value === params.value);
      return statusOption ? statusOption.label : params.value;
    }
  },
  {
    id: 'topPosition',
    label: 'Top',
    width: 80,
    align: 'center',
    sortable: true,
    renderCell: (params) => {
      return `${params.value}px`;
    }
  },
  {
    id: 'leftPosition',
    label: 'Left',
    width: 80,
    align: 'center',
    sortable: true,
    renderCell: (params) => {
      return `${params.value}px`;
    }
  },
  {
    id: 'target',
    label: '대상',
    width: 120,
    align: 'center',
    sortable: true,
    renderCell: (params) => {
      const targetOption = popupDisplayPageOptions.find(opt => opt.value === params.row.display_page);
      return targetOption ? targetOption.label : params.row.display_page;
    }
  },
  {
    id: 'width',
    label: '가로',
    width: 80,
    align: 'center',
    sortable: true,
    renderCell: (params) => {
      return `${params.value}px`;
    }
  },
  {
    id: 'height',
    label: '세로',
    width: 80,
    align: 'center',
    sortable: true,
    renderCell: (params) => {
      return `${params.value}px`;
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