/**
 * 동적 카드 생성 유틸리티
 * DB의 에이전트 레벨 데이터를 기반으로 카드를 자동 생성합니다.
 */

import {
  CARD_TEMPLATES,
  LEVEL_CARD_RULES,
  generateTypeKey,
  generateCardId,
  generateDisplayName,
  applyLevelVariation,
  shouldShowCard
} from './cardTemplates';

/**
 * 에이전트 레벨 데이터를 기반으로 모든 카드 생성
 * @param {Array} agentLevels - 에이전트 레벨 배열
 * @returns {Array} 생성된 카드 배열
 */
export const generateAllCards = (agentLevels) => {
  if (!Array.isArray(agentLevels) || agentLevels.length === 0) {
    console.warn('⚠️ generateAllCards: agentLevels가 비어있습니다.');
    return [];
  }

  const cards = [];
  
  // 각 레벨별로 카드 생성
  agentLevels.forEach(level => {
    const levelCards = generateCardsForLevel(level);
    cards.push(...levelCards);
  });
  
  console.log(`✅ 총 ${cards.length}개 카드가 ${agentLevels.length}개 레벨에 대해 생성되었습니다.`);
  
  return cards;
};

/**
 * 특정 레벨에 대한 카드 생성
 * @param {Object} level - 에이전트 레벨 객체
 * @returns {Array} 해당 레벨의 카드 배열
 */
export const generateCardsForLevel = (level) => {
  if (!level?.id) {
    console.warn('⚠️ generateCardsForLevel: 유효하지 않은 level 객체', level);
    return [];
  }

  const typeKey = generateTypeKey(level.id);
  const displayName = generateDisplayName(level);
  const cards = [];
  
  // 레벨별 규칙 가져오기
  const rules = getLevelRules(level.id);
  
  // 각 템플릿에서 카드 생성
  rules.templates.forEach(templateName => {
    const template = CARD_TEMPLATES[templateName];
    if (!template) {
      console.warn(`⚠️ 템플릿 '${templateName}'을 찾을 수 없습니다.`);
      return;
    }
    
    template.forEach(cardTemplate => {
      // 레벨별 카드 표시 규칙 확인
      if (!shouldShowCardForLevel(level.id, cardTemplate.key, rules)) {
        return;
      }
      
      const card = createCardFromTemplate(cardTemplate, level, typeKey, displayName);
      cards.push(card);
    });
  });
  
  console.log(`📊 레벨 ${level.id} (${displayName}): ${cards.length}개 카드 생성`);
  
  return cards;
};

/**
 * 템플릿을 기반으로 실제 카드 객체 생성
 * @param {Object} template - 카드 템플릿
 * @param {Object} level - 에이전트 레벨
 * @param {string} typeKey - 타입 키
 * @param {string} displayName - 표시명
 * @returns {Object} 카드 객체
 */
const createCardFromTemplate = (template, level, typeKey, displayName) => {
  const cardId = generateCardId(typeKey, template.key);
  
  // 레벨별 값 변동 적용
  const value = applyLevelVariation(template.baseValue, level.id, template.key);
  const previousValue = applyLevelVariation(template.basePreviousValue, level.id, template.key);
  
  // 카드 제목 생성 (레벨명 + 카드명)
  let title;
  if (level.id === 1) {
    // 슈퍼관리자는 접두사 없이
    title = template.titleSuffix;
  } else {
    // 다른 레벨은 레벨명 + 카드명
    title = `${displayName}${template.titleSuffix}`;
  }
  
  return {
    id: cardId,
    title,
    value,
    previousValue,
    suffix: template.suffix,
    type: typeKey,
    icon: template.icon,
    visible: getDefaultVisibility(level.id, template),
    color: template.color,
    // 메타데이터
    levelId: level.id,
    levelName: level.name,
    cardKey: template.key,
    displayName
  };
};

/**
 * 레벨별 규칙 가져오기
 * @param {number} levelId - 레벨 ID
 * @returns {Object} 레벨 규칙
 */
const getLevelRules = (levelId) => {
  // 특정 레벨 규칙이 있으면 사용
  if (LEVEL_CARD_RULES[levelId]) {
    return LEVEL_CARD_RULES[levelId];
  }
  
  // 회원 레벨 (8 이상)
  if (levelId >= 8) {
    return LEVEL_CARD_RULES.member;
  }
  
  // 기본 규칙
  return LEVEL_CARD_RULES.default;
};

/**
 * 레벨과 규칙에 따라 카드를 표시할지 결정
 * @param {number} levelId - 레벨 ID
 * @param {string} cardKey - 카드 키
 * @param {Object} rules - 레벨 규칙
 * @returns {boolean} 표시 여부
 */
const shouldShowCardForLevel = (levelId, cardKey, rules) => {
  // 전역 규칙 확인
  if (!shouldShowCard(levelId, cardKey)) {
    return false;
  }
  
  // includeKeys가 있으면 포함된 것만
  if (rules.includeKeys && !rules.includeKeys.includes(cardKey)) {
    return false;
  }
  
  // excludeKeys가 있으면 제외된 것 빼기
  if (rules.excludeKeys && rules.excludeKeys.includes(cardKey)) {
    return false;
  }
  
  return true;
};

/**
 * 기본 표시 여부 결정
 * @param {number} levelId - 레벨 ID
 * @param {Object} template - 카드 템플릿
 * @returns {boolean} 기본 표시 여부
 */
const getDefaultVisibility = (levelId, template) => {
  // 슈퍼관리자는 모든 카드 기본 표시
  if (levelId === 1) {
    return template.visible;
  }
  
  // 다른 레벨은 기본 숨김
  return false;
};

/**
 * 카드 타입별 그룹화
 * @param {Array} cards - 카드 배열
 * @returns {Object} 타입별로 그룹화된 카드 객체
 */
export const groupCardsByType = (cards) => {
  const groups = {};
  
  cards.forEach(card => {
    if (!groups[card.type]) {
      groups[card.type] = [];
    }
    groups[card.type].push(card);
  });
  
  return groups;
};

/**
 * 레벨 ID를 기반으로 타입별 표시명 생성
 * @param {Array} agentLevels - 에이전트 레벨 배열
 * @returns {Object} 타입별 표시명 객체
 */
export const generateTypeDisplayNames = (agentLevels) => {
  const displayNames = {};
  
  agentLevels.forEach(level => {
    const typeKey = generateTypeKey(level.id);
    displayNames[typeKey] = generateDisplayName(level);
  });
  
  return displayNames;
};

/**
 * 기존 카드와 새 카드를 병합 (상태 유지)
 * @param {Array} existingCards - 기존 카드 배열
 * @param {Array} newCards - 새로 생성된 카드 배열
 * @returns {Array} 병합된 카드 배열
 */
export const mergeCardsWithExisting = (existingCards, newCards) => {
  if (!Array.isArray(existingCards) || existingCards.length === 0) {
    return newCards;
  }
  
  // 기존 카드의 표시 상태를 맵으로 저장
  const visibilityMap = {};
  existingCards.forEach(card => {
    visibilityMap[card.id] = card.visible;
  });
  
  // 새 카드에 기존 표시 상태 적용
  return newCards.map(newCard => ({
    ...newCard,
    visible: visibilityMap.hasOwnProperty(newCard.id) 
      ? visibilityMap[newCard.id] 
      : newCard.visible
  }));
};