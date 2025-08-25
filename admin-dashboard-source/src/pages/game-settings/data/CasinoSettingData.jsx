import { format } from 'date-fns';

/**
 * API 연동 옵션 - API 제공업체
 */
export const apiOptions = [
  { value: 'Honor API', label: 'Honor API' },
  // 추후 다른 API 업체 추가 시 여기에 추가
  // { value: 'Other API', label: 'Other API' },
];

/**
 * 카지노 테이블 컬럼 정의
 */
export const casinoColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 70,
    minWidth: 50,
    align: 'center',
    type: 'number'  // number 타입으로 설정하여 번호 자동 계산
  },
  {
    id: 'vendorLogo',
    label: '로고',
    width: 120,
    minWidth: 100,
    align: 'center',
    type: 'image'
  },
  {
    id: 'vendorName',
    label: '게임사',
    width: 200,
    align: 'left',
    type: 'text',
    sortable: true
  },
  {
    id: 'enabled',
    label: '활성/비활성',
    width: 120,
    align: 'center',
    type: 'toggle',
    onToggle: null // 페이지에서 설정
  },
  {
    id: 'api',
    label: 'API',
    width: 180,
    align: 'center',
    type: 'dropdown',
    dropdownOptions: apiOptions,
    onApiChange: null // 페이지에서 설정
  },
  {
    id: 'gameCount',
    label: '게임 수',
    width: 100,
    align: 'center',
    type: 'text',
    sortable: true
  },
  {
    id: 'action',
    label: '액션',
    width: 200,
    align: 'center',
    type: 'actions',
    actions: [
      {
        type: 'button',
        buttonText: '게임리스트',
        onClick: null, // 페이지에서 설정
        variant: 'outlined',
        color: 'primary'
      },
      {
        type: 'button',
        buttonText: '동기화',
        onClick: null, // 페이지에서 설정
        variant: 'contained',
        color: 'secondary'
      }
    ]
  }
];

/**
 * 필터 옵션
 */
export const casinoFilterOptions = [
  {
    id: 'status',
    label: '상태',
    items: [
      { value: '', label: '전체' },
      { value: 'enabled', label: '활성' },
      { value: 'disabled', label: '비활성' }
    ]
  },
  {
    id: 'api',
    label: 'API',
    items: [
      { value: '', label: '전체' },
      ...apiOptions
    ]
  }
];

/**
 * 게임 목록 생성 함수
 */
const generateGames = (vendorName, count) => {
  const gameTypes = ['Live Baccarat', 'Live Roulette', 'Live Blackjack', 'Live Poker', 'Live Sic Bo', 'Live Dragon Tiger'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${vendorName.toLowerCase().replace(/\s+/g, '-')}-game-${i + 1}`,
    name: `${vendorName} - ${gameTypes[i % gameTypes.length]} ${i + 1}`,
    type: gameTypes[i % gameTypes.length],
    minBet: Math.floor(Math.random() * 5 + 1) * 10000,
    maxBet: Math.floor(Math.random() * 50 + 10) * 100000,
    tables: Math.floor(Math.random() * 10) + 1
  }));
};

/**
 * 게임사 로고 정보 생성 (이미지 경로 또는 fallback 색상)
 */
const getVendorLogo = (vendorName) => {
  // 실제 로고 이미지 경로와 fallback 색상 정보
  const logoMap = {
    "Evolution Gaming": { 
      src: "/image/evolution-gaming.svg", 
      fallback: { bg: "#1976D2", text: "EG" }
    },
    "Pragmatic Play Live": { 
      src: "/image/pragmatic-play-live.svg", 
      fallback: { bg: "#FF6B35", text: "PPL" }
    },
    "Ezugi": { 
      src: "/image/ezugi.svg", 
      fallback: { bg: "#4CAF50", text: "EZ" }
    },
    "Vivo Gaming": { 
      src: "/image/vivo-gaming.svg", 
      fallback: { bg: "#9C27B0", text: "VG" }
    },
    "Authentic Gaming": { 
      src: "/image/authentic-gaming.svg", 
      fallback: { bg: "#FF9800", text: "AG" }
    },
    "Asia Gaming": { 
      src: "/image/asia-gaming.svg", 
      fallback: { bg: "#F44336", text: "AG" }
    },
    "SA Gaming": { 
      src: "/image/sa-gaming.svg", 
      fallback: { bg: "#3F51B5", text: "SA" }
    },
    "Sexy Gaming": { 
      src: "/image/sexy-gaming.svg", 
      fallback: { bg: "#E91E63", text: "SG" }
    },
    "Dream Gaming": { 
      src: "/image/dream-gaming.svg", 
      fallback: { bg: "#00BCD4", text: "DG" }
    },
    "WM Casino": { 
      src: "/image/wm-casino.svg", 
      fallback: { bg: "#795548", text: "WM" }
    }
  };
  
  // 기본 게임사명에서 로고를 찾되, 숫자가 붙은 경우 기본명으로 찾기
  const baseVendorName = vendorName.replace(/\s+\d+$/, '');
  const logoInfo = logoMap[baseVendorName] || { 
    src: "/image/default-logo.svg", 
    fallback: { bg: "#607D8B", text: "LOGO" }
  };
  
  // 현재는 fallback만 반환 (실제 이미지 파일이 없으므로)
  return logoInfo.fallback;
};

/**
 * 카지노 게임사 데이터 생성
 */
export const generateCasinoSettingsData = (count = 20) => {
  const vendors = [
    "Evolution Gaming", "Pragmatic Play Live", "Ezugi", "Vivo Gaming", 
    "Authentic Gaming", "Asia Gaming", "SA Gaming", "Sexy Gaming", 
    "Dream Gaming", "WM Casino"
  ];

  const data = [];
  for (let i = 0; i < count; i++) {
    const vendorIndex = i % vendors.length;
    const vendorSuffix = Math.floor(i / vendors.length);
    const vendorName = vendors[vendorIndex] + (vendorSuffix > 0 ? ` ${vendorSuffix + 1}` : '');
    
    const gameCount = Math.floor(Math.random() * 15) + 5; // 5-19개 게임
    const games = generateGames(vendorName, gameCount);
    
    data.push({
      id: i + 1,
      no: i + 1,
      vendorLogo: getVendorLogo(vendorName),
      vendorName: vendorName,
      enabled: Math.random() > 0.2, // 80% 확률로 활성
      api: 'Honor API', // Honor API 고정
      games: games,
      gameCount: `${games.length}개`,
      order: i + 1 // 드래그 앤 드롭을 위한 순서
    });
  }
  
  return data;
};