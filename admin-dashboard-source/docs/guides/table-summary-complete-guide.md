# 테이블 전체합계 기능 완벽 가이드

## 📌 개요

BaseTable 컴포넌트를 사용하는 모든 페이지에 전체합계 행을 추가하는 종합 가이드입니다.
이 문서는 합계 행 구현부터 하단 고정, 자동 컬럼 병합까지 모든 기능을 다룹니다.

### 주요 기능
- ✅ 자동 합계 계산 (sum, avg, count, min, max, custom)
- ✅ 전체/현재 페이지 데이터 토글
- ✅ 다양한 포맷 지원 (currency, number, percent)
- ✅ 커스텀 필터링 및 조건부 계산
- ✅ 자동 컬럼 병합 (좁은 컬럼 자동 처리)
- ✅ 하단 고정 옵션 (스크롤 시에도 합계 표시)
- ✅ 그룹 컬럼 지원

## 🚀 빠른 시작

### 최소 구현 (3단계)

```javascript
// 1. State 추가
const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);

// 2. summaryConfig 생성
const summaryConfig = useMemo(() => ({
  enabled: true,
  position: 'bottom',
  scope: {
    type: showCurrentPageOnly ? 'page' : 'all'
  },
  columns: {
    amount: { type: 'sum', format: 'currency' },
    quantity: { type: 'sum', format: 'number' }
  },
  ui: {
    label: '전체합계',
    toggleable: true,
    toggleLabel: '현재 페이지만'
  }
}), [showCurrentPageOnly]);

// 3. BaseTable에 전달
<BaseTable
  columns={columns}
  data={data}
  summary={summaryConfig}
/>
```

## 📖 상세 구현 가이드

### 1. 기본 설정 구조

```javascript
const summaryConfig = {
  enabled: true,              // 합계 기능 활성화
  position: 'bottom',         // 위치: 'top', 'bottom', 'both'
  
  scope: {
    type: 'all',              // 범위: 'all', 'page', 'filtered'
    customFilter: (row) => {  // 조건부 필터 (선택적)
      return row.status === 'active';
    }
  },
  
  columns: {
    // 각 컬럼별 계산 설정
    columnId: {
      type: 'sum',            // 계산 타입
      format: 'currency',     // 표시 포맷
      condition: (row) => {   // 조건부 계산 (선택적)
        return row.amount > 0;
      }
    }
  },
  
  ui: {
    label: '전체합계',        // 합계 행 레이블
    toggleable: true,         // 토글 기능 활성화
    toggleLabel: '현재 페이지만',  // 토글 레이블
    styling: {                // 커스텀 스타일 (선택적)
      backgroundColor: '#f5f5f5',
      fontWeight: 600
    }
  }
};
```

### 2. 계산 타입 (type)

| 타입 | 설명 | 예시 |
|-----|------|------|
| `sum` | 합계 | 총 매출, 총 수량 |
| `avg` | 평균 | 평균 점수, 평균 금액 |
| `count` | 개수 | 총 건수, 항목 수 |
| `min` | 최소값 | 최저 가격 |
| `max` | 최대값 | 최고 가격 |
| `custom` | 커스텀 계산 | 복잡한 계산식 |

### 3. 표시 포맷 (format)

| 포맷 | 설명 | 출력 예시 |
|-----|------|-----------|
| `currency` | 통화 | 1,234,567원 |
| `number` | 숫자 | 1,234,567 |
| `percent` | 퍼센트 | 12.34% |

### 4. 컬럼별 설정 예시

```javascript
columns: {
  // 기본 합계 (통화)
  totalAmount: { 
    type: 'sum', 
    format: 'currency' 
  },
  
  // suffix 제거 (원 표시 안함)
  balance: { 
    type: 'sum', 
    format: 'currency',
    suffix: ''  // 기본 '원' 제거
  },
  
  // prefix 추가
  dollarAmount: {
    type: 'sum',
    format: 'currency',
    prefix: '$',
    suffix: ''
  },
  
  // 소수점 정밀도
  averageScore: { 
    type: 'avg', 
    format: 'percent',
    precision: 2  // 소수점 2자리
  },
  
  // 조건부 계산
  activeUserCount: {
    type: 'count',
    format: 'number',
    condition: (row) => row.status === 'active'
  },
  
  // 커스텀 계산
  taxAmount: {
    type: 'custom',
    customCalculator: (values, rows) => {
      const sum = values.reduce((acc, val) => acc + val, 0);
      return sum * 0.1;  // 10% 세금
    },
    format: 'currency'
  }
}
```

