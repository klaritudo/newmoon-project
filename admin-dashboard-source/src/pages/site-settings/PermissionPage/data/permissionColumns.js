/**
 * 권한 관리 테이블 컬럼 정의
 */

export const permissionColumns = [
  {
    id: 'checkbox',
    label: '',
    type: 'checkbox',
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    sortable: false,
    filterable: false,
    hideable: false,
    pinnable: true,
    resizable: false
  },
  {
    id: 'number',
    label: 'No.',
    type: 'number',
    width: 80,
    minWidth: 60,
    maxWidth: 100,
    sortable: false,
    filterable: false,
    hideable: false,
    pinnable: true,
    resizable: true,
    align: 'center'
  },
  {
    id: 'permissionName',
    label: '권한명',
    type: 'text',
    width: 200,
    minWidth: 150,
    maxWidth: 300,
    sortable: true,
    filterable: true,
    hideable: false,
    pinnable: true,
    resizable: true,
    align: 'left'
  },
  {
    id: 'description',
    label: '설명',
    type: 'text',
    width: 300,
    minWidth: 200,
    maxWidth: 400,
    sortable: true,
    filterable: true,
    hideable: true,
    pinnable: false,
    resizable: true,
    align: 'left'
  },
  {
    id: 'isActive',
    label: '활성 상태',
    type: 'toggle',
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    sortable: true,
    filterable: true,
    hideable: true,
    pinnable: false,
    resizable: true,
    align: 'center'
  },
  {
    id: 'createdAt',
    label: '생성일',
    type: 'date',
    width: 150,
    minWidth: 120,
    maxWidth: 180,
    sortable: true,
    filterable: true,
    hideable: true,
    pinnable: false,
    resizable: true,
    align: 'center'
  },
  {
    id: 'updatedAt',
    label: '수정일',
    type: 'date',
    width: 150,
    minWidth: 120,
    maxWidth: 180,
    sortable: true,
    filterable: true,
    hideable: true,
    pinnable: false,
    resizable: true,
    align: 'center'
  },
  {
    id: 'actions',
    label: '액션',
    type: 'button',
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    sortable: false,
    filterable: false,
    hideable: false,
    pinnable: false,
    resizable: false,
    align: 'center',
    buttons: [
      {
        label: '수정',
        variant: 'outlined',
        color: 'primary',
        size: 'small',
        onClick: null // 페이지에서 핸들러 연결
      },
      {
        label: '삭제',
        variant: 'outlined',
        color: 'error',
        size: 'small',
        onClick: null // 페이지에서 핸들러 연결
      }
    ]
  }
];