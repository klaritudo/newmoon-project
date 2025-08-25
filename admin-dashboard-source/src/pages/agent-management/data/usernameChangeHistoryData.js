export const generateUsernameChangeHistoryData = (count = 100) => {
  const changeReasons = [
    '사용자 요청',
    '보안 정책',
    '중복 아이디 해결',
    '관리자 권한 변경',
    '계정 통합',
    '정책 위반 아이디'
  ];

  const agents = ['agent001', 'agent002', 'agent003', 'agent004', 'agent005'];
  const processors = ['admin', 'system', 'manager01', 'manager02'];
  const devices = ['PC', 'Mobile', 'Tablet'];
  const memberLevels = ['일반', '실버', '골드', 'VIP', '플래티넘'];
  const gameStatuses = ['미접속', '게임중', '로비대기'];

  const data = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // 변경일시를 최근 30일 내로 랜덤 설정
    const changeDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    data.push({
      id: `UCH${String(i + 1).padStart(6, '0')}`,
      changeDate: changeDate.toISOString().replace('T', ' ').substring(0, 19),
      agentId: randomAgent,
      oldUsername: `user${Math.floor(Math.random() * 9000) + 1000}`,
      newUsername: `user${Math.floor(Math.random() * 9000) + 10000}`,
      nickname: `닉네임${Math.floor(Math.random() * 1000)}`,
      memberLevel: memberLevels[Math.floor(Math.random() * memberLevels.length)],
      changeReason: changeReasons[Math.floor(Math.random() * changeReasons.length)],
      balanceAtChange: Math.floor(Math.random() * 2) === 0 ? 0 : Math.floor(Math.random() * 1000000),
      gameStatus: gameStatuses[Math.floor(Math.random() * gameStatuses.length)],
      changedBy: processors[Math.floor(Math.random() * processors.length)],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device: devices[Math.floor(Math.random() * devices.length)],
      notes: Math.random() > 0.7 ? '특이사항 없음' : ''
    });
  }

  // 날짜 기준 내림차순 정렬
  return data.sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate));
};

// 활성화된 사용자 중 변경 가능한 사용자 목록 생성
export const generateChangeableUsers = (agentId, excludeUserId) => {
  const users = [];
  const userCount = Math.floor(Math.random() * 10) + 5;

  for (let i = 0; i < userCount; i++) {
    const userId = `user${Math.floor(Math.random() * 9000) + 20000}`;
    
    // 변경 가능한 조건: 미접속, 보유금 0, 롤링금 0
    if (userId !== excludeUserId) {
      users.push({
        id: userId,
        userId: userId,
        nickname: `닉네임${Math.floor(Math.random() * 1000)}`,
        agentId: agentId,
        level: '일반',
        balance: 0,
        rollingAmount: 0,
        gameStatus: '미접속',
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        changeEnabled: true,
        isOnline: false
      });
    }
  }

  return users;
};

// 접속 중인 변경 가능한 사용자 목록 생성 (사이트설정용)
export const generateOnlineChangeableUsers = (count = 50) => {
  const users = [];
  const agents = ['agent001', 'agent002', 'agent003', 'agent004', 'agent005'];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const loginTime = new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000); // 최대 4시간 전
    const runningTime = Math.floor((now - loginTime) / 1000); // 초 단위

    users.push({
      id: `user${Math.floor(Math.random() * 9000) + 30000}`,
      userId: `user${Math.floor(Math.random() * 9000) + 30000}`,
      nickname: `닉네임${Math.floor(Math.random() * 1000)}`,
      agentId: agents[Math.floor(Math.random() * agents.length)],
      level: '일반',
      balance: 0, // 변경 가능하려면 0이어야 함
      gameStatus: '로비대기',
      loginTime: loginTime.toISOString(),
      runningTime: runningTime,
      runningTimeFormatted: formatRunningTime(runningTime),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device: ['PC', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
      changeEnabled: true,
      isOnline: true
    });
  }

  return users;
};

// 러닝타임 포맷 함수
function formatRunningTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${secs}초`;
  } else {
    return `${secs}초`;
  }
}