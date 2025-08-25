import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * 회원 정보 셀 컴포넌트
 * 모든 페이지에서 일관된 아이디(닉네임) 표시를 위한 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.userId - 사용자 아이디
 * @param {string} props.nickname - 사용자 닉네임
 * @param {boolean} props.showParentheses - 닉네임에 괄호 표시 여부 (기본: false)
 * @param {boolean} props.clickable - 클릭 가능 여부 (기본: false)
 * @param {function} props.onClick - 클릭 핸들러 함수
 * @param {Object} props.sx - 추가 스타일
 */
const MemberInfoCell = ({ 
  userId, 
  nickname, 
  showParentheses = false,
  clickable = false,
  onClick,
  sx = {}
}) => {
  const handleClick = (event) => {
    if (clickable && onClick) {
      event.stopPropagation();
      onClick();
    }
  };

  return (
    <Box 
      onClick={handleClick}
      sx={{
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? {
          backgroundColor: 'action.hover',
          borderRadius: 1
        } : {},
        width: '100%',
        padding: '4px',
        ...sx
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 'bold',
          fontSize: '16px',
          lineHeight: 1.2
        }}
      >
        {userId}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          fontSize: '14px',
          color: '#9e9e9e',
          fontWeight: 'normal',
          lineHeight: 1.2
        }}
      >
        {showParentheses ? `(${nickname})` : nickname}
      </Typography>
    </Box>
  );
};

MemberInfoCell.propTypes = {
  userId: PropTypes.string.isRequired,
  nickname: PropTypes.string.isRequired,
  showParentheses: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  sx: PropTypes.object
};

export default MemberInfoCell; 