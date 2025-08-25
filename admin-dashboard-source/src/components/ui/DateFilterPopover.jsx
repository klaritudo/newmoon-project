import React from 'react';
import PropTypes from 'prop-types';
import {
  Popover,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * 날짜 필터 팝오버 컴포넌트
 * 날짜 기간 설정을 위한 필터 UI를 제공합니다.
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.anchorEl - 팝오버 앵커 요소
 * @param {Function} props.onClose - 팝오버 닫기 핸들러
 * @param {Object} props.startDate - 시작 날짜
 * @param {Function} props.handleStartDateChange - 시작 날짜 변경 핸들러
 * @param {Object} props.endDate - 종료 날짜
 * @param {Function} props.handleEndDateChange - 종료 날짜 변경 핸들러
 * @param {Function} props.handleQuickDateSelect - 빠른 날짜 선택 핸들러
 * @param {Function} props.applyDateFilter - 날짜 필터 적용 핸들러
 * @param {Function} props.resetDateFilter - 날짜 필터 초기화 핸들러
 * @param {Array} props.quickSelectOptions - 빠른 선택 옵션 (선택적)
 * @param {Object} props.sx - 추가 스타일 (Material-UI sx prop)
 * @returns {JSX.Element}
 */
const DateFilterPopover = ({
  anchorEl,
  onClose,
  startDate,
  handleStartDateChange,
  endDate,
  handleEndDateChange,
  handleQuickDateSelect,
  applyDateFilter,
  resetDateFilter,
  quickSelectOptions = [
    { label: '오늘', value: 'today' },
    { label: '어제', value: 'yesterday' },
    { label: '이번 주', value: 'thisWeek' },
    { label: '지난 주', value: 'lastWeek' },
    { label: '이번 달', value: 'thisMonth' }
  ],
  sx = {}
}) => {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          p: 2,
          width: '380px',
          mt: 0.5,
          borderRadius: '8px',
          ...sx
        }
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>날짜 필터링</Typography>
          
          {/* 빠른 선택 옵션 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickSelectOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => handleQuickDateSelect(option.value)}
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f7ff', borderColor: '#90caf9' }
                }}
              />
            ))}
          </Box>
          
          {/* 날짜 선택기 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <DateTimePicker
              slotProps={{
                textField: { size: 'small', label: '시작일' }
              }}
              value={startDate}
              onChange={handleStartDateChange}
              format="YYYY-MM-DD HH:mm"
            />
            <Typography variant="body2" sx={{ color: '#757575' }}>~</Typography>
            <DateTimePicker
              slotProps={{
                textField: { size: 'small', label: '종료일' }
              }}
              value={endDate}
              onChange={handleEndDateChange}
              format="YYYY-MM-DD HH:mm"
            />
          </Stack>
          
          {/* 선택된 날짜 범위 표시 */}
          {startDate && endDate && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: '#f5f5f5', 
                p: 1.5, 
                borderRadius: '4px',
                gap: 1
              }}
            >
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {startDate.format('YYYY-MM-DD HH:mm')} ~ {endDate.format('YYYY-MM-DD HH:mm')}
              </Typography>
            </Box>
          )}
          
          {/* 버튼 영역 */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={resetDateFilter}
              sx={{ minWidth: '80px' }}
            >
              초기화
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={applyDateFilter}
              sx={{ minWidth: '80px' }}
            >
              적용
            </Button>
          </Stack>
        </Stack>
      </LocalizationProvider>
    </Popover>
  );
};

DateFilterPopover.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  startDate: PropTypes.object,
  handleStartDateChange: PropTypes.func.isRequired,
  endDate: PropTypes.object,
  handleEndDateChange: PropTypes.func.isRequired,
  handleQuickDateSelect: PropTypes.func.isRequired,
  applyDateFilter: PropTypes.func.isRequired,
  resetDateFilter: PropTypes.func.isRequired,
  quickSelectOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ),
  sx: PropTypes.object
};

export default DateFilterPopover; 