import React from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Fade,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * 벌크 액션 바 컴포넌트
 * 테이블 하단에 표시되는 벌크 액션 버튼들
 */
const BulkActionBar = ({
  selectedCount = 0,
  actions = [],
  onAction,
  onClear,
  isProcessing = false,
  position = 'bottom',
  sx = {}
}) => {
  // 선택된 항목이 없으면 표시하지 않음
  if (selectedCount === 0) return null;

  // 기본 액션 아이콘 매핑
  const actionIcons = {
    activate: <CheckCircleIcon />,
    suspend: <BlockIcon />,
    delete: <DeleteIcon />,
  };

  // 기본 액션 색상 매핑
  const actionColors = {
    activate: 'success',
    suspend: 'warning',
    delete: 'error',
  };

  return (
    <Fade in={selectedCount > 0} timeout={300}>
      <Paper
        elevation={3}
        sx={{
          position: position === 'fixed' ? 'fixed' : 'relative',
          bottom: position === 'fixed' ? 16 : 'auto',
          left: position === 'fixed' ? '50%' : 'auto',
          transform: position === 'fixed' ? 'translateX(-50%)' : 'none',
          zIndex: 1200,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          ...sx
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* 선택된 항목 수 표시 */}
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedCount}개 선택됨
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* 액션 버튼들 */}
          <Stack direction="row" spacing={1}>
            {actions.map((action) => (
              <Button
                key={action.type}
                variant={action.variant || 'outlined'}
                color={action.color || actionColors[action.type] || 'primary'}
                size="small"
                startIcon={
                  isProcessing && action.type === isProcessing ? 
                    <CircularProgress size={16} /> : 
                    (action.icon || actionIcons[action.type])
                }
                onClick={() => onAction(action.type)}
                disabled={
                  isProcessing || 
                  (action.disabled && action.disabled(selectedCount))
                }
                sx={{ minWidth: 100 }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* 선택 해제 버튼 */}
          <Button
            variant="text"
            size="small"
            startIcon={<CloseIcon />}
            onClick={onClear}
            disabled={isProcessing}
            sx={{ ml: 1 }}
          >
            선택 해제
          </Button>
        </Stack>
      </Paper>
    </Fade>
  );
};

export default BulkActionBar;