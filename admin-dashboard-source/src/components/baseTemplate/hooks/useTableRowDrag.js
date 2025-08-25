import { useState, useCallback, useRef } from 'react';

/**
 * 테이블 행 드래그 앤 드롭 기능을 제공하는 훅
 * 
 * @param {Object} options - 옵션 객체
 * @param {Array} options.data - 테이블 데이터
 * @param {Function} options.onDataChange - 데이터 변경 시 호출되는 콜백
 * @param {string} options.orderField - 정렬 순서를 저장하는 필드명 (기본값: 'order')
 * @param {string} options.idField - 고유 ID 필드명 (기본값: 'id')
 * @param {boolean} options.enabled - 드래그 기능 활성화 여부 (기본값: true)
 * @returns {Object} 드래그 관련 상태와 핸들러
 */
const useTableRowDrag = ({
  data = [],
  onDataChange,
  orderField = 'order',
  idField = 'id',
  enabled = true
} = {}) => {
  // 드래그 중인 행 정보
  const [draggedRow, setDraggedRow] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 드래그 위치 추적을 위한 ref
  const dragPositionRef = useRef({ clientY: 0 });
  
  // 행 드래그 시작
  const handleRowDragStart = useCallback((e, row) => {
    if (!enabled) return;
    
    // 드래그 데이터 설정
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    
    // 드래그 중인 행 정보 저장
    setDraggedRow(row);
    setIsDragging(true);
    
    // 드래그 이미지 스타일 조정
    if (e.target) {
      e.target.style.opacity = '0.5';
    }
  }, [enabled, idField]);
  
  // 행 위에 드래그 오버
  const handleRowDragOver = useCallback((e, row) => {
    if (!enabled || !draggedRow) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // 현재 마우스 위치 저장
    dragPositionRef.current.clientY = e.clientY;
    
    // 드래그 오버 중인 행 업데이트
    if (row[idField] !== draggedRow[idField]) {
      setDragOverRow(row);
    }
  }, [enabled, draggedRow, idField]);
  
  // 행에서 드래그 떠남
  const handleRowDragLeave = useCallback((e) => {
    if (!enabled) return;
    
    // 자식 요소로 이동하는 경우 무시
    if (e.currentTarget.contains(e.relatedTarget)) return;
    
    setDragOverRow(null);
  }, [enabled]);
  
  // 행에 드롭
  const handleRowDrop = useCallback((e, targetRow) => {
    if (!enabled || !draggedRow || !onDataChange) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 같은 행에 드롭하면 무시
    if (draggedRow[idField] === targetRow[idField]) {
      setDraggedRow(null);
      setDragOverRow(null);
      setIsDragging(false);
      return;
    }
    
    // 새로운 데이터 배열 생성
    const newData = [...data];
    
    // 드래그된 행과 타겟 행의 인덱스 찾기
    const draggedIndex = newData.findIndex(item => item[idField] === draggedRow[idField]);
    const targetIndex = newData.findIndex(item => item[idField] === targetRow[idField]);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      console.error('행을 찾을 수 없습니다.');
      return;
    }
    
    // 드래그된 행 제거
    const [removed] = newData.splice(draggedIndex, 1);
    
    // 타겟 위치에 삽입
    newData.splice(targetIndex, 0, removed);
    
    // order 필드 업데이트
    const updatedData = newData.map((item, index) => ({
      ...item,
      [orderField]: index + 1
    }));
    
    // 데이터 변경 콜백 호출
    onDataChange(updatedData);
    
    // 상태 초기화
    setDraggedRow(null);
    setDragOverRow(null);
    setIsDragging(false);
  }, [enabled, draggedRow, data, onDataChange, idField, orderField]);
  
  // 드래그 종료
  const handleRowDragEnd = useCallback((e) => {
    if (!enabled) return;
    
    // 드래그 스타일 복원
    if (e.target) {
      e.target.style.opacity = '';
    }
    
    // 상태 초기화
    setDraggedRow(null);
    setDragOverRow(null);
    setIsDragging(false);
  }, [enabled]);
  
  // 행 스타일 계산
  const getRowStyle = useCallback((row) => {
    if (!enabled || !isDragging) return {};
    
    const style = {};
    
    // 드래그 중인 행 스타일
    if (draggedRow && row[idField] === draggedRow[idField]) {
      style.opacity = 0.5;
      style.cursor = 'grabbing';
    }
    
    // 드래그 오버 중인 행 스타일
    if (dragOverRow && row[idField] === dragOverRow[idField]) {
      style.backgroundColor = 'rgba(25, 118, 210, 0.08)';
      style.borderTop = '2px solid #1976d2';
    }
    
    // 드래그 가능한 행 커서
    if (!isDragging) {
      style.cursor = 'grab';
    }
    
    return style;
  }, [enabled, isDragging, draggedRow, dragOverRow, idField]);
  
  // 드래그 핸들 속성
  const getDragHandleProps = useCallback((row) => {
    if (!enabled) return {};
    
    return {
      draggable: true,
      onDragStart: (e) => handleRowDragStart(e, row),
      onDragOver: (e) => handleRowDragOver(e, row),
      onDragLeave: handleRowDragLeave,
      onDrop: (e) => handleRowDrop(e, row),
      onDragEnd: handleRowDragEnd,
      style: getRowStyle(row)
    };
  }, [enabled, handleRowDragStart, handleRowDragOver, handleRowDragLeave, handleRowDrop, handleRowDragEnd, getRowStyle]);
  
  return {
    // 상태
    isDragging,
    draggedRow,
    dragOverRow,
    
    // 핸들러
    handleRowDragStart,
    handleRowDragOver,
    handleRowDragLeave,
    handleRowDrop,
    handleRowDragEnd,
    
    // 유틸리티
    getRowStyle,
    getDragHandleProps
  };
};

export default useTableRowDrag;