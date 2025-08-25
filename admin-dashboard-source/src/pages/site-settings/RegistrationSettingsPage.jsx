import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Snackbar,
  Alert,
  FormGroup,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  Save as SaveIcon,
  RestartAlt as RestartAltIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Language as LanguageIcon,
  Casino as CasinoIcon,
  Link as LinkIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  PageContainer, 
  PageHeader,
  TableHeader
} from '../../components/baseTemplate/components';
import api from '../../services/api';

/**
 * 회원가입설정 페이지
 * 회원가입 시 필수입력 선택, 문자인증 선택, 필드 표시/숨김 설정
 */
const RegistrationSettingsPage = () => {
  // 회원가입 설정 상태
  const [settings, setSettings] = useState({
    // 필수 입력 필드
    requiredFields: {
      nickname: true,
      phone: true,
      realName: false,
      bankName: false,
      accountNumber: false,
      accountHolder: false,
      birthDate: false
    },
    // 표시할 필드
    visibleFields: {
      nickname: true,
      phone: true,
      realName: true,
      bankName: true,
      accountNumber: true,
      accountHolder: true,
      birthDate: true,
      referralCode: true,
      memo: true
    },
    // 문자 인증 설정
    smsVerification: {
      enabled: true,
      provider: 'twilio', // twilio, aligo, etc.
      requiredFor: 'all' // all, new, none
    },
    // 회원가입 승인 방식
    approvalType: 'auto', // auto, manual
    // 본사 회원가입 시 추가 필드
    headquartersFields: {
      memberPageUrlStandard: true,
      bettingStandard: true,
      agentManagerUrl: true,
      defaultSlotRolling: true,
      defaultCasinoRolling: true
    }
  });
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/settings/registration');
        
        // API에서 받은 데이터를 현재 상태 구조에 맞게 병합
        setSettings(prev => ({
          ...prev,
          smsVerification: {
            ...prev.smsVerification,
            enabled: response.data.smsVerification?.enabled ?? prev.smsVerification.enabled
          }
        }));
      } catch (error) {
        console.error('회원가입 설정 로드 실패:', error);
        // localStorage에서 임시로 로드 (폴백)
        const savedSettings = localStorage.getItem('registrationSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // 설정 업데이트 핸들러
  const updateSettings = useCallback((category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  }, []);

  // 전체 설정 업데이트 핸들러 (문자인증, 승인방식 등)
  const updateGeneralSettings = useCallback((field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    try {
      // API로 SMS 설정만 저장
      const response = await api.put('/settings/registration', {
        smsVerification: settings.smsVerification
      });
      
      // localStorage에도 전체 설정 저장 (다른 설정들을 위해)
      localStorage.setItem('registrationSettings', JSON.stringify(settings));
      
      setNotification({
        open: true,
        message: '회원가입 설정이 저장되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('회원가입 설정 저장 실패:', error);
      setNotification({
        open: true,
        message: '설정 저장에 실패했습니다.',
        severity: 'error'
      });
    }
  }, [settings]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (window.confirm('모든 설정을 초기값으로 되돌리시겠습니까?')) {
      const defaultSettings = {
        requiredFields: {
          nickname: true,
          phone: true,
          realName: false,
          bankName: false,
          accountNumber: false,
          accountHolder: false,
          birthDate: false
        },
        visibleFields: {
          nickname: true,
          phone: true,
          realName: true,
          bankName: true,
          accountNumber: true,
          accountHolder: true,
          birthDate: true,
          referralCode: true,
          memo: true
        },
        smsVerification: {
          enabled: true,
          provider: 'twilio',
          requiredFor: 'all'
        },
        approvalType: 'auto',
        headquartersFields: {
          memberPageUrlStandard: true,
          bettingStandard: true,
          agentManagerUrl: true,
          defaultSlotRolling: true,
          defaultCasinoRolling: true
        }
      };
      setSettings(defaultSettings);
      setNotification({
        open: true,
        message: '설정이 초기화되었습니다.',
        severity: 'info'
      });
    }
  }, []);

  // 필드 정보
  const fieldInfo = [
    { key: 'nickname', label: '닉네임', icon: <PersonIcon fontSize="small" /> },
    { key: 'phone', label: '전화번호', icon: <PhoneIcon fontSize="small" /> },
    { key: 'realName', label: '실명', icon: <PersonIcon fontSize="small" /> },
    { key: 'bankName', label: '은행명', icon: <BankIcon fontSize="small" /> },
    { key: 'accountNumber', label: '계좌번호', icon: <CardIcon fontSize="small" /> },
    { key: 'accountHolder', label: '예금주', icon: <PersonIcon fontSize="small" /> },
    { key: 'birthDate', label: '생년월일', icon: <PersonIcon fontSize="small" /> }
  ];

  const additionalFields = [
    { key: 'referralCode', label: '추천인 코드', icon: <LinkIcon fontSize="small" /> },
    { key: 'memo', label: '메모', icon: <SettingsIcon fontSize="small" /> }
  ];

  const headquartersFieldInfo = [
    { key: 'memberPageUrlStandard', label: '회원페이지 URL 적용기준', icon: <LanguageIcon fontSize="small" /> },
    { key: 'bettingStandard', label: '공베팅적용기준', icon: <CasinoIcon fontSize="small" /> },
    { key: 'agentManagerUrl', label: '에이전트 관리자 URL', icon: <LinkIcon fontSize="small" /> },
    { key: 'defaultSlotRolling', label: '기본 슬롯 롤링', icon: <CasinoIcon fontSize="small" /> },
    { key: 'defaultCasinoRolling', label: '기본 카지노 롤링', icon: <CasinoIcon fontSize="small" /> }
  ];

  // 로딩 중일 때
  if (isLoading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography>설정을 불러오는 중...</Typography>
        </Box>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="회원가입설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={() => window.location.reload()}
        sx={{ mb: 2 }}
      />

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <TableHeader
          title="회원가입 양식 설정"
          totalItems={0}
          showSearch={false}
          showIndentToggle={false}
          showPageNumberToggle={false}
          showColumnPinToggle={false}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {/* 기본 필드 설정 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  기본 필드 설정
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  회원가입 시 표시할 필드와 필수 입력 여부를 설정합니다.
                </Typography>

                <Grid container spacing={2}>
                  {fieldInfo.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.key}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {field.icon}
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              {field.label}
                            </Typography>
                          </Box>
                          
                          <FormGroup sx={{ gap: 1 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={settings.visibleFields[field.key]}
                                  onChange={(e) => updateSettings('visibleFields', field.key, e.target.checked)}
                                  size="small"
                                />
                              }
                              label="표시"
                              sx={{ 
                                m: 0,
                                '& .MuiTypography-root': { fontSize: '0.875rem' }
                              }}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={settings.requiredFields[field.key]}
                                  onChange={(e) => updateSettings('requiredFields', field.key, e.target.checked)}
                                  disabled={!settings.visibleFields[field.key]}
                                  size="small"
                                />
                              }
                              label="필수"
                              sx={{ 
                                m: 0,
                                '& .MuiTypography-root': { fontSize: '0.875rem' }
                              }}
                            />
                          </FormGroup>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 추가 필드 설정 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  추가 필드 설정
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  선택적으로 표시할 수 있는 추가 필드입니다.
                </Typography>

                <Grid container spacing={2}>
                  {additionalFields.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.key}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ color: 'primary.main', mr: 1 }}>{field.icon}</Box>
                            <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                              {field.label}
                            </Typography>
                          </Box>
                          
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.visibleFields[field.key]}
                                onChange={(e) => updateSettings('visibleFields', field.key, e.target.checked)}
                                size="small"
                              />
                            }
                            label="표시"
                            sx={{ 
                              m: 0,
                              '& .MuiTypography-root': { fontSize: '0.875rem' }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 본사 회원가입 시 추가 필드 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  본사 회원가입 추가 필드
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  상부가 본사인 경우에만 표시되는 추가 필드입니다.
                </Typography>

                <Grid container spacing={2}>
                  {headquartersFieldInfo.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.key}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ color: 'primary.main', mr: 1 }}>{field.icon}</Box>
                            <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                              {field.label}
                            </Typography>
                          </Box>
                          
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.headquartersFields[field.key]}
                                onChange={(e) => updateSettings('headquartersFields', field.key, e.target.checked)}
                                size="small"
                              />
                            }
                            label="표시"
                            sx={{ 
                              m: 0,
                              '& .MuiTypography-root': { fontSize: '0.875rem' }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 문자 인증 설정 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  문자 인증 설정
                </Typography>
                
                <FormGroup sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsVerification.enabled}
                        onChange={(e) => updateSettings('smsVerification', 'enabled', e.target.checked)}
                      />
                    }
                    label="문자 인증 사용"
                  />
                </FormGroup>

                {settings.smsVerification.enabled && (
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormLabel component="legend">인증 대상</FormLabel>
                    <RadioGroup
                      value={settings.smsVerification.requiredFor}
                      onChange={(e) => updateSettings('smsVerification', 'requiredFor', e.target.value)}
                    >
                      <FormControlLabel value="all" control={<Radio />} label="모든 회원가입" />
                      <FormControlLabel value="new" control={<Radio />} label="신규 번호만" />
                      <FormControlLabel value="none" control={<Radio />} label="사용 안함" />
                    </RadioGroup>
                  </FormControl>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 가입 승인 설정 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  가입 승인 설정
                </Typography>
                
                <FormControl component="fieldset">
                  <FormLabel component="legend">승인 방식</FormLabel>
                  <RadioGroup
                    value={settings.approvalType}
                    onChange={(e) => updateGeneralSettings('approvalType', e.target.value)}
                  >
                    <FormControlLabel 
                      value="auto" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography>자동 승인</Typography>
                          <Typography variant="caption" color="text.secondary">
                            회원가입 즉시 승인됩니다.
                          </Typography>
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="manual" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography>수동 승인</Typography>
                          <Typography variant="caption" color="text.secondary">
                            관리자가 직접 승인해야 합니다.
                          </Typography>
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* 액션 버튼 */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                초기화
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                저장
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default RegistrationSettingsPage;