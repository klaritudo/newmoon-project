import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Divider,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Info,
  AccountTree,
  Payment,
  Casino,
  CreditCard,
  BarChart,
  Settings,
  Email,
  Save,
  Public
} from '@mui/icons-material';
import useDynamicTypes from '../../hooks/useDynamicTypes';
import apiService from '../../services/api';

// 탭 컴포넌트 import
import BasicInfoTabWithUsernameChange from './tabs/BasicInfoTabWithUsernameChange';
import TreeViewTab from './tabs/TreeViewTab';
import RollingPaymentTab from './tabs/RollingPaymentTab';
import BettingHistoryTab from './tabs/BettingHistoryTab';
import DepositWithdrawalTab from './tabs/DepositWithdrawalTab';
import StatisticsTab from './tabs/StatisticsTab';
import LineSettingsTab from './tabs/LineSettingsTab';
import MessageTab from './tabs/MessageTab';
import VoidBettingTab from './tabs/VoidBettingTab';
import HonorBalanceMonitor from '../monitoring/HonorBalanceMonitor';
import { useBalanceRefresh } from '../../hooks/useBalanceRefresh';

// 접근성을 위한 탭 속성 설정 함수
function a11yProps(index) {
  return {
    id: `member-tab-${index}`,
    'aria-controls': `member-tabpanel-${index}`,
  };
}

