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

// 입/출금 데이터 (예시)
const depositWithdrawalData = [
  { name: '1일', 입금액: 4000000, 출금액: 2400000 },
  { name: '2일', 입금액: 3000000, 출금액: 1398000 },
  { name: '3일', 입금액: 2000000, 출금액: 9800000 },
  { name: '4일', 입금액: 2780000, 출금액: 3908000 },
  { name: '5일', 입금액: 1890000, 출금액: 4800000 },
  { name: '6일', 입금액: 2390000, 출금액: 3800000 },
  { name: '7일', 입금액: 3490000, 출금액: 4300000 },
  { name: '8일', 입금액: 2490000, 출금액: 3300000 },
  { name: '9일', 입금액: 2290000, 출금액: 2300000 },
  { name: '10일', 입금액: 3490000, 출금액: 4300000 },
  { name: '11일', 입금액: 3190000, 출금액: 2300000 },
  { name: '12일', 입금액: 2890000, 출금액: 2100000 },
  { name: '13일', 입금액: 3490000, 출금액: 3100000 },
  { name: '14일', 입금액: 2490000, 출금액: 2300000 },
];

/**
 * 입금/출금 그래프 컴포넌트
 * 
 * @param {Object} props
 * @param {number} props.height - 그래프 높이
 * @returns {JSX.Element} 입금/출금 그래프 컴포넌트
 */
const DepositWithdrawalGraph = ({ height = 350 }) => {
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
    const minValue = Math.min(...depositWithdrawalData.map(item => Math.min(item.입금액, item.출금액)));
    const maxValue = Math.max(...depositWithdrawalData.map(item => Math.max(item.입금액, item.출금액)));
    return [minValue * 0.9, maxValue * 1.1];
  };
  
  return (
    <Box sx={{ width: '100%', height: height, display: 'flex', flexDirection: 'column' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={depositWithdrawalData}
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
            dataKey="입금액"
            stroke="#3699FF"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#3699FF', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="출금액"
            stroke="#F64E60"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#F64E60', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DepositWithdrawalGraph; 