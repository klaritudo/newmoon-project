import { useState, useCallback, useMemo } from 'react';

/**
 * 벌크 액션 관리를 위한 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {Array} options.actions - 사용 가능한 액션 목록
 * @param {Function} options.onAction - 액션 실행 시 호출되는 콜백
 * @param {Array} options.data - 전체 데이터
 * @returns {Object} 벌크 액션 관련 상태와 함수들
 */
const useBulkActions = ({ 
  actions = [], 
  onAction,
  data = []
}) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // 선택된 아이템 개수
  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  // 전체 선택 여부
  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every(item => selectedItems[item.id]);
  }, [data, selectedItems]);

  // 부분 선택 여부
  const isPartiallySelected = useMemo(() => {
    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    return selectedCount > 0 && selectedCount < data.length;
  }, [selectedItems, data.length]);

  // 선택된 아이템 ID 목록
  const selectedIds = useMemo(() => {
    return Object.entries(selectedItems)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
  }, [selectedItems]);

  // 개별 아이템 선택/해제
  const toggleItem = useCallback((itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  // 전체 선택/해제
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      // 전체 해제
      setSelectedItems({});
    } else {
      // 전체 선택
      const newSelected = {};
      data.forEach(item => {
        newSelected[item.id] = true;
      });
      setSelectedItems(newSelected);
    }
  }, [data, isAllSelected]);

  // 선택 초기화
  const clearSelection = useCallback(() => {
    setSelectedItems({});
  }, []);

  // 액션 실행
  const executeAction = useCallback(async (actionType) => {
    if (!onAction || selectedCount === 0) return;

    try {
      setIsProcessing(true);
      await onAction(actionType, selectedIds);
      clearSelection();
    } catch (error) {
      console.error('벌크 액션 실행 중 오류:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [onAction, selectedIds, selectedCount, clearSelection]);

  // 특정 액션이 활성화되어 있는지 확인
  const isActionEnabled = useCallback((actionType) => {
    const action = actions.find(a => a.type === actionType);
    if (!action) return false;
    
    // 액션별 활성화 조건 확인
    if (action.minSelection && selectedCount < action.minSelection) return false;
    if (action.maxSelection && selectedCount > action.maxSelection) return false;
    if (action.condition && !action.condition(selectedIds, data)) return false;
    
    return selectedCount > 0;
  }, [actions, selectedCount, selectedIds, data]);

  return {
    // 상태
    selectedItems,
    selectedCount,
    selectedIds,
    isAllSelected,
    isPartiallySelected,
    isProcessing,
    
    // 액션
    toggleItem,
    toggleAll,
    clearSelection,
    executeAction,
    isActionEnabled,
    
    // 헬퍼
    isSelected: (itemId) => !!selectedItems[itemId]
  };
};

export default useBulkActions;