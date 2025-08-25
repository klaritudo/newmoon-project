import { useState, useEffect, useRef } from 'react';

/**
 * 테이블 높이 자동 조정 기능을 제공하는 훅
 * 
 * 이 훅은 테이블의 높이를 브라우저 창 크기에 맞게 자동으로 조정합니다.
 * 수동 모드에서는 사용자가 직접 높이를 설정할 수 있습니다.
 * Chrome의 CSS zoom 변경 시에도 자동으로 높이를 재계산합니다.
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
    
    // 현재 zoom 값 가져오기 (Chrome 전용)
    const getCurrentZoom = () => {
      const computedStyle = window.getComputedStyle(document.documentElement);
      const zoomValue = computedStyle.zoom;
      return zoomValue ? parseFloat(zoomValue) : 1;
    };
    
    // 테이블 높이를 계산하는 함수
    const calculateTableHeight = () => {
      if (!containerRef.current) return;
      
      // 브라우저 창 높이
      const windowHeight = window.innerHeight;
      
      // 현재 zoom 값 가져오기
      const currentZoom = getCurrentZoom();
      
      // 테이블 컨테이너의 상단 위치 계산 (zoom 영향 받음)
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top;
      
      // zoom 보정: containerTop은 이미 zoom이 적용되어 있으므로,
      // bottomMargin에만 zoom 보정 적용
      const adjustedBottomMargin = bottomMargin * currentZoom;
      
      // 테이블에 할당할 수 있는 최대 높이 계산
      const availableHeight = windowHeight - containerTop - adjustedBottomMargin;
      
      // 최소 높이 설정 (zoom 보정 적용)
      const adjustedMinHeight = minHeight * currentZoom;
      const newHeight = Math.max(availableHeight, adjustedMinHeight);
      
      setTableHeight(`${newHeight}px`);
    };
    
    // MediaQueryList를 사용한 zoom 변경 감지
    const mediaQueries = [];
    const zoomBreakpoints = [
      { query: '(max-width: 1920px)', handler: null },
      { query: '(min-width: 1921px) and (max-width: 2559px)', handler: null },
      { query: '(min-width: 2560px)', handler: null }
    ];
    
    // 각 미디어 쿼리에 대한 리스너 설정
    zoomBreakpoints.forEach(breakpoint => {
      const mql = window.matchMedia(breakpoint.query);
      
      // 이벤트 핸들러 생성
      const handler = (e) => {
        if (e.matches) {
          // zoom 변경이 완료될 때까지 약간의 지연
          setTimeout(calculateTableHeight, 100);
        }
      };
      
      breakpoint.handler = handler;
      
      // 리스너 등록 (Chrome은 addEventListener 지원)
      if (mql.addEventListener) {
        mql.addEventListener('change', handler);
      } else if (mql.addListener) {
        // 구형 브라우저 지원
        mql.addListener(handler);
      }
      
      mediaQueries.push({ mql, handler });
    });
    
    // 초기 높이 계산
    calculateTableHeight();
    
    // 창 크기 변경 이벤트 리스너 등록
    window.addEventListener('resize', calculateTableHeight);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', calculateTableHeight);
      
      // MediaQueryList 리스너 제거
      mediaQueries.forEach(({ mql, handler }) => {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', handler);
        } else if (mql.removeListener) {
          // 구형 브라우저 지원
          mql.removeListener(handler);
        }
      });
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