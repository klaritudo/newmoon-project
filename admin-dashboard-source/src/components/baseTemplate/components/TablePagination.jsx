import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  styled,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { usePermission } from '../../../hooks/usePermission';

// 스타일 컴포넌트
const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '36px',
  borderRadius: '18px',
  padding: '0 4px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  margin: '0 2px',
  color: theme.palette.primary.main,
  '&.Mui-disabled': {
    color: theme.palette.action.disabled,
  },
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
  },
  width: '32px',
  height: '32px',
}));

// active prop이 실제 DOM에 전달되지 않도록 shouldForwardProp 설정
const PageNumberButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  minWidth: '32px',
  width: '32px',
  height: '32px',
  margin: '0 2px',
  padding: 0,
  borderRadius: '16px',
  fontSize: '0.875rem',
  fontWeight: active ? 'bold' : 'normal',
  color: active ? theme.palette.common.white : theme.palette.primary.main,
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: active ? 'default' : 'pointer',
  '&:hover': {
    backgroundColor: active 
      ? theme.palette.primary.dark 
      : 'rgba(25, 118, 210, 0.04)',
  },
}));

const MoreButton = styled(Typography)(({ theme }) => ({
  padding: '0 4px',
  margin: '0 2px',
  minWidth: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  margin: '0 4px',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
  },
  width: '32px',
  height: '32px',
}));

const RowsPerPageSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 80,
  marginRight: 8,
  '& .MuiSelect-select': {
    padding: '4px 8px',
    fontSize: '0.875rem',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  '&:hover .MuiOutlinedInput-root': {
    '& .MuiSelect-select': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

const RowsLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginRight: 8,
  color: theme.palette.text.secondary
}));

/**
 * 테이블 페이지네이션 컴포넌트
 * 페이지 번호, 이동 버튼, 엑셀 다운로드, 인쇄 기능을 제공하는 재사용 가능한 컴포넌트입니다.
 * 
 * @param {Object} props
 * @param {number} props.count - 총 항목 수
 * @param {number} props.page - 현재 페이지 (0부터 시작)
 * @param {number} props.rowsPerPage - 페이지당 항목 수
 * @param {Function} props.onPageChange - 페이지 변경 핸들러
 * @param {Function} props.onRowsPerPageChange - 페이지당 항목 수 변경 핸들러
 * @param {Array} props.rowsPerPageOptions - 페이지당 항목 수 옵션
 * @param {string} props.labelRowsPerPage - 페이지당 항목 라벨
 * @param {Function} props.onExcelDownload - 엑셀 다운로드 핸들러
 * @param {Function} props.onPrint - 인쇄 핸들러
 * @param {boolean} props.showActionButtons - 액션 버튼(엑셀,인쇄) 표시 여부
 * @param {boolean} props.showRowsPerPage - 페이지당 행 수 선택 표시 여부
 * @param {Object} props.sx - 추가 스타일
 * @returns {JSX.Element}
 */
const TablePagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  labelRowsPerPage = '페이지당 행:',
  onExcelDownload,
  onPrint,
  showActionButtons = true,
  showRowsPerPage = true,
  sx = {}
}) => {
  const [, forceUpdate] = useState({});
  const { canUseButton } = usePermission();
  
  // 권한 변경 시 강제 리렌더링
  useEffect(() => {
    const handlePermissionsUpdate = () => {
      forceUpdate({});
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionsUpdate);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate);
    };
  }, []);
  
  // 페이지 그룹과 활성 페이지 관리
  const [activePage, setActivePage] = useState(page);
  const [pageGroup, setPageGroup] = useState(Math.floor(page / 5));
  
  // 페이지 변경 시 상태 업데이트
  useEffect(() => {
    setActivePage(page);
    setPageGroup(Math.floor(page / 5));
  }, [page]);
  
  // 총 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  
  // 페이지 그룹의 시작 및 끝 페이지 계산
  const startPage = pageGroup * 5;
  const endPage = Math.min(startPage + 4, totalPages - 1);
  
  // 페이지 클릭 핸들러
  const handlePageClick = (newPage) => {
    if (newPage === activePage) return;
    
    if (onPageChange) {
      onPageChange(newPage);
    }
    setActivePage(newPage);
    // console.log(`페이지 번호 ${newPage+1}로 이동 (인덱스: ${newPage})`);
  };
  
  // 처음/마지막 페이지로 이동
  const handleFirstPage = () => {
    if (activePage === 0) return;
    
    if (onPageChange) {
      onPageChange(0);
    }
    setActivePage(0);
    // console.log(`첫 페이지로 이동 (인덱스: 0)`);
  };
  
  const handleLastPage = () => {
    const lastPage = totalPages - 1;
    if (activePage === lastPage) return;
    
    if (onPageChange) {
      onPageChange(lastPage);
    }
    setActivePage(lastPage);
    // console.log(`마지막 페이지로 이동 (인덱스: ${lastPage})`);
  };
  
  // 이전/다음 페이지로 이동
  const handlePrevPage = () => {
    if (activePage === 0) return;
    
    const prevPage = activePage - 1;
    if (onPageChange) {
      onPageChange(prevPage);
    }
    setActivePage(prevPage);
    // console.log(`이전 페이지로 이동 (인덱스: ${prevPage})`);
  };
  
  const handleNextPage = () => {
    const lastPage = totalPages - 1;
    if (activePage === lastPage) return;
    
    const nextPage = activePage + 1;
    if (onPageChange) {
      onPageChange(nextPage);
    }
    setActivePage(nextPage);
    // console.log(`다음 페이지로 이동 (인덱스: ${nextPage})`);
  };

  // 행 수 변경 핸들러
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    
    if (onRowsPerPageChange) {
      // 페이지당 행 수 변경 시 첫 페이지로 돌아가는 것이 일반적
      onRowsPerPageChange({
        target: { value: newRowsPerPage }
      });
      
      // 페이지당 행 수 변경 시 현재 페이지 업데이트
      setActivePage(0);
      if (onPageChange) {
        onPageChange(0);
      }
    }
    
    // 콘솔에 현재 값 출력
    // console.log(`페이지당 행 수가 ${newRowsPerPage}로 변경되었습니다. 첫 페이지로 이동`);
  };
  
  // 페이지 번호 렌더링
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // 처음 페이지 표시
    if (startPage > 0) {
      pageNumbers.push(
        <PageNumberButton 
          key="page-0" 
          active={activePage === 0}
          onClick={() => handlePageClick(0)}
        >
          1
        </PageNumberButton>
      );
      
      // 생략 표시
      if (startPage > 1) {
        pageNumbers.push(
          <MoreButton key="more-start">...</MoreButton>
        );
      }
    }
    
    // 현재 그룹의 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      // 현재 UI에 표시되는 페이지 번호는 1부터 시작하므로 i+1
      const displayPageNumber = i + 1;
      
      pageNumbers.push(
        <PageNumberButton
          key={`page-${i}`}
          active={activePage === i}
          onClick={() => handlePageClick(i)}
        >
          {displayPageNumber}
        </PageNumberButton>
      );
    }
    
    // 마지막 페이지 표시
    if (endPage < totalPages - 1) {
      // 생략 표시
      if (endPage < totalPages - 2) {
        pageNumbers.push(
          <MoreButton key="more-end">...</MoreButton>
        );
      }
      
      pageNumbers.push(
        <PageNumberButton
          key={`page-${totalPages - 1}`}
          active={activePage === totalPages - 1}
          onClick={() => handlePageClick(totalPages - 1)}
        >
          {totalPages}
        </PageNumberButton>
      );
    }
    
    return pageNumbers;
  };
  
  return (
    <Box 
      className="table-pagination-container"
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        ...sx
      }}
    >
      {/* 페이지당 행 수 선택 영역 */}
      {showRowsPerPage && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RowsLabel>{labelRowsPerPage}</RowsLabel>
          <RowsPerPageSelect size="small">
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              variant="outlined"
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 0.5,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
                  }
                }
              }}
              sx={{
                '& .MuiSelect-select': {
                  px: 2,
                  py: 0.5,
                  minHeight: '32px'
                }
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem 
                  key={option} 
                  value={option}
                  sx={{
                    fontSize: '0.875rem',
                    py: 0.75,
                    minHeight: 'auto'
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
          </RowsPerPageSelect>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1, minWidth: '120px' }}>
            {count > 0 
              ? `${page * rowsPerPage + 1}-${Math.min(count, (page + 1) * rowsPerPage)} / ${count}` 
              : '0-0 / 0'}
          </Typography>
        </Box>
      )}

      {/* 페이지 내비게이션 영역 */}
      <PaginationContainer>
        {/* 처음 페이지로 이동 */}
        <NavButton
          onClick={handleFirstPage}
          disabled={activePage === 0}
          size="small"
        >
          <FirstPage fontSize="small" />
        </NavButton>
        
        {/* 이전 페이지로 이동 */}
        <NavButton
          onClick={handlePrevPage}
          disabled={activePage === 0}
          size="small"
        >
          <NavigateBeforeIcon fontSize="small" />
        </NavButton>
        
        {/* 페이지 번호들 */}
        {renderPageNumbers()}
        
        {/* 다음 페이지로 이동 */}
        <NavButton
          onClick={handleNextPage}
          disabled={activePage === totalPages - 1}
          size="small"
        >
          <NavigateNextIcon fontSize="small" />
        </NavButton>
        
        {/* 마지막 페이지로 이동 */}
        <NavButton
          onClick={handleLastPage}
          disabled={activePage === totalPages - 1}
          size="small"
        >
          <LastPage fontSize="small" />
        </NavButton>
      </PaginationContainer>
      
      {/* 액션 버튼 영역 */}
      {showActionButtons && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onExcelDownload && canUseButton('export-excel') && (
            <Tooltip title="엑셀 다운로드">
              <ActionButton onClick={onExcelDownload} size="small">
                <FileDownloadIcon fontSize="small" />
              </ActionButton>
            </Tooltip>
          )}
          
          {onPrint && canUseButton('print-button') && (
            <Tooltip title="인쇄하기">
              <ActionButton onClick={onPrint} size="small">
                <PrintIcon fontSize="small" />
              </ActionButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

TablePagination.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.array,
  labelRowsPerPage: PropTypes.string,
  onExcelDownload: PropTypes.func,
  onPrint: PropTypes.func,
  showActionButtons: PropTypes.bool,
  showRowsPerPage: PropTypes.bool,
  sx: PropTypes.object
};

export default TablePagination; 