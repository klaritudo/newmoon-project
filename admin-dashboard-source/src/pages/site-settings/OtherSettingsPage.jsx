import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { 
  PageContainer, 
  PageHeader, 
  TableHeader
} from '../../components/baseTemplate/components';
import api from '../../services/api';
import { API_CONFIG } from '../../config/apiConfig';

/**
 * 기타설정 페이지
 */
const OtherSettingsPage = () => {
  // 입금/출금 금액 설정
  const [amountSettings, setAmountSettings] = useState({
    depositMin: 10000,
    depositMax: 10000000,
    withdrawalMin: 10000,
    withdrawalMax: 5000000,
    rollingMin: 100000,
    rollingMax: 10000000
  });

  // API 모듈 설정
  const [apiModules, setApiModules] = useState({
    slotApi: true,
    casinoApi: true,
    sportsApi: false,
    lotteryApi: false,
    virtualApi: false
  });

  // 알림음 설정 - 회원 관련
  const [memberNotifications, setMemberNotifications] = useState({
    registration: { enabled: true, soundFile: null, interval: 5 },
    depositInquiry: { enabled: true, soundFile: null, interval: 3 },
    withdrawalInquiry: { enabled: true, soundFile: null, interval: 3 },
    customerService: { enabled: true, soundFile: null, interval: 10 },
    agentInquiry: { enabled: true, soundFile: null, interval: 5 }
  });

  // 알림음 설정 - 하부에이전트 관리자
  const [agentNotifications, setAgentNotifications] = useState({
    inquiry: { enabled: true, soundFile: null, interval: 5 },
    message: { enabled: true, soundFile: null, interval: 2 },
    notice: { enabled: true, soundFile: null, interval: 10 }
  });

  // 알림음 설정 - 유저페이지
  const [userPageNotifications, setUserPageNotifications] = useState({
    inquiry: { enabled: true, soundFile: null, interval: 5 },
    notice: { enabled: true, soundFile: null, interval: 15 }
  });

  // 입금 시간 제한 설정
  const [depositTimeSettings, setDepositTimeSettings] = useState({
    enabled: false,
    startTime: '00:00',
    endTime: '23:59',
    timezone: 'Asia/Seoul'
  });

  // 입금 쿨다운 설정
  const [depositCooldownSettings, setDepositCooldownSettings] = useState({
    enabled: false,
    seconds: 300,  // 기본값 5분 = 300초
    maxAttemptsPerHour: 10
  });

  // 출금 시간 제한 설정
  const [withdrawalTimeSettings, setWithdrawalTimeSettings] = useState({
    enabled: false,
    startTime: '00:00',
    endTime: '23:59',
    timezone: 'Asia/Seoul'
  });

  // 출금 쿨다운 설정
  const [withdrawalCooldownSettings, setWithdrawalCooldownSettings] = useState({
    enabled: false,
    seconds: 300,  // 기본값 5분 = 300초
    maxAttemptsPerHour: 10
  });

  // 입금 보너스 설정
  const [depositBonusSettings, setDepositBonusSettings] = useState({
    enabled: false,
    type: 'multiplier',
    value: 2,
    min_deposit: 10000,
    max_bonus: 1000000,
    bonus_limit_enabled: false,
    bonus_limit_count: 1,
    bonus_limit_reset: 'daily'
  });

  // 베팅 커미션 설정
  const [bettingCommissionSettings, setBettingCommissionSettings] = useState({
    enabled: false,
    rate: 0,
    min_bet_amount: 0,
    max_commission: 0
  });

  // 출금 롤링 조건 설정
  const [withdrawalRolling, setWithdrawalRolling] = useState({
    enabled: false,
    percentage: 100,
    message: '입금액의 100% 이상 베팅 후 출금 가능합니다.'
  });

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 변경사항 추적
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changedSections, setChangedSections] = useState(new Set());

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 사용 가능한 알림음 목록
  const [availableSounds, setAvailableSounds] = useState([]);
  
  // 현재 재생 중인 오디오 추적
  const [playingAudio, setPlayingAudio] = useState(null);
  const [playingKey, setPlayingKey] = useState(null);

  // 페이지 초기화
  useEffect(() => {
    loadSettings();
  }, []);
  
  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
      }
    };
  }, [playingAudio]);

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 설정 불러오기
  const loadSettings = async () => {
    setIsLoading(true);
    
    try {
      // 알람 설정은 DB에서 불러오기
      const alarmResponse = await api.get('/settings/alarms');
      if (alarmResponse.data) {
        setMemberNotifications(alarmResponse.data.memberNotifications || {});
        setAgentNotifications(alarmResponse.data.agentNotifications || {});
        setUserPageNotifications(alarmResponse.data.userPageNotifications || {});
      }
      
      // 사용 가능한 알림음 목록 불러오기
      const soundsResponse = await api.get('/settings/alarms/available-sounds');
      if (soundsResponse.data) {
        setAvailableSounds(soundsResponse.data);
      }

      // 입금 시간 제한 설정 불러오기
      try {
        const depositTimeResponse = await api.get('/system-settings/deposit-time-restriction');
        if (depositTimeResponse.data && depositTimeResponse.data.success) {
          setDepositTimeSettings({
            enabled: depositTimeResponse.data.data.enabled || false,
            startTime: depositTimeResponse.data.data.start_time || '00:00',
            endTime: depositTimeResponse.data.data.end_time || '23:59',
            timezone: depositTimeResponse.data.data.timezone || 'Asia/Seoul'
          });
        }
      } catch (error) {
        console.error('입금 시간 설정 로드 실패:', error);
      }

      // 입금 쿨다운 설정 불러오기
      try {
        const depositCooldownResponse = await api.get('/system-settings/deposit-cooldown');
        if (depositCooldownResponse.data && depositCooldownResponse.data.success) {
          setDepositCooldownSettings({
            enabled: depositCooldownResponse.data.data.enabled || false,
            seconds: depositCooldownResponse.data.data.cooldown_seconds || 300,
            maxAttemptsPerHour: depositCooldownResponse.data.data.max_attempts_per_hour || 10
          });
        }
      } catch (error) {
        console.error('입금 쿨다운 설정 로드 실패:', error);
      }

      // 출금 시간 제한 설정 불러오기
      try {
        const withdrawalTimeResponse = await api.get('/system-settings/withdrawal-time-restriction');
        if (withdrawalTimeResponse.data && withdrawalTimeResponse.data.success) {
          setWithdrawalTimeSettings({
            enabled: withdrawalTimeResponse.data.data.enabled || false,
            startTime: withdrawalTimeResponse.data.data.start_time || '00:00',
            endTime: withdrawalTimeResponse.data.data.end_time || '23:59',
            timezone: withdrawalTimeResponse.data.data.timezone || 'Asia/Seoul'
          });
        }
      } catch (error) {
        console.error('출금 시간 설정 로드 실패:', error);
      }

      // 출금 쿨다운 설정 불러오기
      try {
        const withdrawalCooldownResponse = await api.get('/system-settings/withdrawal-cooldown');
        if (withdrawalCooldownResponse.data && withdrawalCooldownResponse.data.success) {
          setWithdrawalCooldownSettings({
            enabled: withdrawalCooldownResponse.data.data.enabled || false,
            seconds: withdrawalCooldownResponse.data.data.cooldown_seconds || 300,
            maxAttemptsPerHour: withdrawalCooldownResponse.data.data.max_attempts_per_hour || 10
          });
        }
      } catch (error) {
        console.error('출금 쿨다운 설정 로드 실패:', error);
      }

      // 입금 보너스 설정 불러오기
      try {
        const depositBonusResponse = await api.get('/system-settings/deposit-bonus');
        if (depositBonusResponse.data && depositBonusResponse.data.success) {
          setDepositBonusSettings({
            enabled: depositBonusResponse.data.data.enabled || false,
            type: depositBonusResponse.data.data.type || 'multiplier',
            value: depositBonusResponse.data.data.value || 2,
            min_deposit: depositBonusResponse.data.data.min_deposit || 10000,
            max_bonus: depositBonusResponse.data.data.max_bonus || 1000000,
            bonus_limit_enabled: depositBonusResponse.data.data.bonus_limit_enabled || false,
            bonus_limit_count: depositBonusResponse.data.data.bonus_limit_count || 1,
            bonus_limit_reset: depositBonusResponse.data.data.bonus_limit_reset || 'daily'
          });
        }
      } catch (error) {
        console.error('입금 보너스 설정 로드 실패:', error);
      }

      // 베팅 커미션 설정 불러오기
      try {
        const commissionResponse = await api.get('/settings/betting-commission');
        if (commissionResponse.data) {
          setBettingCommissionSettings({
            enabled: commissionResponse.data.enabled || false,
            rate: commissionResponse.data.rate || 0,
            min_bet_amount: commissionResponse.data.min_bet_amount || 0,
            max_commission: commissionResponse.data.max_commission || 0
          });
        }
      } catch (error) {
        console.error('베팅 커미션 설정 로드 실패:', error);
      }

      // 출금 롤링 조건 설정 불러오기
      try {
        const rollingResponse = await api.get('/system-settings/withdrawal-rolling');
        if (rollingResponse.data && rollingResponse.data.success) {
          setWithdrawalRolling({
            enabled: rollingResponse.data.data.enabled || false,
            percentage: rollingResponse.data.data.percentage || 100,
            message: rollingResponse.data.data.message || '입금액의 100% 이상 베팅 후 출금 가능합니다.'
          });
        }
      } catch (error) {
        console.error('출금 롤링 조건 설정 로드 실패:', error);
      }
      
    } catch (error) {
      console.error('알람 설정 로드 실패:', error);
      // DB 오류 시 localStorage에서 알람 설정 불러오기 (fallback)
      const savedSettings = localStorage.getItem('otherSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.memberNotifications) setMemberNotifications(settings.memberNotifications);
          if (settings.agentNotifications) setAgentNotifications(settings.agentNotifications);
          if (settings.userPageNotifications) setUserPageNotifications(settings.userPageNotifications);
        } catch (e) {
          console.error('localStorage 파싱 실패:', e);
        }
      }
    }
    
    // 나머지 설정은 기존대로 localStorage에서 불러오기
    const savedSettings = localStorage.getItem('otherSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.amountSettings) setAmountSettings(settings.amountSettings);
        if (settings.apiModules) setApiModules(settings.apiModules);
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
    
    setIsLoading(false);
  };

  // 알림 표시
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // 금액 설정 변경
  const handleAmountChange = useCallback((field, value) => {
    const numValue = parseInt(value) || 0;
    setAmountSettings(prev => ({
      ...prev,
      [field]: numValue
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('amount'));
  }, []);

  // API 모듈 토글
  const handleApiToggle = useCallback((module) => {
    setApiModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('api'));
  }, []);

  // 알림음 토글
  const handleNotificationToggle = useCallback((category, type) => {
    const setters = {
      member: setMemberNotifications,
      agent: setAgentNotifications,
      userPage: setUserPageNotifications
    };
    
    const setter = setters[category];
    if (setter) {
      setter(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          enabled: !prev[type].enabled
        }
      }));
      setHasUnsavedChanges(true);
      setChangedSections(prev => new Set(prev).add('alarm'));
    }
  }, []);

  // 알림음 선택
  const handleSoundSelect = useCallback((category, type, soundFile) => {
    const setters = {
      member: setMemberNotifications,
      agent: setAgentNotifications,
      userPage: setUserPageNotifications
    };
    
    const setter = setters[category];
    if (setter) {
      setter(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          soundFile: soundFile
        }
      }));
      setHasUnsavedChanges(true);
      setChangedSections(prev => new Set(prev).add('alarm'));
    }
  }, []);

  // 알림 간격 변경
  const handleIntervalChange = useCallback((category, type, interval) => {
    const numValue = parseInt(interval) || 1;
    const setters = {
      member: setMemberNotifications,
      agent: setAgentNotifications,
      userPage: setUserPageNotifications
    };
    
    const setter = setters[category];
    if (setter) {
      setter(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          interval: numValue
        }
      }));
      setHasUnsavedChanges(true);
      setChangedSections(prev => new Set(prev).add('alarm'));
    }
  }, []);

  // 입금 시간 제한 설정 변경
  const handleDepositTimeChange = useCallback((field, value) => {
    setDepositTimeSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('depositTime'));
  }, []);

  // 입금 쿨다운 설정 변경
  const handleDepositCooldownChange = useCallback((field, value) => {
    setDepositCooldownSettings(prev => ({
      ...prev,
      [field]: field === 'seconds' || field === 'maxAttemptsPerHour' ? (value === '' ? '' : parseInt(value) || 0) : value
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('depositCooldown'));
  }, []);

  // 출금 시간 제한 설정 변경
  const handleWithdrawalTimeChange = useCallback((field, value) => {
    setWithdrawalTimeSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('withdrawalTime'));
  }, []);

  // 출금 쿨다운 설정 변경
  const handleWithdrawalCooldownChange = useCallback((field, value) => {
    setWithdrawalCooldownSettings(prev => ({
      ...prev,
      [field]: field === 'seconds' || field === 'maxAttemptsPerHour' ? (value === '' ? '' : parseInt(value) || 0) : value
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('withdrawalCooldown'));
  }, []);

  // 입금 시간 제한 설정 저장
  const saveDepositTimeSettings = useCallback(async () => {
    try {
      await api.post('/system-settings/deposit-time-restriction', {
        enabled: depositTimeSettings.enabled,
        start_time: depositTimeSettings.startTime,
        end_time: depositTimeSettings.endTime,
        timezone: depositTimeSettings.timezone
      });
      showNotification('입금 시간 제한 설정이 저장되었습니다.');
    } catch (error) {
      console.error('입금 시간 설정 저장 실패:', error);
      showNotification('입금 시간 설정 저장에 실패했습니다.', 'error');
    }
  }, [depositTimeSettings, showNotification]);

  // 입금 쿨다운 설정 저장
  const saveDepositCooldownSettings = useCallback(async () => {
    try {
      await api.post('/system-settings/deposit-cooldown', {
        enabled: depositCooldownSettings.enabled,
        cooldown_seconds: depositCooldownSettings.seconds,
        max_attempts_per_hour: depositCooldownSettings.maxAttemptsPerHour
      });
      showNotification('입금 쿨다운 설정이 저장되었습니다.');
    } catch (error) {
      console.error('입금 쿨다운 설정 저장 실패:', error);
      showNotification('입금 쿨다운 설정 저장에 실패했습니다.', 'error');
    }
  }, [depositCooldownSettings, showNotification]);

  // 베팅 커미션 설정 변경 핸들러
  const handleBettingCommissionChange = useCallback((field, value) => {
    setBettingCommissionSettings(prev => ({
      ...prev,
      [field]: field === 'enabled' ? value : (parseFloat(value) || 0)
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('bettingCommission'));
  }, []);

  // 출금 롤링 조건 설정 변경 핸들러
  const handleWithdrawalRollingChange = useCallback((field, value) => {
    setWithdrawalRolling(prev => ({
      ...prev,
      [field]: field === 'percentage' ? (value === '' ? '' : Math.min(1000, Math.max(0, parseInt(value) || 0))) : value
    }));
    setHasUnsavedChanges(true);
    setChangedSections(prev => new Set(prev).add('withdrawalRolling'));
  }, []);



  // 전체 설정 저장
  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const promises = [];
      
      // 알람 설정 저장
      if (changedSections.has('alarm')) {
        promises.push(
          api.put('/settings/alarms', {
            memberNotifications,
            agentNotifications,
            userPageNotifications
          })
        );
      }
      
      // 입금 시간 제한 설정 저장
      if (changedSections.has('depositTime')) {
        promises.push(
          api.post('/system-settings/deposit-time-restriction', {
            enabled: depositTimeSettings.enabled,
            start_time: depositTimeSettings.startTime,
            end_time: depositTimeSettings.endTime,
            timezone: depositTimeSettings.timezone
          })
        );
      }
      
      // 입금 쿨다운 설정 저장
      if (changedSections.has('depositCooldown')) {
        promises.push(
          api.post('/system-settings/deposit-cooldown', {
            enabled: depositCooldownSettings.enabled,
            cooldown_seconds: depositCooldownSettings.seconds,
            max_attempts_per_hour: depositCooldownSettings.maxAttemptsPerHour
          })
        );
      }
      
      // 출금 시간 제한 설정 저장
      if (changedSections.has('withdrawalTime')) {
        promises.push(
          api.post('/system-settings/withdrawal-time-restriction', {
            enabled: withdrawalTimeSettings.enabled,
            start_time: withdrawalTimeSettings.startTime,
            end_time: withdrawalTimeSettings.endTime,
            timezone: withdrawalTimeSettings.timezone
          })
        );
      }
      
      // 출금 쿨다운 설정 저장
      if (changedSections.has('withdrawalCooldown')) {
        promises.push(
          api.post('/system-settings/withdrawal-cooldown', {
            enabled: withdrawalCooldownSettings.enabled,
            cooldown_seconds: withdrawalCooldownSettings.seconds,
            max_attempts_per_hour: withdrawalCooldownSettings.maxAttemptsPerHour
          })
        );
      }

      // 입금 보너스 설정 저장
      if (changedSections.has('depositBonus')) {
        promises.push(
          api.post('/system-settings/deposit-bonus', {
            enabled: depositBonusSettings.enabled,
            type: depositBonusSettings.type,
            value: depositBonusSettings.value,
            min_deposit: depositBonusSettings.min_deposit,
            max_bonus: depositBonusSettings.max_bonus,
            bonus_limit_enabled: depositBonusSettings.bonus_limit_enabled,
            bonus_limit_count: depositBonusSettings.bonus_limit_count,
            bonus_limit_reset: depositBonusSettings.bonus_limit_reset
          })
        );
      }

      // 베팅 커미션 설정 저장
      if (changedSections.has('bettingCommission')) {
        promises.push(
          api.put('/settings/betting-commission', {
            enabled: bettingCommissionSettings.enabled,
            rate: bettingCommissionSettings.rate,
            min_bet_amount: bettingCommissionSettings.min_bet_amount,
            max_commission: bettingCommissionSettings.max_commission
          })
        );
      }

      // 출금 롤링 조건 설정 저장
      if (changedSections.has('withdrawalRolling')) {
        promises.push(
          api.post('/system-settings/withdrawal-rolling', {
            enabled: withdrawalRolling.enabled,
            percentage: withdrawalRolling.percentage,
            message: withdrawalRolling.message
          })
        );
      }
      
      // 모든 API 호출을 병렬로 실행
      await Promise.all(promises);
      
      // localStorage 설정 저장 (금액, API 모듈)
      if (changedSections.has('amount') || changedSections.has('api')) {
        const otherSettings = {
          amountSettings,
          apiModules
        };
        localStorage.setItem('otherSettings', JSON.stringify(otherSettings));
      }
      
      // localStorage에 알람 설정 백업 (fallback용)
      const allSettings = {
        amountSettings,
        apiModules,
        memberNotifications,
        agentNotifications,
        userPageNotifications
      };
      localStorage.setItem('otherSettings', JSON.stringify(allSettings));
      
      setHasUnsavedChanges(false);
      setChangedSections(new Set());
      showNotification('모든 설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      showNotification('설정 저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [amountSettings, apiModules, memberNotifications, agentNotifications, userPageNotifications, 
      depositTimeSettings, depositCooldownSettings, withdrawalTimeSettings, withdrawalCooldownSettings,
      depositBonusSettings, bettingCommissionSettings, withdrawalRolling, changedSections, showNotification]);

  // 새로고침
  const handleRefresh = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!window.confirm('저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?')) {
        return;
      }
    }
    loadSettings();
    setHasUnsavedChanges(false);
    setChangedSections(new Set());
  }, [hasUnsavedChanges]);

  // 알림음 미리듣기/정지
  const handlePlaySound = useCallback((category, type) => {
    const currentKey = `${category}-${type}`;
    
    // 이미 재생 중인 경우 정지
    if (playingAudio && playingKey === currentKey) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
      setPlayingKey(null);
      return;
    }
    
    // 다른 오디오가 재생 중이면 먼저 정지
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
    }
    
    const notifications = {
      member: memberNotifications,
      agent: agentNotifications,
      userPage: userPageNotifications
    };
    
    const soundFile = notifications[category]?.[type]?.soundFile;
    if (!soundFile) {
      console.log('재생할 사운드 파일이 없습니다.');
      return;
    }
    
    // API URL 구성 - public 폴더로 직접 접근
    // 개발 환경에서는 프록시를 통해 접근
    const origin = window.location.origin;
    const baseURL = import.meta.env.DEV ? '' : origin;
    const audioUrl = `${baseURL}/public/alarm-sounds/default/${encodeURIComponent(soundFile)}`;
    console.log('재생할 오디오 URL:', audioUrl);
    
    const audio = new Audio(audioUrl);
    
    // 재생 종료 시 상태 초기화
    audio.addEventListener('ended', () => {
      setPlayingAudio(null);
      setPlayingKey(null);
    });
    
    audio.play().then(() => {
      setPlayingAudio(audio);
      setPlayingKey(currentKey);
    }).catch(error => {
      console.error('알림음 재생 실패:', error);
      console.error('오디오 URL:', audioUrl);
      showNotification('알림음 재생에 실패했습니다.', 'error');
    });
  }, [memberNotifications, agentNotifications, userPageNotifications, showNotification, playingAudio, playingKey]);

  // 알림음 설정 렌더링 함수
  const renderNotificationSetting = (label, category, type, enabled, soundFile, interval) => (
    <Grid item xs={12} sm={6} md={4} key={`${category}-${type}`}>
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              {label}
            </Typography>
            <Switch
              checked={enabled}
              onChange={() => handleNotificationToggle(category, type)}
              size="small"
            />
          </Box>
          
          {/* 알림 간격 설정 */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="알림 간격"
              type="number"
              value={interval}
              onChange={(e) => handleIntervalChange(category, type, e.target.value)}
              disabled={!enabled}
              InputProps={{
                endAdornment: <InputAdornment position="end">초</InputAdornment>,
                inputProps: { min: 1, max: 300 }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" fullWidth disabled={!enabled}>
              <InputLabel>알림음 선택</InputLabel>
              <Select
                value={soundFile || ''}
                onChange={(e) => handleSoundSelect(category, type, e.target.value)}
                label="알림음 선택"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                <MenuItem value="">
                  <em>없음</em>
                </MenuItem>
                {availableSounds.map((sound) => (
                  <MenuItem key={sound.value} value={sound.value}>
                    {sound.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <IconButton
              size="small"
              disabled={!enabled || !soundFile}
              title={playingKey === `${category}-${type}` ? "정지" : "미리듣기"}
              onClick={() => handlePlaySound(category, type)}
              color={playingKey === `${category}-${type}` ? "primary" : "default"}
            >
              {!enabled || !soundFile ? <VolumeOffIcon /> : 
               playingKey === `${category}-${type}` ? <StopIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Box>
          
          {soundFile && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {soundFile}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  if (isLoading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="기타설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefresh}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 입금/출금 금액 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="입금/출금 금액 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="최소 입금 금액"
                type="number"
                value={amountSettings.depositMin}
                onChange={(e) => handleAmountChange('depositMin', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="최대 입금 금액"
                type="number"
                value={amountSettings.depositMax}
                onChange={(e) => handleAmountChange('depositMax', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="최소 출금 금액"
                type="number"
                value={amountSettings.withdrawalMin}
                onChange={(e) => handleAmountChange('withdrawalMin', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="최대 출금 금액"
                type="number"
                value={amountSettings.withdrawalMax}
                onChange={(e) => handleAmountChange('withdrawalMax', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 출금 롤링 조건 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="출금 롤링 조건 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={withdrawalRolling.enabled}
                    onChange={(e) => handleWithdrawalRollingChange('enabled', e.target.checked)}
                  />
                }
                label="출금 롤링 조건 활성화"
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                활성화 시 입금액 대비 일정 비율 이상 베팅해야 출금이 가능합니다.
              </Typography>
            </Grid>
            
            {withdrawalRolling.enabled && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="롤링 퍼센트"
                    type="number"
                    value={withdrawalRolling.percentage}
                    onChange={(e) => handleWithdrawalRollingChange('percentage', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: {
                        min: 0,
                        max: 1000
                      }
                    }}
                    helperText="입금액 대비 베팅 필요 비율을 설정합니다. 100%는 입금액과 동일한 금액을 베팅해야 함을 의미합니다."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="안내 메시지"
                    multiline
                    rows={2}
                    value={withdrawalRolling.message}
                    onChange={(e) => handleWithdrawalRollingChange('message', e.target.value)}
                    helperText="사용자에게 표시될 출금 조건 안내 메시지입니다."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>롤링 조건 예시:</strong><br />
                      • 100% 설정: 10,000원 입금 → 10,000원 이상 베팅 필요<br />
                      • 150% 설정: 10,000원 입금 → 15,000원 이상 베팅 필요<br />
                      • 200% 설정: 10,000원 입금 → 20,000원 이상 베팅 필요
                    </Typography>
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>

        {/* 입금 보너스 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="입금 보너스 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={depositBonusSettings.enabled}
                    onChange={(e) => {
                      setDepositBonusSettings(prev => ({
                        ...prev,
                        enabled: e.target.checked
                      }));
                      setHasUnsavedChanges(true);
                      setChangedSections(prev => new Set(prev).add('depositBonus'));
                    }}
                  />
                }
                label="입금 보너스 활성화"
              />
            </Grid>
            
            {depositBonusSettings.enabled && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>보너스 타입</InputLabel>
                    <Select
                      value={depositBonusSettings.type}
                      label="보너스 타입"
                      onChange={(e) => {
                        setDepositBonusSettings(prev => ({
                          ...prev,
                          type: e.target.value
                        }));
                        setHasUnsavedChanges(true);
                        setChangedSections(prev => new Set(prev).add('depositBonus'));
                      }}
                    >
                      <MenuItem value="multiplier">배수</MenuItem>
                      <MenuItem value="flat">고정금액</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={depositBonusSettings.type === 'multiplier' ? '배수' : '보너스 금액'}
                    type="number"
                    value={depositBonusSettings.value}
                    onChange={(e) => {
                      setDepositBonusSettings(prev => ({
                        ...prev,
                        value: parseFloat(e.target.value) || 0
                      }));
                      setHasUnsavedChanges(true);
                      setChangedSections(prev => new Set(prev).add('depositBonus'));
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">
                        {depositBonusSettings.type === 'multiplier' ? '배' : '원'}
                      </InputAdornment>,
                      inputProps: {
                        step: depositBonusSettings.type === 'multiplier' ? 0.1 : 1000,
                        min: depositBonusSettings.type === 'multiplier' ? 1.1 : 0
                      }
                    }}
                    helperText={
                      depositBonusSettings.type === 'multiplier' 
                        ? '예: 2배 설정 시 10,000원 입금 → 20,000원 충전'
                        : '예: 5,000원 설정 시 모든 입금에 5,000원 추가'
                    }
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="최소 입금액"
                    type="number"
                    value={depositBonusSettings.min_deposit}
                    onChange={(e) => {
                      setDepositBonusSettings(prev => ({
                        ...prev,
                        min_deposit: parseInt(e.target.value) || 0
                      }));
                      setHasUnsavedChanges(true);
                      setChangedSections(prev => new Set(prev).add('depositBonus'));
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>
                    }}
                    helperText="이 금액 이상 입금 시에만 보너스 적용"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="최대 보너스"
                    type="number"
                    value={depositBonusSettings.max_bonus}
                    onChange={(e) => {
                      setDepositBonusSettings(prev => ({
                        ...prev,
                        max_bonus: parseInt(e.target.value) || 0
                      }));
                      setHasUnsavedChanges(true);
                      setChangedSections(prev => new Set(prev).add('depositBonus'));
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>
                    }}
                    helperText="1회 입금 시 받을 수 있는 최대 보너스 금액"
                  />
                </Grid>

                {/* 보너스 횟수 제한 설정 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    보너스 횟수 제한 설정
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={depositBonusSettings.bonus_limit_enabled}
                        onChange={(e) => {
                          setDepositBonusSettings(prev => ({
                            ...prev,
                            bonus_limit_enabled: e.target.checked
                          }));
                          setHasUnsavedChanges(true);
                          setChangedSections(prev => new Set(prev).add('depositBonus'));
                        }}
                      />
                    }
                    label="보너스 횟수 제한 활성화"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    활성화 시 설정된 기간 내 보너스 지급 횟수를 제한합니다.
                  </Typography>
                </Grid>
                
                {depositBonusSettings.bonus_limit_enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="제한 횟수"
                        type="number"
                        value={depositBonusSettings.bonus_limit_count}
                        onChange={(e) => {
                          setDepositBonusSettings(prev => ({
                            ...prev,
                            bonus_limit_count: parseInt(e.target.value) || 1
                          }));
                          setHasUnsavedChanges(true);
                          setChangedSections(prev => new Set(prev).add('depositBonus'));
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">회</InputAdornment>,
                          inputProps: { min: 1, max: 100 }
                        }}
                        helperText="설정한 기간 내 보너스를 받을 수 있는 최대 횟수"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>리셋 주기</InputLabel>
                        <Select
                          value={depositBonusSettings.bonus_limit_reset}
                          label="리셋 주기"
                          onChange={(e) => {
                            setDepositBonusSettings(prev => ({
                              ...prev,
                              bonus_limit_reset: e.target.value
                            }));
                            setHasUnsavedChanges(true);
                            setChangedSections(prev => new Set(prev).add('depositBonus'));
                          }}
                        >
                          <MenuItem value="daily">일별</MenuItem>
                          <MenuItem value="weekly">주별</MenuItem>
                          <MenuItem value="monthly">월별</MenuItem>
                          <MenuItem value="none">없음 (전체 기간)</MenuItem>
                        </Select>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                          제한 횟수가 초기화되는 주기를 설정합니다.
                        </Typography>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>보너스 횟수 제한 예시:</strong><br />
                          • 일별 3회 제한: 매일 자정에 보너스 지급 횟수가 3회로 초기화<br />
                          • 주별 10회 제한: 매주 월요일 자정에 보너스 지급 횟수가 10회로 초기화<br />
                          • 월별 30회 제한: 매월 1일 자정에 보너스 지급 횟수가 30회로 초기화<br />
                          • 없음: 사용자당 전체 기간 동안 설정한 횟수만큼만 보너스 지급
                        </Typography>
                      </Alert>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </Paper>

        {/* 베팅 커미션 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="베팅 커미션 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bettingCommissionSettings.enabled}
                    onChange={(e) => handleBettingCommissionChange('enabled', e.target.checked)}
                  />
                }
                label="베팅 커미션 활성화"
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                활성화 시 사용자가 당첨될 때 베팅 금액의 일정 비율을 차감합니다.
              </Typography>
            </Grid>
            
            {bettingCommissionSettings.enabled && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="커미션 비율"
                    type="number"
                    value={bettingCommissionSettings.rate}
                    onChange={(e) => handleBettingCommissionChange('rate', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: {
                        step: 0.1,
                        min: 0,
                        max: 100
                      }
                    }}
                    helperText="예: 10% 설정 시 10,000원 베팅 → 당첨 시 1,000원 차감"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="최소 베팅 금액"
                    type="number"
                    value={bettingCommissionSettings.min_bet_amount}
                    onChange={(e) => handleBettingCommissionChange('min_bet_amount', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>,
                      inputProps: {
                        step: 1000,
                        min: 0
                      }
                    }}
                    helperText="이 금액 이상 베팅 시에만 커미션 적용"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="최대 커미션 금액"
                    type="number"
                    value={bettingCommissionSettings.max_commission}
                    onChange={(e) => handleBettingCommissionChange('max_commission', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>,
                      inputProps: {
                        step: 1000,
                        min: 0
                      }
                    }}
                    helperText="1회 당 차감 가능한 최대 커미션 금액 (0 = 제한 없음)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>커미션 계산 예시:</strong><br />
                      • 베팅: 10,000원, 당첨: 20,000원, 커미션 10%<br />
                      • 커미션 금액: 10,000원 × 10% = 1,000원<br />
                      • 최종 지급: 20,000원 - 1,000원 = 19,000원
                    </Typography>
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>

        {/* 롤링금전환 금액 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="롤링금전환 금액 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="최소 롤링금전환 금액"
                type="number"
                value={amountSettings.rollingMin}
                onChange={(e) => handleAmountChange('rollingMin', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="최대 롤링금전환 금액"
                type="number"
                value={amountSettings.rollingMax}
                onChange={(e) => handleAmountChange('rollingMax', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* API 모듈 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="API 모듈 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={2}>
            {Object.entries(apiModules).map(([module, enabled]) => {
              const labels = {
                slotApi: '슬롯 API',
                casinoApi: '카지노 API',
                sportsApi: '스포츠 API',
                lotteryApi: '복권 API',
                virtualApi: '가상게임 API'
              };
              
              return (
                <Grid item xs={12} sm={6} md={4} key={module}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {labels[module]}
                        </Typography>
                        <Switch
                          checked={enabled}
                          onChange={() => handleApiToggle(module)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* 회원 관련 알림음 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="회원 관련 알림음 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={2}>
            {renderNotificationSetting('회원가입', 'member', 'registration', memberNotifications.registration.enabled, memberNotifications.registration.soundFile, memberNotifications.registration.interval)}
            {renderNotificationSetting('입금문의', 'member', 'depositInquiry', memberNotifications.depositInquiry.enabled, memberNotifications.depositInquiry.soundFile, memberNotifications.depositInquiry.interval)}
            {renderNotificationSetting('출금문의', 'member', 'withdrawalInquiry', memberNotifications.withdrawalInquiry.enabled, memberNotifications.withdrawalInquiry.soundFile, memberNotifications.withdrawalInquiry.interval)}
            {renderNotificationSetting('고객센터', 'member', 'customerService', memberNotifications.customerService.enabled, memberNotifications.customerService.soundFile, memberNotifications.customerService.interval)}
            {renderNotificationSetting('에이전트문의', 'member', 'agentInquiry', memberNotifications.agentInquiry.enabled, memberNotifications.agentInquiry.soundFile, memberNotifications.agentInquiry.interval)}
          </Grid>
        </Paper>

        {/* 하부에이전트 관리자 알림음 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="하부에이전트 관리자 알림음 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={2}>
            {renderNotificationSetting('문의', 'agent', 'inquiry', agentNotifications.inquiry.enabled, agentNotifications.inquiry.soundFile, agentNotifications.inquiry.interval)}
            {renderNotificationSetting('쪽지', 'agent', 'message', agentNotifications.message.enabled, agentNotifications.message.soundFile, agentNotifications.message.interval)}
            {renderNotificationSetting('공지', 'agent', 'notice', agentNotifications.notice.enabled, agentNotifications.notice.soundFile, agentNotifications.notice.interval)}
          </Grid>
        </Paper>

        {/* 유저페이지 알림음 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="유저페이지 알림음 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={2}>
            {renderNotificationSetting('문의', 'userPage', 'inquiry', userPageNotifications.inquiry.enabled, userPageNotifications.inquiry.soundFile, userPageNotifications.inquiry.interval)}
            {renderNotificationSetting('공지사항', 'userPage', 'notice', userPageNotifications.notice.enabled, userPageNotifications.notice.soundFile, userPageNotifications.notice.interval)}
          </Grid>
        </Paper>

        {/* 입금/출금 제한 시간 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="입금/출금 제한 시간 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            {/* 입금 제한 설정 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>입금 제한 설정</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  입금 제한 시간 활성화
                </Typography>
                <Switch
                  checked={depositTimeSettings.enabled}
                  onChange={(e) => handleDepositTimeChange('enabled', e.target.checked)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="제한 시작 시간"
                type="time"
                value={depositTimeSettings.startTime}
                onChange={(e) => handleDepositTimeChange('startTime', e.target.value)}
                disabled={!depositTimeSettings.enabled}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="이 시간부터 입금이 제한됩니다"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="제한 종료 시간"
                type="time"
                value={depositTimeSettings.endTime}
                onChange={(e) => handleDepositTimeChange('endTime', e.target.value)}
                disabled={!depositTimeSettings.enabled}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="이 시간까지 입금이 제한됩니다"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                예시: 00:00 ~ 00:10 설정 시, 자정부터 00:10까지 입금이 제한되며, 00:11부터 23:59까지는 입금이 가능합니다.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>
            
            {/* 출금 제한 설정 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>출금 제한 설정</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  출금 제한 시간 활성화
                </Typography>
                <Switch
                  checked={withdrawalTimeSettings.enabled}
                  onChange={(e) => handleWithdrawalTimeChange('enabled', e.target.checked)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="제한 시작 시간"
                type="time"
                value={withdrawalTimeSettings.startTime}
                onChange={(e) => handleWithdrawalTimeChange('startTime', e.target.value)}
                disabled={!withdrawalTimeSettings.enabled}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="이 시간부터 출금이 제한됩니다"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="제한 종료 시간"
                type="time"
                value={withdrawalTimeSettings.endTime}
                onChange={(e) => handleWithdrawalTimeChange('endTime', e.target.value)}
                disabled={!withdrawalTimeSettings.enabled}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="이 시간까지 출금이 제한됩니다"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                예시: 00:00 ~ 00:10 설정 시, 자정부터 00:10까지 출금이 제한되며, 00:11부터 23:59까지는 출금이 가능합니다.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 입금/출금 쿨다운 설정 */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <TableHeader
            title="입금/출금 쿨다운 설정"
            showSearch={false}
            showIndentToggle={false}
            showPageNumberToggle={false}
            showColumnPinToggle={false}
            sx={{ mb: 3 }}
          />
          
          <Grid container spacing={3}>
            {/* 입금 쿨다운 설정 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>입금 쿨다운 설정</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  입금 쿨다운 활성화
                </Typography>
                <Switch
                  checked={depositCooldownSettings.enabled}
                  onChange={(e) => handleDepositCooldownChange('enabled', e.target.checked)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="쿨다운 시간 (초)"
                type="number"
                value={depositCooldownSettings.seconds}
                onChange={(e) => handleDepositCooldownChange('seconds', e.target.value)}
                disabled={!depositCooldownSettings.enabled}
                InputProps={{
                  endAdornment: <InputAdornment position="end">초</InputAdornment>,
                  inputProps: { min: 1, max: 3600 }
                }}
                helperText="1~3600초 (최대 1시간)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시간당 최대 시도 횟수"
                type="number"
                value={depositCooldownSettings.maxAttemptsPerHour}
                onChange={(e) => handleDepositCooldownChange('maxAttemptsPerHour', e.target.value)}
                disabled={!depositCooldownSettings.enabled}
                InputProps={{
                  endAdornment: <InputAdornment position="end">회</InputAdornment>,
                  inputProps: { min: 1, max: 100 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                입금 신청 후 다음 신청까지 대기해야 하는 시간을 초 단위로 설정합니다. (예: 300초 = 5분)
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>
            
            {/* 출금 쿨다운 설정 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>출금 쿨다운 설정</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  출금 쿨다운 활성화
                </Typography>
                <Switch
                  checked={withdrawalCooldownSettings.enabled}
                  onChange={(e) => handleWithdrawalCooldownChange('enabled', e.target.checked)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="쿨다운 시간 (초)"
                type="number"
                value={withdrawalCooldownSettings.seconds}
                onChange={(e) => handleWithdrawalCooldownChange('seconds', e.target.value)}
                disabled={!withdrawalCooldownSettings.enabled}
                InputProps={{
                  endAdornment: <InputAdornment position="end">초</InputAdornment>,
                  inputProps: { min: 1, max: 3600 }
                }}
                helperText="1~3600초 (최대 1시간)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시간당 최대 시도 횟수"
                type="number"
                value={withdrawalCooldownSettings.maxAttemptsPerHour}
                onChange={(e) => handleWithdrawalCooldownChange('maxAttemptsPerHour', e.target.value)}
                disabled={!withdrawalCooldownSettings.enabled}
                InputProps={{
                  endAdornment: <InputAdornment position="end">회</InputAdornment>,
                  inputProps: { min: 1, max: 100 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                출금 신청 후 다음 신청까지 대기해야 하는 시간을 초 단위로 설정합니다. (예: 300초 = 5분)
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 통합 저장 버튼 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2,
          pt: 2,
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
          pb: 2,
          boxShadow: hasUnsavedChanges ? '0 -2px 10px rgba(0,0,0,0.1)' : 'none'
        }}>
          {hasUnsavedChanges && (
            <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SaveIcon fontSize="small" />
              저장되지 않은 변경사항이 있습니다
            </Typography>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveAll}
            disabled={isSaving || !hasUnsavedChanges}
            sx={{ 
              minWidth: 200,
              boxShadow: hasUnsavedChanges ? 3 : 1
            }}
          >
            {isSaving ? '저장 중...' : '모든 설정 저장'}
          </Button>
        </Box>
      </Box>

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

export default OtherSettingsPage; 