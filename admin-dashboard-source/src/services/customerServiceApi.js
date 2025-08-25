import api from './api';

/**
 * 고객센터 API 서비스
 * 문의 관리 관련 API 호출을 담당합니다.
 */
const customerServiceApi = {
  /**
   * 문의 목록 조회
   * @param {Object} params - 검색 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지당 항목 수
   * @param {string} params.status - 상태 필터
   * @param {string} params.type - 문의 유형 필터
   * @param {string} params.search - 검색어
   */
  getMessages: async (params = {}) => {
    try {
      const response = await api.get('/customer-service', { params });
      return response.data;
    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 문의 상세 조회
   * @param {number} id - 문의 ID
   */
  getMessageDetail: async (id) => {
    try {
      const response = await api.get(`/customer-service/${id}`);
      return response.data;
    } catch (error) {
      console.error('문의 상세 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 문의 답변 작성
   * @param {number} id - 문의 ID
   * @param {Object} data - 답변 데이터
   * @param {string} data.content - 답변 내용
   * @param {File} data.image - 첨부 이미지 (선택)
   */
  replyToMessage: async (id, data) => {
    try {
      let formData;
      let headers = {};

      // 이미지가 있는 경우 FormData 사용
      if (data.image) {
        formData = new FormData();
        formData.append('content', data.content);
        formData.append('image', data.image);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        formData = { content: data.content };
      }

      const response = await api.post(`/customer-service/${id}/reply`, formData, { headers });
      return response.data;
    } catch (error) {
      console.error('문의 답변 작성 오류:', error);
      throw error;
    }
  },

  /**
   * 문의 상태 변경
   * @param {number} id - 문의 ID
   * @param {string} status - 변경할 상태
   */
  updateMessageStatus: async (id, status) => {
    try {
      // 백엔드 API가 기대하는 상태값으로 매핑
      const statusMap = {
        'unread': 'unread',
        'read': 'read',
        'pending': 'waiting',  // 백엔드는 'waiting'을 기대함
        'replied': 'replied',
        'completed': 'completed'
      };
      
      const mappedStatus = statusMap[status] || status;
      console.log('상태 변경 요청:', { id, originalStatus: status, mappedStatus });
      
      const response = await api.put(`/customer-service/${id}/status`, { status: mappedStatus });
      return response.data;
    } catch (error) {
      console.error('문의 상태 변경 오류:', error);
      if (error.response && error.response.data) {
        console.error('서버 응답:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * 읽지 않은 문의 수 조회
   */
  getUnreadStats: async () => {
    try {
      const response = await api.get('/customer-service/stats/unread');
      return response.data;
    } catch (error) {
      console.error('읽지 않은 문의 수 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 문의 보내기
   * @param {Object} data - 문의 데이터
   * @param {string} data.recipientType - 수신자 유형
   * @param {Array} data.recipientIds - 수신자 ID 목록
   * @param {string} data.title - 제목
   * @param {string} data.content - 내용
   */
  sendMessage: async (data) => {
    try {
      const response = await api.post('/customer-service/send', data);
      return response.data;
    } catch (error) {
      console.error('문의 보내기 오류:', error);
      throw error;
    }
  },

  /**
   * 문의 삭제
   * @param {number} id - 문의 ID
   */
  deleteMessage: async (id) => {
    try {
      const response = await api.delete(`/customer-service/${id}`);
      return response.data;
    } catch (error) {
      console.error('문의 삭제 오류:', error);
      throw error;
    }
  },

  /**
   * 보낸 문의 목록 조회
   * @param {Object} params - 검색 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지당 항목 수
   * @param {string} params.status - 상태 필터
   * @param {string} params.recipientType - 수신자 유형 필터
   */
  getSentMessages: async (params = {}) => {
    try {
      const response = await api.get('/customer-service/sent', { params });
      return response.data;
    } catch (error) {
      console.error('보낸 문의 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 전체 문의 목록 조회 (받은문의 + 보낸문의 통합)
   * @param {Object} params - 검색 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지당 항목 수
   * @param {string} params.search - 검색어
   */
  getAllMessages: async (params = {}) => {
    try {
      const response = await api.get('/customer-service/all', { params });
      return response.data;
    } catch (error) {
      console.error('전체 문의 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 보낸 문의 재발송
   * @param {number} id - 문의 ID
   */
  resendMessage: async (id) => {
    try {
      const response = await api.post(`/customer-service/${id}/resend`);
      return response.data;
    } catch (error) {
      console.error('문의 재발송 오류:', error);
      throw error;
    }
  },

  /**
   * 보낸 문의 취소
   * @param {number} id - 문의 ID
   */
  cancelMessage: async (id) => {
    try {
      const response = await api.put(`/customer-service/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('문의 취소 오류:', error);
      throw error;
    }
  }
};

export default customerServiceApi;