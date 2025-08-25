import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { saveColumnVisibility, loadColumnVisibility } from '../utils/tableStorage';

/**
 * 테이블 컬럼 표시/숨김 상태를 관리하는 커스텀 훅
 * localStorage를 사용하여 설정을 자동으로 저장/불러오기합니다.
 * 
 * @param {Array} columns - 테이블 컬럼 배열
 * @param {Object} options - 옵션 설정
 * @param {Array} options.defaultHiddenColumns - 기본적으로 숨길 컬럼 ID 배열
 * @param {Array} options.alwaysVisibleColumns - 항상 표시되어야 하는 컬럼 ID 배열 (체크박스, 필수 컬럼 등)
 * @param {string} options.tableId - 테이블 식별자 (localStorage 키로 사용)
 * @returns {Object} 컬럼 표시 관련 상태 및 함수들
 */
const useColumnVisibility = (columns = [], options = {}) => {
  const {
    defaultHiddenColumns = [],
    alwaysVisibleColumns = ['checkbox'], // 체크박스는 기본적으로 항상 표시
    tableId = 'default' // 기본 테이블 ID
  } = options;

  // 초기화 완료 여부 추적
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);

  // columns가 배열이 아닌 경우 빈 배열로 처리
  const safeColumns = useMemo(() => {
    if (!Array.isArray(columns)) {
      // console.warn('useColumnVisibility: columns는 배열이어야 합니다. 빈 배열로 처리합니다.');
      return [];
    }
    return columns;
  }, [columns]);

  // 플랫 컬럼 배열 생성 (그룹 컬럼의 자식 컬럼 포함)
  const flatColumns = useMemo(() => {
    const result = [];
    
    safeColumns.forEach(column => {
      if (column.type === 'group' && Array.isArray(column.children)) {
        column.children.forEach(child => {
          result.push(child);
        });
      } else if (column.type !== 'checkbox') { // 체크박스 컬럼은 제외
        result.push(column);
      }
    });
    
    return result;
  }, [safeColumns]);

  // 컬럼 표시 상태 초기화 (기본값)
  const initializeDefaultVisibility = useCallback(() => {
    const visibility = {};
    
    // 일반 컬럼과 그룹의 자식 컬럼들
    flatColumns.forEach(column => {
      // 항상 표시되어야 하는 컬럼이거나 기본 숨김 목록에 없으면 표시
      visibility[column.id] = !defaultHiddenColumns.includes(column.id);
    });
    
    // 그룹 컬럼들
    safeColumns.forEach(column => {
      if (column.type === 'group' && Array.isArray(column.children)) {
        // 그룹의 모든 자식이 표시되는 경우에만 그룹도 표시
        const allChildrenVisible = column.children.every(child => 
          !defaultHiddenColumns.includes(child.id)
        );
        visibility[column.id] = allChildrenVisible;
      }
    });
    
    return visibility;
  }, [flatColumns, defaultHiddenColumns, safeColumns]);

  // 초기 상태 설정 (localStorage에서 불러오기)
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const defaultVisibility = {};
    
    // 플랫 컬럼들 (그룹의 자식들)
    safeColumns.forEach(column => {
      if (column.type === 'group' && Array.isArray(column.children)) {
        column.children.forEach(child => {
          defaultVisibility[child.id] = !defaultHiddenColumns.includes(child.id);
        });
      } else if (column.type !== 'checkbox') {
        defaultVisibility[column.id] = !defaultHiddenColumns.includes(column.id);
      }
    });
    
    // 그룹 컬럼들
    safeColumns.forEach(column => {
      if (column.type === 'group' && Array.isArray(column.children)) {
        const allChildrenVisible = column.children.every(child => 
          !defaultHiddenColumns.includes(child.id)
        );
        defaultVisibility[column.id] = allChildrenVisible;
      }
    });

    const savedVisibility = loadColumnVisibility(tableId, defaultVisibility);
    
    // 저장된 설정이 현재 컬럼과 일치하는지 확인
    const validatedVisibility = {};
    Object.keys(defaultVisibility).forEach(columnId => {
      validatedVisibility[columnId] = savedVisibility.hasOwnProperty(columnId) 
        ? savedVisibility[columnId] 
        : defaultVisibility[columnId];
    });
    
    return validatedVisibility;
  });

  // 컬럼 구성이 변경될 때만 설정 다시 로드
  useEffect(() => {
    if (flatColumns.length === 0) return;

    const defaultVisibility = initializeDefaultVisibility();
    const savedVisibility = loadColumnVisibility(tableId, defaultVisibility);
    
    // 저장된 설정이 현재 컬럼과 일치하는지 확인
    const validatedVisibility = {};
    flatColumns.forEach(column => {
      validatedVisibility[column.id] = savedVisibility.hasOwnProperty(column.id) 
        ? savedVisibility[column.id] 
        : defaultVisibility[column.id];
    });
    
    // 현재 상태와 다를 때만 업데이트
    const currentKeys = Object.keys(columnVisibility).sort();
    const newKeys = Object.keys(validatedVisibility).sort();
    
    if (currentKeys.length !== newKeys.length || 
        !currentKeys.every(key => newKeys.includes(key))) {
      setColumnVisibility(validatedVisibility);
    }
    
    isInitialized.current = true;
  }, [flatColumns.length, tableId]); // flatColumns 자체가 아닌 length만 의존성으로 사용

  // 설정 변경 시 localStorage에 디바운스된 저장
  useEffect(() => {
    if (!isInitialized.current) return;

    // 이전 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 300ms 후에 저장 (디바운스)
    saveTimeoutRef.current = setTimeout(() => {
      saveColumnVisibility(tableId, columnVisibility);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [columnVisibility, tableId]);

  // 컬럼 표시/숨김 토글
  const toggleColumnVisibility = useCallback((columnId) => {
    // 항상 표시되어야 하는 컬럼은 토글하지 않음
    if (alwaysVisibleColumns.includes(columnId)) {
      // console.warn(`컬럼 '${columnId}'는 항상 표시되어야 하므로 숨길 수 없습니다.`);
      return;
    }

    // 그룹 컬럼인지 확인
    const groupColumn = safeColumns.find(col => col.id === columnId && col.type === 'group');
    
    if (groupColumn && Array.isArray(groupColumn.children)) {
      // 그룹 컬럼의 경우 모든 자식 컬럼을 함께 토글
      const newVisibility = !columnVisibility[columnId];
      
      setColumnVisibility(prev => {
        const updated = { ...prev };
        
        // 그룹 컬럼 자체 토글
        updated[columnId] = newVisibility;
        
        // 모든 자식 컬럼도 같은 상태로 설정
        groupColumn.children.forEach(child => {
          if (!alwaysVisibleColumns.includes(child.id)) {
            updated[child.id] = newVisibility;
          }
        });
        
        return updated;
      });
    } else {
      // 일반 컬럼의 경우 기존 로직
      setColumnVisibility(prev => ({
        ...prev,
        [columnId]: !prev[columnId]
      }));
    }
  }, [alwaysVisibleColumns, safeColumns, columnVisibility]);

  // 모든 컬럼 표시
  const showAllColumns = useCallback(() => {
    const newVisibility = {};
    flatColumns.forEach(column => {
      newVisibility[column.id] = true;
    });
    setColumnVisibility(newVisibility);
  }, [flatColumns]);

  // 기본 상태로 초기화
  const resetToDefault = useCallback(() => {
    setColumnVisibility(initializeDefaultVisibility());
  }, [initializeDefaultVisibility]);

  // 표시되는 컬럼만 필터링
  const visibleColumns = useMemo(() => {
    const result = safeColumns.filter(column => {
      if (column.type === 'checkbox') {
        return true; // 체크박스는 항상 표시
      }
      
      if (column.type === 'group' && Array.isArray(column.children)) {
        // 그룹 컬럼의 경우 자식 중 하나라도 표시되면 그룹도 표시
        return column.children.some(child => columnVisibility[child.id]);
      }
      
      return columnVisibility[column.id];
    }).map(column => {
      if (column.type === 'group' && Array.isArray(column.children)) {
        // 그룹 컬럼의 경우 표시되는 자식만 포함
        return {
          ...column,
          children: column.children.filter(child => columnVisibility[child.id])
        };
      }
      
      return column;
    });
    
    // 디버깅: no 컬럼의 타입 확인
    // const noColumn = result.find(col => col.id === 'no');
    // if (noColumn) {
    //   console.log('useColumnVisibility no 컬럼:', noColumn);
    // }
    
    return result;
  }, [safeColumns, columnVisibility]);

  // 숨겨진 컬럼 개수
  const hiddenColumnsCount = useMemo(() => {
    return flatColumns.filter(column => !columnVisibility[column.id]).length;
  }, [flatColumns, columnVisibility]);

  // 표시 가능한 컬럼 목록 (체크박스 제외)
  const toggleableColumns = useMemo(() => {
    // 그룹 컬럼과 일반 컬럼을 모두 포함
    const result = [];
    
    safeColumns.forEach(column => {
      if (column.type === 'checkbox') {
        return; // 체크박스는 제외
      }
      
      if (alwaysVisibleColumns.includes(column.id)) {
        return; // 항상 표시되는 컬럼은 제외
      }
      
      if (column.type === 'group' && Array.isArray(column.children)) {
        // 그룹 컬럼 추가 (자식 컬럼도 포함)
        result.push(column);
      } else {
        // 일반 컬럼 추가
        result.push(column);
      }
    });
    
    return result;
  }, [safeColumns, alwaysVisibleColumns]);

  return {
    // 상태
    columnVisibility,
    visibleColumns,
    hiddenColumnsCount,
    toggleableColumns,
    
    // 함수
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault,
    setColumnVisibility
  };
};

export default useColumnVisibility; 