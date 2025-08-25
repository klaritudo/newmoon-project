import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 동적 유형 관리 훅 (베이스템플릿용)
 * 외부 서비스나 API를 통해 동적으로 유형 정보를 관리합니다.
 * 
 * @param {Object} options 설정 옵션
 * @param {Function} options.dataService 데이터 서비스 객체 (필수)
 * @param {boolean} options.autoInitialize 자동 초기화 여부 (기본값: true)
 * @param {boolean} options.enableRealtime 실시간 업데이트 활성화 여부 (기본값: true)
 * @param {Object} options.initialTypes 초기 유형 데이터 (기본값: {})
 * @param {Object} options.initialTypeHierarchy 초기 계층 구조 데이터 (기본값: {})
 * @returns {Object} 동적 유형 관련 상태 및 함수
 */
const useDynamicTypes = ({ 
  dataService = null,
  autoInitialize = true, 
  enableRealtime = true,
  initialTypes = {},
  initialTypeHierarchy = {}
} = {}) => {
  // 상태 관리
  const [types, setTypes] = useState(initialTypes);
  const [typeHierarchy, setTypeHierarchy] = useState(initialTypeHierarchy);
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 리스너 ID 추적
  const listenerIdRef = useRef(null);
  const dataServiceRef = useRef(dataService);

  // 데이터 서비스 업데이트
  useEffect(() => {
    dataServiceRef.current = dataService;
  }, [dataService]);

  // 서비스 변경 사항 처리
  const handleServiceUpdate = useCallback((updateData) => {
    const { type, data, types: newTypes, typeHierarchy: newTypeHierarchy } = updateData;
    
    // console.log('=== useDynamicTypes 서비스 업데이트 수신 ===');
    // console.log('업데이트 타입:', type);
    // console.log('업데이트 데이터:', data);
    // console.log('새로운 types:', newTypes);
    // console.log('새로운 typeHierarchy:', newTypeHierarchy);

    // 상태 업데이트
    if (newTypes) setTypes(newTypes);
    if (newTypeHierarchy) setTypeHierarchy(newTypeHierarchy);
    if (dataServiceRef.current?.getRawData) {
      setRawData(dataServiceRef.current.getRawData());
    }
    
    // 에러 상태 초기화 및 로딩 상태 해제
    setError(null);
    setIsLoading(false);
  }, []);

  // 서비스 초기화
  const initializeService = useCallback(async () => {
    if (isInitialized || !dataServiceRef.current) return;

    // console.log('=== useDynamicTypes 초기화 시작 ===');
    setIsLoading(true);
    setError(null);

    try {
      // 데이터 서비스 초기화
      if (dataServiceRef.current.initialize) {
        await dataServiceRef.current.initialize();
      }

      // 초기 데이터 설정
      const serviceTypes = dataServiceRef.current.getTypes?.() || {};
      const serviceTypeHierarchy = dataServiceRef.current.getTypeHierarchy?.() || {};
      const serviceRawData = dataServiceRef.current.getRawData?.() || [];
      
      // console.log('서비스에서 가져온 types:', serviceTypes);
      // console.log('서비스에서 가져온 typeHierarchy:', serviceTypeHierarchy);
      // console.log('서비스에서 가져온 rawData:', serviceRawData);
      
      setTypes(serviceTypes);
      setTypeHierarchy(serviceTypeHierarchy);
      setRawData(serviceRawData);

      // 실시간 업데이트 리스너 등록
      if (enableRealtime && dataServiceRef.current.addListener) {
        listenerIdRef.current = dataServiceRef.current.addListener(handleServiceUpdate);
        // console.log('실시간 리스너 등록됨:', listenerIdRef.current);
      }

      setIsInitialized(true);
      // console.log('=== useDynamicTypes 초기화 완료 ===');
    } catch (err) {
      console.error('=== useDynamicTypes 초기화 실패 ===', err);
      setError(err.message || '초기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, enableRealtime, handleServiceUpdate]);

  // 데이터 새로고침
  const refreshData = useCallback(() => {
    if (!dataServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // 데이터 서비스를 통해 데이터 재요청
      if (dataServiceRef.current.requestInitialData) {
        dataServiceRef.current.requestInitialData();
      } else if (dataServiceRef.current.refresh) {
        dataServiceRef.current.refresh();
      } else {
        // 직접 데이터 가져오기
        const serviceTypes = dataServiceRef.current.getTypes?.() || {};
        const serviceTypeHierarchy = dataServiceRef.current.getTypeHierarchy?.() || {};
        const serviceRawData = dataServiceRef.current.getRawData?.() || [];
        
        setTypes(serviceTypes);
        setTypeHierarchy(serviceTypeHierarchy);
        setRawData(serviceRawData);
        setIsLoading(false);
      }
      
      // console.log('데이터 새로고침 요청 완료');
    } catch (err) {
      console.error('데이터 새로고침 실패:', err);
      setError(err.message || '데이터 새로고침 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, []);

  // 특정 유형 정보 가져오기
  const getTypeInfo = useCallback((typeId) => {
    return types[typeId] || null;
  }, [types]);

  // 유형 ID로 원본 데이터 찾기
  const getRawDataByTypeId = useCallback((typeId) => {
    const typeInfo = types[typeId];
    if (!typeInfo || !rawData.length) return null;
    
    return rawData.find(item => item.id === typeInfo.id) || null;
  }, [types, rawData]);

  // 레벨 이름으로 유형 ID 찾기
  const getTypeIdByLevelName = useCallback((levelName) => {
    const entry = Object.entries(types).find(([_, typeInfo]) => 
      typeInfo.label === levelName
    );
    return entry ? entry[0] : null;
  }, [types]);

  // 계층 순서대로 정렬된 유형 목록 가져오기
  const getSortedTypes = useCallback(() => {
    return Object.entries(types)
      .sort(([, a], [, b]) => (a.hierarchyOrder || 0) - (b.hierarchyOrder || 0))
      .map(([typeId, typeInfo]) => ({ typeId, ...typeInfo }));
  }, [types]);

  // 특정 유형의 자식 유형들 가져오기
  const getChildTypes = useCallback((typeId) => {
    return typeHierarchy[typeId] || [];
  }, [typeHierarchy]);

  // 특정 유형의 부모 유형 찾기
  const getParentType = useCallback((typeId) => {
    const parentEntry = Object.entries(typeHierarchy).find(([_, children]) => 
      children.includes(typeId)
    );
    return parentEntry ? parentEntry[0] : null;
  }, [typeHierarchy]);

  // 유형 경로 가져오기 (최상위부터 자신까지)
  const getTypePath = useCallback((typeId) => {
    const path = [typeId];
    let currentId = typeId;
    
    while (true) {
      const parentId = getParentType(currentId);
      if (!parentId) break;
      
      path.unshift(parentId);
      currentId = parentId;
    }
    
    return path;
  }, [getParentType]);

  // 모든 부모 유형들 가져오기 (계층 구조)
  const getParentTypes = useCallback((typeId) => {
    const parents = [];
    const findParents = (currentTypeId, visited = new Set()) => {
      if (visited.has(currentTypeId)) return;
      visited.add(currentTypeId);
      
      Object.entries(typeHierarchy).forEach(([parentKey, children]) => {
        if (children.includes(currentTypeId) && !visited.has(parentKey)) {
          const parentType = types[parentKey];
          if (parentType) {
            parents.unshift({ 
              id: parentKey,
              label: parentType.label || parentKey, 
              color: parentType.color || 'default',
              backgroundColor: parentType.backgroundColor,
              borderColor: parentType.borderColor
            });
            findParents(parentKey, visited);
          }
        }
      });
    };
    findParents(typeId);
    return parents;
  }, [types, typeHierarchy]);

  // 하드코딩된 데이터를 동적 데이터로 변환
  const convertToHierarchicalData = useCallback((data, typeField = 'type') => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => {
      const currentType = item[typeField];
      
      // 기존 하드코딩된 유형 정보를 동적 유형으로 변환
      if (typeof currentType === 'object' && currentType.label) {
        const typeId = getTypeIdByLevelName(currentType.label);
        const dynamicTypeInfo = types[typeId];
        
        if (dynamicTypeInfo) {
          return {
            ...item,
            [typeField]: {
              id: typeId,
              label: dynamicTypeInfo.label,
              color: dynamicTypeInfo.color,
              backgroundColor: dynamicTypeInfo.backgroundColor,
              borderColor: dynamicTypeInfo.borderColor
            }
          };
        }
      }
      
      return item;
    });
  }, [types, getTypeIdByLevelName]);

  // 유형별 데이터 생성 헬퍼 함수
  const generateDataByTypes = useCallback((generator) => {
    if (!types || Object.keys(types).length === 0) {
      return [];
    }

    if (typeof generator !== 'function') {
      // console.warn('generateDataByTypes: generator는 함수여야 합니다.');
      return [];
    }

    return generator(types, typeHierarchy, {
      getParentTypes,
      getChildTypes,
      getTypeInfo,
      getSortedTypes
    });
  }, [types, typeHierarchy, getParentTypes, getChildTypes, getTypeInfo, getSortedTypes]);

  // 컴포넌트 마운트 시 자동 초기화
  useEffect(() => {
    if (autoInitialize && !isInitialized && dataServiceRef.current) {
      initializeService();
    }
  }, [autoInitialize, isInitialized, initializeService]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (listenerIdRef.current && dataServiceRef.current?.removeListener) {
        dataServiceRef.current.removeListener(listenerIdRef.current);
        listenerIdRef.current = null;
      }
    };
  }, []);

  return {
    // 상태
    types,
    typeHierarchy,
    rawData,
    isLoading,
    error,
    isInitialized,

    // 액션
    initializeService,
    refreshData,

    // 유틸리티 함수
    getTypeInfo,
    getRawDataByTypeId,
    getTypeIdByLevelName,
    getSortedTypes,
    getChildTypes,
    getParentType,
    getParentTypes,
    getTypePath,
    convertToHierarchicalData,
    generateDataByTypes,

    // 상태 확인
    hasTypes: Object.keys(types).length > 0,
    hasHierarchy: Object.keys(typeHierarchy).length > 0,
    hasData: rawData.length > 0
  };
};

export default useDynamicTypes; 