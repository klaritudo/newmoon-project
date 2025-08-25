import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { useDispatch } from 'react-redux';
import { setSelectedRoleId, clearSelectedRoleId } from './permissionsSlice';

// 쿼리 키
const ROLES_KEY = 'roles';
const PERMISSIONS_KEY = 'permissions';

// 역할 목록 조회 훅
export const useRoles = () => {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: async () => {
      // 기본 역할 데이터
      const defaultRoles = [
        { id: 1, name: '슈퍼관리자', createdAt: '2023-01-01', bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '홍길동' },
        { id: 2, name: '관리자', createdAt: '2023-01-01', bankName: '국민은행', accountNumber: '123-45-67890', accountHolder: '김철수' },
        { id: 3, name: '에이전트', createdAt: '2023-01-01', bankName: '우리은행', accountNumber: '1002-123-456789', accountHolder: '이영희' },
        { id: 4, name: '회원', createdAt: '2023-01-01', bankName: '', accountNumber: '', accountHolder: '' },
      ];
      
      try {
        // API 호출 시도
        const response = await apiService.permissions.getRoles();
        return response.data;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기 시도
        const savedRoles = localStorage.getItem('roles');
        if (savedRoles) {
          return JSON.parse(savedRoles);
        }
        
        // 로컬 스토리지에 데이터가 없으면 기본 데이터 저장 후 반환
        localStorage.setItem('roles', JSON.stringify(defaultRoles));
        return defaultRoles;
      }
    },
    retry: false, // API 호출 실패 시 재시도하지 않음
  });
};

// 역할 상세 조회 훅
export const useRole = (id) => {
  const dispatch = useDispatch();
  
  return useQuery({
    queryKey: [ROLES_KEY, id],
    queryFn: async () => {
      try {
        // API 호출 시도
        const response = await apiService.permissions.getRoleById(id);
        return response.data;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        if (!savedRoles) {
          throw new Error('로컬 데이터가 없습니다.');
        }
        
        const roles = JSON.parse(savedRoles);
        const role = roles.find(role => role.id === id);
        
        if (!role) {
          throw new Error('해당 ID의 역할을 찾을 수 없습니다.');
        }
        
        return role;
      }
    },
    onSuccess: (data) => {
      dispatch(setSelectedRoleId(data.id));
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
    retry: false, // API 호출 실패 시 재시도하지 않음
  });
};

// 역할별 권한 조회 훅
export const useRolePermissions = (roleId) => {
  return useQuery({
    queryKey: [ROLES_KEY, roleId, PERMISSIONS_KEY],
    queryFn: async () => {
      // 기본 역할별 권한 데이터
      const defaultRolePermissions = {
        1: [101, 102, 201, 202, 203, 204, 205, 301, 302, 401, 402, 501, 502, 503, 601, 602, 603], // 슈퍼관리자 (모든 권한)
        2: [101, 102, 201, 202, 203, 204, 301, 401, 501, 502, 503, 601], // 관리자
        3: [101, 201, 202, 301, 401, 501], // 에이전트
        4: [101], // 회원
      };
      
      try {
        // API 호출 시도
        const response = await apiService.permissions.getRolePermissions(roleId);
        return response.data;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기 시도
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        if (savedRolePermissions) {
          const parsedRolePermissions = JSON.parse(savedRolePermissions);
          if (parsedRolePermissions[roleId]) {
            return parsedRolePermissions[roleId];
          }
        }
        
        // 로컬 스토리지에 데이터가 없으면 기본 데이터 사용
        if (defaultRolePermissions[roleId]) {
          // 로컬 스토리지에 저장
          const rolePermissionsToSave = savedRolePermissions ? JSON.parse(savedRolePermissions) : {};
          rolePermissionsToSave[roleId] = defaultRolePermissions[roleId];
          localStorage.setItem('rolePermissions', JSON.stringify(rolePermissionsToSave));
          
          return defaultRolePermissions[roleId];
        }
        
        // 기본 데이터에도 없으면 빈 배열 반환
        return [];
      }
    },
    enabled: !!roleId, // roleId가 있을 때만 쿼리 실행
    retry: false, // API 호출 실패 시 재시도하지 않음
  });
};

// 역할 생성 훅
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData) => {
      try {
        // API 호출 시도
        const response = await apiService.permissions.createRole(roleData);
        return response.data;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        let roles = [];
        
        if (savedRoles) {
          roles = JSON.parse(savedRoles);
        }
        
        // 새 ID 생성 (기존 ID 중 최대값 + 1)
        const newId = roles.length > 0 ? Math.max(...roles.map(role => role.id)) + 1 : 1;
        
        // 새 데이터 생성
        const newRole = {
          ...roleData,
          id: newId,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify([...roles, newRole]));
        
        return newRole;
      }
    },
    onSuccess: () => {
      // 역할 목록 갱신
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
    },
  });
};

