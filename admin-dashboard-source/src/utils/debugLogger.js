/**
 * 디버그 로거 유틸리티
 * 환경 변수를 통해 로그 레벨을 제어할 수 있습니다.
 */

const DEBUG_LEVELS = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5
};

// 기본 디버그 레벨 설정 (개발 환경에서는 INFO, 프로덕션에서는 ERROR)
const DEFAULT_DEBUG_LEVEL = process.env.NODE_ENV === 'development' ? DEBUG_LEVELS.INFO : DEBUG_LEVELS.ERROR;

// 전역 디버그 레벨 (localStorage에서 읽거나 기본값 사용)
const getDebugLevel = () => {
  if (typeof window === 'undefined') return DEFAULT_DEBUG_LEVEL;
  
  const stored = localStorage.getItem('DEBUG_LEVEL');
  if (stored && DEBUG_LEVELS[stored] !== undefined) {
    return DEBUG_LEVELS[stored];
  }
  
  return DEFAULT_DEBUG_LEVEL;
};

// 특정 모듈의 디버그 활성화 여부
const isModuleEnabled = (moduleName) => {
  if (typeof window === 'undefined') return true;
  
  const enabledModules = localStorage.getItem('DEBUG_MODULES');
  if (!enabledModules || enabledModules === '*') return true;
  
  const modules = enabledModules.split(',').map(m => m.trim());
  return modules.includes(moduleName);
};

class DebugLogger {
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.enabled = isModuleEnabled(moduleName);
    this.level = getDebugLevel();
  }
  
  log(level, ...args) {
    if (!this.enabled || this.level < level) return;
    
    const prefix = `[${this.moduleName}]`;
    const timestamp = new Date().toISOString().slice(11, 19);
    
    switch (level) {
      case DEBUG_LEVELS.ERROR:
        console.error(`${timestamp} ${prefix}`, ...args);
        break;
      case DEBUG_LEVELS.WARN:
        console.warn(`${timestamp} ${prefix}`, ...args);
        break;
      case DEBUG_LEVELS.INFO:
        console.info(`${timestamp} ${prefix}`, ...args);
        break;
      case DEBUG_LEVELS.DEBUG:
      case DEBUG_LEVELS.VERBOSE:
        console.log(`${timestamp} ${prefix}`, ...args);
        break;
    }
  }
  
  error(...args) {
    this.log(DEBUG_LEVELS.ERROR, ...args);
  }
  
  warn(...args) {
    this.log(DEBUG_LEVELS.WARN, ...args);
  }
  
  info(...args) {
    this.log(DEBUG_LEVELS.INFO, ...args);
  }
  
  debug(...args) {
    this.log(DEBUG_LEVELS.DEBUG, ...args);
  }
  
  verbose(...args) {
    this.log(DEBUG_LEVELS.VERBOSE, ...args);
  }
}

// 디버그 설정 헬퍼 함수
export const setDebugLevel = (level) => {
  if (typeof window === 'undefined') return;
  
  if (typeof level === 'string' && DEBUG_LEVELS[level.toUpperCase()] !== undefined) {
    localStorage.setItem('DEBUG_LEVEL', level.toUpperCase());
  } else if (typeof level === 'number') {
    const levelName = Object.entries(DEBUG_LEVELS).find(([_, v]) => v === level)?.[0];
    if (levelName) {
      localStorage.setItem('DEBUG_LEVEL', levelName);
    }
  }
};

export const setDebugModules = (modules) => {
  if (typeof window === 'undefined') return;
  
  if (Array.isArray(modules)) {
    localStorage.setItem('DEBUG_MODULES', modules.join(','));
  } else if (typeof modules === 'string') {
    localStorage.setItem('DEBUG_MODULES', modules);
  }
};

export const clearDebugSettings = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('DEBUG_LEVEL');
  localStorage.removeItem('DEBUG_MODULES');
};

// 전역 디버그 설정을 window 객체에 노출 (개발 환경에서만)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.DEBUG = {
    setLevel: setDebugLevel,
    setModules: setDebugModules,
    clear: clearDebugSettings,
    levels: DEBUG_LEVELS
  };
  
  console.info(`
=== 디버그 설정 가이드 ===
현재 디버그 레벨: ${Object.entries(DEBUG_LEVELS).find(([_, v]) => v === getDebugLevel())?.[0] || 'UNKNOWN'}

디버그 레벨 변경:
  window.DEBUG.setLevel('OFF')     // 모든 로그 비활성화
  window.DEBUG.setLevel('ERROR')   // 오류만 표시
  window.DEBUG.setLevel('WARN')    // 경고 이상 표시
  window.DEBUG.setLevel('INFO')    // 정보 이상 표시 (기본값)
  window.DEBUG.setLevel('DEBUG')   // 디버그 이상 표시
  window.DEBUG.setLevel('VERBOSE') // 모든 로그 표시

특정 모듈만 활성화:
  window.DEBUG.setModules('BaseTable,TableBody')  // 특정 모듈만
  window.DEBUG.setModules('*')                    // 모든 모듈 (기본값)

설정 초기화:
  window.DEBUG.clear()
=======================
  `);
}

export default DebugLogger;