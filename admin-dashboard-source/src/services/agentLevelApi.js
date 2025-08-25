/**
 * 에이전트 레벨 API 서비스
 */

import api from './api';

/**
 * 에이전트 레벨 API 서비스
 */
export const agentLevelApi = {
  /**
   * 모든 에이전트 레벨 조회
   */
  getAll: async () => {
    const response = await api.get('/agent-levels');
    return response.data.data;
  },

  /**
   * 특정 에이전트 레벨 조회
   */
  getById: async (id) => {
    const response = await api.get(`/agent-levels/${id}`);
    return response.data.data;
  },

  /**
   * 새 에이전트 레벨 추가
   */
  create: async (levelData) => {
    const response = await api.post('/agent-levels', levelData);
    return response.data.data;
  },

  /**
   * 에이전트 레벨 수정
   */
  update: async (id, levelData) => {
    try {
      const response = await api.put(`/agent-levels/${id}`, levelData);
      return response.data.data;
    } catch (error) {
      console.error('Agent level update error:', error.response?.data || error);
      if (error.response?.data?.details) {
        console.error('Error details:', error.response.data.details);
      }
      if (error.response?.data?.stack) {
        console.error('Error stack:', error.response.data.stack);
      }
      throw error;
    }
  },

  /**
   * 에이전트 레벨 삭제
   */
  delete: async (id) => {
    const response = await api.delete(`/agent-levels/${id}`);
    return response.data;
  },

  /**
   * 에이전트 레벨 계층 순서 변경
   */
  updateHierarchyOrder: async (id, newOrder) => {
    console.log('📡 agentLevelApi.updateHierarchyOrder 호출:', { id, newOrder });
    
    const response = await api.put(`/agent-levels/${id}/hierarchy`, { 
      hierarchyOrder: newOrder 
    });
    
    console.log('✅ agentLevelApi.updateHierarchyOrder 응답:', response);
    return response.data.data;
  },

  /**
   * 에이전트 레벨 삭제 (옵션 포함)
   */
  deleteWithOption: async (id, options) => {
    const response = await api.delete(`/agent-levels/${id}`, { 
      data: options 
    });
    return response.data;
  },
};

export default agentLevelApi;