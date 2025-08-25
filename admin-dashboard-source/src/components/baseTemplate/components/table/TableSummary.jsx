import React, { useMemo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  useTheme
} from '@mui/material';

/**
 * 테이블 합계 행 컴포넌트
 * BaseTable에서 사용하는 합계 기능 구현
 */
const TableSummary = ({
  columns,
  summaryData = null,
  summaryConfig = null,
  checkable = false,
  pinnedColumns = [],
  showCurrentPageOnly = false,
  onToggle,
  tableKey = 0,
  fixedFooter = false
}) => {
  const theme = useTheme();
  const [columnWidths, setColumnWidths] = useState({});
  
  // 그룹 헤더 감지
  const hasGroupHeaders = useMemo(() => {
    return columns.some(col => col.type === 'group');
  }, [columns]);
  
  // 플랫 컬럼 배열 생성 - TableHeader/TableBody와 동일한 방식
  const getFlatColumns = useCallback(() => {
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
  }, [columns]);
  
  const flatColumns = useMemo(() => getFlatColumns(), [getFlatColumns]);
  
  // 자동 병합을 위한 컬럼 수 계산
  const calculateColSpan = useCallback(() => {
    let totalWidth = 0;
    let colSpanCount = 0;
    const minRequiredWidth = 150; // 최소 필요 너비
    
    // checkbox 제외한 데이터 컬럼들만 확인
    const dataColumns = flatColumns.filter(col => col.type !== 'checkbox');
    
    for (const column of dataColumns) {
      // 컬럼 너비 파싱 (문자열이면 숫자로 변환)
      let width = column.width;
      if (typeof width === 'string') {
        width = parseInt(width.replace('px', ''), 10);
      }
      width = width || 100; // 기본값
      
      totalWidth += width;
      colSpanCount++;
      
      // 최소 너비 확보되면 중단
      if (totalWidth >= minRequiredWidth) {
        break;
      }
    }
    
    // 최소 1개는 사용
    return Math.max(1, colSpanCount);
  }, [flatColumns]);
  
  const colSpanCount = useMemo(() => calculateColSpan(), [calculateColSpan]);
  
  // 컬럼 너비 측정 및 업데이트
  const updateColumnWidths = useCallback(() => {
    const newWidths = {};
    const cells = document.querySelectorAll('thead [data-column-id]');
    
    cells.forEach(cell => {
      const columnId = cell.getAttribute('data-column-id');
      if (columnId) {
        newWidths[columnId] = cell.offsetWidth;
      }
    });
    
    setColumnWidths(newWidths);
  }, []);
  
  // 테이블 키 변경 시 컬럼 너비 재측정
  useEffect(() => {
    const timer = setTimeout(() => {
      updateColumnWidths();
    }, 150); // 헤더보다 약간 늦게 측정
    
    return () => clearTimeout(timer);
  }, [tableKey, updateColumnWidths]);
  
  // 합계 값 포맷팅
  const formatSummaryValue = useCallback((columnId, value) => {
    const config = summaryConfig?.columns?.[columnId];
    if (!config || value === null || value === undefined) return '-';
    
    switch (config.format) {
      case 'currency':
        return `${config.prefix || ''}${Number(value).toLocaleString()}${config.suffix || '원'}`;
      case 'percent':
        return `${Number(value).toFixed(config.precision || 2)}%`;
      case 'number':
        return Number(value).toLocaleString();
      default:
        return value;
    }
  }, [summaryConfig]);
  
  // 고정 컬럼 스타일 계산 - TableBody와 동일한 방식
  const getPinnedStyles = useCallback((columnId, rowBackgroundColor = summaryConfig?.ui?.styling?.backgroundColor || theme.palette.grey[100]) => {
    if (!pinnedColumns.includes(columnId)) return {};
    
    // 실제 렌더링되는 컬럼 순서를 기준으로 마지막 고정 컬럼 확인
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
      
      // 측정된 너비 사용, 없으면 기본값 사용
      let width = columnWidths[prevColumnId];
      if (!width) {
        // 기본 너비만 사용
        width = prevColumnId === 'checkbox' ? 48 : 120;
      }
      
      leftPosition += width;
    }
    
    return {
      position: 'sticky',
      left: `${leftPosition}px`,
      zIndex: columnId === 'no' ? 15 : columnId === 'checkbox' ? 14 : 10,
      backgroundColor: rowBackgroundColor,
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
  }, [pinnedColumns, columnWidths, checkable, theme, summaryConfig, flatColumns]);
  
  if (!summaryConfig?.enabled || !summaryData) return null;
  
  return (
    <TableRow 
      sx={{
        backgroundColor: summaryConfig?.ui?.styling?.backgroundColor || '#f5f5f5',
        fontWeight: summaryConfig?.ui?.styling?.fontWeight || 600,
        '& td': {
          borderTop: `2px solid ${summaryConfig?.ui?.styling?.borderColor || theme.palette.primary.main}`,
          borderBottom: 'none'
        },
        // hover 효과 비활성화
        '&:hover': {
          backgroundColor: summaryConfig?.ui?.styling?.backgroundColor || '#f5f5f5',
        },
        // 하단 고정 스타일
        ...(fixedFooter && {
          position: 'sticky',
          bottom: 0,
          zIndex: 20,
          boxShadow: `0 -2px 5px rgba(0, 0, 0, 0.1)`,
          backgroundColor: summaryConfig?.ui?.styling?.backgroundColor || '#f5f5f5'
        })
      }}
    >
      {/* 체크박스 컬럼 */}
      {checkable && (
        <TableCell 
          padding="checkbox"
          sx={getPinnedStyles('checkbox')}
        />
      )}
      
      {/* 데이터 컬럼들 */}
      {flatColumns.map((column, index) => {
        // checkbox 컬럼은 이미 처리했으므로 건너뛰기
        if (column.type === 'checkbox') return null;
        
        // 실제 데이터 컬럼 중 몇 번째인지 확인
        const dataColumnIndex = flatColumns.filter((col, i) => i < index && col.type !== 'checkbox').length;
        const isFirstDataColumn = dataColumnIndex === 0;
        
        // 병합된 컬럼은 렌더링하지 않음 (첫 번째 컬럼 제외)
        if (!isFirstDataColumn && dataColumnIndex < colSpanCount) {
          return null;
        }
        
        const summaryValue = summaryData[column.id];
        
        return (
          <TableCell
            key={`${column.id}-${tableKey}`}
            data-column-id={column.id}
            align={column.align || 'center'}
            colSpan={isFirstDataColumn ? colSpanCount : 1}
            sx={{
              ...getPinnedStyles(column.id),
              whiteSpace: 'nowrap'
            }}
          >
            {isFirstDataColumn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {summaryConfig?.ui?.label || '합계'}
                </Typography>
                {summaryConfig?.ui?.toggleable && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={showCurrentPageOnly}
                        onChange={(e) => onToggle?.(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="caption">
                        {summaryConfig?.ui?.toggleLabel || '현재 페이지만'}
                      </Typography>
                    }
                    sx={{ ml: 2, mb: 0 }}
                  />
                )}
              </Box>
            ) : summaryValue !== undefined ? (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatSummaryValue(column.id, summaryValue)}
              </Typography>
            ) : null}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

TableSummary.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  summaryData: PropTypes.object,
  summaryConfig: PropTypes.object,
  checkable: PropTypes.bool,
  pinnedColumns: PropTypes.arrayOf(PropTypes.string),
  showCurrentPageOnly: PropTypes.bool,
  onToggle: PropTypes.func,
  tableKey: PropTypes.number,
  fixedFooter: PropTypes.bool
};

// defaultProps 제거 - 함수 매개변수에서 기본값 설정으로 대체

export default TableSummary;