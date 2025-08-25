# 팝업 등록 다이얼로그 에디터 사라짐 문제 - 상세 분석 보고서

## 📋 문제 요약

**증상**: 팝업 등록 다이얼로그에서 QuillEditor에 내용을 입력한 후, 다른 필드(제목, 상태, 위치 등)를 변경하면 에디터 내용이 사라지는 현상

**영향도**: HIGH - 사용자 경험에 치명적 영향

**발생 조건**: 
- QuillEditor에 내용 입력 완료
- 다른 폼 필드 변경 시
- formData.content가 undefined/null로 변경됨

## 🔍 근본 원인 분석

### 1. PopupPage.jsx의 handleFormChange 함수 (747-777줄)

**현재 코드**:
```javascript
const handleFormChange = (e) => {
  const { name, value, checked, type } = e.target;
  const switchFields = ['closeOnClick', 'showOnce', 'hideOnLogout', 'showHeader'];
  
  setFormData(prev => {
    const newData = {
      ...prev,
      [name]: switchFields.includes(name) || type === 'checkbox' ? Boolean(checked) : value
    };
    return newData;
  });
};
```

**문제점**:
- `newData` 객체 생성 시 `content` 필드가 의도치 않게 손실될 수 있음
- Object spread operator의 순서와 타이밍 문제
- 다른 필드 업데이트 시 content 필드 보존이 보장되지 않음

### 2. handleContentChange 함수 (804-825줄)

**현재 코드**:
```javascript
const handleContentChange = useCallback((value) => {
  console.log('[PopupPage] 콘텐츠 변경:', { value, ... });
  
  if (value !== undefined && value !== null) {
    setFormData(prev => {
      const newData = { ...prev, content: value };
      return newData;
    });
  }
}, []); // ⚠️ 빈 의존성 배열
```

**문제점**:
- `useCallback`의 의존성 배열이 비어있음
- 최신 `formData` 상태를 참조하지 못할 수 있음
- 클로저 문제로 인한 stale closure 발생 가능

### 3. React 18 자동 배치(Automatic Batching) 영향

React 18에서는 이벤트 핸들러 외부에서도 상태 업데이트가 자동으로 배치됩니다:

```javascript
// 다음 두 업데이트가 동시에 배치될 수 있음
handleContentChange('<p>content</p>');  // content 설정
handleFormChange({ target: { name: 'title', value: 'title' } }); // title 설정
```

**경합 조건**:
1. `handleContentChange`가 `formData.content` 업데이트
2. 거의 동시에 `handleFormChange`가 다른 필드 업데이트
3. 배치 처리로 인해 마지막 상태 업데이트만 적용됨
4. `content` 필드가 손실됨

### 4. QuillEditor.jsx의 value prop 처리 (83-109줄)

**현재 코드**:
```javascript
useEffect(() => {
  const newValue = value || '';
  // value가 undefined면 빈 문자열로 변경
  if (shouldUpdate) {
    valueRef.current = newValue;
    setEditorValue(newValue); // 에디터 내용이 빈 문자열로 리셋됨
  }
}, [value, label]);
```

**문제점**:
- 외부에서 `value`가 `undefined`로 전달되면 에디터가 빈 문자열로 리셋됨
- 사용자가 입력한 내용이 즉시 사라짐

## 🎯 정확한 발생 시나리오

### 시나리오 1: 기본 필드 변경
```
1. 사용자: QuillEditor에 "안녕하세요" 입력
   → formData.content = "<p>안녕하세요</p>"
   
2. 사용자: 제목 필드에 "새 팝업" 입력
   → handleFormChange 호출
   
3. handleFormChange 실행:
   → setFormData(prev => ({ ...prev, title: "새 팝업" }))
   
4. ⚠️ 문제 발생:
   → prev 객체에서 content가 undefined인 경우가 있음
   → 최종 formData.content = undefined
   
5. QuillEditor 리렌더링:
   → value={formData.content} = undefined
   → useEffect에서 newValue = "" (빈 문자열)
   → 에디터 내용 사라짐
```

### 시나리오 2: Switch 필드 변경
```
1. 사용자: 에디터 내용 입력 완료
2. 사용자: "클릭시 닫기" 스위치 토글
3. handleFormChange에서 Boolean 처리:
   → switchFields.includes(name) || type === 'checkbox' ? Boolean(checked) : value
4. 이 과정에서 다른 필드들(content 포함)이 의도치 않게 변경될 수 있음
```

### 시나리오 3: 빠른 연속 입력
```
1. 사용자가 빠르게 여러 필드 변경
2. handleContentChange + handleFormChange 거의 동시 호출
3. React 18 배치 처리로 상태 업데이트 충돌
4. 마지막 업데이트만 적용되면서 content 손실
```

