import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import useDynamicTypes from '../../../hooks/useDynamicTypes';
import useCustomerService from '../../../hooks/useCustomerService';

/**
 * 문의보내기 컴포넌트
 * 관리자가 고객/에이전트에게 새로운 문의를 보낼 수 있는 페이지
 * 
 * 수신자 유형 구조:
 * 1. 전체 (고정)
 * 2. 에이전트 (고정)  
 * 3. 회원 (고정)
 * 4. [동적 단계들] - 단계설정에서 웹소켓으로 실시간 관리
 * 5. 라인 (고정)
 * 6. 선택 (고정)
 */
const SendMessage = () => {
  // 동적 타입 데이터 가져오기
  const { agentLevels, isLoading: isDynamicTypesLoading } = useDynamicTypes();
  
  // useCustomerService 훅 사용
  const { sendMessage } = useCustomerService();

  // 폼 상태
  const [formData, setFormData] = useState({
    recipientType: '',
    selectedSubType: '', // 라인 선택 시 세부 타입 (agent/member)
    recipients: [], // 개별 선택된 수신자들
    subject: '',
    content: '',
    sendImmediately: true
  });

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // 폼 유효성 검사
  const [errors, setErrors] = useState({});

  // 하드코딩된 계층 구조 데이터 (실제로는 API에서 가져와야 함)
  const lineHierarchy = useMemo(() => [
    {
      id: 'line001',
      name: 'line001',
      nickname: '라인1',
      type: 'agent',
      children: [
        { id: 'user001', name: 'user001', nickname: '회원1', type: 'member' },
        { id: 'user002', name: 'user002', nickname: '회원2', type: 'member' },
        { id: 'user003', name: 'user003', nickname: '회원3', type: 'member' }
      ]
    },
    {
      id: 'line002',
      name: 'line002',
      nickname: '라인2',
      type: 'agent',
      children: [
        { id: 'user004', name: 'user004', nickname: '회원4', type: 'member' },
        { id: 'user005', name: 'user005', nickname: '회원5', type: 'member' }
      ]
    },
    {
      id: 'line003',
      name: 'line003',
      nickname: '라인3',
      type: 'agent',
      children: [
        { id: 'user006', name: 'user006', nickname: '회원6', type: 'member' },
        { id: 'user007', name: 'user007', nickname: '회원7', type: 'member' },
        { id: 'user008', name: 'user008', nickname: '회원8', type: 'member' },
        { id: 'user009', name: 'user009', nickname: '회원9', type: 'member' }
      ]
    },
    { 
      id: 'member010', 
      name: 'member010', 
      nickname: '직속회원1', 
      type: 'member',
      children: []
    },
    { 
      id: 'member011', 
      name: 'member011', 
      nickname: '직속회원2', 
      type: 'member',
      children: []
    }
  ], []);

  // 샘플 수신자 목록 (실제로는 API에서 가져와야 함)
  const availableRecipients = useMemo(() => [
    { id: 'user001', name: 'user001', nickname: '회원1', type: 'member' },
    { id: 'user002', name: 'user002', nickname: '회원2', type: 'member' },
    { id: 'agent001', name: 'agent001', nickname: '에이전트1', type: 'agent' },
    { id: 'agent002', name: 'agent002', nickname: '에이전트2', type: 'agent' },
    { id: 'admin001', name: 'admin001', nickname: '관리자1', type: 'admin' }
  ], []);

  // 수신자 유형 옵션 - 동적으로 구성
  const recipientTypeOptions = useMemo(() => {
    const fixedOptions = [
      { value: 'all', label: '전체', color: 'primary' },
      { value: 'agent', label: '에이전트', color: 'secondary' },
      { value: 'member', label: '회원', color: 'success' }
    ];

    // 단계설정에서 가져온 동적 단계들을 변환
    const dynamicOptions = agentLevels.map((level, index) => ({
      value: `level_${level.id || index}`, // 고유한 값 보장
      label: level.levelType,
      color: 'info'
    }));

    const endOptions = [
      { value: 'line', label: '라인', color: 'warning' },
      { value: 'custom', label: '선택', color: 'error' }
    ];

    return [...fixedOptions, ...dynamicOptions, ...endOptions];
  }, [agentLevels]);

  // 수신자 유형에 따른 예상 수신자 수 계산
  const getRecipientCount = useCallback((type) => {
    switch (type) {
      case 'all':
        return 1000; // 전체 수신자 수 (실제로는 API에서 가져와야 함)
      case 'agent':
        return 50; // 에이전트 수 (실제로는 API에서 가져와야 함)
      case 'member':
        return 800; // 회원 수 (실제로는 API에서 가져와야 함)
      case 'line':
        // 라인 선택 시 선택된 라인의 수신자 수
        return formData.recipients.length;
      case 'custom':
        // 개별 선택된 수신자 수
        return formData.recipients.length;
      default:
        // 동적 단계들의 경우 실제 단계 데이터에서 수 계산
        const levelId = type.startsWith('level_') ? type.substring(6) : null;
        const level = agentLevels.find(level => 
          level.id == levelId || `level_${level.id}` === type
        );
        if (level) {
          // 실제로는 해당 단계에 속한 사용자 수를 API에서 가져와야 함
          return 10; // 임시값
        }
        return 0;
    }
  }, [formData.recipients.length, agentLevels]);

  // 폼 데이터 변경 핸들러
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 수신자 유형 변경 시 관련 필드들 초기화
    if (field === 'recipientType') {
      setFormData(prev => ({
        ...prev,
        recipientType: value,
        selectedSubType: '',
        recipients: []
      }));
    }
  }, []);

  // 폼 초기화
  const handleClearForm = useCallback(() => {
    setFormData({
      recipientType: '',
      selectedSubType: '',
      recipients: [],
      subject: '',
      content: '',
      sendImmediately: true
    });
    setSearchText('');
    setErrors({});
    setApiError(null);
    setSuccessMessage('');
  }, []);

  // 미리보기 토글
  const handleTogglePreview = useCallback(() => {
    setPreviewOpen(prev => !prev);
  }, []);

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.recipientType) {
      newErrors.recipientType = '수신자 유형을 선택해주세요.';
    }

    if (formData.recipientType === 'custom' && formData.recipients.length === 0) {
      newErrors.recipients = '수신자를 선택해주세요.';
    }

    if (formData.recipientType === 'line') {
      if (!formData.selectedSubType) {
        newErrors.selectedSubType = '세부 유형을 선택해주세요.';
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '제목을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 메시지 전송 처리
  const handleSendMessage = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // 실제 수신자 목록 구성
      let recipientIds = [];
      
      switch (formData.recipientType) {
        case 'all':
          recipientIds = ['all']; // 전체 발송
          break;
        case 'agent':
          recipientIds = ['all_agents']; // 모든 에이전트
          break;
        case 'member':
          recipientIds = ['all_members']; // 모든 회원
          break;
        case 'line':
          // 라인 선택 시 계층 구조에서 ID만 추출
          recipientIds = formData.recipients.map(r => r.id);
          break;
        case 'custom':
          // 개별 선택 시 ID만 추출
          recipientIds = formData.recipients.map(r => r.id);
          break;
        default:
          // 동적 단계
          recipientIds = [formData.recipientType];
          break;
      }

      // API 요청 데이터 구성
      const requestData = {
        recipientType: formData.recipientType,
        recipientIds: recipientIds,
        title: formData.subject,
        content: formData.content
      };

      // useCustomerService 훅의 sendMessage 함수 호출
      const result = await sendMessage(requestData);
      
      if (result.success) {
        setSuccessMessage('메시지가 성공적으로 전송되었습니다.');
        setApiError(null);
        handleClearForm();
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setApiError(result.error || '메시지 전송에 실패했습니다.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setApiError(error.response?.data?.error || '메시지 전송에 실패했습니다.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, handleClearForm, sendMessage]);

  if (isDynamicTypesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>단계 설정 정보를 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        문의보내기
      </Typography>

      {/* 성공 메시지 */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* 에러 메시지 */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 좌측: 폼 영역 */}
        <Grid item xs={12} md={previewOpen ? 6 : 12}>
          <Card elevation={1}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* 수신자 유형 선택 */}
                <FormControl fullWidth>
                  <InputLabel>수신자 유형</InputLabel>
                  <Select
                    value={formData.recipientType}
                    label="수신자 유형"
                    onChange={(e) => handleFormChange('recipientType', e.target.value)}
                    error={!!errors.recipientType}
                  >
                    {recipientTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={option.label}
                            size="small"
                            color={option.color}
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            (약 {getRecipientCount(option.value)}명)
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.recipientType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.recipientType}
                    </Typography>
                  )}
                </FormControl>

                {/* 선택 수신자 (custom일 때만 표시) */}
                {formData.recipientType === 'custom' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                      수신자 선택
                    </Typography>
                    
                    {/* 수신자 검색 및 추가 */}
                    <Box sx={{ mb: 2 }}>
                      <Autocomplete
                        options={availableRecipients}
                        getOptionLabel={(option) => `${option.name} (${option.nickname})`}
                        value={null}
                        inputValue={searchText}
                        onInputChange={(event, newInputValue) => {
                          setSearchText(newInputValue);
                        }}
                        onChange={(event, newValue) => {
                          if (newValue && !formData.recipients.some(r => r.id === newValue.id)) {
                            setFormData(prev => ({
                              ...prev,
                              recipients: [...prev.recipients, newValue]
                            }));
                            setSearchText('');
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="수신자 검색 및 추가"
                            placeholder="아이디 또는 닉네임으로 검색..."
                            size="small"
                            error={!!errors.recipients}
                            helperText={errors.recipients}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.nickname} • {option.type}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        noOptionsText="검색 결과가 없습니다"
                      />
                    </Box>

                    {/* 선택된 수신자 목록 */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          선택된 수신자 ({formData.recipients.length}명)
                        </Typography>
                        {formData.recipients.length > 0 && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setFormData(prev => ({ ...prev, recipients: [] }))}
                            startIcon={<DeleteIcon />}
                          >
                            전체 삭제
                          </Button>
                        )}
                      </Box>
                      
                      <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {formData.recipients.length === 0 ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              선택된 수신자가 없습니다
                            </Typography>
                          </Box>
                        ) : (
                          <List dense>
                            {formData.recipients.map((recipient) => (
                              <ListItem key={recipient.id}>
                                <ListItemText
                                  primary={recipient.name}
                                  secondary={`${recipient.nickname} • ${recipient.type}`}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        recipients: prev.recipients.filter(r => r.id !== recipient.id)
                                      }));
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                )}

                {/* 라인 수신자 선택 */}
                {formData.recipientType === 'line' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                      라인 수신자 선택
                    </Typography>
                    
                    {/* 세부 유형 선택 */}
                    <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                      <InputLabel>세부 유형 선택</InputLabel>
                      <Select
                        value={formData.selectedSubType}
                        onChange={(e) => handleFormChange('selectedSubType', e.target.value)}
                        error={!!errors.selectedSubType}
                      >
                        <MenuItem key="agent" value="agent">에이전트 선택</MenuItem>
                        <MenuItem key="member" value="member">회원 선택</MenuItem>
                      </Select>
                      {errors.selectedSubType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {errors.selectedSubType}
                        </Typography>
                      )}
                    </FormControl>

                    {formData.selectedSubType && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {formData.selectedSubType === 'agent' ? '에이전트' : '회원'} 선택
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (선택 시 본인 + 하부 조직 포함)
                          </Typography>
                        </Typography>

                        <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                          {lineHierarchy
                            .filter(item => item.type === formData.selectedSubType)
                            .map((item) => (
                              <Box key={item.id} sx={{ mb: 1 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formData.recipients.some(r => r.id === item.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          // 계층 구조 포함하여 추가
                                          const newRecipients = [item];
                                          if (item.children && item.children.length > 0) {
                                            newRecipients.push(...item.children);
                                          }
                                          setFormData(prev => ({
                                            ...prev,
                                            recipients: [...prev.recipients, ...newRecipients]
                                          }));
                                        } else {
                                          // 계층 구조 포함하여 제거
                                          const idsToRemove = [item.id];
                                          if (item.children && item.children.length > 0) {
                                            idsToRemove.push(...item.children.map(child => child.id));
                                          }
                                          setFormData(prev => ({
                                            ...prev,
                                            recipients: prev.recipients.filter(r => !idsToRemove.includes(r.id))
                                          }));
                                        }
                                      }}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2">
                                        {item.nickname} ({item.name})
                                      </Typography>
                                      {item.children && item.children.length > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                          하부 조직 {item.children.length}명 포함
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              </Box>
                            ))}
                        </Paper>

                        {/* 선택된 수신자 수 표시 */}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          선택된 수신자: {formData.recipients.length}명
                        </Typography>
                      </>
                    )}
                  </Box>
                )}

                {/* 제목 */}
                <TextField
                  fullWidth
                  label="제목"
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="문의 제목을 입력하세요"
                  error={!!errors.subject}
                  helperText={errors.subject}
                />

                {/* 내용 */}
                <TextField
                  fullWidth
                  label="내용"
                  value={formData.content}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  placeholder="문의 내용을 입력하세요"
                  multiline
                  rows={8}
                  error={!!errors.content}
                  helperText={errors.content}
                />

                {/* 버튼 그룹 */}
                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
                    sx={{ flex: 1 }}
                  >
                    {isLoading ? '전송 중...' : '메시지 전송'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleTogglePreview}
                    startIcon={<VisibilityIcon />}
                    disabled={!formData.subject || !formData.content}
                  >
                    미리보기
                  </Button>
                  
                  <Button
                    variant="text"
                    onClick={handleClearForm}
                    startIcon={<ClearIcon />}
                  >
                    초기화
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 우측: 미리보기 영역 */}
        {previewOpen && (
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  발송 미리보기
                </Typography>
                
                <Stack spacing={2}>
                  {/* 발송 정보 */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      발송 정보
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            수신자 유형:
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Chip
                            label={recipientTypeOptions.find(opt => opt.value === formData.recipientType)?.label}
                            size="small"
                            color={recipientTypeOptions.find(opt => opt.value === formData.recipientType)?.color}
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            예상 수신자:
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body2">
                            약 {getRecipientCount(formData.recipientType)}명
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>

                  <Divider />

                  {/* 문의 내용 미리보기 */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      문의 내용
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {formData.subject || '(제목 없음)'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          minHeight: 100
                        }}
                      >
                        {formData.content || '(내용 없음)'}
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 안내 메시지 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>안내:</strong> 발송된 문의는 '보낸문의' 탭에서 확인하실 수 있습니다. 
          수신자들의 읽음 여부와 답변 현황을 실시간으로 모니터링할 수 있습니다.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          🔧 <strong>수신자 유형:</strong> {agentLevels.map(level => level.levelType).join(', ')} 등의 단계는 '단계설정' 페이지에서 
          실시간으로 관리되며 웹소켓을 통해 자동으로 업데이트됩니다.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SendMessage; 