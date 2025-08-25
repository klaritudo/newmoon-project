import { useState, useCallback, useMemo } from 'react';

/**
 * 테이블 컴포넌트 커스텀 훅
 * 테이블 관련 상태 및 기능을 제공합니다.
 * 
 * @param {Object} options
 * @param {Array} options.data - 테이블 데이터
 * @param {Object} options.initialSort - 초기 정렬 설정 (key, direction)
 * @param {Object} options.initialCheckedItems - 초기 체크된 아이템 목록
 * @param {Object} options.initialExpandedRows - 초기 펼쳐진 행 목록
 * @param {boolean} options.indentMode - 들여쓰기 모드 사용 여부
 * @param {number} options.page - 현재 페이지 (0부터 시작)
 * @param {number} options.rowsPerPage - 페이지당 행 수
 * @returns {Object} 테이블 관련 상태 및 핸들러
 */
const useTable = ({
  data = [],
  initialSort = { key: null, direction: 'asc' },
  initialCheckedItems = {},
  initialExpandedRows = {},
  indentMode = true,
  page = 0,
  rowsPerPage = 10
} = {}) => {
  // 체크된 아이템 상태
  const [checkedItems, setCheckedItems] = useState(initialCheckedItems);
  
  // 정렬 상태
  const [sortConfig, setSortConfig] = useState(initialSort);
  
  // 펼쳐진 행 상태
  const [expandedRows, setExpandedRows] = useState(initialExpandedRows);
  
  // 선택된 행 상태
  const [selectedRow, setSelectedRow] = useState(null);
  
  // 들여쓰기 모드 상태
  const [useIndentMode, setUseIndentMode] = useState(indentMode);
  
  // 재귀적으로 모든 아이템 목록 가져오기 (계층 구조 포함)
  const getItemsRecursive = useCallback((items) => {
    const result = [];
    const seenIds = new Set(); // 중복 ID 방지
    
    const collectItems = (itemList) => {
      if (!itemList || !itemList.length) return;
      
      itemList.forEach(item => {
        // ID가 있고 아직 추가되지 않은 경우에만 추가
        if (item.id !== undefined && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          result.push(item);
        }
        
        // 자식 항목이 있으면 재귀적으로 처리
      if (item.children && item.children.length) {
          collectItems(item.children);
      }
    });
    };
    
    collectItems(items);
    return result;
  }, []);

  // 현재 페이지에 표시되는 데이터만 추출
  const getCurrentPageData = useCallback((items) => {
    const allItems = getItemsRecursive(items);
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // console.log('getCurrentPageData:', {
    //   totalItems: allItems.length,
    //   page,
    //   rowsPerPage,
    //   startIndex,
    //   endIndex,
    //   currentPageItems: allItems.slice(startIndex, endIndex).length
    // });
    
    return allItems.slice(startIndex, endIndex);
  }, [getItemsRecursive, page, rowsPerPage]);
  
  // 모든 항목 선택 여부 계산 (현재 페이지 기준)
  const allChecked = useMemo(() => {
    const currentPageItems = getCurrentPageData(data);
    
    if (!currentPageItems.length) {
      // console.log('allChecked: 현재 페이지 데이터 없음 -> false');
      return false;
    }
    
    const checkedCount = currentPageItems.filter(item => checkedItems[item.id]).length;
    
    // console.log('allChecked 계산 (현재 페이지 기준):', {
    //   currentPageItems: currentPageItems.length,
    //   checkedCount,
    //   checkedItems,
    //   currentPageIds: currentPageItems.map(item => item.id)
    // });
    
    if (checkedCount === 0) {
      // console.log('allChecked: 현재 페이지에서 체크된 항목 없음 -> false');
      return false;
    }
    if (checkedCount === currentPageItems.length) {
      // console.log('allChecked: 현재 페이지 모든 항목 체크됨 -> true');
      return true;
    }
    
    // console.log('allChecked: 현재 페이지 일부 항목 체크됨 -> null (indeterminate)');
    return null; // 일부 선택됨 (indeterminate)
  }, [data, checkedItems, getCurrentPageData]);
  
  // 정렬된 데이터 계산
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    // 정렬 함수
    const sortItems = (items) => {
      return [...items].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // null 또는 undefined 처리
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // 객체 필드 처리 (유형 객체 등)
        if (typeof aValue === 'object' && aValue !== null && typeof bValue === 'object' && bValue !== null) {
          // label 속성이 있는 경우 label로 비교
          if (aValue.label && bValue.label) {
            return sortConfig.direction === 'asc'
              ? aValue.label.localeCompare(bValue.label)
              : bValue.label.localeCompare(aValue.label);
          }
        }
        
        // 값 비교
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      });
    };
    
    // 재귀적으로 정렬
    const sortRecursive = (items) => {
      const sorted = sortItems(items);
      
      return sorted.map(item => {
        if (item.children && item.children.length) {
          return {
            ...item,
            children: sortRecursive(item.children)
          };
        }
        
        return item;
      });
    };
    
    return sortRecursive(data);
  }, [data, sortConfig]);
  
  // 정렬 처리 핸들러
  const handleSort = useCallback((columnId) => {
    let direction = 'asc';
    
    if (sortConfig.key === columnId) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key: columnId, direction });
  }, [sortConfig]);
  
  // 체크박스 처리 핸들러
  const handleCheck = useCallback((id, checked) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  }, []);
  
  // 모든 체크박스 토글 핸들러
  const handleToggleAll = useCallback((checked) => {
    // console.log('handleToggleAll 호출됨:', { checked, page, rowsPerPage });
    
    const currentPageItems = getCurrentPageData(data);
    // console.log('현재 페이지 항목들:', currentPageItems.map(item => ({ id: item.id, userId: item.userId })));
    
    if (checked) {
      // 현재 페이지의 모든 항목 체크
      const newCheckedItems = { ...checkedItems };
      
      currentPageItems.forEach(item => {
        newCheckedItems[item.id] = true;
        // console.log('현재 페이지 체크 설정:', item.id, item.userId || item.type?.label);
      });
      
      // console.log('새로운 체크 상태 (체크):', newCheckedItems);
      setCheckedItems(newCheckedItems);
    } else {
      // 현재 페이지의 모든 항목 체크 해제
      const newCheckedItems = { ...checkedItems };
      
      currentPageItems.forEach(item => {
        delete newCheckedItems[item.id];
        // console.log('현재 페이지 체크 해제:', item.id, item.userId || item.type?.label);
      });
      
      // console.log('새로운 체크 상태 (해제):', newCheckedItems);
      setCheckedItems(newCheckedItems);
    }
  }, [data, checkedItems, getCurrentPageData, page, rowsPerPage]);
  
  // 행 확장/접기 처리 핸들러
  const handleToggleExpand = useCallback((id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);
  
  // 모든 행 확장/접기 처리 핸들러
  const handleExpandAll = useCallback((expand) => {
    if (expand) {
      // 모든 행 펼치기
      const allItems = getItemsRecursive(data);
      const newExpandedRows = {};
      
      allItems.forEach(item => {
        if (item.children && item.children.length) {
          newExpandedRows[item.id] = true;
        }
      });
      
      setExpandedRows(newExpandedRows);
    } else {
      // 모든 행 접기
      setExpandedRows({});
    }
  }, [data, getItemsRecursive]);
  
  // 행 클릭 핸들러
  const handleRowClick = useCallback((row) => {
    setSelectedRow(row);
  }, []);
  
  // 들여쓰기 모드 토글 핸들러
  const toggleIndentMode = useCallback(() => {
    setUseIndentMode(prev => !prev);
  }, []);
  
  return {
    // 상태
    checkedItems,
    sortConfig,
    expandedRows,
    selectedRow,
    allChecked,
    sortedData,
    indentMode: useIndentMode,
    
    // 핸들러
    handleSort,
    handleCheck,
    handleToggleAll,
    handleToggleExpand,
    handleExpandAll,
    handleRowClick,
    toggleIndentMode,
    
    // 설정 함수
    setCheckedItems,
    setSortConfig,
    setExpandedRows,
    setSelectedRow,
    setUseIndentMode
  };
};

export default useTable; 