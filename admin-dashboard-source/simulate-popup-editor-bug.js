// 팝업 에디터 버그 시뮬레이션 스크립트
// 실제 사용자 상호작용 시나리오 재현

import fs from 'fs';

/**
 * PopupPage 상태 변화 시뮬레이션
 */
class PopupPageSimulator {
  constructor() {
    this.formData = {
      title: '',
      content: '',
      popupType: 'modal',
      status: 'active',
      position: 'center',
      target: 'all',
      width: 400,
      height: 300,
      startDate: new Date(),
      endDate: new Date(),
      closeOnClick: false,
      showOnce: false,
      imageUrl: '',
      linkUrl: '',
      writer: '관리자',
      hideOnLogout: false,
      showHeader: true,
      headerBackgroundColor: '#f5f5f5',
      textSize: 'medium',
      closeButtonStyle: 'default',
      topPosition: '',
      leftPosition: ''
    };
    
    this.logs = [];
    this.step = 0;
  }

  log(message, data = {}) {
    this.step++;
    const logEntry = {
      step: this.step,
      timestamp: new Date().toISOString(),
      message,
      formData: { ...this.formData },
      contentStatus: {
        hasContent: !!this.formData.content,
        contentLength: this.formData.content?.length || 0,
        contentPreview: this.formData.content?.substring(0, 50) + (this.formData.content?.length > 50 ? '...' : ''),
        contentValue: this.formData.content
      },
      ...data
    };
    
    this.logs.push(logEntry);
    
    console.log(`\n[STEP ${this.step}] ${message}`);
    console.log(`   Content: "${this.formData.content}" (${this.formData.content?.length || 0} chars)`);
    if (data.warning) {
      console.log(`   ⚠️  ${data.warning}`);
    }
    if (data.error) {
      console.log(`   ❌ ${data.error}`);
    }
  }

  // QuillEditor 내용 변경 시뮬레이션
  handleContentChange(value) {
    this.log('QuillEditor 내용 변경', { 
      action: 'handleContentChange',
      newValue: value,
      trigger: 'user_typing'
    });
    
    // 현재 코드와 동일한 로직
    if (value !== undefined && value !== null) {
      this.formData = { ...this.formData, content: value };
      this.log('FormData 업데이트 (handleContentChange)', {
        action: 'setFormData',
        preserved: true
      });
    }
  }

  // 폼 필드 변경 시뮬레이션 (현재 코드의 문제점 재현)
  handleFormChange(name, value, type = 'text', checked = false) {
    this.log(`폼 필드 변경: ${name}`, {
      action: 'handleFormChange',
      field: name,
      newValue: value,
      type,
      checked,
      trigger: 'user_input'
    });

    const switchFields = ['closeOnClick', 'showOnce', 'hideOnLogout', 'showHeader'];
    
    // 현재 코드와 동일한 로직 (문제점 포함)
    const newData = {
      ...this.formData,
      [name]: switchFields.includes(name) || type === 'checkbox' ? Boolean(checked) : value
    };
    
    // 이 부분에서 content가 사라질 수 있음
    const contentLost = this.formData.content && !newData.content;
    
    this.formData = newData;
    
    this.log('FormData 업데이트 (handleFormChange)', {
      action: 'setFormData',
      field: name,
      contentLost,
      warning: contentLost ? 'Content 필드가 사라졌습니다!' : null,
      error: contentLost ? 'Race condition detected: content field lost' : null
    });
  }

  // 개선된 폼 필드 변경 핸들러
  handleFormChangeFixed(name, value, type = 'text', checked = false) {
    this.log(`폼 필드 변경 (수정됨): ${name}`, {
      action: 'handleFormChangeFixed',
      field: name,
      newValue: value,
      type,
      checked,
      trigger: 'user_input'
    });

    const switchFields = ['closeOnClick', 'showOnce', 'hideOnLogout', 'showHeader'];
    
    // 개선된 로직: content 필드 명시적 보존
    const preservedContent = this.formData.content;
    const newValue = switchFields.includes(name) || type === 'checkbox' ? Boolean(checked) : value;
    
    this.formData = {
      ...this.formData,
      [name]: newValue,
      content: preservedContent // 명시적 보존
    };
    
    this.log('FormData 업데이트 (handleFormChangeFixed)', {
      action: 'setFormData',
      field: name,
      contentPreserved: true,
      preservedContent
    });
  }

  // 시나리오 실행
  runScenario(scenarioName, useFixed = false) {
    console.log(`\n=== ${scenarioName} 시나리오 시작 ===`);
    this.log(`${scenarioName} 시나리오 시작`);
    
    const handleFormChangeMethod = useFixed ? 
      this.handleFormChangeFixed.bind(this) : 
      this.handleFormChange.bind(this);

    switch (scenarioName) {
      case '문제_재현_시나리오':
        this.runProblemScenario(handleFormChangeMethod);
        break;
      case '수정_검증_시나리오':
        this.runFixedScenario();
        break;
      case '경합_조건_시나리오':
        this.runRaceConditionScenario(handleFormChangeMethod);
        break;
    }
    
    console.log(`\n=== ${scenarioName} 시나리오 완료 ===`);
    return this.logs;
  }

