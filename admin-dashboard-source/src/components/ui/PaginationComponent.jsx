import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  TablePagination,
  IconButton,
  Typography,
  Tooltip,
  styled
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

// 스타일 컴포넌트
const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  overflow: 'visible',
  '.MuiTablePagination-toolbar': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 1.5),
    minHeight: '48px',
    height: '48px',
  },
  '.MuiTablePagination-selectRoot': {
    marginRight: theme.spacing(1),
  },
  '.MuiTablePagination-select': {
    padding: theme.spacing(0.5, 2.5, 0.5, 1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '&:focus': {
      borderRadius: theme.shape.borderRadius,
    },
  },
  '.MuiTablePagination-selectIcon': {
    right: 4,
  }
}));

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

const PageNumberButton = styled(Button)(({ theme, active }) => ({
  minWidth: '32px',
  width: '32px',
  height: '32px',
  margin: '0 2px',
  padding: 0,
  borderRadius: '16px',
  fontSize: '0.875rem',
  color: active === 'true' ? theme.palette.common.white : theme.palette.primary.main,
  backgroundColor: active === 'true' ? theme.palette.primary.main : 'transparent',
  '&:hover': {
    backgroundColor: active === 'true' 
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

// 커스텀 테이블 페이지네이션 액션 컴포넌트
function TablePaginationActions(props) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        size="small"
        sx={{ padding: '4px' }}
      >
        <FirstPage fontSize="small" />
      </IconButton>
      <IconButton 
        onClick={handleBackButtonClick} 
        disabled={page === 0}
        size="small"
        sx={{ padding: '4px' }}
      >
        <NavigateBeforeIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        size="small"
        sx={{ padding: '4px' }}
      >
        <NavigateNextIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        size="small"
        sx={{ padding: '4px' }}
      >
        <LastPage fontSize="small" />
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

/**
 * 페이지네이션 컴포넌트
 * 테이블 페이지네이션, 페이지 번호, 다운로드 및 인쇄 기능을 제공하는 재사용 가능한 컴포넌트입니다.
 * 
 * @param {Object} props
 * @param {number} props.count - 총 항목 수
 * @param {number} props.rowsPerPage - 페이지당 항목 수
 * @param {number} props.page - 현재 페이지 (0부터 시작)
 * @param {Function} props.onPageChange - 페이지 변경 핸들러
 * @param {Function} props.onRowsPerPageChange - 페이지당 항목 수 변경 핸들러
 * @param {Object} props.gridRef - AG Grid 참조 객체
 * @param {boolean} props.showActionButtons - 액션 버튼 표시 여부 (엑셀 다운로드, 인쇄)
 * @param {string} props.searchText - 검색어 (있는 경우 검색 결과 표시)
 * @param {Array} props.rowsPerPageOptions - 페이지당 행 수 선택 옵션
 * @param {Object} props.sx - 추가 스타일 (Material-UI sx prop)
 * @returns {JSX.Element}
 */
const PaginationComponent = ({
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
  gridRef,
  showActionButtons = true,
  searchText = '',
  rowsPerPageOptions = [10, 25, 50, 100],
  sx = {}
}) => {
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
    
    // 직접 onPageChange 호출하여 상위 컴포넌트의 핸들러 실행
    if (onPageChange) {
      onPageChange({}, newPage);
    }
    setActivePage(newPage);
  };
  
  // 처음/마지막 페이지로 이동
  const handleFirstPage = () => {
    if (activePage === 0) return;
    
    if (onPageChange) {
      onPageChange({}, 0);
    }
    setActivePage(0);
  };
  
  const handleLastPage = () => {
    if (activePage === totalPages - 1) return;
    
    if (onPageChange) {
      onPageChange({}, totalPages - 1);
    }
    setActivePage(totalPages - 1);
  };
  
  // 이전/다음 페이지로 이동
  const handlePrevPage = () => {
    if (activePage === 0) return;
    
    const prevPage = activePage - 1;
    if (onPageChange) {
      onPageChange({}, prevPage);
    }
    setActivePage(prevPage);
  };
  
  const handleNextPage = () => {
    if (activePage >= totalPages - 1) return;
    
    const nextPage = activePage + 1;
    if (onPageChange) {
      onPageChange({}, nextPage);
    }
    setActivePage(nextPage);
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    if (window.gridApi || (gridRef && gridRef.current && gridRef.current.api)) {
      const api = window.gridApi || gridRef.current.api;
      try {
        // Community 버전에서 지원하는 CSV 내보내기 사용
        api.exportDataAsCsv({
          fileName: `데이터목록_${new Date().toISOString().split('T')[0]}.csv`,
          processCellCallback: (params) => {
            return params.value || '';
          }
        });
      } catch (error) {
        console.error('CSV 내보내기 오류:', error);
        alert('데이터 내보내기 중 오류가 발생했습니다.');
      }
    } else {
      console.error('Grid API not available for export');
      alert('그리드 API를 사용할 수 없습니다.');
    }
  };

  // 인쇄 핸들러
  const handlePrint = () => {
    if (window.gridApi || (gridRef && gridRef.current && gridRef.current.api)) {
      // 페이지 설정
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .ag-root * {
            visibility: visible;
          }
          .ag-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      
      // 인쇄 실행
      window.print();
      
      // 스타일 제거
      document.head.removeChild(style);
    } else {
      console.error('Grid API not available for printing');
    }
  };
  
  // 페이지 버튼 렌더링
  const renderPagination = () => {
    const shouldShowFirst = pageGroup > 0;
    const shouldShowLast = (pageGroup + 1) * 5 < totalPages;
    
    return (
      <PaginationContainer>
        {/* 첫 페이지 버튼 */}
        <NavButton 
          onClick={handleFirstPage}
          disabled={page === 0}
          style={{ zIndex: 1 }}
        >
          <FirstPage fontSize="small" />
        </NavButton>
        
        {/* 이전 버튼 */}
        <NavButton 
          onClick={handlePrevPage}
          disabled={page === 0}
          style={{ zIndex: 1 }}
        >
          <NavigateBeforeIcon />
        </NavButton>
        
        {/* 첫 페이지 */}
        {shouldShowFirst && pageGroup > 1 && (
          <>
            <PageNumberButton 
              active={(0 === page).toString()} 
              onClick={() => handlePageClick(0)}
              style={{ zIndex: 1 }}
            >
              1
            </PageNumberButton>
            <MoreButton disabled style={{ zIndex: 1 }}>...</MoreButton>
          </>
        )}
        
        {/* 페이지 번호 버튼 */}
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (pageNum) => (
            <PageNumberButton
              key={pageNum}
              active={(pageNum === page).toString()}
              onClick={() => handlePageClick(pageNum)}
              style={{ zIndex: 1 }}
            >
              {pageNum + 1}
            </PageNumberButton>
          )
        )}
        
        {/* 마지막 페이지 */}
        {shouldShowLast && pageGroup < Math.floor((totalPages - 1) / 5) - 1 && (
          <>
            <MoreButton disabled style={{ zIndex: 1 }}>...</MoreButton>
            <PageNumberButton 
              active={(totalPages - 1 === page).toString()} 
              onClick={() => handlePageClick(totalPages - 1)}
              style={{ zIndex: 1 }}
            >
              {totalPages}
            </PageNumberButton>
          </>
        )}
        
        {/* 다음 버튼 */}
        <NavButton 
          onClick={handleNextPage}
          disabled={page >= totalPages - 1}
          style={{ zIndex: 1 }}
        >
          <NavigateNextIcon />
        </NavButton>
        
        {/* 마지막 페이지 버튼 */}
        <NavButton 
          onClick={handleLastPage}
          disabled={page >= totalPages - 1}
          style={{ zIndex: 1 }}
        >
          <LastPage fontSize="small" />
        </NavButton>
      </PaginationContainer>
    );
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      width: '100%',
      flexDirection: 'row-reverse',
      justifyContent: 'flex-start',
      ...sx
    }}>
      {/* 액션 버튼 */}
      {showActionButtons && (
        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
          <Tooltip title="인쇄하기">
            <IconButton 
              color="primary" 
              onClick={handlePrint}
              size="medium"
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="엑셀 다운로드">
            <IconButton 
              color="primary" 
              onClick={handleExcelDownload}
              size="medium"
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* 페이지네이션 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <StyledTablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          ActionsComponent={TablePaginationActions}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => 
            `${count !== -1 ? count : '이상'} 중 ${from}–${to}`
          }
        />
        
        {/* 숫자 페이지네이션 */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, zIndex: 1, position: 'relative' }}>
          {renderPagination()}
        </Box>
      </Box>
      
      {/* 검색 결과 표시 */}
      {searchText && (
        <Typography variant="body2" sx={{
          color: '#555',
          backgroundColor: '#e3f2fd',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          marginLeft: 2
        }}>
          "{searchText}" 검색결과: {count}건
        </Typography>
      )}
    </Box>
  );
};

PaginationComponent.propTypes = {
  count: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  gridRef: PropTypes.object,
  showActionButtons: PropTypes.bool,
  searchText: PropTypes.string,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  sx: PropTypes.object
};

export default PaginationComponent; 