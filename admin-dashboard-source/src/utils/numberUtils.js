/**
 * 숫자 포맷팅 유틸리티 함수
 */

/**
 * 숫자를 통화 형식으로 포맷팅하는 함수
 * @param {number} value - 포맷팅할 숫자
 * @param {boolean} showPlus - 양수 앞에 + 기호를 표시할지 여부
 * @returns {string} 포맷팅된 문자열
 */
export const formatNumber = (value, showPlus = false) => {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // 특수한 값 처리
  if (isNaN(numValue)) return '0';
  if (!isFinite(numValue)) return numValue > 0 ? '∞' : '-∞';
  
  // 포맷팅 옵션
  const options = {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  // 한국어 로케일로 숫자 포맷팅
  const formatted = numValue.toLocaleString('ko-KR', options);
  
  // 숫자 값에 따라 색상 클래스 추가
  if (numValue > 0) {
    return showPlus ? `+${formatted}` : formatted;
  } else if (numValue < 0) {
    return formatted; // 음수는 자동으로 - 기호가 포함됨
  } else {
    return '0';
  }
};

/**
 * 퍼센트 값을 포맷팅하는 함수
 * @param {number} value - 포맷팅할 퍼센트 값 (예: 0.75)
 * @param {number} decimalPlaces - 소수점 자리수 (기본값: 2)
 * @returns {string} 포맷팅된 퍼센트 문자열
 */
export const formatPercent = (value, decimalPlaces = 2) => {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // 특수한 값 처리
  if (isNaN(numValue)) return '0%';
  if (!isFinite(numValue)) return numValue > 0 ? '∞%' : '-∞%';
  
  // 포맷팅 옵션
  const options = {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  };
  
  // 한국어 로케일로 퍼센트 포맷팅
  return numValue.toLocaleString('ko-KR', options);
};

/**
 * 숫자의 부호에 따라 클래스 이름을 반환하는 함수
 * @param {number} value - 체크할 숫자 값
 * @returns {string} 클래스 이름 ('positive-amount', 'negative-amount' 또는 '')
 */
export const getAmountColorClass = (value) => {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  if (numValue > 0) {
    return 'positive-amount';
  } else if (numValue < 0) {
    return 'negative-amount';
  }
  
  return '';
};

/**
 * 숫자의 부호를 표시하는 함수
 * @param {number} value - 부호를 가져올 숫자
 * @returns {string} 양수: '+', 음수: '-', 0: ''
 */
export const getSign = (value) => {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  if (numValue > 0) {
    return '+';
  } else if (numValue < 0) {
    return '-';
  }
  
  return '';
}; 