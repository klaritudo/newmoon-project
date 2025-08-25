/**
 * 일자별 정산 데이터
 */

// 기간별 필터 옵션
export const periodOptions = [
  { value: 'daily', label: '일자별' },
  { value: 'weekly', label: '주별' },
  { value: 'monthly', label: '월별' }
];

// 일자별 정산 컬럼 정의 (그룹 컬럼 포함)
export const dailySettlementColumns = [
  {
    id: 'index',
    label: 'No.',
    width: 20,
    minWidth: 20,
    maxWidth: 20,
    align: 'center',
    type: 'number',
    sx: { textAlign: 'center !important' }
  },
  {
    id: 'date',
    label: '날짜',
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    align: 'center',
    type: 'text',
    sx: { textAlign: 'center !important' }
  },
  {
    id: 'slotGroup',
    label: '슬롯',
    type: 'group',
    align: 'center',
    children: [
      {
        id: 'slotBetting',
        label: '베팅',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      },
      {
        id: 'slotWinning',
        label: '당첨',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      },
      {
        id: 'slotProfit',
        label: '베팅수익',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      }
    ]
  },
  {
    id: 'casinoGroup',
    label: '카지노',
    type: 'group',
    align: 'center',
    children: [
      {
        id: 'casinoBetting',
        label: '베팅',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      },
      {
        id: 'casinoWinning',
        label: '당첨',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      },
      {
        id: 'casinoProfit',
        label: '베팅수익',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      }
    ]
  },
  {
    id: 'totalGroup',
    label: '합계',
    type: 'group',
    align: 'center',
    children: [
      {
        id: 'totalBetting',
        label: '베팅',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      },
      {
        id: 'totalWinning',
        label: '당첨',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      },
      {
        id: 'totalProfit',
        label: '베팅수익',
        width: 120,
        align: 'center',
        type: 'currency',
        sx: { textAlign: 'center !important' }
      }
    ]
  }
];

// 일자별 정산 데이터 생성 함수
export const generateDailySettlementData = (types = null, typeHierarchy = null) => {
  const data = [];
  const today = new Date();
  
  // 최근 30일 데이터 생성 (최신순)
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const slotBetting = Math.floor(Math.random() * 50000000) + 10000000; // 1천만 ~ 6천만
    const slotWinning = Math.floor(slotBetting * (0.88 + Math.random() * 0.07)); // 88-95%
    const slotProfit = slotBetting - slotWinning;
    
    const casinoBetting = Math.floor(Math.random() * 30000000) + 5000000; // 500만 ~ 3500만
    const casinoWinning = Math.floor(casinoBetting * (0.85 + Math.random() * 0.1)); // 85-95%
    const casinoProfit = casinoBetting - casinoWinning;
    
    const totalBetting = slotBetting + casinoBetting;
    const totalWinning = slotWinning + casinoWinning;
    const totalProfit = totalBetting - totalWinning;
    
    data.push({
      id: i + 1,
      index: i + 1,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식
      
      // 슬롯 데이터
      slotBetting: slotBetting,
      slotWinning: slotWinning,
      slotProfit: slotProfit,
      
      // 카지노 데이터
      casinoBetting: casinoBetting,
      casinoWinning: casinoWinning,
      casinoProfit: casinoProfit,
      
      // 합계 데이터
      totalBetting: totalBetting,
      totalWinning: totalWinning,
      totalProfit: totalProfit,
      
      // 정렬용 날짜
      sortDate: date
    });
  }
  
  return data;
}; 