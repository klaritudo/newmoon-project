import { useState, useEffect, useRef } from 'react';

/**
 * 테이블 높이 자동 조정 기능을 제공하는 훅
 * 
 * 이 훅은 테이블의 높이를 브라우저 창 크기에 맞게 자동으로 조정합니다.
 * 수동 모드에서는 사용자가 직접 높이를 설정할 수 있습니다.
 * 
 * @param {Object} options - 설정 옵션
 * @param {string|number} options.defaultHeight - 기본 높이 (예: '400px', 400)
 * @param {boolean} options.defaultAutoHeight - 기본 자동 높이 조정 활성화 여부
 * @param {number} options.minHeight - 최소 높이 (px)
 * @param {number} options.bottomMargin - 하단 여백 (px)
 * @returns {Object} 테이블 높이 관련 객체와 함수들
 */
const useTableAutoHeight = ({
  defaultHeight = '400px',
  defaultAutoHeight = true,
  minHeight = 300,
  bottomMargin = 100
} = {}) => {
  // 초기 높이 설정 (문자열이 아니면 px 단위 추가)
  const initialHeight = typeof defaultHeight === 'string' 
    ? defaultHeight 
    : `${defaultHeight}px`;
  
  // 테이블 컨테이너에 대한 ref
  const containerRef = useRef(null);
  
  // 테이블 높이 상태
  const [tableHeight, setTableHeight] = useState(initialHeight);
  
  // 자동 높이 조정 설정
  const [autoHeight, setAutoHeight] = useState(defaultAutoHeight);
  
  // 화면 크기에 따라 테이블 높이 자동 조정
  useEffect(() => {
    if (!autoHeight) return;
    
    // 테이블 높이를 계산하는 함수
    const calculateTableHeight = () => {
      if (!containerRef.current) return;
      
      // 브라우저 창 높이
      const windowHeight = window.innerHeight;
      
      // 테이블 컨테이너의 상단 위치 계산
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top;
      
      // 테이블에 할당할 수 있는 최대 높이 계산
      const availableHeight = windowHeight - containerTop - bottomMargin;
      
      // 최소 높이 설정 (너무 작아지지 않게)
      const newHeight = Math.max(availableHeight, minHeight);
      
      setTableHeight(`${newHeight}px`);
    };
    
    // 초기 높이 계산
    calculateTableHeight();
    
    // 창 크기 변경 이벤트 리스너 등록
    window.addEventListener('resize', calculateTableHeight);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', calculateTableHeight);
    };
  }, [autoHeight, minHeight, bottomMargin]);
  
  // 컴포넌트 마운트 후 자동 높이 재계산 트리거
  useEffect(() => {
    if (autoHeight) {
      // DOM이 완전히 렌더링된 후 자동 높이 재계산
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [autoHeight]);
  
  /**
   * 자동 높이 조정을 설정하거나 해제하는 함수
   * @param {boolean} [isAuto] - 자동 높이 조정 활성화 여부 (생략 시 현재 상태 반전)
   */
  const toggleAutoHeight = (isAuto) => {
    const newValue = isAuto !== undefined ? isAuto : !autoHeight;
    setAutoHeight(newValue);
  };
  
  /**
   * 테이블 높이를 수동으로 설정하는 함수
   * @param {string|number} height - 설정할 높이 값 (예: '500px', 500)
   */
  const setManualHeight = (height) => {
    // 숫자로 전달된 경우 px 단위 추가
    const formattedHeight = typeof height === 'number' 
      ? `${height}px` 
      : height;
    
    setTableHeight(formattedHeight);
  };
  
  return {
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight
  };
};

export default useTableAutoHeight; 