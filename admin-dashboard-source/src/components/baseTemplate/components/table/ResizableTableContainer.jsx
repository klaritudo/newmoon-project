import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TableResizeHandle from './TableResizeHandle';

/**
 * 리사이징 기능을 가진 테이블 컨테이너 컴포넌트
 * 
 * 이 컴포넌트는 테이블을 감싸고 리사이즈 기능을 제공하는 컨테이너입니다.
 * useTableResize 훅과 함께 사용됩니다.
 * 
 * @param {Object} props 
 * @param {React.ReactNode} props.children - 자식 요소
 * @param {Object} props.resizeProps - 리사이즈 관련 속성
 * @param {Function} props.resizeProps.handleResizeStart - 리사이즈 시작 핸들러
 * @param {boolean} props.resizeProps.isResizing - 리사이징 중인지 여부
 * @param {Object} props.resizeProps.resizeHandleRef - 리사이즈 핸들 ref
 * @param {string} props.tableHeight - 테이블 높이
 * @param {boolean} props.showResizeHandle - 리사이즈 핸들 표시 여부
 * @param {Object} props.sx - 추가 스타일 속성
 * @param {Object} props.containerRef - 컨테이너 ref
 * @returns {JSX.Element}
 */
const ResizableTableContainer = ({ 
  children, 
  resizeProps = {}, 
  tableHeight = '400px',
  showResizeHandle = true,
  sx = {},
  containerRef = null
}) => {
  const { 
    handleResizeStart, 
    isResizing, 
    resizeHandleRef 
  } = resizeProps;
  
  return (
    <Box
      ref={containerRef}
      sx={{ 
        position: 'relative',
        width: '100%', 
        height: tableHeight,
        overflowX: 'auto',
        overflowY: 'auto',
        ...sx
      }}
    >
      {children}
      
      {showResizeHandle && handleResizeStart && (
        <TableResizeHandle
          resizeHandleProps={{
            ref: resizeHandleRef,
            onMouseDown: handleResizeStart
          }}
          isDragging={isResizing}
          showIcon={true}
        />
      )}
    </Box>
  );
};

ResizableTableContainer.propTypes = {
  children: PropTypes.node.isRequired,
  resizeProps: PropTypes.shape({
    handleResizeStart: PropTypes.func,
    isResizing: PropTypes.bool,
    resizeHandleRef: PropTypes.object
  }),
  tableHeight: PropTypes.string,
  showResizeHandle: PropTypes.bool,
  sx: PropTypes.object,
  containerRef: PropTypes.object
};

export default ResizableTableContainer; 