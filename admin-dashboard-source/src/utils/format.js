/**
 * 숫자를 통화 형식으로 포맷팅하는 함수
 * @param {number} amount - 포맷팅할 숫자
 * @param {string} locale - 지역 설정 (기본값: ko-KR)
 * @param {string} currency - 통화 기호 (기본값: KRW)
 * @returns {string} 포맷팅된 통화 문자열
 */
export const formatMoney = (amount, locale = 'ko-KR', currency = 'KRW') => {
  if (amount === undefined || amount === null) return '0';
  
  // 숫자가 아닌 경우 0으로 반환
  if (isNaN(amount)) return '0';
  
  // 로케일과 통화 기호를 사용하지 않고 단순 숫자 포맷팅
  return amount.toLocaleString(locale);
}; 