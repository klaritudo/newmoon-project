import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  SwapHoriz,
  Lock,
  RestartAlt
} from '@mui/icons-material';
import ParentChips from '../../baseTemplate/components/ParentChips';
import { useDispatch, useSelector } from 'react-redux';
import { toggleUsernameChangeEnabled } from '../../../features/usernameChange/usernameChangeSlice';
import apiService from '../../../services/api';
import bankService from '../../../services/bankService';
import { canAccessFeature } from '../../../constants/permissions';
import Palette from '@mui/icons-material/Palette';
import MemberPermissionDialog from '../MemberPermissionDialog';

const BasicInfoTabWithUsernameChange = ({ 
  editedMember, 
  handleInputChange, 
  handleNestedInputChange, 
  showPassword, 
  toggleShowPassword,
  renderHierarchy,
  formatCurrency,
  getLevelChipStyle
}) => {
  const dispatch = useDispatch();
  const [isValidating, setIsValidating] = useState(false);
  
  // 현재 사용자 정보 가져오기
  const currentUser = useSelector(state => state.auth.user);
  const userPermissions = currentUser?.permissions || [currentUser?.role];
  
  // 비밀번호 변경 권한 체크 - 권한 설정에 따라 결정
  const canChangeSubordinatePassword = true; // 모든 사용자가 비밀번호 필드를 볼 수 있도록 설정
  
  // 비밀번호 변경 관련 상태
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // 활성화된 은행 목록 가져오기
  const [availableBanks, setAvailableBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [parentRollingPercent, setParentRollingPercent] = useState({
    slot: 0,
    casino: 0
  });
  
  // 롤링% 유효성 상태
  const [rollingValidity, setRollingValidity] = useState({
    isValid: true,
    reason: '',
    parentInvalid: false
  });
  
  // 롤링 입력값 상태 (입력 중인 값을 별도 관리)
  const [rollingInputs, setRollingInputs] = useState({
    slot: '0.00',
    casino: '0.00'
  });
  
  // 도메인 관련 상태
  const [userDomains, setUserDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  
  // 도메인 권한 위임 관련 상태 - 초기값을 명확히 설정
  const [domainPermissionInfo, setDomainPermissionInfo] = useState({
    canGrant: false,  // URL권한주기 표시 여부 (1단계만)
    hasPermission: false,  // 권한을 받았는지
    permissionType: '',  // 받은 권한 타입 (self, children)
    delegationStep: 0,  // 위임 단계 (1, 2, 3)
    canDelegate: false,  // 위임 가능 여부
    selectedDomain: null  // 선택된 도메인
  });
  const [childrenLevels, setChildrenLevels] = useState([]);
  const [domainPermissionLoading, setDomainPermissionLoading] = useState(true);  // 하위 단계 목록
  
  // 디자인 템플릿 관련 상태
  const [designTemplates, setDesignTemplates] = useState([]);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [currentDomainDesign, setCurrentDomainDesign] = useState(null);
  
  // 권한 설정 다이얼로그
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  
  // 상위 회원의 롤링% 정보 가져오기
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchParentRollingInfo = async () => {
      if (!editedMember) {
        // editedMember가 없으면 초기화
        setParentRollingPercent({
          slot: 100,
          casino: 100
        });
        return;
      }
      
      
      // 1단계 회원은 무조건 최상위
      if (editedMember.agent_level_id === 1 || editedMember.agent_level_id === '1') {
        setParentRollingPercent({
          slot: 100,  // 최상위는 100%까지 가능
          casino: 100
        });
        return;
      }
      
      // 최상위 회원 체크 (is_top_level 필드 또는 parentId가 없거나 0인 경우)
      const isTopLevel = 
        editedMember?.is_top_level === true || 
        editedMember?.is_top_level === 1 ||
        (!editedMember?.parentId && !editedMember?.parent_id) ||
        editedMember?.parentId === 0 || 
        editedMember?.parent_id === 0;
        
      if (!isTopLevel && (editedMember?.parentId || editedMember?.parent_id)) {
        const parentId = editedMember.parentId || editedMember.parent_id;
        try {
          // API를 통해 상위 회원 정보 가져오기
          const response = await apiService.members.getById(parentId, {
            signal: abortController.signal
          });
          if (response.data?.success && response.data?.data) {
            const parentData = response.data.data;
            setParentRollingPercent({
              slot: parseFloat(parentData.slot_percent || 0),
              casino: parseFloat(parentData.casino_percent || 0)
            });
          }
        } catch (error) {
          // 요청이 취소된 경우 무시
          if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            return;
          }
          // 401 에러인 경우 로그아웃 방지
          if (error.response?.status === 401) {
            console.warn('상위 회원 정보 조회 중 인증 오류 - 로컬 데이터 사용');
          }
          
          // 상위 회원 정보 조회 실패
          // 실패 시 hierarchy에서 찾기 (폴백)
          const parentInfo = editedMember.hierarchy?.find(h => h.id === parentId);
          if (parentInfo) {
            setParentRollingPercent({
              slot: parseFloat(parentInfo.slot_percent || parentInfo.rollingPercent || 0),
              casino: parseFloat(parentInfo.casino_percent || parentInfo.rollingPercent || 0)
            });
          } else {
            // hierarchy에서도 찾을 수 없으면 기본값 사용
            setParentRollingPercent({
              slot: 100,
              casino: 100
            });
          }
        }
      } else {
        // 상위 회원이 없는 경우 (최상위)
        // 최상위 회원으로 확인됨
        setParentRollingPercent({
          slot: 100,  // 최상위는 100%까지 가능
          casino: 100
        });
      }
    };
    
    fetchParentRollingInfo();
    
    // Cleanup: 컴포넌트 언마운트 시 요청 취소
    return () => {
      abortController.abort();
    };
  }, [editedMember]);
  
  // 롤링 입력값 초기화
  useEffect(() => {
    if (editedMember) {
      const slotValue = editedMember.slot_percent !== undefined ? 
        parseFloat(editedMember.slot_percent) : 
        (editedMember.rollingPercent !== undefined ? parseFloat(editedMember.rollingPercent) : 0);
      const casinoValue = editedMember.casino_percent !== undefined ? 
        parseFloat(editedMember.casino_percent) : 
        (editedMember.rollingPercent !== undefined ? parseFloat(editedMember.rollingPercent) : 0);
      
      setRollingInputs({
        slot: isNaN(slotValue) ? '0.00' : slotValue.toFixed(2),
        casino: isNaN(casinoValue) ? '0.00' : casinoValue.toFixed(2)
      });
      
      // 롤링% 유효성 정보 설정
      if (editedMember.rollingValidity) {
        setRollingValidity(editedMember.rollingValidity);
      }
    }
  }, [editedMember]);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    // API에서 활성화된 은행명 목록 가져오기
    const fetchBanks = async () => {
      try {
        setBanksLoading(true);
        const bankNames = await bankService.getActiveBankNames({
          signal: abortController.signal
        });
        
        setAvailableBanks(bankNames);
      } catch (error) {
        // 요청이 취소된 경우 무시
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          return;
        }
        // 은행 목록 조회 실패
        // 에러 발생 시 빈 배열로 설정
        setAvailableBanks([]);
      } finally {
        setBanksLoading(false);
      }
    };
    
    fetchBanks();
    
    return () => {
      abortController.abort();
    };
  }, []);
  
  // 유저 도메인 목록 가져오기
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchDomainData = async () => {
      try {
        setLoadingDomains(true);
        
        // 도메인 목록 가져오기
        const domainsResponse = await apiService.get('/domains/type/user', {
          signal: abortController.signal
        });
        if (domainsResponse.data.success) {
          setUserDomains(domainsResponse.data.data || []);
        }
      } catch (error) {
        // 요청이 취소된 경우 무시
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          return;
        }
        // 401 에러인 경우 로그아웃 방지
        if (error.response?.status === 401) {
          console.warn('도메인 데이터 조회 중 인증 오류 - 빈 배열 사용');
        } else {
          console.error('도메인 데이터 조회 실패:', error);
        }
        setUserDomains([]);
      } finally {
        setLoadingDomains(false);
      }
    };
    
    if (editedMember) {
      fetchDomainData();
    }
    
    return () => {
      abortController.abort();
    };
  }, [editedMember?.id]); // editedMember 전체가 아닌 id만 의존성으로
  
  // 도메인 권한 위임 정보 가져오기
  useEffect(() => {
    // AbortController를 사용하여 이전 요청 취소
    let abortController = new AbortController();
    
    const fetchDomainPermissionInfo = async () => {
      // 로딩 시작
      setDomainPermissionLoading(true);
      
      // 항상 초기화부터 시작
      setDomainPermissionInfo({
        canGrant: false,
        hasPermission: false,
        permissionType: '',
        delegationStep: 0,
        canDelegate: false,
        selectedDomain: null
      });
      setChildrenLevels([]);
      
      if (!editedMember || !editedMember.id) {
        setDomainPermissionLoading(false);
        return;
      }
      
      // 현재 member ID를 저장하여 응답 처리 시 검증
      const currentMemberId = editedMember.id;
      
      try {
        // 1단계 회원인지 확인
        const isFirstLevel = editedMember.agent_level_id === 1 || editedMember.agent_level_id === '1';
        
        // 모든 회원에 대해 권한 정보 조회
        const response = await apiService.get(`/user-domain-permissions/member/${editedMember.id}`, {
          signal: abortController.signal
        });
        
        if (response.data.success && response.data.data) {
          const permissionData = response.data.data;
          
          // 응답 데이터의 memberId가 현재 편집 중인 member와 일치하는지 확인
          if (permissionData.memberId !== currentMemberId) {
            console.warn('응답 데이터가 현재 회원과 일치하지 않음:', {
              expected: currentMemberId,
              received: permissionData.memberId
            });
            setDomainPermissionLoading(false);
            return;
          }
          
          const delegation = permissionData.delegation;
          
          if (isFirstLevel) {
            // 1단계인 경우
            setDomainPermissionInfo({
              canGrant: true,
              hasPermission: false,
              permissionType: '',
              delegationStep: 0,
              canDelegate: false,
              selectedDomain: null
            });
            
            // 권한 부여 정보는 저장하지만 handleInputChange는 호출하지 않음
            // UI는 domainPermissionInfo 상태를 기반으로 표시
          } else {
            // 1단계가 아닌 경우
            if (delegation && delegation.id) {
              const delegationStep = delegation.delegation_step || 0;
              const permissionType = delegation.delegation_type || '';
              
              // 권한이 있는 경우
              setDomainPermissionInfo({
                canGrant: false,
                hasPermission: true,
                permissionType: permissionType,
                delegationStep: delegationStep,
                canDelegate: delegation.can_delegate || false,
                selectedDomain: permissionData.selectedDomain
              });
              
              // 도메인 선택 정보는 domainPermissionInfo에 저장
              
              // Step 3인 경우는 UI에서 자동으로 본인위임으로 표시
              
              // 권한 부여 정보가 있으면 설정 (Step 2도 포함)
              if (permissionData.grantedToInfo && delegation.can_delegate) {
                const grantedToInfo = permissionData.grantedToInfo;
                // 권한 부여 정보는 domainPermissionInfo에 저장
              }
            } else {
              // 권한이 없는 경우
              setDomainPermissionInfo({
                canGrant: false,
                hasPermission: false,
                permissionType: '',
                delegationStep: 0,
                canDelegate: false,
                selectedDomain: null
              });
            }
          }
        } else {
          // API 응답 실패
          setDomainPermissionInfo({
            canGrant: isFirstLevel,
            hasPermission: false,
            permissionType: '',
            delegationStep: 0,
            canDelegate: false,
            selectedDomain: null
          });
        }
        
        // 자신의 라인에 속한 모든 하위 단계 가져오기
        if (editedMember.agent_level_id) {
          const levelsResponse = await apiService.agentLevels.getAll({
            signal: abortController.signal
          });
          if (levelsResponse.data.success) {
            // 현재 단계보다 하위 단계만 필터링
            const currentLevel = levelsResponse.data.data.find(l => l.id === editedMember.agent_level_id);
            if (currentLevel) {
              const lowerLevels = levelsResponse.data.data.filter(l => l.level > currentLevel.level);
              
              // 각 레벨에 자신의 라인에 몇 명이 있는지 확인 (선택사항)
              if (editedMember.id) {
                try {
                  // 자신의 전체 하위 구조를 가져오기 위한 API 호출 (있다면)
                  // 현재는 레벨 정보만 표시
                  setChildrenLevels(lowerLevels);
                } catch (error) {
                  console.error('하위 구조 조회 실패:', error);
                  setChildrenLevels(lowerLevels);
                }
              } else {
                setChildrenLevels(lowerLevels);
              }
            }
          }
        }
      } catch (error) {
        // 요청이 취소된 경우는 무시
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
          console.log('이전 도메인 권한 정보 요청이 취소됨');
          return;
        }
        
        // 401 에러인 경우 로그아웃 방지
        if (error.response?.status === 401) {
          console.warn('도메인 권한 정보 조회 중 인증 오류 - 기본값 사용');
        } else {
          console.error('도메인 권한 정보 조회 실패:', error);
        }
      } finally {
        // 로딩 완료 - 취소된 경우가 아닐 때만
        if (!abortController.signal.aborted) {
          setDomainPermissionLoading(false);
        }
      }
    };
    
    fetchDomainPermissionInfo();
    
    // cleanup 함수: 컴포넌트 언마운트시 또는 의존성 변경시 이전 요청 취소
    return () => {
      abortController.abort();
    };
  }, [editedMember?.id, editedMember?.agent_level_id]); // id와 agent_level_id만 의존성으로
  
  // 디자인 템플릿 목록 가져오기
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchDesignData = async () => {
      try {
        setLoadingDesign(true);
        
        // 디자인 템플릿 목록 가져오기
        const templatesResponse = await apiService.get('/design-templates/templates', {
          signal: abortController.signal
        });
        if (templatesResponse.data.success) {
          setDesignTemplates(templatesResponse.data.data || []);
        }
        
        // 선택된 도메인의 현재 디자인 가져오기
        if (editedMember?.selectedDomainId) {
          const domainDesignResponse = await apiService.get(`/design-templates/domain/${editedMember.selectedDomainId}`, {
            signal: abortController.signal
          });
          if (domainDesignResponse.data.success && domainDesignResponse.data.data) {
            setCurrentDomainDesign(domainDesignResponse.data.data.template_id);
            // 현재 도메인 디자인은 currentDomainDesign 상태에만 저장
          }
        }
      } catch (error) {
        // 요청이 취소된 경우 무시
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          return;
        }
        console.error('디자인 데이터 조회 실패:', error);
        setDesignTemplates([]);
      } finally {
        setLoadingDesign(false);
      }
    };
    
    if (editedMember) {
      fetchDesignData();
    }
    
    return () => {
      abortController.abort();
    };
  }, [editedMember?.id, editedMember?.selectedDomainId]);
  

  // 아이디바꿔주기 토글 핸들러
  const handleUsernameChangeToggle = async (event) => {
    const { checked } = event.target;
    
    if (checked) {
      // 활성화 시 검증
      setIsValidating(true);
      try {
        // API를 통한 유효성 검사
        const response = await apiService.usernameChange.validateChange(editedMember.username);
        const { canChange, reason } = response.data;
        
        if (!canChange) {
          alert(reason || '아이디 변경이 불가능합니다.');
          event.target.checked = false;
          setIsValidating(false);
          return;
        }
        
        // 로컬 검증: 게임 상태와 보유금 확인
        const isGameInProgress = editedMember.gameStatus === '게임중';
        const hasBalance = (editedMember.balance || 0) > 0;
        const hasGameMoney = (editedMember.gameMoney || 0) > 0;
        const hasRolling = 
          (editedMember.rollingAmount?.slot || 0) > 0 || 
          (editedMember.rollingAmount?.casino || 0) > 0;
        
        if (isGameInProgress) {
          alert('게임 진행 중에는 아이디 변경을 활성화할 수 없습니다.');
          event.target.checked = false;
          setIsValidating(false);
          return;
        }
        
        if (hasBalance || hasGameMoney || hasRolling) {
          alert('보유머니, 게임머니 또는 롤링금이 있는 경우 아이디 변경을 활성화할 수 없습니다.');
          event.target.checked = false;
          setIsValidating(false);
          return;
        }
      } catch (error) {
        // 아이디 변경 검증 실패
        alert('아이디 변경 가능 여부를 확인할 수 없습니다.');
        event.target.checked = false;
        setIsValidating(false);
        return;
      }
    }
    
    // API 호출하여 서버에 상태 변경 요청
    try {
      const toggleResponse = await apiService.usernameChange.toggleChangeEnabled(
        editedMember.username || editedMember.userId, 
        checked
      );
      
      if (toggleResponse.data.success) {
        // 성공 시 로컬 상태 업데이트
        handleInputChange('usernameChangeEnabled', checked);
        dispatch(toggleUsernameChangeEnabled({ 
          userId: editedMember.userId, 
          enabled: checked 
        }));
        
        // 성공 메시지 (선택사항)
        if (checked) {
          console.log('아이디 변경이 활성화되었습니다.');
        } else {
          console.log('아이디 변경이 비활성화되었습니다.');
        }
      } else {
        // API 호출은 성공했지만 서버에서 거부한 경우
        alert(toggleResponse.data.message || '아이디 변경 설정을 변경할 수 없습니다.');
        event.target.checked = !checked; // 원래 상태로 되돌리기
      }
    } catch (error) {
      // API 호출 실패
      console.error('아이디 변경 토글 오류:', error);
      alert('아이디 변경 설정 중 오류가 발생했습니다.');
      event.target.checked = !checked; // 원래 상태로 되돌리기
    }
    
    setIsValidating(false);
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordChange = (field, value) => {
    setPasswordForm({
      ...passwordForm,
      [field]: value
    });
    setPasswordError('');
  };
  
  // 비밀번호 저장 핸들러
  const handlePasswordSave = () => {
      // 유효성 검사
    if (!passwordForm.currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }
    
    if (!passwordForm.newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요.');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 변경 처리
    handleInputChange && handleInputChange('password', passwordForm.newPassword);
    
    // 폼 초기화
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };
  
  // 도메인 위임 초기화 핸들러
  const handleResetDomainPermissions = async () => {
    if (!window.confirm('모든 도메인 위임 권한을 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 하위 회원의 도메인 권한이 제거됩니다.')) {
      return;
    }
    
    try {
      const response = await apiService.post('/user-domain-permissions/reset-all');
      
      if (response.data.success) {
        alert('도메인 위임 권한이 초기화되었습니다.');
        // 현재 회원 정보 새로고침
        window.location.reload();
      } else {
        alert('도메인 위임 초기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('도메인 위임 초기화 오류:', error);
      alert('도메인 위임 초기화 중 오류가 발생했습니다.');
    }
  };


  return (
    <>
      {/* 상위 계층 표시 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">상위단계</Typography>
            {renderHierarchy && renderHierarchy()}
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Security />}
            onClick={() => setPermissionDialogOpen(true)}
            size="small"
          >
            권한 설정
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 왼쪽 컬럼 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>계정 정보</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="아이디"
                  value={editedMember?.username || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="닉네임"
                  value={editedMember?.nickname || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('nickname', e.target.value)}
                />
              </Grid>
              {canChangeSubordinatePassword && (
                <Grid item xs={12}>
                  {!isChangingPassword ? (
                    // 비밀번호 변경 모드가 아닐 때 - 변경 버튼만 표시
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        label="비밀번호"
                        value="••••••••"
                        fullWidth
                        margin="normal"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setIsChangingPassword(true)}
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          height: '56px',
                          px: 2,
                          mb: '8px' // TextField의 margin과 맞추기 위해 추가
                        }}
                      >
                        비밀번호 변경
                      </Button>
                    </Box>
                  ) : (
                  // 비밀번호 변경 모드일 때
                  <Box>
                    <TextField
                      label="현재 비밀번호"
                      type="password"
                      value={passwordForm.currentPassword || ''}
                      fullWidth
                      margin="normal"
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      error={!!passwordError && !passwordForm.currentPassword}
                    />
                    <TextField
                      label="새 비밀번호"
                      type="password"
                      value={passwordForm.newPassword || ''}
                      fullWidth
                      margin="normal"
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      error={!!passwordError && (!passwordForm.newPassword || passwordForm.newPassword.length < 6)}
                      helperText="최소 6자 이상"
                    />
                    <TextField
                      label="비밀번호 확인"
                      type="password"
                      value={passwordForm.confirmPassword || ''}
                      fullWidth
                      margin="normal"
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      error={!!passwordError && passwordForm.newPassword !== passwordForm.confirmPassword}
                    />
                    {passwordError && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {passwordError}
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handlePasswordSave}
                        color="primary"
                      >
                        저장
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setPasswordError('');
                        }}
                      >
                        취소
                      </Button>
                    </Box>
                  </Box>
                )}
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="이름"
                  value={editedMember?.name || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="전화번호"
                  value={editedMember?.phone || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="추천인 코드"
                  value={editedMember?.referral_code || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('referral_code', e.target.value)}
                  helperText="나의 추천인 코드 (영문, 한글, 숫자 조합 가능)"
                />
              </Grid>
              
              {/* 아이디바꿔주기 토글 추가 */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHoriz color="primary" />
                    <Typography variant="body1">아이디바꿔주기</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedMember?.usernameChangeEnabled || false}
                        onChange={handleUsernameChangeToggle}
                        disabled={isValidating}
                        color="primary"
                      />
                    }
                    label={editedMember?.usernameChangeEnabled ? "활성" : "비활성"}
                    labelPlacement="start"
                  />
                </Box>
                {editedMember?.usernameChangeEnabled && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    아이디 변경이 활성화되었습니다. 사이트설정에서 변경 가능합니다.
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>상태 정보</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>현재 상태:</Typography>
                  <Chip
                    label={typeof editedMember?.status === 'object' ? 
                      (editedMember.status.label || '정상') : 
                      (editedMember?.status || '정상')}
                    color={
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '정상' ? 'success' :
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '비활성' ? 'warning' :
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '차단' ? 'error' :
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '삭제' ? 'default' : 'primary'
                    }
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>상태 변경</InputLabel>
                  <Select
                    value={typeof editedMember?.status === 'object' ? 
                      (editedMember.status.label || '정상') : 
                      (editedMember?.status || '정상')}
                    label="상태 변경"
                    onChange={(e) => handleInputChange && handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="정상">정상</MenuItem>
                    <MenuItem value="비활성">비활성</MenuItem>
                    <MenuItem value="차단">차단</MenuItem>
                    <MenuItem value="삭제">삭제</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                    마지막 상태 변경: {editedMember?.statusChangedAt || '없음'}
                  </Typography>
                  {editedMember?.statusChangedBy && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      변경자: {editedMember.statusChangedBy}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="가입일"
                  value={editedMember?.createdAt || editedMember?.registrationDate || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="최근 접속일"
                  value={editedMember?.lastLoginAt || editedMember?.connectionDate || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 오른쪽 컬럼 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>보유 금액</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="보유머니"
                  value={formatCurrency ? (formatCurrency(editedMember?.balance) || '') : String(editedMember?.balance || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="게임머니"
                  value={formatCurrency ? (formatCurrency(editedMember?.gameMoney) || '') : String(editedMember?.gameMoney || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>롤링 설정</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="슬롯 롤링 %"
                  value={rollingInputs.slot}
                  fullWidth
                  margin="normal"
                  disabled={(editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parentRollingPercent.slot === 0}
                  placeholder={parentRollingPercent.slot > 0 ? `${parentRollingPercent.slot.toFixed(2)}% 이하로 입력가능` : '상위 회원의 롤링%가 0%입니다'}
                  error={!rollingValidity.isValid || ((editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parseFloat(rollingInputs.slot) > parentRollingPercent.slot)}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 모든 입력을 일단 허용
                    setRollingInputs(prev => ({ ...prev, slot: value }));
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value) || 0;
                    
                    // 1단계 회원은 제한 없음
                    if (editedMember?.agent_level_id === 1 || editedMember?.agent_level_id === '1') {
                      setRollingInputs(prev => ({ ...prev, slot: numValue.toFixed(2) }));
                      handleInputChange && handleInputChange('slot_percent', numValue);
                      return;
                    }
                    
                    // 상위 회원 롤링% 체크
                    if (parentRollingPercent.slot > 0 && numValue > parentRollingPercent.slot) {
                      alert(`상위 회원의 슬롯 롤링%(${parentRollingPercent.slot.toFixed(2)}%)를 초과할 수 없습니다.`);
                      setRollingInputs(prev => ({ ...prev, slot: parentRollingPercent.slot.toFixed(2) }));
                      handleInputChange && handleInputChange('slot_percent', parentRollingPercent.slot);
                    } else {
                      setRollingInputs(prev => ({ ...prev, slot: numValue.toFixed(2) }));
                      handleInputChange && handleInputChange('slot_percent', numValue);
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    sx: {
                      '& input': {
                        color: !rollingValidity.isValid || ((editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parseFloat(rollingInputs.slot) > parentRollingPercent.slot) ? 'error.main' : 'inherit',
                        fontWeight: !rollingValidity.isValid || ((editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parseFloat(rollingInputs.slot) > parentRollingPercent.slot) ? 'bold' : 'normal',
                        textDecoration: !rollingValidity.isValid ? 'line-through' : 'none'
                      }
                    }
                  }}
                  helperText={
                    // 1단계 회원은 제한 없음
                    (editedMember?.agent_level_id === 1 || editedMember?.agent_level_id === '1')
                      ? "최상위 회원 - 제한 없음"
                      : !rollingValidity.isValid && rollingValidity.parentInvalid
                        ? "상위 회원의 롤링%가 유효하지 않아 적용할 수 없습니다"
                        : parseFloat(rollingInputs.slot) > parentRollingPercent.slot
                          ? `상위 회원(${parentRollingPercent.slot.toFixed(2)}%)보다 높습니다`
                          : parentRollingPercent.slot === 0 
                            ? "상위 회원의 롤링%가 0%이므로 설정할 수 없습니다" 
                            : `상위 슬롯 롤링: ${parseFloat(parentRollingPercent.slot).toFixed(2)}% 이하로 입력가능`
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="카지노 롤링 %"
                  value={rollingInputs.casino}
                  fullWidth
                  margin="normal"
                  disabled={(editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parentRollingPercent.casino === 0}
                  placeholder={parentRollingPercent.casino > 0 ? `${parentRollingPercent.casino.toFixed(2)}% 이하로 입력가능` : '상위 회원의 롤링%가 0%입니다'}
                  error={!rollingValidity.isValid || ((editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parseFloat(rollingInputs.casino) > parentRollingPercent.casino)}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 모든 입력을 일단 허용
                    setRollingInputs(prev => ({ ...prev, casino: value }));
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value) || 0;
                    
                    // 1단계 회원은 제한 없음
                    if (editedMember?.agent_level_id === 1 || editedMember?.agent_level_id === '1') {
                      setRollingInputs(prev => ({ ...prev, casino: numValue.toFixed(2) }));
                      handleInputChange && handleInputChange('casino_percent', numValue);
                      return;
                    }
                    
                    // 상위 회원 롤링% 체크
                    if (parentRollingPercent.casino > 0 && numValue > parentRollingPercent.casino) {
                      alert(`상위 회원의 카지노 롤링%(${parentRollingPercent.casino.toFixed(2)}%)를 초과할 수 없습니다.`);
                      setRollingInputs(prev => ({ ...prev, casino: parentRollingPercent.casino.toFixed(2) }));
                      handleInputChange && handleInputChange('casino_percent', parentRollingPercent.casino);
                    } else {
                      setRollingInputs(prev => ({ ...prev, casino: numValue.toFixed(2) }));
                      handleInputChange && handleInputChange('casino_percent', numValue);
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    sx: {
                      '& input': {
                        color: !rollingValidity.isValid || ((editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parseFloat(rollingInputs.casino) > parentRollingPercent.casino) ? 'error.main' : 'inherit',
                        fontWeight: !rollingValidity.isValid || ((editedMember?.agent_level_id !== 1 && editedMember?.agent_level_id !== '1') && parseFloat(rollingInputs.casino) > parentRollingPercent.casino) ? 'bold' : 'normal',
                        textDecoration: !rollingValidity.isValid ? 'line-through' : 'none'
                      }
                    }
                  }}
                  helperText={
                    // 1단계 회원은 제한 없음
                    (editedMember?.agent_level_id === 1 || editedMember?.agent_level_id === '1')
                      ? "최상위 회원 - 제한 없음"
                      : !rollingValidity.isValid && rollingValidity.parentInvalid
                        ? "상위 회원의 롤링%가 유효하지 않아 적용할 수 없습니다"
                        : parseFloat(rollingInputs.casino) > parentRollingPercent.casino
                          ? `상위 회원(${parentRollingPercent.casino.toFixed(2)}%)보다 높습니다`
                          : parentRollingPercent.casino === 0 
                            ? "상위 회원의 롤링%가 0%이므로 설정할 수 없습니다" 
                            : `상위 카지노 롤링: ${parseFloat(parentRollingPercent.casino).toFixed(2)}% 이하로 입력가능`
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="슬롯 롤링금액"
                  value={formatCurrency ? (formatCurrency(editedMember?.rolling_slot_amount || editedMember?.rollingAmount?.slot || 0) || '') : String(editedMember?.rolling_slot_amount || editedMember?.rollingAmount?.slot || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="카지노 롤링금액"
                  value={formatCurrency ? (formatCurrency(editedMember?.rolling_casino_amount || editedMember?.rollingAmount?.casino || 0) || '') : String(editedMember?.rolling_casino_amount || editedMember?.rollingAmount?.casino || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="총 롤링금액"
                  value={formatCurrency ? (formatCurrency((editedMember?.rolling_slot_amount || 0) + (editedMember?.rolling_casino_amount || 0)) || '') : String((editedMember?.rolling_slot_amount || 0) + (editedMember?.rolling_casino_amount || 0))}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      fontWeight: 'bold',
                      color: 'primary.main'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>계좌 정보</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>은행</InputLabel>
                  <Select
                    value={editedMember?.bank || ''}
                    label="은행"
                    onChange={(e) => handleInputChange && handleInputChange('bank', e.target.value)}
                    disabled={banksLoading}
                  >
                    <MenuItem value="">
                      <em>선택하세요</em>
                    </MenuItem>
                    {banksLoading ? (
                      <MenuItem disabled>
                        <em>은행 목록 로딩 중...</em>
                      </MenuItem>
                    ) : availableBanks.length > 0 ? (
                      availableBanks.map((bank) => (
                        <MenuItem key={bank} value={bank}>
                          {bank}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <em>등록된 은행이 없습니다</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="계좌번호"
                  value={editedMember?.accountNumber || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('accountNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="예금주"
                  value={editedMember?.accountHolder || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('accountHolder', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>사이트 설정</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="브라우저 타이틀"
                  value={editedMember?.browserTitle || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('browserTitle', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>사이트 언어</InputLabel>
                  <Select
                    value={editedMember?.language || 'ko'}
                    label="사이트 언어"
                    onChange={(e) => handleInputChange && handleInputChange('language', e.target.value)}
                  >
                    <MenuItem value="ko">한국어</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                    <MenuItem value="ja">日本語</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* 1단계 회원 - URL권한주기 */}
              {domainPermissionLoading ? (
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
                </Grid>
              ) : domainPermissionInfo.canGrant ? (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>URL권한주기</InputLabel>
                      <Select
                        value={editedMember?.grantPermissionTo || ''}
                        label="URL권한주기"
                        onChange={(e) => handleInputChange && handleInputChange('grantPermissionTo', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>선택 안함</em>
                        </MenuItem>
                        {childrenLevels.map((level) => (
                          <MenuItem key={level.id} value={level.id}>
                            {level.name} ({level.level}단계)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RestartAlt />}
                      onClick={handleResetDomainPermissions}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      도메인 위임 초기화
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      * 모든 하위 회원의 도메인 권한이 제거됩니다.
                    </Typography>
                  </Grid>
                </>
              ) : null}
              
              {/* 권한받은 회원 - 회원페이지URL권한 */}
              {domainPermissionLoading ? null : (domainPermissionInfo.hasPermission && !domainPermissionInfo.canGrant ? (
                <Grid item xs={12}>
                  {/* Step 3 (delegation_step >= 2)인 경우 본인위임으로 고정 */}
                  {domainPermissionInfo.delegationStep >= 2 ? (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>회원페이지URL권한</InputLabel>
                      <Select
                        value="self"
                        label="회원페이지URL권한"
                        disabled
                      >
                        <MenuItem value="self">본인위임</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>회원페이지URL권한</InputLabel>
                      <Select
                        value={editedMember?.delegatePermissionType || domainPermissionInfo.permissionType || ''}
                        label="회원페이지URL권한"
                        onChange={(e) => handleInputChange && handleInputChange('delegatePermissionType', e.target.value)}
                      >
                        <MenuItem value="self">본인위임</MenuItem>
                        {childrenLevels.map((level) => (
                          <MenuItem key={level.id} value={`children_${level.id}`}>
                            {level.name} ({level.level}단계)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Grid>
              ) : null)}
              
              {/* 본인위임 선택 시 또는 Step 3인 경우 - 회원페이지URL선택 */}
              {domainPermissionInfo.hasPermission && 
               domainPermissionInfo.canGrant === false &&
               (domainPermissionInfo.permissionType === 'self' || 
                (editedMember?.delegatePermissionType === 'self' && editedMember?.delegatePermissionType !== '') ||
                domainPermissionInfo.delegationStep >= 2) && (
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>회원페이지URL선택</InputLabel>
                    <Select
                      value={editedMember?.selectedDomainId !== undefined ? String(editedMember.selectedDomainId || '') : String(domainPermissionInfo.selectedDomain?.id || '')}
                      label="회원페이지URL선택"
                      onChange={(e) => handleInputChange && handleInputChange('selectedDomainId', e.target.value)}
                      disabled={loadingDomains}
                    >
                      <MenuItem value="">
                        <em>선택 안함</em>
                      </MenuItem>
                      {userDomains.map((domain) => (
                        <MenuItem key={domain.id} value={domain.id}>
                          {domain.url}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* 디자인 템플릿 선택 - 도메인이 선택된 경우에만 표시 */}
              {editedMember?.selectedDomainId && (
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Palette sx={{ fontSize: 20 }} />
                        디자인 템플릿
                      </Box>
                    </InputLabel>
                    <Select
                      value={editedMember?.designTemplateId || ''}
                      label="디자인 템플릿"
                      onChange={(e) => handleInputChange && handleInputChange('designTemplateId', e.target.value)}
                      disabled={loadingDesign}
                      renderValue={(selected) => {
                        const selectedTemplate = designTemplates.find(t => t.id === selected);
                        return selectedTemplate ? selectedTemplate.design_name : '선택 안함';
                      }}
                    >
                      <MenuItem value="">
                        <em>선택 안함</em>
                      </MenuItem>
                      {designTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Palette sx={{ fontSize: 20, color: 'action.active' }} />
                            {template.design_name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 2 }}>
                    * 선택한 도메인에 디자인 템플릿이 적용됩니다.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>메모</Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={editedMember?.memo || ''}
              onChange={(e) => handleInputChange && handleInputChange('memo', e.target.value)}
              placeholder="회원에 대한 메모를 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  padding: '12px',
                },
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      
      {/* 권한 설정 다이얼로그 */}
      <MemberPermissionDialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        member={editedMember}
        onPermissionUpdate={() => {
          // 권한 업데이트 후 필요한 처리
          console.log('권한이 업데이트되었습니다.');
        }}
      />
    </>
  );
};

export default BasicInfoTabWithUsernameChange;