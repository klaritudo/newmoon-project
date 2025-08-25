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
 * 슬롯 테이블 컬럼 정의
 */
export const slotColumns = [
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
export const slotFilterOptions = [
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
  const gameTypes = ['Video Slot', 'Classic Slot', 'Progressive Slot', '3D Slot', 'Megaways'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${vendorName.toLowerCase().replace(/\s+/g, '-')}-game-${i + 1}`,
    name: `${vendorName} - ${gameTypes[i % gameTypes.length]} ${i + 1}`,
    type: gameTypes[i % gameTypes.length],
    rtp: (94 + Math.random() * 4).toFixed(2) + '%',
    volatility: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
  }));
};

/**
 * 게임사 로고 정보 생성 (이미지 경로 또는 fallback 색상)
 */
const getVendorLogo = (vendorName) => {
  // 실제 로고 이미지 경로와 fallback 색상 정보
  const logoMap = {
    "Pragmatic Play": { 
      src: "/image/pragmatic-play.svg", 
      fallback: { bg: "#FF6B35", text: "PP" }
    },
    "NetEnt": { 
      src: "/image/netent.svg", 
      fallback: { bg: "#00A859", text: "NE" }
    },
    "Microgaming": { 
      src: "/image/microgaming.svg", 
      fallback: { bg: "#E74C3C", text: "MG" }
    },
    "Play'n GO": { 
      src: "/image/playngo.svg", 
      fallback: { bg: "#9B59B6", text: "PNG" }
    },
    "Red Tiger": { 
      src: "/image/red-tiger.svg", 
      fallback: { bg: "#E67E22", text: "RT" }
    },
    "Big Time Gaming": { 
      src: "/image/big-time-gaming.svg", 
      fallback: { bg: "#3498DB", text: "BTG" }
    },
    "Push Gaming": { 
      src: "/image/push-gaming.svg", 
      fallback: { bg: "#1ABC9C", text: "PG" }
    },
    "Nolimit City": { 
      src: "/image/nolimit-city.svg", 
      fallback: { bg: "#34495E", text: "NC" }
    },
    "Hacksaw Gaming": { 
      src: "/image/hacksaw-gaming.svg", 
      fallback: { bg: "#F39C12", text: "HG" }
    },
    "ELK Studios": { 
      src: "/image/elk-studios.svg", 
      fallback: { bg: "#8E44AD", text: "ELK" }
    }
  };
  
  // 기본 게임사명에서 로고를 찾되, 숫자가 붙은 경우 기본명으로 찾기
  const baseVendorName = vendorName.replace(/\s+\d+$/, '');
  const logoInfo = logoMap[baseVendorName] || { 
    src: "/image/default-logo.svg", 
    fallback: { bg: "#95A5A6", text: "LOGO" }
  };
  
  // 현재는 fallback만 반환 (실제 이미지 파일이 없으므로)
  return logoInfo.fallback;
};

/**
 * 슬롯 게임사 데이터 생성
 */
export const generateSlotSettingsData = (count = 30) => {
  const vendors = [
    "Pragmatic Play", "NetEnt", "Microgaming", "Play'n GO", "Red Tiger",
    "Big Time Gaming", "Push Gaming", "Nolimit City", "Hacksaw Gaming", "ELK Studios"
  ];

  const data = [];
  for (let i = 0; i < count; i++) {
    const vendorIndex = i % vendors.length;
    const vendorSuffix = Math.floor(i / vendors.length);
    const vendorName = vendors[vendorIndex] + (vendorSuffix > 0 ? ` ${vendorSuffix + 1}` : '');
    
    const gameCount = Math.floor(Math.random() * 20) + 10; // 10-29개 게임
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