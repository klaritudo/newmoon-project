import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // 다크 모드 아이콘
import Brightness7Icon from '@mui/icons-material/Brightness7'; // 라이트 모드 아이콘
import { useThemeContext } from '../theme/ThemeProvider';

/**
 * 테마 토글 버튼 컴포넌트
 * 라이트/다크 테마를 전환할 수 있는 버튼을 제공합니다.
 */
const ThemeToggle = () => {
  // 테마 컨텍스트에서 모드와 토글 함수 가져오기
  const { mode, toggleTheme } = useThemeContext();
  
  return (
    <Tooltip title={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="테마 변경"
        sx={{
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'rotate(30deg)',
          },
        }}
      >
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
