import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * 동적 유형 관리 훅 (agentLevelService 래퍼)
 * Socket Context를 통해 전역 초기화된 agentLevelService를 사용합니다.
 * 
 * @param {Object} options 설정 옵션
 * @param {boolean} options.autoInitialize 자동 초기화 여부 (기본값: false, Context에서 관리)
 * @param {boolean} options.enableRealtime 실시간 업데이트 활성화 여부 (기본값: true)
 * @returns {Object} 동적 유형 관련 상태 및 함수
 */
const useDynamicTypes = ({ 
  autoInitialize = false, // Context에서 초기화하므로 기본값을 false로 변경
  enableRealtime = true 
} = {}) => {
  // Socket Context에서 React 상태로 관리되는 데이터 가져오기
  const { 
    agentLevelService, 
    isInitialized, 
    isConnecting,
    agentLevels,
    types,
    typeHierarchy
  } = useSocket();
  
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(!isInitialized);
  const [error, setError] = useState(null);
  
  // // 컨텍스트 상태 로깅 (개발 모드에서만)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🎣 useDynamicTypes 훅 실행:', {
  //     agentLevelService: !!agentLevelService,
  //     isInitialized,
  //     isConnecting,
  //     agentLevelsCount: agentLevels?.length || 0,
  //     typesCount: Object.keys(types || {}).length,
  //     typeHierarchyCount: Object.keys(typeHierarchy || {}).length
  //   });
  // }

  // 초기화 상태 변경 감지
  useEffect(() => {
    setIsLoading(!isInitialized || isConnecting);
    if (isInitialized && agentLevels?.length > 0) {
      setError(null);
    }
  }, [isInitialized, isConnecting, agentLevels]);

  // agentLevelService에 getRawData 메서드 추가 (호환성을 위해)
  if (agentLevelService && !agentLevelService.getRawData) {
    agentLevelService.getRawData = () => agentLevels || [];
  }

  // 디버깅 로그 추가 (비활성화)
  // console.log('🎣 useDynamicTypes 반환값:', {
  //   isInitialized,
  //   isLoading,
  //   typesCount: Object.keys(types || {}).length,
  //   agentLevelsCount: agentLevels?.length || 0
  // });

  // 기존 API와의 호환성을 위한 결과 객체
  return {
    // 기본 상태
    isLoading,
    error,
    isInitialized,
    
    // 데이터
    rawData: agentLevels || [],
    agentLevels: agentLevels || [], // 기존 API 호환성
    types: types || {},
    typeHierarchy: typeHierarchy || {},
    
    // Socket Context 상태 추가
    isServiceInitialized: isInitialized,
    isServiceConnecting: isConnecting,
    
    // 기존 API 호환성 함수들
    getAgentLevelByTypeId: (typeId) => {
      const typeInfo = types?.[typeId];
      if (!typeInfo) return null;
      
      return agentLevels?.find(level => level.id === typeInfo.id) || null;
    },
    
    // 유틸리티 함수들
    refresh: () => {
      if (agentLevelService) {
        agentLevelService.requestInitialData();
      }
    },
    
    getTypeById: (id) => {
      return Object.entries(types || {}).find(([, type]) => type.id === id)?.[1] || null;
    }
  };
};

export default useDynamicTypes; 