## 🎯 고급 기능

### 1. 커스텀 필터링

특정 조건의 데이터만 합계 계산에 포함:

```javascript
scope: {
  type: showCurrentPageOnly ? 'page' : 'all',
  customFilter: (row) => {
    // 예시 1: 특정 레벨 제외
    const level = row.agent_level || 0;
    return level !== 1 && level !== 2;
    
    // 예시 2: 여러 조건 조합
    return row.status === 'active' && 
           row.amount > 0 && 
           row.date >= '2024-01-01';
    
    // 예시 3: 특정 카테고리만
    return ['DEPOSIT', 'WITHDRAWAL'].includes(row.type);
  }
}
```

### 2. 하단 고정 기능 (Fixed Footer)

스크롤 시에도 합계 행을 화면 하단에 고정:

```javascript
<BaseTable
  columns={columns}
  data={data}
  summary={summaryConfig}
  fixedFooter={true}      // 하단 고정 활성화
  fixedHeader={true}       // 상단 헤더도 고정 (선택적)
  maxHeight={'700px'}      // 테이블 최대 높이
/>
```

#### 하단 고정 스타일
```css
/* 자동 적용되는 스타일 */
position: sticky;
bottom: 0;
z-index: 20;
box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
background-color: #f5f5f5;
```

### 3. 자동 컬럼 병합

첫 번째 컬럼이 너무 좁은 경우(150px 미만) 자동으로 다음 컬럼과 병합:

#### 작동 원리
1. 첫 번째 데이터 컬럼부터 너비 확인
2. 150px 미만이면 다음 컬럼과 병합
3. 150px 이상 확보되면 병합 중단

#### 예시
- No.(20px) + 날짜(100px) = 120px < 150px → 2개 컬럼 병합 ✅
- userId(150px) ≥ 150px → 병합 없음 ❌
- No.(80px) + 다음컬럼(100px) = 180px ≥ 150px → 2개 컬럼 병합 ✅

## 💼 실제 구현 예시

### 예시 1: 회원관리 페이지

```javascript
const MembersPage = () => {
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);
  
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
  
  return (
    <BaseTable
      columns={columns}
      data={data}
      summary={summaryConfig}
    />
  );
};
```

### 예시 2: 당일정산 페이지 (하단 고정 포함)

```javascript
const TodaySettlementPage = () => {
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);
  
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all'
    },
    columns: {
      deposit: { type: 'sum', format: 'currency' },
      withdrawal: { type: 'sum', format: 'currency' },
      chargeAmount: { type: 'sum', format: 'currency' },
      exchangeAmount: { type: 'sum', format: 'currency' },
      bettingAmount: { type: 'sum', format: 'currency' },
      winAmount: { type: 'sum', format: 'currency' },
      revenue: { type: 'sum', format: 'currency' },
      rollingTotal: { type: 'sum', format: 'currency' },
      settlementAmount: { type: 'sum', format: 'currency' }
    },
    ui: {
      label: '전체합계',
      toggleable: true,
      toggleLabel: '현재 페이지만'
    }
  }), [showCurrentPageOnly]);
  
  return (
    <BaseTable
      columns={columns}
      data={data}
      summary={summaryConfig}
      fixedHeader={true}      // 헤더 고정
      fixedFooter={true}      // 합계 행 하단 고정
      maxHeight={'700px'}
    />
  );
};
```

### 예시 3: 게임사별 정산 (숫자 포맷 사용)

```javascript
const summaryConfig = useMemo(() => ({
  enabled: true,
  position: 'bottom',
  scope: {
    type: showCurrentPageOnly ? 'page' : 'all'
  },
  columns: {
    memberCount: { type: 'sum', format: 'number' },     // 숫자 포맷
    bettingCount: { type: 'sum', format: 'number' },    // 숫자 포맷
    totalBetting: { type: 'sum', format: 'currency' },
    totalWinning: { type: 'sum', format: 'currency' },
    totalProfit: { type: 'sum', format: 'currency' }
  },
  ui: {
    label: '전체합계',
    toggleable: true,
    toggleLabel: '현재 페이지만'
  }
}), [showCurrentPageOnly]);
```

