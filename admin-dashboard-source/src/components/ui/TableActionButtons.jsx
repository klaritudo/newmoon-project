import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * 테이블 액션 버튼 컴포넌트
 * 선택된 항목들에 대한 일괄 액션을 위한 버튼들을 제공합니다.
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.selectedCount - 선택된 항목 수
 * @param {Function} props.onSuspend - 중지 버튼 클릭 핸들러 (선택적)
 * @param {Function} props.onDelete - 삭제 버튼 클릭 핸들러 (선택적)
 * @param {Function} props.onPermanentDelete - 완전 삭제 버튼 클릭 핸들러 (선택적)
 * @param {string} props.selectedLabel - 선택 항목에 대한 라벨 (기본값: "명")
 * @param {Object} props.sx - 추가 스타일 (Material-UI sx prop)
 * @param {Array} props.actions - 커스텀 액션 버튼 (선택적)
 * @returns {JSX.Element}
 */
const TableActionButtons = ({
  selectedCount,
  onSuspend,
  onDelete,
  onPermanentDelete,
  selectedLabel = '명',
  sx = {},
  actions = []
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2,
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: '6px',
        flexWrap: 'wrap',
        alignItems: 'center',
        ...sx
      }}
    >
      <Typography variant="body2" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
        <strong>{selectedCount}{selectedLabel}</strong> 선택됨
      </Typography>
      
      {onSuspend && (
        <Button 
          variant="outlined" 
          color="info" 
          startIcon={<PauseCircleOutlineIcon />}
          onClick={onSuspend}
          size="small"
        >
          중지
        </Button>
      )}
      
      {onDelete && (
        <Button 
          variant="outlined" 
          color="warning" 
          startIcon={<PauseCircleOutlineIcon />}
          onClick={onDelete}
          size="small"
        >
          삭제
        </Button>
      )}
      
      {onPermanentDelete && (
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={onPermanentDelete}
          size="small"
        >
          완전삭제
        </Button>
      )}
      
      {/* 커스텀 액션 버튼 */}
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outlined"}
          color={action.color || "primary"}
          startIcon={action.icon}
          onClick={action.onClick}
          size="small"
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
};

TableActionButtons.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onSuspend: PropTypes.func,
  onDelete: PropTypes.func,
  onPermanentDelete: PropTypes.func,
  selectedLabel: PropTypes.string,
  sx: PropTypes.object,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      color: PropTypes.string,
      icon: PropTypes.node,
      disabled: PropTypes.bool
    })
  )
};

export default TableActionButtons; 