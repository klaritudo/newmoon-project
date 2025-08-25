/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param {string|Date} dateValue - 날짜 값 (ISO string with/without 'Z', Date object)
 * @param {boolean} includeTime - 시간 포함 여부 (기본값: true)
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDateKorean = (dateValue, includeTime = true) => {
  if (!dateValue) return '-';
  
  try {
    let date;
    
    if (typeof dateValue === 'string') {
      // MySQL datetime 형식 (YYYY-MM-DD HH:mm:ss) 체크
      if (dateValue.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        // DB에 이미 KST로 저장되어 있으므로 그대로 사용
        const [datePart, timePart] = dateValue.split(' ');
        date = new Date(`${datePart}T${timePart}`); // 로컬 시간으로 파싱
      } 
      // ISO 문자열에 'Z'가 있으면 UTC로 처리
      else if (dateValue.includes('T') && dateValue.includes('Z')) {
        date = new Date(dateValue);
        // Date 객체는 자동으로 로컬 시간대로 변환되므로 추가 변환 불필요
      }
      // 그 외의 경우 그대로 처리
      else {
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue);
    }
    
    // Invalid date check
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    // 수동으로 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @param {string|Date} dateValue - 날짜 값
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDateISO = (dateValue) => {
  if (!dateValue) return '-';
  
  try {
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * 날짜를 YYYY-MM-DD HH:mm:ss 형식으로 포맷팅
 * @param {string|Date} dateValue - 날짜 값
 * @returns {string} YYYY-MM-DD HH:mm:ss 형식의 날짜 문자열
 */
export const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  
  try {
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    // 수동으로 포맷팅 (로컬 시간대 사용)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * 상대적인 시간 표시 (예: 5분 전, 1시간 전)
 * @param {string|Date} dateValue - 날짜 값
 * @returns {string} 상대적인 시간 문자열
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '-';
  
  try {
    const date = new Date(dateValue);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay}일 전`;
    } else if (diffHour > 0) {
      return `${diffHour}시간 전`;
    } else if (diffMin > 0) {
      return `${diffMin}분 전`;
    } else {
      return '방금 전';
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '-';
  }
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} 오늘 날짜
 */
export const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * 당월 1일 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} 당월 1일 날짜
 */
export const getMonthFirstDate = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
};

/**
 * 이번 주 월요일 날짜를 YYYY-MM-DD 형식으로 반환
 * 단, 당월 1일 이전이면 당월 1일을 반환 (요구사항)
 * @returns {string} 이번 주 월요일 또는 당월 1일
 */
export const getWeekStartDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  
  const monthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // 월요일이 당월 1일보다 이전이면 당월 1일 반환
  if (monday < monthFirst) {
    return monthFirst.toISOString().split('T')[0];
  }
  
  return monday.toISOString().split('T')[0];
};

/**
 * 기간별 시작일과 종료일 계산
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {{startDate: string, endDate: string}} 시작일과 종료일
 */
export const getDateRangeByPeriod = (period) => {
  const today = getToday();
  
  switch (period) {
    case 'daily':
      return {
        startDate: today,
        endDate: today
      };
      
    case 'weekly':
      // 주별: 당월 1일 또는 이번 주 월요일부터 오늘까지
      return {
        startDate: getWeekStartDate(),
        endDate: today
      };
      
    case 'monthly':
      // 월별: 당월 1일부터 오늘까지
      return {
        startDate: getMonthFirstDate(),
        endDate: today
      };
      
    default:
      // 기본값: 일별 (오늘)
      return {
        startDate: today,
        endDate: today
      };
  }
};