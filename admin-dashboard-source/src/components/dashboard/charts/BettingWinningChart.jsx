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

// 데모 데이터
const monthlyData = [
  { name: '1월', 베팅금: 55000000, 당첨금: 50000000 },
  { name: '5월', 베팅금: 75000000, 당첨금: 67000000 },
  { name: '10월', 베팅금: 82000000, 당첨금: 73000000 },
  { name: '12월', 베팅금: 78000000, 당첨금: 71000000 },
  { name: '2월', 베팅금: 93000000, 당첨금: 84000000 },
  { name: '3월', 베팅금: 88000000, 당첨금: 79000000 },
  { name: '5월', 베팅금: 100000000, 당첨금: 91000000 },
];

// 추이 데이터
const trendData = [
  { name: '1월', 베팅금: 55000000, 당첨금: 50000000 },
  { name: '2월', 베팅금: 58000000, 당첨금: 53000000 },
  { name: '3월', 베팅금: 62000000, 당첨금: 56000000 },
  { name: '4월', 베팅금: 65000000, 당첨금: 59000000 },
  { name: '5월', 베팅금: 75000000, 당첨금: 67000000 },
  { name: '6월', 베팅금: 77000000, 당첨금: 70000000 },
  { name: '7월', 베팅금: 80000000, 당첨금: 72000000 },
  { name: '8월', 베팅금: 79000000, 당첨금: 71000000 },
  { name: '9월', 베팅금: 81000000, 당첨금: 73000000 },
  { name: '10월', 베팅금: 82000000, 당첨금: 73000000 },
  { name: '11월', 베팅금: 85000000, 당첨금: 77000000 },
  { name: '12월', 베팅금: 90000000, 당첨금: 81000000 },
];

/**
 * 베팅금 및 당첨금 비교 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {boolean} props.isTrend - 추이 차트 여부
 * @param {number} props.height - 차트 높이
 * @returns {JSX.Element} 차트 컴포넌트
 */
const BettingWinningChart = ({ isTrend = false, height = 350 }) => {
  const theme = useTheme();
  
  // 추이 차트인지 비교 차트인지에 따라 데이터 선택
  const data = isTrend ? trendData : trendData.slice(0, 7);
  
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
    const minValue = Math.min(...data.map(item => Math.min(item.베팅금, item.당첨금)));
    const maxValue = Math.max(...data.map(item => Math.max(item.베팅금, item.당첨금)));
    return [minValue * 0.9, maxValue * 1.1];
  };
  
  return (
    <Box sx={{ width: '100%', height: height || 350, overflow: 'visible' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 5,
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
            dataKey="베팅금"
            stroke="#2196f3"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#2196f3', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="당첨금"
            stroke="#4caf50"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#4caf50', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BettingWinningChart; 