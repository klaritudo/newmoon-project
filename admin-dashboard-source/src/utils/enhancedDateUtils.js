/**
 * 향상된 날짜 관련 유틸리티 함수들
 * 확장성과 재사용성을 고려한 날짜 처리 라이브러리
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

// dayjs 플러그인 초기화
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('ko');

// 기본 타임존 설정
const DEFAULT_TIMEZONE = 'Asia/Seoul';

/**
 * 날짜 포맷 상수
 */
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DD HH:mm:ss',
  ISO_DATETIME_FULL: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  KOREAN_DATE: 'YYYY년 MM월 DD일',
  KOREAN_DATETIME: 'YYYY년 MM월 DD일 HH:mm',
  DISPLAY_DATE: 'MM/DD',
  DISPLAY_DATETIME: 'MM/DD HH:mm',
  API_FORMAT: 'YYYY-MM-DD HH:mm:ss'
};

/**
 * 날짜 범위 프리셋 타입
 */
export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek', 
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_QUARTER: 'thisQuarter',
  LAST_QUARTER: 'lastQuarter',
  THIS_YEAR: 'thisYear',
  LAST_YEAR: 'lastYear',
  LAST_7_DAYS: 'last7Days',
  LAST_30_DAYS: 'last30Days',
  LAST_90_DAYS: 'last90Days',
  LAST_365_DAYS: 'last365Days'
};

/**
 * 타임존을 고려한 현재 날짜/시간 반환
 * @param {string} timezone - 타임존 (기본값: Asia/Seoul)
 * @returns {dayjs.Dayjs} dayjs 객체
 */
export const now = (timezone = DEFAULT_TIMEZONE) => {
  return dayjs().tz(timezone);
};

/**
 * 타임존을 고려한 날짜 생성
 * @param {string|Date|dayjs.Dayjs} date - 날짜
 * @param {string} timezone - 타임존 (기본값: Asia/Seoul)
 * @returns {dayjs.Dayjs} dayjs 객체
 */
export const createDate = (date, timezone = DEFAULT_TIMEZONE) => {
  if (!date) return null;
  return dayjs(date).tz(timezone);
};

/**
 * 날짜 포맷팅
 * @param {string|Date|dayjs.Dayjs} date - 날짜
 * @param {string} format - 포맷 (기본값: YYYY-MM-DD HH:mm:ss)
 * @param {string} timezone - 타임존 (기본값: Asia/Seoul)
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (date, format = DATE_FORMATS.ISO_DATETIME, timezone = DEFAULT_TIMEZONE) => {
  if (!date) return '-';
  
  try {
    const dateObj = createDate(date, timezone);
    if (!dateObj || !dateObj.isValid()) return '-';
    return dateObj.format(format);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * 상대적 시간 표시 (한국어)
 * @param {string|Date|dayjs.Dayjs} date - 날짜
 * @param {string} timezone - 타임존 (기본값: Asia/Seoul)
 * @returns {string} 상대적 시간 문자열
 */
export const formatRelativeTime = (date, timezone = DEFAULT_TIMEZONE) => {
  if (!date) return '-';
  
  try {
    const dateObj = createDate(date, timezone);
    const nowObj = now(timezone);
    
    if (!dateObj || !dateObj.isValid()) return '-';
    
    return dateObj.from(nowObj);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '-';
  }
};

/**
 * 날짜 범위 검증
 * @param {dayjs.Dayjs} startDate - 시작 날짜
 * @param {dayjs.Dayjs} endDate - 종료 날짜
 * @returns {Object} 검증 결과 { isValid: boolean, error?: string }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: false, error: '시작일과 종료일을 모두 선택해주세요.' };
  }
  
  if (!startDate.isValid() || !endDate.isValid()) {
    return { isValid: false, error: '올바른 날짜 형식이 아닙니다.' };
  }
  
  if (startDate.isAfter(endDate)) {
    return { isValid: false, error: '시작일은 종료일보다 이후일 수 없습니다.' };
  }
  
  // 최대 1년 제한
  if (endDate.diff(startDate, 'day') > 365) {
    return { isValid: false, error: '날짜 범위는 최대 1년까지만 설정할 수 있습니다.' };
  }
  
  return { isValid: true };
};

/**
 * 날짜 비교 유틸리티
 */
