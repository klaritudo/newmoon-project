import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';

// 컴포넌트들 import
import EnhancedDateRangeFilter from '../components/ui/EnhancedDateRangeFilter';
import { DateFilterProvider, useDateFilterContext } from '../contexts/DateFilterContext';
import useDateFilter from '../hooks/useDateFilter';

// 유틸리티 import
import { 
  DATE_RANGE_PRESETS,
  formatDate,
  DATE_FORMATS
} from '../utils/enhancedDateUtils';

/**
 * 예시 1: 기본 사용법 (Standalone Hook)
 */
const BasicUsageExample = () => {
  const {
    dateRange,
    isValid,
    summary,
    apiFormat,
    applyPreset,
    setCustomRange,
    reset
  } = useDateFilter({
    initialPreset: DATE_RANGE_PRESETS.LAST_7_DAYS,
    persistKey: 'dashboardFilter',
    onDateChange: (range) => {
      console.log('날짜 범위 변경:', range);
      // API 호출 등의 로직
    }
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        기본 사용법 (Hook)
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <EnhancedDateRangeFilter
          value={dateRange}
          onChange={(newRange) => {
            if (newRange.preset) {
              applyPreset(newRange.preset);
            } else {
              setCustomRange(newRange.startDate, newRange.endDate);
            }
          }}
          buttonText="기간 선택"
          showDuration
        />
      </Box>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>상태:</strong> {isValid ? '유효' : '무효'}<br/>
          <strong>선택된 기간:</strong> {summary?.display || '없음'}<br/>
          <strong>기간 길이:</strong> {summary?.durationText || '없음'}<br/>
          <strong>API 형식:</strong> {apiFormat ? `${apiFormat.startDate} ~ ${apiFormat.endDate}` : '없음'}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * 예시 2: 비교 기능이 있는 사용법
 */
const ComparisonExample = () => {
  const [primaryRange, setPrimaryRange] = useState(null);
  const [comparisonRange, setComparisonRange] = useState(null);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        비교 기능 사용법
      </Typography>
      
      <EnhancedDateRangeFilter
        value={primaryRange}
        onChange={setPrimaryRange}
        enableComparison
        comparisonValue={comparisonRange}
        onComparisonChange={setComparisonRange}
        buttonText="기간 선택 (비교 가능)"
        showDuration
        onApply={(result) => {
          console.log('적용된 결과:', result);
          // API 호출로 데이터 가져오기
        }}
      />
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
            <Typography variant="subtitle2">기본 기간</Typography>
            <Typography variant="body2">
              {primaryRange ? 
                `${formatDate(primaryRange.startDate, DATE_FORMATS.DISPLAY_DATE)} ~ ${formatDate(primaryRange.endDate, DATE_FORMATS.DISPLAY_DATE)}` : 
                '선택되지 않음'
              }
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 1 }}>
            <Typography variant="subtitle2">비교 기간</Typography>
            <Typography variant="body2">
              {comparisonRange ? 
                `${formatDate(comparisonRange.startDate, DATE_FORMATS.DISPLAY_DATE)} ~ ${formatDate(comparisonRange.endDate, DATE_FORMATS.DISPLAY_DATE)}` : 
                '선택되지 않음'
              }
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

/**
 * 예시 3: Context를 사용한 전역 상태 관리
 */
const ContextChildComponent = () => {
  const {
    state,
    getSummary,
    getPrimaryApiFormat,
    applyPreset,
    setDateRange,
    isValid,
    isLoading
  } = useDateFilterContext();

  const summary = getSummary();
  const apiFormat = getPrimaryApiFormat();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Context 하위 컴포넌트
      </Typography>
      
      <EnhancedDateRangeFilter
        value={state.primary.isValid ? {
          startDate: state.primary.startDate,
          endDate: state.primary.endDate,
          preset: state.primary.preset
        } : null}
        onChange={(newRange) => {
          if (newRange.preset) {
            applyPreset(newRange.preset);
          } else {
            setDateRange(newRange.startDate, newRange.endDate);
          }
        }}
        enableComparison={state.comparison.enabled}
        buttonText="전역 날짜 필터"
        disabled={isLoading()}
      />
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.contrastText">
          <strong>전역 상태:</strong><br/>
          유효성: {isValid() ? '유효' : '무효'}<br/>
          로딩: {isLoading() ? '예' : '아니오'}<br/>
          기간: {summary?.display || '없음'}<br/>
          API: {apiFormat ? `${apiFormat.startDate} ~ ${apiFormat.endDate}` : '없음'}
        </Typography>
      </Box>
    </Box>
  );
};

const ContextExample = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <DateFilterProvider
        initialPreset={DATE_RANGE_PRESETS.THIS_MONTH}
        enableComparison
        onDateChange={async (data) => {
          console.log('전역 날짜 변경:', data);
          // 전역 API 호출
          await new Promise(resolve => setTimeout(resolve, 1000));
        }}
      >
        <ContextChildComponent />
      </DateFilterProvider>
    </Paper>
  );
};

