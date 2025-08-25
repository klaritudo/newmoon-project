/**
 * 테이블 설정을 localStorage에 저장하고 불러오는 유틸리티 함수들
 */

// 기본 키 접두사
const STORAGE_PREFIX = 'table_settings_';

/**
 * localStorage에서 값을 안전하게 가져오는 함수
 * @param {string} key - 저장소 키
 * @param {*} defaultValue - 기본값
 * @returns {*} 저장된 값 또는 기본값
 */
export const getStorageValue = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`localStorage에서 ${key} 읽기 실패:`, error);
    return defaultValue;
  }
};

/**
 * localStorage에 값을 안전하게 저장하는 함수
 * @param {string} key - 저장소 키
 * @param {*} value - 저장할 값
 */
export const setStorageValue = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn(`localStorage에 ${key} 저장 실패:`, error);
  }
};

/**
 * localStorage에서 값을 제거하는 함수
 * @param {string} key - 저장소 키
 */
export const removeStorageValue = (key) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.warn(`localStorage에서 ${key} 제거 실패:`, error);
  }
};

/**
 * 컬럼 표시 설정을 저장하는 함수
 * @param {string} tableId - 테이블 식별자
 * @param {Object} columnVisibility - 컬럼 표시 상태 객체
 */
export const saveColumnVisibility = (tableId, columnVisibility) => {
  setStorageValue(`column_visibility_${tableId}`, columnVisibility);
};

/**
 * 컬럼 표시 설정을 불러오는 함수
 * @param {string} tableId - 테이블 식별자
 * @param {Object} defaultVisibility - 기본 표시 상태
 * @returns {Object} 저장된 컬럼 표시 상태 또는 기본값
 */
export const loadColumnVisibility = (tableId, defaultVisibility = {}) => {
  return getStorageValue(`column_visibility_${tableId}`, defaultVisibility);
};

/**
 * 컬럼 순서를 저장하는 함수
 * @param {string} tableId - 테이블 식별자
 * @param {Array} columns - 컬럼 배열
 */
export const saveColumnOrder = (tableId, columns) => {
  setStorageValue(`column_order_${tableId}`, columns);
};

/**
 * 컬럼 순서를 불러오는 함수
 * @param {string} tableId - 테이블 식별자
 * @param {Array} defaultColumns - 기본 컬럼 배열
 * @returns {Array} 저장된 컬럼 순서 또는 기본값
 */
export const loadColumnOrder = (tableId, defaultColumns = []) => {
  return getStorageValue(`column_order_${tableId}`, defaultColumns);
};

/**
 * 고정 컬럼 설정을 저장하는 함수
 * @param {string} tableId - 테이블 식별자
 * @param {Array} pinnedColumns - 고정된 컬럼 ID 배열
 */
export const savePinnedColumns = (tableId, pinnedColumns) => {
  setStorageValue(`pinned_columns_${tableId}`, pinnedColumns);
};

/**
 * 고정 컬럼 설정을 불러오는 함수
 * @param {string} tableId - 테이블 식별자
 * @param {Array} defaultPinned - 기본 고정 컬럼 배열
 * @returns {Array} 저장된 고정 컬럼 배열 또는 기본값
 */
export const loadPinnedColumns = (tableId, defaultPinned = []) => {
  return getStorageValue(`pinned_columns_${tableId}`, defaultPinned);
};

/**
 * 특정 테이블의 모든 설정을 제거하는 함수
 * @param {string} tableId - 테이블 식별자
 */
export const clearTableSettings = (tableId) => {
  removeStorageValue(`column_visibility_${tableId}`);
  removeStorageValue(`column_order_${tableId}`);
  removeStorageValue(`pinned_columns_${tableId}`);
};

/**
 * 모든 테이블 설정을 제거하는 함수
 */
export const clearAllTableSettings = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('모든 테이블 설정 제거 실패:', error);
  }
}; 