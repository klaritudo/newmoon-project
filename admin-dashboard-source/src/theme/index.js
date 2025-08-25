import { createTheme } from '@mui/material/styles';

// 색상 변수 정의
const PRIMARY = {
  lighter: '#E3F2FD',
  light: '#64B5F6',
  main: '#2196F3',
  dark: '#1976D2',
  darker: '#0D47A1',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#E8F5E9',
  light: '#81C784',
  main: '#4CAF50',
  dark: '#388E3C',
  darker: '#1B5E20',
  contrastText: '#FFFFFF',
};

const ERROR = {
  lighter: '#FFEBEE',
  light: '#EF5350',
  main: '#F44336',
  dark: '#D32F2F',
  darker: '#B71C1C',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FFF8E1',
  light: '#FFB74D',
  main: '#FFA726',
  dark: '#F57C00',
  darker: '#E65100',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#E1F5FE',
  light: '#4FC3F7',
  main: '#29B6F6',
  dark: '#0288D1',
  darker: '#01579B',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#E8F5E9',
  light: '#81C784',
  main: '#4CAF50',
  dark: '#388E3C',
  darker: '#1B5E20',
  contrastText: '#FFFFFF',
};

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

// 그림자 스타일 정의
const SHADOWS = {
  light: '0 6px 12px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
  dark: '0 12px 24px -4px rgba(0, 0, 0, 0.15)',
  card: '0 0 2px 0 rgba(0, 0, 0, 0.05), 0 12px 24px -4px rgba(0, 0, 0, 0.07)',
  dropdown: '0 0 2px 0 rgba(0, 0, 0, 0.05), 0 12px 24px -4px rgba(0, 0, 0, 0.1)',
  dialog: '0 0 2px 0 rgba(0, 0, 0, 0.05), 0 24px 48px -4px rgba(0, 0, 0, 0.15)',
};

// 관리자 대시보드를 위한 커스텀 테마
const theme = createTheme({
  palette: {
    primary: PRIMARY,
    secondary: SECONDARY,
    error: ERROR,
    warning: WARNING,
    info: INFO,
    success: SUCCESS,
    grey: GREY,
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
    },
    divider: GREY[300],
    action: {
      active: GREY[600],
      hover: GREY[200],
      selected: GREY[300],
      disabled: GREY[400],
      disabledBackground: GREY[200],
      focus: GREY[300],
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    SHADOWS.light,
    SHADOWS.light,
    SHADOWS.light,
    SHADOWS.light,
    SHADOWS.light,
    SHADOWS.medium,
    SHADOWS.medium,
    SHADOWS.medium,
    SHADOWS.medium,
    SHADOWS.medium,
    SHADOWS.medium,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
    SHADOWS.dark,
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        a: {
          textDecoration: 'none',
          color: PRIMARY.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeSmall: {
          height: 32,
        },
        sizeMedium: {
          height: 40,
        },
        sizeLarge: {
          height: 48,
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: SHADOWS.card,
          position: 'relative',
          zIndex: 0,
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: 'h6' },
        subheaderTypographyProps: { variant: 'body2', marginTop: 2 },
      },
      styleOverrides: {
        root: {
          padding: '24px 24px 0',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderBottom: `1px solid ${GREY[300]}`,
        },
        head: {
          fontSize: '0.875rem',
          fontWeight: 600,
          color: GREY[700],
          backgroundColor: GREY[200],
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: '8px 12px',
          '&.Mui-selected': {
            backgroundColor: PRIMARY.lighter,
            color: PRIMARY.dark,
            '&:hover': {
              backgroundColor: PRIMARY.lighter,
            },
            '& .MuiListItemIcon-root': {
              color: PRIMARY.dark,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: SHADOWS.light,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: SHADOWS.light,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: PRIMARY.lighter,
          color: PRIMARY.dark,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: GREY[800],
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme; 