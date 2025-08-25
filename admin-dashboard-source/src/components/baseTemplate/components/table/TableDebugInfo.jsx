import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * 테이블 디버깅 정보 컴포넌트
 * 
 * 개발 모드에서 테이블의 상태 정보를 시각적으로 표시합니다.
 * 
 * @param {Object} props
 * @param {number} props.currentPage - 현재 페이지 (0부터 시작)
 * @param {number} props.currentRowsPerPage - 페이지당 행 수
 * @param {number} props.dataLength - 원본 데이터 수
 * @param {number} props.filteredDataLength - 필터링된 데이터 수
 * @param {number} props.totalFlattenedItems - 총 항목 수 (계층 포함)
 * @param {string} props.searchText - 현재 검색어
 * @param {boolean} props.sequentialPageNumbers - 페이지 번호 모드
 * @param {boolean} props.isDragging - 리사이즈 드래그 상태
 * @param {string} props.tableHeight - 현재 테이블 높이
 * @param {number|string} props.maxHeight - 리사이즈 최대 높이
 * @param {Array} props.pinnedColumns - 고정된 컬럼 목록
 * @param {number} props.visibleColumnsCount - 표시 컬럼 수
 * @param {number} props.totalColumnsCount - 전체 컬럼 수
 * @param {number} props.hiddenColumnsCount - 숨김 컬럼 수
 * @param {Object} props.columnVisibility - 컬럼 표시 상태
 * @param {boolean} props.autoHeight - 자동 높이 모드
 * @param {Function} props.calculateMaxHeight - 최대 높이 계산 함수
 * @param {boolean} props.show - 디버깅 정보 표시 여부
 * @param {Object} props.sx - 추가 스타일 속성
 * @returns {JSX.Element}
 */
const TableDebugInfo = ({
  currentPage = 0,
  currentRowsPerPage = 10,
  dataLength = 0,
  filteredDataLength = 0,
  totalFlattenedItems = 0,
  searchText = '',
  sequentialPageNumbers = false,
  isDragging = false,
  tableHeight = '400px',
  maxHeight = 'Infinity',
  pinnedColumns = [],
  visibleColumnsCount = 0,
  totalColumnsCount = 0,
  hiddenColumnsCount = 0,
  columnVisibility = {},
  autoHeight = true,
  calculateMaxHeight = null,
  show = true,
  sx = {}
}) => {
  if (!show) return null;

  const totalPages = Math.ceil(totalFlattenedItems / currentRowsPerPage);
  const hiddenColumnNames = Object.keys(columnVisibility).filter(key => !columnVisibility[key]);
  const parsedHeight = parseFloat(tableHeight);
  const calculatedMaxHeight = calculateMaxHeight ? calculateMaxHeight() : maxHeight;

  return (
    <Box 
      sx={{ 
        mt: 1, 
        p: 1, 
        border: '1px dashed #ccc', 
        borderRadius: 1,
        bgcolor: '#f5f5f5',
        ...sx
      }}
    >
      <Typography variant="caption" component="div">
        <strong>디버그 정보:</strong><br />
        - 현재 페이지: {currentPage + 1} (인덱스: {currentPage})<br />
        - 페이지당 행 수: {currentRowsPerPage}<br />
        - 원본 데이터 수: {dataLength}<br />
        - 필터링된 데이터 수: {filteredDataLength}<br />
        - 총 항목 수(계층 포함): {totalFlattenedItems}<br />
        - 페이지 수: {totalPages}<br />
        - <span style={{ fontWeight: 'bold', color: searchText ? 'blue' : 'inherit' }}>
            현재 검색어: {searchText ? `"${searchText}"` : '없음'}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: sequentialPageNumbers ? 'green' : 'inherit' }}>
            페이지 번호 모드: {sequentialPageNumbers ? '연속 번호' : '페이지별 번호'}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: isDragging ? 'red' : 'inherit' }}>
            리사이즈 상태: {isDragging ? '드래그 중' : '대기 중'}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: 'purple' }}>
            현재 테이블 높이: {tableHeight}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: 'orange' }}>
            리사이즈 최대 높이: {calculatedMaxHeight === Infinity || calculatedMaxHeight === 'Infinity' ? '제한 없음' : `${calculatedMaxHeight}px`}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: 'blue' }}>
            parseFloat(tableHeight): {parsedHeight}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: 'green' }}>
            자동 높이 모드: {autoHeight ? 'ON' : 'OFF'}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: 'teal' }}>
            고정 컬럼: {pinnedColumns.length > 0 ? pinnedColumns.join(', ') : '없음'}
          </span><br />
        - <span style={{ fontWeight: 'bold', color: 'indigo' }}>
            표시 컬럼: {visibleColumnsCount}/{totalColumnsCount}개
          </span><br />
        - <span style={{ fontWeight: 'bold', color: hiddenColumnsCount > 0 ? 'red' : 'green' }}>
            숨김 컬럼: {hiddenColumnsCount}개 {hiddenColumnsCount > 0 ? `(${hiddenColumnNames.join(', ')})` : ''}
          </span>
      </Typography>
    </Box>
  );
};

TableDebugInfo.propTypes = {
  currentPage: PropTypes.number,
  currentRowsPerPage: PropTypes.number,
  dataLength: PropTypes.number,
  filteredDataLength: PropTypes.number,
  totalFlattenedItems: PropTypes.number,
  searchText: PropTypes.string,
  sequentialPageNumbers: PropTypes.bool,
  isDragging: PropTypes.bool,
  tableHeight: PropTypes.string,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pinnedColumns: PropTypes.array,
  visibleColumnsCount: PropTypes.number,
  totalColumnsCount: PropTypes.number,
  hiddenColumnsCount: PropTypes.number,
  columnVisibility: PropTypes.object,
  autoHeight: PropTypes.bool,
  calculateMaxHeight: PropTypes.func,
  show: PropTypes.bool,
  sx: PropTypes.object
};

export default TableDebugInfo; 