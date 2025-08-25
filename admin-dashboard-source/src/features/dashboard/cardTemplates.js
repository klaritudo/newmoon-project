/**
 * 동적 카드 템플릿 시스템
 * DB의 에이전트 레벨에 따라 카드를 동적으로 생성합니다.
 */

// 카드 타입별 템플릿 정의
export const CARD_TEMPLATES = {
  // 기본 통계 카드 템플릿
  BASIC_STATS: [
    {
      key: 'betting',
      titleSuffix: '베팅금',
      icon: 'MoneyIcon',
      color: 'blue',
      visible: true,
      baseValue: 865420000,
      basePreviousValue: 810000000,
      suffix: '원'
    },
    {
      key: 'winning',
      titleSuffix: '당첨금',
      icon: 'PaidIcon',
      color: 'green',
      visible: true,
      baseValue: 782160000,
      basePreviousValue: 724000000,
      suffix: '원'
    },
    {
      key: 'bettingProfit',
      titleSuffix: '베팅손익',
      icon: 'TrendingUpIcon',
      color: 'purple',
      visible: true,
      baseValue: 83260000,
      basePreviousValue: 79000000,
      suffix: '원'
    },
    {
      key: 'deposit',
      titleSuffix: '입금액',
      icon: 'CallReceivedIcon',
      color: 'green',
      visible: true,
      baseValue: 215680000,
      basePreviousValue: 187000000,
      suffix: '원'
    },
    {
      key: 'withdrawal',
      titleSuffix: '환전액',
      icon: 'CallMadeIcon',
      color: 'amber',
      visible: true,
      baseValue: 175420000,
      basePreviousValue: 163900000,
      suffix: '원'
    },
    {
      key: 'depositWithdrawalProfit',
      titleSuffix: '충환손익',
      icon: 'AccountBalanceWalletIcon',
      color: 'orange',
      visible: true,
      baseValue: 40260000,
      basePreviousValue: 39000000,
      suffix: '원'
    },
    {
      key: 'rolling',
      titleSuffix: '롤링금',
      icon: 'AutorenewIcon',
      color: 'green',
      visible: true,
      baseValue: 125320000,
      basePreviousValue: 115000000,
      suffix: '원'
    },
    {
      key: 'settlement',
      titleSuffix: '정산',
      icon: 'AccountBalanceIcon',
      color: 'blue',
      visible: false,
      baseValue: 62180000,
      basePreviousValue: 58200000,
      suffix: '원'
    }
  ],

  // 상위 레벨용 추가 카드 템플릿 (슈퍼관리자, 본사 등)
  MANAGEMENT_STATS: [
    {
      key: 'totalProfit',
      titleSuffix: '총손익',
      icon: 'ShowChartIcon',
      color: 'red',
      visible: true,
      baseValue: 42060000,
      basePreviousValue: 39300000,
      suffix: '원'
    },
    {
      key: 'rtp',
      titleSuffix: 'RTP',
      icon: 'PercentIcon',
      color: 'red',
      visible: true,
      baseValue: 90.38,
      basePreviousValue: 88.65,
      suffix: '%'
    }
  ]
};

// 레벨별 카드 표시 규칙 정의
export const LEVEL_CARD_RULES = {
  // 슈퍼관리자 (레벨 1): 모든 카드 표시
  1: {
    templates: ['BASIC_STATS', 'MANAGEMENT_STATS'],
    defaultVisible: true,
    displayName: '본인'
  },
  
  // 일반적인 관리 레벨 (레벨 2-7): 기본 카드만
  default: {
    templates: ['BASIC_STATS'],
    defaultVisible: false,
    excludeKeys: ['totalProfit', 'rtp'] // 상위 관리 기능 제외
  },
  
  // 회원 레벨 (레벨 8 이상): 제한된 카드만
  member: {
    templates: ['BASIC_STATS'],
    defaultVisible: false,
    includeKeys: ['deposit', 'withdrawal', 'depositWithdrawalProfit', 'rolling'],
    displayName: '회원'
  }
};

/**
 * 동적 타입 키 생성
 * @param {number} levelId - 레벨 ID
 * @returns {string} 동적 타입 키 (agent_level_1, agent_level_2, ...)
 */
export const generateTypeKey = (levelId) => `agent_level_${levelId}`;

/**
 * 카드 ID 생성
 * @param {string} typeKey - 타입 키 (agent_level_1, agent_level_2, ...)
 * @param {string} cardKey - 카드 키 (betting, winning, ...)
 * @returns {string} 카드 ID
 */
export const generateCardId = (typeKey, cardKey) => `${typeKey}_${cardKey}`;

/**
 * 레벨 정보를 기반으로 표시명 생성
 * @param {Object} level - 에이전트 레벨 객체
 * @returns {string} 표시명
 */
export const generateDisplayName = (level) => {
  // name 또는 levelType 필드 사용 (실제 데이터 구조에 맞춤)
  const displayName = level?.name || level?.levelType;
  if (!displayName) return `레벨 ${level?.id || ''}`;
  
  return displayName;
};

/**
 * 카드 값에 레벨별 변동 적용
 * @param {number} baseValue - 기본 값
 * @param {number} levelId - 레벨 ID
 * @param {string} cardKey - 카드 키
 * @returns {number} 조정된 값
 */
export const applyLevelVariation = (baseValue, levelId, cardKey) => {
  // 레벨에 따른 값 변동 비율 (실제 비즈니스 로직에 맞게 조정)
  const levelMultipliers = {
    1: 1.0,    // 슈퍼관리자 - 기본값
    2: 0.9,    // 본사
    3: 0.85,   // 부본사
    4: 0.8,    // 부본사21
    5: 0.75,   // 마스터총판34
    6: 0.7,    // 총판11
    7: 0.65,   // 매장99
    8: 0.6,    // 회원Lv1
    // 추가 레벨들...
  };
  
  const multiplier = levelMultipliers[levelId] || 0.5;
  
  // 카드 타입별 추가 조정
  const cardMultipliers = {
    betting: 1.0,
    winning: 0.9,
    deposit: 0.8,
    withdrawal: 0.75,
    rolling: 0.85,
    settlement: 0.7
  };
  
  const cardMultiplier = cardMultipliers[cardKey] || 1.0;
  
  return Math.round(baseValue * multiplier * cardMultiplier);
};

/**
 * 레벨에 따라 카드가 표시되어야 하는지 확인
 * @param {number} levelId - 레벨 ID
 * @param {string} cardKey - 카드 키
 * @returns {boolean} 표시 여부
 */
export const shouldShowCard = (levelId, cardKey) => {
  // 슈퍼관리자는 모든 카드 표시
  if (levelId === 1) return true;
  
  // 회원 레벨은 제한된 카드만
  if (levelId >= 8) {
    const memberAllowedCards = ['deposit', 'withdrawal', 'depositWithdrawalProfit', 'rolling'];
    return memberAllowedCards.includes(cardKey);
  }
  
  // 관리 레벨은 관리용 카드 제외
  const managementOnlyCards = ['totalProfit', 'rtp'];
  return !managementOnlyCards.includes(cardKey);
};