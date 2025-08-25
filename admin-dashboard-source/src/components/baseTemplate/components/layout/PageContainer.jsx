import React from 'react';
import { Container, Grid } from '@mui/material';

/**
 * 페이지 컨테이너 컴포넌트
 * 모든 페이지에서 일관된 패딩과 최대 너비를 제공합니다.
 * Grid 구조가 내장되어 있어 모든 페이지에서 동일한 레이아웃을 보장합니다.
 */
const PageContainer = ({ 
  children, 
  maxWidth = "xl", 
  spacing = 3,
  sx = {}, 
  ...props 
}) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      className="no-grid-padding"
      sx={{ 
        py: 3, // 상하 패딩 24px (3 * 8px)
        px: 0, // 좌우 패딩 제거 (기본 24px/16px 제거)
        ...sx 
      }} 
      {...props}
    >
      <Grid container spacing={spacing}>
        <Grid item xs={12}>
          {children}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PageContainer; 