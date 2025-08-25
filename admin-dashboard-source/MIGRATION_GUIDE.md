# 날짜 처리 시스템 마이그레이션 가이드

## 개요

기존의 단순한 날짜 처리 시스템을 향상된 날짜 처리 시스템으로 마이그레이션하는 가이드입니다.

## 주요 개선사항

### 1. 향상된 날짜 유틸리티 (`enhancedDateUtils.js`)
- **타임존 지원**: 정확한 한국 시간 처리
- **확장된 프리셋**: 분기별, 연도별, 최근 N일 등
- **날짜 검증**: 범위 검증, 최대 기간 제한
- **날짜 비교**: 체계적인 날짜 비교 유틸리티
- **국제화 지원**: dayjs 기반 다국어 지원

### 2. 재사용 가능한 컴포넌트 (`EnhancedDateRangeFilter.jsx`)
- **통합 UI**: 프리셋과 커스텀 선택을 하나의 컴포넌트에
- **비교 기능**: 두 기간을 비교할 수 있는 기능
- **유연한 설정**: 프리셋 커스터마이징, 제한 설정
- **접근성**: WCAG 준수, 키보드 네비게이션

### 3. 상태 관리 (`useDateFilter.js`, `DateFilterContext.jsx`)
- **로컬 상태**: 개별 컴포넌트용 훅
- **전역 상태**: Context API 기반 전역 상태
- **영속성**: 로컬 스토리지 자동 저장/복원
- **검증**: 실시간 검증 및 에러 처리

## 마이그레이션 단계

### 단계 1: 의존성 추가

```bash
# dayjs와 플러그인들 설치
npm install dayjs

# 이미 설치되어 있다면 패스
# @mui/x-date-pickers @mui/x-date-pickers-pro
```

### 단계 2: 기존 코드 백업

```bash
# 기존 파일들 백업
cp src/utils/dateUtils.js src/utils/dateUtils.js.backup
cp src/components/ui/DateFilterPopover.jsx src/components/ui/DateFilterPopover.jsx.backup
cp src/pages/Dashboard.jsx src/pages/Dashboard.jsx.backup
```

### 단계 3: 새 파일들 추가

새로 생성된 파일들을 프로젝트에 추가:
- `src/utils/enhancedDateUtils.js`
- `src/components/ui/EnhancedDateRangeFilter.jsx`
- `src/hooks/useDateFilter.js`
- `src/contexts/DateFilterContext.jsx`

### 단계 4: 단계적 마이그레이션

#### 4.1 유틸리티 함수 마이그레이션

**Before:**
```javascript
import { formatDateKorean, getDateRangeByPeriod } from '../utils/dateUtils';

const formattedDate = formatDateKorean(date);
const range = getDateRangeByPeriod('monthly');
```

**After:**
```javascript
import { formatDate, getDateRangeByPreset, DATE_FORMATS, DATE_RANGE_PRESETS } from '../utils/enhancedDateUtils';

const formattedDate = formatDate(date, DATE_FORMATS.ISO_DATETIME);
const range = getDateRangeByPreset(DATE_RANGE_PRESETS.THIS_MONTH);
```

#### 4.2 컴포넌트 마이그레이션

**Before (Dashboard.jsx):**
```javascript
<ButtonGroup size="small" variant="outlined">
  <Button 
    onClick={() => handlePeriodChange('daily')}
    variant={period === 'daily' ? 'contained' : 'outlined'}
  >
    일별
  </Button>
  <Button 
    onClick={() => handlePeriodChange('weekly')}
    variant={period === 'weekly' ? 'contained' : 'outlined'}
  >
    주별
  </Button>
  <Button 
    onClick={() => handlePeriodChange('monthly')}
    variant={period === 'monthly' ? 'contained' : 'outlined'}
  >
    월별
  </Button>
</ButtonGroup>
```

**After:**
```javascript
import { useDateFilter } from '../hooks/useDateFilter';
import EnhancedDateRangeFilter from '../components/ui/EnhancedDateRangeFilter';
import { DATE_RANGE_PRESETS } from '../utils/enhancedDateUtils';

const Dashboard = () => {
  const {
    dateRange,
    applyPreset,
    setCustomRange,
    apiFormat
  } = useDateFilter({
    initialPreset: DATE_RANGE_PRESETS.THIS_MONTH,
    onDateChange: (range) => {
      // API 호출
      fetchDashboardData(range);
    }
  });

  return (
    <>
      <EnhancedDateRangeFilter
        value={dateRange}
        onChange={(newRange) => {
          if (newRange.preset) {
            applyPreset(newRange.preset);
          } else {
            setCustomRange(newRange.startDate, newRange.endDate);
          }
        }}
        enableQuickFilters
        presetGroups={['recent', 'period']}
      />
      {/* 나머지 컴포넌트들... */}
    </>
  );
};
```

