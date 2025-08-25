// 머니처리내역 페이지용 설정 데이터

// 타입 옵션
export const typeOptions = [
  { value: 'deposit', label: '입금' },
  { value: 'withdrawal', label: '출금' },
  { value: 'bonus', label: '보너스' },
  { value: 'penalty', label: '차감' },
  { value: 'adjustment', label: '조정' }
];

// 타입별 칩 스타일 정의
export const getTypeChipStyle = (type) => {
  switch (type) {
    case '입금':
      return { color: 'success', variant: 'outlined' };
    case '출금':
      return { color: 'error', variant: 'outlined' };
    case '보너스':
      return { color: 'primary', variant: 'outlined' };
    case '차감':
      return { color: 'warning', variant: 'outlined' };
    case '조정':
      return { color: 'info', variant: 'outlined' };
    default:
      return { color: 'default', variant: 'outlined' };
  }
};

// 처리자 옵션
export const processorOptions = [
  { value: 'admin1', label: '관리자1' },
  { value: 'admin2', label: '관리자2' },
  { value: 'admin3', label: '관리자3' },
  { value: 'system', label: '시스템' }
];

// 머니처리내역 샘플 데이터 생성 함수 
// 실제 운영에서는 서버 API를 통해 데이터를 받아옵니다.
export const generateMoneyHistoryData = (dynamicTypes = {}, dynamicTypeHierarchy = {}, membersData = []) => {
  // 동적 유형이나 회원 데이터가 없으면 빈 배열 반환
  if (Object.keys(dynamicTypes).length === 0 || membersData.length === 0) {
    return [];
  }
  
  const data = [];
  
  // 상위 계층 정보 계산 함수
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

  // 실제 회원 데이터를 기반으로 머니처리내역 생성
  membersData.forEach((member, index) => {
    // 각 회원당 0-3개의 랜덤한 머니처리내역 생성
    const transactionCount = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionId = index * 10 + i + 1;
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
      const processor = processorOptions[Math.floor(Math.random() * processorOptions.length)];
      
      // 처리 전후 금액 계산
      const beforeBalance = Math.floor(Math.random() * 3000000) + 500000;
      const processAmount = Math.floor(Math.random() * 500000) + 50000;
      
      // 타입에 따라 처리후 금액 계산
      let afterBalance;
      if (type.value === 'deposit' || type.value === 'bonus') {
        afterBalance = beforeBalance + processAmount;
      } else {
        afterBalance = beforeBalance - processAmount;
      }
      
      // 타입 칩 스타일 적용
      const typeStyle = getTypeChipStyle(type.label);
      
      // 회원 데이터의 parentTypes를 superAgent로 직접 사용
      const superAgent = member.parentTypes || [];
      
      data.push({
        id: transactionId,
        userId: `${member.username}\n${member.nickname}`, // 줄바꿈 형태로 변경
        username: member.username, // 실제 회원 데이터의 아이디
        nickname: member.nickname, // 실제 회원 데이터의 닉네임
        superAgent: superAgent, // 실제 계층 구조에서 추출한 상위에이전트
        memberType: member.type, // 회원 유형 추가
        processAmount: processAmount,
        beforeBalance: beforeBalance,
        afterBalance: afterBalance,
        type: {
          label: type.label,
          color: typeStyle.color,
          variant: typeStyle.variant
        },
        processor: processor.label,
        processTime: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      });
    }
  });
  
  return data;
};

// 머니처리내역 컬럼 정의
export const moneyHistoryColumns = [
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
    align: 'center',
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
  {
    id: 'superAgent',
    header: '상위에이전트',
    type: 'horizontal',
    width: 200,
    sortable: true,
    pinnable: true
  },
  {
    id: 'memberType',
    header: '유형',
    type: 'chip',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processAmount',
    header: '처리금',
    type: 'currency',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'beforeBalance',
    header: '처리전보유금',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'afterBalance',
    header: '처리후보유금',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'type',
    header: '타입',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processor',
    header: '처리자',
    type: 'default',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processTime',
    header: '처리시간',
    type: 'default',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  }
]; 