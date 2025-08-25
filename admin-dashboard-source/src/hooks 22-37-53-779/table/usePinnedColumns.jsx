import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * 컬럼 고정 관리 훅
 * 테이블 컬럼 고정 기능 관리
 * 
 * @param {Object} options 설정 옵션
 * @param {Object} options.gridApi AG Grid API 객체
 * @param {Object} options.columnApi AG Grid Column API 객체
 * @param {Array} options.defaultPinnedColumns 기본 고정 컬럼 ID 배열 (기본값: [])
 * @param {string} options.storageKey 로컬 스토리지에 저장할 때 사용할 키 (기본값: 'pinnedColumns')
 * @param {boolean} options.persistState 상태 저장 여부 (기본값: true)
 * @param {Function} options.onPinnedColumnsChange 고정된 컬럼 목록 변경 시 호출될 콜백 함수 (옵션)
 * @param {Function} options.onHasPinnedColumnsChange 고정 상태 변경 시 호출될 콜백 함수 (옵션)
 * @returns {Object} 컬럼 고정 관련 상태 및 함수
 */
const usePinnedColumns = ({
  gridApi,
  columnApi,
  defaultPinnedColumns = [],
  storageKey = 'pinnedColumns',
  persistState = true,
  onPinnedColumnsChange = null,
  onHasPinnedColumnsChange = null
}) => {
  // 고정된 컬럼 상태
  const [hasPinnedColumns, setHasPinnedColumns] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState(defaultPinnedColumns);
  
  // 초기 설정 완료 여부 추적
  const initializedRef = useRef(false);
  // 마지막으로 적용된 기본 컬럼 추적
  const lastDefaultColumnsRef = useRef(defaultPinnedColumns);
  // 이벤트 처리 중복 방지를 위한 ref
  const isProcessingRef = useRef(false);

  // 상태 설정 함수들에 콜백 추가
  const setPinnedColumnsWithCallback = useCallback((newColumns) => {
    setPinnedColumns(newColumns);
    if (onPinnedColumnsChange) {
      onPinnedColumnsChange(newColumns);
    }
  }, [onPinnedColumnsChange]);

  const setHasPinnedColumnsWithCallback = useCallback((newValue) => {
    setHasPinnedColumns(newValue);
    if (onHasPinnedColumnsChange) {
      onHasPinnedColumnsChange(newValue);
    }
  }, [onHasPinnedColumnsChange]);

  // 로컬 스토리지에서 고정 컬럼 상태 로드
  const loadPinnedState = useCallback(() => {
    if (!persistState) return null;
    
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (err) {
      console.error('고정 컬럼 상태 로드 중 오류 발생:', err);
    }
    return null;
  }, [storageKey, persistState]);

  // 로컬 스토리지에 고정 컬럼 상태 저장
  const savePinnedState = useCallback((columnsToSave) => {
    if (!persistState) return;
    
    try {
      const stateToSave = columnsToSave || pinnedColumns;
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      console.log('고정 컬럼 상태 저장됨:', stateToSave);

      // Redux 상태 업데이트를 위한 콜백 호출
      if (onPinnedColumnsChange && stateToSave !== pinnedColumns) {
        onPinnedColumnsChange(stateToSave);
      }
    } catch (err) {
      console.error('고정 컬럼 상태 저장 중 오류 발생:', err);
    }
  }, [storageKey, pinnedColumns, persistState, onPinnedColumnsChange]);

  // 컬럼 고정 상태 확인 및 업데이트
  const updatePinnedState = useCallback(() => {
    if (!columnApi) return [];
    
    try {
      // 고정된 컬럼 ID 목록 가져오기
      const pinnedColumnIds = columnApi.getColumns()
        .filter(col => {
          const state = columnApi.getColumnState().find(state => 
            state.colId === col.getColId()
          );
          return state && state.pinned === 'left';
        })
        .map(col => col.getColId());
      
      // 상태 업데이트
      setPinnedColumnsWithCallback(pinnedColumnIds);
      setHasPinnedColumnsWithCallback(pinnedColumnIds.length > 0);
      
      // 필요시 상태 저장
      if (persistState && !isProcessingRef.current) {
        savePinnedState(pinnedColumnIds);
      }
      
      return pinnedColumnIds;
    } catch (err) {
      console.error('컬럼 고정 상태 업데이트 중 오류 발생:', err);
      return [];
    }
  }, [columnApi, savePinnedState, persistState, setPinnedColumnsWithCallback, setHasPinnedColumnsWithCallback]);

  // 모든 컬럼 고정 해제
  const clearPinnedColumns = useCallback(() => {
    if (!gridApi || !columnApi || isProcessingRef.current) return false;
    
    try {
      isProcessingRef.current = true;
      console.log('컬럼 고정 해제 시작');
      
      // 1. 저장소 및 Redux 상태 업데이트
      localStorage.removeItem(storageKey);
      
      // 2. 내부 상태 업데이트
      setPinnedColumnsWithCallback([]);
      setHasPinnedColumnsWithCallback(false);
      
      // 3. 그리드 상태 업데이트 - 모든 컬럼 고정 해제
      columnApi.applyColumnState({
        defaultState: { pinned: null }
      });
      
      // 4. Redux 콜백 호출
      if (onHasPinnedColumnsChange) onHasPinnedColumnsChange(false);
      if (onPinnedColumnsChange) onPinnedColumnsChange([]);
      
      console.log('컬럼 고정 해제 완료');
      return true;
    } catch (err) {
      console.error('컬럼 고정 해제 중 오류:', err);
      return false;
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    }
  }, [gridApi, columnApi, storageKey, setPinnedColumnsWithCallback, setHasPinnedColumnsWithCallback, onHasPinnedColumnsChange, onPinnedColumnsChange]);

  // 기본 컬럼 고정 적용
  const applyPinnedColumns = useCallback(() => {
    if (!gridApi || !columnApi || isProcessingRef.current) return false;
    
    try {
      isProcessingRef.current = true;
      console.log('컬럼 고정 적용 시작');
      
      // 항상 사용 가능한 기본 컬럼 목록
      const DEFAULT_COLUMNS = ['checked', 'rowNum', 'type', 'username'];
      
      // 사용할 컬럼: props → 참조값 → 하드코딩된 기본값
      const columnsToPin = 
        (defaultPinnedColumns && defaultPinnedColumns.length > 0) ? defaultPinnedColumns :
        (lastDefaultColumnsRef.current && lastDefaultColumnsRef.current.length > 0) ? lastDefaultColumnsRef.current :
        DEFAULT_COLUMNS;
      
      // 유효한 컬럼만 필터링
      const validColumns = columnsToPin.filter(colId => columnApi.getColumn(colId));
      
      console.log('적용할 고정 컬럼:', validColumns);
      
      if (validColumns.length > 0) {
        // 1. 저장소 업데이트
        localStorage.setItem(storageKey, JSON.stringify(validColumns));
        
        // 2. 내부 상태 업데이트
        setPinnedColumnsWithCallback(validColumns);
        setHasPinnedColumnsWithCallback(true);
        
        // 3. 그리드 상태 업데이트
        columnApi.applyColumnState({
          state: validColumns.map(colId => ({
            colId,
            pinned: 'left'
          }))
        });
        
        // 4. 참조값 저장
        lastDefaultColumnsRef.current = [...validColumns];
        
        // 5. Redux 콜백 호출
        if (onHasPinnedColumnsChange) onHasPinnedColumnsChange(true);
        if (onPinnedColumnsChange) onPinnedColumnsChange(validColumns);
        
        console.log('컬럼 고정 적용 완료');
        return true;
      }
      
      console.log('고정할 유효한 컬럼이 없음');
      return false;
    } catch (err) {
      console.error('컬럼 고정 적용 중 오류:', err);
      return false;
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    }
  }, [gridApi, columnApi, storageKey, defaultPinnedColumns, setPinnedColumnsWithCallback, setHasPinnedColumnsWithCallback, onHasPinnedColumnsChange, onPinnedColumnsChange]);

  // 컬럼 고정/해제 토글
  const toggleColumnPin = useCallback(() => {
    if (!gridApi || !columnApi) return;
    
    // 이미 처리 중인 경우 무시
    if (isProcessingRef.current) {
      console.log('토글 처리 중 - 요청 무시');
      return;
    }
    
    try {
      // 현재 상태 확인 - 고정된 컬럼이 있는지 여부
      const currentPinnedColumns = columnApi.getColumnState()
        .filter(col => col.pinned === 'left')
        .map(col => col.colId);
      
      const hasCurrentPinned = currentPinnedColumns.length > 0;
      console.log('현재 고정 상태:', hasCurrentPinned, currentPinnedColumns);
      
      // 상태에 따라 적절한 함수 호출
      if (hasCurrentPinned) {
        // 고정된 컬럼이 있으면 모두 해제
        clearPinnedColumns();
      } else {
        // 고정된 컬럼이 없으면 기본 컬럼 고정
        applyPinnedColumns();
      }
    } catch (err) {
      console.error('컬럼 고정 토글 중 오류:', err);
      isProcessingRef.current = false;
    }
  }, [gridApi, columnApi, clearPinnedColumns, applyPinnedColumns]);

  // 특정 컬럼 고정
  const pinColumn = useCallback((colId) => {
    if (!columnApi) return;
    
    try {
      isProcessingRef.current = true;
      
      columnApi.applyColumnState({
        state: [{ colId, pinned: 'left' }]
      });
      
      // 상태 업데이트 및 저장
      const newState = updatePinnedState();
      savePinnedState(newState);
    } catch (err) {
      console.error('컬럼 고정 중 오류 발생:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [columnApi, updatePinnedState, savePinnedState]);

  // 특정 컬럼 고정 해제
  const unpinColumn = useCallback((colId) => {
    if (!columnApi) return;
    
    try {
      isProcessingRef.current = true;
      
      columnApi.applyColumnState({
        state: [{ colId, pinned: null }]
      });
      
      // 상태 업데이트 및 저장
      const newState = updatePinnedState();
      savePinnedState(newState);
    } catch (err) {
      console.error('컬럼 고정 해제 중 오류 발생:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [columnApi, updatePinnedState, savePinnedState]);

  // 모든 컬럼 고정 해제
  const unpinAllColumns = useCallback(() => {
    if (!columnApi) return;
    
    try {
      isProcessingRef.current = true;
      
      columnApi.applyColumnState({
        defaultState: { pinned: null }
      });
      
      // 상태 업데이트 및 저장
      const newState = updatePinnedState();
      savePinnedState(newState);
    } catch (err) {
      console.error('모든 컬럼 고정 해제 중 오류 발생:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [columnApi, updatePinnedState, savePinnedState]);

  // 컬럼 핀 변경 이벤트 핸들러
  const onColumnPinned = useCallback((params) => {
    // 이미 처리 중이면 이벤트 무시
    if (isProcessingRef.current) {
      console.log('토글/적용 작업 중 - 핀 이벤트 무시');
      return;
    }
    
    // 사용자 액션에 의한 직접 고정/해제인 경우만 처리
    if (params && params.source === 'uiColumnDragged') {
      try {
        isProcessingRef.current = true;
        console.log('사용자 드래그로 컬럼 고정 변경 감지');
        
        // 현재 고정 상태 업데이트
        setTimeout(() => {
          try {
            // 현재 고정된 컬럼 가져오기
            const pinnedColIds = columnApi.getColumnState()
              .filter(col => col.pinned === 'left')
              .map(col => col.colId);
            
            // 상태 및 저장소 업데이트
            setHasPinnedColumnsWithCallback(pinnedColIds.length > 0);
            setPinnedColumnsWithCallback(pinnedColIds);
            
            if (pinnedColIds.length > 0) {
              localStorage.setItem(storageKey, JSON.stringify(pinnedColIds));
              if (onHasPinnedColumnsChange) onHasPinnedColumnsChange(true);
              if (onPinnedColumnsChange) onPinnedColumnsChange(pinnedColIds);
            } else {
              localStorage.removeItem(storageKey);
              if (onHasPinnedColumnsChange) onHasPinnedColumnsChange(false);
              if (onPinnedColumnsChange) onPinnedColumnsChange([]);
            }
            
            console.log('사용자 드래그 고정 변경 처리 완료');
          } catch (err) {
            console.error('컬럼 고정 이벤트 처리 중 오류:', err);
          } finally {
            isProcessingRef.current = false;
          }
        }, 100);
      } catch (err) {
        console.error('컬럼 고정 이벤트 처리 중 오류:', err);
        isProcessingRef.current = false;
      }
    }
  }, [columnApi, storageKey, setPinnedColumnsWithCallback, setHasPinnedColumnsWithCallback, 
      onHasPinnedColumnsChange, onPinnedColumnsChange]);
  
  // 기본 고정 컬럼 적용
  const applyDefaultPinnedColumns = useCallback(() => {
    if (!columnApi || !gridApi) {
      console.warn('컬럼 고정 적용 실패: API가 초기화되지 않음');
      return false;
    }
    
    try {
      console.log('초기 기본 고정 컬럼 적용 시작');
      
      // 이미 저장된 값이 있는지 확인
      const savedPinnedColumns = loadPinnedState();
      console.log('저장된 고정 컬럼:', savedPinnedColumns);
      
      if (savedPinnedColumns && savedPinnedColumns.length > 0) {
        // 저장된 설정 적용
        return applyPinnedColumns();
      } else if (defaultPinnedColumns && defaultPinnedColumns.length > 0) {
        // props로 전달된 기본값 적용
        return applyPinnedColumns();
      } else {
        // 고정할 컬럼이 없는 경우 고정 해제 상태 유지
        console.log('초기 고정 컬럼 없음 - 기본 상태 유지');
        return false;
      }
    } catch (err) {
      console.error('기본 고정 컬럼 적용 중 오류:', err);
      return false;
    }
  }, [columnApi, gridApi, defaultPinnedColumns, loadPinnedState, applyPinnedColumns]);
  
  // 그리드 API 변경 또는 마운트 시 초기 상태 설정
  useEffect(() => {
    if (columnApi && gridApi) {
      // 초기화가 아직 안되었거나, 기본 컬럼 목록이 변경된 경우에만 적용
      const defaultColumnsChanged = JSON.stringify(defaultPinnedColumns) !== 
                                   JSON.stringify(lastDefaultColumnsRef.current);
      
      if (!initializedRef.current || defaultColumnsChanged) {
        // 기본 컬럼 목록이 비어있으면 기본값 설정
        if (!defaultPinnedColumns || defaultPinnedColumns.length === 0) {
          // 하드코딩된 기본값 사용
          lastDefaultColumnsRef.current = ['checked', 'rowNum', 'type', 'username'];
        } else {
          // 전달된 기본값 사용
          lastDefaultColumnsRef.current = [...defaultPinnedColumns];
        }
        
        // 기본 고정 컬럼 적용
        applyDefaultPinnedColumns();
        initializedRef.current = true;
      }

    }
  }, [columnApi, gridApi, defaultPinnedColumns, applyDefaultPinnedColumns]);

  // defaultPinnedColumns가 변경되었을 때 상태 업데이트
  useEffect(() => {
    if (defaultPinnedColumns?.length && 
        JSON.stringify(defaultPinnedColumns) !== JSON.stringify(pinnedColumns) &&
        !initializedRef.current) {
      setPinnedColumnsWithCallback(defaultPinnedColumns);
    }
  }, [defaultPinnedColumns, pinnedColumns, setPinnedColumnsWithCallback]);

  // 반환 객체를 메모이제이션하여 불필요한 리렌더링 방지
  return useMemo(() => ({
    hasPinnedColumns,
    pinnedColumns,
    toggleColumnPin,
    pinColumn,
    unpinColumn,
    unpinAllColumns,
    onColumnPinned,
    updatePinnedState,
    applyDefaultPinnedColumns,
    loadPinnedState,
    savePinnedState
  }), [
    hasPinnedColumns,
    pinnedColumns,
    toggleColumnPin,
    pinColumn,
    unpinColumn,
    unpinAllColumns,
    onColumnPinned,
    updatePinnedState,
    applyDefaultPinnedColumns,
    loadPinnedState,
    savePinnedState
  ]);
};

export default usePinnedColumns; 