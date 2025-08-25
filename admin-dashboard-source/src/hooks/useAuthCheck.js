import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
import apiService from '../services/api';

/**
 * 초기 인증 상태를 체크하는 커스텀 훅
 */
const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('토큰이 없어 인증 체크를 건너뜁니다.');
        return;
      }

      console.log('토큰 발견, 인증 상태 확인 중...');
      
      try {
        // /auth/me 엔드포인트로 현재 사용자 정보 조회
        const response = await apiService.get('/auth/me');
        
        if (response.data.user) {
          console.log('인증 성공, 사용자 정보:', response.data.user);
          
          // 사용자 정보를 Redux 스토어에 저장
          dispatch(setUser(response.data.user));
          
          // 권한 정보 로드 시도
          try {
            const permissionResponse = await apiService.get(`/permissions/member/${response.data.user.id}`);
            
            if (permissionResponse.data?.success && permissionResponse.data?.data) {
              const userWithPermissions = {
                ...response.data.user,
                permissions: permissionResponse.data.data.effectivePermissions
              };
              dispatch(setUser(userWithPermissions));
              console.log('권한 정보 로드 성공');
            }
          } catch (permError) {
            console.error('권한 정보 로드 실패:', permError);
          }
        }
      } catch (error) {
        console.error('인증 체크 실패:', error);
        
        // 401 에러인 경우 토큰 제거
        if (error.response?.status === 401) {
          console.log('유효하지 않은 토큰, 제거합니다.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    checkAuth();
  }, [dispatch]);
};

export default useAuthCheck;