/**
 * 예시 4: 커스텀 프리셋과 제한 설정
 */
const CustomPresetsExample = () => {
  const [dateRange, setDateRange] = useState(null);

  const customPresets = [
    { value: 'fiscal_quarter', label: '회계 분기', category: 'business' },
    { value: 'marketing_campaign', label: '마케팅 캠페인', category: 'business' },
    { value: 'last_business_week', label: '지난 영업주', category: 'business' }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        커스텀 프리셋과 제한 설정
      </Typography>
      
      <EnhancedDateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        customPresets={customPresets}
        presetGroups={['recent', 'business']}
        excludePresets={[DATE_RANGE_PRESETS.LAST_365_DAYS]}
        maxRange={180} // 최대 180일
        buttonText="비즈니스 기간"
        showPresetCategories
      />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          • 커스텀 프리셋 추가<br/>
          • 최대 180일 제한<br/>
          • 카테고리별 프리셋 그룹화<br/>
          • 특정 프리셋 제외
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * 예시 5: Dashboard 통합 예시
 */
const DashboardIntegrationExample = () => {
  const {
    dateRange,
    isValid,
    summary,
    apiFormat,
    applyPreset,
    setCustomRange,
    validateRange
  } = useDateFilter({
    initialPreset: DATE_RANGE_PRESETS.THIS_MONTH,
    maxRange: 90,
    onDateChange: async (range) => {
      console.log('대시보드 데이터 로드:', range);
      // 여기서 실제 대시보드 API 호출
    }
  });

  const handleQuickFilter = (preset) => {
    if (applyPreset(preset)) {
      console.log(`${preset} 프리셋 적용됨`);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dashboard 통합 예시
      </Typography>
      
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <EnhancedDateRangeFilter
            value={dateRange}
            onChange={(newRange) => {
              if (validateRange(newRange.startDate, newRange.endDate)) {
                if (newRange.preset) {
                  applyPreset(newRange.preset);
                } else {
                  setCustomRange(newRange.startDate, newRange.endDate);
                }
              }
            }}
            variant="outlined"
            size="small"
            buttonText="분석 기간"
            maxRange={90}
            presetGroups={['recent', 'period']}
          />
        </Grid>
        
        <Grid item>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isValid && summary ? `${summary.durationText} 선택됨` : '기간을 선택하세요'}
          </Typography>
        </Grid>
      </Grid>
      
      {/* 대시보드 통계 카드 영역 */}
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2">
          📊 대시보드 데이터 영역<br/>
          {isValid ? (
            <>
              API 엔드포인트: <code>/api/dashboard/stats</code><br/>
              파라미터: <code>{JSON.stringify(apiFormat)}</code><br/>
              기간: {summary?.display}
            </>
          ) : (
            '날짜를 선택하면 여기에 데이터가 표시됩니다.'
          )}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * 메인 예시 컴포넌트
 */
const DateFilterUsageExamples = () => {
  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        향상된 날짜 필터 사용 예시
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        다양한 방식으로 날짜 필터를 사용하는 실제 예시들입니다.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BasicUsageExample />
        </Grid>
        
        <Grid item xs={12}>
          <ComparisonExample />
        </Grid>
        
        <Grid item xs={12}>
          <ContextExample />
        </Grid>
        
        <Grid item xs={12}>
          <CustomPresetsExample />
        </Grid>
        
        <Grid item xs={12}>
          <DashboardIntegrationExample />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateFilterUsageExamples;