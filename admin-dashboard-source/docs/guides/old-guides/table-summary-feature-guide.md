# 테이블 전체합계 기능 가이드

## 개요
BaseTable 컴포넌트를 사용하는 모든 페이지에 전체합계 행을 추가하는 기능입니다.
금액, 수량 등 숫자 데이터의 합계를 테이블 하단에 표시하며, 전체 데이터 또는 현재 페이지 데이터만 계산할 수 있습니다.

## 주요 기능
- ✅ 자동 합계 계산 (sum, avg, count, min, max, custom)
- ✅ 전체/현재 페이지 토글
- ✅ 다양한 포맷 지원 (currency, number, percent)
- ✅ 커스텀 필터링 지원
- ✅ 자동 컬럼 병합 (좁은 컬럼 자동 처리)
- ✅ 하단 고정 옵션

## 구현 방법

### 1. 기본 구현

```javascript
// 1. useState 추가
import React, { useState, useMemo } from 'react';

const YourPage = () => {
  // 현재 페이지만 계산할지 여부
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);
  
  // 2. summaryConfig 생성
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom', // 'top', 'bottom', 'both'
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all',
      // 특정 조건의 데이터만 계산 (선택적)
      customFilter: (row) => {
        // 예: 특정 레벨 제외
        return row.level !== 1 && row.level !== 2;
      }
    },
    columns: {
      // 합계를 계산할 컬럼들
      amount: { type: 'sum', format: 'currency' },
      quantity: { type: 'sum', format: 'number' },
      average: { type: 'avg', format: 'currency' },
      count: { type: 'count', format: 'number' },
      // 더 많은 컬럼...
    },
    ui: {
      label: '전체합계',
      toggleable: true,
      toggleLabel: '현재 페이지만'
    }
  }), [showCurrentPageOnly]);
  
  // 3. BaseTable에 전달
  return (
    <BaseTable
      columns={columns}
      data={data}
      summary={summaryConfig}
      // 다른 props...
    />
  );
};
```

### 2. 컬럼 설정 옵션

#### 계산 타입 (type)
- `sum`: 합계
- `avg`: 평균
- `count`: 개수
- `min`: 최소값
- `max`: 최대값
- `custom`: 커스텀 계산 함수

#### 포맷 타입 (format)
- `currency`: 통화 형식 (1,234,567원)
- `number`: 숫자 형식 (1,234,567)
- `percent`: 퍼센트 형식 (12.34%)

#### 예시
```javascript
columns: {
  // 기본 통화 포맷
  totalAmount: { 
    type: 'sum', 
    format: 'currency' 
  },
  
  // suffix 제거 (원 표시 안함)
  balance: { 
    type: 'sum', 
    format: 'currency',
    suffix: '' 
  },
  
  // 숫자 포맷
  userCount: { 
    type: 'count', 
    format: 'number' 
  },
  
  // 평균 계산
  averageScore: { 
    type: 'avg', 
    format: 'percent',
    precision: 2 
  },
  
  // 커스텀 계산
  customValue: {
    type: 'custom',
    customCalculator: (values, rows) => {
      // 커스텀 로직
      return values.reduce((sum, val) => sum + val, 0) * 1.1;
    },
    format: 'currency'
  }
}
```

### 3. 커스텀 필터 사용

특정 조건의 데이터만 합계 계산에 포함하려면:

```javascript
scope: {
  type: showCurrentPageOnly ? 'page' : 'all',
  customFilter: (row) => {
    // 예시 1: 특정 레벨 제외
    const level = row.agent_level || row.level || 0;
    return level !== 1 && level !== 2;
    
    // 예시 2: 특정 상태만 포함
    return row.status === 'active';
    
    // 예시 3: 금액 조건
    return row.amount > 0;
  }
}
```

### 4. 하단 고정 기능

합계 행을 화면 하단에 고정하려면:

