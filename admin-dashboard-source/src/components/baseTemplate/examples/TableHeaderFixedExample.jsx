import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  FormControlLabel,
  Switch,
  Divider,
  Slider,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import BaseTable from '../components/table/BaseTable';
import { useTableHeaderFixed } from '../hooks';

const generateData = (count) => {
  const data = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      category: `Category ${Math.ceil(i / 10)}`,
      price: Math.floor(Math.random() * 10000) / 100,
      quantity: Math.floor(Math.random() * 100),
      status: Math.random() > 0.5 ? '활성' : '비활성',
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
    });
  }
  return data;
};

const COLUMNS = [
  { id: 'id', header: 'ID', width: 80 },
  { id: 'name', header: '이름', width: 200 },
  { id: 'category', header: '카테고리', width: 150 },
  { id: 'price', header: '가격', width: 120 },
  { id: 'quantity', header: '수량', width: 100 },
  { id: 'status', header: '상태', width: 100 },
  { id: 'lastUpdated', header: '최종 업데이트', width: 150 }
];

/**
 * 테이블 헤더 행 고정 예제 컴포넌트
 */
const TableHeaderFixedExample = () => {
  // 예제 데이터 생성
  const [data, setData] = useState(() => generateData(100));
  
  // 테이블 헤더 고정 설정
  const [isHeaderFixed, setIsHeaderFixed] = useState(true);
  const [offsetTop, setOffsetTop] = useState(0);
  const [maxHeight, setMaxHeight] = useState(400);
  const [useRelativeHeight, setUseRelativeHeight] = useState(false);
  
  // useTableHeaderFixed 훅 사용 (추가 스타일 제어용)
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    offsetTop,
    zIndex: 10,
    bgColor: 'white',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });
  
  // 테이블 헤더 스타일 계산
  const headerStyles = React.useMemo(() => {
    if (!isHeaderFixed) return {};
    
    return getTableHeaderStyles();
  }, [isHeaderFixed, getTableHeaderStyles]);
  
  // 최대 높이 계산
  const tableMaxHeight = React.useMemo(() => {
    if (!isHeaderFixed) return 'none';
    
    return useRelativeHeight ? 'calc(100vh - 300px)' : `${maxHeight}px`;
  }, [isHeaderFixed, maxHeight, useRelativeHeight]);
  
  // 데이터 개수 변경 핸들러
  const handleDataCountChange = (event) => {
    const count = parseInt(event.target.value) || 0;
    setData(generateData(count));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        테이블 헤더 행 고정 예제
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          설정
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={isHeaderFixed}
                  onChange={(e) => setIsHeaderFixed(e.target.checked)}
                />
              }
              label="헤더 행 고정 활성화"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={useRelativeHeight}
                  onChange={(e) => setUseRelativeHeight(e.target.checked)}
                  disabled={!isHeaderFixed}
                />
              }
              label="뷰포트 기준 높이 사용"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="데이터 개수"
              type="number"
              value={data.length}
              onChange={handleDataCountChange}
              InputProps={{
                inputProps: { min: 1, max: 1000 },
                endAdornment: <InputAdornment position="end">행</InputAdornment>
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography id="offset-slider" gutterBottom>
              상단 오프셋 (px)
            </Typography>
            <Slider
              value={offsetTop}
              onChange={(_, newValue) => setOffsetTop(newValue)}
              aria-labelledby="offset-slider"
              valueLabelDisplay="auto"
              min={0}
              max={100}
              disabled={!isHeaderFixed}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography id="height-slider" gutterBottom>
              최대 높이 (px)
            </Typography>
            <Slider
              value={maxHeight}
              onChange={(_, newValue) => setMaxHeight(newValue)}
              aria-labelledby="height-slider"
              valueLabelDisplay="auto"
              min={100}
              max={800}
              disabled={!isHeaderFixed || useRelativeHeight}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Divider sx={{ mb: 4 }} />
      
      <Box>
        <BaseTable
          columns={COLUMNS}
          data={data}
          tableHeaderRef={tableHeaderRef}
          headerStyle={headerStyles}
          fixedHeader={isHeaderFixed}
          maxHeight={tableMaxHeight}
        />
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          * 스크롤하여 헤더 행 고정 효과를 확인하세요.
        </Typography>
      </Box>
    </Container>
  );
};

export default TableHeaderFixedExample; 