import React from 'react';
import { Chip, Switch, IconButton, Tooltip } from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

/**
 * 게임머니 쿠폰 목록 테이블 컬럼 정의
 */
export const couponListColumns = [
  {
    id: 'code',
    label: '쿠폰 코드',
    width: 150,
    sortable: true,
    render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {row.code}
        </Typography>
        <Tooltip title="복사">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(row.code);
            }}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  },
  {
    id: 'gameMoney',
    label: '지급 게임머니',
    width: 120,
    sortable: true,
    align: 'right',
    render: (row) => (
      <Typography variant="body2" fontWeight="medium" color="primary">
        {row.gameMoney}
      </Typography>
    )
  },
  {
    id: 'targetType',
    label: '대상',
    width: 100,
    render: (row) => (
      <Chip
        label={row.targetType === 'all' ? '모든 회원' : '특정 회원'}
        size="small"
        variant="outlined"
        color={row.targetType === 'all' ? 'default' : 'primary'}
      />
    )
  },
  {
    id: 'maxUses',
    label: '최대 사용',
    width: 100,
    align: 'center',
    render: (row) => (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          {row.usedCount}/{row.maxUses}
        </Typography>
      </Box>
    )
  },
  {
    id: 'expiryDate',
    label: '만료일',
    width: 100,
    sortable: true,
    render: (row) => (
      <Typography 
        variant="body2" 
        color={row.expiryDate === '무제한' ? 'text.secondary' : 'text.primary'}
      >
        {row.expiryDate}
      </Typography>
    )
  },
  {
    id: 'status',
    label: '상태',
    width: 80,
    align: 'center',
    render: (row, actionHandlers) => (
      <Switch
        size="small"
        checked={row.status === 'active'}
        onChange={() => actionHandlers.handleToggleStatus(row.id)}
        color="primary"
      />
    )
  },
  {
    id: 'description',
    label: '설명',
    width: 200,
    render: (row) => (
      <Typography variant="body2" color="text.secondary" sx={{ 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {row.description}
      </Typography>
    )
  },
  {
    id: 'createdAt',
    label: '생성일',
    width: 100,
    sortable: true,
    render: (row) => new Date(row.createdAt).toLocaleDateString()
  }
];

/**
 * 쿠폰 지급 내역 테이블 컬럼 정의
 */
export const couponHistoryColumns = [
  {
    id: 'grantedAt',
    label: '지급 시간',
    width: 150,
    sortable: true,
    render: (row) => new Date(row.grantedAt || row.appliedAt).toLocaleString()
  },
  {
    id: 'userId',
    label: '회원 ID',
    width: 100,
    sortable: true
  },
  {
    id: 'userName',
    label: '회원명',
    width: 100
  },
  {
    id: 'couponCode',
    label: '쿠폰 방식',
    width: 150,
    render: (row) => (
      <Typography variant="body2" fontWeight="medium">
        {row.couponCode}
      </Typography>
    )
  },
  {
    id: 'gameMoney',
    label: '지급 게임머니',
    width: 120,
    align: 'right',
    render: (row) => (
      <Typography 
        variant="body2" 
        fontWeight="medium" 
        color={row.status === 'success' ? 'primary' : 'text.secondary'}
      >
        {row.gameMoney || row.discount}
      </Typography>
    )
  },
  {
    id: 'description',
    label: '지급 사유',
    width: 200,
    render: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.description || '-'}
      </Typography>
    )
  },
  {
    id: 'status',
    label: '상태',
    width: 80,
    align: 'center',
    render: (row) => (
      <Chip
        label={row.status === 'success' ? '성공' : '실패'}
        size="small"
        color={row.status === 'success' ? 'success' : 'error'}
        variant="outlined"
      />
    )
  },
  {
    id: 'adminId',
    label: '처리자',
    width: 100,
    render: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.adminId || row.ip || '-'}
      </Typography>
    )
  }
];

// Box와 Typography import 누락 수정
import { Box, Typography } from '@mui/material';

/**
 * 게임머니 쿠폰 데이터 생성기
 */
export const generateCouponData = (count = 20) => {
  const targetTypes = ['all', 'specific'];
  const statuses = ['active', 'inactive'];
  const coupons = [];

  for (let i = 0; i < count; i++) {
    const gameMoney = (Math.floor(Math.random() * 20) + 1) * 10000;
    
    coupons.push({
      id: `coupon_${i + 1}`,
      code: `GAME${String(i + 1).padStart(4, '0')}`,
      gameMoney: `${gameMoney.toLocaleString()}원`,
      gameMoneyRaw: gameMoney,
      targetType: targetTypes[Math.floor(Math.random() * targetTypes.length)],
      maxUses: Math.random() > 0.5 ? String(Math.floor(Math.random() * 100) + 1) : '무제한',
      usedCount: Math.floor(Math.random() * 50),
      expiryDate: Math.random() > 0.5 ? 
        new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
        '무제한',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `게임머니 쿠폰 ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return coupons;
};

/**
 * 쿠폰 지급 내역 데이터 생성기
 */
export const generateCouponHistoryData = (count = 50) => {
  const statuses = ['success'];
  const userNames = ['홍길동', '김철수', '이영희', '박민수', '정지원'];
  const grantTypes = ['관리자 직접 지급', 'GAME0001', 'GAME0002', 'EVENT2024', 'WELCOME100'];
  const descriptions = ['이벤트 보상', 'VIP 특별 혜택', '신규 가입 축하', '온라인 이벤트', '고객 감사 혜택'];
  const history = [];

  for (let i = 0; i < count; i++) {
    const isAdminGrant = Math.random() > 0.5;
    const gameMoney = (Math.floor(Math.random() * 50) + 1) * 10000;
    
    history.push({
      id: `history_${i + 1}`,
      userId: `user${Math.floor(Math.random() * 1000) + 1}`,
      userName: userNames[Math.floor(Math.random() * userNames.length)],
      couponCode: isAdminGrant ? '관리자 직접 지급' : grantTypes[Math.floor(Math.random() * (grantTypes.length - 1)) + 1],
      gameMoney: `${gameMoney.toLocaleString()}원`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status: 'success',
      grantedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      adminId: isAdminGrant ? `admin${Math.floor(Math.random() * 10) + 1}` : null
    });
  }

  return history.sort((a, b) => new Date(b.grantedAt) - new Date(a.grantedAt));
};