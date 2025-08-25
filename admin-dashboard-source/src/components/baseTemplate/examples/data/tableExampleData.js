/**
 * 테이블 예제에서 사용하는 데이터
 * TableFilterAndPaginationExample 컴포넌트에서 사용
 */

/**
 * 테이블 예제 데이터
 * 
 * 이 파일은 테이블 컴포넌트 예제에서 사용하는 샘플 데이터를 제공합니다.
 * 
 * 참고: 하드코딩된 유형 정의는 제거되었습니다. 
 * 실제 애플리케이션에서는 useDynamicTypes 훅을 통해 동적으로 유형을 로드합니다.
 */

// 예제용 임시 유형 정의 (동적 유형 시스템 데모용)
// 실제 운영에서는 단계설정에서 동적으로 로드됩니다.
export const defaultTypes = {
  // 예제 목적으로만 사용되는 임시 데이터입니다.
  // 실제로는 useDynamicTypes를 사용하세요.
};

// 예제용 임시 계층 구조 (동적 유형 시스템 데모용)
export const defaultTypeHierarchy = {
  // 예제 목적으로만 사용되는 임시 데이터입니다.
  // 실제로는 useDynamicTypes를 사용하세요.
};

/**
 * 동적 유형 관리 유틸리티 함수들
 * 
 * 참고: 이 함수들은 예제 목적으로 제공됩니다.
 * 실제 운영에서는 단계설정 API와 useDynamicTypes 훅을 사용하세요.
 * 
 * 실제 유형 관리는 다음과 같이 작동합니다:
 * 1. 단계설정 페이지에서 유형 정의 및 계층 구조 설정
 * 2. API를 통해 데이터베이스에 저장
 * 3. useDynamicTypes 훅을 통해 동적으로 로드
 */

/**
 * 동적 유형 추가 예제 함수
 * 실제로는 API를 통해 서버에서 처리됩니다.
 */
export const addType = (id, typeInfo, parentTypes = [], childTypes = []) => {
  console.warn('이 함수는 예제용입니다. 실제로는 단계설정 API를 사용하세요.');
    return false;
};

/**
 * 동적 유형 수정 예제 함수 
 * 실제로는 API를 통해 서버에서 처리됩니다.
 */
export const updateType = (id, typeInfo) => {
  console.warn('이 함수는 예제용입니다. 실제로는 단계설정 API를 사용하세요.');
    return false;
};

/**
 * 동적 유형 삭제 예제 함수
 * 실제로는 API를 통해 서버에서 처리됩니다.
 */
export const deleteType = (id) => {
  console.warn('이 함수는 예제용입니다. 실제로는 단계설정 API를 사용하세요.');
    return false;
};

/**
 * 자식 유형 조회 예제 함수
 * 실제로는 useDynamicTypes 훅에서 제공하는 typeHierarchy를 사용하세요.
 */
export const getAllChildTypes = (typeId) => {
  console.warn('이 함수는 예제용입니다. 실제로는 useDynamicTypes 훅을 사용하세요.');
  return [];
};

/**
 * 유형 경로 조회 예제 함수
 * 실제로는 useDynamicTypes 훅에서 제공하는 데이터를 사용하세요.
 */
export const getTypePath = (typeId) => {
  console.warn('이 함수는 예제용입니다. 실제로는 useDynamicTypes 훅을 사용하세요.');
  return [];
};

