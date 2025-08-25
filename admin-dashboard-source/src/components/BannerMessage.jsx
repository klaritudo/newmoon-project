import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const BannerMessage = ({ title, message, severity = 'info', onClose, ...props }) => {
  return (
    <Alert 
      severity={severity} 
      onClose={onClose}
      sx={{ mb: 2 }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default BannerMessage;