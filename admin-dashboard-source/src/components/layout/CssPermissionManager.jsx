import { useEffect, useState } from 'react';
import { usePermission } from '../../hooks/usePermission';

/**
 * CSS 선택자 기반 권한 관리 컴포넌트
 * restrictions.cssSelectors에 포함된 CSS 선택자에 해당하는 요소들을 숨김
 */
const CssPermissionManager = () => {
  const [, forceUpdate] = useState({});
  const { permissions } = usePermission();

  // 권한 변경 시 강제 리렌더링
  useEffect(() => {
    const handlePermissionsUpdate = () => {
      console.log('CssPermissionManager: 권한이 업데이트되어 리렌더링합니다.');
      forceUpdate({});
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionsUpdate);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate);
    };
  }, []);

  useEffect(() => {
    if (!permissions?.restrictions?.cssSelectors) return;

    const cssSelectors = permissions.restrictions.cssSelectors;
    
    // 각 CSS 선택자에 대해 스타일 적용
    const styleId = 'permission-css-restrictions';
    let styleElement = document.getElementById(styleId);
    
    // 기존 스타일 요소가 있으면 제거
    if (styleElement) {
      styleElement.remove();
    }
    
    // CSS 선택자가 있을 때만 스타일 생성
    if (cssSelectors.length > 0) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      
      // 각 선택자를 display: none으로 설정
      const cssRules = cssSelectors.map(selector => {
        // 안전을 위해 선택자 검증 (기본적인 검증만)
        const cleanSelector = selector.trim();
        if (!cleanSelector) return '';
        
        return `${cleanSelector} { display: none !important; }`;
      }).filter(rule => rule).join('\n');
      
      styleElement.textContent = cssRules;
      document.head.appendChild(styleElement);
      
      console.log('CSS 권한 적용됨:', cssSelectors);
    }
    
    // 클린업: 컴포넌트 언마운트 시 스타일 제거
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [permissions?.restrictions?.cssSelectors]);

  return null;
};

export default CssPermissionManager;