export const DateComparison = {
  /**
   * 두 날짜가 같은지 비교
   * @param {dayjs.Dayjs} date1 - 첫 번째 날짜
   * @param {dayjs.Dayjs} date2 - 두 번째 날짜
   * @param {string} unit - 비교 단위 (day, month, year 등)
   * @returns {boolean}
   */
  isSame: (date1, date2, unit = 'day') => {
    if (!date1 || !date2) return false;
    return date1.isSame(date2, unit);
  },
  
  /**
   * date1이 date2보다 이전인지 비교
   * @param {dayjs.Dayjs} date1 - 첫 번째 날짜
   * @param {dayjs.Dayjs} date2 - 두 번째 날짜
   * @param {string} unit - 비교 단위
   * @returns {boolean}
   */
  isBefore: (date1, date2, unit = 'day') => {
    if (!date1 || !date2) return false;
    return date1.isBefore(date2, unit);
  },
  
  /**
   * date1이 date2보다 이후인지 비교
   * @param {dayjs.Dayjs} date1 - 첫 번째 날짜
   * @param {dayjs.Dayjs} date2 - 두 번째 날짜
   * @param {string} unit - 비교 단위
   * @returns {boolean}
   */
  isAfter: (date1, date2, unit = 'day') => {
    if (!date1 || !date2) return false;
    return date1.isAfter(date2, unit);
  },
  
  /**
   * 날짜가 범위 내에 있는지 확인
   * @param {dayjs.Dayjs} date - 확인할 날짜
   * @param {dayjs.Dayjs} startDate - 시작 날짜
   * @param {dayjs.Dayjs} endDate - 종료 날짜
   * @param {string} unit - 비교 단위
   * @returns {boolean}
   */
  isBetween: (date, startDate, endDate, unit = 'day') => {
    if (!date || !startDate || !endDate) return false;
    return date.isBetween(startDate, endDate, unit, '[]');
  }
};

/**
 * 프리셋 기반 날짜 범위 생성
 * @param {string} preset - 프리셋 타입
 * @param {string} timezone - 타임존 (기본값: Asia/Seoul)
 * @returns {Object} { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, label: string }
 */
export const getDateRangeByPreset = (preset, timezone = DEFAULT_TIMEZONE) => {
  const nowDate = now(timezone);
  
  const ranges = {
    [DATE_RANGE_PRESETS.TODAY]: {
      startDate: nowDate.startOf('day'),
      endDate: nowDate.endOf('day'),
      label: '오늘'
    },
    
    [DATE_RANGE_PRESETS.YESTERDAY]: {
      startDate: nowDate.subtract(1, 'day').startOf('day'),
      endDate: nowDate.subtract(1, 'day').endOf('day'),
      label: '어제'
    },
    
    [DATE_RANGE_PRESETS.THIS_WEEK]: {
      startDate: nowDate.startOf('week').add(1, 'day'), // 월요일 시작
      endDate: nowDate.endOf('day'),
      label: '이번 주'
    },
    
    [DATE_RANGE_PRESETS.LAST_WEEK]: {
      startDate: nowDate.subtract(1, 'week').startOf('week').add(1, 'day'),
      endDate: nowDate.subtract(1, 'week').endOf('week').add(1, 'day'),
      label: '지난 주'
    },
    
    [DATE_RANGE_PRESETS.THIS_MONTH]: {
      startDate: nowDate.startOf('month'),
      endDate: nowDate.endOf('day'),
      label: '이번 달'
    },
    
    [DATE_RANGE_PRESETS.LAST_MONTH]: {
      startDate: nowDate.subtract(1, 'month').startOf('month'),
      endDate: nowDate.subtract(1, 'month').endOf('month'),
      label: '지난 달'
    },
    
    [DATE_RANGE_PRESETS.THIS_QUARTER]: {
      startDate: nowDate.startOf('quarter'),
      endDate: nowDate.endOf('day'),
      label: '이번 분기'
    },
    
    [DATE_RANGE_PRESETS.LAST_QUARTER]: {
      startDate: nowDate.subtract(1, 'quarter').startOf('quarter'),
      endDate: nowDate.subtract(1, 'quarter').endOf('quarter'),
      label: '지난 분기'
    },
    
    [DATE_RANGE_PRESETS.THIS_YEAR]: {
      startDate: nowDate.startOf('year'),
      endDate: nowDate.endOf('day'),
      label: '올해'
    },
    
    [DATE_RANGE_PRESETS.LAST_YEAR]: {
      startDate: nowDate.subtract(1, 'year').startOf('year'),
      endDate: nowDate.subtract(1, 'year').endOf('year'),
      label: '작년'
    },
    
    [DATE_RANGE_PRESETS.LAST_7_DAYS]: {
      startDate: nowDate.subtract(6, 'day').startOf('day'),
      endDate: nowDate.endOf('day'),
      label: '최근 7일'
    },
    
    [DATE_RANGE_PRESETS.LAST_30_DAYS]: {
      startDate: nowDate.subtract(29, 'day').startOf('day'),
      endDate: nowDate.endOf('day'),
      label: '최근 30일'
    },
    
    [DATE_RANGE_PRESETS.LAST_90_DAYS]: {
      startDate: nowDate.subtract(89, 'day').startOf('day'),
      endDate: nowDate.endOf('day'),
      label: '최근 90일'
    },
    
    [DATE_RANGE_PRESETS.LAST_365_DAYS]: {
      startDate: nowDate.subtract(364, 'day').startOf('day'),
      endDate: nowDate.endOf('day'),
      label: '최근 1년'
    }
  };
  
  return ranges[preset] || ranges[DATE_RANGE_PRESETS.TODAY];
};

