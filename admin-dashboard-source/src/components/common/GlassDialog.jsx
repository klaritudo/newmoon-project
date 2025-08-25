import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * 글래스 모피즘 스타일의 재사용 가능한 다이얼로그 컴포넌트
 */
const GlassDialog = ({
  open,
  onClose,
  title,
  icon,
  children,
  actions,
  dialogProps = {},
  className = '',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={`glass-dialog ${className}`}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }
      }}
      {...dialogProps}
    >
      <DialogTitle 
        sx={{ 
          background: 'rgba(25, 118, 210, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'white',
          fontWeight: 600,
          p: 2,
          m: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            aria-label="close"
            size="small"
            sx={{ color: 'white' }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{
        background: 'rgba(255, 255, 255, 0.5)',
        p: '20px',
        pt: '20px'
      }}>
        {children}
      </DialogContent>
      
      {actions && (
        <Box sx={{ 
          p: '16px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(224, 224, 224, 0.8)',
          background: 'rgba(250, 250, 250, 0.8)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}>
          {actions}
        </Box>
      )}
    </Dialog>
  );
};

export default GlassDialog;