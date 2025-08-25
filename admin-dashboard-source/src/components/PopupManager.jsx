import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PopupManager.css';

const PopupManager = () => {
  const [popups, setPopups] = useState([]);
  const [timers, setTimers] = useState({});
  const [autoCloseSettings, setAutoCloseSettings] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 유저 API URL 사용 (팝업은 유저 API에서 관리)
  // 프록시를 통해 CORS 문제 해결
  const apiUrl = '/user-api';
  
  // 함수들을 먼저 정의
  const fetchAutoCloseSettings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/popups/auto-close-settings`);
      
      if (response.data.success && response.data.data) {
        setAutoCloseSettings(response.data.data);
      }
    } catch (error) {
      console.log('자동 닫기 설정 로드 실패 (기본값 사용)');
      setAutoCloseSettings({ close_after_hours: 24, enabled: true });
    }
  };
  
  const fetchActivePopups = async () => {
    try {
      // 개발 환경에서만 상세 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('PopupManager: 팝업 API 호출 시작');
      }
      // 관리자 페이지용 팝업 필터링을 위해 page=admin 파라미터 추가
      const response = await axios.get(`${apiUrl}/api/popups/active?page=admin`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('PopupManager: API 응답:', response.data);
      }
      
      if (response.data.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('PopupManager: 서버에서 받은 팝업 수:', response.data.data.length);
        }
        
        // 시간 기반으로 닫힌 팝업 확인 및 만료된 항목 정리
        const temporaryDismissed = JSON.parse(localStorage.getItem('temporaryDismissedPopups') || '{}');
        const currentTime = new Date().getTime();
        const updatedTemporaryDismissed = {};
        
        // 만료되지 않은 항목만 유지
        Object.keys(temporaryDismissed).forEach(popupId => {
          if (temporaryDismissed[popupId] > currentTime) {
            updatedTemporaryDismissed[popupId] = temporaryDismissed[popupId];
          }
        });
        
        // 만료된 항목이 제거된 상태로 localStorage 업데이트
        localStorage.setItem('temporaryDismissedPopups', JSON.stringify(updatedTemporaryDismissed));
        
        // display_page가 'all' 또는 'admin'인 팝업만 필터링
        const adminPopups = response.data.data.filter(popup => {
          // 페이지 타입 체크
          if (popup.display_page !== 'all' && popup.display_page !== 'admin') {
            return false;
          }
          
          // 시간 기반으로 닫혔고 아직 만료되지 않았다면 표시하지 않음
          // ID를 문자열로 통일하여 체크
          if (updatedTemporaryDismissed[String(popup.id)]) {
            const remainingTime = Math.ceil((updatedTemporaryDismissed[String(popup.id)] - currentTime) / (1000 * 60));
            if (process.env.NODE_ENV === 'development') {
              console.log(`PopupManager: 팝업 ${popup.id}는 ${remainingTime}분 후에 다시 표시됩니다.`);
            }
            return false;
          }
          
          return true;
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('PopupManager: 필터링 후 표시할 팝업 수:', adminPopups.length);
        }
        setPopups(adminPopups);
      }
    } catch (error) {
      console.error('팝업 로드 오류:', error);
    }
  };
  
  // 토큰 상태 체크 및 storage 이벤트 리스너
  useEffect(() => {
    // 초기 토큰 체크
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (token) {
        fetchAutoCloseSettings();
        fetchActivePopups();
      } else {
        // 토큰이 없으면 팝업 초기화
        setPopups([]);
      }
    };

    // 초기 체크
    checkAuth();

    // storage 이벤트 리스너 (다른 탭에서의 로그인/로그아웃 감지)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    // 커스텀 이벤트 리스너 (같은 탭에서의 로그인/로그아웃 감지)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    // 5분마다 만료된 팝업 체크 (시간 기반 닫기 만료 확인)
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isAuthenticated) {
        // 개발 환경에서만 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.log('PopupManager: 만료된 팝업 체크');
        }
        fetchActivePopups();
      }
    }, 300000); // 5분(300초)마다 체크

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(intervalId);
    };
  }, []);  // 의존성 배열 비워서 무한 루프 방지
  
  const handlePopupClose = (popup) => {
    // 타이머 정리
    if (timers[popup.id]) {
      clearTimeout(timers[popup.id]);
      setTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[popup.id];
        return newTimers;
      });
    }
    
    setPopups(prev => prev.filter(p => p.id !== popup.id));
  };
  
  const handleTimeBasedClose = async (popup) => {
    // 타이머 정리
    if (timers[popup.id]) {
      clearTimeout(timers[popup.id]);
      setTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[popup.id];
        return newTimers;
      });
    }
    
    // localStorage에 시간 기반 닫기 정보 저장
    const hours = popup.close_after_hours || 12;
    const expiryTime = new Date().getTime() + (hours * 60 * 60 * 1000); // 현재 시간 + X시간
    
    const temporaryDismissed = JSON.parse(localStorage.getItem('temporaryDismissedPopups') || '{}');
    // ID를 문자열로 통일
    temporaryDismissed[String(popup.id)] = expiryTime;
    localStorage.setItem('temporaryDismissedPopups', JSON.stringify(temporaryDismissed));
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`PopupManager: 팝업 ${popup.id}를 ${hours}시간 동안 숨김. 만료시간:`, new Date(expiryTime));
    }
    
    // 시간 기반 닫기 추적
    try {
      
      await axios.post(`${apiUrl}/api/popups/${popup.id}/dismiss`, 
        { hours: hours }
      );
    } catch (error) {
      console.error('시간 기반 팝업 닫기 추적 오류:', error);
    }
    
    // 팝업 목록에서 제거
    setPopups(prev => prev.filter(p => p.id !== popup.id));
  };
  
  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [timers]);
  
  // 모든 Hook 호출 후 인증 체크
  if (!isAuthenticated) {
    return null;
  }
  
  const handlePopupClick = (popup) => {
    if (popup.click_url) {
      window.open(popup.click_url, '_blank');
    }
    
    if (popup.close_on_click) {
      handlePopupClose(popup);
    }
  };
  
  // Process popup content to remove problematic BR tags
  const processPopupContent = (content) => {
    if (!content) return '';
    // Remove trailing BR tags and BR tags immediately after images
    return content
      .replace(/<br\s*\/?\>\s*$/gi, '')  // Remove trailing BR
      .replace(/(<img[^>]*>)\s*<br\s*\/?\>/gi, '$1');  // Remove BR after images
  };

  const getPopupStyle = (popup) => {
    const baseStyle = {
      width: `${popup.width}px`,
      height: popup.height === 'auto' ? 'auto' : `${popup.height}px`,
      position: 'fixed',
      zIndex: 1500,
      backgroundColor: popup.background_color || 'white',
      color: popup.text_color || '#000000',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      fontSize: popup.text_size === 'small' ? '12px' : 
               popup.text_size === 'large' ? '16px' : '14px'
    };
    
    // 정밀한 위치가 설정되어 있으면 우선 사용 (0이 아닌 값만)
    if ((popup.top_position !== null && popup.top_position !== undefined && popup.top_position !== 0) ||
        (popup.left_position !== null && popup.left_position !== undefined && popup.left_position !== 0)) {
      return {
        ...baseStyle,
        top: `${popup.top_position}px`,
        left: `${popup.left_position}px`
      };
    }
    
    // 위치에 따른 스타일 설정
    switch (popup.position) {
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: '20px',
          left: '20px'
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: '20px',
          right: '20px'
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: '20px',
          left: '20px'
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: '20px',
          right: '20px'
        };
      default:
        // 기본 위치 (중앙)
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };
  
  // 닫기 버튼 스타일 적용
  const getCloseButtonStyle = (style) => {
    const baseStyle = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: 1
    };

    switch (style) {
      case 'minimal':
        return {
          ...baseStyle,
          fontSize: '16px',
          opacity: 0.7,
          '&:hover': { opacity: 1 }
        };
      case 'rounded':
        return {
          ...baseStyle,
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {popups.map(popup => (
        <div
          key={popup.id}
          className={`popup-container popup-type-${popup.popup_type} ${
            popup.show_header === false ? 'no-header' : ''
          } text-${popup.text_size || 'medium'}`}
          style={getPopupStyle(popup)}
        >
          {popup.show_header !== false && (
            <div 
              className="popup-header"
              style={{
                padding: '10px 15px',
                borderBottom: '1px solid #ddd',
                position: 'relative',
                backgroundColor: popup.header_background_color || '#f5f5f5'
              }}
            >
              <h3 style={{ margin: 0, paddingRight: '30px' }}>{popup.title}</h3>
              <button
                className={`popup-close ${popup.close_button_style ? `style-${popup.close_button_style}` : ''}`}
                onClick={() => handlePopupClose(popup)}
                aria-label="닫기"
                style={getCloseButtonStyle(popup.close_button_style)}
              >
                ×
              </button>
            </div>
          )}
          
          {popup.show_header === false && (
            <button
              className={`popup-close ${popup.close_button_style ? `style-${popup.close_button_style}` : ''}`}
              onClick={() => handlePopupClose(popup)}
              aria-label="닫기"
              style={getCloseButtonStyle(popup.close_button_style)}
            >
              ×
            </button>
          )}
          
          <div
            className="popup-content"
            onClick={() => handlePopupClick(popup)}
            style={{ 
              cursor: popup.click_url ? 'pointer' : 'default'
            }}
            dangerouslySetInnerHTML={{ __html: processPopupContent(popup.content) }}
          />
          
          {/* 시간 기반 닫기 버튼 - 각 팝업의 개별 설정 사용 */}
          {popup.close_after_hours && popup.close_after_hours > 0 && (
            <div 
              className="popup-footer"
              style={{
                padding: '10px 15px',
                borderTop: '1px solid #ddd',
                backgroundColor: '#f9f9f9',
                textAlign: 'center'
              }}
            >
              <button
                onClick={() => handleTimeBasedClose(popup)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#666'}
              >
                {popup.close_after_hours}시간 동안 보지 않기
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default PopupManager;