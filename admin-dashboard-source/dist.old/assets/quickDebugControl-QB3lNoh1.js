const disableDebugLogs = () => {
  if (typeof window === "undefined") return;
  if (!window._originalConsole) {
    window._originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };
  }
  const filteredLog = (originalMethod, level) => {
    return function(...args) {
      const message = args.join(" ");
      const filterPatterns = [/\[BaseTable\]/, /\[TableBody\]/, /canUseButton/, /canViewLayout/, /API Balance Service/, /렌더링 시작/, /데이터가 없습니다/, /상태:/, /props:/, /\[MemberDetailDialog\]/, /토큰 발견/, /usePermission\.js/, /BaseTable\.jsx/, /TableBody\.jsx/, /apiBalanceService\.js/, /✅/, /🔍/, /overrideMethod/, /react-dom\.production/, /scheduler\.production/];
      const shouldFilter = filterPatterns.some((pattern) => pattern.test(message));
      if (shouldFilter) return;
      originalMethod.apply(console, args);
    };
  };
  console.log = filteredLog(window._originalConsole.log);
  console.error = filteredLog(window._originalConsole.error);
  console.warn = filteredLog(window._originalConsole.warn);
  console.info = filteredLog(window._originalConsole.info);
  console.info("✅ 디버그 로그가 필터링됩니다. 복원하려면 window.enableDebugLogs()를 실행하세요.");
};
const enableDebugLogs = () => {
  if (typeof window === "undefined" || !window._originalConsole) return;
  console.log = window._originalConsole.log;
  console.error = window._originalConsole.error;
  console.warn = window._originalConsole.warn;
  console.info = window._originalConsole.info;
  console.debug = window._originalConsole.debug;
  console.info("✅ 디버그 로그가 복원되었습니다.");
};
if (typeof window !== "undefined" && true) {
  window.disableDebugLogs = disableDebugLogs;
  window.enableDebugLogs = enableDebugLogs;
  disableDebugLogs();
  console.info(`
=== 디버그 로그 제어 ===
디버그 로그가 자동으로 필터링되었습니다.

모든 로그 보기: window.enableDebugLogs()
로그 필터링: window.disableDebugLogs()
====================
  `);
}
export {
  disableDebugLogs,
  enableDebugLogs
};
//# sourceMappingURL=quickDebugControl-QB3lNoh1.js.map