// TabPanel 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: '100%', overflow: 'auto' }}
      className={`member-tab-panel member-tab-panel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%', p: { xs: 1, sm: 2 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MemberDetailDialog = ({ open, onClose, member, onSave }) => {
  const theme = useTheme();
  
  // 컴포넌트 마운트/언마운트 효과
  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);
  
  // 동적 유형 관리 훅 사용
  const {
    types,
    typeHierarchy,
    isLoading: typesLoading,
    error: typesError,
    isInitialized: typesInitialized,
    getTypeInfo,
    getAgentLevelByTypeId,
    getTypeIdByLevelName
  } = useDynamicTypes();
  
  // 상태 관리 - 초기값을 빈 객체로 설정
  const [activeTab, setActiveTab] = useState(0);
  const [editedMember, setEditedMember] = useState({});
  const [siteUrls, setSiteUrls] = useState([]);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 자동 잔액 새로고침 Hook 사용 (10초 간격)
  const { refreshBalance } = useBalanceRefresh(member?.id, 10000, open && activeTab === 8);
  
  // 트리뷰 관련 상태 추가
  const [treeData, setTreeData] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // 접근성을 위한 초기 포커스 요소 참조
  const initialFocusRef = useRef(null);

  // 컴포넌트가 마운트되거나 member prop이 변경될 때 editedMember 상태 업데이트
  useEffect(() => {
    if (member && member.id) {
      // 닉네임이 없는 경우 기본값 추가
      const updatedMember = {
        ...member,
        username: member.username || member.userId?.split('\n')[0] || '',
        nickname: member.nickname || member.userId?.split('\n')[1] || '',
        password: member.password || ''
      };
      
      // 도메인 권한 관련 필드도 명시적으로 초기화
      const cleanMember = {
        ...updatedMember,
        grantPermissionTo: null,  // 항상 null로 초기화
        delegatePermissionType: null,  // 항상 null로 초기화
        selectedDomainId: member.selectedDomainId || null  // 도메인 선택 정보도 초기화
      };
      setEditedMember(cleanMember);
      setSiteUrls(member.siteUrls || []);
      setShowPassword(false); // 다이얼로그가 열릴 때마다 비밀번호 숨김 상태로 초기화
      setActiveTab(0); // 탭도 첫 번째 탭으로 초기화
      setNewSiteUrl(''); // 새 URL 입력 필드도 초기화
      
      // member가 변경되면 항상 selectedAgent도 새로운 member로 업데이트
      setSelectedAgent(updatedMember);
      
      // 트리 데이터도 초기화
      setTreeData(null);
    } else {
      // member가 없으면 모든 상태 초기화
      setEditedMember({});
      setSiteUrls([]);
      setShowPassword(false);
      setActiveTab(0);
      setNewSiteUrl('');
      setSelectedAgent(null);
      setTreeData(null);
    }
  }, [member?.id]); // member 전체가 아닌 id만 의존성으로 사용
  
  // 다이얼로그가 열릴 때 초기 포커스 설정
  useEffect(() => {
    if (open && initialFocusRef.current) {
      // 짧은 지연 후 포커스 설정 (DOM 업데이트 후)
      setTimeout(() => {
        initialFocusRef.current.focus();
      }, 50);
    }
  }, [open]);

  // 다이얼로그가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      // 다이얼로그가 닫히면 모든 상태 초기화
      setEditedMember({});
      setSiteUrls([]);
      setShowPassword(false);
      setActiveTab(0);
      setNewSiteUrl('');
      setSelectedAgent(null);
      setTreeData(null);
    }
  }, [open]);

  // 트리 데이터 생성 함수
  useEffect(() => {
    if (member && open && activeTab === 1) {
      // 실제 구현에서는 API에서 데이터를 가져와야 함
      // 여기서는 샘플 데이터 생성
      const generateTreeData = () => {
        // 상위 계층 구성 - parentTypes 사용
        const upperHierarchy = [];
        
        // 현재 회원
        const currentMember = {
          id: member.id,
          username: member.username,
          nickname: member.nickname || '', // 닉네임이 없는 경우 기본값 설정
          balance: member.balance,
          rate: member.rate,
          phone: member.phone,
          accountNumber: member.accountNumber,
          accountHolder: member.accountHolder,
          bank: member.bank,
          createdAt: member.createdAt,
          status: member.status,
          levelName: member.levelName,
          rollingAmount: member.rollingAmount,
          sharedBetting: member.sharedBetting,
          playerStats: member.playerStats,
          children: []
        };
        
        // 하위 회원 데이터
        // 실제 구현에서는 API에서 하위 회원 데이터를 가져와야 합니다.
        
        // 현재는 window 객체에서 members 데이터를 가져와 사용합니다.
        // 이는 임시 방편이며, 실제 구현에서는 API 호출로 대체되어야 합니다.
        if (window.members && member.hasChildren) {
          const childMembers = window.members.filter(m => m.parentId === member.id);
          
          // 하위 회원 추가
          currentMember.children = childMembers.map(child => {
            const childData = {
              ...child,
              children: []
            };
            
            // 하위 회원의 하위 회원 추가
            const subChildMembers = window.members.filter(m => m.parentId === child.id);
            if (subChildMembers.length > 0) {
              childData.children = subChildMembers;
            }
            
            return childData;
          });
        }
        
        // 계층 구조 생성
        const hierarchyData = {
          id: 'root',
          username: '',
          nickname: '',
          levelName: '',
          children: []
        };
        
        // 상위 계층 추가
        if (upperHierarchy.length > 0) {
          let currentLevel = hierarchyData;
          for (const agent of upperHierarchy) {
            const agentNode = {
              ...agent,
              children: []
            };
            currentLevel.children.push(agentNode);
            currentLevel = agentNode;
          }
          
          // 현재 회원 추가
          currentLevel.children.push(currentMember);
        } else {
          // 상위 계층이 없는 경우 바로 현재 회원 추가
          hierarchyData.children.push(currentMember);
        }
        
        return hierarchyData;
      };
      
      const treeData = generateTreeData();
      setTreeData(treeData);
      setSelectedAgent(member);
    }
  }, [member, open, activeTab]);

  // 에이전트 선택 핸들러
  const handleSelectAgent = (agent) => {
    // 닉네임이 없는 경우 빈 문자열 유지
    if (agent && !agent.nickname) {
      agent.nickname = '';
    }
    setSelectedAgent(agent);
  };

  // 비밀번호 표시/숨김 토글
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    // grantPermissionTo 변경 시 selectedDomainId를 명시적으로 null로 설정
    if (field === 'grantPermissionTo') {
      setEditedMember({
        ...editedMember,
        [field]: value,
        selectedDomainId: null  // 권한 부여 시 도메인 선택 제거
      });
    } else {
      setEditedMember({
        ...editedMember,
        [field]: value
      });
    }
  };

  // 중첩 필드 변경 핸들러
  const handleNestedInputChange = (field, subField, value) => {
    setEditedMember({
      ...editedMember,
      [field]: {
        ...editedMember[field],
        [subField]: value
      }
    });
  };

  // 사이트 URL 추가 핸들러
  const handleAddSiteUrl = () => {
    if (newSiteUrl.trim()) {
      setSiteUrls([...siteUrls, newSiteUrl.trim()]);
      setNewSiteUrl('');
    }
  };

  // 사이트 URL 삭제 핸들러
  const handleDeleteSiteUrl = (index) => {
    const updatedUrls = [...siteUrls];
    updatedUrls.splice(index, 1);
    setSiteUrls(updatedUrls);
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // referral_code가 변경된 경우 별도 API 호출
      if (editedMember.referral_code !== member?.referral_code) {
        // 빈 값인 경우 userId로 설정
        const referralCodeToCheck = editedMember.referral_code || editedMember.userId || editedMember.username || '';
        
        if (referralCodeToCheck) {
          // 중복 체크
          const checkResponse = await apiService.members.checkReferralCode(
            referralCodeToCheck, 
            editedMember.id
          );
          
          if (!checkResponse.data.available) {
            alert(checkResponse.data.message || '사용할 수 없는 추천인 코드입니다.');
            return;
          }
        }
        
        // 추천인 코드 변경 API 호출 (빈 값도 허용, 서버에서 처리)
        await apiService.members.updateReferralCode(
          editedMember.id, 
          editedMember.referral_code || ''
        );
      }
      
      const updatedMember = {
        ...editedMember,
        siteUrls
      };
      // 저장 데이터 준비 완료
      onSave(updatedMember);
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 폼 제출 핸들러
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  // 통화 형식 포맷팅
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', { 
      style: 'decimal',
      maximumFractionDigits: 0 
    }).format(amount || 0);
  };

  // 상위 계층 렌더링
  const renderHierarchy = () => {
    if (!member) return null;
    
    // parentTypes가 있으면 사용 (JSON 문자열인 경우 파싱)
    let hierarchyData = [];
    if (member.parentTypes) {
      if (typeof member.parentTypes === 'string') {
        try {
          hierarchyData = JSON.parse(member.parentTypes);
        } catch (e) {
          hierarchyData = [];
        }
      } else {
        hierarchyData = member.parentTypes;
      }
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
        {/* 상위 계층 표시 */}
        {hierarchyData.length > 0 && hierarchyData.map((agent, index) => {
          // 고유 key 생성
          const agentKey = agent.id || `${agent.label}-${index}`;
          
          // 테두리 색상 (텍스트 색상과 동일하게 사용)
          const borderColor = agent.borderColor || theme.palette.divider;
          
          return (
            <React.Fragment key={agentKey}>
              <Chip 
                label={agent.levelName || agent.label || ''}
                size="small"
                sx={{ 
                  backgroundColor: `${agent.backgroundColor || theme.palette.background.paper} !important`,
                  color: `${borderColor} !important`,
                  border: `1px solid ${borderColor} !important`,
                  fontWeight: 400,
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': {
                    px: 1.5,
                    py: 0.5,
                    color: `${borderColor} !important`
                  }
                }}
              />
              {index < hierarchyData.length - 1 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mx: 0.5 }}>
                  &gt;
                </Typography>
              )}
            </React.Fragment>
          );
        })}
        
        {/* 상위 계층과 현재 회원 사이 화살표 */}
        {hierarchyData && hierarchyData.length > 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mx: 0.5 }}>
            &gt;
          </Typography>
        )}
        
        {/* 현재 회원 칩 */}
        {member && (
          <Chip 
            label={member.agent_level_name || member.levelName || ''}
            size="small"
            sx={{ 
              backgroundColor: `${member.agent_level_bg_color || member.backgroundColor || theme.palette.background.paper} !important`,
              color: `${member.agent_level_border_color || member.borderColor || theme.palette.divider} !important`,
              border: `1px solid ${member.agent_level_border_color || member.borderColor || theme.palette.divider} !important`,
              fontWeight: 400,
              fontSize: '0.75rem',
              height: '24px',
              '& .MuiChip-label': {
                px: 1.5,
                py: 0.5,
                color: `${member.agent_level_border_color || member.borderColor || theme.palette.divider} !important`
              }
            }}
          />
        )}
      </Box>
    );
  };

  // 레벨 칩 스타일 함수
  const getLevelChipStyle = useCallback((item) => {

    // useDynamicTypes 훅이 아직 초기화되지 않은 경우 기본값 반환
    if (!typesInitialized || typeof getTypeIdByLevelName !== 'function' || typeof getTypeInfo !== 'function') {
      // useDynamicTypes가 아직 초기화되지 않음, 기본값 반환
      return {
        backgroundColor: theme.palette.grey[200],
        borderColor: theme.palette.grey[700],
        textColor: theme.palette.grey[700],
        name: typeof item.levelName === 'object' ? 
          (item.levelName.name || item.levelName.label || item.agent_level_name || '') : 
          (item.levelName || item.agent_level_name || '')
      };
    }

    // 아이템에서 유형 정보 추출
    let typeInfo = null;
    
    if (item.type && typeof item.type === 'object') {
      // type이 객체인 경우 (예: { label: '슈퍼관리자', color: 'error', ... })
      const typeId = getTypeIdByLevelName(item.type.label);
      typeInfo = getTypeInfo(typeId);
    } else if (item.type && typeof item.type === 'string') {
      // type이 문자열인 경우
      const typeId = getTypeIdByLevelName(item.type);
      typeInfo = getTypeInfo(typeId);
    } else if (item.levelName) {
      // levelName으로 찾기
      const typeId = getTypeIdByLevelName(item.levelName);
      typeInfo = getTypeInfo(typeId);
    }

    // 동적 유형 정보가 있으면 사용, 없으면 기본값
    if (typeInfo) {
      return {
        backgroundColor: typeInfo.backgroundColor || theme.palette.grey[100],
        textColor: typeInfo.borderColor || theme.palette.text.primary,
        borderColor: typeInfo.borderColor || theme.palette.divider,
        name: typeof typeInfo.label === 'object' ? 
          (typeInfo.label.name || typeInfo.label.label || item.agent_level_name || '') : 
          (typeInfo.label || item.levelName || item.agent_level_name || '')
      };
    }

    // 기본값
    return {
      backgroundColor: theme.palette.grey[100],
      textColor: theme.palette.text.primary,
      borderColor: theme.palette.divider,
      name: typeof item.levelName === 'object' ? 
        (item.levelName.name || item.levelName.label || item.agent_level_name || '') : 
        (item.levelName || item.agent_level_name || '')
    };
  }, [types, typesInitialized, getTypeIdByLevelName, getTypeInfo, theme]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }
      }}
    >
      <DialogTitle 
        id="member-detail-dialog-title" 
        sx={{ 
          minHeight: '64px',
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          py: 1.5,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            회원 상세 정보
          </Typography>
          {member && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Chip 
                label={typeof member.username === 'object' ? member.username.id || '' : member.username || ''} 
                size="small"
                variant="outlined"
                sx={{ 
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  fontWeight: 500,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                {typeof member.nickname === 'object' ? member.nickname.value || '' : member.nickname || ""}
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
          sx={{ 
            color: theme.palette.text.secondary,
            transition: 'all 0.2s',
            '&:hover': { 
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)', overflow: 'hidden' }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          bgcolor: alpha(theme.palette.background.default, 0.5), 
          zIndex: 10, 
          position: 'relative' 
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="member detail tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: '54px',
                textTransform: 'none',
                minWidth: 130,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                py: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.action.hover, 0.7)
                }
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              }
            }}
          >
            <Tab 
              icon={<Info fontSize="small" />} 
              iconPosition="start" 
              label="기본정보" 
              ref={initialFocusRef} 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<AccountTree fontSize="small" />} 
              iconPosition="start" 
              label="트리뷰" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<Payment fontSize="small" />} 
              iconPosition="start" 
              label="롤링/정산" 
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<Casino fontSize="small" />} 
              iconPosition="start" 
              label="베팅내역" 
              {...a11yProps(3)} 
            />
            <Tab 
              icon={<CreditCard fontSize="small" />} 
              iconPosition="start" 
              label="입/출금" 
              {...a11yProps(4)} 
            />
            <Tab 
              icon={<BarChart fontSize="small" />} 
              iconPosition="start" 
              label="통계" 
              {...a11yProps(5)} 
            />
            <Tab 
              icon={<Public fontSize="small" />} 
              iconPosition="start" 
              label="공베팅" 
              {...a11yProps(6)} 
            />
            <Tab 
              icon={<Settings fontSize="small" />} 
              iconPosition="start" 
              label="라인설정" 
              {...a11yProps(7)} 
            />
            <Tab 
              icon={<Email fontSize="small" />} 
              iconPosition="start" 
              label="쪽지" 
              {...a11yProps(8)} 
            />
          </Tabs>
        </Box>
        
        <DialogContent 
          sx={{ 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            flex: '1 1 auto',
            overflow: 'hidden'
          }}
          className="member-detail-content"
        >
          {member && editedMember.id ? (
            <>
              <TabPanel value={activeTab} index={0}>
                <BasicInfoTabWithUsernameChange 
                  key={`basic-info-${editedMember?.id || 'new'}`}
                  editedMember={editedMember}
                  handleInputChange={handleInputChange}
                  handleNestedInputChange={handleNestedInputChange}
                  showPassword={showPassword}
                  toggleShowPassword={toggleShowPassword}
                  siteUrls={siteUrls}
                  newSiteUrl={newSiteUrl}
                  setNewSiteUrl={setNewSiteUrl}
                  handleAddSiteUrl={handleAddSiteUrl}
                  handleDeleteSiteUrl={handleDeleteSiteUrl}
                  renderHierarchy={renderHierarchy}
                  formatCurrency={formatCurrency}
                  getLevelChipStyle={getLevelChipStyle}
                />
              </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <TreeViewTab 
              selectedAgent={editedMember}
              formatCurrency={formatCurrency}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <RollingPaymentTab 
              selectedAgent={selectedAgent} 
              formatCurrency={formatCurrency}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            <BettingHistoryTab 
              selectedAgent={selectedAgent}
              formatCurrency={formatCurrency}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={4}>
            <DepositWithdrawalTab 
              selectedAgent={selectedAgent}
              formatCurrency={formatCurrency}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={5}>
            <StatisticsTab 
              selectedAgent={selectedAgent}
              formatCurrency={formatCurrency}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={6}>
            <VoidBettingTab 
              editedMember={editedMember}
              handleInputChange={handleInputChange}
              handleNestedInputChange={handleNestedInputChange}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={7}>
            <LineSettingsTab 
              member={editedMember} 
              onSave={handleSave}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={8}>
            <MessageTab selectedAgent={selectedAgent} />
          </TabPanel>
            </>
          ) : (
            <Box sx={{ height: '400px' }} />
          )}
        </DialogContent>
      </Box>

      <Divider />

      <DialogActions sx={{ 
        p: 2.5, 
        backgroundColor: alpha(theme.palette.background.default, 0.6), 
        justifyContent: 'flex-end',
        gap: 1.5
      }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            borderRadius: '8px',
            px: 2.5,
            borderColor: alpha(theme.palette.text.secondary, 0.3),
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.action.hover, 0.8)
            }
          }}
        >
          닫기
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          startIcon={<Save />}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            borderRadius: '8px',
            px: 2.5,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.07)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
            }
          }}
          color="primary"
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailDialog; 