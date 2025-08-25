import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  TextField,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Save as SaveIcon,
  Edit as EditIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

/**
 * 템플릿 상세 정보 다이얼로그
 * 템플릿 내용을 조회하고 편집할 수 있는 다이얼로그입니다.
 */
const TemplateDetailDialog = ({ 
  open, 
  onClose, 
  template, 
  onSave,
  mode = 'view' // 'view', 'edit', 'create'
}) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    status: '활성',
    description: '',
    tags: []
  });
  const [errors, setErrors] = useState({});

  // 템플릿 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title || '',
        category: template.category || '',
        content: template.content || '',
        status: template.status || '활성',
        description: template.description || '',
        tags: template.tags || []
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        category: '일반문의',
        content: '',
        status: '활성',
        description: '',
        tags: []
      });
    }
    setErrors({});
  }, [template, mode]);

  // 편집 모드 상태를 mode 변경에 따라 업데이트
  useEffect(() => {
    setIsEditing(mode === 'edit' || mode === 'create');
  }, [mode]);

  // 편집 모드 토글
  const handleToggleEdit = useCallback(() => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // 편집 취소 시 원래 데이터로 복원
      if (template) {
        setFormData({
          title: template.title || '',
          category: template.category || '',
          content: template.content || '',
          status: template.status || '활성',
          description: template.description || '',
          tags: template.tags || []
        });
      }
      setErrors({});
    }
  }, [isEditing, template]);

  // 폼 데이터 변경 핸들러
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // 유효성 검사
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '템플릿명을 입력해주세요.';
    }
    
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '템플릿 내용을 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const saveData = {
      ...formData,
      id: template?.id || Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
      createdAt: template?.createdAt || new Date().toISOString().split('T')[0],
      usageCount: template?.usageCount || 0
    };

    onSave?.(saveData);
    setIsEditing(false);
  }, [formData, template, onSave, validateForm]);

  // 다이얼로그 닫기
  const handleClose = useCallback(() => {
    setIsEditing(mode === 'edit' || mode === 'create');
    setErrors({});
    onClose();
  }, [onClose, mode]);

  // 상태별 색상 매핑
  const getStatusColor = (status) => {
    switch (status) {
      case '활성': return 'success';
      case '비활성': return 'error';
      case '임시저장': return 'warning';
      default: return 'default';
    }
  };

  // 카테고리 옵션
  const categoryOptions = [
    '일반문의',
    '계정문의',
    '결제문의',
    '기술지원',
    '신고접수',
    '기타'
  ];

  const isCreateMode = mode === 'create';
  const dialogTitle = isCreateMode ? '새 템플릿 생성' : 
                     isEditing ? '템플릿 편집' : '템플릿 상세 정보';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '700px' }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {dialogTitle}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isCreateMode && !isEditing && (
            <IconButton
              aria-label="edit"
              onClick={handleToggleEdit}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 기본 정보 */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                기본 정보
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="템플릿명"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    disabled={!isEditing}
                    error={!!errors.title}
                    helperText={errors.title}
                    variant={isEditing ? 'outlined' : 'standard'}
                    InputProps={{
                      readOnly: !isEditing
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!isEditing} error={!!errors.category}>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      label="카테고리"
                      variant={isEditing ? 'outlined' : 'standard'}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>상태</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      label="상태"
                      variant={isEditing ? 'outlined' : 'standard'}
                    >
                      <MenuItem value="활성">활성</MenuItem>
                      <MenuItem value="비활성">비활성</MenuItem>
                      <MenuItem value="임시저장">임시저장</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {!isCreateMode && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="사용 횟수"
                      value={template?.usageCount || 0}
                      disabled
                      variant="standard"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="설명"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    variant={isEditing ? 'outlined' : 'standard'}
                    InputProps={{
                      readOnly: !isEditing
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* 템플릿 내용 */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                템플릿 내용
              </Typography>
              
              <TextField
                fullWidth
                label="내용"
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                disabled={!isEditing}
                error={!!errors.content}
                helperText={errors.content || '고객에게 전송될 메시지 내용을 입력하세요.'}
                multiline
                rows={8}
                variant={isEditing ? 'outlined' : 'standard'}
                InputProps={{
                  readOnly: !isEditing
                }}
              />
            </Paper>
          </Grid>

          {/* 메타 정보 (편집 모드가 아닐 때만 표시) */}
          {!isCreateMode && !isEditing && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  메타 정보
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      생성일
                    </Typography>
                    <Typography variant="body1">
                      {template?.createdAt || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      수정일
                    </Typography>
                    <Typography variant="body1">
                      {template?.updatedAt || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      현재 상태
                    </Typography>
                    <Chip
                      label={template?.status || '활성'}
                      color={getStatusColor(template?.status)}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      사용 횟수
                    </Typography>
                    <Typography variant="body1">
                      {template?.usageCount || 0}회
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* 에러 메시지 */}
          {Object.keys(errors).length > 0 && (
            <Grid item xs={12}>
              <Alert severity="error">
                입력 정보를 확인해주세요.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {isEditing ? (
          <>
            <Button onClick={handleToggleEdit} color="inherit">
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              startIcon={<SaveIcon />}
            >
              저장
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">
              닫기
            </Button>
            {!isCreateMode && (
              <Button 
                onClick={handleToggleEdit} 
                variant="contained" 
                startIcon={<EditIcon />}
              >
                편집
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDetailDialog; 