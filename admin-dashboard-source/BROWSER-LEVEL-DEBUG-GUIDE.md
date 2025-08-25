# 브라우저 레벨 QuillEditor 디버깅 가이드

## 🎯 목적
개발환경에서 팝업 설정 페이지의 QuillEditor 사라짐 현상을 브라우저 레벨에서 체계적으로 분석하고 진단합니다.

## 📋 사전 준비

### 1. 환경 설정
- 개발 서버 실행 상태 확인
- Chrome/Firefox 최신 버전 사용 권장
- React DevTools 확장 프로그램 설치 (선택사항)

### 2. 페이지 접근
1. 관리자 페이지 로그인
2. 팝업 설정 페이지(`/popup`)로 이동
3. F12로 개발자 도구 열기

## 🔍 단계별 검증 프로세스

### STEP 1: 디버깅 스크립트 실행

```javascript
// 1. Console 탭에서 browser-level-debug-verification.js 내용 전체 복사 후 실행
// 스크립트가 성공적으로 로드되면 다음 메시지가 표시됩니다:
// "🎯 브라우저 레벨 디버깅 설정 완료!"
```

### STEP 2: 초기 상태 확인

```javascript
// 2. 초기 에디터 상태 확인
window.checkQuillEditorStatus();

// 예상 결과:
// - totalEditors: 0 (아직 다이얼로그가 열리지 않음)
// - visibleEditors: 0
```

### STEP 3: 팝업 등록 다이얼로그 열기

1. **"팝업 등록" 버튼 클릭**
2. **Console에서 관찰할 로그들:**

```
[CONSOLE] Relevant log captured - [PopupPage] 다이얼로그 상태 변경
[CONSOLE] Relevant log captured - [PopupPage] 새 팝업 등록 모드
[DOM] QuillEditor DOM 요소 추가됨
[REACT] Fiber commit detected
```

3. **에디터 상태 재확인:**
```javascript
window.checkQuillEditorStatus();
```

### STEP 4: 폼 필드 변경 테스트

#### 4.1 기본 필드 변경 (제목, 상태 등)
1. **"팝업명" 필드에 텍스트 입력**
2. **Console 관찰:**
```
[CONSOLE] Relevant log captured - [PopupPage] 폼 필드 변경: name=title
[CONSOLE] Relevant log captured - [PopupPage] 폼 데이터 업데이트
```

#### 4.2 날짜 필드 변경
1. **시작일/종료일 변경**
2. **Console 관찰:**
```
[CONSOLE] Relevant log captured - [PopupPage] 날짜 필드 변경
[CONSOLE] Relevant log captured - [PopupPage] 날짜 필드 업데이트
```

#### 4.3 Switch 필드 변경 (핵심 테스트)
1. **"클릭시 닫기" 스위치 토글**
2. **"한번만 표시" 스위치 토글**
3. **Console 관찰:**
```
[CONSOLE] Relevant log captured - [PopupPage] 폼 필드 변경: name=closeOnClick
⚠️ 주의: contentCleared: true 로그가 나타나는지 확인!
```

### STEP 5: QuillEditor 직접 조작

1. **에디터 영역에 텍스트 입력**
2. **Console 관찰:**
```
[CONSOLE] Relevant log captured - [QuillEditor] handleChange 호출
[CONSOLE] Relevant log captured - [QuillEditor] FormData 업데이트
```

3. **다른 필드 변경 후 에디터 상태 확인:**
```javascript
window.checkQuillEditorStatus();
```

## 🚨 주요 감시 포인트

### 1. Critical Alert 로그들
```
🚨 [ALERT] CONTENT CLEARED DETECTED! - formData.content가 비워짐
🚨 [DOM_ALERT] QuillEditor DOM 요소 제거됨! - DOM에서 에디터 제거
🚨 [DOM_ALERT] QuillEditor 숨김 스타일 적용됨! - display:none 등 적용
```

