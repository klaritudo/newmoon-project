// 입출금 관련 페이지용 설정 데이터

// 상태 옵션
export const transactionStatusOptions = [
  { value: 'completed', label: '완료' },
  { value: 'pending', label: '대기' },
  { value: 'suspended', label: '중지' }
];

// 상태별 칩 스타일 정의
export const getTransactionStatusChipStyle = (status) => {
  switch (status) {
    case '완료':
      return { color: 'success', variant: 'outlined' };
    case '대기':
      return { color: 'warning', variant: 'outlined' };
    case '중지':
      return { color: 'error', variant: 'outlined' };
    default:
      return { color: 'default', variant: 'outlined' };
  }
};

// 수단별 칩 스타일 정의
export const getPaymentMethodChipStyle = (paymentMethod) => {
  switch (paymentMethod) {
    case '무통장':
      return { color: 'primary', variant: 'outlined' };
    case '수동처리':
      return { color: 'secondary', variant: 'outlined' };
    case '가상화폐':
      return { color: 'warning', variant: 'outlined' };
    case '가상계좌':
      return { color: 'info', variant: 'outlined' };
    case '상품권':
      return { color: 'success', variant: 'outlined' };
    case '쿠폰':
      return { color: 'error', variant: 'outlined' };
    default:
      return { color: 'default', variant: 'outlined' };
  }
};

// 수단 옵션
export const paymentMethodOptions = [
  { value: 'bank_transfer', label: '무통장' },
  { value: 'manual', label: '수동처리' },
  { value: 'crypto', label: '가상화폐' },
  { value: 'virtual_account', label: '가상계좌' },
  { value: 'gift_card', label: '상품권' },
  { value: 'coupon', label: '쿠폰' }
];

// 처리자 옵션
export const processorOptions = [
  { value: 'admin1', label: '관리자1' },
  { value: 'admin2', label: '관리자2' },
  { value: 'admin3', label: '관리자3' },
  { value: 'system', label: '시스템' }
];

// 은행 목록
export const bankList = [
  '국민은행', '신한은행', '우리은행', '하나은행', 'KEB하나은행',
  '농협은행', '기업은행', '카카오뱅크', '토스뱅크', '케이뱅크'
];