  runProblemScenario(handleFormChangeMethod) {
    // 1. 사용자가 에디터에 내용 입력
    this.handleContentChange('<p>안녕하세요. 새로운 팝업 내용입니다.</p>');
    
    // 2. 제목 필드 변경
    handleFormChangeMethod('title', '새 팝업 제목');
    
    // 3. 상태 필드 변경
    handleFormChangeMethod('status', 'inactive');
    
    // 4. 위치 필드 변경
    handleFormChangeMethod('position', 'top');
    
    // 5. 스위치 필드 변경
    handleFormChangeMethod('closeOnClick', true, 'checkbox', true);
  }

  runFixedScenario() {
    // 1. 사용자가 에디터에 내용 입력
    this.handleContentChange('<p>수정된 에디터로 내용 입력</p>');
    
    // 2. 개선된 핸들러로 필드 변경
    this.handleFormChangeFixed('title', '수정된 팝업 제목');
    this.handleFormChangeFixed('status', 'inactive');
    this.handleFormChangeFixed('position', 'bottom');
    this.handleFormChangeFixed('closeOnClick', true, 'checkbox', true);
  }

  runRaceConditionScenario(handleFormChangeMethod) {
    // 빠른 연속 변경으로 경합 조건 시뮬레이션
    this.handleContentChange('<p>경합 조건 테스트 내용</p>');
    
    // 거의 동시에 발생하는 변경들
    setTimeout(() => {
      handleFormChangeMethod('title', '경합 테스트 제목');
    }, 0);
    
    setTimeout(() => {
      this.handleContentChange('<p>경합 조건에서 내용 변경</p>');
    }, 1);
    
    setTimeout(() => {
      handleFormChangeMethod('status', 'active');
    }, 2);
  }

  // 결과 분석
  analyzeResults() {
    const contentLostSteps = this.logs.filter(log => 
      log.contentStatus.hasContent === false && 
      log.step > 1 && // 초기 상태 제외
      this.logs[log.step - 2]?.contentStatus.hasContent === true
    );

    const analysis = {
      totalSteps: this.logs.length,
      contentLostCount: contentLostSteps.length,
      contentLostSteps: contentLostSteps.map(step => ({
        step: step.step,
        message: step.message,
        action: step.action
      })),
      finalContentState: {
        hasContent: this.formData.content ? true : false,
        content: this.formData.content,
        length: this.formData.content?.length || 0
      }
    };

    return analysis;
  }

  // 보고서 생성
  generateReport() {
    const analysis = this.analyzeResults();
    
    return {
      timestamp: new Date().toISOString(),
      scenario: 'PopupPage Editor Content Loss Simulation',
      analysis,
      logs: this.logs,
      recommendations: [
        'handleFormChange에서 content 필드 명시적 보존',
        'React.useCallback 의존성 배열 최적화',
        'FormData 업데이트 시 함수형 업데이트 사용',
        '경합 조건 방지를 위한 debounce 적용'
      ]
    };
  }
}

// 시뮬레이션 실행
console.log('=== 팝업 에디터 버그 시뮬레이션 ===\n');

// 1. 문제 재현 시나리오
const simulator1 = new PopupPageSimulator();
simulator1.runScenario('문제_재현_시나리오');
const problemReport = simulator1.generateReport();

console.log('\n--- 문제 재현 결과 ---');
console.log(`Content 손실 발생: ${problemReport.analysis.contentLostCount}회`);
console.log(`최종 Content 상태: ${problemReport.analysis.finalContentState.hasContent ? '보존됨' : '손실됨'}`);

// 2. 수정 검증 시나리오
const simulator2 = new PopupPageSimulator();
simulator2.runScenario('수정_검증_시나리오');
const fixedReport = simulator2.generateReport();

console.log('\n--- 수정 검증 결과 ---');
console.log(`Content 손실 발생: ${fixedReport.analysis.contentLostCount}회`);
console.log(`최종 Content 상태: ${fixedReport.analysis.finalContentState.hasContent ? '보존됨' : '손실됨'}`);

// 보고서 저장
const reportPath = './popup-editor-simulation-report.json';
fs.writeFileSync(reportPath, JSON.stringify({
  problemScenario: problemReport,
  fixedScenario: fixedReport,
  comparison: {
    problemContentLost: problemReport.analysis.contentLostCount,
    fixedContentLost: fixedReport.analysis.contentLostCount,
    improvementAchieved: problemReport.analysis.contentLostCount > fixedReport.analysis.contentLostCount
  }
}, null, 2));

console.log(`\n시뮬레이션 완료. 보고서 저장: ${reportPath}`);