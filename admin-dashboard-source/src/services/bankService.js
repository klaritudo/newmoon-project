import apiService from './api';

/**
 * 은행 설정 관련 API 서비스
 */
const bankService = {
  /**
   * 은행 계좌 목록 조회
   * @param {boolean} activeOnly - 활성화된 은행만 조회할지 여부
   * @returns {Promise} 은행 계좌 목록
   */
  async getBankAccounts(activeOnly = false) {
    try {
      const response = await apiService.settings.getBankAccounts();
      let accounts = response.data || [];
      
      // 활성화된 은행만 필터링
      if (activeOnly) {
        accounts = accounts.filter(account => account.is_active);
      }
      
      // display_order로 정렬
      accounts.sort((a, b) => a.display_order - b.display_order);
      
      return accounts;
    } catch (error) {
      console.error('은행 계좌 목록 조회 실패:', error);
      // 401 에러인 경우 빈 배열 반환
      if (error.response?.status === 401) {
        console.warn('은행 계좌 조회 중 인증 오류 - 빈 배열 반환');
        return [];
      }
      throw error; // 다른 에러는 다시 던짐
    }
  },

  /**
   * 활성화된 은행명 목록만 조회
   * @returns {Promise<string[]>} 은행명 배열
   */
  async getActiveBankNames() {
    try {
      const accounts = await this.getBankAccounts(true);
      return accounts.map(account => account.bank_name);
    } catch (error) {
      console.error('활성 은행명 조회 실패:', error);
      // 에러 발생 시 빈 배열 반환
      return [];
    }
  },

  /**
   * 은행 계좌 추가
   * @param {Object} bankData - 은행 계좌 정보
   * @returns {Promise} 추가된 은행 계좌
   */
  async addBankAccount(bankData) {
    return await apiService.settings.addBankAccount(bankData);
  },

  /**
   * 은행 계좌 수정
   * @param {number} id - 은행 계좌 ID
   * @param {Object} bankData - 수정할 은행 계좌 정보
   * @returns {Promise} 수정된 은행 계좌
   */
  async updateBankAccount(id, bankData) {
    return await apiService.settings.updateBankAccount(id, bankData);
  },

  /**
   * 은행 계좌 삭제 (비활성화)
   * @param {number} id - 은행 계좌 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteBankAccount(id) {
    return await apiService.settings.deleteBankAccount(id);
  }
};

export default bankService;