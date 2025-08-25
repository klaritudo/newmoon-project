import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getThemeVariables } from '../styles/styleUtils';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Emotion 캐시 생성 - 이렇게 하면 단일 인스턴스를 보장합니다
const emotionCache = createCache({
  key: 'mui-style',
  prepend: true,
  stylisPlugins: []
});

// 테마 컨텍스트 생성
export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {}
});

// 테마 컨텍스트 훅
export const useThemeContext = () => useContext(ThemeContext);

/**
 * 테마 프로바이더 컴포넌트
 * 애플리케이션 전체에 테마를 제공하고 테마 전환 기능을 관리합니다.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {JSX.Element}
 */
const ThemeProvider = ({ children }) => {
  // 로컬 스토리지에서 테마 모드 불러오기 (기본값: 'light')
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });
  
  // 테마 모드 토글 함수
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
  // 테마 모드 직접 설정 함수
  const handleSetMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  };
  
  // 테마 모드 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // HTML 요소에 data-theme 속성 설정
    document.documentElement.setAttribute('data-theme', mode);
    
    // CSS 변수 적용
    const themeVariables = getThemeVariables(mode);
    Object.entries(themeVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [mode]);
  
  // Material UI 테마 생성
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#1976d2' : '#90caf9',
          light: mode === 'light' ? '#4791db' : '#e3f2fd',
          dark: mode === 'light' ? '#115293' : '#42a5f5',
          contrastText: '#ffffff'
        },
        secondary: {
          main: mode === 'light' ? '#dc004e' : '#f48fb1',
          light: mode === 'light' ? '#e33371' : '#fce4ec',
          dark: mode === 'light' ? '#9a0036' : '#ec407a',
          contrastText: '#ffffff'
        },
        error: {
          main: '#f44336',
          light: '#f6685e',
          dark: '#aa2e25',
          contrastText: '#ffffff'
        },
        warning: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
          contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        info: {
          main: mode === 'light' ? '#2196f3' : '#29b6f6',
          light: '#64b5f6',
          dark: '#1976d2',
          contrastText: '#ffffff'
        },
        success: {
          main: mode === 'light' ? '#4caf50' : '#66bb6a',
          light: '#81c784',
          dark: '#388e3c',
          contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        background: {
          default: mode === 'light' ? '#f5f5f5' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e'
        },
        text: {
          primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
          secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)'
        },
        divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
      },
      typography: {
        fontFamily: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"'
        ].join(','),
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
          lineHeight: 1.2
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.3
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.75rem',
          lineHeight: 1.4
        },
        h4: {
          fontWeight: 600,
          fontSize: '1.5rem',
          lineHeight: 1.4
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          lineHeight: 1.4
        },
        h6: {
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: 1.4
        },
        subtitle1: {
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.5
        },
        subtitle2: {
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.5
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.5
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5
        },
        button: {
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'none'
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.5
        },
        overline: {
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.5
        }
      },
      shape: {
        borderRadius: 8
      },
      shadows: [
        'none',
        mode === 'light' ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)' : '0 3px 6px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.6)',
        mode === 'light' ? '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)' : '0 10px 20px rgba(0, 0, 0, 0.7), 0 6px 6px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)' : '0 14px 28px rgba(0, 0, 0, 0.7), 0 10px 10px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22)' : '0 19px 38px rgba(0, 0, 0, 0.8), 0 15px 12px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 2px 2px rgba(0, 0, 0, 0.1), 0 4px 4px rgba(0, 0, 0, 0.1)' : '0 2px 2px rgba(0, 0, 0, 0.5), 0 4px 4px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 2px 2px rgba(0, 0, 0, 0.1), 0 4px 4px rgba(0, 0, 0, 0.1), 0 8px 8px rgba(0, 0, 0, 0.1)' : '0 2px 2px rgba(0, 0, 0, 0.5), 0 4px 4px rgba(0, 0, 0, 0.5), 0 8px 8px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 2px 2px rgba(0, 0, 0, 0.1), 0 4px 4px rgba(0, 0, 0, 0.1), 0 8px 8px rgba(0, 0, 0, 0.1), 0 16px 16px rgba(0, 0, 0, 0.1)' : '0 2px 2px rgba(0, 0, 0, 0.5), 0 4px 4px rgba(0, 0, 0, 0.5), 0 8px 8px rgba(0, 0, 0, 0.5), 0 16px 16px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 1px 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.08), 0 4px 4px rgba(0, 0, 0, 0.08)' : '0 1px 1px rgba(0, 0, 0, 0.4), 0 2px 2px rgba(0, 0, 0, 0.4), 0 4px 4px rgba(0, 0, 0, 0.4)',
        mode === 'light' ? '0 1px 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.08), 0 4px 4px rgba(0, 0, 0, 0.08), 0 8px 8px rgba(0, 0, 0, 0.08)' : '0 1px 1px rgba(0, 0, 0, 0.4), 0 2px 2px rgba(0, 0, 0, 0.4), 0 4px 4px rgba(0, 0, 0, 0.4), 0 8px 8px rgba(0, 0, 0, 0.4)',
        mode === 'light' ? '0 1px 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.08), 0 4px 4px rgba(0, 0, 0, 0.08), 0 8px 8px rgba(0, 0, 0, 0.08), 0 16px 16px rgba(0, 0, 0, 0.08)' : '0 1px 1px rgba(0, 0, 0, 0.4), 0 2px 2px rgba(0, 0, 0, 0.4), 0 4px 4px rgba(0, 0, 0, 0.4), 0 8px 8px rgba(0, 0, 0, 0.4), 0 16px 16px rgba(0, 0, 0, 0.4)',
        mode === 'light' ? '0 1px 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.08), 0 4px 4px rgba(0, 0, 0, 0.08), 0 8px 8px rgba(0, 0, 0, 0.08), 0 16px 16px rgba(0, 0, 0, 0.08), 0 32px 32px rgba(0, 0, 0, 0.08)' : '0 1px 1px rgba(0, 0, 0, 0.4), 0 2px 2px rgba(0, 0, 0, 0.4), 0 4px 4px rgba(0, 0, 0, 0.4), 0 8px 8px rgba(0, 0, 0, 0.4), 0 16px 16px rgba(0, 0, 0, 0.4), 0 32px 32px rgba(0, 0, 0, 0.4)',
        mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5), 0 16px 32px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.1), 0 32px 64px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5), 0 16px 32px rgba(0, 0, 0, 0.5), 0 32px 64px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.1), 0 32px 64px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5), 0 16px 32px rgba(0, 0, 0, 0.5), 0 32px 64px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.1), 0 32px 64px rgba(0, 0, 0, 0.1), 0 64px 128px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5), 0 16px 32px rgba(0, 0, 0, 0.5), 0 32px 64px rgba(0, 0, 0, 0.5), 0 64px 128px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.1), 0 32px 64px rgba(0, 0, 0, 0.1), 0 64px 128px rgba(0, 0, 0, 0.1), 0 128px 256px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5), 0 16px 32px rgba(0, 0, 0, 0.5), 0 32px 64px rgba(0, 0, 0, 0.5), 0 64px 128px rgba(0, 0, 0, 0.5), 0 128px 256px rgba(0, 0, 0, 0.5)',
        mode === 'light' ? '0 2px 10px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 3px 14px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.3)' : '0 3px 14px rgba(0, 0, 0, 0.6), 0 0 1px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 5px 20px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.3)' : '0 5px 20px rgba(0, 0, 0, 0.7), 0 0 1px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.3)' : '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 12px 40px rgba(0, 0, 0, 0.35), 0 0 1px rgba(0, 0, 0, 0.3)' : '0 12px 40px rgba(0, 0, 0, 0.9), 0 0 1px rgba(0, 0, 0, 0.7)',
        mode === 'light' ? '0 24px 38px rgba(0, 0, 0, 0.25), 0 9px 46px rgba(0, 0, 0, 0.22)' : '0 24px 38px rgba(0, 0, 0, 0.7), 0 9px 46px rgba(0, 0, 0, 0.6)'
      ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#121212',
              color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 500
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: mode === 'light'
                  ? '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)'
                  : '0 3px 6px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.6)'
              }
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              '@media (max-width: 700px)': {
                padding: '6px !important'
              }
            },
            rounded: {
              borderRadius: '12px'
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              boxShadow: mode === 'light'
                ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)'
                : '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.5)'
            }
          }
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`
            },
            head: {
              fontWeight: 600,
              backgroundColor: mode === 'light' ? '#f1f1f1' : '#2c2c2c'
            }
          }
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)'
              }
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: '16px'
            }
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: '12px'
            }
          }
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }
          }
        },
        MuiSelect: {
          styleOverrides: {
            outlined: {
              borderRadius: '8px'
            }
          }
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500
            }
          }
        },
        MuiContainer: {
          styleOverrides: {
            root: {
              '@media (max-width: 700px)': {
                paddingLeft: '10px !important',
                paddingRight: '10px !important'
              },
              '@media (min-width: 701px)': {
                paddingLeft: '20px !important',
                paddingRight: '20px !important'
              }
            }
          }
        }
      }
    });
  }, [mode]);
  
  // 컨텍스트 값
  const contextValue = {
    mode,
    toggleTheme,
    setMode: handleSetMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <CacheProvider value={emotionCache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeProvider;
