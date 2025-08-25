import React from 'react';
import { Chip } from '@mui/material';
import { SwapHoriz, Timer } from '@mui/icons-material';

export const changeUsernameColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 60,
    sortable: false,
    filterable: false,
    align: 'center',
    type: 'number'
  },
  {
    id: 'userId',
    label: '아이디',
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
    id: 'agentId',
    label: '에이전트',
    width: 100,
    sortable: true,
    filterable: true
  },
  {
    id: 'level',
    label: '레벨',
    width: 80,
    sortable: true,
    filterable: true,
    type: 'chip',
    render: (value) => value
  },
  {
    id: 'ipAddress',
    label: 'IP주소',
    width: 120,
    sortable: true,
    filterable: true
  },
  {
    id: 'device',
    label: '접속기기',
    width: 80,
    sortable: true,
    filterable: true,
    type: 'chip',
    render: (value) => value
  },
  {
    id: 'gameStatus',
    label: '접속상태',
    width: 100,
    sortable: true,
    filterable: true,
    type: 'chip',
    render: (value) => value,
    chipColor: (value) => {
      switch(value) {
        case '로비대기': return 'success';
        case '게임중': return 'warning';
        default: return 'default';
      }
    }
  },
  {
    id: 'runningTimeFormatted',
    label: '게임접속 러닝타임',
    width: 150,
    sortable: false,
    filterable: false,
    type: 'custom',
    render: (row) => {
      // 실시간으로 러닝타임 계산
      const loginTime = new Date(row.loginTime);
      const now = new Date();
      const runningSeconds = Math.floor((now - loginTime) / 1000);
      
      const hours = Math.floor(runningSeconds / 3600);
      const minutes = Math.floor((runningSeconds % 3600) / 60);
      const seconds = runningSeconds % 60;
      
      let formattedTime;
      if (hours > 0) {
        formattedTime = `${hours}시간 ${minutes}분`;
      } else if (minutes > 0) {
        formattedTime = `${minutes}분 ${seconds}초`;
      } else {
        formattedTime = `${seconds}초`;
      }
      
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
          <Timer fontSize="small" color="action" />
          <span>{formattedTime}</span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    label: '액션',
    width: 140,
    sortable: false,
    filterable: false,
    align: 'center',
    type: 'button',
    buttonText: '아이디바꿔주기',
    buttonColor: 'primary',
    buttonVariant: 'contained',
    buttonSize: 'small',
    onClick: (row) => {
      console.log('아이디바꿔주기 클릭:', row);
    }
  }
];