import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  Slider,
  Alert,
  Snackbar,
  FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import PageContainer from '../../components/baseTemplate/components/layout/PageContainer';
import SimpleRichTextEditor from '../../components/common/SimpleRichTextEditor';
import { API_CONFIG } from '../../config/apiConfig';

const MaintenancePage = () => {
  // 점검 설정 상태
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    target: 'none', // none, all, admin, member
    backgroundColor: '#1a1a1a',
    mainText: '<h1>시스템 점검 중입니다</h1><p>보다 나은 서비스를 제공하기 위해 시스템 점검을 진행하고 있습니다.</p><p>빠른 시일 내에 서비스를 재개하도록 하겠습니다.</p>',
    mainLogo: '',
    mainLogoPosition: { x: 50, y: 20 },
    mainLogoSize: '200px',
    footerLogo: '',
    footerText: '© 2024 All rights reserved.',
    socialLinks: [
      { platform: 'telegram', url: '', icon: '' },
      { platform: 'kakao', url: '', icon: '' },
      { platform: 'facebook', url: '', icon: '' },
      { platform: 'instagram', url: '', icon: '' }
    ],
    backgroundImage: ''
  });

  // 필드 변경 핸들러
  const handleFieldChange = (field, value) => {
    setMaintenanceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 설정 로드
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/maintenance-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMaintenanceSettings(result.data);
        }
      } else {
        // API 실패시 localStorage에서 백업 로드
        const saved = localStorage.getItem('maintenanceSettings');
        if (saved) {
          setMaintenanceSettings(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error('점검 설정 로드 오류:', error);
      // API 실패시 localStorage에서 백업 로드
      const saved = localStorage.getItem('maintenanceSettings');
      if (saved) {
        setMaintenanceSettings(JSON.parse(saved));
      }
    }
  }, []);

  // 컴포넌트 마운트시 설정 로드
  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 미리보기 다이얼로그 상태
  const [previewOpen, setPreviewOpen] = useState(false);

  // 설정 저장
  const saveSettings = useCallback(async () => {
    try {
      // API로 저장
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/maintenance-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(maintenanceSettings)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // localStorage에도 백업으로 저장 (호환성)
      localStorage.setItem('maintenanceSettings', JSON.stringify(maintenanceSettings));
      
      // storage 이벤트 발생 (같은 탭에서는 storage 이벤트가 발생하지 않음)
      window.dispatchEvent(new CustomEvent('maintenanceSettingsChanged', {
        detail: maintenanceSettings
      }));
      
      setNotification({
        open: true,
        message: `점검 설정이 저장되었습니다. (대상: ${
          maintenanceSettings.target === 'none' ? '점검 안함' :
          maintenanceSettings.target === 'all' ? '전체' :
          maintenanceSettings.target === 'admin' ? '관리자 페이지만' :
          maintenanceSettings.target === 'member' ? '회원 페이지만' : maintenanceSettings.target
        })`,
        severity: 'success'
      });
    } catch (error) {
      console.error('점검 설정 저장 오류:', error);
      setNotification({
        open: true,
        message: '점검 설정 저장 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  }, [maintenanceSettings]);

  // 파일 업로드 핸들러
  const handleFileUpload = (field) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleFieldChange(field, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // SNS 링크 변경 핸들러
  const handleSocialLinkChange = (index, field, value) => {
    const newLinks = [...maintenanceSettings.socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleFieldChange('socialLinks', newLinks);
  };

  // 미리보기 다이얼로그 렌더링
  const renderPreviewDialog = () => (
    <Dialog 
      open={previewOpen} 
      onClose={() => setPreviewOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>점검 페이지 미리보기</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            width: '100%',
            height: '600px',
            backgroundColor: maintenanceSettings.backgroundColor,
            backgroundImage: maintenanceSettings.backgroundImage ? `url(${maintenanceSettings.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 메인 로고 */}
          {maintenanceSettings.mainLogo && (
            <Box
              sx={{
                position: 'absolute',
                left: `${maintenanceSettings.mainLogoPosition.x}%`,
                top: `${maintenanceSettings.mainLogoPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                width: maintenanceSettings.mainLogoSize,
                height: 'auto'
              }}
            >
              <img 
                src={maintenanceSettings.mainLogo} 
                alt="Logo" 
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>
          )}

          {/* 메인 텍스트 */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 4
            }}
          >
            <Box
              dangerouslySetInnerHTML={{ __html: maintenanceSettings.mainText }}
              sx={{
                maxWidth: '800px',
                '& h1': { mb: 2 },
                '& p': { mb: 1 }
              }}
            />
          </Box>

          {/* 푸터 */}
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
          >
            {maintenanceSettings.footerLogo && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={maintenanceSettings.footerLogo} 
                  alt="Footer Logo" 
                  style={{ height: '40px' }}
                />
              </Box>
            )}
            
            {/* SNS 아이콘 */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {maintenanceSettings.socialLinks.map((link, index) => (
                link.icon && link.url && (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={link.icon} 
                      alt={link.platform} 
                      style={{ width: '30px', height: '30px' }}
                    />
                  </a>
                )
              ))}
            </Box>

            <Typography variant="body2" sx={{ color: '#ccc' }}>
              {maintenanceSettings.footerText}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageContainer title="점검 설정">
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 점검 대상 설정 */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>점검 대상</InputLabel>
              <Select
                value={maintenanceSettings.target}
                onChange={(e) => handleFieldChange('target', e.target.value)}
                label="점검 대상"
              >
                <MenuItem value="none">점검 안함</MenuItem>
                <MenuItem value="all">전체 (관리자 + 회원)</MenuItem>
                <MenuItem value="admin">관리자 페이지만</MenuItem>
                <MenuItem value="member">회원 페이지만</MenuItem>
              </Select>
              <FormHelperText>
                점검 모드를 활성화할 대상을 선택하세요.
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* 배경 설정 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="배경색"
              type="color"
              value={maintenanceSettings.backgroundColor}
              onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                배경 이미지
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                배경 이미지 업로드
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload('backgroundImage')}
                />
              </Button>
              {maintenanceSettings.backgroundImage && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    이미지 업로드됨
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleFieldChange('backgroundImage', '')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>

          {/* 메인 로고 설정 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              메인 로고
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                로고 이미지 업로드
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload('mainLogo')}
                />
              </Button>
              {maintenanceSettings.mainLogo && (
                <Box sx={{ mt: 1 }}>
                  <img 
                    src={maintenanceSettings.mainLogo} 
                    alt="Main Logo Preview" 
                    style={{ maxWidth: '100%', maxHeight: '100px' }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="로고 크기"
              value={maintenanceSettings.mainLogoSize}
              onChange={(e) => handleFieldChange('mainLogoSize', e.target.value)}
              placeholder="예: 200px, 50%"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box>
              <Typography gutterBottom>
                로고 위치 (X: {maintenanceSettings.mainLogoPosition.x}%, Y: {maintenanceSettings.mainLogoPosition.y}%)
              </Typography>
              <Slider
                value={maintenanceSettings.mainLogoPosition.x}
                onChange={(e, value) => handleFieldChange('mainLogoPosition', { ...maintenanceSettings.mainLogoPosition, x: value })}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
              <Slider
                value={maintenanceSettings.mainLogoPosition.y}
                onChange={(e, value) => handleFieldChange('mainLogoPosition', { ...maintenanceSettings.mainLogoPosition, y: value })}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </Box>
          </Grid>

          {/* 메인 텍스트 */}
          <Grid item xs={12} sx={{ minHeight: '280px', overflow: 'visible' }}>
            <Box sx={{ width: '100%', minHeight: '280px', overflow: 'visible' }}>
              <SimpleRichTextEditor
                label="점검 안내 메시지"
                value={maintenanceSettings.mainText}
                onChange={(value) => handleFieldChange('mainText', value)}
                height={200}
              />
            </Box>
          </Grid>

          {/* 푸터 설정 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              푸터 설정
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                푸터 로고 업로드
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload('footerLogo')}
                />
              </Button>
              {maintenanceSettings.footerLogo && (
                <Box sx={{ mt: 1 }}>
                  <img 
                    src={maintenanceSettings.footerLogo} 
                    alt="Footer Logo Preview" 
                    style={{ maxHeight: '40px' }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="푸터 텍스트"
              value={maintenanceSettings.footerText}
              onChange={(e) => handleFieldChange('footerText', e.target.value)}
            />
          </Grid>

          {/* SNS 링크 설정 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              SNS 링크
            </Typography>
            <List>
              {maintenanceSettings.socialLinks.map((link, index) => (
                <ListItem key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle2">
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="URL"
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        size="small"
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        fullWidth
                      >
                        아이콘 업로드
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                handleSocialLinkChange(index, 'icon', event.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      {link.icon && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img 
                            src={link.icon} 
                            alt={`${link.platform} icon`} 
                            style={{ width: '30px', height: '30px' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleSocialLinkChange(index, 'icon', '')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* 액션 버튼 */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewOpen(true)}
              >
                미리보기
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveSettings}
              >
                저장
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 미리보기 다이얼로그 */}
      {renderPreviewDialog()}

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
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

export default MaintenancePage;