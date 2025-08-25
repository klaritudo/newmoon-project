/**
 * 비밀번호 관련 유틸리티 함수
 */

/**
 * 랜덤 비밀번호 생성
 * @param {number} length 비밀번호 길이 (기본값: 12)
 * @param {boolean} includeUpper 대문자 포함 여부 (기본값: true)
 * @param {boolean} includeLower 소문자 포함 여부 (기본값: true)
 * @param {boolean} includeNumbers 숫자 포함 여부 (기본값: true)
 * @param {boolean} includeSpecial 특수문자 포함 여부 (기본값: true)
 * @returns {string} 생성된 랜덤 비밀번호
 */
export const generateRandomPassword = (
  length = 12,
  includeUpper = true,
  includeLower = true,
  includeNumbers = true,
  includeSpecial = true
) => {
  // 각 문자 유형별 문자셋
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_-+=<>?';

  // 사용할 문자셋 결합
  let charset = '';
  if (includeUpper) charset += upperChars;
  if (includeLower) charset += lowerChars;
  if (includeNumbers) charset += numberChars;
  if (includeSpecial) charset += specialChars;

  // 문자셋이 비어있으면 기본값으로 소문자와 숫자 사용
  if (!charset) {
    charset = lowerChars + numberChars;
  }

  // 비밀번호 생성
  let password = '';
  
  // 각 문자 유형이 최소 1개 이상 포함되도록 보장
  if (includeUpper) {
    password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  }
  if (includeLower) {
    password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  }
  if (includeNumbers) {
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  }
  if (includeSpecial) {
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  }

  // 나머지 길이에 대해 랜덤 문자 생성
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // 생성된 비밀번호를 섞음
  return shuffleString(password);
};

/**
 * 문자열의 문자들을 무작위로 섞는 함수
 * @param {string} str 섞을 문자열
 * @returns {string} 섞인 문자열
 */
const shuffleString = (str) => {
  const arr = str.split('');
  
  // Fisher-Yates 셔플 알고리즘
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr.join('');
};

/**
 * 비밀번호 강도 검사
 * @param {string} password 검사할 비밀번호
 * @returns {Object} 비밀번호 강도 정보 ({score, message})
 */
export const checkPasswordStrength = (password) => {
  let score = 0;
  const feedback = [];
  
  // 길이 점수 (최대 40점)
  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;
  
  // 대문자 확인 (최대 15점)
  const upperRegex = /[A-Z]/g;
  const upperMatches = password.match(upperRegex) || [];
  const upperScore = Math.min(upperMatches.length * 3, 15);
  score += upperScore;
  
  // 소문자 확인 (최대 15점)
  const lowerRegex = /[a-z]/g;
  const lowerMatches = password.match(lowerRegex) || [];
  const lowerScore = Math.min(lowerMatches.length * 3, 15);
  score += lowerScore;
  
  // 숫자 확인 (최대 15점)
  const numberRegex = /[0-9]/g;
  const numberMatches = password.match(numberRegex) || [];
  const numberScore = Math.min(numberMatches.length * 3, 15);
  score += numberScore;
  
  // 특수문자 확인 (최대 15점)
  const specialRegex = /[^A-Za-z0-9]/g;
  const specialMatches = password.match(specialRegex) || [];
  const specialScore = Math.min(specialMatches.length * 3, 15);
  score += specialScore;
  
  // 피드백 생성
  if (password.length < 8) {
    feedback.push("비밀번호는 최소 8자 이상이어야 합니다.");
  }
  if (!upperMatches.length) {
    feedback.push("대문자를 포함하세요.");
  }
  if (!lowerMatches.length) {
    feedback.push("소문자를 포함하세요.");
  }
  if (!numberMatches.length) {
    feedback.push("숫자를 포함하세요.");
  }
  if (!specialMatches.length) {
    feedback.push("특수문자를 포함하세요.");
  }
  
  // 결과 반환
  let message = "";
  if (score >= 80) {
    message = "매우 강함";
  } else if (score >= 60) {
    message = "강함";
  } else if (score >= 40) {
    message = "보통";
  } else if (score >= 20) {
    message = "약함";
  } else {
    message = "매우 약함";
  }
  
  return {
    score,
    message,
    feedback,
    color: 
      score >= 80 ? "#00C853" :  // 녹색 (매우 강함)
      score >= 60 ? "#64DD17" :  // 밝은 녹색 (강함)
      score >= 40 ? "#FFD600" :  // 노란색 (보통)
      score >= 20 ? "#FF9100" :  // 주황색 (약함)
                   "#FF1744"     // 빨간색 (매우 약함)
  };
};

/**
 * 비밀번호 유효성 검사
 * @param {string} password 검사할 비밀번호
 * @param {Object} options 검사 옵션
 * @param {number} options.minLength 최소 길이 (기본값: 8)
 * @param {boolean} options.requireUpper 대문자 필수 여부 (기본값: true)
 * @param {boolean} options.requireLower 소문자 필수 여부 (기본값: true)
 * @param {boolean} options.requireNumbers 숫자 필수 여부 (기본값: true)
 * @param {boolean} options.requireSpecial 특수문자 필수 여부 (기본값: true)
 * @returns {Object} 검사 결과 ({isValid, errors})
 */
export const validatePassword = (
  password,
  {
    minLength = 8,
    requireUpper = true,
    requireLower = true,
    requireNumbers = true,
    requireSpecial = true
  } = {}
) => {
  const errors = [];
  
  // 길이 검사
  if (password.length < minLength) {
    errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`);
  }
  
  // 대문자 검사
  if (requireUpper && !/[A-Z]/.test(password)) {
    errors.push("비밀번호에 대문자가 포함되어야 합니다.");
  }
  
  // 소문자 검사
  if (requireLower && !/[a-z]/.test(password)) {
    errors.push("비밀번호에 소문자가 포함되어야 합니다.");
  }
  
  // 숫자 검사
  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push("비밀번호에 숫자가 포함되어야 합니다.");
  }
  
  // 특수문자 검사
  if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("비밀번호에 특수문자가 포함되어야 합니다.");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 