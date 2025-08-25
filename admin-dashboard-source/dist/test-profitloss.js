// 손익 데이터 테스트 스크립트
// 브라우저 콘솔에서 실행하여 profitLoss 데이터 확인

(async function testProfitLoss() {
  console.log('=== 손익 데이터 테스트 시작 ===');
  
  try {
    // API 호출
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('로그인이 필요합니다.');
      return;
    }
    
    const response = await fetch('/api/members', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('API 호출 실패:', data.error);
      return;
    }
    
    console.log('전체 회원 수:', data.data.length);
    
    // profitLoss가 있는 회원 찾기
    const membersWithProfitLoss = data.data.filter(m => m.profitLoss);
    console.log('profitLoss 필드가 있는 회원 수:', membersWithProfitLoss.length);
    
    // 첫 번째 회원의 profitLoss 상세 확인
    if (data.data.length > 0) {
      const firstMember = data.data[0];
      console.log('\n첫 번째 회원 정보:');
      console.log('- username:', firstMember.username);
      console.log('- profitLoss:', firstMember.profitLoss);
      
      if (firstMember.profitLoss) {
        try {
          const profitData = typeof firstMember.profitLoss === 'string' 
            ? JSON.parse(firstMember.profitLoss) 
            : firstMember.profitLoss;
          
          console.log('\nprofitLoss 파싱 결과:');
          console.log('- 슬롯 손익:', profitData.byGameType?.slot?.profitLoss || 0);
          console.log('- 카지노 손익:', profitData.byGameType?.casino?.profitLoss || 0);
          console.log('- 총 손익:', profitData.summary?.netProfitLoss || 0);
        } catch (e) {
          console.error('profitLoss 파싱 오류:', e);
        }
      }
    }
    
    // 실제 손익이 있는 회원 찾기 (0이 아닌 값)
    const membersWithActualProfitLoss = data.data.filter(m => {
      if (!m.profitLoss) return false;
      try {
        const profitData = typeof m.profitLoss === 'string' 
          ? JSON.parse(m.profitLoss) 
          : m.profitLoss;
        return profitData.summary?.netProfitLoss !== 0;
      } catch (e) {
        return false;
      }
    });
    
    console.log('\n실제 손익이 있는 회원 수 (0이 아닌 값):', membersWithActualProfitLoss.length);
    
    if (membersWithActualProfitLoss.length > 0) {
      console.log('\n손익이 있는 회원 예시:');
      membersWithActualProfitLoss.slice(0, 3).forEach(member => {
        const profitData = typeof member.profitLoss === 'string' 
          ? JSON.parse(member.profitLoss) 
          : member.profitLoss;
        console.log(`- ${member.username}: 총 손익 ${profitData.summary?.netProfitLoss}`);
      });
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
  
  console.log('\n=== 테스트 완료 ===');
})();