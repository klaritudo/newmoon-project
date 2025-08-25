/**
 * 슬롯/카지노 베팅내역 데이터 정의
 */

// 게임 유형 옵션 - 실제 사용시 API에서 가져옴
export const gameTypeOptions = [];

// 게임사 옵션 - 실제 사용시 API에서 가져옴
export const gameCompanyOptions = [];

// 베팅 섹션 옵션 - 실제 사용시 API에서 가져옴
export const bettingSectionOptions = [];

// 슬롯/카지노 테이블 컬럼 정의
export const slotCasinoColumns = [
  {
    id: 'no',
    label: 'No.',
    width: '80px',
    sortable: true,
    type: 'number',
    pinnable: true
  },
  {
    id: 'bettingDate',
    label: '베팅일자',
    width: '180px',
    sortable: true,
    type: 'betting_date', // 특수 타입 - 베팅/처리 일자 구분
    pinnable: true
  },
  {
    id: 'memberInfo',
    label: '아이디(닉네임)',
    width: '160px',
    sortable: true,
    type: 'multiline',
    clickable: true,
    pinned: false,
    pinnable: true
  },
  {
    id: 'bettingInfo',
    label: '베팅정보',
    width: '200px',
    sortable: false,
    type: 'betting_info', // 특수 타입 - 베팅 정보 그리드
    pinnable: true
  },
  {
    id: 'bettingSection',
    label: '베팅섹션',
    width: '120px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'gameType',
    label: '게임유형',
    width: '100px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'gameCompany',
    label: '게임사',
    width: '120px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'gameName',
    label: '게임',
    width: '150px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'gameId',
    label: '게임ID',
    width: '120px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'transId',
    label: 'TransID',
    width: '150px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'linkTransId',
    label: 'LinkTransID',
    width: '150px',
    sortable: true,
    type: 'text',
    pinnable: true
  },
  {
    id: 'detailView',
    label: '상세보기',
    width: '100px',
    sortable: false,
    type: 'button',
    buttonText: '상세보기',
    pinnable: false
  },
  {
    id: 'remarks',
    label: '비고',
    width: '120px',
    sortable: false,
    type: 'betting_action', // 특수 타입 - 공베팅 버튼들
    pinnable: false
  }
];

// 더 이상 사용하지 않는 샘플 데이터 생성 함수 - 실제 데이터는 API에서 가져옴
export const generateSlotCasinoData = () => {
  console.warn('generateSlotCasinoData는 더 이상 사용되지 않습니다. API에서 실제 데이터를 가져오세요.');
  return [];
};

// 더 이상 사용하지 않는 상세보기 데이터 함수 - 실제 데이터는 API에서 가져옴
export const getBettingDetailData = (bettingId) => {
  console.warn('getBettingDetailData는 더 이상 사용되지 않습니다. API에서 실제 데이터를 가져오세요.');
  return null;
}; 