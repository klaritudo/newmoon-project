import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon,
  MoneyOff as MoneyOffIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import apiService from '../../services/api';

const WithdrawalSection = ({ user, onClose }) => {
  // 상태 관리
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAccount, setWithdrawalAccount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 쿨다운 관련 상태
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownSettings, setCooldownSettings] = useState(null);

  // 유저 정보에서 계좌 정보 초기 설정
  useEffect(() => {
    if (user) {
      // 계좌 정보를 통합된 형식으로 표시 (서버에서 올바른 필드명으로 전달됨)
      if (user.bank_name && user.account_number && user.account_holder) {
        setWithdrawalAccount(`${user.bank_name} ${user.account_number} (${user.account_holder})`);
      } else if (user.bank_name && user.account_number && user.name) {
        // 계좌 예금주가 없으면 에이전트 이름 사용
        setWithdrawalAccount(`${user.bank_name} ${user.account_number} (${user.name})`);
      }
    }
  }, [user]);

  // 쿨다운 설정 체크
  useEffect(() => {
    checkCooldown();
  }, []);

  // 쿨다운 체크 함수
  const checkCooldown = async () => {
    try {
      const response = await apiService.withdrawal.getCooldownSettings();
      if (response.data.success && response.data.data) {
        setCooldownSettings(response.data.data);
        
        // 로컬스토리지에서 마지막 출금 시간 확인
        const lastWithdrawalTime = localStorage.getItem('agentLastWithdrawalTime');
        
        // 출금신청 쿨다운 체크
        if (lastWithdrawalTime && response.data.data.enabled) {
          const now = Date.now();
          const elapsed = now - parseInt(lastWithdrawalTime);
          const cooldownMs = (response.data.data.cooldown_seconds || 300) * 1000;
          
          if (elapsed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
            setCooldownRemaining(remaining);
          }
        }
      }
    } catch (error) {
      console.error('쿨다운 설정 조회 실패:', error);
    }
  };

  // 쿨다운 타이머 업데이트
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            localStorage.removeItem('agentLastWithdrawalTime');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // 금액 빠른 입력
  const setQuickAmount = (amount) => {
    const currentAmount = parseInt(withdrawalAmount.replace(/,/g, '') || '0');
    const newAmount = currentAmount + amount;
    setWithdrawalAmount(newAmount.toString());
  };

  // 금액 정정
  const clearAmount = () => {
    setWithdrawalAmount('');
  };

  // 출금 신청
  const submitWithdrawal = async () => {
    if (cooldownRemaining > 0) {
      setError(`출금 신청은 ${formatRemainingTime(cooldownRemaining)} 후에 가능합니다.`);
      return;
    }
    
    if (!withdrawalAmount) {
      setError('출금액을 입력해주세요.');
      return;
    }
    
    if (!withdrawalAccount) {
      setError('출금계좌 정보가 설정되지 않았습니다.');
      return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    // 계좌 정보 파싱
    let bankName, accountNumber, accountHolder;
    
    const accountParts = withdrawalAccount.match(/(.+?)\s+(\d+[\d-]*)\s+\((.+)\)/);
    if (accountParts) {
      [, bankName, accountNumber, accountHolder] = accountParts;
    } else if (user && user.bank_name && user.account_number && user.account_holder) {
      // 파싱 실패 시 유저 데이터에서 직접 가져오기
      console.warn('계좌 정보 파싱 실패, 유저 데이터 사용');
      bankName = user.bank_name;
      accountNumber = user.account_number;
      accountHolder = user.account_holder;
    } else {
      setError('계좌 정보 파싱에 실패했습니다.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await apiService.withdrawal.createInquiry({
        amount: parseInt(withdrawalAmount.replace(/,/g, '')),
        bankName: bankName,
        accountNumber: accountNumber,
        accountHolder: accountHolder,
        memo: memo
      });
      
      if (response.data.success) {
        setSuccess('출금신청이 완료되었습니다.');
        setWithdrawalAmount('');
        setMemo('');
        
        // 쿨다운 시작
        if (cooldownSettings && cooldownSettings.enabled && cooldownSettings.cooldown_seconds > 0) {
          setCooldownRemaining(cooldownSettings.cooldown_seconds);
          localStorage.setItem('agentLastWithdrawalTime', Date.now().toString());
        }
        
        // 3초 후 섹션 닫기
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('출금신청 실패:', error);
      setError(error.response?.data?.error || '출금신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 숫자 포맷팅
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 남은 시간 포맷팅
  const formatRemainingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          출금신청
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 에러 및 성공 메시지 */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* 계좌정보 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          출금 계좌정보
        </Typography>
        
        <TextField
          fullWidth
          size="small"
          label="출금계좌"
          value={withdrawalAccount}
          readOnly
          placeholder="계좌 정보가 설정되지 않았습니다"
          sx={{ backgroundColor: '#f5f5f5' }}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <AccountBalanceIcon sx={{ mr: 1, color: 'text.secondary' }} />
            )
          }}
        />
      </Box>

      {/* 출금액 입력 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          출금액
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="출금액을 입력해주세요"
            value={withdrawalAmount ? formatNumber(withdrawalAmount) : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setWithdrawalAmount(value);
            }}
            sx={{ backgroundColor: '#ffffff' }}
          />
          <Button
            variant="contained"
            onClick={submitWithdrawal}
            disabled={isSubmitting || !withdrawalAmount || cooldownRemaining > 0}
            sx={{
              minWidth: '120px',
              backgroundColor: '#F64E60',
              '&:hover': { backgroundColor: '#EE2D41' }
            }}
          >
            {isSubmitting ? '처리 중...' : 
             cooldownRemaining > 0 ? `${formatRemainingTime(cooldownRemaining)}` : 
             '출금신청'}
          </Button>
        </Box>
      </Box>

      {/* 빠른 금액 버튼 */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {[10000, 50000, 100000, 500000, 1000000].map((amount) => (
          <Chip
            key={amount}
            label={`${formatNumber(amount / 10000)}만원`}
            onClick={() => setQuickAmount(amount)}
            color="error"
            variant="outlined"
            size="small"
            clickable
          />
        ))}
        <Chip
          label="정정"
          onClick={clearAmount}
          color="default"
          variant="outlined"
          size="small"
          clickable
        />
      </Box>

      {/* 출금신청 쿨다운 안내 */}
      {cooldownRemaining > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          출금 신청 후 {cooldownSettings && cooldownSettings.cooldown_seconds < 60 ? 
            `${cooldownSettings.cooldown_seconds}초` : 
            `${Math.floor((cooldownSettings?.cooldown_seconds || 300) / 60)}분`}간 추가 신청이 제한됩니다. 
          {formatRemainingTime(cooldownRemaining)} 후에 다시 시도해주세요.
        </Alert>
      )}

      {/* 유의사항 */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          출금 유의사항
        </Typography>
        <Typography variant="caption" component="div" sx={{ lineHeight: 1.6 }}>
          • 출금 계좌는 본인 명의 계좌만 가능합니다.<br />
          • 출금 신청 후 취소가 불가능하니 신중히 신청해주세요.<br />
          • 은행 점검 시간(23:00~00:30) 동안은 출금이 지연될 수 있습니다.<br />
          • 출금 수수료는 회원님이 부담합니다.
        </Typography>
      </Box>
    </Paper>
  );
};

export default WithdrawalSection;