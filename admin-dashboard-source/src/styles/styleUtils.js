/**
 * 스타일 유틸리티
 * 공통 스타일 상수, 믹스인, 헬퍼 함수를 제공합니다.
 */

// 색상 팔레트
export const colors = {
  // 기본 색상
  primary: {
    main: 'var(--primary-color)',
    light: 'var(--primary-light)',
    dark: 'var(--primary-dark)',
    lighter: 'var(--primary-lighter)',
    rgb: 'var(--primary-rgb)',
    contrastText: '#ffffff'
  },
  secondary: {
    main: 'var(--secondary-color)',
    light: 'var(--secondary-light)',
    dark: 'var(--secondary-dark)',
    contrastText: '#ffffff'
  },
  error: {
    main: 'var(--error-color)',
    light: '#f6685e',
    dark: '#aa2e25',
    contrastText: '#ffffff'
  },
  warning: {
    main: 'var(--warning-color)',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)'
  },
  info: {
    main: 'var(--info-color)',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#ffffff'
  },
  success: {
    main: 'var(--success-color)',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: 'rgba(0, 0, 0, 0.87)'
  },
  
  // 중립 색상
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#d5d5d5',
    A200: '#aaaaaa',
    A400: '#303030',
    A700: '#616161'
  },
  
  // 배경 및 텍스트 색상
  background: {
    default: 'var(--background-color)',
    paper: 'var(--paper-color)',
    secondary: 'var(--background-secondary)'
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    disabled: 'var(--text-disabled)',
    hint: 'var(--text-disabled)'
  },
  divider: 'var(--divider-color)',
  border: 'var(--border-color)',
  hover: 'var(--hover-color)',
  
  // 테이블 관련 색상
  table: {
    header: 'var(--table-header-bg)',
    hover: 'var(--table-row-hover)',
    border: 'var(--table-border)'
  },
  
  // 아이콘 색상
  icon: 'var(--icon-color)'
};

// 그림자
export const shadows = {
  light: 'var(--shadow-light)',
  medium: 'var(--shadow-medium)',
  dark: 'var(--shadow-dark)'
};

// 간격 (스페이싱)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// 테두리 반경
export const borderRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  round: '50%'
};

// 폰트 크기
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.25rem',    // 20px
  xl: '1.5rem',     // 24px
  xxl: '2rem'       // 32px
};

// 폰트 두께
export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

// 트랜지션
export const transitions = {
  duration: {
    shortest: '0.15s',
    short: '0.3s',
    standard: '0.5s',
    complex: '0.8s'
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

// 미디어 쿼리 브레이크포인트
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px'
};

// z-index 값
export const zIndex = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};

// 믹스인 (재사용 가능한 스타일 함수)
export const mixins = {
  // 플렉스 박스 설정
  flexBox: (direction = 'row', justify = 'flex-start', align = 'center') => ({
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align
  }),
  
  // 중앙 정렬
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // 공간 사이에 균등 배치
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  // 그리드 설정
  grid: (columns = 1, gap = spacing.md) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap
  }),
  
  // 텍스트 말줄임표
  textEllipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  
  // 다중 행 텍스트 말줄임표
  multilineEllipsis: (lines = 2) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical'
  }),
  
  // 스크롤바 스타일링
  customScrollbar: {
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--divider-color)',
      borderRadius: '6px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'var(--text-secondary)'
    }
  },
  
  // 카드 스타일
  card: {
    backgroundColor: 'var(--paper-color)',
    color: 'var(--text-primary)',
    borderRadius: borderRadius.md,
    boxShadow: shadows.light,
    border: '1px solid var(--divider-color)',
    transition: `all ${transitions.duration.short} ${transitions.easing.easeInOut}`
  },
  
  // 버튼 스타일
  button: {
    textTransform: 'none',
    fontWeight: fontWeight.medium,
    borderRadius: borderRadius.sm,
    transition: `all ${transitions.duration.short} ${transitions.easing.easeInOut}`
  },
  
  // 입력 필드 스타일
  input: {
    backgroundColor: 'var(--paper-color)',
    color: 'var(--text-primary)',
    borderRadius: borderRadius.sm,
    border: '1px solid var(--divider-color)',
    '&:hover': {
      borderColor: 'var(--text-secondary)'
    },
    '&:focus': {
      borderColor: 'var(--primary-color)',
      outline: 'none'
    }
  },
  
  // 테이블 스타일
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    '& th': {
      backgroundColor: 'var(--table-header-bg)',
      color: 'var(--text-primary)',
      fontWeight: fontWeight.semibold,
      padding: spacing.md,
      textAlign: 'left',
      borderBottom: '1px solid var(--divider-color)'
    },
    '& td': {
      padding: spacing.md,
      borderBottom: '1px solid var(--divider-color)'
    },
    '& tr:hover': {
      backgroundColor: 'var(--table-row-hover)'
    }
  },
  
  // 애니메이션 효과
  fadeIn: {
    animation: `fadeIn ${transitions.duration.short} ${transitions.easing.easeInOut}`
  },
  
  // 반응형 디자인 헬퍼
  responsive: {
    mobile: `@media (max-width: ${breakpoints.sm})`,
    tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
    desktop: `@media (min-width: ${breakpoints.md})`
  }
};