#### 4.3 Redux 스토어 마이그레이션 (선택사항)

기존 Redux 상태 관리를 Context API로 마이그레이션:

**Before:**
```javascript
// dashboardSlice.js
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    period: 'monthly'
  },
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    }
  }
});
```

**After:**
```javascript
// App.jsx 또는 최상위 컴포넌트에서
import { DateFilterProvider } from './contexts/DateFilterContext';

function App() {
  return (
    <DateFilterProvider
      initialPreset={DATE_RANGE_PRESETS.THIS_MONTH}
      enableComparison={false}
      onDateChange={handleGlobalDateChange}
    >
      {/* 앱 컴포넌트들... */}
    </DateFilterProvider>
  );
}
```

### 단계 5: API 호출 업데이트

**Before:**
```javascript
const fetchData = async (period) => {
  const params = { period };
  return await api.get('/dashboard/stats', { params });
};
```

**After:**
```javascript
const fetchData = async (dateRange) => {
  const params = apiFormat || {
    startDate: formatDate(dateRange.startDate, DATE_FORMATS.API_FORMAT),
    endDate: formatDate(dateRange.endDate, DATE_FORMATS.API_FORMAT)
  };
  return await api.get('/dashboard/stats', { params });
};
```

### 단계 6: 테스트 업데이트

기존 테스트들을 새로운 API에 맞게 업데이트:

```javascript
// 기존 테스트
test('should format date correctly', () => {
  const result = formatDateKorean('2024-01-15');
  expect(result).toBe('2024-01-15 00:00:00');
});

// 새로운 테스트
test('should format date correctly', () => {
  const result = formatDate('2024-01-15', DATE_FORMATS.ISO_DATETIME);
  expect(result).toBe('2024-01-15 00:00:00');
});
```

## 점진적 마이그레이션 전략

### 옵션 1: 전체 마이그레이션 (권장)
모든 날짜 관련 코드를 한 번에 새로운 시스템으로 마이그레이션

**장점:**
- 일관성 있는 사용자 경험
- 중복 코드 제거
- 향상된 기능 즉시 활용

**단점:**
- 초기 작업량 많음
- 테스트 범위 광범위

### 옵션 2: 점진적 마이그레이션
페이지별, 컴포넌트별로 단계적 마이그레이션

**장점:**
- 위험도 낮음
- 단계별 검증 가능
- 기존 기능 영향 최소화

**단점:**
- 일시적 코드 중복
- 사용자 경험 불일치 가능

#### 점진적 마이그레이션 순서:
1. **유틸리티 함수**: `enhancedDateUtils.js` 도입
2. **신규 페이지**: 새로운 시스템으로 개발
3. **주요 페이지**: Dashboard 등 핵심 페이지 마이그레이션
4. **세부 페이지**: 나머지 페이지들 순차 마이그레이션
5. **정리**: 기존 코드 제거

## 호환성 어댑터

기존 코드와의 호환성을 위한 어댑터 생성:

```javascript
// src/utils/dateUtilsAdapter.js
import { 
  formatDate, 
  getDateRangeByPreset, 
  DATE_FORMATS, 
  DATE_RANGE_PRESETS 
} from './enhancedDateUtils';

// 기존 API 호환 함수들
export const formatDateKorean = (date, includeTime = true) => {
  return formatDate(
    date, 
    includeTime ? DATE_FORMATS.ISO_DATETIME : DATE_FORMATS.ISO_DATE
  );
};

export const getDateRangeByPeriod = (period) => {
  const presetMap = {
    'daily': DATE_RANGE_PRESETS.TODAY,
    'weekly': DATE_RANGE_PRESETS.THIS_WEEK,
    'monthly': DATE_RANGE_PRESETS.THIS_MONTH
  };
  
  const preset = presetMap[period];
  if (!preset) return null;
  
  const range = getDateRangeByPreset(preset);
  return {
    startDate: range.startDate.format(DATE_FORMATS.ISO_DATE),
    endDate: range.endDate.format(DATE_FORMATS.ISO_DATE)
  };
};
```

## 성능 고려사항

### 1. 번들 크기 최적화
```javascript
// dayjs 트리 셰이킹을 위한 플러그인별 import
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 필요한 플러그인만 추가
dayjs.extend(utc);
dayjs.extend(timezone);
```

