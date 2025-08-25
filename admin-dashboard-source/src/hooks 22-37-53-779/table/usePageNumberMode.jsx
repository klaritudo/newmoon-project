import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * 페이지 번호 표시 방식 관리 훅
 * 연속 번호 또는 페이지별 번호 표시 모드를 관리
 * 
 * @param {Object} options 설정 옵션
 * @param {boolean} options.defaultSequentialMode 기본 연속 번호 모드 활성화 여부 (기본값: false)
 * @param {Object} options.gridRef AG Grid 참조 객체
 * @param {number} options.pageSize 페이지 크기
 * @param {number} options.page 현재 페이지 번호 (옵션)
 * @param {Function} options.onModeChange 모드 변경 시 호출될 콜백 함수 (옵션)
 * @returns {Object} 페이지 번호 모드 관련 상태 및 함수
 */
const usePageNumberMode = ({ 
  defaultSequentialMode = false,
  gridRef,
  pageSize,
  page = 0,
  onModeChange = null
}) => {
  // 연속 페이지 번호 표시 방식 상태
  const [sequentialPageNumbers, setSequentialPageNumbers] = useState(defaultSequentialMode);
  
  // 초기 로드 여부 확인 ref
  const isInitialLoadRef = useRef(false);
  
  // 그리드 셀 새로고침 함수
  const refreshNumberCells = useCallback(() => {
    if (gridRef?.current?.api) {
      try {
        gridRef.current.api.refreshCells({
          columns: ['rowNum'],
          force: true
        });
      } catch (error) {
        console.error('셀 새로고침 중 오류 발생:', error);
      }
    }
  }, [gridRef]);
  
  // 페이지 번호 방식 토글 함수
  const togglePageNumberMode = useCallback(() => {
    setSequentialPageNumbers(prev => {
      const newValue = !prev;
      // 콜백이 제공된 경우 호출
      if (onModeChange) {
        onModeChange(newValue);
      }
      return newValue;
    });
    
    // 토글 후 즉시 셀 새로고침
    setTimeout(() => {
      refreshNumberCells();
    }, 0);
  }, [refreshNumberCells, onModeChange]);

  // 상태 설정 함수 래핑하여 콜백 호출
  const setSequentialPageNumbersWithCallback = useCallback((newValue) => {
    setSequentialPageNumbers(newValue);
    if (onModeChange) {
      onModeChange(newValue);
    }
  }, [onModeChange]);
  
  /**
   * 현재 페이지 번호에 따른 행 번호 계산
   * @param {number} rowIndex 행 인덱스
   * @param {number} currentPage 현재 페이지 (0-based)
   * @param {number} size 페이지 크기
   * @returns {number} 계산된 행 번호
   */
  const calculateRowNumber = useCallback((rowIndex, currentPage = page, size = pageSize) => {
    if (!rowIndex && rowIndex !== 0) return '-';
    
    try {
      if (sequentialPageNumbers) {
        // 연속 번호 모드: 1부터 시작하는 연속 번호
        return (currentPage * size) + rowIndex + 1;
      } else {
        // 페이지별 번호 모드: 현재 페이지 내에서 1부터 시작
        return (rowIndex % size) + 1;
      }
    } catch (error) {
      console.error('행 번호 계산 중 오류 발생:', error);
      return '-';
    }
  }, [sequentialPageNumbers, page, pageSize]);
  
  // 페이지 번호 모드 변경 시 그리드 업데이트
  useEffect(() => {
    refreshNumberCells();
  }, [sequentialPageNumbers, refreshNumberCells]);
  
  // 페이지나 페이지 크기 변경 시 그리드 업데이트
  useEffect(() => {
    if (sequentialPageNumbers) {
      refreshNumberCells();
    }
  }, [page, pageSize, sequentialPageNumbers, refreshNumberCells]);
  
  // defaultSequentialMode가 변경될 때 상태 업데이트
  useEffect(() => {
    // 초기화 시에만 적용하고, 이후 변경은 무시
    if (defaultSequentialMode !== sequentialPageNumbers && !isInitialLoadRef.current) {
      isInitialLoadRef.current = true;
      setSequentialPageNumbers(defaultSequentialMode);
    }
  }, [defaultSequentialMode, sequentialPageNumbers]);
  
  // 반환 객체를 메모이제이션
  return useMemo(() => ({
    sequentialPageNumbers,
    setSequentialPageNumbers: setSequentialPageNumbersWithCallback,
    togglePageNumberMode,
    calculateRowNumber,
    refreshNumberCells
  }), [
    sequentialPageNumbers,
    setSequentialPageNumbersWithCallback,
    togglePageNumberMode,
    calculateRowNumber,
    refreshNumberCells
  ]);
};

export default usePageNumberMode; 