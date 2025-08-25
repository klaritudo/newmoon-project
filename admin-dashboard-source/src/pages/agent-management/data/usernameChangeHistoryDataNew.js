/**
 * 아이디바꿔주기내역 데이터 생성
 * usePageData 훅과 호환되는 형태로 작성
 */

// 아이디바꿔주기내역 생성 함수 (동적 타입 불필요)
export const generateUsernameChangeHistoryDataNew = (types = null, typeHierarchy = null) => {
  // 고정 100개의 아이디 변경 내역 생성
  const historyData = [];
  const changeReasons = ['사용자 요청', '보안 정책', '중복 아이디 해결', '관리자 권한 변경', '계정 통합', '정책 위반 아이디'];
  const processors = ['관리자1', '관리자2', '관리자3', '시스템'];
  const agentNames = ['주식회사A', '주식회사B', '주식회사C', '주식회사D', '주식회사E'];
  const gameStatuses = ['미접속', '게임중', '로비대기'];
  
  for (let i = 0; i < 100; i++) {
    const id = i + 1;
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];
    
    historyData.push({
      id: id,
      no: id, // No. 컬럼용 필드 추가
      changeDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      agentId: agentName,
      oldUsername: `user${String(id).padStart(3, '0')}`,
      newUsername: `new_user${String(id).padStart(3, '0')}`,
      changeReason: changeReasons[Math.floor(Math.random() * changeReasons.length)],
      nickname: `닉네임${id}`,
      currentBalance: Math.floor(Math.random() * 5000000),
      gameStatus: gameStatuses[Math.floor(Math.random() * gameStatuses.length)],
      processor: processors[Math.floor(Math.random() * processors.length)],
      ipAddress: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      note: Math.random() > 0.5 ? `변경 사유: ${changeReasons[Math.floor(Math.random() * changeReasons.length)]}` : ''
    });
  }
  
  // 날짜 기준으로 정렬 (최신순)
  historyData.sort((a, b) => {
    return new Date(b.changeDate) - new Date(a.changeDate);
  });
  
  return historyData;
};