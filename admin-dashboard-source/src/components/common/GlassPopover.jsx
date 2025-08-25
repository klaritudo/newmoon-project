import React from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * 글래스 모피즘 스타일의 재사용 가능한 팝오버 컴포넌트
 */
const GlassPopover = ({
  open,
  anchorEl,
  onClose,
  title,
  icon,
  children,
  popoverProps = {},
  className = '',
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      className={`glass-popover ${className}`}
      PaperProps={{
        elevation: 4,
        sx: {
          mt: 1,
          width: '380px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }
      }}
      {...popoverProps}
    >
      <Box sx={{ 
        bgcolor: 'rgba(248, 249, 250, 0.7)', 
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        p: 2, 
        borderBottom: '1px solid rgba(224, 224, 224, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: '600', 
            color: 'rgba(25, 118, 210, 0.9)', 
            display: 'flex', 
            alignItems: 'center' 
          }}
        >
          {icon}
          {title}
        </Typography>
        <IconButton 
          size="small" 
          onClick={onClose} 
          sx={{ color: 'rgba(119, 119, 119, 0.8)' }}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Box sx={{ p: 2.5 }}>
        {children}
      </Box>
    </Popover>
  );
};

export default GlassPopover;