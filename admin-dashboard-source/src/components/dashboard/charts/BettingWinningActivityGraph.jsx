import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Box, useTheme } from '@mui/material';

// 베팅/당첨금 데이터 (예시)
const bettingWinningData = [
  { name: '1일', 베팅금액: 8000000, 당첨금액: 7400000 },
  { name: '2일', 베팅금액: 7000000, 당첨금액: 6398000 },
  { name: '3일', 베팅금액: 9000000, 당첨금액: 8800000 },
  { name: '4일', 베팅금액: 8780000, 당첨금액: 7908000 },
  { name: '5일', 베팅금액: 7890000, 당첨금액: 6800000 },
  { name: '6일', 베팅금액: 8390000, 당첨금액: 7800000 },
  { name: '7일', 베팅금액: 9490000, 당첨금액: 8300000 },
  { name: '8일', 베팅금액: 8490000, 당첨금액: 7300000 },
  { name: '9일', 베팅금액: 7290000, 당첨금액: 6300000 },
  { name: '10일', 베팅금액: 9490000, 당첨금액: 8300000 },
  { name: '11일', 베팅금액: 8190000, 당첨금액: 7300000 },
  { name: '12일', 베팅금액: 7890000, 당첨금액: 6100000 },
  { name: '13일', 베팅금액: 9490000, 당첨금액: 8100000 },
  { name: '14일', 베팅금액: 8490000, 당첨금액: 7300000 },
];

/**
 * 베팅/당첨금 그래프 컴포넌트
 * 
 * @param {Object} props
 * @param {number} props.height - 그래프 높이
 * @returns {JSX.Element} 베팅/당첨금 그래프 컴포넌트
 */
const BettingWinningActivityGraph = ({ height = 350 }) => {
  const theme = useTheme();
  
  // 숫자 포매팅 함수
  const formatValue = (value) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만`;
    }
    return value;
  };
  
  // 차트 도메인 설정
  const getYDomain = () => {
    const minValue = Math.min(...bettingWinningData.map(item => Math.min(item.베팅금액, item.당첨금액)));
    const maxValue = Math.max(...bettingWinningData.map(item => Math.max(item.베팅금액, item.당첨금액)));
    return [minValue * 0.9, maxValue * 1.1];
  };
  
  return (
    <Box sx={{ width: '100%', height: height, display: 'flex', flexDirection: 'column' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={bettingWinningData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <YAxis 
            tickFormatter={formatValue}
            tick={{ fontSize: 11 }}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
            domain={getYDomain()}
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()}원`, '']}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              borderRadius: 8,
              border: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              fontSize: 12
            }}
          />
          <Legend 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          <ReferenceLine y={0} stroke={theme.palette.divider} />
          <Line
            type="monotone"
            dataKey="베팅금액"
            stroke="#8950FC"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#8950FC', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="당첨금액"
            stroke="#1BC5BD"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#1BC5BD', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BettingWinningActivityGraph; 