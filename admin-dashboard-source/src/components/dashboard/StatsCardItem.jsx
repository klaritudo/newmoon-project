import React from 'react';
import { Box, Typography, CircularProgress, Tooltip, alpha, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import '../../styles/stats-card.css';

// MUI 아이콘들 가져오기
import {
  Money as MoneyIcon,
  Paid as PaidIcon,
  TrendingUp as TrendingUpIcon,
  CallReceived as CallReceivedIcon,
  CallMade as CallMadeIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Autorenew as AutorenewIcon,
  ShowChart as ShowChartIcon,
  Percent as PercentIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as LocalAtmIcon,
} from '@mui/icons-material';

/**
 * 아이콘 맵핑
 * 아이콘 이름을 실제 컴포넌트로 맵핑
 */
const iconMap = {
  MoneyIcon: MoneyIcon,
  PaidIcon: PaidIcon,
  TrendingUpIcon: TrendingUpIcon,
  CallReceivedIcon: CallReceivedIcon,
  CallMadeIcon: CallMadeIcon,
  AccountBalanceWalletIcon: AccountBalanceWalletIcon,
  AutorenewIcon: AutorenewIcon,
  ShowChartIcon: ShowChartIcon,
  PercentIcon: PercentIcon,
  AccountBalanceIcon: AccountBalanceIcon,
  PeopleIcon: PeopleIcon,
  PersonAddIcon: PersonAddIcon,
  ShoppingCartIcon: ShoppingCartIcon,
  InventoryIcon: InventoryIcon,
  CreditCardIcon: CreditCardIcon,
  LocalAtmIcon: LocalAtmIcon,
};

/**
 * 색상 맵핑
 * 색상 이름을 실제 색상 값으로 맵핑
 */
const colorMap = {
  blue: {
    light: '#E1F0FF',
    main: '#3699FF',
    dark: '#187DE4',
    contrastText: '#FFFFFF',
  },
  green: {
    light: '#E8FFF3',
    main: '#50CD89',
    dark: '#47BE7D',
    contrastText: '#FFFFFF',
  },
  red: {
    light: '#FFF5F8',
    main: '#F1416C',
    dark: '#D9214E',
    contrastText: '#FFFFFF',
  },
  amber: {
    light: '#FFF8DD',
    main: '#FFC700',
    dark: '#F1BC00',
    contrastText: '#FFFFFF',
  },
  purple: {
    light: '#F8F5FF',
    main: '#7239EA',
    dark: '#5014D0',
    contrastText: '#FFFFFF',
  },
  orange: {
    light: '#FFF5F3',
    main: '#FF6B35',
    dark: '#E94913',
    contrastText: '#FFFFFF',
  },
  teal: {
    light: '#E6FFFA',
    main: '#20D9AC',
    dark: '#0BB69F',
    contrastText: '#FFFFFF',
  },
  indigo: {
    light: '#EEF6FF',
    main: '#5014D0',
    dark: '#4610C0',
    contrastText: '#FFFFFF',
  },
};

/**
 * 카드 아이콘과 색상 매핑
 * @param {string} id - 카드 고유 ID
 * @param {string} title - 카드 제목
 * @param {number} value - 현재 값
 * @param {number} previousValue - 이전 값
 * @param {string} type - 카드 유형 (personal, sub1, master, agent, store, member)
 * @param {string} userType - 사용자 타입 (예: totalUsers, activeUsers, newUsers, etc.)
 * @param {string} info - 추가 정보
 * @param {boolean} loading - 로딩 상태
 * @param {string} className - 추가 클래스 이름
 * @param {object} draggableProps - 드래그 가능한 컴포넌트에 전달할 프롭스
 * @param {object} dragHandleProps - 드래그 핸들에 전달할 프롭스
 * @returns {JSX.Element} 통계 카드 컴포넌트
 */
const StatsCardItem = ({
  id,
  title,
  value,
  previousValue,
  icon: iconName,
  color,
  type,
  userType,
  info,
  loading = false,
  className = '',
  draggableProps = {},
  dragHandleProps = {}
}) => {
  // 증감률 계산
  const calculateTrend = () => {
    if (!previousValue || previousValue === 0 || !value) return { value: 0, isIncrease: true };
    
    const diff = value - previousValue;
    const percentage = (diff / Math.abs(previousValue)) * 100;
    
    return {
      value: Math.abs(percentage).toFixed(1),
      isIncrease: diff >= 0
    };
  };

  const trend = calculateTrend();
  
  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    
    // 천 단위 구분자(쉼표) 추가
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // 아이콘 컴포넌트 가져오기
  const getIconComponent = () => {
    const IconComponent = iconMap[iconName] || MoneyIcon;
    return <IconComponent />;
  };
  
  // 색상 객체 가져오기
  const getColorObject = () => {
    return colorMap[color] || colorMap.blue;
  };

  const colorObj = getColorObject();
  const theme = useTheme();
  // 700px 이상에서만 드래그 가능
  const isDraggableScreen = useMediaQuery('(min-width:700px)');
  // 작은 화면 감지
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      className={`stats-card-root ${className} stats-card-${color} stats-card-${type || userType || 'default'}`}
      sx={{ 
        position: 'relative'
      }}
      {...draggableProps}
    >
      {/* 카드 헤더 - 드래그 가능 영역 */}
      <Box 
        className="stats-card-header stats-card-drag-handle"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          mb: 0,
          padding: '16px',
          overflow: 'hidden',
          cursor: isDraggableScreen ? 'move' : 'default',
          '&:active': {
            cursor: isDraggableScreen ? 'grabbing' : 'default'
          }
        }}
        {...dragHandleProps}
      >
        {/* 상단: 아이콘과 타이틀 */}
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            mb: 1.5
          }}
        >
          {/* 아이콘 */}
          <Box 
            className="stats-card-icon"
            sx={{
              width: isXs ? '28px' : '32px',
              height: isXs ? '28px' : '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colorObj.light,
              color: colorObj.main,
              borderRadius: '8px'
            }}
          >
            {getIconComponent()}
          </Box>
          
          {/* 타이틀 */}
          <Box 
            sx={{ 
              ml: 1.5,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography 
              variant="body2" 
              className="stats-card-title"
              sx={{
                color: '#a1a5b7',
                fontSize: isXs ? '11px' : '12px',
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            
            {info && (
              <Tooltip title={info} arrow placement="top">
                <InfoOutlinedIcon 
                  sx={{ 
                    ml: 0.5, 
                    fontSize: isXs ? '10px' : '12px',
                    color: '#a1a5b7',
                  }} 
                />
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {/* 하단: 금액과 트렌드 */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%'
          }}
        >
          {/* 금액 */}
          <Typography 
            variant="h5" 
            className="stats-card-value"
            sx={{
              fontSize: isXs ? '16px' : '20px',
              fontWeight: 600,
              color: '#000000',
              lineHeight: 1.2,
              marginTop: 1,
              marginBottom: 0.5,
              paddingRight: 1,
              paddingLeft: 1
            }}
          >
            {loading ? <Skeleton width="80px" /> : formatNumber(value)}
          </Typography>
          
          {/* 트렌드 */}
          {!loading && previousValue !== undefined && (
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: trend.isIncrease ? 'rgba(80, 205, 137, 0.1)' : 'rgba(241, 65, 108, 0.1)',
                borderRadius: '4px',
                py: 0.3,
                px: 0.8,
                height: 'fit-content'
              }}
            >
              {trend.isIncrease ? (
                <ArrowUpwardIcon sx={{ fontSize: '14px', mr: 0.3 }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: '14px', mr: 0.3 }} />
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '11px',
                  color: trend.isIncrease ? '#50cd89' : '#f1416c'
                }}
              >
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* 로딩 상태 표시 */}
      {loading && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '40px',
            mt: 1
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default StatsCardItem; 