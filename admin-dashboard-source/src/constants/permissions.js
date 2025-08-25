// 권한 관련 상수 정의 - Single Source of Truth
export const PERMISSION_TYPES = {
  SYSTEM_ADMIN: 'system_admin',
  SUPER_ADMIN: 'super_admin', 
  ADMIN: 'admin',
  AGENT: 'agent',
  MEMBER: 'member'
};

// 권한 레이블 (한국어)
export const PERMISSION_LABELS = {
  [PERMISSION_TYPES.SYSTEM_ADMIN]: '시스템 관리자',
  [PERMISSION_TYPES.SUPER_ADMIN]: '슈퍼관리자',
  [PERMISSION_TYPES.ADMIN]: '관리자',
  [PERMISSION_TYPES.AGENT]: '에이전트',
  [PERMISSION_TYPES.MEMBER]: '회원'
};

// 권한별 기능 정의
export const PERMISSION_FEATURES = {
  [PERMISSION_TYPES.SYSTEM_ADMIN]: [
    'system_settings',
    'all_permissions',
    'database_management',
    'change_subordinate_password' // 하위 회원 비밀번호 변경 권한
  ],
  [PERMISSION_TYPES.SUPER_ADMIN]: [
    'member_management',
    'agent_management', 
    'permission_management',
    'settlement_management',
    'change_subordinate_password' // 하위 회원 비밀번호 변경 권한
  ],
  [PERMISSION_TYPES.ADMIN]: [
    'member_management',
    'basic_settings'
  ],
  [PERMISSION_TYPES.AGENT]: [
    'member_view',
    'basic_operations'
  ],
  [PERMISSION_TYPES.MEMBER]: [
    'self_view'
  ]
};

// 권한 체크 헬퍼
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  
  // 시스템 관리자는 모든 권한
  if (userPermissions.includes(PERMISSION_TYPES.SYSTEM_ADMIN)) return true;
  
  // 특정 권한 체크
  return userPermissions.includes(requiredPermission);
};

// 기능별 권한 체크
export const canAccessFeature = (userPermissions, feature) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  
  return userPermissions.some(permission => {
    const features = PERMISSION_FEATURES[permission] || [];
    return features.includes(feature);
  });
};