/**
 * 커스텀 날짜 범위 생성
 * @param {Object} options - 옵션
 * @param {number} options.amount - 수량
 * @param {string} options.unit - 단위 (day, week, month, year)
 * @param {string} options.direction - 방향 (past, future)
 * @param {string} timezone - 타임존
 * @returns {Object} { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }
 */
export const createCustomDateRange = ({ amount, unit, direction = 'past' }, timezone = DEFAULT_TIMEZONE) => {
  const nowDate = now(timezone);
  
  if (direction === 'past') {
    return {
      startDate: nowDate.subtract(amount - 1, unit).startOf('day'),
      endDate: nowDate.endOf('day')
    };
  } else {
    return {
      startDate: nowDate.startOf('day'),
      endDate: nowDate.add(amount - 1, unit).endOf('day')
    };
  }
};

/**
 * 날짜 범위를 API 호출용 파라미터로 변환
 * @param {dayjs.Dayjs} startDate - 시작 날짜
 * @param {dayjs.Dayjs} endDate - 종료 날짜
 * @param {string} timezone - 타임존
 * @returns {Object} { startDate: string, endDate: string }
 */
export const formatDateRangeForAPI = (startDate, endDate, timezone = DEFAULT_TIMEZONE) => {
  if (!startDate || !endDate) {
    return { startDate: null, endDate: null };
  }
  
  return {
    startDate: startDate.tz(timezone).format(DATE_FORMATS.API_FORMAT),
    endDate: endDate.tz(timezone).format(DATE_FORMATS.API_FORMAT)
  };
};

/**
 * 날짜 범위의 기간 계산
 * @param {dayjs.Dayjs} startDate - 시작 날짜
 * @param {dayjs.Dayjs} endDate - 종료 날짜
 * @returns {Object} { days: number, weeks: number, months: number }
 */
export const calculateDateRangeDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return { days: 0, weeks: 0, months: 0 };
  
  const duration = dayjs.duration(endDate.diff(startDate));
  
  return {
    days: Math.floor(duration.asDays()) + 1, // +1 because it's inclusive
    weeks: Math.floor(duration.asWeeks()),
    months: Math.floor(duration.asMonths())
  };
};

/**
 * 날짜 배열 생성 (범위 내 모든 날짜)
 * @param {dayjs.Dayjs} startDate - 시작 날짜
 * @param {dayjs.Dayjs} endDate - 종료 날짜
 * @param {string} unit - 단위 (day, week, month)
 * @returns {Array<dayjs.Dayjs>} 날짜 배열
 */
export const generateDateArray = (startDate, endDate, unit = 'day') => {
  if (!startDate || !endDate) return [];
  
  const dates = [];
  let current = startDate.startOf(unit);
  const end = endDate.endOf(unit);
  
  while (current.isSameOrBefore(end, unit)) {
    dates.push(current);
    current = current.add(1, unit);
  }
  
  return dates;
};

/**
 * 프리셋 옵션 목록 반환 (UI용)
 * @returns {Array} 프리셋 옵션 배열
 */
export const getPresetOptions = () => {
  return [
    { value: DATE_RANGE_PRESETS.TODAY, label: '오늘', category: 'recent' },
    { value: DATE_RANGE_PRESETS.YESTERDAY, label: '어제', category: 'recent' },
    { value: DATE_RANGE_PRESETS.LAST_7_DAYS, label: '최근 7일', category: 'recent' },
    { value: DATE_RANGE_PRESETS.LAST_30_DAYS, label: '최근 30일', category: 'recent' },
    { value: DATE_RANGE_PRESETS.THIS_WEEK, label: '이번 주', category: 'period' },
    { value: DATE_RANGE_PRESETS.LAST_WEEK, label: '지난 주', category: 'period' },
    { value: DATE_RANGE_PRESETS.THIS_MONTH, label: '이번 달', category: 'period' },
    { value: DATE_RANGE_PRESETS.LAST_MONTH, label: '지난 달', category: 'period' },
    { value: DATE_RANGE_PRESETS.THIS_QUARTER, label: '이번 분기', category: 'period' },
    { value: DATE_RANGE_PRESETS.LAST_QUARTER, label: '지난 분기', category: 'period' },
    { value: DATE_RANGE_PRESETS.THIS_YEAR, label: '올해', category: 'period' },
    { value: DATE_RANGE_PRESETS.LAST_YEAR, label: '작년', category: 'period' }
  ];
};

export default {
  // 기본 함수들
  now,
  createDate,
  formatDate,
  formatRelativeTime,
  validateDateRange,
  
  // 날짜 비교
  DateComparison,
  
  // 날짜 범위
  getDateRangeByPreset,
  createCustomDateRange,
  formatDateRangeForAPI,
  calculateDateRangeDuration,
  generateDateArray,
  
  // UI용
  getPresetOptions,
  
  // 상수들
  DATE_FORMATS,
  DATE_RANGE_PRESETS
};