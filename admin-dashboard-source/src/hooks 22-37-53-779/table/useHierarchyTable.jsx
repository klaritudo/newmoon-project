import { useState, useCallback, useMemo, useEffect } from 'react';
import useDataTable from './useDataTable';

/**
 * 계층 구조 테이블 관리 훅
 * 기본 테이블 훅을 확장하여 계층 구조 데이터를 처리합니다.
 * 
 * @param {Object} options 설정 옵션
 * @param {Object} options.dataTableOptions useDataTable 훅에 전달할 옵션
 * @param {Object} options.typeHierarchy 유형 계층 구조 (예: {'슈퍼': ['본사'], '본사': ['부본사'], ...})
 * @param {Object} options.typeLevels 유형별 레벨 (예: {'슈퍼': 1, '본사': 2, ...})
 * @param {string} options.parentIdField 부모 ID 필드 (기본값: 'parentId')
 * @param {string} options.typeField 유형 필드 (기본값: 'type')
 * @param {string} options.idField ID 필드 (기본값: 'id')
 * @param {boolean} options.defaultIndentMode 기본 들여쓰기 모드 (기본값: true)
 * @returns {Object} 계층 구조 테이블 관련 상태 및 함수
 */
const useHierarchyTable = ({
  dataTableOptions,
  typeHierarchy = {},
  typeLevels = {},
  parentIdField = 'parentId',
  typeField = 'type',
  idField = 'id',
  defaultIndentMode = true
}) => {
  // 기본 테이블 훅 사용
  const dataTable = useDataTable(dataTableOptions);

  // 계층 구조 관련 상태
  const [indentMode, setIndentMode] = useState(defaultIndentMode);
  const [expandedMembers, setExpandedMembers] = useState([]);
  const [expandedTypes, setExpandedTypes] = useState(Object.keys(typeHierarchy));
  
  // 상태 변경 추적용 버전 카운터
  const [hierarchyVersion, setHierarchyVersion] = useState(0);
  
  // 최소 표시 레벨 계산
  const minTypeLevel = useMemo(() => {
    if (!typeLevels || Object.keys(typeLevels).length === 0) return 999;
    return Math.min(...Object.values(typeLevels));
  }, [typeLevels]);

  // 들여쓰기 모드 토글
  const toggleIndentMode = useCallback(() => {
    setIndentMode(prev => !prev);
    // 계층 버전 업데이트
    setHierarchyVersion(v => v + 1);
  }, []);

  // 멤버 확장/축소 토글
  const toggleMemberExpansion = useCallback((member) => {
    if (!member || !member[idField]) return;

    const memberId = member[idField];
    setExpandedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
    // 계층 버전 업데이트
    setHierarchyVersion(v => v + 1);
  }, [idField]);

  // 멤버 확장 여부 확인
  const isMemberExpanded = useCallback((memberId) => {
    return expandedMembers.includes(memberId);
  }, [expandedMembers]);

  // 허용된 유형 가져오기 (재귀 함수)
  const getAllowedTypes = useCallback((types, hierarchy) => {
    const result = [...types];
    
    types.forEach(type => {
      if (hierarchy[type]) {
        const childTypes = hierarchy[type];
        const childAllowedTypes = getAllowedTypes(childTypes, hierarchy);
        childAllowedTypes.forEach(childType => {
          if (!result.includes(childType)) {
            result.push(childType);
          }
        });
      }
    });
    
    return result;
  }, []);

  // 유형 확장/축소 토글
  const toggleTypeExpansion = useCallback((type) => {
    if (!type || !typeHierarchy[type]) return;

    setExpandedTypes(prev => {
      if (prev.includes(type)) {
        // 유형 축소: 해당 유형과 그 하위 유형 제거
        const childTypesToRemove = getAllowedTypes([type], typeHierarchy).filter(t => t !== type);
        return prev.filter(t => t !== type && !childTypesToRemove.includes(t));
      } else {
        // 유형 확장: 해당 유형 추가
        return [...prev, type];
      }
    });
    // 계층 버전 업데이트
    setHierarchyVersion(v => v + 1);
  }, [typeHierarchy, getAllowedTypes]);

  // 유형 확장 여부 확인
  const isTypeExpanded = useCallback((type) => {
    return expandedTypes.includes(type);
  }, [expandedTypes]);

  // 계층 구조에 따라 데이터 처리
  const processHierarchicalData = useCallback(() => {
    try {
      if (!dataTable.tableData || dataTable.tableData.length === 0) {
        return;
      }
      
      const originalData = [...dataTable.tableData];
      let processedData = [...originalData];
      
      // 계층 구조에 따라 데이터 필터링 (확장된 항목의 자식만 표시)
      if (expandedTypes.length < Object.keys(typeHierarchy).length) {
        // 유형 필터링이 있는 경우
        const allowedTypes = getAllowedTypes(expandedTypes, typeHierarchy);
        processedData = processedData.filter(item => 
          allowedTypes.includes(item[typeField])
        );
      }
      
      // 확장 상태에 따라 자식 항목 표시 여부 결정
      if (expandedMembers.length > 0) {
        const originalIds = new Set(originalData.map(item => item[idField]));
        const visibleIds = new Set();
        
        // 계층 구조 상단의 항목들은 항상 표시
        processedData.forEach(item => {
          const type = item[typeField];
          const typeLevel = typeLevels[type] || 999;
          
          if (typeLevel <= minTypeLevel) {
            visibleIds.add(item[idField]);
          }
        });
        
        // 확장된 항목의 직계 자식만 표시
        const findChildren = (parentId) => {
          const children = originalData.filter(item => 
            item[parentIdField] === parentId
          );
          
          children.forEach(child => {
            visibleIds.add(child[idField]);
            
            // 이 자식이 확장되었는지 체크
            if (expandedMembers.includes(child[idField])) {
              findChildren(child[idField]);
            }
          });
        };
        
        // 확장된 모든 항목의 자식 찾기
        expandedMembers.forEach(memberId => {
          if (originalIds.has(memberId)) {
            visibleIds.add(memberId);
            findChildren(memberId);
          }
        });
        
        // 보이는 ID에 해당하는 항목만 필터링
        processedData = processedData.filter(item => 
          visibleIds.has(item[idField])
        );
      }
      
      // 정렬 유지하면서 rowNum 재할당
      processedData.sort((a, b) => 
        (a.originalRowNum || a.rowNum) - (b.originalRowNum || b.rowNum)
      );
      
      processedData = processedData.map((item, index) => ({
        ...item,
        rowNum: index + 1
      }));
      
      // AG Grid 및 상태 업데이트
      dataTable.setRowData(processedData);
      
      if (dataTable.gridApi) {
        dataTable.gridApi.setRowData(processedData);
      }
    } catch (err) {
      console.error('Error processing hierarchical data:', err);
    }
  }, [
    dataTable.tableData,
    dataTable.setRowData,
    dataTable.gridApi,
    expandedMembers,
    expandedTypes,
    typeHierarchy,
    typeLevels,
    typeField,
    idField,
    parentIdField,
    minTypeLevel,
    getAllowedTypes
  ]);

  // indentMode 또는 계층 변경 시 데이터 재처리
  useEffect(() => {
    if (dataTable.tableData && dataTable.tableData.length > 0) {
      processHierarchicalData();
    }
  }, [
    indentMode, 
    hierarchyVersion, // 확장 상태가 변경될 때 업데이트되는 버전 번호 사용
    dataTable.tableData, 
    processHierarchicalData
  ]);

  // 반환 객체 메모이제이션
  return useMemo(() => ({
    ...dataTable,
    indentMode,
    toggleIndentMode,
    expandedMembers,
    expandedTypes,
    toggleMemberExpansion,
    isMemberExpanded,
    toggleTypeExpansion,
    isTypeExpanded,
    processHierarchicalData
  }), [
    dataTable,
    indentMode,
    toggleIndentMode,
    expandedMembers,
    expandedTypes,
    toggleMemberExpansion,
    isMemberExpanded,
    toggleTypeExpansion,
    isTypeExpanded,
    processHierarchicalData
  ]);
};

export default useHierarchyTable; 