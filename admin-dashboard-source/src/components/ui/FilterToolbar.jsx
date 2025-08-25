import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * 필터링 도구 모음 컴포넌트
 * 다양한 필터링 옵션을 제공하는 재사용 가능한 컴포넌트입니다.
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.activeFilters - 현재 활성화된 필터 값들
 * @param {Function} props.handleFilterChange - 필터 변경 처리 함수
 * @param {boolean} props.isDateFilterActive - 날짜 필터 활성화 여부
 * @param {Function} props.handleOpenDateFilter - 날짜 필터 열기 핸들러
 * @param {Function} props.resetDateFilter - 날짜 필터 초기화 핸들러
 * @param {Array} props.filterOptions - 필터 옵션 배열 (선택적)
 * @param {boolean} props.showDateFilter - 날짜 필터 표시 여부 (기본값: true)
 * @param {boolean} props.showFilterButtons - 필터 버튼 표시 여부 (기본값: true)
 * @param {string} props.dateFilterLabel - 날짜 필터 라벨 (기본값: '날짜 필터')
 * @param {Object} props.sx - 추가 스타일 (Material-UI sx prop)
 * @returns {JSX.Element}
 */
const FilterToolbar = ({
  activeFilters = {},
  handleFilterChange,
  isDateFilterActive = false,
  handleOpenDateFilter,
  resetDateFilter,
  filterOptions = [],
  showDateFilter = true,
  showFilterButtons = true,
  dateFilterLabel = '날짜 필터',
  sx = {}
}) => {
  // filterOptions이 제공되지 않거나 빈 배열인 경우 기본 렌더링 사용
  const useDefaultFilters = !filterOptions || filterOptions.length === 0;

  // 기본 스타일
  const baseFilterStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px solid #e0e0e0'
  };

  // 텍스트필드 스타일
  const textFieldStyle = {
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiInputBase-root': { height: '32px' },
    '& .MuiSelect-select': {
      minWidth: 'auto',
      paddingLeft: '4px',
      paddingRight: '24px' // 드롭다운 아이콘 공간
    }
  };

  // 필터 버튼이 비활성화되어 있으면 빈 컴포넌트 반환
  if (!showFilterButtons && !showDateFilter) {
    return null;
  }

  return (
    <Stack 
      direction="row" 
      spacing={1} 
      className="filters-container"
      flexWrap="wrap"
      alignItems="center"
      sx={{
        mb: 2,
        gap: '8px',
        ...sx
      }}
    >
      {showFilterButtons && useDefaultFilters && (
        <>
          {/* 유형별 필터 */}
          <Box sx={baseFilterStyle}>
            <TextField
              select
              size="small"
              value={activeFilters.memberType || 'all'}
              onChange={(e) => handleFilterChange('memberType', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ fontSize: '0.75rem', color: '#757575' }}>
                    유형별
                  </InputAdornment>
                ),
                sx: { fontSize: '0.75rem' }
              }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      zIndex: 1400,
                    }
                  },
                  disablePortal: true,  // Portal 비활성화 - body transform과의 충돌 방지
                }
              }}
              sx={textFieldStyle}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="agent">에이전트</MenuItem>
              <MenuItem value="member">회원</MenuItem>
              <MenuItem value="본사">본사</MenuItem>
              <MenuItem value="부본사">부본사</MenuItem>
              <MenuItem value="총판">총판</MenuItem>
              <MenuItem value="매장">매장</MenuItem>
              <MenuItem value="회원1">회원1</MenuItem>
              <MenuItem value="회원2">회원2</MenuItem>
              <MenuItem value="회원3">회원3</MenuItem>
              <MenuItem value="회원4">회원4</MenuItem>
              <MenuItem value="회원5">회원5</MenuItem>
            </TextField>
          </Box>

          {/* 상태별 필터 */}
          <Box sx={baseFilterStyle}>
            <TextField
              select
              size="small"
              value={activeFilters.memberStatus || 'all'}
              onChange={(e) => handleFilterChange('memberStatus', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ fontSize: '0.75rem', color: '#757575' }}>
                    상태별
                  </InputAdornment>
                ),
                sx: { fontSize: '0.75rem' }
              }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      zIndex: 1400,
                    }
                  },
                  disablePortal: true,  // Portal 비활성화 - body transform과의 충돌 방지
                }
              }}
              sx={textFieldStyle}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="active">활성</MenuItem>
              <MenuItem value="suspended">중지</MenuItem>
              <MenuItem value="deleted">삭제</MenuItem>
            </TextField>
          </Box>

          {/* 접속별 필터 */}
          <Box sx={baseFilterStyle}>
            <TextField
              select
              size="small"
              value={activeFilters.connectionStatus || 'all'}
              onChange={(e) => handleFilterChange('connectionStatus', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ fontSize: '0.75rem', color: '#757575' }}>
                    접속별
                  </InputAdornment>
                ),
                sx: { fontSize: '0.75rem' }
              }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      zIndex: 1400,
                    }
                  },
                  disablePortal: true,  // Portal 비활성화 - body transform과의 충돌 방지
                }
              }}
              sx={textFieldStyle}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="online">접속</MenuItem>
              <MenuItem value="offline">미접속</MenuItem>
            </TextField>
          </Box>
        </>
      )}

      {showFilterButtons && !useDefaultFilters && (
        // filterOptions을 사용하여 동적으로 필터 생성
        filterOptions.map((option) => (
          <Box 
            key={option.id}
            sx={baseFilterStyle}
          >
            <TextField
              select
              size="small"
              value={activeFilters[option.id] || 'all'}
              onChange={(e) => handleFilterChange(option.id, e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ fontSize: '0.75rem', color: '#757575' }}>
                    {option.label}
                  </InputAdornment>
                ),
                sx: { fontSize: '0.75rem' }
              }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      zIndex: 1400,
                    }
                  },
                  disablePortal: true,  // Portal 비활성화 - body transform과의 충돌 방지
                }
              }}
              sx={textFieldStyle}
            >
              {option.items.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        ))
      )}

      {/* 날짜 필터 버튼 */}
      {showDateFilter && handleOpenDateFilter && resetDateFilter && (
        <Box sx={{
          backgroundColor: isDateFilterActive ? '#e3f2fd' : '#fff',
          borderRadius: '4px',
          border: `1px solid ${isDateFilterActive ? '#90caf9' : '#e0e0e0'}`
        }}>
          <Button
            startIcon={<CalendarTodayIcon fontSize="small" />}
            onClick={handleOpenDateFilter}
            size="small"
            sx={{
              height: '32px',
              fontSize: '0.75rem',
              color: isDateFilterActive ? '#1976d2' : '#757575',
              '& .MuiButton-startIcon': { marginRight: '4px' }
            }}
          >
            {dateFilterLabel}
            {isDateFilterActive && (
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  resetDateFilter();
                }}
                sx={{ 
                  ml: 0.5, 
                  p: 0.2, 
                  color: '#1976d2',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Button>
        </Box>
      )}
    </Stack>
  );
};

FilterToolbar.propTypes = {
  activeFilters: PropTypes.object,
  handleFilterChange: PropTypes.func.isRequired,
  isDateFilterActive: PropTypes.bool,
  handleOpenDateFilter: PropTypes.func,
  resetDateFilter: PropTypes.func,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ),
  showDateFilter: PropTypes.bool,
  showFilterButtons: PropTypes.bool,
  dateFilterLabel: PropTypes.string,
  sx: PropTypes.object
};

export default FilterToolbar; 