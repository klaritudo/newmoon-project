import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  Paper,
  Chip
} from '@mui/material';
import {
  RestartAlt as RestartAltIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// 향상된 날짜 필터 컴포넌트
import EnhancedDateRangeFilter from '../ui/EnhancedDateRangeFilter';
import { DATE_RANGE_PRESETS } from '../../utils/enhancedDateUtils';

/**
 * 개선된 대시보드 헤더 컴포넌트
 * 기존 ButtonGroup 기간 필터를 향상된 날짜 필터로 대체
 */
const ImprovedDashboardHeader = ({
  // 날짜 필터 관련
  dateRange,
  onDateRangeChange,
  
  // 기존 기능들
  onResetLayout,
  onRefresh,
  loading = false,
  
  // UI 설정
  showComparison = false,
  comparisonDateRange = null,
  onComparisonDateRangeChange = null,
  
  // 추가 설정
  maxDateRange = 365,
  enableQuickFilters = true,
  customPresets = []
}) => {
  
  // 빠른 필터 옵션 (기존 일별/주별/월별과 호환)
  const quickFilters = [
    { preset: DATE_RANGE_PRESETS.TODAY, label: '일별', description: '오늘' },
    { preset: DATE_RANGE_PRESETS.THIS_WEEK, label: '주별', description: '이번 주' },
    { preset: DATE_RANGE_PRESETS.THIS_MONTH, label: '월별', description: '이번 달' }
  ];
  
  // 현재 선택된 빠른 필터 확인
  const getCurrentQuickFilter = () => {
    if (!dateRange || !dateRange.preset) return null;
    return quickFilters.find(filter => filter.preset === dateRange.preset);
  };
  
  const currentQuickFilter = getCurrentQuickFilter();
  
  // 빠른 필터 선택 핸들러
  const handleQuickFilterSelect = (preset) => {
    if (onDateRangeChange) {
      // 프리셋을 사용하여 날짜 범위 설정
      onDateRangeChange({ preset });
    }
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        
        {/* 왼쪽: 제목과 정보 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 1
            }}
          >
            대시보드
          </Typography>
          
          <Tooltip 
            title="다양한 통계 데이터를 차트로 시각화하여 보여줍니다. 각 차트는 사이트의 주요 지표와 추세를 파악하는데 도움이 됩니다. 향상된 날짜 필터를 사용하여 원하는 기간을 유연하게 설정할 수 있습니다."
            arrow
            placement="right"
          >
            <IconButton size="small" sx={{ ml: 0.5, color: '#5E6278', padding: '2px' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* 오른쪽: 필터와 액션 버튼들 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          
          {/* 빠른 필터 버튼들 (기존 ButtonGroup 호환) */}
          {enableQuickFilters && (
            <ButtonGroup size="small" variant="outlined">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.preset}
                  onClick={() => handleQuickFilterSelect(filter.preset)}
                  variant={currentQuickFilter?.preset === filter.preset ? 'contained' : 'outlined'}
                  sx={{
                    minWidth: '60px',
                    position: 'relative'
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </ButtonGroup>
          )}
          
          {/* 향상된 날짜 필터 */}
          <EnhancedDateRangeFilter
            value={dateRange}
            onChange={onDateRangeChange}
            enableComparison={showComparison}
            comparisonValue={comparisonDateRange}
            onComparisonChange={onComparisonDateRangeChange}
            variant="outlined"
            size="small"
            buttonText="기간 설정"
            maxRange={maxDateRange}
            showDuration
            customPresets={customPresets}
            presetGroups={['recent', 'period']}
            PopoverProps={{
              PaperProps: {
                sx: { 
                  boxShadow: 3,
                  border: '1px solid',
                  borderColor: 'divider'
                }
              }
            }}
          />
          
          {/* 현재 선택된 기간 표시 (작은 화면에서 유용) */}
          {dateRange && (
            <Chip
              size="small"
              label={
                currentQuickFilter 
                  ? currentQuickFilter.description 
                  : `${dateRange.startDate?.format('MM/DD')} ~ ${dateRange.endDate?.format('MM/DD')}`
              }
              variant="filled"
              color="primary"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                fontWeight: 600
              }}
            />
          )}
          
          {/* 새로고침 버튼 */}
          <Tooltip title="데이터 새로고침">
            <IconButton
              onClick={onRefresh}
              size="small"
              disabled={loading}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {/* 레이아웃 초기화 버튼 */}
          <Tooltip title="레이아웃 초기화">
            <IconButton
              onClick={onResetLayout}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  color: 'text.primary'
                }
              }}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* 비교 모드가 활성화된 경우 추가 정보 표시 */}
      {showComparison && comparisonDateRange && (
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              비교 기간:
            </Typography>
            <Chip
              size="small"
              label={`${comparisonDateRange.startDate?.format('MM/DD')} ~ ${comparisonDateRange.endDate?.format('MM/DD')}`}
              variant="outlined"
              color="secondary"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              vs
            </Typography>
            <Chip
              size="small"
              label={
                currentQuickFilter 
                  ? currentQuickFilter.description 
                  : `${dateRange.startDate?.format('MM/DD')} ~ ${dateRange.endDate?.format('MM/DD')}`
              }
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

ImprovedDashboardHeader.propTypes = {
  // 날짜 필터 관련
  dateRange: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    preset: PropTypes.string
  }),
  onDateRangeChange: PropTypes.func.isRequired,
  
  // 기존 기능들
  onResetLayout: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  
  // UI 설정
  showComparison: PropTypes.bool,
  comparisonDateRange: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object
  }),
  onComparisonDateRangeChange: PropTypes.func,
  
  // 추가 설정
  maxDateRange: PropTypes.number,
  enableQuickFilters: PropTypes.bool,
  customPresets: PropTypes.array
};

export default ImprovedDashboardHeader;