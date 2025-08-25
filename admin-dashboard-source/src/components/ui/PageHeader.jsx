import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * 페이지 헤더 컴포넌트 
 * 회원관리 페이지와 동일한 스타일로 구성
 * 
 * @param {Object} props
 * @param {string} props.title - 페이지 제목
 * @param {Function} props.onAddClick - 회원 추가 버튼 클릭 핸들러
 * @param {Function} props.onDisplayOptionsClick - 표시 옵션 버튼 클릭 핸들러
 * @param {Function} props.onRefreshClick - 새로고침 버튼 클릭 핸들러
 * @param {boolean} props.showAddButton - 회원 추가 버튼 표시 여부 (기본값: true)
 * @param {boolean} props.showDisplayOptionsButton - 표시 옵션 버튼 표시 여부 (기본값: true)
 * @param {boolean} props.showRefreshButton - 새로고침 버튼 표시 여부 (기본값: true)
 * @param {string} props.addButtonText - 추가 버튼 텍스트 (기본값: '회원 추가')
 * @param {React.ReactNode} props.customActions - 추가 커스텀 액션
 * @param {Object} props.sx - 추가 스타일 (선택적)
 * @returns {JSX.Element}
 */
const PageHeader = ({
  title,
  onAddClick,
  onDisplayOptionsClick,
  onRefreshClick,
  showAddButton = true,
  showDisplayOptionsButton = true,
  showRefreshButton = true,
  addButtonText = '회원 추가',
  customActions,
  sx = {}
}) => {
  // 표시 옵션 버튼 클릭 핸들러
  const handleDisplayOptionsClick = (event) => {
    if (onDisplayOptionsClick) {
      onDisplayOptionsClick(event.currentTarget);
    }
  };

  return (
    <Paper 
      elevation={0} 
      className="page-header"
      sx={{
        marginBottom: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '15px',
        paddingBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: '8px !important',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05) !important',
        ...sx
      }}
    >
      <Typography 
        variant="h5" 
        className="page-title"
        sx={{
          fontWeight: 600,
          fontSize: '20px',
          color: '#333'
        }}
      >
        {title}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: '8px' }}>
        {showAddButton && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={onAddClick}
            size="small"
          >
            {addButtonText}
          </Button>
        )}
        
        {showDisplayOptionsButton && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<TuneIcon />}
            onClick={handleDisplayOptionsClick}
            size="small"
          >
            표시 옵션
          </Button>
        )}
        
        {showRefreshButton && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={onRefreshClick}
            size="small"
          >
            새로고침
          </Button>
        )}
        
        {customActions}
      </Box>
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onAddClick: PropTypes.func,
  onDisplayOptionsClick: PropTypes.func,
  onRefreshClick: PropTypes.func,
  showAddButton: PropTypes.bool,
  showDisplayOptionsButton: PropTypes.bool,
  showRefreshButton: PropTypes.bool,
  addButtonText: PropTypes.string,
  customActions: PropTypes.node,
  sx: PropTypes.object
};

export default PageHeader; 