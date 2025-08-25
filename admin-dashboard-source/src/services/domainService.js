import api from './api';

// 도메인 API 호출에 X-Domain 헤더 추가
const getDomainHeader = () => {
  // 현재 접속 도메인을 헤더로 전송
  return {
    'X-Domain': window.location.hostname
  };
};

const domainService = {
  // 모든 도메인 조회
  getAllDomains: async () => {
    try {
      const response = await api.get('/domains', {
        headers: getDomainHeader()
      });
      return response.data;
    } catch (error) {
      console.error('도메인 조회 실패:', error);
      throw error;
    }
  },

  // 특정 타입의 도메인 조회
  getDomainsByType: async (type) => {
    try {
      const response = await api.get(`/domains/type/${type}`, {
        headers: getDomainHeader()
      });
      return response.data;
    } catch (error) {
      console.error('도메인 조회 실패:', error);
      throw error;
    }
  },

  // 도메인 추가
  addDomain: async (domainData) => {
    try {
      const response = await api.post('/domains', domainData, {
        headers: getDomainHeader()
      });
      return response.data;
    } catch (error) {
      console.error('도메인 추가 실패:', error);
      throw error;
    }
  },

  // 도메인 수정
  updateDomain: async (id, domainData) => {
    try {
      const response = await api.put(`/domains/${id}`, domainData, {
        headers: getDomainHeader()
      });
      return response.data;
    } catch (error) {
      console.error('도메인 수정 실패:', error);
      throw error;
    }
  },

  // 도메인 활성/비활성 토글
  toggleDomainStatus: async (id) => {
    try {
      const response = await api.patch(`/domains/${id}/toggle`, {}, {
        headers: getDomainHeader()
      });
      return response.data;
    } catch (error) {
      console.error('도메인 상태 변경 실패:', error);
      throw error;
    }
  },

  // 도메인 삭제
  deleteDomain: async (id) => {
    try {
      const response = await api.delete(`/domains/${id}`, {
        headers: getDomainHeader()
      });
      return response.data;
    } catch (error) {
      console.error('도메인 삭제 실패:', error);
      throw error;
    }
  }
};

export default domainService;