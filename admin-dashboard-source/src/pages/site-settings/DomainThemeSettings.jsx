import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ColorLens,
  Image,
  Settings,
  Code,
  Menu as MenuIcon,
  Save,
  Refresh,
  Preview
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import apiService from '../../services/api';

const DomainThemeSettings = () => {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [theme, setTheme] = useState(null);
  const [settings, setSettings] = useState({});
  const [menus, setMenus] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [colorPicker, setColorPicker] = useState({ open: false, field: '', color: '' });

  // 도메인 목록 로드
  useEffect(() => {
    loadDomains();
  }, []);

  // 선택된 도메인의 테마 로드
  useEffect(() => {
    if (selectedDomain) {
      loadDomainTheme(selectedDomain);
    }
  }, [selectedDomain]);

  const loadDomains = async () => {
    try {
      const response = await apiService.domains.getAll();
      setDomains(response.data.data || []);
      if (response.data.data?.length > 0) {
        setSelectedDomain(response.data.data[0].id);
      }
    } catch (error) {
      console.error('도메인 로드 실패:', error);
    }
  };

  const loadDomainTheme = async (domainId) => {
    setLoading(true);
    try {
      const domain = domains.find(d => d.id === domainId);
      if (!domain) return;

      const response = await apiService.get(`/domain-themes/by-domain/${domain.domain_url}`);
      if (response.data.success) {
        setTheme(response.data.data.theme || getDefaultTheme());
        setSettings(response.data.data.settings || {});
        setMenus(response.data.data.menus || []);
      }
    } catch (error) {
      console.error('테마 로드 실패:', error);
      setTheme(getDefaultTheme());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTheme = () => ({
    theme_name: 'default',
    colors: {
      primary: '#3498db',
      secondary: '#2ecc71',
      accent: '#e74c3c',
      background: '#ffffff',
      text: '#2c3e50'
    },
    assets: {
      logo: '',
      logoDark: '',
      favicon: ''
    },
    site: {
      title: '',
      description: '',
      footerText: ''
    },
    layout: {
      type: 'default',
      sidebarPosition: 'left',
      headerStyle: 'fixed'
    },
    typography: {
      fontFamily: 'Noto Sans KR',
      fontSize: 14
    },
    customCss: ''
  });

  const handleThemeChange = (field, value) => {
    const fields = field.split('.');
    const newTheme = { ...theme };
    let current = newTheme;
    
    for (let i = 0; i < fields.length - 1; i++) {
      current = current[fields[i]];
    }
    
    current[fields[fields.length - 1]] = value;
    setTheme(newTheme);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 테마 저장
      const themeData = {
        theme_name: theme.theme_name,
        primary_color: theme.colors.primary,
        secondary_color: theme.colors.secondary,
        accent_color: theme.colors.accent,
        background_color: theme.colors.background,
        text_color: theme.colors.text,
        logo_url: theme.assets.logo,
        logo_dark_url: theme.assets.logoDark,
        favicon_url: theme.assets.favicon,
        site_title: theme.site.title,
        site_description: theme.site.description,
        footer_text: theme.site.footerText,
        layout_type: theme.layout.type,
        sidebar_position: theme.layout.sidebarPosition,
        header_style: theme.layout.headerStyle,
        font_family: theme.typography.fontFamily,
        font_size_base: theme.typography.fontSize,
        custom_css: theme.customCss
      };

      await apiService.put(`/domain-themes/domain/${selectedDomain}`, themeData);
      
      setMessage({ type: 'success', text: '테마가 성공적으로 저장되었습니다.' });
    } catch (error) {
      console.error('테마 저장 실패:', error);
      setMessage({ type: 'error', text: '테마 저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const domain = domains.find(d => d.id === selectedDomain);
    if (domain) {
      window.open(`http://${domain.domain_url}`, '_blank');
    }
  };

  const renderColorPicker = (field, label) => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            backgroundColor: theme.colors[field],
            border: '1px solid #ddd',
            borderRadius: 1,
            cursor: 'pointer'
          }}
          onClick={() => setColorPicker({ 
            open: true, 
            field: field, 
            color: theme.colors[field] 
          })}
        />
        <TextField
          size="small"
          value={theme.colors[field]}
          onChange={(e) => handleThemeChange(`colors.${field}`, e.target.value)}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );

  if (!theme) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">도메인 테마 설정</Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Preview />}
              onClick={handlePreview}
              disabled={!selectedDomain}
            >
              미리보기
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>도메인 선택</InputLabel>
          <Select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            label="도메인 선택"
          >
            {domains.map(domain => (
              <MenuItem key={domain.id} value={domain.id}>
                {domain.domain_name} ({domain.domain_url})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab icon={<ColorLens />} label="색상" />
              <Tab icon={<Image />} label="로고 및 이미지" />
              <Tab icon={<Settings />} label="레이아웃" />
              <Tab icon={<Code />} label="커스텀 CSS" />
              <Tab icon={<MenuIcon />} label="메뉴 설정" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {/* 색상 탭 */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {renderColorPicker('primary', '주 색상')}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderColorPicker('secondary', '보조 색상')}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderColorPicker('accent', '강조 색상')}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderColorPicker('background', '배경 색상')}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderColorPicker('text', '텍스트 색상')}
                  </Grid>
                </Grid>
              )}

              {/* 로고 및 이미지 탭 */}
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="로고 URL"
                      value={theme.assets.logo}
                      onChange={(e) => handleThemeChange('assets.logo', e.target.value)}
                      helperText="밝은 배경용 로고"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="다크 로고 URL"
                      value={theme.assets.logoDark}
                      onChange={(e) => handleThemeChange('assets.logoDark', e.target.value)}
                      helperText="어두운 배경용 로고"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="파비콘 URL"
                      value={theme.assets.favicon}
                      onChange={(e) => handleThemeChange('assets.favicon', e.target.value)}
                      helperText="브라우저 탭에 표시되는 아이콘"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="사이트 제목"
                      value={theme.site.title}
                      onChange={(e) => handleThemeChange('site.title', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="사이트 설명"
                      value={theme.site.description}
                      onChange={(e) => handleThemeChange('site.description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="푸터 텍스트"
                      value={theme.site.footerText}
                      onChange={(e) => handleThemeChange('site.footerText', e.target.value)}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 레이아웃 탭 */}
              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>레이아웃 타입</InputLabel>
                      <Select
                        value={theme.layout.type}
                        onChange={(e) => handleThemeChange('layout.type', e.target.value)}
                        label="레이아웃 타입"
                      >
                        <MenuItem value="default">기본</MenuItem>
                        <MenuItem value="modern">모던</MenuItem>
                        <MenuItem value="classic">클래식</MenuItem>
                        <MenuItem value="minimal">미니멀</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>사이드바 위치</InputLabel>
                      <Select
                        value={theme.layout.sidebarPosition}
                        onChange={(e) => handleThemeChange('layout.sidebarPosition', e.target.value)}
                        label="사이드바 위치"
                      >
                        <MenuItem value="left">왼쪽</MenuItem>
                        <MenuItem value="right">오른쪽</MenuItem>
                        <MenuItem value="none">없음</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>헤더 스타일</InputLabel>
                      <Select
                        value={theme.layout.headerStyle}
                        onChange={(e) => handleThemeChange('layout.headerStyle', e.target.value)}
                        label="헤더 스타일"
                      >
                        <MenuItem value="fixed">고정</MenuItem>
                        <MenuItem value="static">정적</MenuItem>
                        <MenuItem value="transparent">투명</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="폰트"
                      value={theme.typography.fontFamily}
                      onChange={(e) => handleThemeChange('typography.fontFamily', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="기본 폰트 크기"
                      value={theme.typography.fontSize}
                      onChange={(e) => handleThemeChange('typography.fontSize', parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 10, max: 20 } }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 커스텀 CSS 탭 */}
              {activeTab === 3 && (
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  label="커스텀 CSS"
                  value={theme.customCss}
                  onChange={(e) => handleThemeChange('customCss', e.target.value)}
                  sx={{ fontFamily: 'monospace' }}
                  placeholder="/* 커스텀 CSS 스타일을 입력하세요 */"
                />
              )}

              {/* 메뉴 설정 탭 */}
              {activeTab === 4 && (
                <Grid container spacing={2}>
                  {['slot', 'casino', 'sports', 'deposit', 'withdrawal', 'event', 'support'].map(menuKey => (
                    <Grid item xs={12} key={menuKey}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1">
                              {menuKey.charAt(0).toUpperCase() + menuKey.slice(1)}
                            </Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={menus.find(m => m.menu_key === menuKey)?.is_visible ?? true}
                                  onChange={(e) => {
                                    // 메뉴 표시/숨김 토글 로직
                                  }}
                                />
                              }
                              label="표시"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* 색상 선택기 모달 */}
      {colorPicker.open && (
        <Box
          sx={{
            position: 'fixed',
            zIndex: 2000,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onClick={() => setColorPicker({ open: false, field: '', color: '' })}
          />
          <ChromePicker
            color={colorPicker.color}
            onChange={(color) => {
              handleThemeChange(`colors.${colorPicker.field}`, color.hex);
              setColorPicker({ ...colorPicker, color: color.hex });
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default DomainThemeSettings;