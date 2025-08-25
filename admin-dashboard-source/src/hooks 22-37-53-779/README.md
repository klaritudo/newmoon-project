# 테이블 관련 재사용 가능한 훅

이 디렉토리는 테이블 관련 기능을 모듈화하고 재사용 가능하게 구현한 훅들을 포함하고 있습니다.

## 주요 훅 설명

### 테이블 관련 기본 훅 (`/hooks/table/`)

- **useDataTable**: 기본 테이블 데이터, 페이지네이션, 그리드 API 관리
  - 데이터 로드, 필터링, 정렬, 페이지네이션 등의 기본 기능을 제공합니다.
  - 모든 다른 테이블 관련 훅의 기반이 됩니다.

- **useHierarchyTable**: 계층적 데이터 구조 처리
  - useDataTable을 확장하여 계층 구조 데이터를 처리합니다.
  - 부모-자식 관계, 확장/축소 기능, 계층별 들여쓰기 등을 지원합니다.

- **usePageNumberMode**: 페이지 번호 표시 방식 관리
  - 연속 페이지 번호 또는 페이지별 번호 표시 모드를 관리합니다.
  - 사용자가 선호하는 페이지 번호 표시 방식을 선택할 수 있게 합니다.

- **usePinnedColumns**: 컬럼 고정 기능 관리
  - 컬럼을 좌/우측에 고정하는 기능을 관리합니다.
  - 사용자가 자주 확인하는 컬럼을 항상 볼 수 있도록 합니다.

### 회원 테이블 특화 훅 (`/hooks/member/`)

- **useMemberTableReusable**: 회원 테이블에 특화된 관리 훅
  - 회원 데이터 로드, 필터링, 계층 구조 처리 등을 통합적으로 관리합니다.
  - useHierarchyTable을 기반으로 회원 관리 특화 기능을 추가합니다.

## 사용 예시

```jsx
// 기본 테이블 훅 사용 예시
import { useDataTable } from '@/hooks/table';

const MyComponent = () => {
  const {
    loading,
    rowData,
    gridApi,
    refreshData,
    onGridReady
  } = useDataTable({
    fetchData: myFetchDataFunction,
    defaultPageSize: 25
  });
  
  // ...
};

// 계층형 테이블 훅 사용 예시
import { useHierarchyTable } from '@/hooks/table';

const MyHierarchyComponent = () => {
  const {
    loading,
    rowData,
    indentMode,
    toggleIndentMode,
    toggleMemberExpansion,
    isMemberExpanded
  } = useHierarchyTable({
    dataTableOptions: {
      fetchData: myFetchDataFunction
    },
    typeHierarchy: MY_TYPE_HIERARCHY,
    typeLevels: MY_TYPE_LEVELS
  });
  
  // ...
};

// 회원 테이블 특화 훅 사용 예시
import { useMemberTableReusable } from '@/hooks/member';

const MemberTableComponent = () => {
  const {
    loading,
    rowData,
    indentMode,
    toggleIndentMode,
    formatNumber,
    formatDate,
    // ... 기타 함수들
  } = useMemberTableReusable();
  
  // ...
};
```

## 디렉토리 구조

```
hooks/
├── index.js                # 모든 훅 내보내기
├── table/                  # 테이블 관련 기본 훅
│   ├── index.js            # 테이블 훅 내보내기
│   ├── useDataTable.jsx    # 기본 테이블 데이터 관리
│   ├── useHierarchyTable.jsx # 계층구조 관리
│   ├── usePageNumberMode.jsx # 페이지 번호 모드 관리
│   └── usePinnedColumns.jsx # 컬럼 고정 관리
└── member/                 # 회원 관련 특화 훅
    ├── index.js            # 회원 훅 내보내기
    ├── useMemberTableReusable.jsx # 회원 테이블 관리
    └── utils/              # 유틸리티 함수
        └── columnConfig.jsx # 컬럼 설정 유틸리티
```

## 훅 간의 관계

1. `useDataTable`은 모든 테이블 관련 훅의 기반이 됩니다.
2. `useHierarchyTable`은 `useDataTable`을 확장하여 계층 구조를 지원합니다.
3. `useMemberTableReusable`은 `useHierarchyTable`을 사용하여 회원 테이블 특화 기능을 제공합니다.
4. `usePageNumberMode`와 `usePinnedColumns`는 독립적으로 사용될 수 있지만, 다른 훅과 함께 사용될 때 더 유용합니다. 