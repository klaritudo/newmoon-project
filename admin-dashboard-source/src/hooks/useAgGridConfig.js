import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * AG Grid 설정 및 이벤트 핸들러를 관리하는 커스텀 훅
 * @param {string} tableId - 테이블 식별자 (로컬 스토리지 저장용)
 * @param {number} pageSize - 기본 페이지 크기 
 * @returns {Object} AG Grid 관련 상태 및 핸들러
 */
const useAgGridConfig = (tableId = 'default-table', pageSize = 25) => {
  const dispatch = useDispatch();
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  
  // 저장 중복 방지를 위한 타이머 참조
  const saveTimerRef = useRef(null);
  // 이벤트 처리 중인지 확인하는 플래그
  const isProcessingEventRef = useRef(false);
  // 마지막으로 저장한 시간 추적
  const lastSaveTimeRef = useRef(0);
  
  // 로컬 스토리지 키
  const columnStateKey = `ag_grid_${tableId}_column_state`;
  const columnOrderKey = `ag_grid_${tableId}_column_order`;
  
  // 컴포넌트 마운트 시 로컬 스토리지에서 컬럼 상태 로드
  useEffect(() => {
    try {
      // 로컬 스토리지에서 컬럼 상태 및 순서 확인
      const localStorageColumnState = localStorage.getItem(columnStateKey);
      const localStorageColumnOrder = localStorage.getItem(columnOrderKey);
      
      if (localStorageColumnState) {
        console.log(`[초기화] ${tableId}: 로컬 스토리지에서 컬럼 상태 로드됨`);
      }
      
      if (localStorageColumnOrder) {
        console.log(`[초기화] ${tableId}: 로컬 스토리지에서 컬럼 순서 로드됨`);
      }
    } catch (error) {
      console.error('로컬 스토리지에서 컬럼 상태 로드 중 오류:', error);
    }
  }, [tableId, columnStateKey, columnOrderKey]);
  
  // 컬럼 상태 저장 함수
  const saveColumnState = useCallback((columnApi) => {
    if (!columnApi) return;
    
    // 저장 중복 방지: 마지막 저장 후 500ms 이내 호출 시 타이머 설정
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 500) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        saveColumnState(columnApi);
      }, 500);
      
      return;
    }
    
    try {
      // 현재 컬럼 상태 가져오기
      const columnState = columnApi.getColumnState();
      if (!columnState || columnState.length === 0) {
        console.warn('저장할 컬럼 상태가 없습니다.');
        return;
      }
      
      // 현재 컬럼 순서 가져오기
      const displayedColumns = columnApi.getAllDisplayedColumns();
      const columnOrder = displayedColumns.map(col => col.getColId());
      
      // 로컬 스토리지에 저장
      localStorage.setItem(columnStateKey, JSON.stringify(columnState));
      localStorage.setItem(columnOrderKey, JSON.stringify(columnOrder));
      
      // 마지막 저장 시간 업데이트
      lastSaveTimeRef.current = now;
      
    } catch (error) {
      console.error('컬럼 상태 저장 중 오류:', error);
    }
  }, [columnStateKey, columnOrderKey]);
  
  // 저장된 컬럼 상태를 그리드에 적용하는 함수
  const applyColumnState = useCallback((columnApi) => {
    if (!columnApi) return false;
    
    try {
      // 로컬 스토리지에서 컬럼 상태 가져오기
      const savedColumnStateString = localStorage.getItem(columnStateKey);
      const savedColumnOrderString = localStorage.getItem(columnOrderKey);
      
      if (!savedColumnStateString && !savedColumnOrderString) {
        return false;
      }
      
      // 컬럼 상태가 저장되어 있는 경우
      if (savedColumnStateString) {
        const columnState = JSON.parse(savedColumnStateString);
        
        // 1. 먼저 모든 컬럼의 핀 상태 해제 (충돌 방지)
        columnApi.applyColumnState({
          state: columnState.map(col => ({
            colId: col.colId,
            pinned: null
          })),
          applyOrder: false,
          defaultState: { pinned: null }
        });
        
        // 2. 이후 순서와 함께 전체 상태 적용
        columnApi.applyColumnState({
          state: columnState.map(col => ({
            ...col,
            width: col.width || undefined
          })),
          applyOrder: true,
          defaultState: { hide: false }
        });
        
        // 3. 핀 상태만 명시적으로 다시 적용
        const pinnedColumns = columnState.filter(col => col.pinned);
        if (pinnedColumns.length > 0) {
          pinnedColumns.forEach(col => {
            try {
              columnApi.setColumnPinned(col.colId, col.pinned);
            } catch (pinError) {
              console.error(`컬럼 ${col.colId} 핀 설정 실패:`, pinError);
            }
          });
        }
        
        return true;
      }
      // 컬럼 상태가 없고 컬럼 순서만 있는 경우
      else if (savedColumnOrderString) {
        const columnOrder = JSON.parse(savedColumnOrderString);
        
        // 순서 적용
        columnApi.applyColumnState({
          state: columnOrder.map(colId => ({
            colId,
            sort: null,
            sortIndex: null
          })),
          applyOrder: true,
          defaultState: { hide: false }
        });
        
        return true;
      }
    } catch (error) {
      console.error('컬럼 상태 적용 중 오류:', error);
      return false;
    }
    
    return false;
  }, [columnStateKey, columnOrderKey]);
  
  // ID 필드가 없는 경우를 위한 getRowId 함수
  const getRowId = useCallback((params) => {
    // 데이터에서 ID 찾기 (복수의 필드명 시도)
    let rowId = params.data.id;
    if (rowId === undefined) {
      rowId = params.data.ID || params.data.userId || params.data.username;
    }
    
    // ID가 없는 경우 인덱스를 ID로 사용
    return rowId !== undefined ? String(rowId) : String(params.rowIndex);
  }, []);
  
  // Grid Ready 이벤트 핸들러
  const onGridReady = useCallback((params) => {
    if (!params.api || !params.columnApi) {
      console.error('Grid API 또는 Column API를 찾을 수 없습니다.');
      return;
    }
    
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    
    // 페이지네이션 설정
    params.api.paginationSetPageSize(pageSize);
    
    // 이벤트 처리 중 플래그 설정
    isProcessingEventRef.current = true;
    
    // 저장된 컬럼 상태 적용
    applyColumnState(params.columnApi);
    
    // 플래그 해제
    isProcessingEventRef.current = false;
  }, [pageSize, applyColumnState]);
  
  // 컬럼 이동 이벤트 핸들러
  const onColumnMoved = useCallback((params) => {
    if (isProcessingEventRef.current) return;
    if (!params.columnApi) return;
    
    saveColumnState(params.columnApi);
  }, [saveColumnState]);
  
  // 컬럼 크기 변경 이벤트 핸들러
  const onColumnResized = useCallback((params) => {
    if (isProcessingEventRef.current) return;
    if (!params.columnApi || !params.finished) return;
    
    saveColumnState(params.columnApi);
  }, [saveColumnState]);
  
  // 컬럼 표시/숨김 이벤트 핸들러
  const onColumnVisible = useCallback((params) => {
    if (isProcessingEventRef.current) return;
    if (!params.columnApi) return;
    
    saveColumnState(params.columnApi);
  }, [saveColumnState]);
  
  // 컬럼 핀 고정 이벤트 핸들러
  const onColumnPinned = useCallback((params) => {
    if (isProcessingEventRef.current) return;
    if (!params.columnApi) return;
    
    saveColumnState(params.columnApi);
  }, [saveColumnState]);
  
  // 기본 AG Grid 설정
  const defaultAgGridConfig = {
    // 그리드 이벤트 핸들러
    onGridReady,
    onColumnMoved,
    onColumnResized,
    onColumnVisible,
    onColumnPinned,
    
    // 데이터 ID 매핑
    getRowId,
    
    // 페이지네이션 설정
    pagination: true,
    paginationPageSize: pageSize,
    
    // 행 선택 설정
    rowSelection: 'multiple',
    rowMultiSelectWithClick: false,
    suppressRowClickSelection: true,
    
    // 셀 설정
    enableCellTextSelection: true,
    suppressCellFocus: false,
    
    // 기타 설정
    suppressPropertyNamesCheck: true,
    suppressColumnVirtualisation: false
  };
  
  return {
    gridApi,
    columnApi,
    defaultAgGridConfig,
    saveColumnState,
    applyColumnState,
    getRowId
  };
};

export default useAgGridConfig; 