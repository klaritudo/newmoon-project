import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import permissionApi from '../services/permissionApi';
import { updateUserPermissions } from '../features/auth/authSlice';
import socketService from '../services/socketService';

/**
 * 권한 실시간 업데이트 훅
 * - 권한이 변경되면 WebSocket을 통해 알림을 받음
 * - 해당 사용자의 권한을 다시 로드하여 Redux store 업데이트
 * - 페이지 새로고침 없이 즉시 권한 반영
 */
export const usePermissionRefresh = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // 권한 새로고침 함수
  const refreshPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('권한 새로고침 시작...');
      
      // 서버에서 최신 권한 정보 가져오기
      const response = await permissionApi.getMemberPermissions(user.id);
      
      if (response.success && response.data) {
        const newPermissions = response.data.effectivePermissions;
        
        // Redux store 업데이트
        dispatch(updateUserPermissions(newPermissions));
        
        console.log('권한이 업데이트되었습니다:', newPermissions);
        
        // 현재 페이지에 대한 접근 권한이 없어진 경우 대시보드로 리다이렉트
        const currentPath = window.location.pathname;
        const menuId = getMenuIdFromPath(currentPath);
        
        if (menuId && newPermissions.restrictions?.menus?.includes(menuId)) {
          console.log('현재 페이지에 대한 접근 권한이 없습니다. 대시보드로 이동합니다.');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('권한 새로고침 실패:', error);
    }
  }, [user?.id, dispatch, navigate]);

  // WebSocket 이벤트 리스너 설정
  useEffect(() => {
    if (!user?.id) return;

    // 권한 업데이트 이벤트 리스너
    const handlePermissionUpdate = (data) => {
      console.log('권한 업데이트 알림 수신:', data);
      
      // 현재 사용자와 관련된 권한 변경인 경우에만 새로고침
      if (data.affectedUsers?.includes(user.id) || 
          data.affectedLevels?.includes(user.agent_level_id) ||
          data.updateType === 'global') {
        refreshPermissions();
      }
    };

    // 개별 사용자 권한 변경 이벤트
    const handleUserPermissionUpdate = (data) => {
      if (data.userId === user.id) {
        console.log('내 권한이 변경되었습니다.');
        refreshPermissions();
      }
    };

    // 이벤트 리스너 등록
    socketService.on('permission-updated', handlePermissionUpdate);
    socketService.on('user-permission-updated', handleUserPermissionUpdate);
    socketService.on('agent-level-permission-updated', handlePermissionUpdate);

    // 권한 관련 룸 참여
    socketService.emit('join-permission-updates', { userId: user.id });

    // 클린업
    return () => {
      socketService.off('permission-updated', handlePermissionUpdate);
      socketService.off('user-permission-updated', handleUserPermissionUpdate);
      socketService.off('agent-level-permission-updated', handlePermissionUpdate);
      socketService.emit('leave-permission-updates', { userId: user.id });
    };
  }, [user?.id, refreshPermissions]);

  return { refreshPermissions };
};

// 경로에서 메뉴 ID 추출하는 헬퍼 함수
const getMenuIdFromPath = (path) => {
  const pathToMenuId = {
    '/dashboard': 'dashboard',
    '/agent-management': 'agent-management',
    '/betting': 'betting',
    '/settlement': 'settlement',
    '/transactions': 'transactions',
    '/customer-service': 'customer-service',
    '/board': 'board',
    '/game-settings': 'game-settings',
    '/site-settings': 'site-settings',
    '/logs': 'logs',
    '/base-template': 'base-template'
  };

  // 하위 경로도 체크
  for (const [basePath, menuId] of Object.entries(pathToMenuId)) {
    if (path.startsWith(basePath)) {
      return menuId;
    }
  }

  return null;
};

export default usePermissionRefresh;