import React, { createContext, useState, useEffect, useContext } from 'react';
import socketService from '../services/socketService';
import agentLevelService from '../services/agentLevelService';
import sequenceService from '../services/sequenceService';
import { store } from '../app/store';
import { updateNotificationCount } from '../features/notifications/notificationsSlice';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // 초기화 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  
  // AgentLevelService 데이터 상태 추가
  const [agentLevels, setAgentLevels] = useState([]);
  const [types, setTypes] = useState({});
  const [typeHierarchy, setTypeHierarchy] = useState({});

  useEffect(() => {
    let mounted = true;
    let cleanup = null;

    const initializeSocket = async () => {
      if (isInitialized) return;

      try {
        setIsConnecting(true);
        setConnectionError(null);

        // console.log('🔌 Socket 초기화 시작...');
        
        // Socket 연결
        const socket = await socketService.connect();
        
        if (!mounted) return;
        
        // 토큰이 없어서 Socket 연결이 null인 경우 처리
        if (!socket) {
          console.log('🔒 Socket 연결 건너뜀 (토큰 없음)');
          setIsConnecting(false);
          return;
        }

        // 시퀀스 서비스 초기화
        sequenceService.setSocketService(socketService);

        // AgentLevelService 초기화
        if (!agentLevelService.isInitialized) {
          // console.log('🔄 AgentLevelService 초기화 시작...');
          
          // AgentLevelService의 데이터 변경 리스너 등록
          const listenerId = agentLevelService.addListener((event) => {
            // console.log('🔄 AgentLevelService 데이터 변경 이벤트:', event.type);
            if (mounted) {
              const newAgentLevels = agentLevelService.getAgentLevels();
              const newTypes = agentLevelService.getTypes();
              const newTypeHierarchy = agentLevelService.getTypeHierarchy();
              
              // console.log('🔄 React 상태 업데이트:', {
              //   agentLevels: newAgentLevels.length,
              //   types: Object.keys(newTypes).length,
              //   typeHierarchy: Object.keys(newTypeHierarchy).length
              // });
              
              setAgentLevels([...newAgentLevels]);
              setTypes({...newTypes});
              setTypeHierarchy({...newTypeHierarchy});
              
              // 데이터가 실제로 로드되었을 때만 초기화 완료로 설정
              if (event.type === 'loaded' && newAgentLevels.length > 0) {
                setIsInitialized(true);
                // console.log('✅ 데이터 로드 완료 - 초기화 상태 업데이트');
              }
            }
          });
          
          await agentLevelService.initialize();
          // console.log('✅ AgentLevelService 초기화 완료');
          
          // 초기화 후 데이터 상태 확인
          const initialAgentLevels = agentLevelService.getAgentLevels();
          const initialTypes = agentLevelService.getTypes();
          const initialTypeHierarchy = agentLevelService.getTypeHierarchy();
          
          // console.log('📊 AgentLevelService 데이터 상태:', {
          //   agentLevels: initialAgentLevels,
          //   agentLevelsCount: initialAgentLevels.length,
          //   types: initialTypes,
          //   typesCount: Object.keys(initialTypes).length
          // });
          
          // 초기 상태 설정
          if (mounted) {
            // console.log('🔄 초기 데이터로 상태 업데이트');
            setAgentLevels([...initialAgentLevels]);
            setTypes({...initialTypes});
            setTypeHierarchy({...initialTypeHierarchy});
            
            // 데이터가 있으면 초기화 완료로 설정
            if (initialAgentLevels.length > 0) {
              setIsInitialized(true);
              // console.log('✅ 초기 데이터 로드 완료');
            }
          }
          
          // 리스너 cleanup 함수 저장
          cleanup = () => {
            agentLevelService.removeListener(listenerId);
          };
        } else {
          // console.log('ℹ️ AgentLevelService가 이미 초기화되어 있음');
        }

        if (!mounted) return;

        setIsConnected(true);
        // console.log('✅ Socket 및 서비스 초기화 완료 (데이터 로드 대기 중)');
        
        // 초기화 상태 로깅
        // console.log('🔄 Socket 연결 완료, 데이터 로드 대기 중:', {
        //   isConnected: true,
        //   waitingForDataLoad: true,
        //   agentLevelsServiceInitialized: agentLevelService.isInitialized
        // });

      } catch (error) {
        console.error('❌ Socket 초기화 실패:', error);
        if (mounted) {
          setConnectionError(error.message);
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    // Socket 이벤트 리스너 등록
    const handleConnect = () => {
      if (mounted) {
        // console.log('📡 Socket 연결됨');
        setIsConnected(true);
        setConnectionError(null);
      }
    };

    const handleDisconnect = (reason) => {
      if (mounted) {
        // console.log('🔌 Socket 연결 해제:', reason);
        setIsConnected(false);
      }
    };

    const handleConnectError = (error) => {
      if (mounted) {
        console.error('❌ Socket 연결 오류:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      }
    };

    const handleReconnect = () => {
      if (mounted) {
        // console.log('🔄 Socket 재연결됨');
        setIsConnected(true);
        setConnectionError(null);
        // 재연결 시 시퀀스 서비스 리셋
        sequenceService.resetOnReconnect();
      }
    };

    // 이벤트 리스너 등록
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);
    socketService.on('reconnect', handleReconnect);
    
    // 멤버 잔액 업데이트 이벤트 리스너
    socketService.on('member:balance:updated', (data) => {
      if (mounted) {
        console.log('[Socket] 멤버 잔액 업데이트:', data);
        // 관련 컴포넌트들이 이 이벤트를 수신할 수 있도록 전파
        window.dispatchEvent(new CustomEvent('memberBalanceUpdated', { detail: data }));
      }
    });
    
    // 유저 잔액 변경 이벤트 리스너 (실시간 동기화)
    socketService.on('balance:changed', (data) => {
      if (mounted) {
        console.log('[Socket] 잔액 변경:', data);
        // 유저 페이지와 관리자 페이지 모두에서 사용
        window.dispatchEvent(new CustomEvent('balanceChanged', { detail: data }));
      }
    });
    
    // 실시간 잔액 업데이트 이벤트 리스너
    socketService.on('balance:update', (data) => {
      if (mounted) {
        console.log('[Socket] 실시간 잔액 업데이트:', data);
        window.dispatchEvent(new CustomEvent('realtimeBalanceUpdate', { detail: data }));
      }
    });
    

    // 초기화 실행
    initializeSocket();

    return () => {
      mounted = false;
      
      // 이벤트 리스너 정리
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
      socketService.off('reconnect', handleReconnect);
      socketService.off('member:balance:updated');
      socketService.off('balance:changed');
      socketService.off('balance:update');
      
      // AgentLevelService 리스너 정리
      if (cleanup) {
        cleanup();
      }
      
      // 시퀀스 서비스 정리
      sequenceService.cleanup();
      
      // console.log('🧹 Socket Context 정리됨');
    };
  }, [isInitialized]);

  const value = {
    isConnected,
    isConnecting,
    connectionError,
    isInitialized,
    socketService,
    agentLevelService,
    agentLevels,
    types,
    typeHierarchy,
    sequenceService
  };
  
  // Context value 상태 로깅 (개발 모드에서만)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🎯 SocketContext value 상태:', {
  //     isConnected,
  //     isConnecting,
  //     isInitialized,
  //     agentLevelsLength: agentLevels.length,
  //     typesLength: Object.keys(types).length,
  //     types: types
  //   });
  // }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;