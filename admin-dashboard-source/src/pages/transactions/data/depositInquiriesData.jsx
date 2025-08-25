import React from 'react';
import { Chip, IconButton, Stack, Button } from '@mui/material';
import { CheckCircle, Schedule, Cancel } from '@mui/icons-material';
import ParentChips from '../../../components/baseTemplate/components/ParentChips';

// 입금문의 상태 옵션
export const depositStatusOptions = [
  { value: 'pending', label: '요청 중' },
  { value: 'waiting', label: '대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '비승인' }
];

// 상태별 칩 스타일 정의
export const getDepositStatusChipStyle = (status) => {
  switch (status) {
    case 'pending':
      return { color: 'warning', variant: 'filled' };
    case 'waiting':
      return { color: 'info', variant: 'filled' };
    case 'approved':
      return { color: 'success', variant: 'filled' };
    case 'rejected':
      return { color: 'error', variant: 'filled' };
    default:
      return { color: 'default', variant: 'filled' };
  }
};

// 상태 텍스트 변환
export const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '요청 중';
    case 'waiting':
      return '대기';
    case 'approved':
      return '승인';
    case 'rejected':
      return '비승인';
    default:
      return status;
  }
};

// 입금문의 컬럼 정의
export const depositInquiriesColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 80,
    sortable: false,
    alwaysVisible: true,
    type: 'number'
  },
  {
    id: 'type',
    label: '입금유형',
    width: 100,
    sortable: false,
    type: 'chip',
    render: () => ({ label: '입금', color: 'primary', variant: 'outlined' })
  },
  {
    id: 'username',
    label: '아이디(닉네임)',
    width: 200,
    sortable: true,
    type: 'custom',
    render: (row) => (
      <span style={{ color: '#1976d2', cursor: 'pointer' }}>
        {row.username} {row.nickname && `(${row.nickname})`}
      </span>
    )
  },
  {
    id: 'level_name',
    label: '유형',
    width: 120,
    sortable: true,
    type: 'custom',
    render: (row) => {
      if (!row.level_name) return '-';
      return (
        <Chip
          label={row.level_name}
          size="small"
          sx={{
            backgroundColor: row.backgroundColor || '#e8f5e9',
            color: row.borderColor || '#2e7d32',
            border: `1px solid ${row.borderColor || '#2e7d32'}`,
            fontWeight: 400,
            borderRadius: '50px',
            padding: '0 8px',
            height: '28px',
            fontSize: '0.8rem',
            '&:hover': {
              backgroundColor: row.backgroundColor || '#e8f5e9'
            }
          }}
        />
      );
    }
  },
  {
    id: 'parentAgents',
    label: '상위에이전트',
    width: 200,
    sortable: false,
    type: 'custom',
    render: (row) => {
      if (!row.parentAgents || row.parentAgents.length === 0) {
        return '-';
      }
      // parentAgents 배열을 ParentChips 컴포넌트에 맞는 형식으로 변환
      const parentChipsData = row.parentAgents.map(agent => ({
        label: agent.username,
        nickname: agent.nickname,
        backgroundColor: agent.backgroundColor || '#e8f5e9',
        borderColor: agent.borderColor || '#2e7d32'
      }));
      
      return (
        <ParentChips 
          parentTypes={parentChipsData}
          direction="row"
        />
      );
    }
  },
  {
    id: 'amount',
    label: '신청금액',
    width: 150,
    sortable: true,
    type: 'custom',
    render: (row) => {
      const requestedAmount = Math.floor(row.requested_amount || row.amount || 0);
      const bonusAmount = Math.floor(row.bonus_amount || 0);
      
      // 보너스가 있는 경우
      if (bonusAmount > 0) {
        return (
          <span>
            {requestedAmount.toLocaleString()}
            <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
              ({bonusAmount.toLocaleString()})
            </span>
            원
          </span>
        );
      }
      
      // 보너스가 없는 경우
      return `${requestedAmount.toLocaleString()}원`;
    }
  },
  {
    id: 'before_balance',
    label: '처리전금액',
    width: 120,
    sortable: true,
    type: 'custom',
    render: (row) => {
      // 현재 잔액을 처리전금액으로 표시 (pending, waiting 상태)
      // 처리된 경우 현재잔액에서 역산
      if (row.status === 'pending' || row.status === 'waiting') {
        return `${Math.floor(row.current_balance || 0).toLocaleString()}원`;
      } else if (row.status === 'approved') {
        // 입금 승인된 경우: 현재잔액 - 지급액(보너스 포함) = 처리전금액
        const creditedAmount = row.credited_amount || row.final_amount || row.amount || 0;
        const beforeBalance = (row.current_balance || 0) - creditedAmount;
        return `${Math.floor(beforeBalance).toLocaleString()}원`;
      }
      return `${Math.floor(row.current_balance || 0).toLocaleString()}원`;
    }
  },
  {
    id: 'after_balance',
    label: '처리후금액',
    width: 120,
    sortable: true,
    type: 'custom',
    render: (row) => {
      // 처리된 경우에만 표시
      if (row.status === 'approved') {
        // 입금 승인된 경우: 현재잔액이 처리후금액
        return `${Math.floor(row.current_balance || 0).toLocaleString()}원`;
      } else if (row.status === 'rejected') {
        // 비승인된 경우: 잔액 변화 없음
        return `${Math.floor(row.current_balance || 0).toLocaleString()}원`;
      }
      return '-';
    }
  },
  {
    id: 'bank_name',
    label: '은행명',
    width: 100,
    sortable: true,
    type: 'custom',
    render: (row) => row.deposit_bank_name || '-'
  },
  {
    id: 'account_number',
    label: '계좌번호',
    width: 150,
    sortable: true,
    type: 'custom',
    render: (row) => row.deposit_account_number || '-'
  },
  {
    id: 'account_holder',
    label: '예금주',
    width: 100,
    sortable: true,
    type: 'custom',
    render: (row) => row.deposit_account_holder || '-'
  },
  {
    id: 'status',
    label: '상태',
    width: 100,
    sortable: true,
    type: 'custom',
    render: (row) => (
      <Chip
        label={getStatusText(row.status)}
        size="small"
        {...getDepositStatusChipStyle(row.status)}
      />
    )
  },
  {
    id: 'created_at',
    label: '신청일시',
    width: 180,
    sortable: true,
    type: 'custom',
    render: (row) => {
      if (!row.created_at) return '-';
      const date = new Date(row.created_at);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  },
  {
    id: 'processed_at',
    label: '처리일시',
    width: 180,
    sortable: true,
    type: 'custom',
    render: (row) => {
      // 처리 완료된 상태에서만 처리일시 표시
      if (row.status !== 'approved' && row.status !== 'rejected') {
        return '-';
      }
      if (!row.processed_at) return '-';
      const date = new Date(row.processed_at);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  },
  {
    id: 'processor',
    label: '처리자',
    width: 120,
    sortable: true,
    type: 'custom',
    render: (row) => {
      // 처리된 상태인 경우에만 처리자 표시
      if (row.status === 'approved' || row.status === 'rejected') {
        return row.processor_username || '-';
      }
      return '-';
    }
  },
  {
    id: 'reject_reason',
    label: '비승인 사유',
    width: 120,
    sortable: false,
    type: 'custom',
    render: (row, handlers) => {
      if (row.status === 'rejected' && row.reject_reason) {
        return (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handlers?.onViewRejectReason?.(row)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            사유 보기
          </Button>
        );
      }
      return '-';
    }
  },
  {
    id: 'actions',
    label: '액션',
    width: 150,
    sortable: false,
    type: 'custom',
    render: (row, handlers) => {
      // 이미 처리 완료된 경우
      if (row.status === 'approved' || row.status === 'rejected') {
        return '-';
      }
      
      return (
        <Stack direction="row" spacing={0.5}>
          {/* pending 또는 waiting 상태에서 승인 버튼 표시 */}
          {(row.status === 'pending' || row.status === 'waiting') && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => handlers?.onApprove?.(row)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              승인
            </Button>
          )}
          
          {/* pending 상태에서만 대기 버튼 표시 */}
          {row.status === 'pending' && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handlers?.onWait?.(row)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              대기
            </Button>
          )}
          
          {/* pending 또는 waiting 상태에서 비승인 버튼 표시 */}
          {(row.status === 'pending' || row.status === 'waiting') && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handlers?.onReject?.(row)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              비승인
            </Button>
          )}
        </Stack>
      );
    }
  }
];

