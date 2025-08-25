import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Email } from '@mui/icons-material';

const MessageTab = ({ selectedAgent }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Email />
        <Typography variant="h6">쪽지</Typography>
      </Box>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          쪽지 기능이 구현될 예정입니다.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MessageTab; 