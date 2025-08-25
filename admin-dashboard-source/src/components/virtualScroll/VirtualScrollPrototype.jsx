import React, { useState, useEffect, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import { Box, Paper, Typography, Card, CardContent } from '@mui/material';

/**
 * Virtual Scroll Prototype Component
 * 최소 작동 프로토타입 - react-window 검증용
 */
const VirtualScrollPrototype = () => {
  // 컨테이너 참조
  const containerRef = useRef(null);
  
  // 컨테이너 크기 상태
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600
  });

  // 테스트 데이터 생성 (100개 아이템)
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i}`,
    name: `Test Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000)
  }));

  // 컨테이너 크기 측정
  useEffect(() => {
    const measureContainer = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        console.log('Container measured:', { width, height });
        
        // 숫자값으로 설정 (react-window 요구사항)
        const numWidth = Math.floor(width);
        const numHeight = Math.floor(height);
        
        // 타입 검증
        if (typeof numWidth !== 'number' || typeof numHeight !== 'number') {
          console.error('❌ Width/Height must be numbers!', { numWidth, numHeight });
          return;
        }
        
        console.log('✅ Numeric values:', { numWidth, numHeight, typeWidth: typeof numWidth, typeHeight: typeof numHeight });
        
        setContainerSize({
          width: numWidth,
          height: numHeight
        });
      }
    };

    // 초기 측정
    measureContainer();

    // 리사이즈 이벤트 처리
    const handleResize = () => {
      measureContainer();
    };

    window.addEventListener('resize', handleResize);
    
    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 그리드 설정
  const columnCount = 4;
  const rowCount = Math.ceil(items.length / columnCount);
  const columnWidth = Math.floor(containerSize.width / columnCount);
  const rowHeight = 150;

  // 아이템 렌더러
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = items[itemIndex];

    if (!item) {
      return null;
    }

    return (
      <div style={style}>
        <Card 
          sx={{ 
            m: 1, 
            height: 'calc(100% - 16px)',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 3
            }
          }}
        >
          <CardContent>
            <Typography variant="h6" noWrap>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Value: {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Index: {itemIndex}
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Virtual Scroll Prototype
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Container Size: {containerSize.width} x {containerSize.height}px | 
        Grid: {columnCount} columns x {rowCount} rows | 
        Items: {items.length}
      </Typography>

      <Paper 
        ref={containerRef}
        sx={{ 
          width: '100%', 
          height: '70vh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <FixedSizeGrid
            columnCount={columnCount}
            columnWidth={columnWidth}
            height={containerSize.height}
            rowCount={rowCount}
            rowHeight={rowHeight}
            width={containerSize.width}
          >
            {Cell}
          </FixedSizeGrid>
        )}
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="success.main">
          ✅ Virtual scrolling is working if you can see cards above
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Only visible items are rendered in DOM. Check DevTools to verify.
        </Typography>
      </Box>
    </Box>
  );
};

export default VirtualScrollPrototype;