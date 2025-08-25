/**
 * 권한 관리 필터 옵션 정의
 */

export const permissionFilterOptions = [
  {
    id: 'status',
    label: '활성 상태',
    type: 'select',
    items: [
      { value: 'all', label: '전체' },
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' }
    ],
    defaultValue: 'all'
  }
];