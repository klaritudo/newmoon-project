// 머니이동내역 페이지용 설정 데이터

// 경로 옵션
export const routeOptions = [
  { value: 'deposit', label: '입금처리' },
  { value: 'withdraw', label: '출금처리' },
  { value: 'game_to_balance', label: '게임머니→보유금' },
  { value: 'balance_to_game', label: '보유금→게임머니' },
  { value: 'bonus', label: '보너스지급' },
  { value: 'penalty', label: '차감처리' },
  { value: 'transfer_in', label: '타회원입금' },
  { value: 'transfer_out', label: '타회원출금' }
];

// 경로별 칩 스타일 정의
export const getRouteChipStyle = (route) => {
  switch (route) {
    case '입금처리':
      return { color: 'success', variant: 'outlined' };
    case '출금처리':
      return { color: 'error', variant: 'outlined' };
    case '게임머니→보유금':
      return { color: 'info', variant: 'outlined' };
    case '보유금→게임머니':
      return { color: 'warning', variant: 'outlined' };
    case '보너스지급':
      return { color: 'primary', variant: 'outlined' };
    case '차감처리':
      return { color: 'secondary', variant: 'outlined' };
    case '타회원입금':
      return { color: 'success', variant: 'outlined' };
    case '타회원출금':
      return { color: 'error', variant: 'outlined' };
    default:
      return { color: 'default', variant: 'outlined' };
  }
};

// 머니이동내역 샘플 데이터 생성 함수 
// 실제 운영에서는 서버 API를 통해 데이터를 받아옵니다.
export const generateMoneyTransferData = (dynamicTypes = {}, dynamicTypeHierarchy = {}, membersData = []) => {
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

  // 실제 회원 데이터를 기반으로 머니이동내역 생성
  membersData.forEach((member, index) => {
    // 각 회원당 0-4개의 랜덤한 머니이동내역 생성
    const transactionCount = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionId = index * 10 + i + 1;
      const route = routeOptions[Math.floor(Math.random() * routeOptions.length)];
      
      // 이동금액과 잔액 계산
      const transferAmount = Math.floor(Math.random() * 1000000) + 10000;
      const balanceAmount = Math.floor(Math.random() * 3000000) + 500000;
      const gameMoneyAmount = Math.floor(Math.random() * 2000000) + 100000;
      
      // 경로 칩 스타일 적용
      const routeStyle = getRouteChipStyle(route.label);
      
      // 회원 데이터의 parentTypes를 superAgent로 직접 사용
      const superAgent = member.parentTypes || [];
      
      data.push({
        id: transactionId,
        userId: `${member.username}\n${member.nickname}`, // 줄바꿈 형태로 변경
        username: member.username, // 실제 회원 데이터의 아이디
        nickname: member.nickname, // 실제 회원 데이터의 닉네임
        superAgent: superAgent, // 실제 계층 구조에서 추출한 상위에이전트
        memberType: member.type, // 회원 유형 추가
        transferAmount: transferAmount,
        balanceAmount: balanceAmount,
        gameMoneyAmount: gameMoneyAmount,
        route: {
          label: route.label,
          color: routeStyle.color,
          variant: routeStyle.variant
        },
        processTime: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      });
    }
  });
  
  return data;
};

// 머니이동내역 컬럼 정의
export const moneyTransferColumns = [
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
    type: 'custom',
    cellRenderer: 'parentChips',
    width: 200,
    sortable: false,
    pinnable: true
  },
  {
    id: 'memberType',
    header: '유형',
    type: 'hierarchical',
    cellRenderer: 'chip',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'transferAmount',
    header: '이동금액',
    type: 'currency',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'balanceAmount',
    header: '보유금액',
    type: 'currency',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'gameMoneyAmount',
    header: '게임머니',
    type: 'currency',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'route',
    header: '경로',
    type: 'chip',
    width: 150,
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