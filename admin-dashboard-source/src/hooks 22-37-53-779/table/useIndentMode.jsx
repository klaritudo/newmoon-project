import { useState, useCallback, useEffect } from 'react';

/**
 * 들여쓰기 모드 관리 훅
 * 테이블의 들여쓰기 모드(계층형 표시) 기능을 관리
 * 
 * @param {Object} options 설정 옵션
 * @param {boolean} options.defaultIndentMode 기본 들여쓰기 모드 활성화 여부 (기본값: true)
 * @param {Object} options.gridRef AG Grid의 ref 객체 (옵션)
 * @param {string} options.storageKey 로컬 스토리지에 저장할 때 사용할 키 (기본값: 'indentMode')
 * @param {boolean} options.persistState 상태 저장 여부 (기본값: true)
 * @returns {Object} 들여쓰기 모드 관련 상태 및 함수
 */
const useIndentMode = ({
  defaultIndentMode = true,
  gridRef = null,
  storageKey = 'indentMode',
  persistState = true
} = {}) => {
  // 로컬 스토리지에서 저장된 설정 불러오기
  const loadSavedMode = useCallback(() => {
    if (!persistState) return defaultIndentMode;
    
    try {
      const savedMode = localStorage.getItem(storageKey);
      if (savedMode !== null) {
        return savedMode === 'true';
      }
    } catch (err) {
      console.error('들여쓰기 모드 설정 불러오기 오류:', err);
    }
    
    return defaultIndentMode;
  }, [defaultIndentMode, storageKey, persistState]);

  // 상태 초기화 (저장된 값 또는 기본값)
  const [indentMode, setIndentMode] = useState(loadSavedMode);

  // 들여쓰기 모드 토글 함수
  const toggleIndentMode = useCallback(() => {
    setIndentMode(prevMode => {
      const newMode = !prevMode;
      
      // 로컬 스토리지에 설정 저장
      if (persistState) {
        try {
          localStorage.setItem(storageKey, String(newMode));
        } catch (err) {
          console.error('들여쓰기 모드 설정 저장 오류:', err);
        }
      }
      
      // 그리드가 있으면 셀 새로고침
      if (gridRef?.current?.api) {
        setTimeout(() => {
          gridRef.current.api.refreshCells({ force: true });
        }, 0);
      }
      
      return newMode;
    });
  }, [gridRef, storageKey, persistState]);

  // 그리드 업데이트 함수
  const updateGridWithIndentMode = useCallback(() => {
    if (gridRef?.current?.api) {
      gridRef.current.api.refreshCells({ force: true });
    }
  }, [gridRef]);

  // 컴포넌트 마운트 시 또는 의존성 변경 시 그리드 업데이트
  useEffect(() => {
    if (gridRef?.current?.api) {
      updateGridWithIndentMode();
    }
  }, [indentMode, gridRef, updateGridWithIndentMode]);

  return {
    indentMode,
    setIndentMode,
    toggleIndentMode,
    updateGridWithIndentMode
  };
};

export default useIndentMode; 