// 당일정산 페이지용 설정 데이터
import { API_OPTIONS, BANK_LIST } from '../../../constants';
import { getTableVersion } from '../../../config/tableVersions';

// API 옵션 (중앙 상수 사용)
export const apiOptions = API_OPTIONS;

// 은행 목록 (중앙 상수 사용)
export const bankList = BANK_LIST;

// 컬럼 정의 버전
export const TODAY_SETTLEMENT_COLUMNS_VERSION = getTableVersion('today_settlement_table');

// 당일정산 컬럼 정의
export const todaySettlementColumns = [
  {
    id: 'checkbox',
    type: 'checkbox',
    width: 50,
    sortable: false,
    pinnable: true
  },
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
    align: 'center',
    pinnable: true
  },
  {
    id: 'type',
    header: '유형',
    type: 'hierarchical',
    width: 120,
    cellRenderer: 'chip',
    sortable: true,
    pinnable: true
  },
  {
    id: 'userId',
    header: '아이디(닉네임)',
    type: 'multiline',
    width: 150,
    sortable: true,
    clickable: true,
    pinnable: true
  },
  // 입출 그룹
  {
    id: 'deposit_withdrawal',
    type: 'group',
    header: '입출',
    children: [
      { 
        id: 'deposit_withdrawal.charge_amount', 
        header: '충전금액', 
        width: 120,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'deposit_withdrawal.exchange_amount', 
        header: '환전금액', 
        width: 120,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'deposit_withdrawal.profit_loss', 
        header: '충환손익', 
        width: 120,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
    ],
  },
  // 슬롯 그룹
  {
    id: 'slot',
    type: 'group',
    header: '슬롯',
    children: [
      { 
        id: 'slot.betting', 
        header: '베팅', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'slot.winning', 
        header: '당첨', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'slot.betting_winning', 
        header: '베팅-당첨', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'slot.rolling_percent', 
        header: '롤링%', 
        width: 80,
        align: 'center',
        sortable: true
      },
      { 
        id: 'slot.rolling_amount', 
        header: '롤링금', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'slot.rolling_total', 
        header: '롤링금합계', 
        width: 120,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'slot.final_profit_loss', 
        header: '베팅-당첨-롤링금', 
        width: 140,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'slot.losing', 
        header: '루징', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
    ],
  },
  // 카지노 그룹
  {
    id: 'casino',
    type: 'group',
    header: '카지노',
    children: [
      { 
        id: 'casino.betting', 
        header: '베팅', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'casino.winning', 
        header: '당첨', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'casino.betting_winning', 
        header: '베팅-당첨', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'casino.rolling_percent', 
        header: '롤링%', 
        width: 80,
        align: 'center',
        sortable: true
      },
      { 
        id: 'casino.rolling_amount', 
        header: '롤링금', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'casino.rolling_total', 
        header: '롤링금합계', 
        width: 120,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'casino.final_profit_loss', 
        header: '베팅-당첨-롤링금', 
        width: 140,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
      { 
        id: 'casino.losing', 
        header: '루징', 
        width: 100,
        align: 'right',
        sortable: true,
        type: 'currency'
      },
    ],
  },
  // 합계 그룹
  {
    id: 'total',
    type: 'group',
    header: '합계',
    children: [
      { 
        id: 'total.betting', 
        header: '베팅', 
        width: 100,
        align: 'right',
        sortable: true
      },
      { 
        id: 'total.winning', 
        header: '당첨', 
        width: 100,
        align: 'right',
        sortable: true
      },
      { 
        id: 'total.rolling_amount', 
        header: '롤링금', 
        width: 100,
        align: 'right',
        sortable: true
      },
      { 
        id: 'total.rolling_total', 
        header: '롤링금합계', 
        width: 120,
        align: 'right',
        sortable: true
      },
      { 
        id: 'total.final_profit_loss', 
        header: '베팅-당첨-롤링금', 
        width: 140,
        align: 'right',
        sortable: true
      },
      { 
        id: 'total.losing', 
        header: '루징', 
        width: 100,
        align: 'right',
        sortable: true
      },
    ],
  },
  {
    id: 'last_balance',
    header: '마지막보유금',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
  },
  {
    id: 'last_rolling_amount',
    header: '마지막롤링금',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
  },
]; 

// 동적 당일정산 데이터 생성 함수
export const generateSettlementData = (dynamicTypes, dynamicTypeHierarchy) => {
  if (!dynamicTypes || Object.keys(dynamicTypes).length === 0) {
    return []; // 동적 유형이 없으면 빈 배열 반환
  }

  const typeKeys = Object.keys(dynamicTypes);
  const settlementData = [];

  // 각 유형별로 정산 데이터 생성
  typeKeys.forEach((typeKey, index) => {
    const type = dynamicTypes[typeKey];
    
    // 상위 유형들 계산
    const getParentTypes = (currentTypeKey) => {
      const parents = [];
      const findParents = (key, visited = new Set()) => {
        if (visited.has(key)) return;
        visited.add(key);
        
        Object.entries(dynamicTypeHierarchy).forEach(([parentKey, children]) => {
          if (children.includes(key) && !visited.has(parentKey)) {
            const parentType = dynamicTypes[parentKey];
            parents.unshift({ 
              label: parentType?.label || parentKey, 
              color: parentType?.color || 'default',
              backgroundColor: parentType?.backgroundColor,
              borderColor: parentType?.borderColor
            });
            findParents(parentKey, visited);
          }
        });
      };
      findParents(currentTypeKey);
      return parents;
    };

    const parentTypes = getParentTypes(typeKey);
    
    // 각 유형별로 2명의 정산 데이터 생성
    for (let i = 0; i < 2; i++) {
      const memberId = index * 10 + i + 1;
      
      // 랜덤 데이터 생성을 위한 헬퍼 함수들
      const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const randomPercent = () => Math.round(Math.random() * 10 * 10) / 10; // 0.0 ~ 10.0%
      
      // 슬롯 데이터 생성
      const slotBetting = randomAmount(100000, 5000000);
      const slotWinning = randomAmount(50000, slotBetting);
      const slotBettingWinning = slotBetting - slotWinning;
      const slotRollingPercent = randomPercent();
      const slotRollingAmount = Math.floor(slotBetting * slotRollingPercent / 100);
      const slotRollingTotal = slotRollingAmount;
      const slotFinalProfitLoss = slotBettingWinning - slotRollingAmount;
      const slotLosing = slotBettingWinning > 0 ? slotBettingWinning : 0;
      
      // 카지노 데이터 생성
      const casinoBetting = randomAmount(50000, 3000000);
      const casinoWinning = randomAmount(25000, casinoBetting);
      const casinoBettingWinning = casinoBetting - casinoWinning;
      const casinoRollingPercent = randomPercent();
      const casinoRollingAmount = Math.floor(casinoBetting * casinoRollingPercent / 100);
      const casinoRollingTotal = casinoRollingAmount;
      const casinoFinalProfitLoss = casinoBettingWinning - casinoRollingAmount;
      const casinoLosing = casinoBettingWinning > 0 ? casinoBettingWinning : 0;
      
      // 입출 데이터 생성
      const chargeAmount = randomAmount(500000, 3000000);
      const exchangeAmount = randomAmount(100000, 2000000);
      const depositWithdrawalProfitLoss = chargeAmount - exchangeAmount;
      
      // 합계 계산
      const totalBetting = slotBetting + casinoBetting;
      const totalWinning = slotWinning + casinoWinning;
      const totalRollingAmount = slotRollingAmount + casinoRollingAmount;
      const totalRollingTotal = slotRollingTotal + casinoRollingTotal;
      const totalFinalProfitLoss = slotFinalProfitLoss + casinoFinalProfitLoss;
      const totalLosing = slotLosing + casinoLosing;
      
      // 단계 정보 생성 (type 키를 기반으로 레벨 ID 생성)
      const levelId = parseInt(typeKey.replace(/\D/g, '')) || index + 1; // 숫자만 추출하거나 인덱스 사용
      
      settlementData.push({
        id: memberId,
        userId: `${typeKey}_user${i + 1}\n${type.label}${i + 1}`,
        username: `${typeKey}_user${i + 1}`, // MemberDetailDialog에서 사용
        nickname: `${type.label}${i + 1}`, // MemberDetailDialog에서 사용
        type: { 
          id: typeKey, // 필터링을 위한 id 추가
          label: type.label || typeKey, 
          color: type.color || 'default',
          backgroundColor: type.backgroundColor,
          borderColor: type.borderColor
        },
        parentTypes: parentTypes,
        agent_level_id: levelId, // 단계 필터링을 위한 레벨 ID 추가
        levelName: type.label || typeKey, // 단계 이름 추가
        
        // 입출 데이터
        deposit_withdrawal: {
          charge_amount: chargeAmount,
          exchange_amount: exchangeAmount,
          profit_loss: depositWithdrawalProfitLoss
        },
        
        // 슬롯 데이터
        slot: {
          betting: slotBetting,
          winning: slotWinning,
          betting_winning: slotBettingWinning,
          rolling_percent: slotRollingPercent,
          rolling_amount: slotRollingAmount,
          rolling_total: slotRollingTotal,
          final_profit_loss: slotFinalProfitLoss,
          losing: slotLosing
        },
        
        // 카지노 데이터
        casino: {
          betting: casinoBetting,
          winning: casinoWinning,
          betting_winning: casinoBettingWinning,
          rolling_percent: casinoRollingPercent,
          rolling_amount: casinoRollingAmount,
          rolling_total: casinoRollingTotal,
          final_profit_loss: casinoFinalProfitLoss,
          losing: casinoLosing
        },
        
        // 합계 데이터
        total: {
          betting: totalBetting,
          winning: totalWinning,
          rolling_amount: totalRollingAmount,
          rolling_total: totalRollingTotal,
          final_profit_loss: totalFinalProfitLoss,
          losing: totalLosing
        },
        
        // 마지막 데이터
        last_balance: randomAmount(1000000, 10000000),
        last_rolling_amount: randomAmount(50000, 500000),
        
        // MemberDetailDialog에서 필요한 추가 정보
        balance: randomAmount(1000000, 5000000),
        gameMoney: randomAmount(500000, 2000000),
        rollingPercent: slotRollingPercent,
        rollingAmount: slotRollingAmount,
        api: apiOptions[Math.floor(Math.random() * apiOptions.length)].value,
        deposit: chargeAmount,
        withdrawal: exchangeAmount,
        connectionStatus: ['온라인', '오프라인', '정지'][Math.floor(Math.random() * 3)],
        lastGame: `2024-01-${String(20 + Math.floor(Math.random() * 10)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        name: `${type.label}${i + 1}`,
        accountNumber: `${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        bank: bankList[Math.floor(Math.random() * bankList.length)],
        profitLoss: {
          slot: slotFinalProfitLoss,
          casino: casinoFinalProfitLoss,
          total: totalFinalProfitLoss
        },
        connectionDate: `2024-01-${String(20 + Math.floor(Math.random() * 10)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        registrationDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        description: `${type.label || typeKey} 계정입니다.`
      });
    }
  });

  return settlementData;
}; 