### 2. React 상태 변경 패턴
```
[REACT] Fiber commit detected - React 리렌더링 발생
[CONSOLE] [PopupPage] formData 변경됨 - 상태 업데이트
```

### 3. DOM 조작 감지
```
[DOM] QuillEditor DOM 요소 추가됨/제거됨
```

### 4. 네트워크 요청 영향
```
[NETWORK] Popup API 호출 감지 - 서버 요청으로 인한 상태 재설정 가능성
```

## 📊 데이터 수집 및 분석

### 실시간 모니터링
```javascript
// 에디터 상태 주기적 확인 (10초마다)
setInterval(() => {
  console.log('=== 주기적 상태 검사 ===');
  window.checkQuillEditorStatus();
}, 10000);
```

### 로그 내보내기
```javascript
// 검증 완료 후 로그 다운로드
window.exportQuillDebugLogs();
```

## 🔧 문제 시나리오별 대응

### 시나리오 1: 폼 필드 변경시 에디터 사라짐
**증상:** Switch 토글 후 에디터가 보이지 않음
**확인 사항:**
- `contentCleared: true` 로그 확인
- DOM 요소 제거/숨김 로그 확인
- React 리렌더링 패턴 분석

### 시나리오 2: 특정 조건에서만 발생
**증상:** 특정 필드 조합에서만 문제 발생
**확인 사항:**
- 문제 발생 직전의 formData 상태
- React Fiber 커밋 패턴
- 조건부 렌더링 로직 확인

### 시나리오 3: React.StrictMode 영향
**증상:** 개발 모드에서만 발생
**확인 사항:**
- StrictMode 감지 로그
- 이중 렌더링 패턴
- 컴포넌트 생명주기 로그

## 📈 성능 분석

### 메모리 누수 확인
```javascript
// 메모리 사용량 추적
setInterval(() => {
  if (performance.memory) {
    console.log('Memory:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
    });
  }
}, 5000);
```

### 렌더링 성능 확인
- React DevTools Profiler 사용
- 불필요한 리렌더링 패턴 확인
- 컴포넌트 마운트/언마운트 빈도 체크

## 🎯 결과 해석 가이드

### 정상 동작 패턴
```
1. 다이얼로그 열기 → DOM 요소 추가 → 에디터 초기화
2. 필드 변경 → formData 업데이트 → 에디터 유지
3. 에디터 입력 → 콘텐츠 업데이트 → 상태 동기화
```

### 문제 발생 패턴
```
1. 필드 변경 → formData 업데이트 → contentCleared: true
2. React 리렌더링 → DOM 요소 제거 → 에디터 사라짐
3. 조건부 렌더링 → display:none 적용 → 에디터 숨김
```

## 🚀 고급 디버깅 기법

### React DevTools 활용
1. Components 탭에서 PopupPage 컴포넌트 선택
2. formData state 실시간 관찰
3. QuillEditor 컴포넌트 props 변화 추적

### Network 탭 활용
1. API 호출 타이밍 확인
2. 응답 데이터가 formData에 미치는 영향 분석
3. 불필요한 네트워크 요청 식별

### Sources 탭 활용
1. 핵심 코드에 브레이크포인트 설정
2. 단계별 실행으로 문제 지점 특정
3. 콜 스택 분석으로 호출 흐름 추적

## 📝 보고서 작성 가이드

검증 완료 후 다음 정보를 포함한 보고서 작성:

### 1. 환경 정보
- 브라우저 버전
- React 버전
- 개발/프로덕션 모드

### 2. 재현 단계
- 정확한 조작 순서
- 문제 발생 조건

### 3. 로그 분석
- 핵심 에러/경고 로그
- 상태 변화 패턴
- 타이밍 정보

### 4. 성능 지표
- 메모리 사용량 변화
- 렌더링 횟수
- DOM 조작 빈도

### 5. 개선 방안
- 근본 원인 분석
- 해결책 제안
- 예방 조치

---

이 가이드를 통해 QuillEditor 문제의 정확한 원인을 파악하고 효과적인 해결책을 찾을 수 있습니다.