# 팝업 페이지 버튼 기능 및 스타일 수정 보고서

## 개요
개발 환경의 팝업 페이지(`/board/popup`)에서 수정/삭제 버튼이 작동하지 않고, 버튼 스타일이 일관되지 않은 문제를 해결한 내용을 정리한 보고서입니다.

## 문제 상황

### 1. 버튼 클릭 불가 문제
- **증상**: 팝업 페이지의 테이블에서 "수정", "삭제" 버튼을 클릭해도 아무 반응이 없음
- **영향 범위**: 개발 환경의 팝업 관리 페이지 전체
- **비교 대상**: 이벤트 페이지(`/board/events`)의 동일한 버튼들은 정상 작동

### 2. 버튼 스타일 불일치
- **증상**: 수정 버튼이 파란색 배경(contained 스타일)으로 표시됨
- **기대값**: 테두리만 있는 outlined 스타일이어야 함
- **원인**: `variant: 'contained'` 속성이 잘못 설정됨

### 3. Switch 컴포넌트 타입 오류
- **증상**: Console에 PropTypes 경고 메시지 발생
- **내용**: `Invalid prop 'checked' of type 'number' supplied to 'ForwardRef(Switch2)', expected 'boolean'`
- **원인**: 백엔드에서 boolean 값을 0/1로 전송

## 근본 원인 분석

### 1. finalColumns 로직 누락
PopupPage.jsx에서 컬럼 정의를 BaseTable에 전달할 때 중요한 변환 과정이 누락되었습니다:

```javascript
// EventsPage.jsx (정상 작동)
const finalColumns = useMemo(() => {
  const columnsWithActionsMap = new Map(columnsWithActions.map(col => [col.id, col]));
  
  return visibleColumns.map(column => {
    const columnWithAction = columnsWithActionsMap.get(column.id);
    
    if (columnWithAction) {
      const merged = {
        ...column,
        ...columnWithAction,
        id: column.id,
        label: column.label
      };
      return merged;
    }
    
    return column;
  });
}, [visibleColumns, columnsWithActions]);

// PopupPage.jsx (문제 있던 코드)
// finalColumns 로직이 없어서 visibleColumns만 전달됨
<BaseTable
  columns={visibleColumns}  // ❌ onClick 핸들러가 없는 컬럼
  // ...
/>
```

### 2. 컬럼 변환 파이프라인
정상적인 컬럼 변환 과정:
1. `popupColumns` (popupData.js) - 기본 컬럼 정의
2. `columnsWithActions` (PopupPage.jsx) - onClick 핸들러 추가
3. `visibleColumns` (useColumnVisibility) - 표시 여부 필터링
4. `finalColumns` - columnsWithActions와 visibleColumns 병합
5. BaseTable로 전달

문제가 있던 과정:
- 3번에서 5번으로 바로 넘어가면서 onClick 핸들러가 손실됨

## 수정 내용

### 1. finalColumns 로직 추가
```javascript
// PopupPage.jsx (수정 후)
const finalColumns = useMemo(() => {
  const columnsWithActionsMap = new Map(columnsWithActions.map(col => [col.id, col]));
  
  return visibleColumns.map(column => {
    const columnWithAction = columnsWithActionsMap.get(column.id);
    
    if (columnWithAction) {
      const merged = {
        ...column,
        ...columnWithAction,
        id: column.id,
        label: column.label
      };
      return merged;
    }
    
    return column;
  });
}, [visibleColumns, columnsWithActions]);

// BaseTable에 finalColumns 전달
<BaseTable
  columns={finalColumns}  // ✅ onClick 핸들러가 포함된 컬럼
  // ...
/>
```

### 2. Boolean 타입 변환 수정
```javascript
// PopupPage.jsx - Switch 컴포넌트 부분
<Switch
  checked={Boolean(popup.closeOnClick)}  // 0/1을 true/false로 변환
  size="small"
  color="primary"
/>

<Switch
  checked={Boolean(popup.showOnce)}  // 0/1을 true/false로 변환
  size="small"
  color="primary"
/>
```

### 3. 버튼 스타일 통일
```javascript
// PopupPage.jsx - columnsWithActions 정의 부분
buttons: [
  {
    label: '수정',
    color: 'primary',
    variant: 'outlined',  // 'contained'에서 'outlined'로 변경
    onClick: (row) => handleEdit(row)
  },
  {
    label: '삭제',
    color: 'error',
    variant: 'outlined',  // 이미 outlined로 되어 있었음
    onClick: (row) => handleDelete(row)
  }
]
```

### 4. 불필요한 console.log 제거
디버깅을 위해 추가했던 console.log 문들을 주석 처리:
- PopupPage.jsx 내의 여러 console.log 문
- CellRenderer.jsx와 TableBody.jsx의 console.log는 이미 주석 처리되어 있음

## 기술적 세부사항

### 컬럼 변환 과정의 중요성
1. **columnsWithActions**: 버튼의 onClick 핸들러와 타입 정보를 포함
2. **visibleColumns**: 사용자가 선택한 표시할 컬럼만 포함 (onClick 없음)
3. **finalColumns**: 두 배열을 병합하여 표시할 컬럼 + 기능 정보 모두 포함

### BaseTable과 CellRenderer의 동작
- BaseTable은 columns prop을 통해 컬럼 정의를 받음
- CellRenderer는 column.type이 'button'일 때 column.buttons의 onClick을 실행
- onClick이 없으면 버튼은 렌더링되지만 클릭해도 반응 없음

### Material-UI 버튼 스타일
- **outlined**: 투명 배경 + 색상 테두리 (기본 스타일)
- **contained**: 색상 배경 + 흰색 텍스트
- **text**: 배경 없이 텍스트만

## 검증 결과

### 수정 전
- 버튼 클릭: ❌ 반응 없음
- 버튼 스타일: ❌ contained (파란 배경)
- Switch 타입: ❌ PropTypes 경고

### 수정 후
- 버튼 클릭: ✅ 정상 작동 (수정/삭제 다이얼로그 표시)
- 버튼 스타일: ✅ outlined (테두리만)
- Switch 타입: ✅ 경고 없음

## 교훈 및 권장사항

### 1. 컬럼 변환 파이프라인 준수
- visibleColumns 사용 시 반드시 finalColumns 로직을 통해 기능 정보 병합
- EventsPage의 패턴을 다른 페이지에서도 일관되게 사용

### 2. 타입 안정성
- 백엔드에서 boolean을 0/1로 보내는 경우 프론트엔드에서 명시적 변환
- PropTypes 경고는 무시하지 말고 즉시 수정

### 3. 스타일 일관성
- 버튼 variant는 프로젝트 전체에서 일관되게 사용
- 테이블 액션 버튼은 outlined 스타일 권장

### 4. 디버깅 코드 관리
- console.log는 문제 해결 후 제거 또는 주석 처리
- 프로덕션 빌드에 디버깅 코드가 포함되지 않도록 주의

## 관련 파일
- `/src/pages/board/PopupPage.jsx` - 주요 수정 파일
- `/src/pages/board/EventsPage.jsx` - 참고한 정상 작동 파일
- `/src/pages/board/data/popupData.js` - 컬럼 정의 파일
- `/src/components/baseTemplate/components/table/CellRenderer.jsx` - 셀 렌더링 컴포넌트
- `/src/components/baseTemplate/components/table/TableBody.jsx` - 테이블 바디 컴포넌트

## 작성일
2025년 1월 2일