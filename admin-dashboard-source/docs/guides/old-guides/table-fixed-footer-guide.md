# 테이블 하단 고정 (Fixed Footer) 기능 가이드

## 개요
테이블의 전체합계 행을 화면 하단에 고정하여, 스크롤 시에도 항상 합계를 확인할 수 있는 기능입니다.
CSS `position: sticky`를 활용하여 자연스러운 스크롤 경험을 제공합니다.

## 기능 특징
- ✅ 스크롤해도 합계 행이 화면 하단에 고정
- ✅ 선택적 활성화 (필요한 페이지만 적용)
- ✅ 자동 컬럼 병합과 호환
- ✅ 상단 헤더 고정과 동시 사용 가능

## 사용 방법

### 1. 기본 사용법

```javascript
<BaseTable
  columns={columns}
  data={data}
  summary={summaryConfig}
  fixedFooter={true}  // 하단 고정 활성화
  // 다른 props...
/>
```

### 2. 상단 헤더와 함께 사용

```javascript
<BaseTable
  columns={columns}
  data={data}
  summary={summaryConfig}
  fixedHeader={true}   // 상단 헤더 고정
  fixedFooter={true}   // 하단 합계 고정
  maxHeight={'700px'}  // 테이블 최대 높이
  // 다른 props...
/>
```

## 구현 예시

### TodaySettlementPage (당일정산)
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
      // ... 더 많은 컬럼
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
      fixedHeader={true}
      fixedFooter={true}  // 하단 고정
      maxHeight={'700px'}
      // 다른 props...
    />
  );
};
```

## 스타일링

하단 고정 시 적용되는 기본 스타일:

```css
/* TableSummary 컴포넌트 내부 스타일 */
position: sticky;
bottom: 0;
z-index: 20;
box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
background-color: #f5f5f5;
```

## 동작 원리

### 1. prop 전달 흐름
```
YourPage 
  → fixedFooter={true}
  → BaseTable 
  → TableSummary 
  → 조건부 스타일 적용
```

### 2. 조건부 스타일 적용
```javascript
// TableSummary.jsx
sx={{
  // 기본 스타일
  backgroundColor: theme.palette.grey[100],
  
  // 하단 고정 스타일 (조건부)
  ...(fixedFooter && {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)'
  })
}}
```

## 언제 사용하면 좋은가?

### 적합한 경우
- ✅ 데이터가 많아 스크롤이 필요한 테이블
- ✅ 합계를 자주 참조해야 하는 페이지
- ✅ 정산, 회계 관련 페이지
- ✅ 대시보드의 주요 테이블

### 부적합한 경우
- ❌ 데이터가 적어 스크롤이 없는 테이블
- ❌ 합계가 중요하지 않은 페이지
- ❌ 모바일 뷰에서 공간이 제한적인 경우

## 브라우저 호환성

`position: sticky` 지원 브라우저:
- Chrome 56+
- Firefox 59+
- Safari 13+
- Edge 16+

## 주의사항

1. **컨테이너 높이**: 테이블 컨테이너에 명확한 높이가 설정되어야 합니다.
   ```javascript
   maxHeight={'700px'}  // 또는 적절한 높이
   ```

2. **overflow 설정**: 부모 컨테이너의 overflow가 적절히 설정되어야 합니다.

3. **z-index 충돌**: 다른 고정 요소와 z-index 충돌이 없는지 확인하세요.

4. **성능**: 많은 데이터가 있는 테이블에서는 렌더링 성능을 모니터링하세요.

## 트러블슈팅

### 고정이 작동하지 않는 경우

1. **prop 확인**
   ```javascript
   fixedFooter={true}  // 반드시 true로 설정
   ```

2. **컨테이너 높이 확인**
   ```javascript
   maxHeight={'700px'}  // 명시적 높이 필요
   ```

3. **부모 요소 overflow 확인**
   - 부모 요소에 `overflow: hidden`이 없어야 함
   - `overflow: auto` 또는 `overflow: scroll` 권장

4. **브라우저 개발자 도구로 확인**
   - TableSummary 요소의 computed style 확인
   - `position: sticky`가 적용되었는지 확인

### 스크롤 시 깜빡임

배경색을 명시적으로 설정:
```javascript
ui: {
  styling: {
    backgroundColor: '#ffffff'  // 또는 theme.palette.background.paper
  }
}
```

## 커스터마이징

### 그림자 효과 변경
```javascript
// TableSummary.jsx 수정
boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.15)'  // 더 진한 그림자
```

### z-index 조정
```javascript
// 다른 요소와 충돌 시
zIndex: 30  // 기본값: 20
```

## 관련 파일
- `/src/components/baseTemplate/components/table/BaseTable.jsx`
- `/src/components/baseTemplate/components/table/TableSummary.jsx`
- `/src/pages/settlement/TodaySettlementPage.jsx` (구현 예시)