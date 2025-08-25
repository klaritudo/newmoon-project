import api from './api';

const depositInquiriesService = {
  // 입금 문의 목록 조회
  getAll: async (params = {}) => {
    const response = await api.get('/deposit-inquiries', { params });
    return response.data;
  },

  // 입금 문의 상태별 카운트 조회
  getCounts: async () => {
    const response = await api.get('/deposit-inquiries/counts');
    return response.data;
  },

  // 입금 문의 상태 변경
  updateStatus: async (id, data) => {
    const response = await api.put(`/deposit-inquiries/${id}/status`, data);
    return response.data;
  },

  // 입금 문의 일괄 처리
  bulkUpdate: async (data) => {
    const response = await api.put('/deposit-inquiries/bulk-update', data);
    return response.data;
  },

  // 특정 입금 문의 조회
  getInquiry: async (id) => {
    const response = await api.get(`/deposit-inquiries/${id}`);
    return response.data;
  }
};

export default depositInquiriesService;