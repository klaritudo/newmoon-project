import React from 'react';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { Error as ErrorIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found 페이지
 * 
 * 요청한 페이지를 찾을 수 없을 때 보여주는 에러 페이지입니다.
 */
const NotFound = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <ErrorIcon 
          sx={{ 
            fontSize: 100, 
            color: theme.palette.error.main,
            mb: 4,
          }} 
        />
        
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            mb: 3,
            color: theme.palette.text.primary,
            fontWeight: 500,
          }}
        >
          페이지를 찾을 수 없습니다
        </Typography>
        
        <Typography 
          variant="body1"
          color="text.secondary"
          sx={{ 
            mb: 4,
            maxWidth: 500,
          }}
        >
          요청하신 페이지가 삭제되었거나, 이름이 변경되었거나, 일시적으로 사용이 불가능합니다.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/dashboard"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowBackIcon />}
            sx={{
              py: 1.5,
              px: 3,
              boxShadow: '0 8px 16px -4px rgba(33, 150, 243, 0.3)',
            }}
          >
            대시보드로 돌아가기
          </Button>
          
          <Button
            component="a"
            href="mailto:support@example.com"
            variant="outlined"
            color="primary"
            size="large"
            sx={{ py: 1.5, px: 3 }}
          >
            관리자에게 문의하기
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound; 