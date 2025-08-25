/**
 * 유저 도메인 권한 서비스
 */
import api from './api';

const userDomainPermissionService = {
  /**
   * 회원의 도메인 권한 정보 조회
   */
  getMemberPermission: async (memberId) => {
    try {
      const response = await api.get(`/user-domain-permissions/member/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('도메인 권한 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 도메인 권한 부여 (1단계 -> 하위 단계)
   */
  grantPermission: async (data) => {
    try {
      const response = await api.post('/user-domain-permissions/grant', data);
      return response.data;
    } catch (error) {
      console.error('도메인 권한 부여 실패:', error);
      throw error;
    }
  },

  /**
   * 도메인 권한 위임 (2단계 -> 3단계)
   */
  delegatePermission: async (data) => {
    try {
      const response = await api.post('/user-domain-permissions/delegate', data);
      return response.data;
    } catch (error) {
      console.error('도메인 권한 위임 실패:', error);
      throw error;
    }
  },

  /**
   * 도메인 선택 (본인위임 시)
   */
  assignDomain: async (data) => {
    try {
      const response = await api.post('/user-domain-permissions/assign-domain', data);
      return response.data;
    } catch (error) {
      console.error('도메인 할당 실패:', error);
      throw error;
    }
  },

  /**
   * 권한 회수
   */
  revokePermission: async (memberId, revokedBy) => {
    try {
      const response = await api.delete(`/user-domain-permissions/revoke/${memberId}`, {
        data: { revoked_by: revokedBy }
      });
      return response.data;
    } catch (error) {
      console.error('권한 회수 실패:', error);
      throw error;
    }
  },

  /**
   * 회원 업데이트 시 도메인 권한 처리
   */
  handleMemberUpdate: async (memberId, updateData, currentUser) => {
    const results = [];
    
    try {
      // 1. URL권한주기 처리 (1단계 회원)
      if (updateData.grantPermissionTo) {
        // 선택된 레벨에 속하는 자신의 라인의 모든 회원 찾기
        const targetLevelId = parseInt(updateData.grantPermissionTo);
        
        // 자신의 전체 하위 회원 중 해당 레벨의 회원 찾기
        // 재귀적으로 모든 하위를 찾는 API가 필요하지만, 현재는 직계 자식만 가져오는 API만 있음
        // 따라서 단계적으로 찾아야 함
        
        const findMembersAtLevel = async (parentId, targetLevel) => {
          const members = [];
          const queue = [parentId];
          const visited = new Set();
          
          while (queue.length > 0) {
            const currentId = queue.shift();
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            
            try {
              const response = await api.get(`/members/${currentId}/children`);
              if (response.data.success && response.data.data) {
                for (const child of response.data.data) {
                  if (child.agent_level_id === targetLevel) {
                    members.push(child);
                  }
                  // 목표 레벨보다 상위면 계속 탐색
                  if (child.agent_level_id < targetLevel) {
                    queue.push(child.id);
                  }
                }
              }
            } catch (error) {
              console.error(`회원 ${currentId}의 하위 조회 실패:`, error);
            }
          }
          
          return members;
        };
        
        const targetMembers = await findMembersAtLevel(memberId, targetLevelId);
        console.log(`${targetLevelId} 레벨 권한 부여 대상:`, targetMembers);
        
        // 각 대상 회원에게 권한 부여
        for (const member of targetMembers) {
          try {
            const grantResult = await userDomainPermissionService.grantPermission({
              member_id: member.id,
              granted_by: memberId,  // 수정 중인 회원이 권한을 부여하는 것
              can_delegate: true  // 2단계는 위임 가능
            });
            results.push({ 
              type: 'grant', 
              success: true, 
              message: `${member.username}에게 권한 부여 완료`,
              target: member 
            });
          } catch (grantError) {
            console.error(`${member.username} 권한 부여 실패:`, grantError);
            results.push({ 
              type: 'grant', 
              success: false, 
              message: `${member.username} 권한 부여 실패`,
              target: member,
              error: grantError.response?.data?.error 
            });
          }
        }
      }
      
      // 2. 회원페이지URL권한 처리 (권한받은 회원)
      if (updateData.delegatePermissionType) {
        if (updateData.delegatePermissionType === 'self') {
          // 본인위임 - 위임 권한 제거
          const updateResult = await userDomainPermissionService.delegatePermission({
            member_id: memberId,
            delegated_by: memberId,
            delegation_type: 'self'
          });
          results.push({ type: 'delegate', success: true, message: updateResult.message });
        } else if (updateData.delegatePermissionType.startsWith('children_')) {
          // 하위 레벨에 위임
          const targetLevelId = parseInt(updateData.delegatePermissionType.replace('children_', ''));
          
          // findMembersAtLevel 함수를 재사용
          const findMembersAtLevel = async (parentId, targetLevel) => {
            const members = [];
            const queue = [parentId];
            const visited = new Set();
            
            while (queue.length > 0) {
              const currentId = queue.shift();
              if (visited.has(currentId)) continue;
              visited.add(currentId);
              
              try {
                const response = await api.get(`/members/${currentId}/children`);
                if (response.data.success && response.data.data) {
                  for (const child of response.data.data) {
                    if (child.agent_level_id === targetLevel) {
                      members.push(child);
                    }
                    // 목표 레벨보다 상위면 계속 탐색
                    if (child.agent_level_id < targetLevel) {
                      queue.push(child.id);
                    }
                  }
                }
              } catch (error) {
                console.error(`회원 ${currentId}의 하위 조회 실패:`, error);
              }
            }
            
            return members;
          };
          
          const targetMembers = await findMembersAtLevel(memberId, targetLevelId);
          console.log(`위임 대상 회원들 (${targetLevelId} 레벨):`, targetMembers);
          
          // 각 대상 회원에게 위임
          for (const member of targetMembers) {
            try {
              console.log(`위임 시도: ${member.username} (ID: ${member.id}), 위임자: ${memberId}, 타입: ${updateData.delegatePermissionType}`);
              const delegateResult = await userDomainPermissionService.delegatePermission({
                member_id: member.id,
                delegated_by: memberId,
                delegation_type: updateData.delegatePermissionType
              });
              results.push({ 
                type: 'delegate', 
                success: true, 
                message: `${member.username}에게 위임 완료`,
                target: member 
              });
            } catch (delegateError) {
              console.error(`${member.username} 위임 실패:`, delegateError);
              results.push({ 
                type: 'delegate', 
                success: false, 
                message: `${member.username} 위임 실패`,
                target: member,
                error: delegateError.response?.data?.error 
              });
            }
          }
        }
      }
      
      // 3. 회원페이지URL선택 처리 (본인위임 시)
      // 빈 문자열이 아니고, 권한 부여나 위임 작업이 아닐 때만 실행
      if (updateData.selectedDomainId !== undefined && 
          updateData.selectedDomainId !== '' && 
          updateData.selectedDomainId !== null &&
          !updateData.grantPermissionTo &&
          !updateData.delegatePermissionType) {
        const assignResult = await userDomainPermissionService.assignDomain({
          member_id: memberId,
          domain_id: updateData.selectedDomainId ? parseInt(updateData.selectedDomainId) : null
        });
        results.push({ type: 'assign', success: true, message: assignResult.message });
      }
      
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('도메인 권한 업데이트 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || '도메인 권한 업데이트 중 오류가 발생했습니다.',
        results
      };
    }
  }
};

export default userDomainPermissionService;