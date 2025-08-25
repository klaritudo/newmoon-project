import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import usePermission from '../../hooks/usePermission';

const CheckPermissions = () => {
  const user = useSelector(state => state.auth.user);
  const { canAccessMenu, permissions } = usePermission();
  const hasLoggedRef = useRef(false);
  
  useEffect(() => {
    // 사용자가 변경되었을 때 플래그 업데이트
    if (user && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
    }
    
    // 사용자가 로그아웃했을 때 플래그 리셋
    if (!user && hasLoggedRef.current) {
      hasLoggedRef.current = false;
    }
  }, [user?.id]); // user.id가 변경될 때만 실행
  
  return null;
};

export default CheckPermissions;