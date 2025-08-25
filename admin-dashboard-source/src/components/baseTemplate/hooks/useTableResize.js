import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * 테이블 리사이즈 기능을 제공하는 훅
 * 
 * 이 훅은 테이블의 높이를 사용자가 직접 드래그하여 조정할 수 있는 기능을 제공합니다.
 * useTableAutoHeight 훅과 함께 사용될 수 있으며, 완전히 독립적으로도 사용 가능합니다.
 * 
 * @param {Object} options - 설정 옵션
 * @param {number} options.minHeight - 최소 높이 (px) 기본값: 200
 * @param {number|null} options.maxHeight - 최대 높이 (px) 기본값: null (제한 없음), 숫자 설정 시 해당 값으로 제한
 * @param {boolean} options.useViewportLimit - 뷰포트 기반 최대 높이 제한 사용 여부 기본값: true
 * @param {number} options.viewportMargin - 뷰포트 기반 제한 시 하단 여백 기본값: 100
 * @param {Function} options.onResize - 리사이즈 중 콜백 함수
 * @param {Function} options.onResizeEnd - 리사이즈 완료 콜백 함수
 * @returns {Object} 테이블 리사이즈 관련 객체와 함수들
 */
const useTableResize = ({
  minHeight = 200,
  maxHeight = null,
  useViewportLimit = true,
  viewportMargin = 100,
  onResize = null,
  onResizeEnd = null
} = {}) => {
  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false);
  
  // 리사이즈 핸들에 대한 ref
  const resizeHandleRef = useRef(null);
  
  // 드래그 시작 정보를 저장할 ref
  const dragStartInfo = useRef({
    startY: 0,
    startHeight: 0
  });
  
  // 동적 최대 높이 계산 함수
  const calculateMaxHeight = useCallback(() => {
    // 사용자가 명시적으로 maxHeight를 설정한 경우 해당 값 사용
    if (maxHeight !== null) {
      return maxHeight;
    }
    
    // 뷰포트 기반 제한을 사용하는 경우
    if (useViewportLimit) {
      return window.innerHeight - viewportMargin;
    }
    
    // 제한 없음
    return Infinity;
  }, [maxHeight, useViewportLimit, viewportMargin]);
  
  // 마우스 이벤트 핸들러들
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStartInfo.current) return;
    
    const deltaY = e.clientY - dragStartInfo.current.startY;
    let newHeight = dragStartInfo.current.startHeight + deltaY;
    
    // 동적 최대 높이 계산
    const currentMaxHeight = calculateMaxHeight();
    
    // 최소/최대 높이 제한
    newHeight = Math.max(minHeight, Math.min(currentMaxHeight, newHeight));
    
    // 리사이즈 콜백 호출
    if (onResize) {
      onResize(newHeight);
    }
  }, [isDragging, minHeight, calculateMaxHeight, onResize]);
  
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // 리사이즈 완료 콜백 호출
      if (onResizeEnd) {
        onResizeEnd();
      }
    }
  }, [isDragging, onResizeEnd]);
  
  // 전역 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  /**
   * 리사이즈 시작 핸들러
   * @param {Event} e - 마우스 이벤트
   * @param {number} currentHeight - 현재 테이블 높이
   */
  const startResize = useCallback((e, currentHeight) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartInfo.current = {
      startY: e.clientY,
      startHeight: currentHeight
    };
    
    setIsDragging(true);
  }, []);
  
  /**
   * 리사이즈 핸들 props를 생성하는 함수
   * @param {number} currentHeight - 현재 테이블 높이
   * @returns {Object} 리사이즈 핸들에 전달할 props
   */
  const getResizeHandleProps = useCallback((currentHeight) => {
    return {
      ref: resizeHandleRef,
      onMouseDown: (e) => startResize(e, currentHeight),
      style: {
        height: '8px',
        cursor: 'ns-resize',
        backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        transition: 'background-color 0.2s',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    };
  }, [startResize, isDragging]);
  
  return {
    isDragging,
    resizeHandleRef,
    getResizeHandleProps,
    calculateMaxHeight
  };
};

export default useTableResize;