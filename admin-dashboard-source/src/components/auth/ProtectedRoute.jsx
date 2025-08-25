import React, { useEffect, useCallback } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { setUser } from '../../features/auth/authSlice';
import apiService from '../../services/api';

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 * React Router v6의 Outlet을 사용하여 중첩 라우팅을 지원합니다.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  
  // 사용자 정보 업데이트 함수
  const updateUserInfo = useCallback(async () => {
    try {
      const response = await apiService.auth.me();
      if (response.data.success) {
        // 기존 권한 정보를 유지하면서 사용자 정보만 업데이트
        const updatedUser = {
          ...response.data.data,
          permissions: user?.permissions // 기존 권한 정보 유지
        };
        dispatch(setUser(updatedUser));
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
  }, [dispatch, user?.permissions]);
  
  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token && !isAuthenticated) {
      // 토큰이 없으면 로그인 페이지로
      return;
    }
    
    // 인증된 경우 사용자 정보 업데이트
    if (isAuthenticated && token) {
      updateUserInfo();
      
      // 2분마다 사용자 정보 업데이트 (주로 balance 동기화를 위해)
      const interval = setInterval(updateUserInfo, 120000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, updateUserInfo]);
  
  // 로딩 중일 때는 로딩 표시
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          인증 확인 중...
        </Typography>
      </Box>
    );
  }
  
  // 인증되지 않았을 때는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 인증되었을 때는 자식 컴포넌트 또는 Outlet 렌더링
  return children || <Outlet />;
};

export default ProtectedRoute; 