import { useMemo } from 'react';

/**
 * 테이블 데이터 필터링을 위한 커스텀 훅
 * 검색, 필터, 날짜 필터 등을 적용하여 필터링된 테이블 데이터를 반환합니다.
 * 
 * @param {Object} options - 훅 옵션
 * @param {Array} options.data - 원본 테이블 데이터
 * @param {Object} options.activeFilters - 활성화된 필터 상태
 * @param {string} options.searchText - 검색어
 * @param {boolean} options.isDateFilterActive - 날짜 필터 활성화 여부
 * @param {Object} options.dateRange - 날짜 범위 (startDate, endDate)
 * @param {Function} options.filterCallback - 추가 필터링 로직을 위한 콜백 함수
 * @returns {Array} 필터링된 테이블 데이터
 */
const useTableData = ({
  data = [],
  activeFilters = {},
  searchText = '',
  isDateFilterActive = false,
  dateRange = {},
  filterCallback = null
}) => {
  // 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let result = [...data];
    
    // 필터 적용 (기본 필터 처리)
    if (activeFilters) {
      // 각 필터 항목에 대해 처리
      Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
        // 'all'은 모든 항목을 표시하는 특수 값으로 처리
        if (filterValue && filterValue !== 'all') {
          // 기본적인 필터링 로직
          // (실제 필터링 로직은 filterCallback에서 처리하도록 함)
          if (filterCallback) {
            result = filterCallback(result, filterId, filterValue);
          }
        }
      });
    }
    
    // 날짜 필터 적용
    if (isDateFilterActive && dateRange && (dateRange.startDate || dateRange.endDate)) {
      if (filterCallback) {
        result = filterCallback(result, 'date', dateRange);
      }
    }
    
    // 검색어 필터 적용
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      
      result = result.filter(item => {
        // 각 아이템의 모든 속성에 대해 검색
        for (const key in item) {
          // 기본 속성 검색
          if (
            item[key] && 
            typeof item[key] === 'string' && 
            item[key].toLowerCase().includes(searchLower)
          ) {
            return true;
          }
          
          // 중첩된 객체의 label 속성 검색 (예: type.label)
          if (
            item[key] && 
            typeof item[key] === 'object' && 
            item[key].label && 
            typeof item[key].label === 'string' && 
            item[key].label.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
          
          // 중첩된 배열의 객체의 label 속성 검색 (예: parentType[].label)
          if (
            item[key] && 
            Array.isArray(item[key])
          ) {
            for (const subItem of item[key]) {
              if (
                subItem && 
                typeof subItem === 'object' && 
                subItem.label && 
                typeof subItem.label === 'string' && 
                subItem.label.toLowerCase().includes(searchLower)
              ) {
                return true;
              }
            }
          }
        }
        
        return false;
      });
    }
    
    return result;
  }, [data, activeFilters, searchText, isDateFilterActive, dateRange, filterCallback]);
  
  return filteredData;
};

export default useTableData; 