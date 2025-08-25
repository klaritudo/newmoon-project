import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../features/auth/authSlice';
import apiService from '../../services/api';

const PermissionLoader = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  useEffect(() => {
    const loadPermissions = async () => {
      if (user && user.id && !user.permissions) {
        console.log('PermissionLoader: 권한 정보 없음, 로드 시도...');
        
        try {
          const response = await apiService.get(`/permissions/member/${user.id}`);
          console.log('PermissionLoader: 권한 API 응답:', response.data);
          
          if (response.data?.success && response.data?.data) {
            const permissions = response.data.data.effectivePermissions;
            console.log('PermissionLoader: 권한 로드 성공:', permissions);
            
            // Redux state 업데이트
            dispatch(setUser({
              ...user,
              permissions
            }));
          }
        } catch (error) {
          console.error('PermissionLoader: 권한 로드 실패:', error);
          // 에러 발생 시 빈 권한 설정
          dispatch(setUser({
            ...user,
            permissions: {
              menus: [],
              buttons: [],
              features: [],
              restrictions: {
                menus: [],
                buttons: [],
                layouts: [],
                cssSelectors: []
              }
            }
          }));
        }
      }
    };
    
    loadPermissions();
  }, [user?.id, dispatch]); // user.id가 변경될 때만 실행
  
  return null;
};

export default PermissionLoader;