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
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import apiService from '../../services/api';

const DepositSection = ({ user, onClose }) => {
  // 상태 관리
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  const [depositorName, setDepositorName] = useState('');
  const [memo, setMemo] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [showAmountField, setShowAmountField] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 쿨다운 관련 상태
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownSettings, setCooldownSettings] = useState(null);
  const [depositCooldownRemaining, setDepositCooldownRemaining] = useState(0);

  // 유저 정보에서 입금자명 설정
  useEffect(() => {
    if (user) {
      // 유저페이지와 동일한 형식으로 입금자명 설정 (account_holder account_number bank_name)
      if (user.account_holder && user.account_number && user.bank_name) {
        setDepositorName(`${user.account_holder} ${user.account_number} ${user.bank_name}`);
      } else {
        // 계좌 정보가 없는 경우 기존 방식 사용
        setDepositorName(`${user.name || ''} (${user.username || ''})`);
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
      const response = await apiService.deposit.getCooldownSettings();
      if (response.data.success && response.data.data) {
        setCooldownSettings(response.data.data);
        
        // 로컬스토리지에서 마지막 문의 시간 확인
        const lastInquiryTime = localStorage.getItem('agentDepositInquiryTime');
        const lastAccountInfo = localStorage.getItem('agentDepositAccountInfo');
        const lastDepositTime = localStorage.getItem('agentLastDepositTime');
        
        // 계좌문의 쿨다운 체크
        if (lastInquiryTime && response.data.data.enabled) {
          const now = Date.now();
          const elapsed = now - parseInt(lastInquiryTime);
          const cooldownMs = (response.data.data.cooldown_seconds || 300) * 1000;
          
          if (elapsed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
            setCooldownRemaining(remaining);
            
            // 저장된 계좌정보 복원
            if (lastAccountInfo) {
              try {
                const accountData = JSON.parse(lastAccountInfo);
                setDepositAccount(`${accountData.bank_name} ${accountData.account_number} (예금주: ${accountData.account_holder})`);
                setAccountInfo(accountData);
                setShowAmountField(true);
              } catch (e) {
                console.error('계좌정보 파싱 오류:', e);
              }
            }
          } else {
            localStorage.removeItem('agentDepositInquiryTime');
            localStorage.removeItem('agentDepositAccountInfo');
          }
        }
        
        // 입금신청 쿨다운 체크
        if (lastDepositTime && response.data.data.enabled) {
          const now = Date.now();
          const elapsed = now - parseInt(lastDepositTime);
          const cooldownMs = (response.data.data.cooldown_seconds || 300) * 1000;
          
          if (elapsed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
            setDepositCooldownRemaining(remaining);
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
            setDepositAccount('');
            setAccountInfo(null);
            setShowAmountField(false);
            localStorage.removeItem('agentDepositInquiryTime');
            localStorage.removeItem('agentDepositAccountInfo');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // 입금신청 쿨다운 타이머
  useEffect(() => {
    if (depositCooldownRemaining > 0) {
      const timer = setInterval(() => {
        setDepositCooldownRemaining(prev => {
          if (prev <= 1) {
            localStorage.removeItem('agentLastDepositTime');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [depositCooldownRemaining]);

  // 계좌문의 함수
  const inquireAccount = async () => {
    if (isLoadingAccount || cooldownRemaining > 0) return;
    
    setIsLoadingAccount(true);
    setError('');
    
    try {
      const response = await apiService.deposit.getBankAccount();
      if (response.data.success && response.data.data) {
        const { bank_name, account_number, account_holder } = response.data.data;
        setDepositAccount(`${bank_name} ${account_number} (예금주: ${account_holder})`);
        setAccountInfo(response.data.data);
        setShowAmountField(true);
        
        // 로컬스토리지에 문의 시간과 계좌정보 저장
        localStorage.setItem('agentDepositInquiryTime', Date.now().toString());
        localStorage.setItem('agentDepositAccountInfo', JSON.stringify(response.data.data));
        
        // 쿨다운 설정이 있으면 타이머 시작
        if (cooldownSettings && cooldownSettings.enabled && cooldownSettings.cooldown_seconds > 0) {
          setCooldownRemaining(cooldownSettings.cooldown_seconds);
        }
      } else {
        setError('관리자에게 계좌를 문의해주세요.');
      }
    } catch (error) {
      console.error('계좌정보 조회 실패:', error);
      setError('관리자에게 계좌를 문의해주세요.');
    } finally {
      setIsLoadingAccount(false);
    }
  };

  // 금액 빠른 입력
  const setQuickAmount = (amount) => {
    const currentAmount = parseInt(depositAmount.replace(/,/g, '') || '0');
    const newAmount = currentAmount + amount;
    setDepositAmount(newAmount.toString());
  };

  // 금액 정정
  const clearAmount = () => {
    setDepositAmount('');
  };

  // 입금 신청
  const submitDeposit = async () => {
    if (depositCooldownRemaining > 0) {
      setError(`입금 신청은 ${formatRemainingTime(depositCooldownRemaining)} 후에 가능합니다.`);
      return;
    }
    
    if (!depositAmount) {
      setError('신청금액을 입력해주세요.');
      return;
    }
    
    if (!accountInfo) {
      setError('먼저 입금계좌문의를 해주세요.');
      return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiService.deposit.createInquiry({
        amount: parseInt(depositAmount.replace(/,/g, '')),
        depositorName: depositorName,
        memo: memo
      });
      
      if (response.data.success) {
        setSuccess('입금신청이 완료되었습니다.');
        setDepositAmount('');
        setMemo('');
        setShowAmountField(false);
        setDepositAccount('');
        setAccountInfo(null);
        
        // 쿨다운 시작
        if (cooldownSettings && cooldownSettings.enabled && cooldownSettings.cooldown_seconds > 0) {
          setDepositCooldownRemaining(cooldownSettings.cooldown_seconds);
          localStorage.setItem('agentLastDepositTime', Date.now().toString());
        }
        
        // 3초 후 섹션 닫기
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('입금신청 실패:', error);
      setError(error.response?.data?.error || '입금신청 중 오류가 발생했습니다.');
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
          입금신청
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 에러 및 성공 메시지 */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* 계좌문의 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AccountBalanceIcon />}
            onClick={inquireAccount}
            disabled={isLoadingAccount || cooldownRemaining > 0}
            sx={{
              backgroundColor: '#1BC5BD',
              '&:hover': { backgroundColor: '#16A39F' }
            }}
          >
            {isLoadingAccount ? '조회 중...' : 
             cooldownRemaining > 0 ? `재문의 가능: ${formatRemainingTime(cooldownRemaining)}` : 
             '입금계좌문의'}
          </Button>
        </Box>
        
        <TextField
          fullWidth
          size="small"
          readOnly
          value={depositAccount}
          placeholder="입금계좌를 확인해주세요"
          InputProps={{
            readOnly: true,
            sx: { backgroundColor: '#ffffff' }
          }}
        />
      </Box>

      {/* 쿨다운 안내 메시지 */}
      {cooldownRemaining > 0 && accountInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          계좌정보는 {formatRemainingTime(cooldownRemaining)} 후에 자동으로 초기화됩니다.
        </Alert>
      )}

      {/* 입금자명 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          입금자명
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={depositorName}
          readOnly
          InputProps={{
            readOnly: true,
            sx: { backgroundColor: '#f5f5f5' }
          }}
        />
      </Box>

      {/* 신청금액 - 계좌문의 후에만 표시 */}
      {showAmountField && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              신청금액
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="신청금액을 입력해주세요"
                value={depositAmount ? formatNumber(depositAmount) : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setDepositAmount(value);
                }}
                sx={{ backgroundColor: '#ffffff' }}
              />
              <Button
                variant="contained"
                onClick={submitDeposit}
                disabled={isSubmitting || !accountInfo || !depositAmount || depositCooldownRemaining > 0}
                sx={{
                  minWidth: '120px',
                  backgroundColor: '#3699FF',
                  '&:hover': { backgroundColor: '#187DE4' }
                }}
              >
                {isSubmitting ? '처리 중...' : 
                 depositCooldownRemaining > 0 ? `${formatRemainingTime(depositCooldownRemaining)}` : 
                 '입금신청'}
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
                color="primary"
                variant="outlined"
                size="small"
                clickable
              />
            ))}
            <Chip
              label="정정"
              onClick={clearAmount}
              color="error"
              variant="outlined"
              size="small"
              clickable
            />
          </Box>

          {/* 입금신청 쿨다운 안내 */}
          {depositCooldownRemaining > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              입금 신청 후 {cooldownSettings && cooldownSettings.cooldown_seconds < 60 ? 
                `${cooldownSettings.cooldown_seconds}초` : 
                `${Math.floor((cooldownSettings?.cooldown_seconds || 300) / 60)}분`}간 추가 신청이 제한됩니다. 
              {formatRemainingTime(depositCooldownRemaining)} 후에 다시 시도해주세요.
            </Alert>
          )}
        </>
      )}

      {/* 유의사항 */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          입금 유의사항
        </Typography>
        <Typography variant="caption" component="div" sx={{ lineHeight: 1.6 }}>
          • 입력하신 입금자명으로 입금하셔야 합니다.<br />
          • 입금자명이 불일치시 충전 처리가 불가합니다.<br />
          • 은행 점검 시간(23:00~00:30) 동안은 입출금이 지연될 수 있습니다.<br />
          • 입금 계좌는 수시로 변경될 수 있으니 입금 전 계좌번호를 확인해 주시기 바랍니다.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DepositSection;