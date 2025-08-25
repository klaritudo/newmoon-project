/**
 * 모든 콘솔 로그를 완전히 차단하는 유틸리티
 */

// 원본 console 메서드 백업
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
  table: console.table,
  group: console.group,
  groupEnd: console.groupEnd,
  time: console.time,
  timeEnd: console.timeEnd
};

// 빈 함수
const noop = () => {};

// 모든 로그 차단
export const silenceAllLogs = () => {
  console.log = noop;
  console.error = noop;
  console.warn = noop;
  console.info = noop;
  console.debug = noop;
  console.trace = noop;
  console.table = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.time = noop;
  console.timeEnd = noop;
};

// 로그 복원
export const restoreLogs = () => {
  Object.assign(console, originalConsole);
};

// 개발 환경에서 자동 실행
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 전역에 노출
  window.silenceAllLogs = silenceAllLogs;
  window.restoreLogs = restoreLogs;
  
  // localStorage에서 설정 읽기
  const shouldSilence = localStorage.getItem('SILENCE_ALL_LOGS') === 'true';
  
  if (shouldSilence) {
    silenceAllLogs();
    // 안내 메시지만 한 번 출력
    originalConsole.info('🔇 모든 로그가 차단되었습니다. window.restoreLogs()로 복원하세요.');
  }
}

// 설정 저장 헬퍼
export const setSilenceLogs = (silence) => {
  localStorage.setItem('SILENCE_ALL_LOGS', silence ? 'true' : 'false');
  if (silence) {
    silenceAllLogs();
  } else {
    restoreLogs();
  }
};