// 테이블 컬럼 정의
export const initialColumns = [
  {
    id: 'checkbox',
    type: 'checkbox',
    width: 50,
    sortable: false,
    align: 'center',
  },
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
    align: 'center',
    sortable: true,
  },
  {
    id: 'userId',
    header: '아이디(닉네임)',
    type: 'multiline',
    width: 150,
    sortable: true,
    align: 'center',
  },
  {
    id: 'type',
    header: '유형',
    type: 'hierarchical',
    width: 120,
    cellRenderer: 'chip',
    sortable: true,
    align: 'center',
  },
  {
    id: 'parentType',
    header: '유형2',
    type: 'horizontal',
    width: 180,
    cellRenderer: 'chip',
    sortable: true,
    align: 'center',
  },
  {
    id: 'phone',
    header: '연락처',
    width: 150,
    sortable: true,
    align: 'center',
  },
  {
    id: 'email',
    header: '이메일',
    width: 180,
    sortable: true,
    align: 'center',
  },
  {
    id: 'buttons',
    header: '컬럼5',
    type: 'button',
    width: 160,
    align: 'center',
    buttons: [
      { label: '버튼1', color: 'primary', variant: 'outlined' },
      { label: '버튼2', color: 'secondary', variant: 'outlined' },
    ],
    buttonDirection: 'column',
  },
  {
    id: 'groupColumn1',
    header: '그룹컬럼1',
    type: 'group',
    align: 'center',
    children: [
      {
        id: 'childColumn1',
        header: '자식컬럼1',
        width: 120,
        align: 'center',
        sortable: true,
      },
      {
        id: 'childColumn2',
        header: '자식컬럼2',
        width: 120,
        align: 'center',
        sortable: true,
      },
    ],
  },
  {
    id: 'groupColumn2',
    header: '그룹컬럼2',
    type: 'group',
    align: 'center',
    children: [
      {
        id: 'childColumn3',
        header: '자식컬럼3',
        width: 100,
        align: 'center',
        sortable: true,
      },
      {
        id: 'childColumn4',
        header: '자식컬럼4',
        width: 100,
        align: 'center',
        sortable: true,
      },
      {
        id: 'childColumn5',
        header: '자식컬럼5',
        width: 100,
        align: 'center',
        sortable: true,
      },
      {
        id: 'childColumn6',
        header: '자식컬럼6',
        width: 100,
        align: 'center',
        sortable: true,
      },
    ],
  },
  {
    id: 'actions',
    header: '관리',
    type: 'button',
    width: 160,
    align: 'center',
    buttons: [
      { label: '수정', color: 'primary', variant: 'outlined' },
      { label: '삭제', color: 'error', variant: 'outlined' },
    ],
    buttonDirection: 'row',
  },
];

// 상태별 필터 항목
const statusFilterItems = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'pending', label: '대기 중' }
];

// 유형별 필터 항목을 동적으로 생성 (기본 유형 사용)
const categoryFilterItems = [
  { value: 'all', label: '전체' },
  ...Object.entries(defaultTypes).map(([id, type]) => ({
    value: id,
    label: type.label
  }))
];

// 필터 옵션 정의
export const filterOptions = [
  {
    id: 'status',
    label: '상태별',
    items: statusFilterItems
  },
  {
    id: 'category',
    label: '유형별',
    items: categoryFilterItems
  }
];

// 예제용 테이블 데이터 (동적 유형 시스템 데모용)
// 실제 운영에서는 useDynamicTypes 훅을 통해 동적으로 생성되는 데이터를 사용합니다.
export const tableData = [
  // 예제 목적으로만 사용되는 임시 데이터입니다.
  // 실제 운영에서는 다음과 같이 작동합니다:
  // 1. 단계설정에서 정의한 동적 유형을 useDynamicTypes 훅으로 로드
  // 2. 로드된 유형 정보를 바탕으로 회원 데이터를 동적 생성
  // 3. 생성된 데이터를 테이블 컴포넌트에서 표시
  
  // 예제를 위한 기본 구조 샘플 (1개 항목만 유지)
  {
    id: 1,
    index: 1,
    userId: 'example_user\nexample_nickname',
    type: { label: '예제유형', color: 'primary' },
    parentTypes: [],
    parentType: [],
    description: '동적 유형 시스템 예제를 위한 샘플 데이터입니다.\n실제로는 단계설정에서 정의한 유형을 사용합니다.',
    child1: 'EX1',
    child2: 'EX2',
    child3: 'EX3',
    child4: 'EX4',
    child5: 'EX5',
    child6: 'EX6'
  }
]; 