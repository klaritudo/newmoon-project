import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

/**
 * 테이블 리사이즈 핸들 컴포넌트
 * 
 * 이 컴포넌트는 테이블 높이를 조절할 수 있는 시각적 핸들을 제공합니다.
 * useTableResize 훅과 함께 사용됩니다.
 * 
 * @param {Object} props
 * @param {Object} props.resizeHandleProps - useTableResize 훅의 getResizeHandleProps() 반환값
 * @param {boolean} props.showIcon - 핸들 아이콘 표시 여부
 * @param {boolean} props.isDragging - 현재 드래그 중인지 여부
 * @param {Object} props.sx - 추가 스타일 속성
 * @returns {JSX.Element}
 */
const TableResizeHandle = ({ 
  resizeHandleProps,
  showIcon = true,
  isDragging = false,
  sx = {} 
}) => {
  return (
    <Box
      {...resizeHandleProps}
      sx={{
        width: '100%',
        minHeight: '8px',
        position: 'relative',
        mt: 1,
        opacity: isDragging ? 1 : 0.7,
        backgroundColor: isDragging 
          ? 'rgba(25, 118, 210, 0.08)' 
          : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
          opacity: 1
        },
        transition: 'opacity 0.2s, background-color 0.2s',
        ...sx
      }}
    >
      {showIcon && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: isDragging
              ? 'rgba(25, 118, 210, 0.7)' 
              : 'rgba(0, 0, 0, 0.3)',
            transition: 'background-color 0.2s'
          }}
        />
      )}
    </Box>
  );
};

TableResizeHandle.propTypes = {
  resizeHandleProps: PropTypes.object.isRequired,
  showIcon: PropTypes.bool,
  isDragging: PropTypes.bool,
  sx: PropTypes.object
};

export default TableResizeHandle;