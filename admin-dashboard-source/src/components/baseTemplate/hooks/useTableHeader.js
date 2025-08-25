import { useState, useCallback, useEffect } from 'react';

/**
 * TableHeader 컴포넌트와 함께 사용하는 커스텀 훅
 * 
 * 테이블 헤더 관련 상태와 핸들러를 관리합니다.
 * 
 * @param {Object} options
 * @param {string} options.initialSearchText - 초기 검색어
 * @param {number} options.initialTotalItems - 초기 총 항목 수 
 * @param {boolean} options.initialIndentMode - 초기 들여쓰기 모드 상태
 * @param {boolean} options.initialSequentialPageNumbers - 초기 연속 페이지 번호 모드 상태
 * @param {boolean} options.initialHasPinnedColumns - 초기 고정된 컬럼 존재 여부
 * @param {Function} options.onSearch - 검색 이벤트 핸들러
 * @param {Function} options.onToggleIndentMode - 들여쓰기 모드 토글 이벤트 핸들러
 * @param {Function} options.onTogglePageNumberMode - 페이지 번호 모드 토글 이벤트 핸들러
 * @param {Function} options.onToggleColumnPin - 컬럼 고정 토글 이벤트 핸들러
 * @returns {Object} 테이블 헤더 관련 상태 및 핸들러
 */
const useTableHeader = ({
  initialSearchText = '',
  initialTotalItems = 0,
  initialIndentMode = true,
  initialSequentialPageNumbers = false,
  initialHasPinnedColumns = false,
  onSearch,
  onToggleIndentMode,
  onTogglePageNumberMode,
  onToggleColumnPin,
  tableId = 'table' // 테이블별 고유 ID 추가
} = {}) => {
  // 로컬 스토리지 키
  const storageKey = `tableHeader_${tableId}_pageNumbers`;
  
  // 로컬 스토리지에서 저장된 값 불러오기
  const getStoredSequentialPageNumbers = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      const result = stored !== null ? JSON.parse(stored) : initialSequentialPageNumbers;
      // console.log(`[${tableId}] 로컬 스토리지 페이지 번호 모드:`, {
      //   storageKey,
      //   stored,
      //   initialSequentialPageNumbers,
      //   result
      // });
      return result;
    } catch (error) {
      // console.warn('로컬 스토리지에서 페이지 번호 모드 불러오기 실패:', error);
      return initialSequentialPageNumbers;
    }
  };
  
  // 상태 관리
  const [searchText, setSearchText] = useState(initialSearchText);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [indentMode, setIndentMode] = useState(initialIndentMode);
  const [sequentialPageNumbers, setSequentialPageNumbers] = useState(() => {
    const initialValue = getStoredSequentialPageNumbers();
    // console.log(`[${tableId}] sequentialPageNumbers 초기값 설정:`, initialValue);
    return initialValue;
  });
  const [hasPinnedColumns, setHasPinnedColumns] = useState(initialHasPinnedColumns);
  const [isGridReady, setIsGridReady] = useState(false);
  // 초기 렌더링 여부를 추적하기 위한 플래그
  const [isInitialRender, setIsInitialRender] = useState(true);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((event) => {
    const newValue = event.target.value;
    // console.log(`검색 입력 변경: "${newValue}"`); // 디버깅을 위한 로그 추가
    setSearchText(newValue);
    
    if (onSearch) {
      onSearch(newValue);
    }
  }, [onSearch]);

  // 검색어 초기화 핸들러
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  // 들여쓰기 모드 토글 핸들러
  const toggleIndentMode = useCallback(() => {
    const newIndentMode = !indentMode;
    setIndentMode(newIndentMode);
    
    if (onToggleIndentMode) {
      onToggleIndentMode(newIndentMode);
    }
  }, [indentMode, onToggleIndentMode]);

  // 페이지 번호 모드 토글 핸들러
  const togglePageNumberMode = useCallback(() => {
    const newSequentialPageNumbers = !sequentialPageNumbers;
    // console.log(`[${tableId}] 페이지 번호 모드 토글:`, {
    //   from: sequentialPageNumbers,
    //   to: newSequentialPageNumbers,
    //   storageKey
    // });
    setSequentialPageNumbers(newSequentialPageNumbers);
    
    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(storageKey, JSON.stringify(newSequentialPageNumbers));
      // console.log(`[${tableId}] 로컬 스토리지에 저장 완료:`, newSequentialPageNumbers);
    } catch (error) {
      // console.warn('로컬 스토리지에 페이지 번호 모드 저장 실패:', error);
    }
    
    if (onTogglePageNumberMode) {
      onTogglePageNumberMode(newSequentialPageNumbers);
    }
  }, [sequentialPageNumbers, onTogglePageNumberMode, storageKey, tableId]);

  // 컬럼 고정 토글 핸들러
  const toggleColumnPin = useCallback(() => {
    const newHasPinnedColumns = !hasPinnedColumns;
    setHasPinnedColumns(newHasPinnedColumns);
    
    if (onToggleColumnPin) {
      onToggleColumnPin(newHasPinnedColumns);
    }
  }, [hasPinnedColumns, onToggleColumnPin]);

  // 그리드 준비 상태 설정 - 그리드 API가 사용 가능해지면 호출해야 함
  const setGridReady = useCallback((ready) => {
    setIsGridReady(ready);
  }, []);

  // 총 항목 수 업데이트 함수
  const updateTotalItems = useCallback((count) => {
    setTotalItems(count);
  }, []);

  // 초기값 변경 시 상태 업데이트 (첫 렌더링 시에만)
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);

  // totalItems만 업데이트하는 effect
  useEffect(() => {
    if (initialTotalItems !== totalItems) {
      setTotalItems(initialTotalItems);
    }
  }, [initialTotalItems, totalItems]);

  // 초기 검색어는 최초 렌더링 시에만 적용
  useEffect(() => {
    if (isInitialRender && initialSearchText) {
      setSearchText(initialSearchText);
    }
  }, [initialSearchText, isInitialRender]);

  return {
    // 상태
    searchText,
    totalItems,
    indentMode,
    sequentialPageNumbers,
    hasPinnedColumns,
    isGridReady,
    
    // 핸들러
    handleSearchChange,
    handleClearSearch,
    toggleIndentMode,
    togglePageNumberMode,
    toggleColumnPin,
    
    // 상태 업데이트 함수
    setGridReady,
    updateTotalItems,
    setHasPinnedColumns
  };
};

export default useTableHeader; 