// 입출금 데이터 생성 함수
export const generateTransactionData = (dynamicTypes = {}, dynamicTypeHierarchy = {}, membersData = [], transactionType = 'deposit') => {
  // 동적 유형이나 회원 데이터가 없으면 빈 배열 반환
  if (Object.keys(dynamicTypes).length === 0 || membersData.length === 0) {
    return [];
  }
  
  // 시드 기반 랜덤 함수 (안정적인 데이터 생성을 위해)
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
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

  // 실제 회원 데이터를 기반으로 입출금 내역 생성
  membersData.forEach((member, index) => {
    // 각 회원당 1-3개의 거래 내역 생성 (시드 기반)
    const transactionCount = Math.floor(seededRandom(member.id * 100) * 3) + 1;
    
    for (let i = 0; i < transactionCount; i++) {
      // 거래 타입에 따라 ID 범위 설정 (입금: 1000번대, 출금: 2000번대, 충환: 3000번대)
      let baseId;
      switch (transactionType) {
        case 'deposit':
          baseId = 1000;
          break;
        case 'withdrawal':
          baseId = 2000;
          break;
        case 'history':
          baseId = 3000;
          break;
        default:
          baseId = 1000;
      }
      
      const transactionId = baseId + (index * 10) + i + 1;
      const seed = transactionId * 1000; // 고정된 시드 값
      
      const status = transactionStatusOptions[Math.floor(seededRandom(seed + 1) * transactionStatusOptions.length)];
      const paymentMethod = paymentMethodOptions[Math.floor(seededRandom(seed + 2) * paymentMethodOptions.length)];
      const processor = processorOptions[Math.floor(seededRandom(seed + 3) * processorOptions.length)];
      
      // 거래 금액 계산
      const applicationAmount = Math.floor(seededRandom(seed + 4) * 1000000) + 100000;
      const previousBalance = Math.floor(seededRandom(seed + 5) * 3000000) + 500000;
      const afterBalance = transactionType === 'deposit' 
        ? previousBalance + applicationAmount 
        : previousBalance - applicationAmount;
      
      const processorBalance = Math.floor(seededRandom(seed + 6) * 10000000) + 5000000;
      
      // 상태 칩 스타일 적용
      const statusStyle = getTransactionStatusChipStyle(status.label);
      
      // 수단 칩 스타일 적용
      const paymentMethodStyle = getPaymentMethodChipStyle(paymentMethod.label);
      
      // 회원 데이터의 parentTypes를 superAgent로 직접 사용
      const superAgent = member.parentTypes || [];
      
      // 계좌번호 생성
      const accountNumber = `${String(Math.floor(seededRandom(seed + 7) * 900) + 100)}-${String(Math.floor(seededRandom(seed + 8) * 900) + 100)}-${String(Math.floor(seededRandom(seed + 9) * 900000) + 100000)}`;
      const bank = bankList[Math.floor(seededRandom(seed + 10) * bankList.length)];
      
      // 시간 생성
      const applicationTime = `2024-01-${String(Math.floor(seededRandom(seed + 11) * 28) + 1).padStart(2, '0')} ${String(Math.floor(seededRandom(seed + 12) * 24)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 13) * 60)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 14) * 60)).padStart(2, '0')}`;
      const processTime = status.label === '완료' 
        ? `2024-01-${String(Math.floor(seededRandom(seed + 15) * 28) + 1).padStart(2, '0')} ${String(Math.floor(seededRandom(seed + 16) * 24)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 17) * 60)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 18) * 60)).padStart(2, '0')}`
        : '-';
      
      data.push({
        id: transactionId,
        userId: `${member.username}\n${member.nickname}`, // 줄바꿈 형태로 변경
        username: member.username, // 실제 회원 데이터의 아이디
        nickname: member.nickname, // 실제 회원 데이터의 닉네임
        superAgent: superAgent, // 실제 계층 구조에서 추출한 상위에이전트
        memberType: member.type, // 회원 유형
        applicationAmount: applicationAmount, // 신청금액
        previousBalance: previousBalance, // 이전보유금액
        afterBalance: afterBalance, // 이후보유금액
        paymentMethod: {
          label: paymentMethod.label,
          color: paymentMethodStyle.color,
          variant: paymentMethodStyle.variant
        }, // 수단 (칩 스타일)
        processorBalance: processorBalance, // 처리자보유금
        accountNumber: accountNumber, // 계좌번호
        bank: bank, // 은행
        accountHolder: member.name || member.nickname, // 예금주
        applicationTime: applicationTime, // 신청시간
        processTime: processTime, // 처리시간
        processor: `${processor.label}\n(${processor.value})`, // 처리자 (아이디(닉네임) 스타일)
        processorBalanceAfter: processorBalance + (Math.floor(seededRandom(seed + 19) * 200000) - 100000), // 처리자보유금 (처리 후)
        status: {
          label: status.label,
          color: statusStyle.color,
          variant: statusStyle.variant
        }
      });
    }
  });
  
  return data;
};

// 입출금 관련 컬럼 정의 (17개 컬럼)
export const transactionColumns = [
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
    width: 180,
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
    id: 'applicationAmount',
    header: '신청금액',
    type: 'currency',
    width: 120,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'previousBalance',
    header: '이전보유금액',
    type: 'currency',
    width: 130,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'afterBalance',
    header: '이후보유금액',
    type: 'currency',
    width: 130,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'paymentMethod',
    header: '수단',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processorBalance',
    header: '처리자보유금',
    type: 'currency',
    width: 130,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'accountNumber',
    header: '계좌번호',
    type: 'default',
    width: 150,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'bank',
    header: '은행',
    type: 'default',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'accountHolder',
    header: '예금주',
    type: 'default',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'applicationTime',
    header: '신청시간',
    type: 'default',
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
  },
  {
    id: 'processor',
    header: '처리자',
    type: 'multiline',
    width: 120,
    align: 'center',
    sortable: true,
    pinnable: true
  },
  {
    id: 'processorBalanceAfter',
    header: '처리자보유금',
    type: 'currency',
    width: 130,
    align: 'right',
    sortable: true,
    pinnable: true
  },
  {
    id: 'status',
    header: '상태',
    type: 'chip',
    width: 100,
    align: 'center',
    sortable: true,
    pinnable: true
  }
]; 