import React from 'react';
import { Container } from '@mui/material';
import VirtualScrollPrototype from '../components/virtualScroll/VirtualScrollPrototype';

/**
 * Virtual Scroll Test Page
 * 가상 스크롤 프로토타입 테스트용 페이지
 */
const VirtualScrollTest = () => {
  return (
    <Container maxWidth="xl">
      <VirtualScrollPrototype />
    </Container>
  );
};

export default VirtualScrollTest;