// 회원관리 페이지용 설정 데이터
// 
// 참고: 회원 유형(memberTypes)과 계층구조(memberTypeHierarchy)는 
// 단계설정에서 동적으로 받아오므로 여기서 하드코딩하지 않습니다.

// 중앙 상수에서 import
import { API_OPTIONS, BANK_LIST } from '../../../constants';
import { getTableVersion } from '../../../config/tableVersions';

// API 옵션 (중앙 상수 사용)
export const apiOptions = API_OPTIONS;

// 은행 목록 (중앙 상수 사용)
export const bankList = BANK_LIST;

// 회원 데이터는 useDynamicTypes 훅을 통해 동적으로 생성됩니다.

// 컬럼 정의 버전 (중앙 버전 관리에서 가져옴)
export const MEMBERS_COLUMNS_VERSION = getTableVersion('members_table');

// 회원관리 컬럼 정의
export const membersColumns = [
  {
    id: 'checkbox',
    type: 'checkbox',
    width: 50,
    sortable: false,
  },
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
    align: 'center',
  },
  {
    id: 'type',
    header: '유형',
    type: 'hierarchical',
    width: 120,
    cellRenderer: 'chip',
    sortable: true,
  },
  {
    id: 'userId',
    header: '아이디(닉네임)',
    type: 'multiline',
    width: 150,
    sortable: true,
    clickable: true,
  },
  {
    id: 'parentTypes',
    header: '상위에이전트',
    type: 'custom',
    width: 200,
    sortable: false,
    cellRenderer: 'parentChips',
  },
  {
    id: 'actions',
    header: '지급/회수',
    type: 'button',
    width: 160,
    align: 'center',
    buttons: [
      { label: '지급', color: 'primary', variant: 'outlined' },
      { label: '회수', color: 'error', variant: 'outlined' },
    ],
    buttonDirection: 'row',
  },
  {
    id: 'balance',
    header: '보유금액',
    type: 'default',
    width: 120,
    align: 'right',
    sortable: true,
  },
  {
    id: 'gameMoney',
    header: '게임머니',
    type: 'custom',
    width: 160,
    align: 'right',
    sortable: true,
    customRenderer: 'gameMoneyWithButton',
  },
  {
    id: 'rollingPercent',
    header: '롤링%',
    type: 'custom',
    width: 100,
    align: 'center',
    sortable: true,
    customRenderer: 'rollingPercent',
  },
  {
    id: 'rollingAmount',
    header: '롤링금',
    type: 'custom',
    width: 160,
    align: 'right',
    sortable: true,
    customRenderer: 'rollingAmountWithButton',
  },
  {
    id: 'api',
    header: 'API',
    type: 'dropdown',
    width: 120,
    align: 'center',
    sortable: true,
  },
  {
    id: 'deposit',
    header: '입금',
    type: 'default',
    width: 120,
    align: 'right',
    sortable: true,
  },
  {
    id: 'withdrawal',
    header: '출금',
    type: 'default',
    width: 120,
    align: 'right',
    sortable: true,
  },
  {
    id: 'connectionStatus',
    header: '접속상태',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
  },
  {
    id: 'lastGame',
    header: '마지막게임',
    type: 'default',
    width: 150,
    align: 'center',
    sortable: true,
  },
  {
    id: 'name',
    header: '이름',
    type: 'default',
    width: 100,
    align: 'center',
    sortable: true,
  },
  {
    id: 'accountNumber',
    header: '계좌번호',
    type: 'default',
    width: 150,
    align: 'center',
    sortable: true,
  },
  {
    id: 'bank',
    header: '은행',
    type: 'default',
    width: 100,
    align: 'center',
    sortable: true,
  },
  {
    id: 'phone',
    header: '전화번호',
    type: 'default',
    width: 130,
    align: 'center',
    sortable: true,
  },
  {
    id: 'profitLoss',
    type: 'group',
    header: '손익',
    children: [
      { 
        id: 'profitLoss.slot', 
        header: '슬롯', 
        width: 100,
        align: 'right',
        sortable: true
      },
      { 
        id: 'profitLoss.casino', 
        header: '카지노', 
        width: 100,
        align: 'right',
        sortable: true
      },
      { 
        id: 'profitLoss.total', 
        header: '종합', 
        width: 100,
        align: 'right',
        sortable: true
      },
    ],
  },
  {
    id: 'lastLoginDate',
    header: '접속일',
    type: 'datetime',
    width: 150,
    align: 'center',
    sortable: true,
  },
  {
    id: 'registrationDate',
    header: '가입일',
    type: 'datetime',
    width: 150,
    align: 'center',
    sortable: true,
  },
];

// 필터 옵션
export const membersFilterOptions = [
  {
    id: 'status',
    label: '상태',
    items: [
      { value: '', label: '전체' },
      { value: 'online', label: '온라인' },
      { value: 'offline', label: '오프라인' },
      { value: 'suspended', label: '정지' }
    ]
  },
  {
    id: 'type',
    label: '회원유형',
    items: [
      { value: '', label: '전체' }
      // 참고: 동적 유형 옵션은 컴포넌트에서 useDynamicTypes를 통해 추가됩니다.
    ]
  },
  {
    id: 'api',
    label: 'API',
    items: [
      { value: '', label: '전체' },
      ...apiOptions.map(option => ({
        value: option.value,
        label: option.label
      }))
    ]
  }
];

 