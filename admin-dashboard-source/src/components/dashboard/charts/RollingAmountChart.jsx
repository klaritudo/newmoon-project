import React from 'react';
import { 
  LineChart, 
  Line, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  ReferenceDot
} from 'recharts';
import { Box, useTheme } from '@mui/material';

// 데모 데이터
const data = [
  { name: '1월', 롤링금: 8000000 },
  { name: '2월', 롤링금: 9500000 },
  { name: '3월', 롤링금: 10200000 },
  { name: '4월', 롤링금: 10500000 },
  { name: '5월', 롤링금: 11800000 },
  { name: '6월', 롤링금: 12100000 },
  { name: '7월', 롤링금: 12250000 },
  { name: '8월', 롤링금: 11900000 },
  { name: '9월', 롤링금: 12300000 },
  { name: '10월', 롤링금: 12500000 },
  { name: '11월', 롤링금: 12800000 },
  { name: '12월', 롤링금: 13200000 },
];

/**
 * 롤링금 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {number} props.height - 차트 높이
 * @returns {JSX.Element} 차트 컴포넌트
 */
const RollingAmountChart = ({ height = 350 }) => {
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
    const minValue = Math.min(...data.map(item => item.롤링금));
    const maxValue = Math.max(...data.map(item => item.롤링금));
    return [minValue * 0.8, maxValue * 1.2]; // 데이터 위아래로 여유 공간 추가
  };
  
  // 최고값 찾기
  const maxIndex = data.reduce((maxIdx, item, idx, arr) => 
    item.롤링금 > arr[maxIdx].롤링금 ? idx : maxIdx, 0);
  
  return (
    <Box sx={{ width: '100%', height: height || 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
            formatter={(value) => [`${value.toLocaleString()}원`, '롤링금']}
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
          <defs>
            <linearGradient id="colorRolling" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="롤링금"
            stroke="#4caf50"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRolling)"
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#4caf50', strokeWidth: 2, fill: '#fff' }}
          />
          <ReferenceDot
            x={data[maxIndex].name}
            y={data[maxIndex].롤링금}
            r={6}
            fill="#4caf50"
            stroke="#fff"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RollingAmountChart; 