// 역할 업데이트 훅
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        // API 호출 시도
        const response = await apiService.permissions.updateRole(id, data);
        return response.data;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        if (!savedRoles) {
          throw new Error('로컬 데이터가 없습니다.');
        }
        
        const roles = JSON.parse(savedRoles);
        const roleIndex = roles.findIndex(role => role.id === id);
        
        if (roleIndex === -1) {
          throw new Error('해당 ID의 역할을 찾을 수 없습니다.');
        }
        
        // 데이터 업데이트
        const updatedRole = { ...roles[roleIndex], ...data, id };
        roles[roleIndex] = updatedRole;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify(roles));
        
        return updatedRole;
      }
    },
    onSuccess: (response, variables) => {
      // 역할 목록 및 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY, variables.id] });
    },
  });
};

// 역할 삭제 훅
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        // API 호출 시도
        await apiService.permissions.deleteRole(id);
        return id;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        if (!savedRoles) {
          throw new Error('로컬 데이터가 없습니다.');
        }
        
        const roles = JSON.parse(savedRoles);
        
        // 데이터 삭제
        const updatedRoles = roles.filter(role => role.id !== id);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        
        // 역할 권한 정보도 삭제
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        if (savedRolePermissions) {
          const rolePermissions = JSON.parse(savedRolePermissions);
          delete rolePermissions[id];
          localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
        }
        
        return id;
      }
    },
    onSuccess: (id) => {
      // 역할 목록 갱신
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
      
      // 선택된 역할이 삭제된 경우 선택 해제
      dispatch(clearSelectedRoleId());
    },
  });
};

// 다중 역할 삭제 훅
export const useDeleteMultipleRoles = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async (ids) => {
      try {
        // API 호출 시도
        for (const id of ids) {
          await apiService.permissions.deleteRole(id);
        }
        return ids;
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRoles = localStorage.getItem('roles');
        if (!savedRoles) {
          throw new Error('로컬 데이터가 없습니다.');
        }
        
        const roles = JSON.parse(savedRoles);
        
        // 데이터 삭제
        const updatedRoles = roles.filter(role => !ids.includes(role.id));
        
        // 로컬 스토리지에 저장
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        
        // 역할 권한 정보도 삭제
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        if (savedRolePermissions) {
          const rolePermissions = JSON.parse(savedRolePermissions);
          ids.forEach(id => {
            delete rolePermissions[id];
          });
          localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
        }
        
        return ids;
      }
    },
    onSuccess: () => {
      // 역할 목록 갱신
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
      
      // 선택 해제
      dispatch(clearSelectedRoleId());
    },
  });
};

// 역할 권한 업데이트 훅
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roleId, permissions }) => {
      try {
        // API 호출 시도
        const response = await apiService.permissions.updateRolePermissions(roleId, permissions);
        return { roleId, permissions: response.data };
      } catch (error) {
        console.error('API 호출 실패, 로컬 데이터 사용:', error);
        
        // 로컬 스토리지에서 데이터 가져오기
        const savedRolePermissions = localStorage.getItem('rolePermissions');
        let rolePermissionsData = {};
        
        if (savedRolePermissions) {
          rolePermissionsData = JSON.parse(savedRolePermissions);
        }
        
        // 데이터 업데이트
        rolePermissionsData[roleId] = permissions;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('rolePermissions', JSON.stringify(rolePermissionsData));
        
        return { roleId, permissions };
      }
    },
    onSuccess: (_, variables) => {
      // 역할 권한 정보 갱신
      queryClient.invalidateQueries({ 
        queryKey: [ROLES_KEY, variables.roleId, PERMISSIONS_KEY] 
      });
    },
  });
};
