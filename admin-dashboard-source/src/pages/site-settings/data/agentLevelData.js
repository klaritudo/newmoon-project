/**
 * 에이전트 레벨 관리 데이터
 * AgentLevelPage에서 사용하는 컬럼 정의와 샘플 데이터
 */

// 에이전트 레벨 컬럼 정의
export const agentLevelColumns = [
  {
    id: 'checkbox',
    type: 'checkbox',
    width: 50,
    sortable: false,
    align: 'center',
  },
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
    align: 'center',
    sortable: true,
  },
  {
    id: 'levelType',
    header: '유형',
    type: 'custom',
    width: 120,
    sortable: true,
    align: 'center',
    customRenderer: 'levelTypeChip',
  },
  {
    id: 'permissions',
    header: '권한',
    type: 'text',
    width: 200,
    sortable: true,
    align: 'left',
  },
  {
    id: 'hierarchyOrder',
    header: '계층단계',
    type: 'dropdown',
    width: 120,
    sortable: true,
    align: 'center',
    editable: true,
    dropdownType: 'hierarchy',
  },
  {
    id: 'createdAt',
    header: '생성일',
    type: 'datetime',
    width: 180,
    sortable: true,
    align: 'center',
  },
  {
    id: 'updatedAt',
    header: '수정일',
    type: 'datetime',
    width: 180,
    sortable: true,
    align: 'center',
  },
  {
    id: 'actions',
    header: '액션',
    type: 'button',
    width: 160,
    align: 'center',
    buttons: [
      { 
        label: '수정', 
        color: 'primary', 
        variant: 'outlined',
        onClick: null // 페이지에서 핸들러 연결
      },
      { 
        label: '삭제', 
        color: 'error', 
        variant: 'outlined',
        onClick: null // 페이지에서 핸들러 연결
      },
    ],
    buttonDirection: 'row',
  },
];

// 에이전트 레벨 데이터는 API에서 동적으로 로드됩니다.
// 하드코딩된 샘플 데이터 제거 - agent_levels 테이블에서 직접 가져옴
export const agentLevelData = [];

// 필터 옵션은 동적으로 생성되어야 함
export const filterOptions = [
  {
    id: 'status',
    label: '상태별',
    items: [
      { value: 'all', label: '전체' },
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' }
    ]
  },
  {
    id: 'levelType',
    label: '유형별',
    items: [
      { value: 'all', label: '전체' }
      // 실제 레벨 타입은 API에서 동적으로 로드
    ]
  }
];

// 에이전트 레벨 관리 유틸리티 함수들
export const agentLevelUtils = {
  /**
   * 새로운 에이전트 레벨 추가
   * @param {Object} levelData - 레벨 정보
   * @returns {Object} - 추가된 레벨 데이터
   */
  addLevel: (levelData) => {
    const newLevel = {
      id: Date.now(), // 임시 ID 생성
      ...levelData,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    return newLevel;
  },

  /**
   * 에이전트 레벨 수정
   * @param {number} id - 레벨 ID
   * @param {Object} updateData - 수정할 데이터
   * @param {Array} currentData - 현재 데이터 배열
   * @returns {Array} - 수정된 데이터 배열
   */
  updateLevel: (id, updateData, currentData) => {
    return currentData.map(level => 
      level.id === id 
        ? { 
            ...level, 
            ...updateData, 
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        : level
    );
  },

  /**
   * 에이전트 레벨 삭제
   * @param {number} id - 레벨 ID
   * @param {Array} currentData - 현재 데이터 배열
   * @returns {Array} - 삭제된 데이터 배열
   */
  deleteLevel: (id, currentData) => {
    return currentData.filter(level => level.id !== id);
  },

  /**
   * 레벨 유형별 필터링
   * @param {Array} data - 데이터 배열
   * @param {string} levelType - 필터할 레벨 유형
   * @returns {Array} - 필터링된 데이터 배열
   */
  filterByLevelType: (data, levelType) => {
    if (levelType === 'all') return data;
    return data.filter(level => level.levelType === levelType);
  },

  /**
   * 권한 검증
   * @param {string} levelType - 레벨 유형
   * @param {string} action - 수행할 액션
   * @returns {boolean} - 권한 여부
   */
  checkPermission: (levelType, action) => {
    const permissions = {
      '슈퍼관리자': ['create', 'read', 'update', 'delete', 'manage'],
      '관리자': ['create', 'read', 'update', 'delete'],
      '운영자': ['read', 'update'],
      '에이전트': ['read'],
      '게스트': ['read']
    };
    
    return permissions[levelType]?.includes(action) || false;
  }
}; 