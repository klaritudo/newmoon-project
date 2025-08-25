import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

// 알림 컨텍스트 생성
const NotificationContext = createContext();

// 알림 컨텍스트 프로바이더
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // 알림 표시 함수
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // 알림 닫기 함수
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // 새로고침 핸들러
  const handleRefresh = useCallback((pageName = '페이지') => {
    showNotification(`${pageName} 새로고침 중...`, 'info');
    
    // 실제 새로고침 로직 (필요시 각 페이지에서 오버라이드 가능)
    setTimeout(() => {
      showNotification(`${pageName} 새로고침 완료`, 'success');
    }, 1000);
  }, [showNotification]);

  const value = {
    notification,
    showNotification,
    closeNotification,
    handleRefresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* 전역 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// 알림 컨텍스트 사용 훅
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 