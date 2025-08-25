import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  MenuItem, 
  FormControlLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Grid,
  Switch,
  Autocomplete,
  Chip,
  InputAdornment,
  Tooltip,
  Paper,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { 
  Close,
  Person,
  AccountCircle,
  Lock,
  Phone,
  AccountBalance,
  CreditCard,
  Person as PersonIcon,
  Settings,
  Casino,
  Language,
  Link,
  Add,
  TrendingDown,
  MonetizationOn,
  SportsEsports,
  Games,
  VideogameAsset,
  PercentOutlined,
  RemoveCircleOutline,
  RequestQuote,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import '../../styles/createMemberDialog.css';
import { 
  initialMemberData, 
  banks, 
  handleNewMemberChange, 
  handleSubmit, 
  handleAddUrl, 
  resetForm 
} from './CreateMemberDialog.js';
import apiService from '../../services/api';

// 공통 스타일을 정의
const commonStyles = {
  '& .MuiInputBase-root': {
    height: '48px'  // 입력 필드 높이 증가
  },
  '& .MuiInputBase-inputMultiline': {
    height: 'auto !important'  // 메모 필드는 자동 높이 유지
  }
};

/**
 * 회원 생성 다이얼로그 컴포넌트
 */
const CreateMemberDialog = ({ open, onClose, members, onCreateMember }) => {
  // 상태 - 안전한 초기값 보장
  const [newMemberData, setNewMemberData] = useState(() => ({ ...initialMemberData }));
  const [formErrors, setFormErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  
  // 다이얼로그가 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      resetForm(setNewMemberData, setFormErrors);
      setUsernameAvailable(null);
      setNicknameAvailable(null);
    }
  }, [open]);

  // 아이디 유효성 검사
  const validateUsername = (username) => {
    if (!username) {
      return '아이디를 입력해주세요.';
    }
    if (username.length < 4 || username.length > 10) {
      return '아이디는 4자 이상 10자 이하로 입력해주세요.';
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return '아이디는 영문과 숫자만 사용 가능합니다.';
    }
    return null;
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (!password) {
      return '비밀번호를 입력해주세요.';
    }
    if (password.length < 5) {
      return '비밀번호는 5자 이상이어야 합니다.';
    }
    return null;
  };

  // 닉네임 유효성 검사
  const validateNickname = (nickname) => {
    if (!nickname) {
      return '닉네임을 입력해주세요.';
    }
    if (nickname.length < 3) {
      return '닉네임은 3자 이상이어야 합니다.';
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
      return '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
    }
    return null;
  };

  // 아이디 중복 체크
  const checkUsernameAvailability = useCallback(async (username) => {
    // 먼저 유효성 검사
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameAvailable(false);
      setFormErrors(prev => ({
        ...prev,
        username: validationError
      }));
      return;
    }

    console.log('아이디 중복 체크 시작:', username);
    setIsCheckingUsername(true);
    try {
      const response = await apiService.members.checkUsername(username);
      console.log('중복 체크 응답:', response.data);
      setUsernameAvailable(response.data.available);
      if (!response.data.available) {
        setFormErrors(prev => ({
          ...prev,
          username: response.data.message
        }));
      } else {
        setFormErrors(prev => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('아이디 중복 체크 실패:', error);
      console.error('에러 상세:', error.response);
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  // 닉네임 중복 체크
  const checkNicknameAvailability = useCallback(async (nickname) => {
    // 먼저 유효성 검사
    const validationError = validateNickname(nickname);
    if (validationError) {
      setNicknameAvailable(false);
      setFormErrors(prev => ({
        ...prev,
        nickname: validationError
      }));
      return;
    }

    console.log('닉네임 중복 체크 시작:', nickname);
    setIsCheckingNickname(true);
    try {
      const response = await apiService.members.checkNickname(nickname);
      console.log('닉네임 중복 체크 응답:', response.data);
      setNicknameAvailable(response.data.available);
      if (!response.data.available) {
        setFormErrors(prev => ({
          ...prev,
          nickname: response.data.message
        }));
      } else {
        setFormErrors(prev => {
          const { nickname, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('닉네임 중복 체크 실패:', error);
      console.error('에러 상세:', error.response);
    } finally {
      setIsCheckingNickname(false);
    }
  }, []);

  // 아이디 입력 시 디바운스로 중복 체크
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newMemberData.username) {
        checkUsernameAvailability(newMemberData.username);
      }
    }, 500); // 0.5초 후 체크

    return () => clearTimeout(timer);
  }, [newMemberData.username, checkUsernameAvailability]);
  
  // 닉네임 입력 시 디바운스로 중복 체크
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newMemberData.nickname && !newMemberData.bulkCreation) {
        checkNicknameAvailability(newMemberData.nickname);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newMemberData.nickname, newMemberData.bulkCreation, checkNicknameAvailability]);

  // agent_levels 데이터 가져오기
  const [agentLevels, setAgentLevels] = useState([]);
  
  useEffect(() => {
    const fetchAgentLevels = async () => {
      try {
        const response = await apiService.agentLevels.getAll();
        if (response.data?.data) {
          setAgentLevels(response.data.data.sort((a, b) => a.level - b.level));
        }
      } catch (error) {
        console.error('Failed to fetch agent levels:', error);
      }
    };
    
    if (open) {
      fetchAgentLevels();
    }
  }, [open]);
  
  // 상부 선택 시 본사 여부 확인 및 자동 agent_level 설정
  useEffect(() => {
    if (newMemberData.parentId && members && agentLevels.length > 0) {
      const selectedParent = members.find(m => m.id === newMemberData.parentId);
      if (selectedParent) {
        // 본사 여부 확인
        if (selectedParent.type === '본사' || selectedParent.agent_level_name === '본사') {
          setNewMemberData(prev => ({
            ...prev,
            isHeadquarters: true
          }));
        } else {
          setNewMemberData(prev => ({
            ...prev,
            isHeadquarters: false,
            memberPageUrlStandard: '',
            bettingStandard: '',
            agentManagerUrl: '',
            memberPageUrl: ''
          }));
        }
        
        // 상위 회원의 롤링% 정보 설정
        setNewMemberData(prev => ({
          ...prev,
          parentRollingPercent: {
            slot: selectedParent.rolling_slot_percent || selectedParent.rollingPercent || 0,
            casino: selectedParent.rolling_casino_percent || selectedParent.rollingPercent || 0
          }
        }));
        
        // 상위 회원의 agent_level_id를 기반으로 하위 레벨 자동 설정
        if (selectedParent.agent_level_id) {
          const parentLevel = agentLevels.find(level => level.id === selectedParent.agent_level_id);
          if (parentLevel) {
            // 다음 레벨 찾기 (parent level + 1)
            const nextLevel = agentLevels.find(level => level.level === parentLevel.level + 1);
            if (nextLevel) {
              setNewMemberData(prev => ({
                ...prev,
                agent_level_id: nextLevel.id
              }));
            }
          }
        }
      }
    }
  }, [newMemberData.parentId, members, agentLevels]);
  
  // 폼 제출 핸들러
  const onSubmit = async () => {
    const errors = {};
    
    // 필수 필드 검증
    if (!newMemberData.parentId) {
      errors.parentId = '상부를 선택해주세요.';
    }
    
    // 일괄생성 모드일 때 검증
    if (newMemberData.bulkCreation) {
      if (!newMemberData.username?.trim()) {
        errors.username = '아이디 접두사를 입력해주세요.';
      }
      
      const start = parseInt(newMemberData.usernamePattern.start);
      const end = parseInt(newMemberData.usernamePattern.end);
      
      if (!newMemberData.usernamePattern.start || isNaN(start)) {
        errors['usernamePattern.start'] = '시작 번호를 입력해주세요.';
      }
      if (!newMemberData.usernamePattern.end || isNaN(end)) {
        errors['usernamePattern.end'] = '끝 번호를 입력해주세요.';
      }
      if (start && end && start > end) {
        errors['usernamePattern.end'] = '끝 번호는 시작 번호보다 커야 합니다.';
      }
      if (start && end && (end - start) > 50) {
        errors['usernamePattern.end'] = '한 번에 최대 50개까지만 생성 가능합니다.';
      }
    } else {
      // 단일 생성 모드일 때 검증
      const usernameError = validateUsername(newMemberData.username);
      if (usernameError) {
        errors.username = usernameError;
      } else if (usernameAvailable === false) {
        errors.username = '이미 사용 중인 아이디입니다.';
      } else if (isCheckingUsername) {
        errors.username = '아이디 중복 체크 중입니다.';
      }
    }
    
    // 비밀번호 유효성 검사
    const passwordError = validatePassword(newMemberData.password);
    if (passwordError) {
      errors.password = passwordError;
    }
    
    // 닉네임 유효성 검사
    const nicknameError = validateNickname(newMemberData.nickname);
    if (nicknameError) {
      errors.nickname = nicknameError;
    } else if (!newMemberData.bulkCreation && nicknameAvailable === false) {
      errors.nickname = '이미 사용 중인 닉네임입니다.';
    } else if (!newMemberData.bulkCreation && isCheckingNickname) {
      errors.nickname = '닉네임 중복 체크 중입니다.';
    }
    if (newMemberData.password !== newMemberData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    if (!newMemberData.name?.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    if (!newMemberData.phone?.trim()) {
      errors.phone = '전화번호를 입력해주세요.';
    }
    if (!newMemberData.bank) {
      errors.bank = '은행을 선택해주세요.';
    }
    if (!newMemberData.accountNumber?.trim()) {
      errors.accountNumber = '계좌번호를 입력해주세요.';
    }
    if (!newMemberData.accountHolder?.trim()) {
      errors.accountHolder = '예금주를 입력해주세요.';
    }
    if (!newMemberData.agent_level_id) {
      errors.agent_level_id = '회원 레벨이 자동 설정되지 않았습니다.';
    }
    
    // 롤링 설정 검증 (나중에 기입하기가 비활성화된 경우만)
    if (!newMemberData.laterRollingInput) {
      if (newMemberData.bulkRollingRate.enabled) {
        if (!newMemberData.bulkRollingRate.value && newMemberData.bulkRollingRate.value !== 0) {
          errors['bulkRollingRate.value'] = '일괄 롤링%를 입력해주세요.';
        }
      } else {
        if (!newMemberData.rollingRates.slot && newMemberData.rollingRates.slot !== 0) {
          errors['rollingRates.slot'] = '슬롯 롤링%를 입력해주세요.';
        }
        if (!newMemberData.rollingRates.casino && newMemberData.rollingRates.casino !== 0) {
          errors['rollingRates.casino'] = '카지노 롤링%를 입력해주세요.';
        }
      }
    }
    
    // 루징 설정 검증 (나중에 기입하기가 비활성화된 경우만)
    if (!newMemberData.laterLosingInput) {
      if (!newMemberData.bulkLosingRate.value && newMemberData.bulkLosingRate.value !== 0) {
        errors['bulkLosingRate.value'] = '일괄 루징%를 입력해주세요.';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // 필수 입력 필드 누락 시 alert 표시
      const missingFields = [];
      if (errors.parentId) missingFields.push('상부');
      if (errors.username) missingFields.push('아이디');
      if (errors.password) missingFields.push('비밀번호');
      if (errors.passwordConfirm) missingFields.push('비밀번호 확인');
      if (errors.nickname) missingFields.push('닉네임');
      if (errors.name) missingFields.push('이름');
      if (errors.phone) missingFields.push('전화번호');
      if (errors.bank) missingFields.push('은행');
      if (errors.accountNumber) missingFields.push('계좌번호');
      if (errors.accountHolder) missingFields.push('예금주');
      if (errors['usernamePattern.start']) missingFields.push('시작 번호');
      if (errors['usernamePattern.end']) missingFields.push('끝 번호');
      if (errors['bulkRollingRate.value']) missingFields.push('일괄 롤링%');
      if (errors['rollingRates.slot']) missingFields.push('슬롯 롤링%');
      if (errors['rollingRates.casino']) missingFields.push('카지노 롤링%');
      if (errors['bulkLosingRate.value']) missingFields.push('일괄 루징%');
      
      if (missingFields.length > 0) {
        alert(`다음 필수 항목을 입력해주세요:\n${missingFields.join(', ')}`);
      }
      
      // 첫 번째 에러 필드로 포커스 이동
      setTimeout(() => {
        const firstErrorField = document.querySelector('.MuiTextField-root .Mui-error input, .MuiTextField-root .Mui-error textarea');
        if (firstErrorField) {
          firstErrorField.focus();
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return;
    }
    
    try {
      // 일괄생성 모드인지 확인
      if (newMemberData.bulkCreation) {
        // 일괄생성 요청 데이터 준비
        const bulkRequestData = {
          bulk_creation: true,
          username_prefix: newMemberData.username,
          start_number: parseInt(newMemberData.usernamePattern.start),
          end_number: parseInt(newMemberData.usernamePattern.end),
          password: newMemberData.password,
          nickname: newMemberData.nickname,
          name: newMemberData.name,
          phone: newMemberData.phone,
          bank: newMemberData.bank,
          account_number: newMemberData.accountNumber,
          account_holder: newMemberData.accountHolder,
          parent_id: newMemberData.parentId,
          agent_level_id: newMemberData.agent_level_id,
          status: 'active',
          language: newMemberData.language || '한국어',
          memo: newMemberData.memo || '',
          recommender_username: newMemberData.recommenderUsername || null,
          // 롤링% 추가
          slot_percent: newMemberData.bulkRollingRate.enabled 
            ? (newMemberData.bulkRollingRate.value || 0)
            : (newMemberData.rollingRates?.slot || 0),
          casino_percent: newMemberData.bulkRollingRate.enabled 
            ? (newMemberData.bulkRollingRate.value || 0)
            : (newMemberData.rollingRates?.casino || 0)
        };
        
        console.log('일괄 회원 생성 요청 데이터:', bulkRequestData);
        
        // 일괄생성 API 호출
        const response = await apiService.post('/members/bulk', bulkRequestData);
        
        if (response.data.success) {
          // 성공 시 콜백 호출
          if (typeof onCreateMember === 'function') {
            // 일괄생성 결과 전달 (생성된 회원 배열)
            onCreateMember(response.data.data || response.data.summary);
          }
          
          // 성공 메시지 표시
          const message = response.data.message || `${response.data.summary.total}명의 회원이 생성되었습니다.`;
          console.log(message);
          
          // 다이얼로그 닫기
          if (typeof onClose === 'function') {
            onClose();
          }
        } else {
          setFormErrors({ general: response.data.error || '일괄 회원 생성에 실패했습니다.' });
        }
      } else {
        // 단일 생성 모드
        const requestData = {
          user_id: newMemberData.username,
          password: newMemberData.password,
          nickname: newMemberData.nickname,
          name: newMemberData.name,
          phone: newMemberData.phone,
          bank: newMemberData.bank,
          account_number: newMemberData.accountNumber,
          account_holder: newMemberData.accountHolder,
          parent_id: newMemberData.parentId,
          agent_level_id: newMemberData.agent_level_id,
          status: 'active',
          language: newMemberData.language || '한국어',
          memo: newMemberData.memo || '',
          recommender_username: newMemberData.recommenderUsername || null,
          // 롤링% 추가
          slot_percent: newMemberData.rollingRates?.slot || 0,
          casino_percent: newMemberData.rollingRates?.casino || 0
        };
        
        console.log('회원 생성 요청 데이터:', requestData);
        
        // API 호출
        const response = await apiService.members.create(requestData);
        
        if (response.data.success) {
          // 성공 시 콜백 호출
          if (typeof onCreateMember === 'function') {
            onCreateMember(response.data.data);
          }
          
          // 다이얼로그 닫기
          if (typeof onClose === 'function') {
            onClose();
          }
        } else {
          setFormErrors({ general: response.data.error || '회원 생성에 실패했습니다.' });
        }
      }
    } catch (error) {
      console.error('회원 생성 오류:', error);
      console.error('에러 응답:', error.response?.data);
      const errorMessage = error.response?.data?.error || '회원 생성 중 오류가 발생했습니다.';
      const sqlMessage = error.response?.data?.sqlMessage;
      const details = error.response?.data?.details;
      
      setFormErrors({ 
        general: sqlMessage ? `${errorMessage} (SQL: ${sqlMessage})` : errorMessage
      });
      
      if (details) {
        console.error('상세 오류:', details);
      }
    }
  };
  
  return (
    <Dialog 
      open={Boolean(open)} 
      onClose={typeof onClose === 'function' ? onClose : () => {}}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px', overflow: 'hidden' }
      }}
    >
      <DialogTitle 
        className="dialog-title"
        sx={{
          backgroundColor: '#3699FF !important',
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Box className="section-title">
          <PersonIcon fontSize="small" />
          <Typography variant="h6" className="dialog-title-text">회원생성</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={typeof onClose === 'function' ? onClose : () => {}}
          aria-label="close"
          className="close-button"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className="dialog-content">
        {/* 헤더 섹션 */}
        <Box className="section-header">
          <Box className="section-title">
            <Settings fontSize="small" color="primary" />
            <Typography variant="h6" className="section-title-text">회원생성</Typography>
          </Box>
          <Box className="bulk-creation-toggle">
            <Typography variant="body1" className="bulk-creation-label">일괄생성</Typography>
            <Switch
              checked={Boolean(newMemberData?.bulkCreation)}
              onChange={(e, checked) => handleNewMemberChange({
                target: {
                  name: 'bulkCreation',
                  type: 'checkbox',
                  checked: checked
                }
              }, newMemberData, setNewMemberData, formErrors, setFormErrors)}
              color="primary"
            />
          </Box>
        </Box>
        
        {/* 필수 항목 섹션 */}
        <Box className="form-section">
          <Box className="form-section-header">
            <Box className="form-section-title">
              <AccountCircle className="field-icon" />
              <Typography variant="subtitle1" className="form-section-title-text">필수항목</Typography>
            </Box>
            {members && newMemberData.parentId && newMemberData.agent_level_id && agentLevels.length > 0 && (
              <Chip
                label={(() => {
                  const selectedLevel = agentLevels.find(level => level.id === newMemberData.agent_level_id);
                  return selectedLevel ? selectedLevel.name : '';
                })()}
                className="parent-chip"
                sx={{
                  backgroundColor: (() => {
                    const selectedLevel = agentLevels.find(level => level.id === newMemberData.agent_level_id);
                    return selectedLevel ? selectedLevel.background_color : '#e8f5e9';
                  })(),
                  color: (() => {
                    const selectedLevel = agentLevels.find(level => level.id === newMemberData.agent_level_id);
                    return selectedLevel ? selectedLevel.border_color : '#2e7d32';
                  })(),
                  border: `1px solid ${(() => {
                    const selectedLevel = agentLevels.find(level => level.id === newMemberData.agent_level_id);
                    return selectedLevel ? selectedLevel.border_color : '#2e7d32';
                  })()}`,
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
            )}
          </Box>
          
          <Grid container spacing={2}>
            {/* 상부 선택 */}
            <Grid item xs={12}>
              <Autocomplete
                options={members ? members.filter(m => m && m.agent_level_id) : []}
                getOptionLabel={(option) => option ? `${option.username}${option.nickname ? ` (${option.nickname})` : ''}` : ''}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Paper key={key} {...otherProps} elevation={0} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{option.username}{option.nickname ? ` (${option.nickname})` : ''}</span>
                      {option.agent_level_name && (
                        <Box component="span" sx={{ ml: 1 }}>
                          <Chip
                            label={option.agent_level_name}
                            size="small"
                            sx={{
                              backgroundColor: `${option.agent_level_bg_color || option.background_color || '#e8f5e9'} !important`,
                              color: `${option.agent_level_border_color || option.border_color || '#2e7d32'} !important`,
                              border: `1px solid ${option.agent_level_border_color || option.border_color || '#2e7d32'} !important`,
                              fontWeight: 400,
                              fontSize: '0.75rem',
                              '& .MuiChip-label': {
                                color: `${option.agent_level_border_color || option.border_color || '#2e7d32'} !important`
                              },
                              height: '24px'
                            }}
                          />
                        </Box>
                      )}
                    </Paper>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="상부"
                    required
                    variant="outlined"
                    size="small"
                    error={!!formErrors.parentId}
                    helperText={formErrors.parentId || (formErrors.general && !formErrors.parentId ? formErrors.general : '')}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PersonIcon className="field-icon" />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                value={members && newMemberData.parentId ? members.find(m => m.id === newMemberData.parentId) || null : null}
                onChange={(event, newValue) => {
                  handleNewMemberChange({
                    target: {
                      name: 'parentId',
                      value: newValue ? newValue.id : ''
                    }
                  }, newMemberData, setNewMemberData, formErrors, setFormErrors);
                  
                  // agent_level_id도 초기화 (부모 변경 시 다시 계산되도록)
                  // 추천인은 상부와 동일하게 자동 설정
                  setNewMemberData(prev => ({
                    ...prev,
                    agent_level_id: null,
                    recommenderUsername: newValue ? newValue.username : ''
                  }));
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            
            {/* 본사 선택 시 추가 필드 */}
            {newMemberData.isHeadquarters && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>기준 에이전트</Typography>
                </Grid>
                
                {/* 회원페이지 URL 적용기준 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" error={!!formErrors.memberPageUrlStandard}>
                    <InputLabel id="member-page-url-standard-label">회원페이지 URL 적용기준</InputLabel>
                    <Select
                      labelId="member-page-url-standard-label"
                      name="memberPageUrlStandard"
                      value={newMemberData.memberPageUrlStandard}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      label="회원페이지 URL 적용기준"
                      startAdornment={
                        <InputAdornment position="start">
                          <Language className="field-icon" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">
                        <em>선택하세요</em>
                      </MenuItem>
                      {members && members
                        .filter(m => {
                          // agent_level이 3 이하인 경우 (상위 레벨) 또는 선택된 부모
                          const memberLevel = agentLevels.find(level => level.id === m.agent_level_id);
                          return (memberLevel && memberLevel.level <= 3) || m.id === newMemberData.parentId;
                        })
                        .map(agent => (
                          <MenuItem key={agent.id} value={agent.id}>
                            {agent.username}
                          </MenuItem>
                        ))}
                    </Select>
                    {formErrors.memberPageUrlStandard && (
                      <FormHelperText>{formErrors.memberPageUrlStandard}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* 공베팅적용기준 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" error={!!formErrors.bettingStandard}>
                    <InputLabel id="betting-standard-label">공베팅적용기준</InputLabel>
                    <Select
                      labelId="betting-standard-label"
                      name="bettingStandard"
                      value={newMemberData.bettingStandard}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      label="공베팅적용기준"
                      startAdornment={
                        <InputAdornment position="start">
                          <Casino className="field-icon" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">
                        <em>선택하세요</em>
                      </MenuItem>
                      {members && members
                        .filter(m => {
                          // agent_level이 3 이하인 경우 (상위 레벨) 또는 선택된 부모
                          const memberLevel = agentLevels.find(level => level.id === m.agent_level_id);
                          return (memberLevel && memberLevel.level <= 3) || m.id === newMemberData.parentId;
                        })
                        .map(agent => (
                          <MenuItem key={agent.id} value={agent.id}>
                            {agent.username}
                          </MenuItem>
                        ))}
                    </Select>
                    {formErrors.bettingStandard && (
                      <FormHelperText>{formErrors.bettingStandard}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* 에이전트 관리자 URL */}
                <Grid item xs={12}>
                  <Box className="url-input-container">
                    <TextField
                      fullWidth
                      label="에이전트 관리자 URL"
                      name="agentManagerUrl"
                      value={newMemberData.agentManagerUrl}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      variant="outlined"
                      size="small"
                      placeholder="관리자 URL 입력"
                      InputProps={{
                        startAdornment: <Link className="field-icon" />
                      }}
                    />
                    <Tooltip title="URL 추가">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleAddUrl()}
                        className="url-add-button"
                      >
                        <Add />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
                
                {/* 회원페이지 URL */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="회원페이지 URL"
                    name="memberPageUrl"
                    value={newMemberData.memberPageUrl}
                    onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                    variant="outlined"
                    size="small"
                    placeholder="회원페이지 URL 입력"
                    InputProps={{
                      startAdornment: <Language className="field-icon" />
                    }}
                  />
                </Grid>
              </>
            )}

            {/* 기본 입력 필드들 */}
            <Grid item xs={12} sm={6}>
              {!newMemberData.bulkCreation ? (
                <TextField
                  fullWidth
                  label="아이디"
                  name="username"
                  value={newMemberData.username}
                  onChange={(e) => {
                    handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                    // 입력 시 실시간 유효성 검사
                    const error = validateUsername(e.target.value);
                    if (error) {
                      setFormErrors(prev => ({ ...prev, username: error }));
                    }
                  }}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="영문, 4-10자"
                  error={!!formErrors.username || (usernameAvailable === false)}
                  helperText={
                    isCheckingUsername ? "확인 중..." : 
                    formErrors.username || 
                    (usernameAvailable === true ? "사용 가능한 아이디입니다" : 
                     usernameAvailable === false ? "이미 사용 중인 아이디입니다" : "")
                  }
                  InputProps={{
                    startAdornment: <AccountCircle className="field-icon" />,
                    endAdornment: isCheckingUsername ? (
                      <CircularProgress size={20} />
                    ) : usernameAvailable === true ? (
                      <CheckCircle color="success" />
                    ) : usernameAvailable === false ? (
                      <Cancel color="error" />
                    ) : null
                  }}
                  autoComplete="off"
                  sx={commonStyles}
                />
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="아이디"
                      name="username"
                      value={newMemberData.username}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      required
                      variant="outlined"
                      size="small"
                      placeholder="2~5글자"
                      error={!!formErrors.username}
                      helperText={formErrors.username}
                      InputProps={{
                        startAdornment: <AccountCircle className="field-icon" />
                      }}
                      autoComplete="off"
                      sx={commonStyles}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="시작"
                      name="usernamePattern.start"
                      value={newMemberData.usernamePattern.start}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      required
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder="시작 번호"
                      error={!!formErrors['usernamePattern.start']}
                      helperText={formErrors['usernamePattern.start']}
                      sx={commonStyles}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="끝"
                      name="usernamePattern.end"
                      value={newMemberData.usernamePattern.end}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      required
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder="끝 번호"
                      error={!!formErrors['usernamePattern.end']}
                      helperText={formErrors['usernamePattern.end']}
                      sx={commonStyles}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {!newMemberData.bulkCreation ? (
                <TextField
                  fullWidth
                  label="닉네임"
                  name="nickname"
                  value={newMemberData.nickname}
                  onChange={(e) => {
                    handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                    // 입력 시 실시간 유효성 검사
                    const error = validateNickname(e.target.value);
                    if (error) {
                      setFormErrors(prev => ({ ...prev, nickname: error }));
                      setNicknameAvailable(null);
                    } else {
                      setFormErrors(prev => {
                        const { nickname, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="한글/영문, 3자 이상"
                  error={!!formErrors.nickname || (nicknameAvailable === false)}
                  helperText={
                    isCheckingNickname ? "확인 중..." : 
                    formErrors.nickname || 
                    (nicknameAvailable === true ? "사용 가능한 닉네임입니다" : 
                     nicknameAvailable === false ? "이미 사용 중인 닉네임입니다" : "")
                  }
                  InputProps={{
                    startAdornment: <Person className="field-icon" />,
                    endAdornment: isCheckingNickname ? (
                      <CircularProgress size={20} />
                    ) : nicknameAvailable === true ? (
                      <CheckCircle color="success" />
                    ) : nicknameAvailable === false ? (
                      <Cancel color="error" />
                    ) : null
                  }}
                  autoComplete="off"
                  sx={commonStyles}
                />
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="닉네임"
                      name="nickname"
                      value={newMemberData.nickname}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      required
                      variant="outlined"
                      size="small"
                      placeholder="2~5글자, 아이디 패턴을 따름"
                      error={!!formErrors.nickname}
                      helperText={formErrors.nickname}
                      InputProps={{
                        startAdornment: <Person className="field-icon" />
                      }}
                      autoComplete="off"
                      sx={commonStyles}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="비밀번호"
                name="password"
                value={newMemberData.password}
                onChange={(e) => {
                  handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                  // 입력 시 실시간 유효성 검사
                  const error = validatePassword(e.target.value);
                  if (error) {
                    setFormErrors(prev => ({ ...prev, password: error }));
                  } else {
                    setFormErrors(prev => {
                      const { password, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                required
                variant="outlined"
                size="small"
                placeholder="5자 이상"
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  startAdornment: <Lock className="field-icon" />
                }}
                autoComplete="new-password"
                sx={commonStyles}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="비밀번호 확인"
                name="passwordConfirm"
                value={newMemberData.passwordConfirm}
                onChange={(e) => {
                  handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                  // 실시간 비밀번호 일치 체크
                  if (e.target.value && newMemberData.password) {
                    if (e.target.value !== newMemberData.password) {
                      setFormErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
                    } else {
                      setFormErrors(prev => {
                        const { passwordConfirm, ...rest } = prev;
                        return rest;
                      });
                    }
                  }
                }}
                required
                variant="outlined"
                size="small"
                error={!!formErrors.passwordConfirm}
                helperText={formErrors.passwordConfirm}
                InputProps={{
                  startAdornment: <Lock className="field-icon" />,
                  endAdornment: newMemberData.passwordConfirm && (
                    newMemberData.password === newMemberData.passwordConfirm ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )
                  )
                }}
                autoComplete="new-password"
                sx={commonStyles}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={newMemberData.name}
                onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                required={!newMemberData.bulkCreation}
                variant="outlined"
                size="small"
                placeholder="예금주와 불일치 시 출금 불가"
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: <Person className="field-icon" />
                }}
                autoComplete="off"
                sx={commonStyles}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="전화번호"
                name="phone"
                value={newMemberData.phone}
                onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                required={!newMemberData.bulkCreation}
                variant="outlined"
                size="small"
                placeholder="전화번호 형식에 맞게 입력"
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                InputProps={{
                  startAdornment: <Phone className="field-icon" />
                }}
                autoComplete="off"
                sx={commonStyles}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!formErrors.bank} required={!newMemberData.bulkCreation}>
                <InputLabel id="bank-label">은행</InputLabel>
                <Select
                  labelId="bank-label"
                  name="bank"
                  value={newMemberData.bank}
                  onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                  label="은행"
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountBalance className="field-icon" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>선택하세요</em>
                  </MenuItem>
                  {banks.map((bank) => (
                    <MenuItem key={bank} value={bank}>
                      {bank}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.bank && (
                  <FormHelperText>{formErrors.bank}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="계좌번호"
                name="accountNumber"
                value={newMemberData.accountNumber}
                onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                required={!newMemberData.bulkCreation}
                variant="outlined"
                size="small"
                placeholder="'-' 없이 입력"
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
                InputProps={{
                  startAdornment: <CreditCard className="field-icon" />
                }}
                autoComplete="off"
                sx={commonStyles}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="예금주"
                name="accountHolder"
                value={newMemberData.accountHolder}
                onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                required={!newMemberData.bulkCreation}
                variant="outlined"
                size="small"
                placeholder="이름과 불일치 시 출금 불가"
                error={!!formErrors.accountHolder}
                helperText={formErrors.accountHolder}
                InputProps={{
                  startAdornment: <Person className="field-icon" />
                }}
                autoComplete="off"
                sx={commonStyles}
              />
            </Grid>
            
            {/* 추천인 필드 (자동 설정) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="추천인"
                name="recommenderUsername"
                value={newMemberData.recommenderUsername || '상부 선택 시 자동 설정'}
                variant="outlined"
                size="small"
                disabled
                InputProps={{
                  readOnly: true,
                  startAdornment: <Person className="field-icon" />
                }}
                helperText="추천인은 상부와 동일하게 자동 설정됩니다"
                sx={commonStyles}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="language-label">언어</InputLabel>
                <Select
                  labelId="language-label"
                  name="language"
                  value={newMemberData.language || '한국어'}
                  onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                  label="언어"
                  startAdornment={
                    <InputAdornment position="start">
                      <Language className="field-icon" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="한국어">한국어</MenuItem>
                  <MenuItem value="영어">영어</MenuItem>
                  <MenuItem value="중국어">중국어</MenuItem>
                  <MenuItem value="일본어">일본어</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* 롤링 설정 섹션 */}
        <Grid item xs={12}>
          <Box className="form-section">
            <Box className="form-section-header">
              <Box className="form-section-title">
                <PercentOutlined className="field-icon" />
                <Typography variant="subtitle1" className="form-section-title-text">
                  롤링 설정
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(newMemberData?.bulkRollingRate?.enabled)}
                        onChange={(e, checked) => handleNewMemberChange({
                          target: {
                            name: 'bulkRollingRate.enabled',
                            type: 'checkbox',
                            checked: checked
                          }
                        }, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">일괄 롤링</Typography>
                    }
                  />
                  {newMemberData?.bulkRollingRate?.enabled && (
                    <TextField
                      label="일괄 롤링 %"
                      name="bulkRollingRate.value"
                      value={newMemberData?.bulkRollingRate?.value || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // 음수 입력 방지
                        if (value < 0) {
                          e.target.value = '0';
                        }
                        handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                        // 값이 입력되면 나중에 기입하기 토글 비활성화
                        if (value && value !== 0) {
                          handleNewMemberChange({
                            target: {
                              name: 'laterRollingInput',
                              type: 'checkbox',  
                              checked: false,
                              value: false
                            }
                          }, newMemberData, setNewMemberData, formErrors, setFormErrors);
                        }
                      }}
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder={newMemberData.parentRollingPercent ? `상부 ${newMemberData.parentRollingPercent}% 이하 설정` : '롤링% 입력'}
                      sx={{ ...commonStyles, width: '200px', mr: '15px' }}
                      InputProps={{
                        startAdornment: <PercentOutlined className="field-icon" />,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      required={!newMemberData.laterRollingInput}
                    />
                  )}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(newMemberData?.laterRollingInput)}
                        onChange={(e, checked) => handleNewMemberChange({
                          target: {
                            name: 'laterRollingInput',
                            type: 'checkbox',
                            checked: checked
                          }
                        }, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                        size="small"
                        disabled={!!newMemberData.bulkRollingRate.value || !!newMemberData.rollingRates.slot || !!newMemberData.rollingRates.casino}
                      />
                    }
                    label={
                      <Typography variant="body2">나중에 기입하기</Typography>
                    }
                  />
                </Box>
              </Grid>
              
              {!newMemberData?.bulkRollingRate?.enabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="슬롯 롤링 %"
                      name="rollingRates.slot"
                      value={newMemberData?.rollingRates?.slot || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // 음수 입력 방지
                        if (value < 0) {
                          e.target.value = '0';
                        }
                        handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                        // 값이 입력되면 나중에 기입하기 토글 비활성화
                        if (value && value !== 0) {
                          handleNewMemberChange({
                            target: {
                              name: 'laterRollingInput',
                              type: 'checkbox',
                              checked: false,
                              value: false
                            }
                          }, newMemberData, setNewMemberData, formErrors, setFormErrors);
                        }
                      }}
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder={newMemberData.parentRollingPercent?.slot ? `상부 ${parseFloat(newMemberData.parentRollingPercent.slot).toFixed(2)}% 이하 설정` : '롤링% 입력'}
                      InputProps={{
                        startAdornment: <SportsEsports className="field-icon" />,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={commonStyles}
                      required={!newMemberData.laterRollingInput}
                      error={!!formErrors['rollingRates.slot']}
                      helperText={formErrors['rollingRates.slot']}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="카지노 롤링 %"
                      name="rollingRates.casino"
                      value={newMemberData?.rollingRates?.casino || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // 음수 입력 방지
                        if (value < 0) {
                          e.target.value = '0';
                        }
                        handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                        // 값이 입력되면 나중에 기입하기 토글 비활성화
                        if (value && value !== 0) {
                          handleNewMemberChange({
                            target: {
                              name: 'laterRollingInput',
                              type: 'checkbox',
                              checked: false,
                              value: false
                            }
                          }, newMemberData, setNewMemberData, formErrors, setFormErrors);
                        }
                      }}
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder={newMemberData.parentRollingPercent?.casino ? `상부 ${parseFloat(newMemberData.parentRollingPercent.casino).toFixed(2)}% 이하 설정` : '롤링% 입력'}
                      InputProps={{
                        startAdornment: <Casino className="field-icon" />,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={commonStyles}
                      required={!newMemberData.laterRollingInput}
                      error={!!formErrors['rollingRates.casino']}
                      helperText={formErrors['rollingRates.casino']}
                    />
                  </Grid>
                  
                </>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* 루징 설정 섹션 */}
        <Grid item xs={12}>
          <Box className="form-section">
            <Box className="form-section-header">
              <Box className="form-section-title">
                <PercentOutlined className="field-icon" />
                <Typography variant="subtitle1" className="form-section-title-text">
                  루징 설정
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={true}  // 항상 true
                        onChange={(e) => {
                          e.preventDefault();
                          alert('루징 다중설정은 아직 미지원 상태입니다.');
                        }}
                        size="small"
                        disabled={false}  // 비활성화 상태로 보이지 않게
                      />
                    }
                    label={
                      <Typography variant="body2">일괄 루징</Typography>
                    }
                  />
                  <TextField
                    label="일괄 루징 %"
                    name="bulkLosingRate.value"
                    value={newMemberData?.bulkLosingRate?.value || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      // 음수 입력 방지
                      if (value < 0) {
                        e.target.value = '0';
                      }
                      handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors);
                      // 값이 입력되면 나중에 기입하기 토글 비활성화
                      if (value && value !== 0) {
                        handleNewMemberChange({
                          target: {
                            name: 'laterLosingInput',
                            type: 'checkbox',
                            checked: false,
                            value: false
                          }
                        }, newMemberData, setNewMemberData, formErrors, setFormErrors);
                      }
                    }}
                    variant="outlined"
                    size="small"
                    type="number"
                    placeholder={`${newMemberData.parentId ? '상부의 %이하 설정' : ''}`}
                    sx={{ ...commonStyles, width: '200px', mr: '15px' }}
                    InputProps={{
                      startAdornment: <PercentOutlined className="field-icon" />,
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    required={!newMemberData.laterLosingInput}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(newMemberData?.laterLosingInput)}
                        onChange={(e, checked) => handleNewMemberChange({
                          target: {
                            name: 'laterLosingInput',
                            type: 'checkbox',
                            checked: checked
                          }
                        }, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                        size="small"
                        disabled={!!newMemberData.bulkLosingRate.value}
                      />
                    }
                    label={
                      <Typography variant="body2">나중에 기입하기</Typography>
                    }
                  />
                </Box>
              </Grid>
              
              {false && (  // 개별 루징 설정은 항상 숨김
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="슬롯 루징 %"
                      name="losingRates.slot"
                      value={newMemberData?.losingRates?.slot || ''}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder={newMemberData.parentRollingPercent ? `상부 ${newMemberData.parentRollingPercent}% 이하 설정` : '롤링% 입력'}
                      InputProps={{
                        startAdornment: <SportsEsports className="field-icon" />,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      sx={commonStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="카지노 루징 %"
                      name="losingRates.casino"
                      value={newMemberData?.losingRates?.casino || ''}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder={newMemberData.parentRollingPercent ? `상부 ${newMemberData.parentRollingPercent}% 이하 설정` : '롤링% 입력'}
                      InputProps={{
                        startAdornment: <Casino className="field-icon" />,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      sx={commonStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="미니게임 루징 %"
                      name="losingRates.minigame"
                      value={newMemberData?.losingRates?.minigame || ''}
                      onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder={newMemberData.parentRollingPercent ? `상부 ${newMemberData.parentRollingPercent}% 이하 설정` : '롤링% 입력'}
                      InputProps={{
                        startAdornment: <Games className="field-icon" />,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      sx={commonStyles}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* 베팅 제한액 섹션 */}
        <Grid item xs={12}>
          <Box className="form-section">
            <Box className="form-section-header">
              <Box className="form-section-title">
                <TrendingDown className="field-icon" />
                <Typography variant="subtitle1" className="form-section-title-text">
                  베팅 제한액
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="슬롯 베팅 제한액"
                  name="slotBettingLimit"
                  value={newMemberData.slotBettingLimit}
                  onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                  variant="outlined"
                  size="small"
                  type="number"
                  sx={commonStyles}
                  InputProps={{
                    startAdornment: <TrendingDown className="field-icon" />,
                    endAdornment: <InputAdornment position="end">원</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="카지노 베팅 제한액"
                  name="casinoBettingLimit"
                  value={newMemberData.casinoBettingLimit}
                  onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
                  variant="outlined"
                  size="small"
                  type="number"
                  sx={commonStyles}
                  InputProps={{
                    startAdornment: <TrendingDown className="field-icon" />,
                    endAdornment: <InputAdornment position="end">원</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* 메모 필드 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="메모"
            name="memo"
            value={newMemberData.memo}
            onChange={(e) => handleNewMemberChange(e, newMemberData, setNewMemberData, formErrors, setFormErrors)}
            variant="outlined"
            size="small"
            multiline
            rows={4}
            sx={{
              ...commonStyles,
              '& .MuiInputBase-root': {
                height: 'auto'  // multiline 필드는 자동 높이
              },
              '& .MuiInputBase-inputMultiline': {
                height: 'auto !important',
                padding: '8px 14px'  // 적절한 패딩 설정
              }
            }}
          />
        </Grid>
      </DialogContent>
      
      {/* 액션 버튼 */}
      <DialogActions className="action-buttons">
        <Button 
          onClick={typeof onClose === 'function' ? onClose : () => {}} 
          color="inherit"
          className="cancel-button"
          sx={{ marginBottom: '5px' }}
        >
          취소
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained"
          className="submit-button"
          sx={{ marginRight: '20px', marginBottom: '5px' }}
        >
          생성
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMemberDialog;
