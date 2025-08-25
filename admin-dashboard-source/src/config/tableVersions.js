/**
 * 테이블 컬럼 버전 관리
 * 
 * 각 테이블의 컬럼 정의가 변경될 때마다 버전을 업데이트합니다.
 * 버전이 변경되면 해당 테이블의 localStorage 캐시가 자동으로 초기화됩니다.
 * 
 * 버전 형식: 'major.minor.patch'
 * - major: 전체 구조 변경 (컬럼 추가/삭제)
 * - minor: 기능 변경 (타입 변경, 너비 조정 등)
 * - patch: 버그 수정 (오타 수정 등)
 * 
 * 사용 예시:
 * 1. 컬럼 추가: 1.0.0 → 2.0.0
 * 2. 타입 변경: 1.0.0 → 1.1.0
 * 3. 너비 조정: 1.0.0 → 1.1.0
 * 4. 라벨 수정: 1.0.0 → 1.0.1
 */

export const TABLE_VERSIONS = {
  // 에이전트 관리
  members_table: '1.1.0', // registrationDate type 변경 (date → datetime)
  rolling_history_table: '1.0.0',
  username_change_history_table: '1.0.0',
  money_transfer_table: '1.0.0',
  
  // 거래 관리
  transaction_history_table: '1.0.0',
  deposit_table: '1.0.0',
  withdrawal_table: '1.0.0',
  money_history_table: '1.0.0',
  
  // 정산 관리
  today_settlement_table: '1.0.0',
  member_settlement_table: '1.0.0',
  third_party_settlement_table: '1.0.0',
  daily_settlement_table: '1.0.0',
  
  // 게임 설정
  slot_setting_table: '1.0.0',
  casino_setting_table: '1.0.0',
  
  // 베팅 관리
  slot_casino_betting_table: '1.0.0',
  
  // 사이트 설정
  agent_level_table: '1.0.0',
  permission_table: '1.0.0',
  change_username_table: '1.0.0',
  
  // 고객 서비스
  messages_table: '1.0.0',
  templates_table: '1.0.0',
  sent_messages_table: '1.0.0',
  
  // 게시판 관리
  notices_table: '1.0.0',
  events_table: '1.0.0',
  popup_table: '1.0.0',
};

/**
 * 테이블 버전 가져오기
 * @param {string} tableId - 테이블 ID
 * @returns {string} 버전 문자열
 */
export const getTableVersion = (tableId) => {
  return TABLE_VERSIONS[tableId] || '1.0.0';
};

/**
 * 모든 테이블의 localStorage 캐시 초기화
 */
export const clearAllTableCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    // 테이블 관련 키만 삭제
    if (key.includes('table_settings_') || 
        key.includes('column_visibility_') ||
        key.includes('column_order_') ||
        key.includes('pinned_columns_') ||
        key.includes('table_version_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('모든 테이블 캐시가 초기화되었습니다.');
};

/**
 * 특정 테이블의 localStorage 캐시 초기화
 * @param {string} tableId - 테이블 ID
 */
export const clearTableCache = (tableId) => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(`_${tableId}`)) {
      localStorage.removeItem(key);
    }
  });
  console.log(`테이블 ${tableId}의 캐시가 초기화되었습니다.`);
};