# 테이블 합계(Summary) 기능 적용 가이드

이 문서는 BaseTable 컴포넌트의 합계(Summary) 기능을 다른 페이지에 적용하는 방법을 설명합니다.

## 목차
1. [개요](#개요)
2. [기본 사용법](#기본-사용법)
3. [고급 설정](#고급-설정)
4. [계산 타입](#계산-타입)
5. [조건부 필터링](#조건부-필터링)
6. [UI 커스터마이징](#ui-커스터마이징)
7. [실제 적용 예제](#실제-적용-예제)
8. [주의사항](#주의사항)
9. [문제 해결](#문제-해결)

## 개요

BaseTable의 Summary 기능은 테이블 데이터의 합계, 평균, 개수 등을 자동으로 계산하여 표시하는 기능입니다.

### 주요 특징
- ✅ 다양한 계산 타입 지원 (sum, avg, count, min, max, custom)
- ✅ 조건부 필터링 지원
- ✅ 현재 페이지/전체 데이터 토글 기능
- ✅ 그룹 컬럼 지원
- ✅ 고정 컬럼과 호환
- ✅ 커스터마이징 가능한 UI

## 기본 사용법

### 1단계: Summary 설정 객체 생성

```javascript
const summaryConfig = {
  enabled: true,
  position: 'bottom', // 'top', 'bottom', 'both'
  scope: {
    type: 'all', // 'page', 'filtered', 'all'
  },
  columns: {
    // 컬럼 ID별 계산 설정
    balance: {
      type: 'sum',
      format: 'currency',
      suffix: '원'
    },
    userCount: {
      type: 'count'
    }
  },
  ui: {
    label: '전체합계',
    toggleable: true,
    toggleLabel: '현재 페이지만',
    styling: {
      backgroundColor: theme.palette.grey[100],
      fontWeight: 600,
      borderColor: theme.palette.primary.main
    }
  }
};
```

### 2단계: BaseTable에 summary prop 전달

```javascript
<BaseTable
  columns={columns}
  data={data}
  summary={summaryConfig}
  onSummaryToggle={(currentPageOnly) => {
    console.log('현재 페이지만 표시:', currentPageOnly);
  }}
  // ... 기타 props
/>
```

## 고급 설정

### 그룹 컬럼 합계 계산

그룹 컬럼의 자식 컬럼들도 개별적으로 합계 계산이 가능합니다:

```javascript
const summaryConfig = {
  enabled: true,
  columns: {
    // 그룹 컬럼의 자식들
    'deposit_withdrawal.deposit': {
      type: 'sum',
      format: 'currency'
    },
    'deposit_withdrawal.withdrawal': {
      type: 'sum',
      format: 'currency'
    },
    'deposit_withdrawal.charge': {
      type: 'sum',
      format: 'currency'
    }
  }
};
```

### 중첩된 객체 필드 접근

점(.) 표기법을 사용하여 중첩된 객체의 값에 접근할 수 있습니다:

```javascript
const summaryConfig = {
  columns: {
    'user.balance': { // user 객체의 balance 필드
      type: 'sum',
      format: 'currency'
    },
    'stats.totalGames': { // stats 객체의 totalGames 필드
      type: 'sum'
    }
  }
};
```

## 계산 타입

### 1. sum (합계)
```javascript
{
  type: 'sum',
  format: 'currency', // 선택사항
  suffix: '원' // 선택사항
}
```

### 2. avg (평균)
```javascript
{
  type: 'avg',
  format: 'number',
  precision: 2 // 소수점 자리수
}
```

### 3. count (개수)
```javascript
{
  type: 'count'
}
```

### 4. min (최솟값)
```javascript
{
  type: 'min',
  format: 'number'
}
```

### 5. max (최댓값)
```javascript
{
  type: 'max',
  format: 'number'
}
```

### 6. custom (사용자 정의)
```javascript
{
  type: 'custom',
  customCalculator: (values, rows) => {
    // values: 해당 컬럼의 값 배열
    // rows: 전체 행 데이터
    return values.reduce((sum, val) => sum + val, 0) / rows.length;
  },
  format: 'percent'
}
```

## 조건부 필터링

특정 조건을 만족하는 행만 계산에 포함시킬 수 있습니다:

```javascript
const summaryConfig = {
  columns: {
    balance: {
      type: 'sum',
      format: 'currency',
      // agent_level_id가 1 또는 2인 행은 제외
      condition: (row) => row.agent_level_id !== 1 && row.agent_level_id !== 2
    },
    activeUserCount: {
      type: 'count',
      // 활성 사용자만 카운트
      condition: (row) => row.status === 'active'
    }
  }
};
```

## UI 커스터마이징

### 라벨 및 토글 설정

```javascript
ui: {
  label: '합계', // 합계 행에 표시될 라벨
  toggleable: true, // 토글 기능 활성화
  toggleLabel: '현재 페이지만', // 토글 체크박스 라벨
  styling: {
    backgroundColor: '#f5f5f5',
    fontWeight: 700,
    borderColor: '#1976d2',
    fontSize: '14px'
  }
}
```

### 포맷 옵션

```javascript
// 통화 포맷
{
  format: 'currency',
  prefix: '$', // 기본값: ''
  suffix: ' USD' // 기본값: '원'
}

// 퍼센트 포맷
{
  format: 'percent',
  precision: 1 // 소수점 1자리
}

// 숫자 포맷
{
  format: 'number' // 천 단위 구분자 자동 적용
}
```

## 실제 적용 예제

### 예제 1: 회원 관리 페이지

```javascript
// MembersPage.jsx
const summaryConfig = {
  enabled: true,
  position: 'bottom',
  scope: {
    type: 'all'
  },
  columns: {
    balance: {
      type: 'sum',
      format: 'currency',
      condition: (row) => row.agent_level_id !== 1 && row.agent_level_id !== 2
    },
    gameMoney: {
      type: 'sum',
      format: 'currency',
      condition: (row) => row.agent_level_id !== 1 && row.agent_level_id !== 2
    },
    totalMembers: {
      type: 'count',
      condition: (row) => row.agent_level_id !== 1 && row.agent_level_id !== 2
    }
  },
  ui: {
    label: '전체합계',
    toggleable: true,
    toggleLabel: '현재 페이지만'
  }
};

// state 추가
const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);

// BaseTable에 적용
<BaseTable
  columns={columns}
  data={members}
  summary={summaryConfig}
  onSummaryToggle={(currentPageOnly) => setShowCurrentPageOnly(currentPageOnly)}
  // ... 기타 props
/>
```

### 예제 2: 입출금 내역 페이지

```javascript
// DepositWithdrawalPage.jsx
const summaryConfig = {
  enabled: true,
  position: 'bottom',
  columns: {
    'deposit_withdrawal.deposit': {
      type: 'sum',
      format: 'currency',
      suffix: '원'
    },
    'deposit_withdrawal.withdrawal': {
      type: 'sum',
      format: 'currency',
      suffix: '원'
    },
    'deposit_withdrawal.charge': {
      type: 'sum',
      format: 'currency',
      suffix: '원'
    },
    'deposit_withdrawal.balance': {
      type: 'custom',
      customCalculator: (values, rows) => {
        const deposits = rows.reduce((sum, row) => sum + (row.deposit_withdrawal?.deposit || 0), 0);
        const withdrawals = rows.reduce((sum, row) => sum + (row.deposit_withdrawal?.withdrawal || 0), 0);
        return deposits - withdrawals;
      },
      format: 'currency',
      suffix: '원'
    }
  },
  ui: {
    label: '합계',
    toggleable: true
  }
};
```

### 예제 3: 게임 통계 페이지

```javascript
// GameStatisticsPage.jsx
const summaryConfig = {
  enabled: true,
  position: 'both', // 상단과 하단 모두 표시
  columns: {
    totalBet: {
      type: 'sum',
      format: 'currency'
    },
    totalWin: {
      type: 'sum',
      format: 'currency'
    },
    totalProfit: {
      type: 'custom',
      customCalculator: (values, rows) => {
        return rows.reduce((sum, row) => sum + (row.totalBet - row.totalWin), 0);
      },
      format: 'currency'
    },
    gameCount: {
      type: 'count'
    },
    avgBet: {
      type: 'avg',
      format: 'currency',
      precision: 0
    },
    winRate: {
      type: 'custom',
      customCalculator: (values, rows) => {
        const wins = rows.filter(row => row.totalWin > 0).length;
        return (wins / rows.length) * 100;
      },
      format: 'percent',
      precision: 1
    }
  },
  ui: {
    label: '통계',
    toggleable: true,
    styling: {
      backgroundColor: theme.palette.info.lighter,
      fontWeight: 700
    }
  }
};
```

## 주의사항

### 1. 성능 고려사항
- 대량의 데이터(1000행 이상)에서는 계산이 느려질 수 있습니다
- 필요한 컬럼만 계산하도록 설정하세요
- custom 계산기는 최적화된 코드로 작성하세요

### 2. 데이터 타입
- 숫자가 아닌 값은 자동으로 필터링됩니다
- null, undefined, NaN 값은 계산에서 제외됩니다
- 문자열로 저장된 숫자는 자동 변환됩니다

### 3. 그룹 컬럼
- 그룹 컬럼의 자식들은 점(.) 표기법으로 접근합니다
- 그룹 헤더 자체는 합계 계산 대상이 아닙니다

### 4. 고정 컬럼
- 합계 행도 고정 컬럼 설정을 따릅니다
- 가로 스크롤 시에도 고정 컬럼은 고정됩니다

## 문제 해결

### 합계가 표시되지 않는 경우
1. `summaryConfig.enabled`가 `true`인지 확인
2. `columns` 객체에 계산할 컬럼이 정의되어 있는지 확인
3. 컬럼 ID가 실제 데이터의 필드명과 일치하는지 확인
4. 데이터가 로드된 후에 렌더링되는지 확인

### 계산 값이 잘못된 경우
1. 데이터 타입이 숫자인지 확인
2. condition 함수가 올바르게 작동하는지 확인
3. 중첩 객체 접근 시 경로가 올바른지 확인

### 스타일이 적용되지 않는 경우
1. theme 객체가 정의되어 있는지 확인
2. MUI 테마 프로바이더가 설정되어 있는지 확인
3. 커스텀 스타일 속성명이 올바른지 확인

### 토글 기능이 작동하지 않는 경우
1. `ui.toggleable`이 `true`인지 확인
2. `onSummaryToggle` 핸들러가 정의되어 있는지 확인
3. state 업데이트가 올바르게 되는지 확인

## 추가 팁

### 1. 재사용 가능한 설정
```javascript
// utils/summaryConfigs.js
export const currencySummaryConfig = (columnIds) => ({
  enabled: true,
  position: 'bottom',
  columns: columnIds.reduce((acc, id) => ({
    ...acc,
    [id]: {
      type: 'sum',
      format: 'currency',
      suffix: '원'
    }
  }), {}),
  ui: {
    label: '합계',
    toggleable: true
  }
});

// 사용
const summaryConfig = currencySummaryConfig(['balance', 'deposit', 'withdrawal']);
```

### 2. 동적 컬럼 설정
```javascript
const summaryConfig = useMemo(() => ({
  enabled: true,
  columns: visibleColumns.reduce((acc, col) => {
    if (col.type === 'currency') {
      acc[col.id] = {
        type: 'sum',
        format: 'currency'
      };
    }
    return acc;
  }, {})
}), [visibleColumns]);
```

### 3. 다국어 지원
```javascript
const summaryConfig = {
  ui: {
    label: t('common.total'), // i18n
    toggleLabel: t('common.currentPageOnly')
  }
};
```

이 가이드를 참고하여 프로젝트의 모든 테이블에 합계 기능을 쉽게 적용할 수 있습니다.