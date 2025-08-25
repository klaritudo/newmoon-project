import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/apiConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.connectionPromise = null;
    this.isConnecting = false;
    this.connectionCount = 0; // 연결 시도 카운터
    this.pendingListeners = new Map(); // Socket 연결 전 대기 중인 리스너
  }

  // Socket.IO 연결 초기화 (중복 연결 방지)
  connect() {
    if (this.socket?.connected) {
      // console.log('Socket이 이미 연결되어 있습니다.');
      return Promise.resolve(this.socket);
    }

    // 토큰이 없으면 연결하지 않음
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔒 토큰이 없어 Socket 연결을 건너뜁니다');
      return null;
    }

    // 연결 시도 중이면 기존 Promise 반환
    if (this.isConnecting && this.connectionPromise) {
      // console.log('Socket 연결 시도 중, 기존 Promise 반환');
      return this.connectionPromise;
    }

    // 기존 소켓이 있지만 연결되지 않은 경우 정리
    if (this.socket && !this.isConnected) {
      // console.log('기존 Socket 정리 중...');
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = true;
    this.connectionCount++;
    
    const socketUrl = API_CONFIG.SOCKET_URL;
    // console.log(`🔌 Socket 연결 시도 #${this.connectionCount}:`, socketUrl);
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: false,
          autoConnect: true,
          reconnection: true,  // 재연결 활성화
          reconnectionAttempts: 5,  // 재연결 시도 5회
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
          maxReconnectionAttempts: 5,
          auth: {
            token: token  // 인증 토큰 추가
          }
        });

        const connectTimeout = setTimeout(() => {
          console.warn('⏱️ Socket 연결 타임아웃');
          this.isConnecting = false;
          reject(new Error('Socket 연결 타임아웃'));
        }, 15000);

        this.socket.on('connect', () => {
          clearTimeout(connectTimeout);
          // console.log('✅ Socket.IO 연결 성공:', this.socket.id);
          this.isConnected = true;
          this.isConnecting = false;
          
          // 인증 처리
          const token = localStorage.getItem('token');
          if (token) {
            this.socket.emit('authenticate', {
              token,
              type: 'admin'
            });
          }
          
          // 대기 중인 리스너들을 실제로 등록
          this.registerPendingListeners();
          
          this.emitToListeners('connect');
          resolve(this.socket);
        });

        // 인증 결과 처리
        this.socket.on('authenticated', (data) => {
          if (data.success) {
            console.log('✅ Socket 인증 성공');
            this.emitToListeners('authenticated', data);
          } else {
            console.error('❌ Socket 인증 실패:', data.error);
            this.emitToListeners('authentication_error', data.error);
            
            // JWT 만료 시 자동 로그아웃 처리
            if (data.error && data.error.includes('jwt expired')) {
              console.log('🔒 토큰 만료 - 로그아웃 처리');
              
              // 재연결 비활성화
              if (this.socket) {
                this.socket.disconnect();
              }
              
              // 로컬 스토리지 정리
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              
              // 로그인 페이지로 즉시 리다이렉트
              window.location.replace('/login');
              return;
            }
          }
        });

        this.socket.on('disconnect', (reason) => {
          // console.log('🔌 Socket.IO 연결 해제:', reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.emitToListeners('disconnect', reason);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(connectTimeout);
          console.error('❌ Socket.IO 연결 오류:', error.message);
          console.error('❌ 오류 상세:', error);
          this.isConnected = false;
          this.isConnecting = false;
          
          // connectionPromise 재설정하여 다음 연결 시도 가능하게 함
          this.connectionPromise = null;
          
          // 인증 관련 오류인 경우 재연결 중단
          if (error.message && error.message.includes('Authentication error')) {
            console.log('🔒 인증 오류 - 재연결 중단');
            this.socket.disconnect();
            this.socket.io.opts.reconnection = false;
            
            // 토큰 만료인 경우 로그인 페이지로 이동
            if (error.message.includes('Token expired')) {
              if (window.store) {
                window.store.dispatch({ type: 'auth/logout' });
              }
              window.location.href = '/login';
            }
          }
          
          this.emitToListeners('connect_error', error);
          reject(error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
          // console.log('🔄 Socket.IO 재연결 성공:', attemptNumber);
          this.isConnected = true;
          this.emitToListeners('reconnect', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('❌ Socket.IO 재연결 오류:', error.message);
          this.emitToListeners('reconnect_error', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Socket.IO 재연결 완전 실패');
          this.isConnected = false;
          this.isConnecting = false;
          this.emitToListeners('reconnect_failed');
        });

      } catch (error) {
        console.error('Socket 생성 중 오류:', error.message);
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // 특정 룸에 참가
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit(`join-${roomName}`);
      // console.log(`${roomName} 룸에 참가했습니다.`);
    }
  }

  // 특정 룸에서 나가기
  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit(`leave-${roomName}`);
      // console.log(`${roomName} 룸에서 나갔습니다.`);
    }
  }

  // 이벤트 발송
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
      // console.log(`이벤트 발송: ${eventName}`, data);
    } else {
      // console.warn(`Socket이 연결되지 않아 이벤트를 발송할 수 없습니다: ${eventName}`);
    }
  }

  // 이벤트 리스너 등록
  on(eventName, callback) {
    if (this.socket) {
      // console.log(`🟡 Socket 이벤트 리스너 등록: ${eventName}`);
      this.socket.on(eventName, callback);
      
      // 리스너 추적을 위해 저장
      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, []);
      }
      this.listeners.get(eventName).push(callback);
      // console.log(`🟡 현재 ${eventName} 리스너 수:`, this.listeners.get(eventName).length);
    } else {
      // Socket이 아직 없으면 대기 리스트에 추가
      // console.log(`🟡 Socket 미연결 상태, 리스너 대기열에 추가: ${eventName}`);
      if (!this.pendingListeners.has(eventName)) {
        this.pendingListeners.set(eventName, []);
      }
      this.pendingListeners.get(eventName).push(callback);
    }
  }

  // 대기 중인 리스너들을 실제로 등록
  registerPendingListeners() {
    if (!this.socket) return;

    // console.log('🔄 대기 중인 리스너들을 등록합니다...');
    this.pendingListeners.forEach((callbacks, eventName) => {
      callbacks.forEach(callback => {
        // console.log(`🟡 대기 중이던 리스너 등록: ${eventName}`);
        this.socket.on(eventName, callback);
        
        // 리스너 추적을 위해 저장
        if (!this.listeners.has(eventName)) {
          this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
      });
    });
    
    // 대기 리스트 초기화
    this.pendingListeners.clear();
    // console.log('✅ 모든 대기 중인 리스너 등록 완료');
  }

  // 이벤트 리스너 제거
  off(eventName, callback) {
    // 실제 Socket에서 제거
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
    
    // 리스너 추적에서 제거
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    
    // 대기 중인 리스너에서도 제거
    if (this.pendingListeners.has(eventName)) {
      const pendingCallbacks = this.pendingListeners.get(eventName);
      const pendingIndex = pendingCallbacks.indexOf(callback);
      if (pendingIndex > -1) {
        pendingCallbacks.splice(pendingIndex, 1);
      }
    }
  }

  // 모든 이벤트 리스너 제거
  removeAllListeners(eventName) {
    if (this.socket) {
      this.socket.removeAllListeners(eventName);
      this.listeners.delete(eventName);
    }
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      // 모든 리스너 제거
      this.listeners.forEach((callbacks, eventName) => {
        this.socket.removeAllListeners(eventName);
      });
      this.listeners.clear();
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionPromise = null;
      // console.log('Socket.IO 연결이 해제되었습니다.');
    }
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      socketId: this.socket?.id || null
    };
  }

  // 등록된 리스너들에게 이벤트 전달
  emitToListeners(eventName, data) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // console.error(`리스너 호출 중 오류 (${eventName}):`, error);
        }
      });
    }
  }
}

// 싱글톤 인스턴스 생성
const socketService = new SocketService();

export default socketService;