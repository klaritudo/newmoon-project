// 회원가입요청 페이지 설정 데이터

// 테이블 컬럼 정의
export const registrationRequestsColumns = [
  {
    id: 'checkbox',
    label: '',
    width: 50,
    fixed: 'left',
    type: 'checkbox',
    sortable: false
  },
  {
    id: 'index',
    label: 'No.',
    width: 60,
    fixed: 'left',
    align: 'center',
    sortable: false,
    type: 'index'
  },
  {
    id: 'username',
    label: '아이디',
    width: 120,
    sortable: true,
    render: (value, row) => (
      <span>
        {value}
        {row.nickname && <span style={{ color: '#666', marginLeft: 4 }}>({row.nickname})</span>}
      </span>
    )
  },
  {
    id: 'referrer',
    label: '상위에이전트',
    width: 120,
    sortable: true
  },
  {
    id: 'name',
    label: '이름',
    width: 100,
    sortable: true
  },
  {
    id: 'account_number',
    label: '계좌번호',
    width: 200,
    render: (value, row) => {
      const bankLabels = {
        kb: '국민은행',
        shinhan: '신한은행',
        woori: '우리은행',
        hana: '하나은행',
        nh: '농협은행',
        ibk: '기업은행',
        sc: 'SC제일은행',
        kakao: '카카오뱅크',
        toss: '토스뱅크'
      };
      if (!value && !row.bank_name) return '-';
      return (
        <span>
          {value || '-'} ({bankLabels[row.bank_name] || row.bank_name || '-'})
        </span>
      );
    }
  },
  {
    id: 'bank_name',
    label: '은행',
    width: 100,
    align: 'center',
    render: (value, row) => {
      const bankLabels = {
        kb: '국민은행',
        shinhan: '신한은행',
        woori: '우리은행',
        hana: '하나은행',
        nh: '농협은행',
        ibk: '기업은행',
        sc: 'SC제일은행',
        kakao: '카카오뱅크',
        toss: '토스뱅크'
      };
      return bankLabels[value] || value;
    }
  },
  {
    id: 'phone',
    label: '전화번호',
    width: 120,
    sortable: true
  },
  {
    id: 'created_at',
    label: '가입신청일',
    width: 140,
    sortable: true,
    render: (value, row) => {
      if (!value) return '-';
      const date = new Date(value);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  {
    id: 'status',
    label: '상태',
    width: 100,
    align: 'center',
    type: 'status'
  },
  {
    id: 'actions',
    label: '액션',
    width: 200,
    fixed: 'right',
    align: 'center',
    buttons: [
      {
        label: '승인',
        type: 'approve',
        color: 'primary',
        size: 'small',
        show: (row) => row.status === 'pending' || row.status === 'waiting'
      },
      {
        label: '대기',
        type: 'wait',
        color: 'warning',
        size: 'small',
        show: (row) => row.status === 'pending'
      },
      {
        label: '비승인',
        type: 'reject',
        color: 'error',
        size: 'small',
        show: (row) => row.status === 'pending' || row.status === 'waiting'
      }
    ]
  }
];

// API 옵션
export const apiOptions = {
  url: '/registration-requests',
  pageSize: 20,
  searchableFields: ['username', 'nickname', 'name', 'phone'],
  filterableFields: ['status', 'created_at'],
  sortableFields: ['username', 'name', 'phone', 'created_at']
};

// 컬럼 버전 (로컬 스토리지 초기화용)
export const REGISTRATION_REQUESTS_COLUMNS_VERSION = '1.0.0';

// 상태별 필터 옵션
export const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '요청 중' },
  { value: 'waiting', label: '대기' },
  { value: 'rejected', label: '비승인' }
];