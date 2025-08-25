/**
 * 개발 환경에서 빠르게 디버그 로그를 제어하는 스크립트
 */

// 디버그 로그를 끄기
export const disableDebugLogs = () => {
  if (typeof window === 'undefined') return;
  
  // console 메서드들을 빈 함수로 대체
  const noop = () => {};
  
  // 원본 console 메서드 백업
  if (!window._originalConsole) {
    window._originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };
  }
  
  // 특정 패턴의 로그만 필터링
  const filteredLog = (originalMethod, level) => {
    return function(...args) {
      const message = args.join(' ');
      
      // 필터링할 패턴들
      const filterPatterns = [
        /\[BaseTable\]/,
        /\[TableBody\]/,
        /canUseButton/,
        /canViewLayout/,
        /API Balance Service/,
        /렌더링 시작/,
        /데이터가 없습니다/,
        /상태:/,
        /props:/,
        /\[MemberDetailDialog\]/,
        /토큰 발견/,
        /usePermission\.js/,
        /BaseTable\.jsx/,
        /TableBody\.jsx/,
        /apiBalanceService\.js/,
        /✅/,
        /🔍/,
        /overrideMethod/,
        /react-dom\.production/,
        /scheduler\.production/,
        // Dashboard 무한 로그 필터링
        /Settlement data/,
        /getApiValueForCard/,
        /apiData structure/,
        /Using fallback data/,
        /Rendering card/,
        /useDynamicTypes/,
        /Betting sum calculated/,
        /Winning sum calculated/,
        /Betting profit/,
        /Deposit value/,
        /Withdrawal value/,
        /Rolling value/,
        /Total profit/,
        /RTP:/,
        /Fetching API data/,
        /Raw API response/,
        /API data loaded successfully/,
        /overview data/,
        /userMetrics data/,
        /API returned no data/,
        /PopupManager:/,
        /스케일링/,
        /만료된 팝업 체크/,
        /팝업 API 호출/,
        /서버에서 받은 팝업/,
        /필터링 후 표시할 팝업/,
        /에이전트 레벨 데이터로 카드 초기화/,
        /🔎/,
        /📊/,
        /💰/,
        /💵/,
        /💳/,
        /💸/,
        /🎲/,
        /💎/,
        /📈/,
        /🎯/,
        /🏆/,
        /📦/,
        /⚠️/,
        /🎣/,
        // 404 에러 필터링
        /404.*Not Found/,
        /permissions\/roles/,
        /API 호출 실패/,
        /로컬 데이터 사용/,
        /ERR_BAD_REQUEST/
      ];
      
      // 패턴에 매칭되면 로그 출력 안함
      const shouldFilter = filterPatterns.some(pattern => pattern.test(message));
      if (shouldFilter) return;
      
      // 패턴에 매칭되지 않으면 원본 메서드 호출
      originalMethod.apply(console, args);
    };
  };
  
  // console 메서드 대체
  console.log = filteredLog(window._originalConsole.log, 'log');
  console.error = filteredLog(window._originalConsole.error, 'error');
  console.warn = filteredLog(window._originalConsole.warn, 'warn');
  console.info = filteredLog(window._originalConsole.info, 'info');
  
  console.info('✅ 디버그 로그가 필터링됩니다. 복원하려면 window.enableDebugLogs()를 실행하세요.');
};

// 디버그 로그 복원
export const enableDebugLogs = () => {
  if (typeof window === 'undefined' || !window._originalConsole) return;
  
  console.log = window._originalConsole.log;
  console.error = window._originalConsole.error;
  console.warn = window._originalConsole.warn;
  console.info = window._originalConsole.info;
  console.debug = window._originalConsole.debug;
  
  console.info('✅ 디버그 로그가 복원되었습니다.');
};

// 전역에서 사용할 수 있도록 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.disableDebugLogs = disableDebugLogs;
  window.enableDebugLogs = enableDebugLogs;
  
  // 자동으로 디버그 로그 필터링 적용 (즉시 실행)
  disableDebugLogs();
  console.info(`
=== 디버그 로그 제어 ===
디버그 로그가 자동으로 필터링되었습니다.

모든 로그 보기: window.enableDebugLogs()
로그 필터링: window.disableDebugLogs()
====================
  `);
}