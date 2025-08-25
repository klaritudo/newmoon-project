import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  FormHelperText,
  Slider
} from '@mui/material';
import { 
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { usePopups } from '../../hooks/usePopups';
import { useAuth } from '../../hooks/useAuth';
import BannerMessage from '../../components/BannerMessage';
import PageHeader from '../../components/PageHeader';
import SearchableTable from '../../components/baseTemplate/components/table/SearchableTable';
import CKEditor from '../../components/CKEditor';
import { popupColumns, popupDisplayPageOptions, clickActionOptions } from './data/popupData';

const PopupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    popups, 
    loading, 
    error, 
    createPopup, 
    updatePopup, 
    deletePopup,
    togglePopupStatus,
    uploadImage,
    deleteImage
  } = usePopups();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    width: '400px',
    height: 'auto',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    imageUrl: '',
    displayPage: 'all', // 새로운 타겟 시스템: admin, user, all
    startDate: null,
    endDate: null,
    showOnce: false,
    closeButton: true,
    autoCloseSeconds: null,
    clickAction: 'none',
    clickUrl: '',
    clickTarget: '_blank',
    priority: 0,
    isActive: true,
    // 추가 필드
    hideOnLogout: false,
    showHeader: true,
    headerBackgroundColor: '#f5f5f5',
    topPosition: 50,
    leftPosition: 50
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) {
      const popup = popups.find(p => p.id === parseInt(id));
      if (popup) {
        setFormData({
          title: popup.title || '',
          content: popup.content || '',
          width: popup.width || '400px',
          height: popup.height || 'auto',
          backgroundColor: popup.background_color || '#FFFFFF',
          textColor: popup.text_color || '#000000',
          imageUrl: popup.image_url || '',
          displayPage: popup.display_page || 'all',
          startDate: popup.start_date || null,
          endDate: popup.end_date || null,
          showOnce: Boolean(popup.show_once),
          closeButton: popup.close_button !== false,
          autoCloseSeconds: popup.auto_close_seconds || null,
          clickAction: popup.click_action || 'none',
          clickUrl: popup.click_url || '',
          clickTarget: popup.click_target || '_blank',
          priority: popup.priority || 0,
          isActive: Boolean(popup.is_active),
          hideOnLogout: Boolean(popup.hide_on_logout),
          showHeader: popup.show_header !== false,
          headerBackgroundColor: popup.header_background_color || '#f5f5f5',
          topPosition: popup.top_position || 50,
          leftPosition: popup.left_position || 50
        });
        setShowForm(true);
      }
    }
  }, [id, popups]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          open: true,
          message: '이미지 크기는 5MB 이하여야 합니다.',
          severity: 'error'
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(imageFile);
      handleInputChange('imageUrl', imageUrl);
      setImageFile(null);
      setImagePreview('');
      setNotification({
        open: true,
        message: '이미지가 업로드되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: '이미지 업로드에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.imageUrl) return;

    try {
      await deleteImage(formData.imageUrl);
      handleInputChange('imageUrl', '');
      setNotification({
        open: true,
        message: '이미지가 삭제되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: '이미지 삭제에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }
    
    if (formData.startDate && formData.endDate && 
        new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
    }
    
    if (formData.clickAction === 'url' && !formData.clickUrl) {
      newErrors.clickUrl = 'URL을 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (id) {
        await updatePopup(id, formData);
        setNotification({
          open: true,
          message: '팝업이 수정되었습니다.',
          severity: 'success'
        });
      } else {
        await createPopup(formData);
        setNotification({
          open: true,
          message: '팝업이 생성되었습니다.',
          severity: 'success'
        });
      }
      setShowForm(false);
      navigate('/admin/board/popups');
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || '저장에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePopup(deleteConfirm.id);
      setNotification({
        open: true,
        message: '팝업이 삭제되었습니다.',
        severity: 'success'
      });
      setDeleteConfirm({ open: false, id: null });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || '삭제에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleToggleStatus = async (popupId) => {
    try {
      await togglePopupStatus(popupId);
      setNotification({
        open: true,
        message: '상태가 변경되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || '상태 변경에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const renderPreview = () => {
    const style = {
      width: formData.width,
      height: formData.height === 'auto' ? 'auto' : formData.height,
      backgroundColor: formData.backgroundColor,
      color: formData.textColor,
      position: 'relative',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    return (
      <Paper style={style}>
        {formData.showHeader && (
          <Box
            sx={{
              backgroundColor: formData.headerBackgroundColor,
              margin: '-20px -20px 20px -20px',
              padding: '15px 20px',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ color: formData.textColor }}>
              {formData.title || '팝업 제목'}
            </Typography>
            {formData.closeButton && (
              <IconButton size="small">
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        )}
        
        {!formData.showHeader && formData.closeButton && (
          <IconButton
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}
        
        {formData.imageUrl && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img 
              src={formData.imageUrl} 
              alt="팝업 이미지" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        )}
        
        <Box dangerouslySetInnerHTML={{ __html: formData.content || '팝업 내용' }} />
      </Paper>
    );
  };

  const columns = popupColumns.map(col => {
    if (col.id === 'actions') {
      return {
        ...col,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/admin/board/popups/${params.row.id}`)}
            >
              수정
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirm({ open: true, id: params.row.id })}
            >
              삭제
            </Button>
          </Box>
        )
      };
    }
    if (col.id === 'status') {
      return {
        ...col,
        renderCell: (params) => (
          <Switch
            checked={params.row.is_active}
            onChange={() => handleToggleStatus(params.row.id)}
            size="small"
          />
        )
      };
    }
    if (col.id === 'target') {
      return {
        ...col,
        renderCell: (params) => {
          const displayOption = popupDisplayPageOptions.find(opt => opt.value === params.row.display_page);
          return <Chip label={displayOption ? displayOption.label : params.row.display_page} size="small" />;
        }
      };
    }
    return col;
  });

  if (showForm) {
    return (
      <>
        <PageHeader 
          title={id ? '팝업 수정' : '팝업 생성'}
          breadcrumbs={[
            { text: '홈', link: '/admin' },
            { text: '게시판 관리', link: '/admin/board' },
            { text: '팝업 관리', link: '/admin/board/popups' },
            { text: id ? '수정' : '생성' }
          ]}
        />
        
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>기본 정보</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="팝업 제목"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        error={Boolean(errors.title)}
                        helperText={errors.title}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        팝업 내용 *
                      </Typography>
                      <CKEditor
                        data={formData.content}
                        onChange={(data) => handleInputChange('content', data)}
                      />
                      {errors.content && (
                        <FormHelperText error>{errors.content}</FormHelperText>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>팝업 대상</InputLabel>
                        <Select
                          value={formData.displayPage}
                          onChange={(e) => handleInputChange('displayPage', e.target.value)}
                          label="팝업 대상"
                        >
                          {popupDisplayPageOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="우선순위"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                        helperText="높을수록 먼저 표시됩니다"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="시작일"
                        value={formData.startDate || ''}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="종료일"
                        value={formData.endDate || ''}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        error={Boolean(errors.endDate)}
                        helperText={errors.endDate}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>디자인 설정</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="너비"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        helperText="예: 400px, 50%, auto"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="높이"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        helperText="예: 300px, auto"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>상단 위치 (px)</Typography>
                      <Slider
                        value={formData.topPosition}
                        onChange={(e, value) => handleInputChange('topPosition', value)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 50, label: '50' },
                          { value: 100, label: '100' }
                        ]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>좌측 위치 (px)</Typography>
                      <Slider
                        value={formData.leftPosition}
                        onChange={(e, value) => handleInputChange('leftPosition', value)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 50, label: '50' },
                          { value: 100, label: '100' }
                        ]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="color"
                        label="배경색"
                        value={formData.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ width: 24, height: 24, backgroundColor: formData.backgroundColor, border: '1px solid #ccc', borderRadius: 1 }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="color"
                        label="텍스트 색상"
                        value={formData.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ width: 24, height: 24, backgroundColor: formData.textColor, border: '1px solid #ccc', borderRadius: 1 }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="color"
                        label="헤더 배경색"
                        value={formData.headerBackgroundColor}
                        onChange={(e) => handleInputChange('headerBackgroundColor', e.target.value)}
                        disabled={!formData.showHeader}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ width: 24, height: 24, backgroundColor: formData.headerBackgroundColor, border: '1px solid #ccc', borderRadius: 1 }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          disabled={uploadingImage}
                        >
                          이미지 선택
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </Button>
                        
                        {imageFile && (
                          <Button
                            variant="outlined"
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                          >
                            업로드
                          </Button>
                        )}
                        
                        {formData.imageUrl && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleImageDelete}
                          >
                            이미지 삭제
                          </Button>
                        )}
                      </Box>
                      
                      {imagePreview && (
                        <Box sx={{ mt: 2 }}>
                          <img src={imagePreview} alt="미리보기" style={{ maxWidth: '100%', maxHeight: 200 }} />
                        </Box>
                      )}
                      
                      {formData.imageUrl && !imagePreview && (
                        <Box sx={{ mt: 2 }}>
                          <img src={formData.imageUrl} alt="현재 이미지" style={{ maxWidth: '100%', maxHeight: 200 }} />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>동작 설정</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.showOnce}
                            onChange={(e) => handleInputChange('showOnce', e.target.checked)}
                          />
                        }
                        label="한 번만 표시"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.closeButton}
                            onChange={(e) => handleInputChange('closeButton', e.target.checked)}
                          />
                        }
                        label="닫기 버튼 표시"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.showHeader}
                            onChange={(e) => handleInputChange('showHeader', e.target.checked)}
                          />
                        }
                        label="헤더 표시"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.hideOnLogout}
                            onChange={(e) => handleInputChange('hideOnLogout', e.target.checked)}
                          />
                        }
                        label="로그아웃 시 숨김"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="자동 닫기 시간 (초)"
                        value={formData.autoCloseSeconds || ''}
                        onChange={(e) => handleInputChange('autoCloseSeconds', e.target.value ? parseInt(e.target.value) : null)}
                        helperText="설정하지 않으면 자동으로 닫히지 않습니다"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>클릭 동작</InputLabel>
                        <Select
                          value={formData.clickAction}
                          onChange={(e) => handleInputChange('clickAction', e.target.value)}
                          label="클릭 동작"
                        >
                          {clickActionOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {formData.clickAction === 'url' && (
                      <>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="클릭 URL"
                            value={formData.clickUrl}
                            onChange={(e) => handleInputChange('clickUrl', e.target.value)}
                            error={Boolean(errors.clickUrl)}
                            helperText={errors.clickUrl}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>열기 방식</InputLabel>
                            <Select
                              value={formData.clickTarget}
                              onChange={(e) => handleInputChange('clickTarget', e.target.value)}
                              label="열기 방식"
                            >
                              <MenuItem value="_blank">새 창</MenuItem>
                              <MenuItem value="_self">현재 창</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          />
                        }
                        label="즉시 활성화"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">미리보기</Typography>
                    <Button
                      startIcon={<PreviewIcon />}
                      onClick={() => setPreviewOpen(true)}
                    >
                      전체화면
                    </Button>
                  </Box>
                  
                  <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                    {renderPreview()}
                  </Box>
                </CardContent>
              </Card>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {id ? '수정' : '생성'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setShowForm(false);
                    navigate('/admin/board/popups');
                  }}
                >
                  취소
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            팝업 미리보기
            <IconButton
              onClick={() => setPreviewOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 3 }}>
              {renderPreview()}
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="팝업 관리"
        breadcrumbs={[
          { text: '홈', link: '/admin' },
          { text: '게시판 관리', link: '/admin/board' },
          { text: '팝업 관리' }
        ]}
      />
      
      <Box sx={{ p: 3 }}>
        {error && <BannerMessage variant="error" text={error} sx={{ mb: 3 }} />}
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setFormData({
                title: '',
                content: '',
                width: '400px',
                height: 'auto',
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                imageUrl: '',
                displayPage: 'all',
                startDate: null,
                endDate: null,
                showOnce: false,
                closeButton: true,
                autoCloseSeconds: null,
                clickAction: 'none',
                clickUrl: '',
                clickTarget: '_blank',
                priority: 0,
                isActive: true,
                hideOnLogout: false,
                showHeader: true,
                headerBackgroundColor: '#f5f5f5',
                topPosition: 50,
                leftPosition: 50
              });
              setShowForm(true);
            }}
          >
            팝업 생성
          </Button>
        </Box>
        
        <SearchableTable
          data={popups}
          columns={columns}
          loading={loading}
          searchFields={['title', 'content']}
          defaultSort={{ field: 'createdAt', order: 'desc' }}
        />
      </Box>
      
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
      >
        <DialogTitle>팝업 삭제</DialogTitle>
        <DialogContent>
          정말로 이 팝업을 삭제하시겠습니까?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>
            취소
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PopupPage;