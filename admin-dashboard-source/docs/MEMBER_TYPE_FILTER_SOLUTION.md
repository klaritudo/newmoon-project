# 회원 유형 필터 문제 해결 가이드

## 문제 상황
회원 관리 페이지에서 회원 유형(본사/부본사/총판/매장) 필터가 작동하지 않는 문제가 발생했습니다.

### 증상
1. 본사 필터 선택 시 하위 회원들도 함께 표시됨
2. hq00003이 본사 필터에서 표시되지 않음
3. 하위 레벨(부본사/총판/매장) 필터 선택 시 아무것도 표시되지 않음

## 문제 원인

### 1. 필터링 로직은 정상 작동
```javascript
// filterCallback 함수에서 필터링은 올바르게 수행됨
const filtered = result.filter(item => {
  return Number(item.agent_level_id) === levelId;
});
// 예: 본사(level 1) 필터 시 3명 정확히 필터링됨
```

### 2. 계층형 데이터 구조가 문제
- `hierarchicalData`는 계층 구조를 가진 트리 형태
- 하위 레벨 회원들이 상위 회원의 `children` 속성에 포함됨
- 필터링 시 최상위 노드만 체크하여 하위 레벨 회원이 표시되지 않음

```javascript
// 예시: hierarchicalData 구조
[
  {
    id: 1,
    username: "super00001",
    agent_level_id: 1,
    children: [
      {
        id: 2,
        username: "hq00003", 
        agent_level_id: 2,
        children: [...]
      }
    ]
  }
]
```

## 해결 방법

### 핵심 수정 사항
필터가 적용될 때는 계층 구조를 무시하고 평면 데이터를 사용하도록 변경:

```javascript
const filteredHierarchicalData = useMemo(() => {
  const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
  const hasSearchText = searchText && searchText.trim() !== '';
  
  // 검색어가 있는 경우: 평면 데이터로 표시
  if (hasSearchText) {
    if (!data || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    return data.filter(item => filteredIds.includes(item.id));
  }
  
  // 필터가 없는 경우: 계층 구조 유지
  if (!hasActiveFilters) {
    const dataToUse = hierarchicalData?.length > 0 ? hierarchicalData : data;
    return dataToUse;
  }
  
  // 필터가 있는 경우: 평면 데이터로 필터링 (계층 구조 무시)
  if (!data || !filteredIds || filteredIds.length === 0) {
    return [];
  }
  
  // 필터가 적용된 경우 평면 데이터 반환
  const filtered = data.filter(item => filteredIds.includes(item.id));
  
  return filtered;
}, [hierarchicalData, filteredIds, safeActiveFilters, searchText, data]);
```

### 변경 전후 비교
- **변경 전**: 필터 적용 시에도 `hierarchicalData` 사용 → 하위 레벨 회원 미표시
- **변경 후**: 필터 적용 시 평면 `data` 사용 → 모든 필터링된 회원 표시

## 다른 페이지 적용 방법

### 1. 동일한 컴포넌트 사용 시
`TableFilter` 컴포넌트를 사용하는 다른 페이지들도 동일한 문제가 발생할 수 있습니다.

### 2. 확인 사항
- 데이터가 계층형 구조인지 확인
- `filteredHierarchicalData` 또는 유사한 로직 사용 여부 확인
- 필터 적용 시 평면 데이터 사용 필요

### 3. 재사용 가능한 해결책
```javascript
// 유틸리티 함수로 분리 가능
const getFilteredData = (data, hierarchicalData, filteredIds, hasFilters, hasSearch) => {
  // 검색이나 필터가 있으면 평면 데이터 사용
  if (hasSearch || hasFilters) {
    return data.filter(item => filteredIds.includes(item.id));
  }
  
  // 필터가 없으면 계층 구조 유지
  return hierarchicalData?.length > 0 ? hierarchicalData : data;
};
```

## 관련 컴포넌트
- `/src/components/baseTemplate/BaseTemplate.jsx` - 기본 테이블 템플릿
- `/src/components/baseTemplate/TableFilter.jsx` - 필터 컴포넌트
- `/src/hooks/useTableData.js` - 필터링 로직 훅
- `/src/hooks/useTableFilterAndPagination.js` - 필터와 페이지네이션 통합 훅

## 테스트 체크리스트
- [ ] 본사 필터: 본사 회원만 표시
- [ ] 부본사 필터: 부본사 회원만 표시
- [ ] 총판 필터: 총판 회원만 표시
- [ ] 매장 필터: 매장 회원만 표시
- [ ] 필터 해제: 계층 구조로 표시
- [ ] 검색 + 필터: 평면 구조로 표시

## 주의사항
1. 필터 적용 시 계층 구조가 사라지므로 부모-자식 관계가 표시되지 않음
2. 이는 의도된 동작으로, 필터링된 결과를 명확히 보여주기 위함
3. 필터를 해제하면 다시 계층 구조로 표시됨