## ⚙️ 적용 가능한 페이지

현재 프로젝트에서 적용된 페이지들:

1. **회원관리**
   - MembersPage.jsx - 회원관리
   - RollingHistoryPage.jsx - 롤링금전환내역
   - CommissionHistoryPage.jsx - 커미션내역

2. **정산관리**
   - TodaySettlementPage.jsx - 당일정산 (하단 고정 적용)
   - DailySettlementPage.jsx - 일자별 정산
   - ThirdPartySettlementPage.jsx - 게임사별 정산

3. **입출금관리**
   - DepositPage.jsx - 입금신청처리
   - WithdrawalPage.jsx - 출금신청처리
   - TransactionHistoryPage.jsx - 충환내역

4. **머니관리**
   - MoneyHistoryPage.jsx - 머니처리내역

## 🐛 트러블슈팅

### 문제 1: 합계가 0으로 표시됨
**원인**: 
- 데이터 타입이 문자열
- 컬럼 ID 불일치
- customFilter가 모든 데이터 제외

**해결**:
```javascript
// 데이터 확인
console.log('Data type:', typeof data[0].amount);
console.log('Column ID:', columns.map(c => c.id));

// 숫자 변환 확인
rollingAmount: Number(member.rolling_slot_amount || 0) + 
               Number(member.rolling_casino_amount || 0)
```

### 문제 2: "전체합계" 텍스트가 잘림
**원인**: 첫 번째 컬럼 너비 부족

**해결**:
- 자동 컬럼 병합이 작동하는지 확인
- 첫 번째 컬럼 너비를 150px 이상으로 조정

### 문제 3: 하단 고정이 작동하지 않음
**원인**: 
- `fixedFooter={true}` prop 누락
- 컨테이너 높이 미설정
- 브라우저 호환성

**해결**:
```javascript
<BaseTable
  summary={summaryConfig}
  fixedFooter={true}      // 필수
  maxHeight={'700px'}     // 높이 설정 필수
/>
```

### 문제 4: 특정 데이터가 합계에서 제외됨
**원인**: customFilter 또는 condition 설정

**해결**:
```javascript
// customFilter 확인
console.log('Filtered data:', data.filter(row => {
  const level = row.agent_level || 0;
  return level !== 1 && level !== 2;
}));
```

## 📋 체크리스트

구현 전 확인사항:

- [ ] BaseTable 컴포넌트 사용 중인가?
- [ ] 합계를 계산할 컬럼들의 데이터 타입이 숫자인가?
- [ ] 컬럼 ID가 실제 데이터 필드명과 일치하는가?
- [ ] useState와 useMemo를 import 했는가?
- [ ] showCurrentPageOnly state를 추가했는가?
- [ ] summaryConfig를 BaseTable에 전달했는가?

선택적 기능:
- [ ] 특정 조건의 데이터만 계산하려면 customFilter 추가
- [ ] 하단 고정이 필요하면 fixedFooter={true} 추가
- [ ] 숫자만 표시하려면 format: 'number' 사용

## 📁 관련 파일

### 컴포넌트
- `/src/components/baseTemplate/components/table/BaseTable.jsx` - 메인 테이블 컴포넌트
- `/src/components/baseTemplate/components/table/TableSummary.jsx` - 합계 행 렌더링

### 구현 예시
- `/src/pages/settlement/TodaySettlementPage.jsx` - 하단 고정 적용 예시
- `/src/pages/agent-management/MembersPage.jsx` - customFilter 적용 예시
- `/src/pages/settlement/ThirdPartySettlementPage.jsx` - number 포맷 예시

## 🔄 버전 히스토리

- **2025.01.17**: 자동 컬럼 병합 및 하단 고정 기능 추가
- **2024.08.02**: 초기 합계 기능 구현

---

> 💡 **Tip**: 개발자 도구 콘솔에서 `console.log(summaryData)`로 계산 결과를 확인할 수 있습니다.

> ⚠️ **주의**: 대량 데이터(10,000행 이상)에서는 성능을 모니터링하세요.