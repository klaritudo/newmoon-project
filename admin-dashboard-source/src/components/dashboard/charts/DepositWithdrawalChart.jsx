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
  { name: '1월', 입금액: 15000000, 환전액: 12000000 },
  { name: '5월', 입금액: 18000000, 환전액: 15500000 },
  { name: '10월', 입금액: 20000000, 환전액: 17500000 },
  { name: '12월', 입금액: 19000000, 환전액: 16000000 },
  { name: '2월', 입금액: 22000000, 환전액: 18000000 },
  { name: '3월', 입금액: 21000000, 환전액: 17000000 },
  { name: '5월', 입금액: 24000000, 환전액: 20000000 },
];

// 추이 데이터
const trendData = [
  { name: '1월', 입금액: 12000000, 환전액: 10000000 },
  { name: '2월', 입금액: 13000000, 환전액: 11000000 },
  { name: '3월', 입금액: 14000000, 환전액: 12000000 },
  { name: '4월', 입금액: 15000000, 환전액: 13000000 },
  { name: '5월', 입금액: 18000000, 환전액: 15500000 },
  { name: '6월', 입금액: 19000000, 환전액: 16000000 },
  { name: '7월', 입금액: 19500000, 환전액: 16500000 },
  { name: '8월', 입금액: 19000000, 환전액: 16000000 },
  { name: '9월', 입금액: 20000000, 환전액: 17000000 },
  { name: '10월', 입금액: 20000000, 환전액: 17500000 },
  { name: '11월', 입금액: 21000000, 환전액: 18000000 },
  { name: '12월', 입금액: 22000000, 환전액: 19000000 },
];

/**
 * 입금액 및 환전액 비교 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {boolean} props.isTrend - 추이 차트 여부
 * @param {number} props.height - 차트 높이
 * @returns {JSX.Element} 차트 컴포넌트
 */
const DepositWithdrawalChart = ({ isTrend = false, height = 350 }) => {
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
    const minValue = Math.min(...data.map(item => Math.min(item.입금액, item.환전액)));
    const maxValue = Math.max(...data.map(item => Math.max(item.입금액, item.환전액)));
    return [minValue * 0.9, maxValue * 1.1];
  };
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: height || 350, 
      overflow: 'visible',
      position: 'relative',
      zIndex: 10
    }}>
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
            dataKey="입금액"
            stroke="#9c27b0"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#9c27b0', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="환전액"
            stroke="#ff9800"
            strokeWidth={2.5}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 3, stroke: '#ff9800', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DepositWithdrawalChart; 