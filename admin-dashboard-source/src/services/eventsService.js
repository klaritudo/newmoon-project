import api from './api';

/**
 * 이벤트 관리 API 서비스
 */
const eventsService = {
  // 이벤트 목록 조회
  async getEvents(params = {}) {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('이벤트 목록 조회 실패:', error);
      throw error;
    }
  },

  // 이벤트 상세 조회
  async getEvent(id) {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('이벤트 상세 조회 실패:', error);
      throw error;
    }
  },

  // 이벤트 생성
  async createEvent(data) {
    try {
      const response = await api.post('/events', data);
      return response.data;
    } catch (error) {
      console.error('이벤트 생성 실패:', error);
      throw error;
    }
  },

  // 이벤트 수정
  async updateEvent(id, data) {
    try {
      const response = await api.put(`/events/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('이벤트 수정 실패:', error);
      throw error;
    }
  },

  // 이벤트 삭제
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('이벤트 삭제 실패:', error);
      throw error;
    }
  },

  // 이벤트 메인고정 토글
  async toggleMainPin(id) {
    try {
      const response = await api.patch(`/events/${id}/toggle-pin`);
      return response.data;
    } catch (error) {
      console.error('이벤트 메인고정 토글 실패:', error);
      throw error;
    }
  },

  // 이벤트 순서 변경
  async updateEventOrder(orders) {
    try {
      const response = await api.put('/events/update-order', { orders });
      return response.data;
    } catch (error) {
      console.error('이벤트 순서 변경 실패:', error);
      throw error;
    }
  },

  // 메인 고정 이벤트 목록 조회
  async getPinnedEvents() {
    try {
      const response = await api.get('/events/pinned');
      return response.data;
    } catch (error) {
      console.error('메인 고정 이벤트 조회 실패:', error);
      throw error;
    }
  },

  // 이벤트 이미지 업로드
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/events/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  }
};

export default eventsService;