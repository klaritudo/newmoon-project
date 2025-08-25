// 회원생성 다이얼로그에서 사용하는 유틸리티 함수들과 초기 데이터

// 초기 회원 데이터
export const initialMemberData = {
  id: '',
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  email: '',
  parentId: '',
  level: 1,
  type: '',
  balance: 0,
  gameMoney: 0,
  rollingPercent: 0,
  rollingAmount: 0,
  api: '',
  deposit: 0,
  withdrawal: 0,
  connectionStatus: '오프라인',
  lastGame: '',
  accountNumber: '',
  bank: '',
  profitLoss: {
    slot: 0,
    casino: 0,
    total: 0
  },
  connectionDate: '',
  registrationDate: new Date().toISOString().split('T')[0],
  description: '',
  bulkCreation: false,
  isHeadquarters: false,
  memberPageUrlStandard: '',
  bettingStandard: '',
  agentManagerUrl: '',
  memberPageUrl: '',
  memo: '',
  // 추천인 설정 (선택사항)
  recommenderId: '',
  recommenderUsername: '',
  // 언어 설정
  language: '한국어',
  // 롤링 설정
  bulkRollingRate: {
    enabled: false,
    value: ''
  },
  laterRollingInput: true, // 기본값을 true로 변경
  rollingRates: {
    slot: '',
    casino: ''
  },
  // 루징 설정
  bulkLosingRate: {
    enabled: true,  // 기본값 true로 변경
    value: ''
  },
  laterLosingInput: true, // 기본값을 true로 변경
  losingRates: {
    slot: '',
    casino: '',
    minigame: ''
  },
  // 기타 필드들
  passwordConfirm: '',
  accountHolder: '',
  usernamePattern: {
    start: '',
    end: ''
  },
  slotBettingLimit: '',
  casinoBettingLimit: ''
};

// 은행 목록
export const banks = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '기업은행',
  '농협은행',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  '새마을금고',
  '신협',
  '우체국',
  '기타'
];

// 폼 입력 변경 핸들러
export const handleNewMemberChange = (event, newMemberData, setNewMemberData, formErrors, setFormErrors) => {
  // console.log('🎯 handleNewMemberChange 호출됨!', { event, target: event.target });
  
  const { name, value, type, checked } = event.target;
  
  // Switch, Checkbox 타입 처리 개선
  let newValue;
  if (type === 'checkbox' || event.target.tagName === 'INPUT' && event.target.role === 'switch') {
    newValue = checked;
  } else {
    newValue = value !== undefined ? value : '';
  }
  
  // console.log('🎯 변경 감지:', { name, type, value, checked, newValue });
  
  // 중첩된 객체 속성 처리
  if (name && name.includes('.')) {
    const keys = name.split('.');
    setNewMemberData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      // 마지막 키를 제외한 모든 키에 대해 중첩된 객체 생성/복사
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      // 마지막 키에 값 설정
      const lastKey = keys[keys.length - 1];
      current[lastKey] = newValue;
      return newData;
    });
  } else {
    // 단순 속성 처리
    setNewMemberData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      return updated;
    });
  }
  
  // 롤링% 검증
  if (name && name.includes('rollingRates')) {
    const inputValue = parseFloat(newValue) || 0;
    
    if (name.includes('slot') && newMemberData.parentRollingPercent?.slot > 0) {
      if (inputValue > newMemberData.parentRollingPercent.slot) {
        setFormErrors(prev => ({
          ...prev,
          [name]: `상위 회원의 슬롯 롤링%(${newMemberData.parentRollingPercent.slot}%)를 초과할 수 없습니다.`
        }));
        return;
      }
    } else if (name.includes('casino') && newMemberData.parentRollingPercent?.casino > 0) {
      if (inputValue > newMemberData.parentRollingPercent.casino) {
        setFormErrors(prev => ({
          ...prev,
          [name]: `상위 회원의 카지노 롤링%(${newMemberData.parentRollingPercent.casino}%)를 초과할 수 없습니다.`
        }));
        return;
      }
    }
  } else if (name === 'bulkRollingRate.value') {
    const inputValue = parseFloat(newValue) || 0;
    const maxParentRolling = Math.max(
      newMemberData.parentRollingPercent?.slot || 0,
      newMemberData.parentRollingPercent?.casino || 0
    );
    
    if (maxParentRolling > 0 && inputValue > maxParentRolling) {
      setFormErrors(prev => ({
        ...prev,
        [name]: `상위 회원의 최대 롤링%(${maxParentRolling}%)를 초과할 수 없습니다.`
      }));
      return;
    }
  }
  
  // 해당 필드의 에러 제거
  if (formErrors && formErrors[name]) {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};

// 폼 검증 함수
const validateForm = (data) => {
  const errors = {};
  
  if (!data.username.trim()) {
    errors.username = '아이디를 입력해주세요.';
  }
  
  if (!data.nickname.trim()) {
    errors.nickname = '닉네임을 입력해주세요.';
  }
  
  if (!data.password.trim()) {
    errors.password = '비밀번호를 입력해주세요.';
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
  }
  
  if (!data.name.trim()) {
    errors.name = '이름을 입력해주세요.';
  }
  
  if (!data.phone.trim()) {
    errors.phone = '전화번호를 입력해주세요.';
  }
  
  if (!data.parentId) {
    errors.parentId = '상부를 선택해주세요.';
  }
  
  if (!data.bank) {
    errors.bank = '은행을 선택해주세요.';
  }
  
  if (!data.accountNumber.trim()) {
    errors.accountNumber = '계좌번호를 입력해주세요.';
  }
  
  return errors;
};

// 폼 제출 핸들러
export const handleSubmit = (newMemberData, onCreateMember, onClose, setFormErrors) => {
  const errors = validateForm(newMemberData);
  
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  
  // 회원 데이터 준비
  const memberData = {
    ...newMemberData,
    id: Date.now(), // 임시 ID 생성
    registrationDate: new Date().toISOString().split('T')[0],
    connectionDate: new Date().toISOString(),
    profitLoss: {
      ...newMemberData.profitLoss,
      total: newMemberData.profitLoss.slot + newMemberData.profitLoss.casino
    }
  };
  
  // 생성 콜백 호출
  if (typeof onCreateMember === 'function') {
    onCreateMember(memberData);
  }
  
  // 다이얼로그 닫기
  if (typeof onClose === 'function') {
    onClose();
  }
};

// URL 추가 핸들러
export const handleAddUrl = (newMemberData, setNewMemberData) => {
  const urls = newMemberData.memberPageUrl ? newMemberData.memberPageUrl.split('\n') : [];
  urls.push('');
  
  setNewMemberData(prev => ({
    ...prev,
    memberPageUrl: urls.join('\n')
  }));
};

// 폼 초기화 함수
export const resetForm = (setNewMemberData, setFormErrors) => {
  if (typeof setNewMemberData === 'function') {
    setNewMemberData({ ...initialMemberData });
  }
  if (typeof setFormErrors === 'function') {
    setFormErrors({});
  }
}; 