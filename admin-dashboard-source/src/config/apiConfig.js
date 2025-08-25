/**
 * API 설정 - 로컬/외부 환경 자동 감지
 */

// 현재 접속 환경 감지
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// IP 주소 형태로 직접 접속했는지 감지 (IPv4 패턴)
const isDirectIP = /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname);

// nginx 프록시를 통한 도메인 접속인지 감지
// localhost도 아니고, IP 직접 접속도 아니며, 개발 포트(5173)가 아닌 경우
const isNginxProxy = !isLocalhost && !isDirectIP && window.location.port !== '5173';

// 환경별 API URL 설정  
const getApiBaseUrl = () => {
  // nginx 프록시 도메인인 경우 무조건 프록시 사용
  if (isNginxProxy) {
    return '/api';
  }
  
  // 환경변수가 있으면 사용 (nginx 프록시가 아닌 경우만)
  if (import.meta.env.VITE_API_URL) {
    // 개발 환경에서 외부 IP로 접속한 경우 직접 API 서버에 연결
    if (import.meta.env.DEV && !isLocalhost && window.location.port === '5173' && import.meta.env.VITE_API_URL === '/api') {
      // 현재 페이지의 프로토콜을 따름 (HTTPS면 HTTPS, HTTP면 HTTP)
      const protocol = window.location.protocol;
      return `${protocol}//${window.location.hostname}:5100/api`;
    }
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.VITE_API_BASE_URL) {
    // 개발 환경에서 외부 IP로 접속한 경우 직접 API 서버에 연결
    if (import.meta.env.DEV && !isLocalhost && window.location.port === '5173') {
      // 현재 페이지의 프로토콜을 따름
      const protocol = window.location.protocol;
      return `${protocol}//${window.location.hostname}:5100/api`;
    }
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 개발 환경에서 localhost로 접속한 경우에만 프록시 사용
  if (import.meta.env.DEV && isLocalhost && window.location.port === '5173') {
    return '/api';  // 로컬에서만 Vite 프록시 사용
  }
  
  // 개발 환경이지만 외부 IP로 접속한 경우
  if (import.meta.env.DEV && !isLocalhost && window.location.port === '5173') {
    // 외부 IP 접속 시 직접 API 서버에 연결 - 현재 프로토콜 사용
    const protocol = window.location.protocol;
    return `${protocol}//${window.location.hostname}:5100/api`;
  }
  
  // 프로덕션 환경 또는 기타
  return '/api';
};

const getSocketUrl = () => {
  // nginx 프록시 도메인인 경우 프록시 사용
  if (isNginxProxy) {
    return '';  // nginx 프록시 사용
  }
  
  // 환경변수가 있으면 우선 사용
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // 개발 환경에서 Vite 개발 서버를 통해 접속한 경우
  if (import.meta.env.DEV && window.location.port === '5173') {
    // localhost로 접속한 경우에만 프록시 사용
    if (isLocalhost) {
      return '';  // Vite 프록시 사용
    } else {
      // 외부 IP로 접속한 경우 직접 API 서버에 연결 - 현재 프로토콜 사용
      const protocol = window.location.protocol;
      return `${protocol}//${window.location.hostname}:5100`;  // Admin API 직접 연결
    }
  }
  
  // nginx를 통한 접속 (8880 포트)
  if (window.location.port === '8880') {
    // nginx가 프록시하는 경우 현재 origin 사용
    return '';
  }
  
  // 프로덕션 환경 또는 기타 환경
  if (isLocalhost) {
    // localhost 접속 시에도 현재 프로토콜 사용
    const protocol = window.location.protocol;
    const port = protocol === 'https:' ? '5000' : '5100';  // HTTPS/HTTP에 따라 포트 조정
    return `${protocol}//localhost:${port}`;
  } else {
    // HTTPS 사이트에서는 현재 프로토콜과 도메인 사용
    return '';  // Socket.IO will use the current origin
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  SOCKET_URL: getSocketUrl(),
  IS_LOCALHOST: isLocalhost,
  IS_DIRECT_IP: isDirectIP,
  IS_NGINX_PROXY: isNginxProxy,
  CURRENT_HOST: window.location.hostname
};

// 디버깅 로그
console.log('API_CONFIG:', {
  BASE_URL: API_CONFIG.BASE_URL,
  SOCKET_URL: API_CONFIG.SOCKET_URL,
  IS_LOCALHOST: API_CONFIG.IS_LOCALHOST,
  IS_DIRECT_IP: API_CONFIG.IS_DIRECT_IP,
  IS_NGINX_PROXY: API_CONFIG.IS_NGINX_PROXY,
  CURRENT_HOST: API_CONFIG.CURRENT_HOST,
  PORT: window.location.port,
  DEV: import.meta.env.DEV
});

 