// 컬럼 버전 (컬럼 구조 변경 시 증가)
// v10: 처리일시 컬럼 추가, 24시간 형식 적용
// v11: 대기 상태에서도 승인/비승인 버튼 표시
// v12: 비승인 사유 컬럼 추가
// v13: 비승인 사유를 다이얼로그로 표시
// v14: No. 컬럼을 id에서 no로 변경하여 순차 번호 표시
// v15: type: 'default' 제거 및 render 함수 문제 해결
// v16: 은행명, 계좌번호, 예금주 필드명 수정 (deposit_ prefix 추가)
// v17: 모든 render 함수가 있는 컬럼에 type: 'custom' 추가
// v18: processor_username 컬럼 제거 (DB에 processor_id 필드 없음)
// v19: processor 컬럼 추가 (처리 상태에 따라 '관리자' 표시)
// v20: 처리전금액/처리후금액 컬럼 추가, 금액->신청금액 변경, 소수점 제거
// v21: 처리자 컬럼에 실제 처리한 관리자 아이디 표시
// v22: 입금 보너스 표시 기능 추가 (신청금액(충전금액) 형식)
// v23: 입금 보너스 표시 수정 (신청금액(보너스금액) 형식으로 변경) 및 처리전금액 계산 수정
export const DEPOSIT_INQUIRIES_COLUMNS_VERSION = 23;