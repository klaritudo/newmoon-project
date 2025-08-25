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
const noop = () => {
};
const silenceAllLogs = () => {
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
const restoreLogs = () => {
  Object.assign(console, originalConsole);
};
if (typeof window !== "undefined") {
  window.silenceAllLogs = silenceAllLogs;
  window.restoreLogs = restoreLogs;
  const shouldSilence = localStorage.getItem("SILENCE_ALL_LOGS") === "true";
  if (shouldSilence) {
    silenceAllLogs();
    originalConsole.info("🔇 모든 로그가 차단되었습니다. window.restoreLogs()로 복원하세요.");
  }
}
const setSilenceLogs = (silence) => {
  localStorage.setItem("SILENCE_ALL_LOGS", silence ? "true" : "false");
  if (silence) {
    silenceAllLogs();
  } else {
    restoreLogs();
  }
};
export {
  restoreLogs,
  setSilenceLogs,
  silenceAllLogs
};
//# sourceMappingURL=silenceAllLogs--abPyK7d.js.map
