import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  Paper,
  Stack,
  Typography,
  Divider,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  DateRangeOutlined,
  CompareArrows,
  Refresh,
  Close,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

import { 
  getDateRangeByPreset, 
  getPresetOptions,
  validateDateRange,
  formatDate,
  calculateDateRangeDuration,
  formatDateRangeForAPI,
  DATE_FORMATS,
  DATE_RANGE_PRESETS
} from '../../utils/enhancedDateUtils';

/**
 * 향상된 날짜 범위 필터 컴포넌트
 * 다양한 프리셋, 커스텀 범위 선택, 비교 기능을 제공하는 범용 날짜 필터
 */
const EnhancedDateRangeFilter = ({
  // 기본 props
  value = null,
  onChange,
  onApply,
  
  // 비교 기능
  enableComparison = false,
  comparisonValue = null,
  onComparisonChange,
  
  // UI 설정
  variant = 'contained', // 'contained' | 'outlined' | 'text'
  size = 'medium', // 'small' | 'medium' | 'large'
  buttonText = '날짜 선택',
  showDuration = true,
  showPresetCategories = true,
  
  // 제한 설정
  maxRange = 365, // 최대 일수
  minDate = null,
  maxDate = null,
  
  // 프리셋 설정
  presetGroups = ['recent', 'period'],
  excludePresets = [],
  customPresets = [],
  
  // 스타일
  sx = {},
  PopoverProps = {},
  
  // 기타
  disabled = false,
  timezone = 'Asia/Seoul'
}) => {
  // 상태 관리
  const [anchorEl, setAnchorEl] = useState(null);
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);
  const [comparisonStartDate, setComparisonStartDate] = useState(null);
  const [comparisonEndDate, setComparisonEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: 기본, 1: 비교
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isComparison, setIsComparison] = useState(false);

  // 팝오버 열기/닫기
  const isOpen = Boolean(anchorEl);
  
  // 프리셋 옵션 필터링
  const filteredPresets = useMemo(() => {
    const allPresets = [...getPresetOptions(), ...customPresets];
    return allPresets.filter(preset => 
      presetGroups.includes(preset.category) && 
      !excludePresets.includes(preset.value)
    );
  }, [presetGroups, excludePresets, customPresets]);
  
  // 카테고리별 프리셋 그룹화
  const presetsByCategory = useMemo(() => {
    return filteredPresets.reduce((groups, preset) => {
      if (!groups[preset.category]) {
        groups[preset.category] = [];
      }
      groups[preset.category].push(preset);
      return groups;
    }, {});
  }, [filteredPresets]);
  
  // 현재 선택된 범위 정보
  const currentRangeInfo = useMemo(() => {
    if (!value?.startDate || !value?.endDate) return null;
    
    const duration = calculateDateRangeDuration(value.startDate, value.endDate);
    const startStr = formatDate(value.startDate, DATE_FORMATS.DISPLAY_DATE);
    const endStr = formatDate(value.endDate, DATE_FORMATS.DISPLAY_DATE);
    
    return {
      display: `${startStr} ~ ${endStr}`,
      duration: duration.days,
      durationText: `${duration.days}일간`
    };
  }, [value]);
  
  // value prop 변경 시 로컬 상태 동기화
  useEffect(() => {
    if (value?.startDate && value?.endDate) {
      setLocalStartDate(dayjs(value.startDate));
      setLocalEndDate(dayjs(value.endDate));
    } else {
      setLocalStartDate(null);
      setLocalEndDate(null);
    }
  }, [value]);
  
  // 비교 value 동기화
  useEffect(() => {
    if (comparisonValue?.startDate && comparisonValue?.endDate) {
      setComparisonStartDate(dayjs(comparisonValue.startDate));
      setComparisonEndDate(dayjs(comparisonValue.endDate));
    } else {
      setComparisonStartDate(null);
      setComparisonEndDate(null);
    }
  }, [comparisonValue]);
  
  // 팝오버 열기
  const handleOpen = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
      setValidationError(null);
    }
  };
  
  // 팝오버 닫기
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPreset(null);
    setIsComparison(false);
    setActiveTab(0);
  };
  
  // 프리셋 선택 처리
  const handlePresetSelect = (presetValue) => {
    const range = getDateRangeByPreset(presetValue, timezone);
    setSelectedPreset(presetValue);
    
    if (isComparison) {
      setComparisonStartDate(range.startDate);
      setComparisonEndDate(range.endDate);
    } else {
      setLocalStartDate(range.startDate);
      setLocalEndDate(range.endDate);
    }
  };
  
  // 날짜 변경 처리
  const handleDateChange = (type, date) => {
    setSelectedPreset(null); // 커스텀 선택 시 프리셋 해제
    
    if (isComparison) {
      if (type === 'start') {
        setComparisonStartDate(date);
      } else {
        setComparisonEndDate(date);
      }
    } else {
      if (type === 'start') {
        setLocalStartDate(date);
      } else {
        setLocalEndDate(date);
      }
    }
  };
  
  // 현재 설정 검증
  const validateCurrentSettings = () => {
    // 기본 범위 검증
    if (localStartDate && localEndDate) {
      const validation = validateDateRange(localStartDate, localEndDate);
      if (!validation.isValid) {
        setValidationError(validation.error);
        return false;
      }
    }
    
    // 비교 범위 검증
    if (enableComparison && comparisonStartDate && comparisonEndDate) {
      const comparisonValidation = validateDateRange(comparisonStartDate, comparisonEndDate);
      if (!comparisonValidation.isValid) {
        setValidationError(`비교 기간: ${comparisonValidation.error}`);
        return false;
      }
    }
    
    // 최대 범위 검증
    if (maxRange && localStartDate && localEndDate) {
      const duration = calculateDateRangeDuration(localStartDate, localEndDate);
      if (duration.days > maxRange) {
        setValidationError(`날짜 범위는 최대 ${maxRange}일까지만 설정할 수 있습니다.`);
        return false;
      }
    }
    
    setValidationError(null);
    return true;
  };
  
  // 적용 처리
  const handleApply = () => {
    if (!validateCurrentSettings()) return;
    
    // 기본 범위 적용
    if (localStartDate && localEndDate && onChange) {
      onChange({
        startDate: localStartDate,
        endDate: localEndDate,
        preset: selectedPreset
      });
    }
    
    // 비교 범위 적용
    if (enableComparison && comparisonStartDate && comparisonEndDate && onComparisonChange) {
      onComparisonChange({
        startDate: comparisonStartDate,
        endDate: comparisonEndDate
      });
    }
    
    // 콜백 호출
    if (onApply) {
      onApply({
        primary: localStartDate && localEndDate ? {
          startDate: localStartDate,
          endDate: localEndDate,
          preset: selectedPreset
        } : null,
        comparison: enableComparison && comparisonStartDate && comparisonEndDate ? {
          startDate: comparisonStartDate,
          endDate: comparisonEndDate
        } : null
      });
    }
    
    handleClose();
  };
  
  // 초기화
  const handleReset = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
    setComparisonStartDate(null);
    setComparisonEndDate(null);
    setSelectedPreset(null);
    setValidationError(null);
    
    if (onChange) onChange(null);
    if (onComparisonChange) onComparisonChange(null);
  };
  
  // 비교 모드 토글
  const handleComparisonToggle = () => {
    setIsComparison(!isComparison);
    setActiveTab(isComparison ? 0 : 1);
  };
  
  // 버튼 렌더링
  const renderTriggerButton = () => {
    const hasValue = currentRangeInfo !== null;
    
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleOpen}
        disabled={disabled}
        startIcon={<DateRangeOutlined />}
        endIcon={hasValue && showDuration ? (
          <Chip 
            label={currentRangeInfo.durationText} 
            size="small" 
            sx={{ height: '20px', fontSize: '0.7rem' }}
          />
        ) : null}
        sx={{
          minWidth: '140px',
          ...sx
        }}
      >
        {hasValue ? currentRangeInfo.display : buttonText}
      </Button>
    );
  };
  
  // 프리셋 그룹 렌더링
  const renderPresetGroup = (category, presets) => {
    const categoryLabels = {
      recent: '최근 기간',
      period: '기간별'
    };
    
    return (
      <Box key={category} sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {categoryLabels[category] || category}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {presets.map((preset) => (
            <Chip
              key={preset.value}
              label={preset.label}
              onClick={() => handlePresetSelect(preset.value)}
              variant={selectedPreset === preset.value ? 'filled' : 'outlined'}
              color={selectedPreset === preset.value ? 'primary' : 'default'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>
    );
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {renderTriggerButton()}
      
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        {...PopoverProps}
        PaperProps={{
          elevation: 8,
          sx: {
            p: 0,
            width: '420px',
            borderRadius: '12px',
            overflow: 'hidden',
            ...PopoverProps.PaperProps?.sx
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              날짜 범위 선택
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {enableComparison && (
                <Tooltip title={isComparison ? '기본 모드' : '비교 모드'}>
                  <IconButton size="small" onClick={handleComparisonToggle}>
                    <CompareArrows color={isComparison ? 'primary' : 'action'} />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={handleClose}>
                <Close />
              </IconButton>
            </Box>
          </Box>
          
          {/* 탭 (비교 모드 활성화 시) */}
          {enableComparison && (
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => {
                setActiveTab(newValue);
                setIsComparison(newValue === 1);
              }}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label="기본 기간" 
                icon={<CalendarToday />} 
                iconPosition="start" 
                sx={{ minHeight: '48px' }}
              />
              <Tab 
                label="비교 기간" 
                icon={<TrendingUp />} 
                iconPosition="start" 
                sx={{ minHeight: '48px' }}
                disabled={!localStartDate || !localEndDate}
              />
            </Tabs>
          )}
          
          {/* 프리셋 선택 */}
          {showPresetCategories ? (
            Object.entries(presetsByCategory).map(([category, presets]) => 
              renderPresetGroup(category, presets)
            )
          ) : (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filteredPresets.map((preset) => (
                  <Chip
                    key={preset.value}
                    label={preset.label}
                    onClick={() => handlePresetSelect(preset.value)}
                    variant={selectedPreset === preset.value ? 'filled' : 'outlined'}
                    color={selectedPreset === preset.value ? 'primary' : 'default'}
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* 커스텀 날짜 선택 */}
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              커스텀 날짜 범위 {isComparison && '(비교)'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DateTimePicker
                  label="시작일"
                  value={isComparison ? comparisonStartDate : localStartDate}
                  onChange={(date) => handleDateChange('start', date)}
                  minDate={minDate ? dayjs(minDate) : null}
                  maxDate={maxDate ? dayjs(maxDate) : null}
                  slotProps={{
                    textField: { 
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="종료일"
                  value={isComparison ? comparisonEndDate : localEndDate}
                  onChange={(date) => handleDateChange('end', date)}
                  minDate={isComparison ? comparisonStartDate : localStartDate}
                  maxDate={maxDate ? dayjs(maxDate) : null}
                  slotProps={{
                    textField: { 
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Grid>
            </Grid>
          </Stack>
          
          {/* 기간 정보 표시 */}
          {((isComparison ? comparisonStartDate && comparisonEndDate : localStartDate && localEndDate)) && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                선택된 기간: {calculateDateRangeDuration(
                  isComparison ? comparisonStartDate : localStartDate,
                  isComparison ? comparisonEndDate : localEndDate
                ).days}일간
              </Typography>
            </Box>
          )}
          
          {/* 에러 메시지 */}
          {validationError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {validationError}
            </Alert>
          )}
          
          {/* 액션 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleReset}
              startIcon={<Refresh />}
            >
              초기화
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!!validationError}
            >
              적용
            </Button>
          </Box>
        </Box>
      </Popover>
    </LocalizationProvider>
  );
};

EnhancedDateRangeFilter.propTypes = {
  // 기본 props
  value: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    preset: PropTypes.string
  }),
  onChange: PropTypes.func,
  onApply: PropTypes.func,
  
  // 비교 기능
  enableComparison: PropTypes.bool,
  comparisonValue: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object
  }),
  onComparisonChange: PropTypes.func,
  
  // UI 설정
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  buttonText: PropTypes.string,
  showDuration: PropTypes.bool,
  showPresetCategories: PropTypes.bool,
  
  // 제한 설정
  maxRange: PropTypes.number,
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  
  // 프리셋 설정
  presetGroups: PropTypes.arrayOf(PropTypes.string),
  excludePresets: PropTypes.arrayOf(PropTypes.string),
  customPresets: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired
  })),
  
  // 스타일
  sx: PropTypes.object,
  PopoverProps: PropTypes.object,
  
  // 기타
  disabled: PropTypes.bool,
  timezone: PropTypes.string
};

export default EnhancedDateRangeFilter;