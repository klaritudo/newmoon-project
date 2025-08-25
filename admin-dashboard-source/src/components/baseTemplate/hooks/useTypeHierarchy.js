import { useState, useCallback, useMemo } from 'react';

/**
 * 유형 계층 구조를 관리하는 커스텀 훅
 * 테이블의 유형 계층화와 접기/펴기 기능을 제공합니다.
 * 
 * @param {Object} options
 * @param {Array} options.data - 원본 테이블 데이터
 * @param {Object} options.types - 유형 정의 객체 (예: { 'super': { label: '슈퍼', color: 'red' } })
 * @param {Object} options.typeHierarchy - 유형 계층 구조 (예: { 'super': ['hq'], 'hq': ['subhq'] })
 * @param {string} options.typeField - 데이터 항목에서 유형 정보가 있는 필드 이름 (기본값: 'type')
 * @param {boolean} options.expandAll - 초기에 모든 계층을 펼칠지 여부 (기본값: true)
 * @returns {Object} 계층 구조 관련 상태 및 핸들러
 */
const useTypeHierarchy = ({
  data = [],
  types = {},
  typeHierarchy = {},
  typeField = 'type',
  expandAll = true
} = {}) => {
  // 펼쳐진 유형 상태 - 기본적으로 모두 펼쳐진 상태로 시작
  const [expandedTypes, setExpandedTypes] = useState(
    expandAll 
      ? Object.keys(types).reduce((acc, typeId) => ({ ...acc, [typeId]: true }), {})
      : {}
  );

  // 유형 레벨별로 들여쓰기 값 계산
  const typeLevelMap = useMemo(() => {
    const result = {};
    
    // 재귀적으로 레벨 계산
    const calculateLevel = (typeId, level = 0) => {
      result[typeId] = level;
      
      if (typeHierarchy[typeId]) {
        typeHierarchy[typeId].forEach(childTypeId => {
          calculateLevel(childTypeId, level + 1);
        });
      }
    };
    
    // 최상위 유형 찾기 (다른 유형의 자식이 아닌 유형)
    const rootTypeIds = Object.keys(typeHierarchy).filter(typeId => {
      return !Object.values(typeHierarchy).some(children => 
        Array.isArray(children) && children.includes(typeId)
      );
    });
    
    // 각 최상위 유형부터 레벨 계산 시작
    rootTypeIds.forEach(rootTypeId => {
      calculateLevel(rootTypeId);
    });
    
    return result;
  }, [typeHierarchy]);
  
  // 유형 ID로 변환하는 함수
  const getTypeId = useCallback((item) => {
    if (!item || !item[typeField]) return null;
    
    // 객체이고 label 속성이 있는 경우
    if (typeof item[typeField] === 'object' && item[typeField].label) {
      const typeLabel = item[typeField].label;
      return Object.keys(types).find(key => types[key].label === typeLabel) || null;
    }
    
    // 직접 id가 있는 경우
    if (typeof item[typeField] === 'object' && item[typeField].id) {
      return item[typeField].id;
    }
    
    // 문자열인 경우 직접 사용
    if (typeof item[typeField] === 'string') {
      // 문자열이 유형 라벨과 일치하는지 확인
      const typeId = Object.keys(types).find(key => types[key].label === item[typeField]);
      if (typeId) return typeId;
      
      // 아니면 그대로 사용
      return item[typeField];
    }
    
    return null;
  }, [types, typeField]);
  
  // 항목의 ID로 항목 찾기
  const findItemById = useCallback((id) => {
    if (id === undefined || id === null) return null;
    
    // ID가 숫자형인 경우 문자열로 변환 (비교 안정성을 위해)
    const itemId = typeof id === 'number' ? id.toString() : id;
    
    // 재귀적으로 모든 항목을 검색
    const findInItems = (items) => {
      if (!items || !items.length) return null;
      
      for (const item of items) {
        if (!item) continue;
        
        // ID 비교 (문자열로 변환하여 비교)
        const currentId = typeof item.id === 'number' ? item.id.toString() : item.id;
        if (currentId === itemId) return item;
        
        // 자식 항목 검색
        if (item.children && item.children.length) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    return findInItems(data);
  }, [data]);
  
  // 계층 구조로 변환된 테이블 데이터
  const hierarchicalData = useMemo(() => {
    // 유형별로 데이터 그룹화 (order 순서대로)
    const groupedByType = {};
    const sortedTypeIds = Object.keys(types).sort((a, b) => {
      const aOrder = types[a]?.order ?? types[a]?.hierarchyOrder ?? 999;
      const bOrder = types[b]?.order ?? types[b]?.hierarchyOrder ?? 999;
      return aOrder - bOrder;
    });
    
    sortedTypeIds.forEach(typeId => {
      groupedByType[typeId] = data.filter(item => {
        const itemTypeId = getTypeId(item);
        return itemTypeId === typeId;
      });
    });
    
    // 새로운 계층 구조 생성
    const buildHierarchyFromTypes = () => {
      const result = [];
      
      // 최상위 유형 찾기
      const rootTypeIds = Object.keys(typeHierarchy).filter(typeId => {
        return !Object.values(typeHierarchy).some(children => 
          Array.isArray(children) && children.includes(typeId)
        );
      });
      
      // order 순서대로 정렬
      rootTypeIds.sort((a, b) => {
        const aOrder = types[a]?.order ?? types[a]?.hierarchyOrder ?? 999;
        const bOrder = types[b]?.order ?? types[b]?.hierarchyOrder ?? 999;
        return aOrder - bOrder;
      });
      
      // 재귀적으로 계층 구조 생성
      const buildChildrenForType = (typeId) => {
        const itemsOfType = groupedByType[typeId] || [];
        const childTypeIds = typeHierarchy[typeId] || [];
        
        // 현재 유형의 모든 항목에 자식 유형의 항목들을 추가
        return itemsOfType.map(item => {
          const children = childTypeIds.flatMap(childTypeId => 
            buildChildrenForType(childTypeId)
          );
          
          return {
            ...item,
            level: typeLevelMap[typeId] || 0,
            children: children.length > 0 ? children : undefined
          };
        });
      };
      
      // 최상위 유형부터 계층 구조 생성
      rootTypeIds.forEach(rootTypeId => {
        result.push(...buildChildrenForType(rootTypeId));
      });
      
      return result;
    };
    
    // 이미 있는 계층 구조에 레벨 정보 추가
    const enhanceExistingHierarchy = () => {
      const enhanceItems = (items, parentLevel = 0) => {
        if (!items) return [];
        
        return items.map(item => {
          const typeId = getTypeId(item);
          const level = typeId ? typeLevelMap[typeId] || 0 : parentLevel;
          
          return {
            ...item,
            level,
            children: item.children 
              ? enhanceItems(item.children, level + 1) 
              : undefined
          };
        });
      };
      
      return enhanceItems(data);
    };
    
    // 데이터 자체에 계층 구조가 있는지 확인
    const hasExistingHierarchy = data.some(item => Array.isArray(item.children) && item.children.length > 0);
    
    return hasExistingHierarchy 
      ? enhanceExistingHierarchy() 
      : buildHierarchyFromTypes();
  }, [data, types, typeHierarchy, getTypeId, typeLevelMap]);
  
  // 평탄화된 데이터 (펼쳐진 상태 반영)
  const flattenedData = useMemo(() => {
    const result = [];
    
    const flattenItems = (items, parentVisible = true) => {
      if (!items) return;
      
      items.forEach(item => {
        const typeId = getTypeId(item);
        const isExpanded = typeId ? expandedTypes[typeId] : true; // 유형 ID가 없으면 항상 표시
        
        // 부모가 보이는 경우에만 현재 항목 추가
        if (parentVisible) {
          result.push(item);
        }
        
        // 확장된 경우에만 자식 항목 처리
        if (item.children && isExpanded) {
          flattenItems(item.children, parentVisible);
        }
      });
    };
    
    flattenItems(hierarchicalData);
    return result;
  }, [hierarchicalData, expandedTypes, getTypeId]);
  
  // 계층형 데이터의 총 항목 수 계산 (재귀적)
  const getTotalItemCount = useCallback((items = hierarchicalData) => {
    if (!items || !items.length) return 0;
    
    let count = 0;
    items.forEach(item => {
      count++;
      
      if (item.children && item.children.length > 0) {
        count += getTotalItemCount(item.children);
      }
    });
    
    return count;
  }, [hierarchicalData]);
  
  // 현재 펼쳐진 상태에서의 보이는 항목 수
  const getVisibleItemCount = useCallback((items = hierarchicalData) => {
    if (!items || !items.length) return 0;
    
    let count = 0;
    items.forEach(item => {
      const typeId = getTypeId(item);
      const isExpanded = typeId ? expandedTypes[typeId] : true;
      
      count++; // 현재 항목 카운트
      
      // 확장된 경우에만 자식 항목 카운트
      if (item.children && item.children.length > 0 && isExpanded) {
        count += getVisibleItemCount(item.children);
      }
    });
    
    return count;
  }, [hierarchicalData, expandedTypes, getTypeId]);
  
  // 총 항목 수 (모든 계층 포함)
  const totalItemCount = useMemo(() => getTotalItemCount(), [getTotalItemCount]);
  
  // 현재 보이는 항목 수 (펼쳐진 상태 기준)
  const visibleItemCount = useMemo(() => getVisibleItemCount(), [getVisibleItemCount]);
  
  // 유형 토글 핸들러
  const toggleTypeExpand = useCallback((typeId) => {
    if (!typeId) return;
    
    setExpandedTypes(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  }, []);
  
  // 행의 유형 토글 핸들러
  const toggleRowExpand = useCallback((rowOrId) => {
    // ID만 전달받은 경우 항목 찾기
    const row = typeof rowOrId === 'object' && rowOrId !== null
      ? rowOrId
      : findItemById(rowOrId);
    
    if (!row) {
      // console.warn('[useTypeHierarchy] 항목을 찾을 수 없습니다:', rowOrId);
      return;
    }
    
    const typeId = getTypeId(row);
    if (typeId) {
      toggleTypeExpand(typeId);
    } else {
      // console.warn('[useTypeHierarchy] 해당 행에 유형 정보가 없습니다:', row);
    }
  }, [getTypeId, toggleTypeExpand, findItemById]);
  
  // 모든 유형 펼치기/접기
  const setAllExpanded = useCallback((expanded) => {
    const newState = {};
    
    Object.keys(types).forEach(typeId => {
      newState[typeId] = expanded;
    });
    
    setExpandedTypes(newState);
  }, [types]);
  
  // 유형이 확장되었는지 확인
  const isTypeExpanded = useCallback((typeId) => {
    return !!expandedTypes[typeId];
  }, [expandedTypes]);
  
  // 항목이 자식을 가지고 있는지 확인
  const hasChildren = useCallback((item) => {
    return item && item.children && item.children.length > 0;
  }, []);
  
  // 특정 유형의 모든 자식 유형 가져오기
  const getChildTypes = useCallback((typeId) => {
    if (!typeHierarchy[typeId]) return [];
    
    const result = [...typeHierarchy[typeId]];
    typeHierarchy[typeId].forEach(childId => {
      result.push(...getChildTypes(childId));
    });
    
    return result;
  }, [typeHierarchy]);
  
  // 유형 경로 가져오기 (최상위부터 자신까지)
  const getTypePath = useCallback((typeId) => {
    if (!types[typeId]) return [];
    
    // 부모 유형 찾기
    const findParent = (id) => {
      return Object.entries(typeHierarchy).find(
        ([parentId, children]) => children.includes(id)
      )?.[0];
    };
    
    // 경로 구성
    const path = [typeId];
    let currentId = typeId;
    
    while (true) {
      const parentId = findParent(currentId);
      if (!parentId) break;
      
      path.unshift(parentId);
      currentId = parentId;
    }
    
    return path;
  }, [types, typeHierarchy]);
  
  return {
    // 상태
    expandedTypes,
    hierarchicalData,
    flattenedData,
    typeLevelMap,
    
    // 유틸리티 함수
    getTypeId,
    isTypeExpanded,
    hasChildren,
    findItemById,
    getChildTypes,
    getTypePath,
    
    // 핸들러
    toggleTypeExpand,
    toggleRowExpand,
    setAllExpanded,
    
    // 설정 함수
    setExpandedTypes,
    
    // 총 항목 수 (모든 계층 포함)
    totalItemCount,
    
    // 현재 보이는 항목 수 (펼쳐진 상태 기준)
    visibleItemCount
  };
};

export default useTypeHierarchy; 