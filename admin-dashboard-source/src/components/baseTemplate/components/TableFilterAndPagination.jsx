import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Divider } from '@mui/material';
import TableFilter from './TableFilter';
import TablePagination from './TablePagination';
import DateFilterPopover from '../../ui/DateFilterPopover';
import dayjs from 'dayjs';

/**
 * 테이블 필터와 페이지네이션을 결합한 컴포넌트
 * 테이블의 상단 또는 하단에 위치하여 필터링과 페이지 이동 기능을 제공합니다.
 * 
 * @param {Object} props
 * @param {Object} props.filterProps - TableFilter 컴포넌트에 전달할 props
 * @param {Object} props.paginationProps - TablePagination 컴포넌트에 전달할 props
 * @param {Object} props.sx - 추가 스타일 (Material-UI sx prop)
 * @param {boolean} props.showDivider - 하단 구분선 표시 여부
 * @returns {JSX.Element}
 */
const TableFilterAndPagination = ({
  filterProps = {},
  paginationProps = {},
  showDivider = true,
  sx = {}
}) => {
  // 날짜 필터 상태 관리
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 날짜 필터 열기
  const handleOpenDateFilter = useCallback((event) => {
    setDateFilterAnchorEl(event.currentTarget);
  }, []);

  // 날짜 필터 닫기
  const handleCloseDateFilter = useCallback(() => {
    setDateFilterAnchorEl(null);
  }, []);

  // 시작 날짜 변경
  const handleStartDateChange = useCallback((newValue) => {
    setStartDate(newValue);
  }, []);

  // 종료 날짜 변경
  const handleEndDateChange = useCallback((newValue) => {
    setEndDate(newValue);
  }, []);

  // 빠른 날짜 선택
  const handleQuickDateSelect = useCallback((value) => {
    const now = dayjs();
    let newStartDate, newEndDate;

    switch (value) {
      case 'today':
        newStartDate = now.startOf('day');
        newEndDate = now.endOf('day');
        break;
      case 'yesterday':
        newStartDate = now.subtract(1, 'day').startOf('day');
        newEndDate = now.subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        newStartDate = now.startOf('week');
        newEndDate = now.endOf('week');
        break;
      case 'lastWeek':
        newStartDate = now.subtract(1, 'week').startOf('week');
        newEndDate = now.subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        newStartDate = now.startOf('month');
        newEndDate = now.endOf('month');
        break;
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  // 날짜 필터 적용
  const applyDateFilter = useCallback(() => {
    // 상위 컴포넌트에 날짜 필터 적용 알림
    if (filterProps.handleDateRangeChange) {
      filterProps.handleDateRangeChange({ startDate, endDate });
    }
    handleCloseDateFilter();
  }, [startDate, endDate, filterProps, handleCloseDateFilter]);

  // 날짜 필터 초기화
  const resetDateFilterLocal = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    if (filterProps.resetDateFilter) {
      filterProps.resetDateFilter();
    }
    handleCloseDateFilter();
  }, [filterProps, handleCloseDateFilter]);

  return (
    <>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          mb: 2,
          ...sx 
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: { xs: 2, md: 0 }
          }}
        >
          {/* 필터 부분 */}
          <TableFilter 
            {...filterProps} 
            handleOpenDateFilter={handleOpenDateFilter}
            isDateFilterActive={Boolean(startDate || endDate)}
          />
          
          {/* 페이지네이션 부분 */}
          <TablePagination {...paginationProps} />
        </Box>
      </Paper>
      
      {/* 구분선 */}
      {showDivider && (
        <Divider sx={{ mb: 2 }} />
      )}

      {/* 날짜 필터 팝오버 */}
      <DateFilterPopover
        anchorEl={dateFilterAnchorEl}
        onClose={handleCloseDateFilter}
        startDate={startDate}
        handleStartDateChange={handleStartDateChange}
        endDate={endDate}
        handleEndDateChange={handleEndDateChange}
        handleQuickDateSelect={handleQuickDateSelect}
        applyDateFilter={applyDateFilter}
        resetDateFilter={resetDateFilterLocal}
      />
    </>
  );
};

TableFilterAndPagination.propTypes = {
  filterProps: PropTypes.object,
  paginationProps: PropTypes.object,
  showDivider: PropTypes.bool,
  sx: PropTypes.object
};

export default TableFilterAndPagination; 