import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PERMISSION_TYPES, PERMISSION_LABELS, hasPermission as checkPermission, canAccessFeature } from '../constants/permissions';

/**
 * 권한 체크 훅
 * 현재 사용자의 권한을 확인하고 UI 요소 표시 여부를 결정
 */
export const usePermission = () => {
  const user = useSelector((state) => state.auth.user);
  
  // Redux에 저장된 권한 정보 사용 (로그인 시 한 번만 로드됨)
  const userPermissions = useMemo(() => {
    if (!user) return null;
    
    // user 객체에 permissions가 있으면 사용, 없으면 기본 권한 구조 반환
    return user.permissions || {
      menus: [],
      buttons: [],
      features: [],
      restrictions: {
        menus: [],
        buttons: [],
        layouts: [],
        cssSelectors: []
      }
    };
  }, [user]);
  
  /**
   * 메뉴 접근 권한 체크
   * @param {string} menuId - 메뉴 ID
   * @returns {boolean} 접근 가능 여부
   */
  const canAccessMenu = (menuId) => {
    if (!userPermissions) return false;
    
    // 마스터 계정은 모든 메뉴 접근 가능
    if (user?.role === 'master' || user?.agent_level_id === 999 || user?.agent_level_id === 1) return true;
    
    // 제한된 메뉴인지 먼저 확인 (restrictions가 최우선)
    if (userPermissions.restrictions?.menus?.includes(menuId)) return false;
    
    // 모든 권한을 가진 경우
    if (userPermissions.menus?.includes('*')) return true;
    
    // 허용된 메뉴인지 확인
    return userPermissions.menus?.includes(menuId);
  };
  
  /**
   * 버튼/기능 사용 권한 체크
   * @param {string} buttonId - 버튼/기능 ID
   * @returns {boolean} 사용 가능 여부
   */
  const canUseButton = (buttonId) => {
    if (!userPermissions) return false;
    
    // 마스터 계정은 모든 버튼 사용 가능
    if (user?.role === 'master' || user?.agent_level_id === 999 || user?.agent_level_id === 1) return true;
    
    // 제한된 버튼인지 먼저 확인 (restrictions가 최우선)
    const isRestricted = userPermissions.restrictions?.buttons?.includes(buttonId);
    if (isRestricted) return false;
    
    // 모든 권한을 가진 경우
    if (userPermissions.buttons?.includes('*')) return true;
    
    // 허용된 버튼인지 확인
    return userPermissions.buttons?.includes(buttonId);
  };
  
  /**
   * 레이아웃 표시 권한 체크
   * @param {string} layoutId - 레이아웃 ID
   * @returns {boolean} 표시 가능 여부
   */
  const canViewLayout = (layoutId) => {
    if (!userPermissions) return false;
    
    // 마스터 계정은 모든 레이아웃 표시 가능
    if (user?.role === 'master' || user?.agent_level_id === 999 || user?.agent_level_id === 1) return true;
    
    // 제한된 레이아웃인지 확인
    const isRestricted = userPermissions.restrictions?.layouts?.includes(layoutId);
    return !isRestricted;
  };
  
  /**
   * CSS 선택자 표시 권한 체크
   * @param {string} cssSelector - CSS 선택자
   * @returns {boolean} 표시 가능 여부
   */
  const canShowElement = (cssSelector) => {
    if (!userPermissions) return false;
    
    // 마스터 계정은 모든 요소 표시 가능
    if (user?.role === 'master' || user?.agent_level_id === 999 || user?.agent_level_id === 1) return true;
    
    // 제한된 CSS 선택자인지 확인
    return !userPermissions.restrictions?.cssSelectors?.includes(cssSelector);
  };
  
  /**
   * 특정 권한 보유 여부 체크
   * @param {string} permissionName - 권한명
   * @returns {boolean} 권한 보유 여부
   */
  const hasPermission = (permissionName) => {
    if (!userPermissions) return false;
    
    // 마스터 계정과 레벨 1은 모든 권한 보유
    if (user?.role === 'master' || user?.agent_level_id === 999 || user?.agent_level_id === 1) return true;
    
    return userPermissions.permissions?.includes(permissionName) || false;
  };
  
  return {
    canAccessMenu,
    canUseButton,
    canViewLayout,
    canShowElement,
    hasPermission,
    isAuthenticated: !!user,
    user,
    permissions: userPermissions,
    loading: false // Redux에서 직접 가져오므로 로딩 상태 없음
  };
};

export default usePermission;