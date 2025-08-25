import apiService from './api';

/**
 * 실제 API 응답을 프론트엔드 형식으로 변환
 */
const transformPermissionData = (permission) => {
  // restrictions 필드 파싱 처리
  let restrictions = permission.restrictions;
  if (typeof restrictions === 'string') {
    try {
      restrictions = JSON.parse(restrictions);
    } catch (e) {
      restrictions = { menus: [], buttons: [], layouts: [], cssSelectors: [] };
    }
  }
  
  // restrictions가 없거나 잘못된 형식인 경우 기본값 설정
  if (!restrictions || typeof restrictions !== 'object') {
    restrictions = { menus: [], buttons: [], layouts: [], cssSelectors: [] };
  }
  
  // 각 배열이 없는 경우 빈 배열로 초기화
  restrictions.menus = restrictions.menus || [];
  restrictions.buttons = restrictions.buttons || [];
  restrictions.layouts = restrictions.layouts || [];
  restrictions.cssSelectors = restrictions.cssSelectors || [];
  
  return {
    id: permission.id,
    permissionName: permission.permission_name,
    description: permission.description || '',
    isActive: permission.is_active === 1 || permission.is_active === true,
    restrictions: restrictions,
    createdAt: permission.created_at ? permission.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    updatedAt: permission.updated_at ? permission.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
  };
};

/**
 * 프론트엔드 데이터를 API 형식으로 변환
 */
const transformToApiFormat = (permissionData) => {
  return {
    permission_name: permissionData.permissionName,
    description: permissionData.description || '',
    is_active: permissionData.isActive ? 1 : 0,
    restrictions: permissionData.restrictions || { menus: [], buttons: [], layouts: [], cssSelectors: [] }
  };
};

/**
 * 권한 API
 */
const permissionApi = {
  /**
   * 모든 권한 목록 조회
   */
  getAll: async () => {
    try {
      const response = await apiService.get('/permissions');
      const permissions = response.data?.data || response.data || [];
      console.log('권한 목록 조회 성공:', permissions.length + '개');
      return permissions.map(transformPermissionData);
    } catch (error) {
      console.error('권한 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 특정 권한 조회
   */
  getById: async (id) => {
    try {
      const response = await apiService.get(`/permissions/${id}`);
      return transformPermissionData(response.data?.data || response.data);
    } catch (error) {
      console.error('권한 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 권한 생성
   */
  create: async (permissionData) => {
    try {
      console.log('권한 생성 요청:', permissionData);
      const response = await apiService.post('/permissions', transformToApiFormat(permissionData));
      console.log('권한 생성 성공:', response.data);
      return transformPermissionData(response.data?.data || response.data);
    } catch (error) {
      console.error('권한 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 권한 수정
   */
  update: async (id, permissionData) => {
    try {
      console.log('권한 수정 요청:', id, permissionData);
      const response = await apiService.put(`/permissions/${id}`, transformToApiFormat(permissionData));
      console.log('권한 수정 성공:', response.data);
      return transformPermissionData(response.data?.data || response.data);
    } catch (error) {
      console.error('권한 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 권한 삭제
   */
  delete: async (id) => {
    try {
      console.log('권한 삭제 요청:', id);
      const response = await apiService.delete(`/permissions/${id}`);
      console.log('권한 삭제 성공');
      return response.data;
    } catch (error) {
      console.error('권한 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 특정 회원의 유효 권한 조회
   */
  getMemberPermissions: async (memberId) => {
    try {
      const response = await apiService.get(`/permissions/member/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('회원 권한 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 회원 권한 오버라이드 설정
   */
  updateMemberPermissions: async (memberId, permissions) => {
    try {
      const response = await apiService.put(`/permissions/member/${memberId}`, {
        permissions
      });
      return response.data;
    } catch (error) {
      console.error('회원 권한 업데이트 실패:', error);
      throw error;
    }
  }
};

export default permissionApi;