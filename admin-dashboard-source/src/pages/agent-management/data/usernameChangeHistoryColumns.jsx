import React from 'react';
import { Chip } from '@mui/material';

export const usernameChangeHistoryColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 60,
    sortable: false,
    filterable: false,
    align: 'center',
    type: 'number'  // number 타입으로 지정해야 연속번호/페이지별번호가 작동
  },
  {
    id: 'changeDate',
    label: '변경일시',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    id: 'agentId',
    label: '에이전트',
    width: 120,
    sortable: true,
    filterable: true
  },
  {
    id: 'oldUsername',
    label: '이전 아이디',
    width: 120,
    sortable: true,
    filterable: true
  },
  {
    id: 'newUsername',
    label: '변경된 아이디',
    width: 120,
    sortable: true,
    filterable: true
  },
  {
    id: 'nickname',
    label: '닉네임',
    width: 120,
    sortable: true,
    filterable: true
  },
  {
    id: 'changeReason',
    label: '변경사유',
    width: 200,
    sortable: false,
    filterable: true
  },
  {
    id: 'currentBalance',
    label: '현재 보유금',
    width: 120,
    sortable: true,
    filterable: false,
    align: 'right',
    type: 'currency'
  },
  {
    id: 'gameStatus',
    label: '게임상태',
    width: 100,
    sortable: true,
    filterable: true,
    type: 'chip',
    renderCell: (value) => ({
      label: value,
      color: value === '게임중' ? 'error' : 'success',
      variant: 'outlined'
    })
  },
  {
    id: 'processor',
    label: '처리자',
    width: 100,
    sortable: true,
    filterable: true
  },
  {
    id: 'ipAddress',
    label: 'IP주소',
    width: 120,
    sortable: true,
    filterable: true
  },
  {
    id: 'note',
    label: '비고',
    width: 150,
    sortable: false,
    filterable: false
  }
];