### 2. 메모이제이션
```javascript
import { useMemo } from 'react';

const YourComponent = () => {
  const presetOptions = useMemo(() => getPresetOptions(), []);
  
  // ...
};
```

### 3. 지연 로딩
```javascript
// 큰 컴포넌트들은 지연 로딩
const EnhancedDateRangeFilter = lazy(() => 
  import('../components/ui/EnhancedDateRangeFilter')
);
```

## 테스트 전략

### 1. 단위 테스트
```javascript
// enhancedDateUtils.test.js
describe('enhancedDateUtils', () => {
  test('should create date with timezone', () => {
    const date = createDate('2024-01-15', 'Asia/Seoul');
    expect(date.tz()).toBe('Asia/Seoul');
  });

  test('should validate date range correctly', () => {
    const start = dayjs('2024-01-01');
    const end = dayjs('2024-01-31');
    const result = validateDateRange(start, end);
    expect(result.isValid).toBe(true);
  });
});
```

### 2. 통합 테스트
```javascript
// EnhancedDateRangeFilter.test.jsx
describe('EnhancedDateRangeFilter', () => {
  test('should apply preset correctly', async () => {
    const mockOnChange = jest.fn();
    render(
      <EnhancedDateRangeFilter onChange={mockOnChange} />
    );
    
    fireEvent.click(screen.getByText('오늘'));
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: DATE_RANGE_PRESETS.TODAY
      })
    );
  });
});
```

### 3. E2E 테스트
```javascript
// cypress/integration/date-filter.spec.js
describe('Date Filter', () => {
  it('should filter dashboard data by date range', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="date-filter-button"]').click();
    cy.get('[data-testid="preset-this-week"]').click();
    cy.get('[data-testid="apply-button"]').click();
    
    // 데이터가 업데이트되었는지 확인
    cy.get('[data-testid="dashboard-stats"]').should('be.visible');
  });
});
```

## 문제 해결

### 1. 타임존 문제
```javascript
// 문제: 날짜가 다른 시간대로 표시됨
// 해결: 명시적 타임존 설정
const date = createDate(dateString, 'Asia/Seoul');
```

### 2. 성능 문제
```javascript
// 문제: 날짜 계산이 느림
// 해결: 계산 결과 캐싱
const memoizedDateRange = useMemo(() => {
  return getDateRangeByPreset(preset);
}, [preset]);
```

### 3. 메모리 누수
```javascript
// 문제: 컴포넌트 언마운트 후에도 타이머 실행
// 해결: useEffect cleanup
useEffect(() => {
  const timer = setInterval(updateTime, 1000);
  
  return () => {
    clearInterval(timer);
  };
}, []);
```

## 마이그레이션 체크리스트

- [ ] 의존성 패키지 설치
- [ ] 기존 코드 백업
- [ ] 새 파일들 추가
- [ ] 유틸리티 함수 마이그레이션
- [ ] 컴포넌트 마이그레이션
- [ ] API 호출 업데이트
- [ ] 테스트 코드 업데이트
- [ ] 성능 최적화 적용
- [ ] E2E 테스트 통과 확인
- [ ] 기존 코드 제거
- [ ] 문서 업데이트

## 롤백 계획

마이그레이션 중 문제가 발생할 경우:

1. **즉시 롤백**: 백업된 파일로 복원
2. **Git 리버트**: 특정 커밋으로 되돌리기
3. **부분 롤백**: 문제 있는 컴포넌트만 기존 버전으로 복원
4. **피처 플래그**: 환경 변수로 새 기능 비활성화

```javascript
// 피처 플래그 예시
const USE_ENHANCED_DATE_FILTER = process.env.REACT_APP_USE_ENHANCED_DATE_FILTER === 'true';

return USE_ENHANCED_DATE_FILTER ? 
  <EnhancedDateRangeFilter {...props} /> : 
  <DateFilterPopover {...props} />;
```

## 결론

이 마이그레이션을 통해 다음과 같은 이점을 얻을 수 있습니다:

1. **향상된 사용자 경험**: 직관적이고 강력한 날짜 선택 인터페이스
2. **개발 효율성**: 재사용 가능한 컴포넌트와 유틸리티
3. **유지보수성**: 체계적인 상태 관리와 명확한 API
4. **확장성**: 새로운 기능을 쉽게 추가할 수 있는 구조
5. **신뢰성**: 철저한 검증과 에러 처리

단계적으로 진행하여 안전하고 효과적인 마이그레이션을 완성하시기 바랍니다.