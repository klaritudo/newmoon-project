import { useState, useCallback } from 'react';

/**
 * PageHeader 컴포넌트와 함께 사용하는 커스텀 훅
 * 
 * 페이지 헤더 관련 상태와 핸들러를 관리합니다.
 * 
 * @param {Object} options
 * @param {Function} options.onAdd - 추가 버튼 클릭 시 실행할 콜백
 * @param {Function} options.onDisplayOptions - 표시 옵션 버튼 클릭 시 실행할 콜백
 * @param {Function} options.onRefresh - 새로고침 버튼 클릭 시 실행할 콜백
 * @param {boolean} options.showNotifications - 알림 표시 여부 (기본값: true)
 * @returns {Object} 페이지 헤더 관련 상태 및 핸들러
 */
const usePageHeader = ({
  onAdd,
  onDisplayOptions,
  onRefresh,
  showNotifications = true
} = {}) => {
  // 스낵바 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // 표시 옵션 메뉴 상태
  const [optionsMenuAnchor, setOptionsMenuAnchor] = useState(null);
  const isOptionsMenuOpen = Boolean(optionsMenuAnchor);

  // 알림 표시 함수
  const showNotification = useCallback((message, severity = 'info') => {
    if (showNotifications) {
      setNotification({
        open: true,
        message,
        severity
      });
    }
  }, [showNotifications]);

  // 알림 닫기 함수
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // 추가 버튼 클릭 핸들러
  const handleAddClick = useCallback(() => {
    if (onAdd) {
      onAdd();
    } else {
      showNotification('추가 기능이 구현되지 않았습니다.', 'info');
    }
  }, [onAdd, showNotification]);

  // 표시 옵션 버튼 클릭 핸들러
  const handleOptionsClick = useCallback((event) => {
    if (onDisplayOptions) {
      onDisplayOptions(event);
    } else {
      setOptionsMenuAnchor(event.currentTarget);
    }
  }, [onDisplayOptions]);

  // 새로고침 버튼 클릭 핸들러
  const handleRefreshClick = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      showNotification('새로고침 중...', 'info');
      // 실제 구현에서는 여기에 데이터 다시 불러오기 로직 추가
      setTimeout(() => {
        showNotification('새로고침 완료', 'success');
      }, 1000);
    }
  }, [onRefresh, showNotification]);

  // 표시 옵션 메뉴 닫기 핸들러
  const handleCloseOptionsMenu = useCallback(() => {
    setOptionsMenuAnchor(null);
  }, []);

  return {
    // 알림 관련
    notification,
    showNotification,
    closeNotification,
    
    // 버튼 핸들러
    handleAddClick,
    handleOptionsClick,
    handleRefreshClick,
    
    // 옵션 메뉴 관련
    optionsMenuAnchor,
    isOptionsMenuOpen,
    handleCloseOptionsMenu
  };
};

export default usePageHeader; 