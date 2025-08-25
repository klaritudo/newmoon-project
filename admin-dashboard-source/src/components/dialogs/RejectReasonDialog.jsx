import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close, Warning } from '@mui/icons-material';

/**
 * 비승인 사유 표시 다이얼로그
 * @param {Object} props
 * @param {boolean} props.open - 다이얼로그 오픈 여부
 * @param {Function} props.onClose - 다이얼로그 닫기 핸들러
 * @param {string} props.reason - 비승인 사유
 * @param {string} props.title - 다이얼로그 제목 (선택적)
 */
const RejectReasonDialog = ({ 
  open, 
  onClose, 
  reason, 
  title = '비승인 사유' 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'error.lighter', 
          borderRadius: 1,
          border: 1,
          borderColor: 'error.light'
        }}>
          <Typography variant="body1" sx={{ color: 'error.dark' }}>
            {reason || '비승인 사유가 없습니다.'}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          size="small"
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonDialog;