import api from './api';

const agentLevelAccountService = {
  // 모든 에이전트 레벨 계좌 조회
  getAllAccounts: async () => {
    try {
      console.log('📊 에이전트 레벨 계좌 조회 시작...');
      const response = await api.get('/agent-level-accounts');
      console.log('📊 에이전트 레벨 계좌 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('에이전트 레벨 계좌 조회 실패:', error);
      throw error;
    }
  },

  // 특정 레벨의 계좌 조회
  getAccountByLevel: async (levelId) => {
    try {
      const response = await api.get(`/agent-level-accounts/level/${levelId}`);
      return response.data;
    } catch (error) {
      console.error('계좌 조회 실패:', error);
      throw error;
    }
  },

  // 계좌 정보 저장/수정
  saveAccount: async (accountData) => {
    try {
      const response = await api.post('/agent-level-accounts', accountData);
      return response.data;
    } catch (error) {
      console.error('계좌 저장 실패:', error);
      throw error;
    }
  },

  // 일괄 저장
  bulkSaveAccounts: async (accounts) => {
    try {
      const response = await api.post('/agent-level-accounts/bulk', { accounts });
      return response.data;
    } catch (error) {
      console.error('일괄 저장 실패:', error);
      throw error;
    }
  },

  // 자동답변 일괄 적용
  bulkApplyAutoReply: async (autoReply) => {
    try {
      const response = await api.post('/agent-level-accounts/bulk-auto-reply', { auto_reply: autoReply });
      return response.data;
    } catch (error) {
      console.error('자동답변 일괄 적용 실패:', error);
      throw error;
    }
  }
};

export default agentLevelAccountService;