// 유틸리티 함수
export const utils = {
  // 색상 투명도 조정
  alpha: (color, opacity) => {
    if (color.startsWith('var(--')) {
      return `rgba(var(${color.slice(4, -1)}-rgb), ${opacity})`;
    }
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },
  
  // 색상 밝기 조정
  lighten: (color, amount) => {
    return `color-mix(in srgb, ${color}, white ${amount * 100}%)`;
  },
  
  darken: (color, amount) => {
    return `color-mix(in srgb, ${color}, black ${amount * 100}%)`;
  },
  
  // 반응형 값 생성
  responsive: (property, { xs, sm, md, lg, xl }) => {
    const styles = {};
    
    if (xs !== undefined) {
      styles[property] = xs;
    }
    
    if (sm !== undefined) {
      styles[`@media (min-width: ${breakpoints.sm})`] = {
        [property]: sm
      };
    }
    
    if (md !== undefined) {
      styles[`@media (min-width: ${breakpoints.md})`] = {
        [property]: md
      };
    }
    
    if (lg !== undefined) {
      styles[`@media (min-width: ${breakpoints.lg})`] = {
        [property]: lg
      };
    }
    
    if (xl !== undefined) {
      styles[`@media (min-width: ${breakpoints.xl})`] = {
        [property]: xl
      };
    }
    
    return styles;
  },
  
  // 픽셀 값을 rem으로 변환 (기본 16px 기준)
  pxToRem: (px, baseFontSize = 16) => {
    return `${px / baseFontSize}rem`;
  }
};

// 테마 변수 (라이트/다크 모드 전환 시 사용)
export const getThemeVariables = (mode = 'light') => {
  return mode === 'dark' ? {
    // 다크 모드 변수
    '--primary-color': '#90caf9',
    '--primary-rgb': '144, 202, 249',
    '--primary-light': '#e3f2fd',
    '--primary-lighter': 'rgba(144, 202, 249, 0.12)',
    '--primary-dark': '#42a5f5',
    
    '--secondary-color': '#f48fb1',
    '--secondary-light': '#fce4ec',
    '--secondary-dark': '#ec407a',
    
    '--background-color': '#121212',
    '--background-secondary': '#1e1e1e',
    '--paper-color': '#1e1e1e',
    '--divider-color': 'rgba(255, 255, 255, 0.12)',
    '--border-color': 'rgba(255, 255, 255, 0.23)',
    '--hover-color': 'rgba(255, 255, 255, 0.08)',
    
    '--text-primary': 'rgba(255, 255, 255, 0.87)',
    '--text-secondary': 'rgba(255, 255, 255, 0.6)',
    '--text-disabled': 'rgba(255, 255, 255, 0.38)',
    
    '--table-header-bg': '#2c2c2c',
    '--table-row-hover': 'rgba(255, 255, 255, 0.08)',
    '--table-border': '#424242',
    
    '--shadow-light': '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.5)',
    '--shadow-medium': '0 3px 6px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.6)',
    '--shadow-dark': '0 10px 20px rgba(0, 0, 0, 0.7), 0 6px 6px rgba(0, 0, 0, 0.7)',
    
    '--icon-color': 'rgba(255, 255, 255, 0.54)'
  } : {
    // 라이트 모드 변수
    '--primary-color': '#1976d2',
    '--primary-rgb': '25, 118, 210',
    '--primary-light': '#4791db',
    '--primary-lighter': 'rgba(25, 118, 210, 0.08)',
    '--primary-dark': '#115293',
    
    '--secondary-color': '#dc004e',
    '--secondary-light': '#e33371',
    '--secondary-dark': '#9a0036',
    
    '--background-color': '#f5f5f5',
    '--background-secondary': '#f0f0f0',
    '--paper-color': '#ffffff',
    '--divider-color': 'rgba(0, 0, 0, 0.12)',
    '--border-color': 'rgba(0, 0, 0, 0.23)',
    '--hover-color': 'rgba(0, 0, 0, 0.04)',
    
    '--text-primary': 'rgba(0, 0, 0, 0.87)',
    '--text-secondary': 'rgba(0, 0, 0, 0.6)',
    '--text-disabled': 'rgba(0, 0, 0, 0.38)',
    
    '--table-header-bg': '#f1f1f1',
    '--table-row-hover': 'rgba(0, 0, 0, 0.04)',
    '--table-border': '#e0e0e0',
    
    '--shadow-light': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
    '--shadow-medium': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    '--shadow-dark': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    
    '--icon-color': 'rgba(0, 0, 0, 0.54)'
  };
};

// 기본 내보내기
export default {
  colors,
  shadows,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  transitions,
  breakpoints,
  zIndex,
  mixins,
  utils,
  getThemeVariables
};
