import { useState, useCallback, useEffect, useRef } from 'react';
import { saveColumnOrder, loadColumnOrder, savePinnedColumns, loadPinnedColumns } from '../utils/tableStorage';

/**
 * 테이블 컬럼 드래그 앤 드롭 기능을 위한 커스텀 훅
 * localStorage를 사용하여 컬럼 순서와 고정 설정을 자동으로 저장/불러오기합니다.
 * 
 * @param {Object} options
 * @param {Array} options.initialColumns - 초기 컬럼 배열
 * @param {Function} options.onColumnOrderChange - 컬럼 순서 변경 시 콜백 함수
 * @param {Array} options.initialPinnedColumns - 초기 고정 컬럼 ID 배열
 * @param {string} options.tableId - 테이블 식별자 (localStorage 키로 사용)
 * @param {boolean} options.enableColumnPinning - 컬럼 고정 기능 활성화 여부
 * @param {string} options.version - 컬럼 정의 버전 (버전이 다르면 캐시 무효화)
 * @returns {Object} 컬럼 드래그 앤 드롭 관련 상태 및 핸들러
 */
const useTableColumnDrag = ({
  initialColumns = [],
  onColumnOrderChange,
  initialPinnedColumns = ['checkbox', 'number', 'userId'], // 기본 고정 컬럼
  tableId = 'default', // 기본 테이블 ID
  enableColumnPinning = true,
  version = '1.0' // 기본 버전
} = {}) => {
  // 초기화 완료 여부 추적
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);
  const pinnedSaveTimeoutRef = useRef(null);

  // 버전 체크 및 캐시 무효화
  useEffect(() => {
    const versionKey = `table_version_${tableId}`;
    const savedVersion = localStorage.getItem(versionKey);
    
    if (savedVersion !== version) {
      // 버전이 다르면 해당 테이블의 모든 설정 초기화
      console.log(`테이블 ${tableId}의 버전이 변경되었습니다. 캐시를 초기화합니다.`);
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(`_${tableId}`)) {
          localStorage.removeItem(key);
        }
      });
      // 새 버전 저장
      localStorage.setItem(versionKey, version);
    }
  }, [tableId, version]);

  // 컬럼 상태 관리 (초기값을 localStorage에서 불러오기)
  const [columns, setColumns] = useState(() => {
    const savedColumns = loadColumnOrder(tableId, initialColumns);
    
    // 저장된 컬럼이 현재 초기 컬럼과 일치하는지 검증
    if (savedColumns.length === 0 || savedColumns.length !== initialColumns.length) {
      return initialColumns;
    }
    
    // 컬럼 ID 기반으로 검증
    const initialColumnIds = new Set(initialColumns.map(col => col.id));
    const savedColumnIds = new Set(savedColumns.map(col => col.id));
    
    // 컬럼 구성이 변경되었으면 초기 컬럼 사용
    if (initialColumnIds.size !== savedColumnIds.size || 
        ![...initialColumnIds].every(id => savedColumnIds.has(id))) {
      // console.warn('저장된 컬럼 구성이 현재 구성과 다릅니다. 초기 컬럼을 사용합니다.');
      return initialColumns;
    }
    
    return savedColumns;
  });
  
  // 고정 컬럼 상태 관리 (초기값을 localStorage에서 불러오기)
  const [pinnedColumns, setPinnedColumns] = useState(() => {
    return loadPinnedColumns(tableId, initialPinnedColumns);
  });
  
  // 드래그 중인 컬럼 정보
  const [dragInfo, setDragInfo] = useState({
    dragging: false,
    columnId: null,
    isGroupColumn: false,
    parentGroupId: null
  });

  // 초기 컬럼이 변경될 때만 저장된 설정 다시 로드
  useEffect(() => {
    if (initialColumns.length === 0) return;

    const savedColumns = loadColumnOrder(tableId, initialColumns);
    
    // 저장된 컬럼이 현재 초기 컬럼과 일치하는지 검증
    if (savedColumns.length === 0 || savedColumns.length !== initialColumns.length) {
      if (JSON.stringify(columns) !== JSON.stringify(initialColumns)) {
        setColumns(initialColumns);
      }
      isInitialized.current = true;
      return;
    }
    
    // 컬럼 ID 기반으로 검증
    const initialColumnIds = new Set(initialColumns.map(col => col.id));
    const savedColumnIds = new Set(savedColumns.map(col => col.id));
    
    // 컬럼 구성이 변경되었으면 초기 컬럼 사용
    if (initialColumnIds.size !== savedColumnIds.size || 
        ![...initialColumnIds].every(id => savedColumnIds.has(id))) {
      // console.warn('저장된 컬럼 구성이 현재 구성과 다릅니다. 초기 컬럼을 사용합니다.');
      if (JSON.stringify(columns) !== JSON.stringify(initialColumns)) {
        setColumns(initialColumns);
      }
    } else {
      // 현재 상태와 다를 때만 업데이트
      if (JSON.stringify(columns) !== JSON.stringify(savedColumns)) {
        setColumns(savedColumns);
      }
    }
    
    isInitialized.current = true;
  }, [initialColumns.length, tableId]); // initialColumns 자체가 아닌 length만 의존성으로 사용

  // 고정 컬럼 초기화
  useEffect(() => {
    const savedPinnedColumns = loadPinnedColumns(tableId, initialPinnedColumns);
    if (JSON.stringify(pinnedColumns) !== JSON.stringify(savedPinnedColumns)) {
      setPinnedColumns(savedPinnedColumns);
    }
  }, [tableId]); // initialPinnedColumns는 의존성에서 제외

  // 컬럼 순서 변경 시 localStorage에 디바운스된 저장
  useEffect(() => {
    if (!isInitialized.current) return;

    // 이전 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 300ms 후에 저장 (디바운스)
    saveTimeoutRef.current = setTimeout(() => {
      saveColumnOrder(tableId, columns);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [columns, tableId]);

  // 고정 컬럼 변경 시 localStorage에 디바운스된 저장
  useEffect(() => {
    if (!isInitialized.current) return;

    // 이전 타이머 취소
    if (pinnedSaveTimeoutRef.current) {
      clearTimeout(pinnedSaveTimeoutRef.current);
    }

    // 300ms 후에 저장 (디바운스)
    pinnedSaveTimeoutRef.current = setTimeout(() => {
      savePinnedColumns(tableId, pinnedColumns);
    }, 300);

    return () => {
      if (pinnedSaveTimeoutRef.current) {
        clearTimeout(pinnedSaveTimeoutRef.current);
      }
    };
  }, [pinnedColumns, tableId]);

  // 컬럼이 고정되어 있는지 확인
  const isColumnPinned = useCallback((columnId) => {
    return pinnedColumns.includes(columnId);
  }, [pinnedColumns]);

  // 컬럼 고정/해제 토글
  const toggleColumnPin = useCallback((columnId) => {
    setPinnedColumns(prev => {
      if (prev.includes(columnId)) {
        // 고정 해제
        return prev.filter(id => id !== columnId);
      } else {
        // 고정 추가 (마지막에 추가)
        return [...prev, columnId];
      }
    });
  }, []);

  // 모든 고정 컬럼 해제
  const clearAllPinnedColumns = useCallback(() => {
    setPinnedColumns([]);
  }, []);

  // 기본 고정 컬럼 설정 (체크박스, 번호, 사용자ID)
  const setDefaultPinnedColumns = useCallback(() => {
    setPinnedColumns(initialPinnedColumns);
  }, [initialPinnedColumns]);

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((event, columnId, isGroupColumn = false, parentGroupId = null) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('columnId', columnId);
    event.dataTransfer.setData('isGroupColumn', String(isGroupColumn));
    event.dataTransfer.setData('parentGroupId', parentGroupId || '');
    
    setDragInfo({
      dragging: true,
      columnId,
      isGroupColumn,
      parentGroupId
    });
    
    // Firefox에서 드래그 이미지를 설정하기 위한 트릭
    if (event.dataTransfer.setDragImage) {
      const elem = event.currentTarget;
      event.dataTransfer.setDragImage(elem, 10, 10);
    }
  }, []);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    setDragInfo({
      dragging: false,
      columnId: null,
      isGroupColumn: false,
      parentGroupId: null
    });
  }, []);

  // 드래그 오버 핸들러
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 드랍 핸들러
  const handleDrop = useCallback((event, targetColumnId, isTargetGroupColumn = false, targetParentGroupId = null) => {
    event.preventDefault();
    
    const sourceColumnId = event.dataTransfer.getData('columnId');
    const isSourceGroupColumn = event.dataTransfer.getData('isGroupColumn') === 'true';
    const sourceParentGroupId = event.dataTransfer.getData('parentGroupId') || null;
    
    // 소스와 타겟이 같으면 아무것도 하지 않음
    if (sourceColumnId === targetColumnId) return;

    // 영역 간 이동 처리를 위한 헬퍼 함수들
    const isSourcePinned = pinnedColumns.includes(sourceColumnId);
    const isTargetPinned = pinnedColumns.includes(targetColumnId);
    
    // enableColumnPinning이 비활성화된 경우 영역 간 이동 로직 건너뛰기
    let isDropInPinnedArea = false;
    let allRenderColumns = [];
    let pinnedColumnsInOrder = [];
    let lastPinnedColumnIndex = -1;
    let targetColumnIndex = -1;
    
    if (enableColumnPinning) {
      // 실제 렌더링되는 컬럼 순서를 기준으로 고정영역과 비고정영역 구분
      columns.forEach(column => {
        if (column.type === 'group' && Array.isArray(column.children)) {
          column.children.forEach(child => {
            allRenderColumns.push(child.id);
          });
        } else {
          allRenderColumns.push(column.id);
        }
      });
      
      // 고정된 컬럼들의 실제 순서
      pinnedColumnsInOrder = allRenderColumns.filter(colId => pinnedColumns.includes(colId));
      lastPinnedColumnIndex = pinnedColumnsInOrder.length > 0 
        ? allRenderColumns.indexOf(pinnedColumnsInOrder[pinnedColumnsInOrder.length - 1])
        : -1;
      
      // 타겟 컬럼의 위치 인덱스
      targetColumnIndex = allRenderColumns.indexOf(targetColumnId);
      
      // 드롭 위치가 고정영역인지 비고정영역인지 판단
      isDropInPinnedArea = targetColumnIndex <= lastPinnedColumnIndex;
      
      // console.log('드래그 앤 드롭 영역 분석:', {
      //   sourceColumnId,
      //   targetColumnId,
      //   isSourcePinned,
      //   isTargetPinned,
      //   targetColumnIndex,
      //   lastPinnedColumnIndex,
      //   isDropInPinnedArea,
      //   pinnedColumnsInOrder
      // });
    }

    // 컬럼 이동 로직
    let newColumns = [...columns];
    let newPinnedColumns = [...pinnedColumns];
    
    // 1. 그룹 컬럼이 그룹 컬럼으로 이동하는 경우
    if (isSourceGroupColumn && isTargetGroupColumn) {
      const sourceIndex = newColumns.findIndex(col => col.id === sourceColumnId);
      const targetIndex = newColumns.findIndex(col => col.id === targetColumnId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        // 소스 컬럼 제거
        const [sourceColumn] = newColumns.splice(sourceIndex, 1);
        
        // 소스를 제거한 후 타겟 인덱스가 변경될 수 있으므로 다시 계산
        const newTargetIndex = newColumns.findIndex(col => col.id === targetColumnId);
        
        // 방향에 따라 타겟 위치 조정 (왼쪽→오른쪽: 타겟 다음 위치, 오른쪽→왼쪽: 타겟 위치)
        const insertIndex = sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
        
        // 타겟 위치에 소스 컬럼 삽입
        newColumns.splice(insertIndex, 0, sourceColumn);
        
        // 고정 상태 업데이트
        if (enableColumnPinning) {
          if (isDropInPinnedArea && !isSourcePinned) {
            // 비고정영역 → 고정영역: 고정 추가
            newPinnedColumns.push(sourceColumnId);
            // console.log(`컬럼 ${sourceColumnId}을(를) 고정영역으로 이동하여 고정 추가`);
          } else if (!isDropInPinnedArea && isSourcePinned) {
            // 고정영역 → 비고정영역: 고정 해제
            newPinnedColumns = newPinnedColumns.filter(id => id !== sourceColumnId);
            // console.log(`컬럼 ${sourceColumnId}을(를) 비고정영역으로 이동하여 고정 해제`);
          }
        }
      }
    }
    // 2. 일반 컬럼이 일반 컬럼으로 이동하는 경우 (그룹 외부 -> 그룹 외부)
    else if (!isSourceGroupColumn && !isTargetGroupColumn && !sourceParentGroupId && !targetParentGroupId) {
      const sourceIndex = newColumns.findIndex(col => col.id === sourceColumnId);
      const targetIndex = newColumns.findIndex(col => col.id === targetColumnId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        // 소스 컬럼 제거
        const [sourceColumn] = newColumns.splice(sourceIndex, 1);
        
        // 소스를 제거한 후 타겟 인덱스가 변경될 수 있으므로 다시 계산
        const newTargetIndex = newColumns.findIndex(col => col.id === targetColumnId);
        
        // 방향에 따라 타겟 위치 조정 (왼쪽→오른쪽: 타겟 다음 위치, 오른쪽→왼쪽: 타겟 위치)
        const insertIndex = sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
        
        // 타겟 위치에 소스 컬럼 삽입
        newColumns.splice(insertIndex, 0, sourceColumn);
        
        // 고정 상태 업데이트
        if (enableColumnPinning) {
          if (isDropInPinnedArea && !isSourcePinned) {
            // 비고정영역 → 고정영역: 고정 추가
            newPinnedColumns.push(sourceColumnId);
            // console.log(`컬럼 ${sourceColumnId}을(를) 고정영역으로 이동하여 고정 추가`);
          } else if (!isDropInPinnedArea && isSourcePinned) {
            // 고정영역 → 비고정영역: 고정 해제
            newPinnedColumns = newPinnedColumns.filter(id => id !== sourceColumnId);
            // console.log(`컬럼 ${sourceColumnId}을(를) 비고정영역으로 이동하여 고정 해제`);
          }
        }
      }
    }
    // 3. 그룹 내부의 컬럼이 같은 그룹 내부의 다른 컬럼으로 이동하는 경우
    else if (sourceParentGroupId && targetParentGroupId && sourceParentGroupId === targetParentGroupId) {
      const groupIndex = newColumns.findIndex(col => col.id === sourceParentGroupId);
      
      if (groupIndex !== -1 && newColumns[groupIndex].children) {
        let children = [...newColumns[groupIndex].children];
        const sourceChildIndex = children.findIndex(child => child.id === sourceColumnId);
        const targetChildIndex = children.findIndex(child => child.id === targetColumnId);
        
        if (sourceChildIndex !== -1 && targetChildIndex !== -1) {
          // 소스 자식 컬럼 제거
          const [sourceChild] = children.splice(sourceChildIndex, 1);
          
          // 소스를 제거한 후 타겟 인덱스가 변경될 수 있으므로, 다시 계산
          const newTargetChildIndex = children.findIndex(child => child.id === targetColumnId);
          
          // 방향에 따라 타겟 위치 조정 (왼쪽→오른쪽: 타겟 다음 위치, 오른쪽→왼쪽: 타겟 위치)
          const insertIndex = sourceChildIndex < targetChildIndex ? newTargetChildIndex + 1 : newTargetChildIndex;
          
          // 타겟 위치에 소스 자식 컬럼 삽입
          children.splice(insertIndex, 0, sourceChild);
          
          // 수정된 자식 배열로 업데이트
          newColumns[groupIndex].children = children;
          
          // 그룹 내부 이동의 경우에도 고정 상태 업데이트
          if (enableColumnPinning) {
            if (isDropInPinnedArea && !isSourcePinned) {
              // 비고정영역 → 고정영역: 고정 추가
              newPinnedColumns.push(sourceColumnId);
              // console.log(`그룹 내 컬럼 ${sourceColumnId}을(를) 고정영역으로 이동하여 고정 추가`);
            } else if (!isDropInPinnedArea && isSourcePinned) {
              // 고정영역 → 비고정영역: 고정 해제
              newPinnedColumns = newPinnedColumns.filter(id => id !== sourceColumnId);
              // console.log(`그룹 내 컬럼 ${sourceColumnId}을(를) 비고정영역으로 이동하여 고정 해제`);
            }
          }
        }
      }
    }
    // 4. 그룹 컬럼이 일반 컬럼으로 이동하는 경우 또는 일반 컬럼이 그룹 컬럼으로 이동하는 경우
    else if ((isSourceGroupColumn && !isTargetGroupColumn && !targetParentGroupId) || 
             (!isSourceGroupColumn && !sourceParentGroupId && isTargetGroupColumn)) {
      const sourceIndex = newColumns.findIndex(col => col.id === sourceColumnId);
      const targetIndex = newColumns.findIndex(col => col.id === targetColumnId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        // 소스 컬럼 제거
        const [sourceColumn] = newColumns.splice(sourceIndex, 1);
        
        // 소스를 제거한 후 타겟 인덱스가 변경될 수 있으므로 다시 계산
        const newTargetIndex = newColumns.findIndex(col => col.id === targetColumnId);
        
        // 방향에 따라 타겟 위치 조정 (왼쪽→오른쪽: 타겟 다음 위치, 오른쪽→왼쪽: 타겟 위치)
        const insertIndex = sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
        
        // 타겟 위치에 소스 컬럼 삽입
        newColumns.splice(insertIndex, 0, sourceColumn);
        
        // 고정 상태 업데이트
        if (enableColumnPinning) {
          if (isDropInPinnedArea && !isSourcePinned) {
            // 비고정영역 → 고정영역: 고정 추가
            newPinnedColumns.push(sourceColumnId);
            // console.log(`컬럼 ${sourceColumnId}을(를) 고정영역으로 이동하여 고정 추가`);
          } else if (!isDropInPinnedArea && isSourcePinned) {
            // 고정영역 → 비고정영역: 고정 해제
            newPinnedColumns = newPinnedColumns.filter(id => id !== sourceColumnId);
            // console.log(`컬럼 ${sourceColumnId}을(를) 비고정영역으로 이동하여 고정 해제`);
          }
        }
      }
    }
    // 5. 다른 케이스들은 허용하지 않음 (주의사항에 따라)
    
    setColumns(newColumns);
    
    // 고정 컬럼 상태 업데이트
    if (enableColumnPinning && JSON.stringify(newPinnedColumns) !== JSON.stringify(pinnedColumns)) {
      setPinnedColumns(newPinnedColumns);
      // console.log('고정 컬럼 상태 업데이트:', newPinnedColumns);
    }
    
    if (onColumnOrderChange) {
      onColumnOrderChange(newColumns);
    }
  }, [columns, pinnedColumns, onColumnOrderChange, enableColumnPinning]);

  // 컬럼 배열 업데이트 함수
  const updateColumns = useCallback((newColumns) => {
    setColumns(newColumns);
  }, []);

  return {
    // 상태
    columns,
    dragInfo,
    pinnedColumns,
    enableColumnPinning,
    
    // 핸들러
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateColumns,
    isColumnPinned,
    toggleColumnPin,
    clearAllPinnedColumns,
    setDefaultPinnedColumns
  };
};

export default useTableColumnDrag; 