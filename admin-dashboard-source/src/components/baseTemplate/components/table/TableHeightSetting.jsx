import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * 테이블 높이 설정 UI 컴포넌트
 * 
 * 테이블 높이를 자동으로 조정하거나 수동으로 설정할 수 있는 UI를 제공합니다.
 * useTableAutoHeight 훅과 함께 사용됩니다.
 * 
 * @param {Object} props
 * @param {string} props.tableHeight - 현재 테이블 높이
 * @param {boolean} props.autoHeight - 자동 높이 조정 활성화 여부
 * @param {Function} props.toggleAutoHeight - 자동 높이 조정 토글 함수
 * @param {Function} props.setManualHeight - 수동 높이 설정 함수
 * @param {number} props.minHeight - 최소 높이 (px)
 * @param {number} props.maxHeight - 최대 높이 (px)
 * @param {number} props.step - 슬라이더 단계 (px)
 * @param {boolean} props.showAutoHeightToggle - 자동 높이 조정 체크박스 표시 여부
 * @param {Object} props.sx - 추가 스타일 속성
 * @returns {JSX.Element}
 */
const TableHeightSetting = ({
  tableHeight,
  autoHeight,
  toggleAutoHeight,
  setManualHeight,
  minHeight = 200,
  maxHeight = 800,
  step = 50,
  showAutoHeightToggle = true,
  sx = {}
}) => {
  // 현재 높이 값을 정수로 변환 (px 단위 제거)
  const currentHeight = parseInt(tableHeight);
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: 'rgba(0, 0, 0, 0.02)',
        ...sx
      }}
    >
      <Typography variant="body2">
        테이블 높이: {autoHeight ? '자동 조정' : tableHeight}
      </Typography>
      {showAutoHeightToggle && (
      <label 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        <input
          type="checkbox"
          checked={autoHeight}
          onChange={() => toggleAutoHeight()}
          style={{ marginRight: '4px' }}
        />
        자동 높이 조정
      </label>
      )}
      {!autoHeight && (
        <input
          type="range"
          min={minHeight}
          max={maxHeight}
          step={step}
          value={currentHeight}
          onChange={(e) => setManualHeight(parseInt(e.target.value))}
          style={{ width: '150px' }}
        />
      )}
    </Box>
  );
};

TableHeightSetting.propTypes = {
  tableHeight: PropTypes.string.isRequired,
  autoHeight: PropTypes.bool.isRequired,
  toggleAutoHeight: PropTypes.func.isRequired,
  setManualHeight: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  step: PropTypes.number,
  showAutoHeightToggle: PropTypes.bool,
  sx: PropTypes.object
};

export default TableHeightSetting; 