import React, { useState, forwardRef, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

/**
 * 테이블 헤더 컴포넌트
 * 일반 헤더와 그룹 헤더를 지원합니다.
 * 
 * @param {Object} props
 * @param {Array} props.columns - 테이블 컬럼 정의
 * @param {boolean} props.hasGroupHeaders - 그룹 헤더 사용 여부
 * @param {Function} props.onSort - 정렬 이벤트 핸들러
 * @param {Object} props.sortConfig - 정렬 설정 (key, direction)
 * @param {boolean} props.checkable - 체크박스 컬럼 사용 여부
 * @param {Function} props.onToggleAll - 모든 항목 체크/해제 핸들러
 * @param {boolean} props.allChecked - 모든 항목 체크 여부
 * @param {boolean} props.draggable - 컬럼 드래그 가능 여부
 * @param {Object} props.dragHandlers - 드래그 관련 핸들러 모음
 * @param {Object} props.dragInfo - 현재 드래그 중인 컬럼 정보
 * @param {Object} props.style - 테이블 헤더에 적용할 스타일 (헤더 고정 기능 등에 사용)
 * @param {Array} props.pinnedColumns - 고정된 컬럼 ID 배열
 * @param {number} props.tableKey - 테이블 강제 리렌더링 키
 */
const TableHeader = forwardRef(({
  columns,
  hasGroupHeaders,
  onSort,
  sortConfig,
  checkable,
  onToggleAll,
  allChecked,
  draggable = false,
  dragHandlers = {},
  dragInfo = { dragging: false, columnId: null },
  style = {},
  pinnedColumns = [],
  tableKey = 0
}, ref) => {
  const theme = useTheme();
  
  // 드래그 오버 중인 컬럼 상태 관리
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  
  // 컬럼 너비 측정을 위한 ref
  const headerRowRef = useRef(null);
  
  // 컬럼 너비 측정 및 업데이트
  const updateColumnWidths = useCallback(() => {
    if (!headerRowRef.current) return;
    
    const newWidths = {};
    const cells = headerRowRef.current.querySelectorAll('[data-column-id]');
    
    cells.forEach(cell => {
      const columnId = cell.getAttribute('data-column-id');
      if (columnId) {
        newWidths[columnId] = cell.offsetWidth;
      }
    });
    
    setColumnWidths(newWidths);
    // console.log('[TableHeader] 컬럼 너비 업데이트:', newWidths);
  }, []);
  
  // 테이블 키 변경 시 컬럼 너비 재측정
  useEffect(() => {
    const timer = setTimeout(() => {
      updateColumnWidths();
    }, 100); // DOM 업데이트 완료 후 측정
    
    return () => clearTimeout(timer);
  }, [tableKey, updateColumnWidths]);
  
  // 창 크기 변경 시 컬럼 너비 재측정
  useEffect(() => {
    const handleResize = () => {
      updateColumnWidths();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateColumnWidths]);
  
  // 헤더 셀 클릭 핸들러 (정렬)
  const handleHeaderClick = (columnId, sortable) => {
    if (sortable && onSort) {
      onSort(columnId);
    }
  };
  
  // 모든 항목 체크/해제 핸들러
  const handleToggleAll = (event) => {
    // console.log('TableHeader handleToggleAll 호출됨:', { 
    //   checked: event.target.checked, 
    //   allChecked,
    //   onToggleAll: typeof onToggleAll 
    // });
    
    if (onToggleAll) {
      onToggleAll(event.target.checked);
    } else {
      // console.log('TableHeader: onToggleAll 핸들러가 없습니다.');
    }
  };
  
  // 플랫 컬럼 배열 생성 (그룹 컬럼의 자식 컬럼 포함)
  const getFlatColumns = () => {
    const result = [];
    
    columns.forEach(column => {
      if (column.type === 'group' && Array.isArray(column.children)) {
        column.children.forEach(child => {
          result.push(child);
        });
      } else {
        result.push(column);
      }
    });
    
    return result;
  };
  
  // 드래그 앤 드롭 핸들러 추출
  const { handleDragStart, handleDragEnd, handleDragOver, handleDrop } = dragHandlers;
  
  // 드래그 이벤트 처리 함수
  const getHeaderDragProps = (columnId, isGroupColumn = false, parentGroupId = null) => {
    if (!draggable) return {};
    
    return {
      draggable: true,
      onDragStart: (e) => {
        e.currentTarget.style.opacity = '0.6';
        e.currentTarget.style.transform = 'scale(1.05)';
        handleDragStart(e, columnId, isGroupColumn, parentGroupId);
      },
      onDragEnd: (e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'scale(1)';
        handleDragEnd(e);
        setDragOverColumn(null);
      },
      onDragOver: (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragOver(e);
        setDragOverColumn(columnId);
        
        // 드래그 오버 시 경계선 애니메이션 효과
        e.currentTarget.style.transition = 'all 0.2s ease';
      },
      onDragEnter: (e) => {
        e.preventDefault();
        setDragOverColumn(columnId);
      },
      onDragLeave: (e) => {
        e.preventDefault();
        if (dragOverColumn === columnId) {
          setDragOverColumn(null);
        }
      },
      onDrop: (e) => {
        e.preventDefault();
        handleDrop(e, columnId, isGroupColumn, parentGroupId);
        setDragOverColumn(null);
      },
    };
  };
  
  // 드래그 효과를 위한 스타일 계산
  const getDragStyles = (columnId, isGroupColumn = false) => {
    if (!draggable) return {};
    
    const isDragging = dragInfo.dragging && dragInfo.columnId === columnId;
    const isDragOver = dragOverColumn === columnId;
    
    return {
      cursor: 'grab',
      opacity: isDragging ? 0.6 : 1,
      transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease',
      position: 'relative',
      zIndex: isDragging ? 10 : 1,
      ...(isDragOver && {
        boxShadow: '0 0 0 2px ' + theme.palette.primary.main,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: theme.palette.primary.main,
          animation: 'pulse 1s infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: theme.palette.primary.main,
          animation: 'pulse 1s infinite',
        },
        '@keyframes pulse': {
          '0%': { opacity: 0.6 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.6 }
        }
      })
    };
  };
  
  // 그룹 헤더 행 렌더링
  const renderGroupHeaderRow = () => {
    const cells = [];
    
    // 체크박스 컬럼을 별도로 처리하지 않고, 컬럼 순서대로 처리
    columns.forEach(column => {
      if (column.type === 'checkbox' && checkable) {
        // 체크박스 컬럼은 rowSpan={2}로 설정하여 두 행을 모두 차지
        cells.push(
      <TableCell 
        key="checkbox-group-spacer" 
        rowSpan={2}
        padding="checkbox"
        align="center"
            data-column-id="checkbox"
        sx={{
          backgroundColor: theme.palette.grey[100],
          width: '48px',
          minWidth: '48px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
              textOverflow: 'ellipsis',
              zIndex: pinnedColumns.includes('checkbox') ? 30 : 15,
              ...getPinnedStyles('checkbox')
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%'
          }}
          {...getHeaderDragProps('checkbox')}
        >
          <Checkbox
            indeterminate={allChecked === null}
            checked={allChecked === true}
            onChange={handleToggleAll}
            inputProps={{ 'aria-label': '전체 선택' }}
          />
        </Box>
      </TableCell>
        );
      } else if (column.type === 'group' && Array.isArray(column.children)) {
        // 실제로 렌더링될 자식 컬럼 수 계산 (표시되는 컬럼만)
        const visibleChildrenCount = column.children.length;
    
        // 그룹 헤더 셀 (colSpan은 실제 표시되는 자식 컬럼 수만큼)
        cells.push(
          <TableCell 
            key={`group-${column.id}`}
            colSpan={visibleChildrenCount}
            align="center"
            data-column-id={column.id}
            sx={{
              fontWeight: 600,
              backgroundColor: theme.palette.grey[100],
              borderBottom: `1px solid ${theme.palette.grey[300]}`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              zIndex: 1, // 그룹 헤더는 항상 z-index: 1로 고정
              ...getDragStyles(column.id, true),
              // 그룹 헤더는 고정 스타일을 적용하지 않음
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
              {...getHeaderDragProps(column.id, true)}
            >
              {draggable && (
                <DragIndicatorIcon 
                  fontSize="small" 
                  sx={{ 
                    mr: 1, 
                    cursor: 'grab',
                    color: theme.palette.grey[500],
                    animation: dragInfo.dragging && dragInfo.columnId === column.id ? 'shake 0.3s infinite' : 'none',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-2px)' },
                      '75%': { transform: 'translateX(2px)' }
                    }
                  }} 
                />
              )}
            {column.header || column.label}
            </Box>
          </TableCell>
        );
      } else if (column.type !== 'checkbox') {
        // 일반 컬럼은 rowSpan={2}로 설정하여 두 행을 모두 차지
        cells.push(
          <TableCell 
            key={`spacer-${column.id}`} 
            rowSpan={2}
            data-column-id={column.id}
            sx={{
              fontWeight: 600,
              backgroundColor: theme.palette.grey[100],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...getDragStyles(column.id),
              ...getPinnedStyles(column.id)
            }}
          >
            {/* 정렬 가능한 컬럼 */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}
              onClick={() => handleHeaderClick(column.id, column.sortable)}
              {...getHeaderDragProps(column.id)}
            >
              {draggable && (
                <DragIndicatorIcon 
                  fontSize="small" 
                  sx={{ 
                    mr: 1, 
                    cursor: 'grab',
                    color: theme.palette.grey[500],
                    animation: dragInfo.dragging && dragInfo.columnId === column.id ? 'shake 0.3s infinite' : 'none',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-2px)' },
                      '75%': { transform: 'translateX(2px)' }
                    }
                  }} 
                />
              )}
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
                {column.header || column.label}
              </Typography>
              
              {/* 정렬 아이콘 */}
              {column.sortable && sortConfig.key === column.id && sortConfig.direction && (
                <Box sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
                  {sortConfig.direction === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              )}
            </Box>
          </TableCell>
        );
      }
    });
    
    return <TableRow>{cells}</TableRow>;
  };
  
  // 일반 헤더 행 렌더링
  const renderHeaderRow = () => {
    const cells = [];
    
    // 그룹 헤더가 없는 경우에만 체크박스 컬럼 추가
    if (checkable && !hasGroupHeaders) {
      cells.push(
        <TableCell 
          key="checkbox" 
          padding="checkbox"
          align="center"
          data-column-id="checkbox"
          sx={{
            fontWeight: 600,
            backgroundColor: theme.palette.grey[100],
            width: '48px',
            minWidth: '48px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            zIndex: pinnedColumns.includes('checkbox') ? 30 : 15,
            ...getDragStyles('checkbox'),
            ...getPinnedStyles('checkbox')
          }}
        >
          <Box
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%'
            }}
            {...getHeaderDragProps('checkbox')}
          >
            <Checkbox
            indeterminate={false}
            checked={allChecked}
              onChange={handleToggleAll}
            color="primary"
            size="small"
            sx={{
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
              '&.MuiCheckbox-indeterminate': {
                color: theme.palette.primary.main,
              }
            }}
            />
          </Box>
        </TableCell>
      );
    }
    
    // 그룹 컬럼이 있는 경우 자식 컬럼들만 렌더링
    if (hasGroupHeaders) {
      columns.forEach(column => {
        if (column.type === 'group' && Array.isArray(column.children)) {
          column.children.forEach(childColumn => {
            cells.push(
              <TableCell 
                key={childColumn.id}
                align={childColumn.align || 'center'}
                data-column-id={childColumn.id}
                sx={{
                  fontWeight: 600,
                  backgroundColor: theme.palette.grey[100],
                  width: childColumn.width || 'auto',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  zIndex: pinnedColumns.includes(childColumn.id) ? 30 : 15,
                  ...getDragStyles(childColumn.id, false, column.id),
                  ...getPinnedStyles(childColumn.id)
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                  onClick={() => handleHeaderClick(childColumn.id, childColumn.sortable)}
                  {...getHeaderDragProps(childColumn.id, false, column.id)}
                >
                  {draggable && (
                    <DragIndicatorIcon 
                      fontSize="small" 
                      sx={{ 
                        mr: 1, 
                        cursor: 'grab',
                        color: theme.palette.grey[500],
                        animation: dragInfo.dragging && dragInfo.columnId === childColumn.id ? 'shake 0.3s infinite' : 'none',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '25%': { transform: 'translateX(-2px)' },
                          '75%': { transform: 'translateX(2px)' }
                        }
                      }} 
                    />
                  )}
                  <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
                    {childColumn.header || childColumn.label}
                  </Typography>
                  
                  {/* 정렬 아이콘 */}
                  {childColumn.sortable && sortConfig.key === childColumn.id && sortConfig.direction && (
                    <Box sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
                      {sortConfig.direction === 'asc' ? (
                        <ArrowUpwardIcon fontSize="small" />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  )}
                </Box>
              </TableCell>
            );
          });
        }
      });
    } else {
      // 일반 컬럼 헤더 셀
      columns.forEach(column => {
        // 체크박스 컬럼은 이미 추가했으므로 제외
        if (column.type !== 'checkbox') {
          cells.push(
            <TableCell 
              key={column.id}
              align={column.type === 'horizontal' ? 'left' : (column.align || 'center')}
              data-column-id={column.id}
              sx={{
                fontWeight: 600,
                backgroundColor: theme.palette.grey[100],
                width: column.width || 'auto',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                zIndex: pinnedColumns.includes(column.id) ? 30 : 15,
                ...getDragStyles(column.id),
                ...getPinnedStyles(column.id)
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  cursor: draggable ? 'grab' : 'pointer'
                }}
                onClick={() => handleHeaderClick(column.id, column.sortable)}
                {...getHeaderDragProps(column.id)}
              >
                {draggable && (
                  <DragIndicatorIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1, 
                      cursor: 'grab',
                      color: theme.palette.grey[500],
                      animation: dragInfo.dragging && dragInfo.columnId === column.id ? 'shake 0.3s infinite' : 'none',
                      '@keyframes shake': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '25%': { transform: 'translateX(-2px)' },
                        '75%': { transform: 'translateX(2px)' }
                      }
                    }} 
                  />
                )}
                <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
                  {column.header || column.label}
                </Typography>
                
                {/* 정렬 아이콘 */}
                {column.sortable && sortConfig.key === column.id && sortConfig.direction && (
                  <Box sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
                    {sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Box>
                )}
              </Box>
            </TableCell>
          );
        }
      });
    }
    
    return cells;
  };
  
  // 고정 컬럼 스타일 계산 - 실제 컬럼 너비 기반
  const getPinnedStyles = (columnId) => {
    if (!pinnedColumns.includes(columnId)) return {};
    
    // 실제 렌더링되는 컬럼 순서를 기준으로 마지막 고정 컬럼 확인
    const flatColumns = getFlatColumns();
    // 체크박스 컬럼 중복 방지: flatColumns에서 체크박스가 아닌 컬럼만 필터링
    const nonCheckboxColumns = flatColumns.filter(col => col.type !== 'checkbox');
    const allRenderColumns = checkable ? ['checkbox', ...nonCheckboxColumns.map(col => col.id)] : nonCheckboxColumns.map(col => col.id);
    const pinnedColumnsInOrder = allRenderColumns.filter(colId => pinnedColumns.includes(colId));
    const isLastPinned = columnId === pinnedColumnsInOrder[pinnedColumnsInOrder.length - 1];
    
    // 현재 컬럼의 left 위치 계산
    let leftPosition = 0;
    const currentColumnIndex = pinnedColumnsInOrder.indexOf(columnId);
    
    // 현재 컬럼보다 앞에 있는 고정 컬럼들의 너비를 합산
    for (let i = 0; i < currentColumnIndex; i++) {
      const prevColumnId = pinnedColumnsInOrder[i];
      
      // 측정된 너비 사용, 없으면 DOM에서 직접 측정
      let width = columnWidths[prevColumnId];
      if (!width) {
        const prevColumnElement = document.querySelector(`[data-column-id="${prevColumnId}"]`);
        if (prevColumnElement) {
          width = prevColumnElement.offsetWidth;
        } else {
          // 기본 너비 사용
          width = prevColumnId === 'checkbox' ? 48 : 120;
        }
      }
      
      leftPosition += width;
    }
    
    // console.log(`[TableHeader] ${columnId} 고정 스타일 적용 (left: ${leftPosition}px)`);
    
    return {
      position: 'sticky',
      left: `${leftPosition}px`,
      top: 0,
      zIndex: columnId === 'checkbox' ? 35 : columnId === 'no' ? 34 : 30,
      backgroundColor: theme.palette.grey[100],
      // 마지막 고정 컬럼에만 오른쪽 구분선 표시
      borderRight: isLastPinned ? `2px solid ${theme.palette.primary.main}` : 'none',
      boxShadow: isLastPinned ? `2px 0 5px rgba(0, 0, 0, 0.1)` : 'none',
      '&::after': isLastPinned ? {
        content: '""',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: theme.palette.primary.main,
        opacity: 0.3,
      } : {},
    };
  };
  
  return (
    <TableHead ref={ref} style={style}>
      {/* 그룹 헤더가 있는 경우 */}
      {hasGroupHeaders && renderGroupHeaderRow()}
      
      {/* 일반 헤더 행 */}
      <TableRow ref={headerRowRef}>
      {renderHeaderRow()}
      </TableRow>
    </TableHead>
  );
});

TableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  hasGroupHeaders: PropTypes.bool,
  onSort: PropTypes.func,
  sortConfig: PropTypes.object,
  checkable: PropTypes.bool,
  onToggleAll: PropTypes.func,
  allChecked: PropTypes.bool,
  draggable: PropTypes.bool,
  dragHandlers: PropTypes.shape({
    handleDragStart: PropTypes.func,
    handleDragEnd: PropTypes.func,
    handleDragOver: PropTypes.func,
    handleDrop: PropTypes.func
  }),
  dragInfo: PropTypes.object,
  style: PropTypes.object,
  pinnedColumns: PropTypes.array,
  tableKey: PropTypes.number
};

export default TableHeader; 