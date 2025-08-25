import { useRef, useCallback } from 'react';

/**
 * 테이블 헤더 행 고정 기능을 제공하는 훅
 * 
 * 이 훅은 테이블의 헤더 행을 스크롤 시 상단에 고정시키는 기능을 제공합니다.
 * Material-UI의 stickyHeader 속성과 함께 사용하도록 설계되었습니다.
 * 
 * @param {Object} options - 설정 옵션
 * @param {number} options.offsetTop - 헤더가 고정될 때 상단으로부터의 오프셋(px)
 * @param {number} options.zIndex - 고정된 헤더의 z-index 값
 * @param {string} options.bgColor - 헤더 배경색
 * @param {string} options.boxShadow - 헤더 그림자 효과
 * @returns {Object} 테이블 헤더 고정 관련 객체와 함수들
 */
const useTableHeaderFixed = ({
  offsetTop = 0,
  zIndex = 10,
  bgColor = 'white',
  boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'
} = {}) => {
  // 테이블 헤더에 대한 ref
  const tableHeaderRef = useRef(null);
  
  /**
   * 테이블 헤더 스타일을 반환하는 함수
   * @returns {Object} 헤더에 적용할 스타일 객체
   */
  const getTableHeaderStyles = useCallback(() => {
    return {
      position: 'sticky',  // MUI Table의 stickyHeader와 함께 작동
      top: `${offsetTop}px`,
      zIndex: zIndex,
      backgroundColor: bgColor,
      boxShadow: boxShadow
    };
  }, [offsetTop, zIndex, bgColor, boxShadow]);
  
  /**
   * 테이블 헤더 셀 스타일을 반환하는 함수
   * @param {Object} defaultStyles - 기본 스타일 (병합됨)
   * @returns {Object} 헤더 셀에 적용할 스타일 객체
   */
  const getHeaderCellStyles = useCallback((defaultStyles = {}) => {
    return {
      ...defaultStyles,
      position: 'sticky',
      top: `${offsetTop}px`,
      zIndex: zIndex - 1,
      backgroundColor: bgColor
    };
  }, [offsetTop, zIndex, bgColor]);
  
  return {
    // ref
    tableHeaderRef,
    
    // 스타일 getter 함수들
    getTableHeaderStyles,
    getHeaderCellStyles
  };
};

export default useTableHeaderFixed; 