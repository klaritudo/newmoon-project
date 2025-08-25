import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';

/**
 * 테이블 헤더 컴포넌트
 * 테이블 상단에 위치하는 헤더 영역으로, 타이틀, 항목 수, 페이지 번호 방식, 컬럼 고정 및 검색 기능을 제공합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 테이블 제목
 * @param {number} props.totalItems - 총 항목 수
 * @param {string} props.countLabel - 총 항목 수 라벨 포맷 (예: "총 {count}명")
 * @param {boolean} props.indentMode - 들여쓰기 모드 상태
 * @param {Function} props.toggleIndentMode - 들여쓰기 모드 토글 함수
 * @param {boolean} props.sequentialPageNumbers - 연속 페이지 번호 모드 상태
 * @param {Function} props.togglePageNumberMode - 페이지 번호 모드 토글 함수
 * @param {boolean} props.hasPinnedColumns - 고정된 컬럼 존재 여부
 * @param {boolean} props.isGridReady - 그리드 준비 상태
 * @param {Function} props.toggleColumnPin - 컬럼 고정 토글 함수
 * @param {string} props.searchText - 검색어
 * @param {Function} props.handleSearchChange - 검색어 변경 핸들러
 * @param {Function} props.handleClearSearch - 검색어 초기화 핸들러
 * @param {boolean} props.showIndentToggle - 들여쓰기 토글 표시 여부
 * @param {boolean} props.showPageNumberToggle - 페이지 번호 토글 표시 여부
 * @param {boolean} props.showColumnPinToggle - 컬럼 고정 토글 표시 여부
 * @param {boolean} props.showSearch - 검색 필드 표시 여부
 * @param {string} props.searchPlaceholder - 검색 입력란 플레이스홀더
 * @param {Object} props.sx - 추가 스타일 (Material-UI sx prop)
 * @returns {JSX.Element}
 */
const TableHeader = ({
  title = '테이블',
  totalItems = 0,
  countLabel = "총 {count}명",
  indentMode = true,
  toggleIndentMode = () => {},
  sequentialPageNumbers = false,
  togglePageNumberMode = () => {},
  hasPinnedColumns = false,
  isGridReady = false,
  toggleColumnPin = () => {},
  searchText = '',
  handleSearchChange = () => {},
  handleClearSearch = () => {},
  showIndentToggle = false,
  showPageNumberToggle = true,
  showColumnPinToggle = true,
  showSearch = true,
  searchPlaceholder = "검색...",
  sx = {}
}) => {
  // 카운트 라벨 생성
  const formattedCountLabel = countLabel.replace('{count}', totalItems);
  
  return (
    <Box 
      className="table-header" 
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2.5,
        backgroundColor: '#f5f7fa',
        borderRadius: 1.5,
        p: 2.5,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        ...sx
      }}
    >
      <Box className="table-title" sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{
          mr: 1,
          fontWeight: 600,
          color: '#2c3e50',
          fontSize: '1.1rem'
        }}>{title}</Typography>
        
        {/* 들여쓰기 토글 아이콘 버튼 추가 - 제목 바로 옆에 배치 */}
        {showIndentToggle && (
          <Tooltip title={indentMode ? "들여쓰기 해제" : "들여쓰기 적용"}>
            <IconButton 
              size="small" 
              onClick={toggleIndentMode}
              sx={{ 
                mr: 1.5, 
                padding: '4px',
                color: indentMode ? 'primary.main' : 'text.secondary'
              }}
            >
              {indentMode ? 
                <FormatIndentIncreaseIcon fontSize="small" /> : 
                <FormatIndentDecreaseIcon fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        )}
        
        <Chip
          label={formattedCountLabel}
          color="primary"
          size="small"
          className="count-chip"
          sx={{ fontWeight: 500 }}
        />

        {/* 페이지 번호 표시 방식 토글 */}
        {showPageNumberToggle && (
          <Tooltip title="페이지 번호 표시 방식">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={togglePageNumberMode}
              sx={{ ml: 2, fontSize: '0.75rem', textTransform: 'none' }}
            >
              {sequentialPageNumbers ? "연속 번호" : "페이지별 번호"}
            </Button>
          </Tooltip>
        )}

        {/* 컬럼 고정 토글 버튼 */}
        {showColumnPinToggle && (
          <Tooltip title={hasPinnedColumns ? "고정된 모든 컬럼을 해제합니다" : "현재 선택한 컬럼을 좌측에 고정합니다"}>
            <span style={{ marginLeft: '8px' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={isGridReady ? toggleColumnPin : undefined}
                disabled={!isGridReady}
                sx={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'none',
                }}
              >
                {hasPinnedColumns ? "컬럼고정해제" : "컬럼고정"}
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
      
      {showSearch && (
        <Box className="table-actions" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* 검색 필드 */}
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchText || ''}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                bgcolor: '#ffffff',
                borderRadius: '25px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                  borderRadius: '25px'
                }
              }
            }}
            sx={{
              width: '240px',
              '& .MuiInputBase-root': {
                height: '36px',
                fontSize: '0.875rem',
                borderRadius: '25px'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

TableHeader.propTypes = {
  title: PropTypes.string,
  totalItems: PropTypes.number,
  countLabel: PropTypes.string,
  indentMode: PropTypes.bool,
  toggleIndentMode: PropTypes.func,
  sequentialPageNumbers: PropTypes.bool,
  togglePageNumberMode: PropTypes.func,
  hasPinnedColumns: PropTypes.bool,
  isGridReady: PropTypes.bool,
  toggleColumnPin: PropTypes.func,
  searchText: PropTypes.string,
  handleSearchChange: PropTypes.func,
  handleClearSearch: PropTypes.func,
  showIndentToggle: PropTypes.bool,
  showPageNumberToggle: PropTypes.bool,
  showColumnPinToggle: PropTypes.bool,
  showSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  sx: PropTypes.object
};

export default TableHeader; 