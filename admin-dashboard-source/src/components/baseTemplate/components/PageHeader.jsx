import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePermission } from '../../../hooks/usePermission';

/**
 * 페이지 헤더 컴포넌트 
 * 회원관리 페이지와 동일한 스타일로 구성
 * 
 * @param {Object} props
 * @param {string} props.title - 페이지 제목
 * @param {string} props.subtitle - 페이지 부제목 (선택적)
 * @param {Function} props.onAddClick - 회원 추가 버튼 클릭 핸들러
 * @param {Function} props.onDisplayOptionsClick - 표시 옵션 버튼 클릭 핸들러
 * @param {Function} props.onRefreshClick - 새로고침 버튼 클릭 핸들러
 * @param {boolean} props.showAddButton - 회원 추가 버튼 표시 여부 (기본값: true)
 * @param {boolean} props.showDisplayOptionsButton - 표시 옵션 버튼 표시 여부 (기본값: true)
 * @param {boolean} props.showRefreshButton - 새로고침 버튼 표시 여부 (기본값: true)
 * @param {string} props.addButtonText - 추가 버튼 텍스트 (기본값: '회원 추가')
 * @param {React.ReactNode} props.customActions - 추가 커스텀 액션
 * @param {React.ReactNode} props.titleTabs - 타이틀 오른쪽에 표시할 탭들
 * @param {Object} props.sx - 추가 스타일 (선택적)
 * @returns {JSX.Element}
 */
const PageHeader = ({
  title,
  subtitle,
  onAddClick,
  onDisplayOptionsClick,
  onRefreshClick,
  showAddButton = true,
  showDisplayOptionsButton = true,
  showRefreshButton = true,
  addButtonText = '회원 추가',
  customActions,
  titleTabs,
  sx = {}
}) => {
  const [, forceUpdate] = useState({});
  const { canUseButton } = usePermission();
  
  // 권한 변경 시 강제 리렌더링
  useEffect(() => {
    const handlePermissionsUpdate = () => {
      console.log('PageHeader: 권한이 업데이트되어 리렌더링합니다.');
      forceUpdate({});
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionsUpdate);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate);
    };
  }, []);
  
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
        marginTop: '15px',
        marginBottom: '15px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '15px',
        paddingBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: '8px !important',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05) !important',
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* 타이틀과 탭을 같은 라인에 배치 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          
          {titleTabs && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {titleTabs}
            </Box>
          )}
        </Box>
        
        {/* 부제목이 있으면 아래에 표시 */}
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{
              color: '#666',
              fontSize: '14px',
              mt: 0.5
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {showAddButton && canUseButton('add-button') && (
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
        
        {customActions}
        
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
      </Box>
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onAddClick: PropTypes.func,
  onDisplayOptionsClick: PropTypes.func,
  onRefreshClick: PropTypes.func,
  showAddButton: PropTypes.bool,
  showDisplayOptionsButton: PropTypes.bool,
  showRefreshButton: PropTypes.bool,
  addButtonText: PropTypes.string,
  customActions: PropTypes.node,
  titleTabs: PropTypes.node,
  sx: PropTypes.object
};

export default PageHeader; 