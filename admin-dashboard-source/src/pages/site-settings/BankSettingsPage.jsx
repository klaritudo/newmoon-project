import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalance as BankIcon,
  ContentCopy as CopyIcon,
  AutoAwesome as AutoIcon
} from '@mui/icons-material';
import { 
  PageContainer, 
  PageHeader, 
  TableHeader,
  BaseTable
} from '../../components/baseTemplate/components';
import { 
  useTableHeader,
  useTable
} from '../../components/baseTemplate/hooks';
import usePageData from '../../hooks/usePageData';
import SimpleRichTextEditor from '../../components/common/SimpleRichTextEditor';
import bankService from '../../services/bankService';
import agentLevelAccountService from '../../services/agentLevelAccountService';
import apiService from '../../services/api';

// 은행 목록
const BANK_LIST = [
  '국민은행', 'KB국민은행', '신한은행', '우리은행', 'SC제일은행',
  '하나은행', 'KEB하나은행', '농협은행', 'NH농협은행', '기업은행',
  'IBK기업은행', '외환은행', '씨티은행', '대구은행', '부산은행',
  '광주은행', '제주은행', '전북은행', '경남은행', '새마을금고',
  '신협', '우체국', '수협은행', '산업은행', 'KDB산업은행',
  '케이뱅크', '카카오뱅크', '토스뱅크'
];

/**
 * 계좌/은행 설정 페이지
 */
const BankSettingsPage = () => {
  // agent_levels 데이터 직접 로드
  const [agentLevels, setAgentLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadAgentLevels = async () => {
      try {
        const response = await apiService.get('/agent-levels');
        const levels = response.data.data || response.data;
        // 시스템마스터(999) 제외하고 level 순으로 정렬
        const filteredLevels = levels
          .filter(level => level.id !== 999)
          .sort((a, b) => a.level - b.level);
        setAgentLevels(filteredLevels);
      } catch (error) {
        console.error('에이전트 레벨 로드 실패:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAgentLevels();
  }, []);
  
  // 계좌 데이터 생성
  const accountData = useMemo(() => {
    return agentLevels.map((level, index) => ({
      id: `account_${level.id}`,
      type: `level_${level.level}`,
      levelType: level.name,
      backgroundColor: level.background_color,
      borderColor: level.border_color,
      bank: '',
      accountNumber: '',
      accountHolder: '',
      autoReply: `<p>${level.name} 계좌입니다.</p>`,
      active: true,
      no: index + 1,
      agentLevelId: level.id,
      levelNumber: level.level
    }));
  }, [agentLevels]);
  
  
  // 현재 탭
  const [currentTab, setCurrentTab] = useState(0);

  // 은행 설정 데이터
  const [bankSettings, setBankSettings] = useState([]);

  // 추가/수정 폼 상태
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  
  // 새 은행 추가 폼 상태
  const [newBank, setNewBank] = useState({
    bankName: '',
    maintenanceTime: '00:00~00:30',
    useName: ''
  });

  // 자동답변 편집 다이얼로그
  const [autoReplyDialog, setAutoReplyDialog] = useState({
    open: false,
    type: null,
    content: ''
  });

  // 일괄 적용 상태
  const [bulkApply, setBulkApply] = useState({
    open: false,
    content: ''
  });

  // 삭제 확인 다이얼로그
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });



  // 데이터가 없을 때 기본값 설정
  const safeAccountData = accountData;

  // 테이블 헤더 훅 - 계좌설정
  const accountTableHeader = useTableHeader({
    initialTotalItems: safeAccountData.length,
    tableId: 'accountSettings',
    showSearch: true,
  });

  // 테이블 헤더 훅 - 은행설정
  const bankTableHeader = useTableHeader({
    initialTotalItems: bankSettings.length,
    tableId: 'bankSettings',
    showSearch: true,
  });

  // 계좌 설정 상태 관리 - DB에서 불러오기
  const [accountSettings, setAccountSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // 테이블 훅 - 계좌설정
  const accountTable = useTable({
    data: safeAccountData,
    initialSort: { key: null, direction: 'asc' },
  });

  // 테이블 훅 - 은행설정
  const bankTable = useTable({
    data: bankSettings,
    initialSort: { key: null, direction: 'asc' },
  });

  // 알림 표시
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // 은행 설정 데이터 로드
  useEffect(() => {
    const loadBankSettings = async () => {
      try {
        const accounts = await bankService.getBankAccounts();
        const bankData = accounts.map(account => ({
          id: account.id,
          bankName: account.bank_name,
          maintenanceTime: account.description?.includes('점검시간:') 
            ? account.description.replace('점검시간: ', '') 
            : '00:00~00:30',
          useName: account.bank_name.substring(0, 2),
          active: account.is_active === 1
        }));
        setBankSettings(bankData);
      } catch (error) {
        console.error('은행 설정 로드 실패:', error);
        // 에러 발생 시 localStorage에서 로드 (fallback)
        const saved = localStorage.getItem('bankSettings');
        if (saved) {
          setBankSettings(JSON.parse(saved));
        }
      }
    };
    loadBankSettings();
  }, []);

  // bankSettings가 변경될 때마다 localStorage에 저장 (백업용)
  useEffect(() => {
    if (bankSettings.length > 0) {
      localStorage.setItem('bankSettings', JSON.stringify(bankSettings));
    }
  }, [bankSettings]);

  // DB에서 계좌 설정 로드
  useEffect(() => {
    const loadAccountSettings = async () => {
      if (isLoading || agentLevels.length === 0) return;
      
      try {
        console.log('🔍 계좌 설정 로드 시작');
        console.log('🔍 accountData:', accountData);
        const accounts = await agentLevelAccountService.getAllAccounts();
        console.log('🔍 받은 계좌 데이터:', accounts);
        const settings = {};
        
        accounts.forEach(account => {
          if (account.agent_level_id) {
            // agent_level_id로 매칭되는 accountData 찾기
            const matchingData = accountData.find(data => 
              data.agentLevelId === account.agent_level_id
            );
            
            if (matchingData) {
              settings[matchingData.id] = {
                bank: account.bank_name || '',
                accountNumber: account.account_number || '',
                accountHolder: account.account_holder || '',
                autoReply: account.auto_reply || '',
                active: account.is_active === 1
              };
            }
          }
        });
        
        setAccountSettings(settings);
      } catch (error) {
        console.error('계좌 설정 로드 실패:', error);
        // 에러 시 localStorage에서 로드 (fallback)
        const saved = localStorage.getItem('accountSettings');
        if (saved) {
          setAccountSettings(JSON.parse(saved));
        }
      }
    };
    
    loadAccountSettings();
  }, [isLoading, agentLevels, accountData]);

  // 계좌 정보 업데이트
  const handleAccountUpdate = useCallback((id, field, value) => {
    setAccountSettings(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value
        }
      };
      return updated;
    });
  }, []);

  // 계좌 복사
  const handleCopyAccount = useCallback((account) => {
    const settings = accountSettings[account.id] || {};
    const bank = settings.bank || account.bank || '';
    const accountNumber = settings.accountNumber || account.accountNumber || '';
    const accountHolder = settings.accountHolder || account.accountHolder || '';
    
    const text = `${bank} ${accountNumber} ${accountHolder}`.trim();
    if (!text) {
      showNotification('복사할 계좌정보가 없습니다.', 'warning');
      return;
    }
    
    navigator.clipboard.writeText(text);
    showNotification('계좌정보가 클립보드에 복사되었습니다.');
  }, [accountSettings]);

  // 계좌 정보를 포함한 자동답변 생성
  const generateAutoReplyWithAccount = useCallback((account, settings, customContent = null) => {
    console.log('🔧 generateAutoReplyWithAccount 호출:', { account, settings, customContent });
    
    const bank = settings?.bank || '';
    const accountNumber = settings?.accountNumber || '';
    const accountHolder = settings?.accountHolder || '';
    
    console.log('🔧 계좌 정보:', { bank, accountNumber, accountHolder });
    
    let baseContent = customContent || settings?.autoReply || `<p>${account?.levelType} 계좌입니다.</p>`;
    
    // 계좌 정보가 하나라도 있으면 업데이트
    if (bank || accountNumber || accountHolder) {
      // 계좌 정보의 내용만 업데이트 (스타일은 유지)
      
      // 은행 정보 업데이트
      if (bank) {
        // 기존 은행 정보가 있으면 내용만 변경
        if (baseContent.match(/<([^>]+)>([^<]*은행[\s]*:[^<]*)<\/\1>/i)) {
          baseContent = baseContent.replace(/(<([^>]+)>)([^<]*은행[\s]*:)([^<]*)(<\/\2>)/gi, `$1$3 ${bank}$5`);
        } else {
          // 없으면 추가
          baseContent += `<p>은행: ${bank}</p>`;
        }
      }
      
      // 계좌번호 정보 업데이트
      if (accountNumber) {
        // 기존 계좌번호 정보가 있으면 내용만 변경
        if (baseContent.match(/<([^>]+)>([^<]*계좌번호[\s]*:[^<]*)<\/\1>/i)) {
          baseContent = baseContent.replace(/(<([^>]+)>)([^<]*계좌번호[\s]*:)([^<]*)(<\/\2>)/gi, `$1$3 ${accountNumber}$5`);
        } else {
          // 없으면 추가
          baseContent += `<p>계좌번호: ${accountNumber}</p>`;
        }
      }
      
      // 예금주 정보 업데이트
      if (accountHolder) {
        // 기존 예금주 정보가 있으면 내용만 변경
        if (baseContent.match(/<([^>]+)>([^<]*예금주[\s]*:[^<]*)<\/\1>/i)) {
          baseContent = baseContent.replace(/(<([^>]+)>)([^<]*예금주[\s]*:)([^<]*)(<\/\2>)/gi, `$1$3 ${accountHolder}$5`);
        } else {
          // 없으면 추가
          baseContent += `<p>예금주: ${accountHolder}</p>`;
        }
      }
      
      // 계좌 정보 제목이 없으면 추가
      if (!baseContent.match(/계좌[\s]*정보/i)) {
        // 계좌 정보 추가 위치 찾기 (첫 번째 계좌 관련 정보 앞)
        const accountInfoMatch = baseContent.match(/<([^>]+)>([^<]*(은행|계좌번호|예금주)[\s]*:[^<]*)<\/\1>/i);
        if (accountInfoMatch) {
          const index = baseContent.indexOf(accountInfoMatch[0]);
          baseContent = baseContent.slice(0, index) + '<p><strong>계좌 정보</strong></p>' + baseContent.slice(index);
        }
      }
    }
    
    console.log('🔧 최종 자동답변:', baseContent);
    return baseContent;
  }, []);

  // 자동답변 편집 열기
  const handleOpenAutoReply = useCallback((type) => {
    const account = accountData.find(a => a.type === type);
    const settings = accountSettings[account?.id] || {};
    
    // 계좌 정보를 포함한 자동답변 생성
    const autoReplyContent = generateAutoReplyWithAccount(account, settings);
    
    setAutoReplyDialog({
      open: true,
      type: type,
      content: autoReplyContent
    });
  }, [accountData, accountSettings, generateAutoReplyWithAccount]);

  // 자동답변 저장
  const handleSaveAutoReply = useCallback(async () => {
    try {
      const account = accountData.find(a => a.type === autoReplyDialog.type);
      if (!account) return;
      
      const settings = accountSettings[account.id] || {};
      
      // 계좌 정보를 포함한 자동답변 생성
      const finalAutoReply = generateAutoReplyWithAccount(account, settings, autoReplyDialog.content);
      
      await agentLevelAccountService.saveAccount({
        agent_level_id: account.agentLevelId,
        bank_name: settings.bank || '',
        account_number: settings.accountNumber || '',
        account_holder: settings.accountHolder || '',
        auto_reply: finalAutoReply,
        is_active: settings.active !== false ? 1 : 0
      });
      
      // 로컬 상태 업데이트
      setAccountSettings(prev => ({
        ...prev,
        [account.id]: {
          ...prev[account.id],
          autoReply: finalAutoReply
        }
      }));
      
      setAutoReplyDialog({ open: false, type: null, content: '' });
      showNotification('자동답변이 저장되었습니다.');
    } catch (error) {
      console.error('자동답변 저장 실패:', error);
      showNotification('자동답변 저장에 실패했습니다.', 'error');
    }
  }, [autoReplyDialog, accountData, accountSettings, generateAutoReplyWithAccount]);

  // 일괄 적용 열기
  const handleOpenBulkApply = useCallback(() => {
    setBulkApply({ open: true, content: '' });
  }, []);

  // 일괄 적용 저장
  const handleSaveBulkApply = useCallback(async () => {
    try {
      // 각 계좌별로 계좌 정보를 포함한 자동답변 생성
      const bulkAccounts = [];
      
      accountData.forEach(account => {
        const settings = accountSettings[account.id] || {};
        const autoReplyWithAccount = generateAutoReplyWithAccount(account, settings, bulkApply.content);
        
        bulkAccounts.push({
          agent_level_id: account.agentLevelId,
          bank_name: settings.bank || '',
          account_number: settings.accountNumber || '',
          account_holder: settings.accountHolder || '',
          auto_reply: autoReplyWithAccount,
          is_active: settings.active !== false ? 1 : 0
        });
      });
      
      // 일괄 저장
      await agentLevelAccountService.bulkSaveAccounts(bulkAccounts);
      
      // 로컬 상태 업데이트
      setAccountSettings(prev => {
        const updated = { ...prev };
        accountData.forEach(account => {
          const settings = prev[account.id] || {};
          const autoReplyWithAccount = generateAutoReplyWithAccount(account, settings, bulkApply.content);
          
          updated[account.id] = {
            ...settings,
            autoReply: autoReplyWithAccount
          };
        });
        return updated;
      });
      
      setBulkApply({ open: false, content: '' });
      showNotification('모든 유형에 자동답변이 적용되었습니다.');
    } catch (error) {
      console.error('일괄 적용 실패:', error);
      showNotification('일괄 적용에 실패했습니다.', 'error');
    }
  }, [bulkApply.content, accountData, accountSettings, generateAutoReplyWithAccount]);

  // 은행 추가
  const handleAddBank = useCallback(async () => {
    if (!newBank.bankName.trim()) {
      showNotification('은행명을 입력해주세요.', 'error');
      return;
    }

    try {
      // API로 은행 추가
      await bankService.addBankAccount({
        bank_name: newBank.bankName,
        account_number: '미지정',
        account_holder: '미지정',
        description: `점검시간: ${newBank.maintenanceTime}`
      });

      // localStorage 업데이트 (임시)
      const newId = Math.max(...bankSettings.map(b => b.id), 0) + 1;
      setBankSettings(prev => [...prev, {
        id: newId,
        ...newBank,
        active: true
      }]);

      setNewBank({ bankName: '', maintenanceTime: '00:00~00:30', useName: '' });
      setIsAdding(false);
      showNotification('은행이 추가되었습니다.');
    } catch (error) {
      console.error('은행 추가 실패:', error);
      showNotification('은행 추가에 실패했습니다.', 'error');
    }
  }, [bankSettings, newBank]);

  // 은행 수정 시작
  const handleEditStart = useCallback((bank) => {
    setEditingId(bank.id);
    setEditingData({ ...bank });
  }, []);

  // 은행 수정 저장
  const handleEditSave = useCallback(() => {
    setBankSettings(prev => prev.map(bank =>
      bank.id === editingId ? editingData : bank
    ));
    setEditingId(null);
    setEditingData(null);
    showNotification('은행정보가 수정되었습니다.');
  }, [editingId, editingData]);

  // 은행 수정 취소
  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingData(null);
  }, []);

  // 삭제
  const handleDelete = useCallback((item, type) => {
    setDeleteDialog({ open: true, item, type });
  }, []);

  // 삭제 확인
  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.type === 'bank' && deleteDialog.item) {
      setBankSettings(prev => prev.filter(b => b.id !== deleteDialog.item.id));
      showNotification('은행이 삭제되었습니다.');
    }
    setDeleteDialog({ open: false, item: null, type: null });
  }, [deleteDialog]);

  // 활성/비활성 토글
  const handleToggleActive = useCallback((item, type) => {
    if (type === 'bank') {
      setBankSettings(prev => prev.map(bank =>
        bank.id === item.id ? { ...bank, active: !bank.active } : bank
      ));
    } else if (type === 'account') {
      // 계좌 상태 토글
      const currentActive = accountSettings[item.id]?.active ?? item.active ?? true;
      handleAccountUpdate(item.id, 'active', !currentActive);
    }
    const wasActive = type === 'account' ? (accountSettings[item.id]?.active ?? item.active ?? true) : item.active;
    showNotification(`${type === 'bank' ? '은행' : '계좌'}이 ${wasActive ? '비활성화' : '활성화'}되었습니다.`);
  }, [accountSettings, handleAccountUpdate]);

  // 새로고침
  const handleRefresh = useCallback(() => {
    showNotification('데이터를 새로고침했습니다.');
  }, []);

  // 계좌설정 테이블 컬럼
  const accountColumns = useMemo(() => [
    {
      id: 'no',
      label: 'No.',
      width: 70,
      align: 'center',
      type: 'number'
    },
    {
      id: 'levelType',
      label: '유형',
      width: 150,
      align: 'center',
      type: 'custom',
      customRenderer: 'levelTypeChip'
    },
    {
      id: 'bank',
      label: '은행',
      width: 150,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        const currentValue = accountSettings[row.id]?.bank || row.bank || '';
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={currentValue}
              onChange={(e) => handleAccountUpdate(row.id, 'bank', e.target.value)}
              displayEmpty
              sx={{ 
                fontSize: '14px',
                '& .MuiSelect-select': {
                  padding: '4px 8px',
                }
              }}
            >
              <MenuItem value="">
                <em>선택하세요</em>
              </MenuItem>
              {BANK_LIST.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }
    },
    {
      id: 'accountNumber',
      label: '계좌번호',
      width: 200,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        const currentValue = accountSettings[row.id]?.accountNumber || row.accountNumber || '';
        return (
          <TextField
            value={currentValue}
            onChange={(e) => handleAccountUpdate(row.id, 'accountNumber', e.target.value)}
            size="small"
            fullWidth
            placeholder="계좌번호 입력"
            sx={{
              '& .MuiInputBase-input': {
                padding: '4px 8px',
                fontSize: '14px',
                textAlign: 'center'
              }
            }}
          />
        );
      }
    },
    {
      id: 'accountHolder',
      label: '예금주',
      width: 150,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        const currentValue = accountSettings[row.id]?.accountHolder || row.accountHolder || '';
        return (
          <TextField
            value={currentValue}
            onChange={(e) => handleAccountUpdate(row.id, 'accountHolder', e.target.value)}
            size="small"
            fullWidth
            placeholder="예금주 입력"
            sx={{
              '& .MuiInputBase-input': {
                padding: '4px 8px',
                fontSize: '14px',
                textAlign: 'center'
              }
            }}
          />
        );
      }
    },
    {
      id: 'copyButton',
      label: '복사',
      width: 80,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        return (
          <IconButton 
            size="small" 
            onClick={() => handleCopyAccount(row)}
            title="계좌정보 복사"
            disabled={!accountSettings[row.id] || (!accountSettings[row.id]?.bank && !accountSettings[row.id]?.accountNumber && !accountSettings[row.id]?.accountHolder)}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        );
      }
    },
    {
      id: 'autoReply',
      label: '자동답변',
      width: 150,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row) return null;
        return (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpenAutoReply(row.type)}
          >
            편집
          </Button>
        );
      }
    },
    {
      id: 'active',
      label: '상태',
      width: 100,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        const currentActive = accountSettings[row.id]?.active ?? row.active ?? true;
        return (
          <Switch
            checked={currentActive}
            onChange={() => handleToggleActive(row, 'account')}
            size="small"
            color="primary"
          />
        );
      }
    }
  ], [accountSettings, handleCopyAccount, handleOpenAutoReply, handleToggleActive, handleAccountUpdate]);

  // 은행설정 테이블 컬럼
  const bankColumns = [
    {
      id: 'no',
      label: 'No.',
      width: 70,
      align: 'center',
      type: 'number'
    },
    {
      id: 'bankName',
      label: '은행명',
      width: 200,
      align: 'left',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        if (editingId === row.id) {
          return (
            <TextField
              value={editingData.bankName}
              onChange={(e) => setEditingData({ ...editingData, bankName: e.target.value })}
              size="small"
              fullWidth
            />
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BankIcon fontSize="small" color="action" />
            <Typography variant="body2">{row.bankName}</Typography>
          </Box>
        );
      }
    },
    {
      id: 'maintenanceTime',
      label: '점검시간',
      width: 200,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        if (editingId === row.id) {
          return (
            <TextField
              value={editingData.maintenanceTime}
              onChange={(e) => setEditingData({ ...editingData, maintenanceTime: e.target.value })}
              size="small"
              fullWidth
            />
          );
        }
        return row.maintenanceTime;
      }
    },
    {
      id: 'useName',
      label: '사용명',
      width: 150,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        if (editingId === row.id) {
          return (
            <TextField
              value={editingData.useName}
              onChange={(e) => setEditingData({ ...editingData, useName: e.target.value })}
              size="small"
              fullWidth
            />
          );
        }
        return row.useName;
      }
    },
    {
      id: 'active',
      label: '상태',
      width: 100,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        return (
        <Switch
          checked={row.active}
          onChange={() => handleToggleActive(row, 'bank')}
          size="small"
          color="primary"
        />
        );
      }
    },
    {
      id: 'actions',
      label: '액션',
      width: 150,
      align: 'center',
      type: 'custom',
      render: (row) => {
        if (!row || !row.id) return null;
        if (editingId === row.id) {
          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Chip
                label="저장"
                color="primary"
                size="small"
                onClick={handleEditSave}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="취소"
                color="default"
                size="small"
                onClick={handleEditCancel}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Chip
              label="수정"
              color="primary"
              size="small"
              variant="outlined"
              onClick={() => handleEditStart(row)}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="삭제"
              color="error"
              size="small"
              variant="outlined"
              onClick={() => handleDelete(row, 'bank')}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        );
      }
    }
  ];

  // 필터링된 계좌 데이터
  const filteredAccounts = useMemo(() => {
    if (!safeAccountData || safeAccountData.length === 0) {
      return [];
    }
    
    let result = [...safeAccountData];
    
    if (accountTableHeader.searchText) {
      const searchLower = accountTableHeader.searchText.toLowerCase();
      result = result.filter(account => {
        const typeLabel = account.levelType || account.type || '';
        const settings = accountSettings[account.id] || {};
        const bank = settings.bank || account.bank || '';
        const accountNumber = settings.accountNumber || account.accountNumber || '';
        const accountHolder = settings.accountHolder || account.accountHolder || '';
        
        return bank.toLowerCase().includes(searchLower) ||
          accountNumber.toLowerCase().includes(searchLower) ||
          accountHolder.toLowerCase().includes(searchLower) ||
          typeLabel.toLowerCase().includes(searchLower);
      });
    }
    
    return result;
  }, [safeAccountData, accountTableHeader.searchText, accountSettings]);

  // 필터링된 은행 데이터
  const filteredBanks = useMemo(() => {
    let result = [...bankSettings];
    
    if (bankTableHeader.searchText) {
      const searchLower = bankTableHeader.searchText.toLowerCase();
      result = result.filter(bank =>
        bank.bankName.toLowerCase().includes(searchLower) ||
        bank.useName.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [bankSettings, bankTableHeader.searchText]);

  // 표시 데이터 (번호 추가)
  const accountDisplayData = useMemo(() => {
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return [];
    }
    
    const displayData = filteredAccounts.map((account, index) => ({
      ...account,
      no: index + 1
    }));
    
    return displayData;
  }, [filteredAccounts]);

  const bankDisplayData = useMemo(() => {
    return filteredBanks.map((bank, index) => ({
      ...bank,
      no: index + 1
    }));
  }, [filteredBanks]);

  return (
    <PageContainer>
      <PageHeader
        title="계좌/은행 설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefresh}
        sx={{ mb: 2 }}
      />

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        {/* 탭 메뉴 */}
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="계좌설정" />
          <Tab label="은행설정" />
        </Tabs>

        {/* 계좌설정 탭 */}
        {currentTab === 0 && (
          <>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
            <TableHeader
              title="계좌 관리"
              totalItems={filteredAccounts.length}
              countLabel="총 ##count##개의 계좌"
              searchText={accountTableHeader.searchText}
              handleSearchChange={accountTableHeader.handleSearchChange}
              handleClearSearch={accountTableHeader.handleClearSearch}
              showSearch={true}
              searchPlaceholder="계좌정보 검색..."
              showIndentToggle={false}
              showPageNumberToggle={false}
              showColumnPinToggle={false}
              sx={{ mb: 3 }}
            />

            {/* 버튼 그룹 */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      const accounts = [];
                      
                      // accountData를 기반으로 계좌 정보 수집
                      accountData.forEach(data => {
                        const settings = accountSettings[data.id] || {};
                        
                        // 자동답변에 계좌 정보 포함
                        const autoReplyContent = settings.autoReply || data.autoReply || `<p>${data.levelType} 계좌입니다.</p>`;
                        const finalAutoReply = generateAutoReplyWithAccount(data, settings, autoReplyContent);
                        
                        accounts.push({
                          agent_level_id: data.agentLevelId,
                          bank_name: settings.bank || '',
                          account_number: settings.accountNumber || '',
                          account_holder: settings.accountHolder || '',
                          auto_reply: finalAutoReply,
                          is_active: settings.active !== false ? 1 : 0
                        });
                      });
                      
                      await agentLevelAccountService.bulkSaveAccounts(accounts);
                      showNotification('계좌 정보가 저장되었습니다.');
                    } catch (error) {
                      console.error('계좌 저장 실패:', error);
                      showNotification('계좌 저장에 실패했습니다.', 'error');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  color="primary"
                  disabled={isSaving}
                >
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (window.confirm('모든 계좌 정보를 초기화하시겠습니까?')) {
                      localStorage.removeItem('accountSettings');
                      setAccountSettings({});
                      showNotification('계좌 정보가 초기화되었습니다.');
                    }
                  }}
                  color="error"
                >
                  초기화
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<AutoIcon />}
                onClick={handleOpenBulkApply}
                color="secondary"
              >
                자동답변 일괄 적용
              </Button>
            </Box>

            {/* 계좌 테이블 */}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              {accountDisplayData && accountDisplayData.length > 0 ? (
                <BaseTable
                  columns={accountColumns}
                  data={accountDisplayData}
                  sortConfig={accountTable.sortConfig}
                  onSort={accountTable.handleSort}
                  page={0}
                  rowsPerPage={25}
                  totalCount={accountDisplayData.length}
                  sx={{
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }
                  }}
                />
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    데이터가 없습니다.
                  </Typography>
                </Box>
              )}
            </Box>
              </>
            )}
          </>
        )}

        {/* 은행설정 탭 */}
        {currentTab === 1 && (
          <>
            <TableHeader
              title="은행 관리"
              totalItems={filteredBanks.length}
              countLabel="총 ##count##개의 은행"
              searchText={bankTableHeader.searchText}
              handleSearchChange={bankTableHeader.handleSearchChange}
              handleClearSearch={bankTableHeader.handleClearSearch}
              showSearch={true}
              searchPlaceholder="은행 검색..."
              showIndentToggle={false}
              showPageNumberToggle={false}
              showColumnPinToggle={false}
              sx={{ mb: 3 }}
            />

            {/* 은행 추가 폼 */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}
            >
              {!isAdding ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAdding(true)}
                  sx={{ minWidth: 150 }}
                >
                  은행 추가
                </Button>
              ) : (
                <>
                  <TextField
                    size="small"
                    placeholder="은행명 입력"
                    label="은행명"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                    sx={{ minWidth: 150 }}
                  />
                  
                  <TextField
                    placeholder="00:00~00:30"
                    label="점검시간"
                    value={newBank.maintenanceTime}
                    onChange={(e) => setNewBank({ ...newBank, maintenanceTime: e.target.value })}
                    size="small"
                    sx={{ width: 200 }}
                  />
                  
                  <TextField
                    placeholder="사용명"
                    label="사용명"
                    value={newBank.useName}
                    onChange={(e) => setNewBank({ ...newBank, useName: e.target.value })}
                    size="small"
                    sx={{ width: 150 }}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleAddBank}
                  >
                    추가
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsAdding(false);
                      setNewBank({ bankName: '', maintenanceTime: '00:00~00:30', useName: '' });
                    }}
                  >
                    취소
                  </Button>
                </>
              )}
            </Box>

            {/* 은행 테이블 */}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <BaseTable
                columns={bankColumns}
                data={bankDisplayData}
                sortConfig={bankTable.sortConfig}
                onSort={bankTable.handleSort}
                sx={{
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }
                }}
              />
            </Box>
          </>
        )}
      </Paper>

      {/* 자동답변 편집 다이얼로그 */}
      <Dialog
        open={autoReplyDialog.open}
        onClose={() => setAutoReplyDialog({ open: false, type: null, content: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          자동답변 편집 - {safeAccountData.find(a => a.type === autoReplyDialog.type)?.levelType || autoReplyDialog.type}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <SimpleRichTextEditor
              value={autoReplyDialog.content}
              onChange={(content) => setAutoReplyDialog({ ...autoReplyDialog, content })}
              placeholder="자동답변 내용을 입력하세요..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoReplyDialog({ open: false, type: null, content: '' })}>
            취소
          </Button>
          <Button onClick={handleSaveAutoReply} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 일괄 적용 다이얼로그 */}
      <Dialog
        open={bulkApply.open}
        onClose={() => setBulkApply({ open: false, content: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>자동답변 일괄 적용</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            입력한 내용이 모든 유형의 자동답변에 적용됩니다.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <SimpleRichTextEditor
              value={bulkApply.content}
              onChange={(content) => setBulkApply({ ...bulkApply, content })}
              placeholder="일괄 적용할 자동답변 내용을 입력하세요..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkApply({ open: false, content: '' })}>
            취소
          </Button>
          <Button onClick={handleSaveBulkApply} variant="contained" color="secondary">
            일괄 적용
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, type: null })}
      >
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialog.type === 'bank' && deleteDialog.item && 
              `"${deleteDialog.item.bankName}"을(를) 삭제하시겠습니까?`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null, type: null })}>
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

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

export default BankSettingsPage;