## 🔧 해결 방안

### 1. handleFormChange 개선 (즉시 적용 가능)

```javascript
const handleFormChange = (e) => {
  const { name, value, checked, type } = e.target;
  const switchFields = ['closeOnClick', 'showOnce', 'hideOnLogout', 'showHeader'];
  
  setFormData(prev => {
    // content 필드 명시적 보존
    const preservedContent = prev.content;
    const newValue = switchFields.includes(name) || type === 'checkbox' ? Boolean(checked) : value;
    
    return {
      ...prev,
      [name]: newValue,
      content: preservedContent // 항상 보존
    };
  });
};
```

### 2. handleContentChange 의존성 수정

```javascript
const handleContentChange = useCallback((value) => {
  console.log('[PopupPage] 콘텐츠 변경:', { value, timestamp: new Date().toISOString() });
  
  if (value !== undefined && value !== null) {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  }
}, []); // 의존성 최소화 유지
```

### 3. QuillEditor value prop 안전성 강화

```javascript
// QuillEditor.jsx 수정
useEffect(() => {
  const newValue = value !== undefined && value !== null ? value : '';
  
  // 빈 문자열이 아닌 경우에만 업데이트 (사용자 입력 보호)
  if (newValue !== '' || !isInitializedRef.current) {
    if (valueRef.current !== newValue) {
      valueRef.current = newValue;
      setEditorValue(newValue);
    }
  }
}, [value, label]);
```

### 4. 디버깅 강화

```javascript
// formData 변경 추적 개선
useEffect(() => {
  console.log('[PopupPage] formData 변경됨:', {
    content: formData.content,
    contentLength: formData.content?.length || 0,
    contentLost: !formData.content && !!formData.title, // content 손실 감지
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack // 호출 스택 추적
  });
}, [formData]);
```

## 🧪 검증 방법

### 1. 로그 기반 추적
```javascript
// PopupPage.jsx에 추가
const debugFormData = useRef();
useEffect(() => {
  if (debugFormData.current?.content && !formData.content) {
    console.error('🚨 CONTENT LOST!', {
      before: debugFormData.current,
      after: formData,
      timestamp: new Date().toISOString()
    });
  }
  debugFormData.current = { ...formData };
}, [formData]);
```

### 2. React DevTools 사용
- Components 탭에서 PopupPage 컴포넌트 선택
- formData.content 값 실시간 모니터링
- 필드 변경 시 content 값 변화 추적

### 3. 브라우저 디버깅
```javascript
// 브라우저 콘솔에서 실행
window.debugPopupEditor = true;

// handleFormChange에 브레이크포인트 설정
// formData 변경 전후 비교
```

## 📊 영향도 평가

| 항목 | 평가 | 설명 |
|------|------|------|
| 사용자 경험 | 🔴 Critical | 입력한 내용이 예고 없이 사라짐 |
| 데이터 손실 | 🔴 Critical | 사용자 작업 내용 완전 손실 |
| 재현 빈도 | 🟡 Medium | 특정 조건에서 재현 가능 |
| 수정 난이도 | 🟢 Low | 코드 수정으로 해결 가능 |

## 🎯 권장 조치

### 즉시 조치 (Priority: HIGH)
1. **handleFormChange 함수 수정** - content 필드 명시적 보존
2. **로깅 강화** - content 손실 감지 및 추적
3. **사용자 안내** - 임시 저장 기능 또는 경고 메시지

### 중기 조치 (Priority: MEDIUM)  
1. **QuillEditor 안전성 강화** - value prop 처리 개선
2. **상태 관리 개선** - React.useReducer 도입 검토
3. **테스트 케이스 추가** - 자동화된 regression 테스트

### 장기 조치 (Priority: LOW)
1. **아키텍처 개선** - 폼 상태 관리 라이브러리 도입 (react-hook-form 등)
2. **성능 최적화** - React.memo, useMemo 적용
3. **사용자 경험 개선** - 자동 저장 기능 도입

## 🔍 추가 조사 필요 사항

1. **다른 에디터 사용 컴포넌트** - 동일한 패턴의 문제가 있는지 확인
2. **브라우저별 동작 차이** - Chrome, Firefox, Safari에서의 동작 검증
3. **React 버전별 차이** - React 17 vs 18에서의 동작 비교
4. **성능 영향도** - 수정 후 렌더링 성능 측정

---

**작성일**: 2025-08-01  
**분석자**: Claude Code SuperClaude Framework  
**우선순위**: HIGH  
**예상 수정 시간**: 2-4 시간