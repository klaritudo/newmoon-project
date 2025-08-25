import React from 'react';
import PropTypes from 'prop-types';
import { usePermission } from '../hooks/usePermission';

/**
 * 권한 기반 UI 요소 표시/숨김 컴포넌트
 */
export const PermissionGuard = ({ 
  children, 
  menuId, 
  buttonId, 
  layoutId, 
  cssSelector,
  permission,
  fallback = null,
  hideCompletely = true 
}) => {
  const { 
    canAccessMenu, 
    canUseButton, 
    canViewLayout, 
    canShowElement,
    hasPermission 
  } = usePermission();
  
  // 권한 체크
  let hasAccess = true;
  
  if (menuId) {
    hasAccess = canAccessMenu(menuId);
  } else if (buttonId) {
    hasAccess = canUseButton(buttonId);
  } else if (layoutId) {
    hasAccess = canViewLayout(layoutId);
  } else if (cssSelector) {
    hasAccess = canShowElement(cssSelector);
  } else if (permission) {
    hasAccess = hasPermission(permission);
  }
  
  // 권한이 없는 경우
  if (!hasAccess) {
    if (hideCompletely) {
      return null; // 완전히 숨김
    }
    return fallback; // 대체 컴포넌트 표시
  }
  
  // 권한이 있는 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  menuId: PropTypes.string,
  buttonId: PropTypes.string,
  layoutId: PropTypes.string,
  cssSelector: PropTypes.string,
  permission: PropTypes.string,
  fallback: PropTypes.node,
  hideCompletely: PropTypes.bool
};

/**
 * 버튼 권한 가드 컴포넌트
 */
export const ButtonPermissionGuard = ({ children, buttonId, ...props }) => {
  const { canUseButton } = usePermission();
  
  if (!canUseButton(buttonId)) {
    // 버튼을 비활성화하거나 숨김
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        disabled: true,
        title: '이 기능을 사용할 권한이 없습니다.'
      });
    }
    return null;
  }
  
  return children;
};

ButtonPermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  buttonId: PropTypes.string.isRequired
};

/**
 * 메뉴 권한 가드 컴포넌트
 */
export const MenuPermissionGuard = ({ children, menuId }) => {
  const { canAccessMenu } = usePermission();
  
  if (!canAccessMenu(menuId)) {
    return null; // 메뉴 항목을 완전히 숨김
  }
  
  return children;
};

MenuPermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  menuId: PropTypes.string.isRequired
};

export default PermissionGuard;