```javascript
<BaseTable
  columns={columns}
  data={data}
  summary={summaryConfig}
  fixedFooter={true}  // 하단 고정 활성화
  // 다른 props...
/>
```

## 실제 구현 예시

### 회원관리 페이지 (MembersPage.jsx)
```javascript
const summaryConfig = useMemo(() => ({
  enabled: true,
  position: 'bottom',
  scope: {
    type: showCurrentPageOnly ? 'page' : 'all',
    customFilter: (row) => {
      // 1, 2단계 에이전트 제외
      const agentLevel = row.agent_level_id || row.agent_level || 0;
      return agentLevel !== 1 && agentLevel !== 2;
    }
  },
  columns: {
    balance: { type: 'sum', format: 'currency' },
    gameMoney: { type: 'sum', format: 'currency' },
    deposit: { type: 'sum', format: 'currency' },
    withdrawal: { type: 'sum', format: 'currency' },
    rollingAmount: { type: 'sum', format: 'currency' },
    totalDeposit: { type: 'sum', format: 'currency' },
    totalWithdrawal: { type: 'sum', format: 'currency' },
    bettingAmount: { type: 'sum', format: 'currency' },
    winAmount: { type: 'sum', format: 'currency' },
    profitLoss: { type: 'sum', format: 'currency' }
  },
  ui: {
    label: '전체합계',
    toggleable: true,
    toggleLabel: '현재 페이지만'
  }
}), [showCurrentPageOnly]);
```

### 입출금 페이지 (DepositPage.jsx)
```javascript
const summaryConfig = useMemo(() => ({
  enabled: true,
  position: 'bottom',
  scope: {
    type: showCurrentPageOnly ? 'page' : 'all'
  },
  columns: {
    amount: { type: 'sum', format: 'currency' },
    before_balance: { type: 'sum', format: 'currency' },
    after_balance: { type: 'sum', format: 'currency' }
  },
  ui: {
    label: '전체합계',
    toggleable: true,
    toggleLabel: '현재 페이지만'
  }
}), [showCurrentPageOnly]);
```

## 자동 컬럼 병합

테이블의 첫 번째 컬럼이 너무 좁은 경우(150px 미만), 자동으로 다음 컬럼과 병합되어 "전체합계" 레이블과 체크박스가 잘리지 않도록 합니다.

### 작동 원리
1. 첫 번째 데이터 컬럼부터 너비 확인
2. 150px 미만이면 다음 컬럼과 병합
3. 150px 이상 확보되면 병합 중단

### 예시
- No.(20px) + 날짜(100px) = 120px → 2개 컬럼 병합
- userId(150px) → 병합 없음
- No.(80px) + 다음컬럼(100px) = 180px → 2개 컬럼 병합

## 주의사항

1. **데이터 타입**: 합계 계산할 컬럼의 데이터는 숫자여야 합니다.
2. **문자열 숫자**: 문자열로 저장된 숫자는 자동으로 Number()로 변환됩니다.
3. **null/undefined**: null, undefined, NaN 값은 자동으로 필터링됩니다.
4. **커스텀 렌더링**: 컬럼에 커스텀 렌더링이 있어도 원본 데이터 값을 사용합니다.

## 트러블슈팅

### 합계가 0으로 표시되는 경우
1. 데이터 타입 확인 (숫자여야 함)
2. 컬럼 ID가 정확한지 확인
3. customFilter가 모든 데이터를 제외하고 있는지 확인

### 텍스트가 잘리는 경우
- 자동 컬럼 병합이 작동하는지 확인
- 첫 번째 컬럼 너비 조정 고려

### 하단 고정이 안 되는 경우
1. `fixedFooter={true}` prop 확인
2. 테이블 컨테이너의 높이가 설정되어 있는지 확인
3. 브라우저가 `position: sticky`를 지원하는지 확인

## 관련 파일
- `/src/components/baseTemplate/components/table/BaseTable.jsx`
- `/src/components/baseTemplate/components/table/TableSummary.jsx`
- 각 페이지 컴포넌트 파일들