import { useState, useCallback } from 'react';

/**
 * 테이블 들여쓰기 기능을 관리하는 훅
 * 계층형 테이블에서 들여쓰기 모드를 토글할 수 있습니다.
 * 
 * @param {boolean} initialIndentMode - 초기 들여쓰기 모드 상태 (기본값: true)
 * @returns {Object} 들여쓰기 상태 및 제어 함수
 */
export const useTableIndent = (initialIndentMode = true) => {
  // 들여쓰기 모드 상태
  const [indentMode, setIndentMode] = useState(initialIndentMode);
  
  // 들여쓰기 모드 토글 함수
  const toggleIndentMode = useCallback(() => {
    setIndentMode(prevMode => {
      const newMode = !prevMode;
      // console.log('들여쓰기 모드 토글: ', newMode ? '들여쓰기 적용' : '들여쓰기 해제');
      return newMode;
    });
  }, []);
  
  return {
    indentMode,
    toggleIndentMode
  };
};

export default useTableIndent; 