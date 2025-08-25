import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  Stack,
  Divider,
  Tooltip,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ImageIcon from '@mui/icons-material/Image';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { PageContainer, PageHeader } from '../../components/baseTemplate/components';
import api from '../../services/api';

/**
 * 디자인설정 페이지
 * 관리자 및 유저페이지의 로고, 슬라이드, 백그라운드 등을 관리
 */
const DesignSettingsPage = () => {
  const theme = useTheme();
  
  // 현재 선택된 디자인 탭
  const [currentDesignTab, setCurrentDesignTab] = useState(0);
  
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 각 디자인별 설정 상태 (5개 디자인)
  const [designs, setDesigns] = useState([
    {
      id: 1,
      name: '디자인1',
      adminLogo: { file: null, preview: null, width: 200, height: 60 },
      userLogos: {
        main: { file: null, preview: null, width: 180, height: 50 },
        footer: { file: null, preview: null, width: 150, height: 40 },
        login: { file: null, preview: null, width: 200, height: 60 }
      },
      mainSlides: [
        { id: 1, file: null, preview: null, title: '슬라이드 1' },
        { id: 2, file: null, preview: null, title: '슬라이드 2' },
        { id: 3, file: null, preview: null, title: '슬라이드 3' }
      ],
      backgroundSettings: {
        type: 'color',
        color: '#f5f5f5',
        image: { file: null, preview: null }
      },
      snsSettings: {
        facebook: { icon: null, preview: null, url: '' },
        twitter: { icon: null, preview: null, url: '' },
        instagram: { icon: null, preview: null, url: '' },
        youtube: { icon: null, preview: null, url: '' },
        telegram: { icon: null, preview: null, url: '' },
        kakao: { icon: null, preview: null, url: '' }
      }
    },
    {
      id: 2,
      name: '디자인2',
      adminLogo: { file: null, preview: null, width: 200, height: 60 },
      userLogos: {
        main: { file: null, preview: null, width: 180, height: 50 },
        footer: { file: null, preview: null, width: 150, height: 40 },
        login: { file: null, preview: null, width: 200, height: 60 }
      },
      mainSlides: [
        { id: 1, file: null, preview: null, title: '슬라이드 1' },
        { id: 2, file: null, preview: null, title: '슬라이드 2' },
        { id: 3, file: null, preview: null, title: '슬라이드 3' }
      ],
      backgroundSettings: {
        type: 'color',
        color: '#f5f5f5',
        image: { file: null, preview: null }
      },
      snsSettings: {
        facebook: { icon: null, preview: null, url: '' },
        twitter: { icon: null, preview: null, url: '' },
        instagram: { icon: null, preview: null, url: '' },
        youtube: { icon: null, preview: null, url: '' },
        telegram: { icon: null, preview: null, url: '' },
        kakao: { icon: null, preview: null, url: '' }
      }
    },
    {
      id: 3,
      name: '디자인3',
      adminLogo: { file: null, preview: null, width: 200, height: 60 },
      userLogos: {
        main: { file: null, preview: null, width: 180, height: 50 },
        footer: { file: null, preview: null, width: 150, height: 40 },
        login: { file: null, preview: null, width: 200, height: 60 }
      },
      mainSlides: [
        { id: 1, file: null, preview: null, title: '슬라이드 1' },
        { id: 2, file: null, preview: null, title: '슬라이드 2' },
        { id: 3, file: null, preview: null, title: '슬라이드 3' }
      ],
      backgroundSettings: {
        type: 'color',
        color: '#f5f5f5',
        image: { file: null, preview: null }
      },
      snsSettings: {
        facebook: { icon: null, preview: null, url: '' },
        twitter: { icon: null, preview: null, url: '' },
        instagram: { icon: null, preview: null, url: '' },
        youtube: { icon: null, preview: null, url: '' },
        telegram: { icon: null, preview: null, url: '' },
        kakao: { icon: null, preview: null, url: '' }
      }
    },
    {
      id: 4,
      name: '디자인4',
      adminLogo: { file: null, preview: null, width: 200, height: 60 },
      userLogos: {
        main: { file: null, preview: null, width: 180, height: 50 },
        footer: { file: null, preview: null, width: 150, height: 40 },
        login: { file: null, preview: null, width: 200, height: 60 }
      },
      mainSlides: [
        { id: 1, file: null, preview: null, title: '슬라이드 1' },
        { id: 2, file: null, preview: null, title: '슬라이드 2' },
        { id: 3, file: null, preview: null, title: '슬라이드 3' }
      ],
      backgroundSettings: {
        type: 'color',
        color: '#f5f5f5',
        image: { file: null, preview: null }
      },
      snsSettings: {
        facebook: { icon: null, preview: null, url: '' },
        twitter: { icon: null, preview: null, url: '' },
        instagram: { icon: null, preview: null, url: '' },
        youtube: { icon: null, preview: null, url: '' },
        telegram: { icon: null, preview: null, url: '' },
        kakao: { icon: null, preview: null, url: '' }
      }
    },
    {
      id: 5,
      name: '디자인5',
      adminLogo: { file: null, preview: null, width: 200, height: 60 },
      userLogos: {
        main: { file: null, preview: null, width: 180, height: 50 },
        footer: { file: null, preview: null, width: 150, height: 40 },
        login: { file: null, preview: null, width: 200, height: 60 }
      },
      mainSlides: [
        { id: 1, file: null, preview: null, title: '슬라이드 1' },
        { id: 2, file: null, preview: null, title: '슬라이드 2' },
        { id: 3, file: null, preview: null, title: '슬라이드 3' }
      ],
      backgroundSettings: {
        type: 'color',
        color: '#f5f5f5',
        image: { file: null, preview: null }
      },
      snsSettings: {
        facebook: { icon: null, preview: null, url: '' },
        twitter: { icon: null, preview: null, url: '' },
        instagram: { icon: null, preview: null, url: '' },
        youtube: { icon: null, preview: null, url: '' },
        telegram: { icon: null, preview: null, url: '' },
        kakao: { icon: null, preview: null, url: '' }
      }
    }
  ]);
  
  // 현재 선택된 디자인 가져오기
  const currentDesign = designs[currentDesignTab];
  
  // 파일 입력 참조
  const adminLogoInputRef = useRef(null);
  const userMainLogoInputRef = useRef(null);
  const userFooterLogoInputRef = useRef(null);
  const userLoginLogoInputRef = useRef(null);
  const slideInputRefs = useRef({});
  const backgroundImageInputRef = useRef(null);
  const snsInputRefs = useRef({});
  
  // 알림 표시
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDesignTemplates();
  }, []);
  
  // 디자인 템플릿 데이터 로드
  const loadDesignTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/design-templates/templates');
      console.log('Design templates response:', response.data); // 디버깅용 로그
      if (response.data.success && response.data.data) {
        // API 데이터를 컴포넌트 상태로 변환
        const templates = response.data.data;
        const convertedDesigns = templates.map(template => ({
          id: template.id,
          name: template.name || `디자인${template.id}`,
          adminLogo: {
            file: null,
            preview: template.admin_logo_url,
            width: template.admin_logo_width || 200,
            height: template.admin_logo_height || 60
          },
          userLogos: {
            main: {
              file: null,
              preview: template.user_main_logo_url,
              width: template.user_main_logo_width || 180,
              height: template.user_main_logo_height || 50
            },
            footer: {
              file: null,
              preview: template.user_footer_logo_url,
              width: template.user_footer_logo_width || 150,
              height: template.user_footer_logo_height || 40
            },
            login: {
              file: null,
              preview: template.user_login_logo_url,
              width: template.user_login_logo_width || 200,
              height: template.user_login_logo_height || 60
            }
          },
          mainSlides: template.slides ? template.slides.map(slide => ({
            id: slide.id,
            file: null,
            preview: slide.image_url,
            title: slide.title || `슬라이드 ${slide.slide_order}`
          })) : [],
          backgroundSettings: {
            type: template.background_type || 'color',
            color: template.background_color || '#f5f5f5',
            image: {
              file: null,
              preview: template.background_image_url
            }
          },
          snsSettings: template.sns ? template.sns.reduce((acc, sns) => {
            acc[sns.platform] = {
              icon: null,
              preview: sns.icon_url,
              url: sns.link_url || ''
            };
            return acc;
          }, {}) : {}
        }));
        
        // 빈 템플릿 채우기
        while (convertedDesigns.length < 5) {
          convertedDesigns.push({
            id: convertedDesigns.length + 1,
            name: `디자인${convertedDesigns.length + 1}`,
            adminLogo: { file: null, preview: null, width: 200, height: 60 },
            userLogos: {
              main: { file: null, preview: null, width: 180, height: 50 },
              footer: { file: null, preview: null, width: 150, height: 40 }
            },
            mainSlides: [
              { id: 1, file: null, preview: null, title: '슬라이드 1' },
              { id: 2, file: null, preview: null, title: '슬라이드 2' },
              { id: 3, file: null, preview: null, title: '슬라이드 3' }
            ],
            backgroundSettings: {
              type: 'color',
              color: '#f5f5f5',
              image: { file: null, preview: null }
            },
            snsSettings: {
              facebook: { icon: null, preview: null, url: '' },
              twitter: { icon: null, preview: null, url: '' },
              instagram: { icon: null, preview: null, url: '' },
              youtube: { icon: null, preview: null, url: '' },
              telegram: { icon: null, preview: null, url: '' },
              kakao: { icon: null, preview: null, url: '' }
            }
          });
        }
        
        setDesigns(convertedDesigns);
      }
    } catch (error) {
      console.error('디자인 템플릿 로드 오류:', error);
      showNotification('디자인 템플릿을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    showNotification(`${currentDesign.name}의 설정을 새로고침했습니다.`);
  }, [currentDesign]);
  
  // 디자인별로 상태 업데이트하는 헬퍼 함수
  const updateCurrentDesign = (updates) => {
    setDesigns(prev => prev.map((design, index) => 
      index === currentDesignTab ? { ...design, ...updates } : design
    ));
  };
  
  // 파일 업로드 핸들러
  const handleFileUpload = useCallback((event, type, slideId = null) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showNotification('JPG, PNG, GIF, SVG 파일만 업로드 가능합니다.', 'error');
      return;
    }
    
    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('파일 크기는 5MB 이하여야 합니다.', 'error');
      return;
    }
    
    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result;
      
      switch (type) {
        case 'adminLogo':
          updateCurrentDesign({
            adminLogo: { ...currentDesign.adminLogo, file, preview }
          });
          showNotification('관리자 로고가 업로드되었습니다.');
          break;
          
        case 'userMainLogo':
          updateCurrentDesign({
            userLogos: {
              ...currentDesign.userLogos,
              main: { ...currentDesign.userLogos.main, file, preview }
            }
          });
          showNotification('유저페이지 메인 로고가 업로드되었습니다.');
          break;
          
        case 'userFooterLogo':
          updateCurrentDesign({
            userLogos: {
              ...currentDesign.userLogos,
              footer: { ...currentDesign.userLogos.footer, file, preview }
            }
          });
          showNotification('유저페이지 푸터 로고가 업로드되었습니다.');
          break;
          
        case 'userLoginLogo':
          updateCurrentDesign({
            userLogos: {
              ...currentDesign.userLogos,
              login: { ...currentDesign.userLogos.login, file, preview }
            }
          });
          showNotification('로그인 페이지 로고가 업로드되었습니다.');
          break;
          
        case 'slide':
          updateCurrentDesign({
            mainSlides: currentDesign.mainSlides.map(slide => 
              slide.id === slideId 
                ? { ...slide, file, preview }
                : slide
            )
          });
          showNotification(`${currentDesign.mainSlides.find(s => s.id === slideId)?.title}이 업로드되었습니다.`);
          break;
          
        case 'background':
          updateCurrentDesign({
            backgroundSettings: {
              ...currentDesign.backgroundSettings,
              image: { file, preview }
            }
          });
          showNotification('백그라운드 이미지가 업로드되었습니다.');
          break;
          
        case 'sns':
          const platform = slideId; // slideId를 platform으로 사용
          updateCurrentDesign({
            snsSettings: {
              ...currentDesign.snsSettings,
              [platform]: { 
                ...currentDesign.snsSettings[platform], 
                file, 
                preview 
              }
            }
          });
          showNotification(`${platform} 아이콘이 업로드되었습니다.`);
          break;
          
        default:
          break;
      }
    };
    
    reader.readAsDataURL(file);
  }, [currentDesign, updateCurrentDesign]);
  
  // 파일 삭제 핸들러
  const handleFileDelete = useCallback((type, slideId = null) => {
    switch (type) {
      case 'adminLogo':
        updateCurrentDesign({
          adminLogo: { ...currentDesign.adminLogo, file: null, preview: null }
        });
        showNotification('관리자 로고가 삭제되었습니다.');
        break;
        
      case 'userMainLogo':
        updateCurrentDesign({
          userLogos: {
            ...currentDesign.userLogos,
            main: { ...currentDesign.userLogos.main, file: null, preview: null }
          }
        });
        showNotification('유저페이지 메인 로고가 삭제되었습니다.');
        break;
        
      case 'userFooterLogo':
        updateCurrentDesign({
          userLogos: {
            ...currentDesign.userLogos,
            footer: { ...currentDesign.userLogos.footer, file: null, preview: null }
          }
        });
        showNotification('유저페이지 푸터 로고가 삭제되었습니다.');
        break;
        
      case 'userLoginLogo':
        updateCurrentDesign({
          userLogos: {
            ...currentDesign.userLogos,
            login: { ...currentDesign.userLogos.login, file: null, preview: null }
          }
        });
        showNotification('로그인 페이지 로고가 삭제되었습니다.');
        break;
        
      case 'slide':
        updateCurrentDesign({
          mainSlides: currentDesign.mainSlides.map(slide => 
            slide.id === slideId 
              ? { ...slide, file: null, preview: null }
              : slide
          )
        });
        showNotification(`슬라이드가 삭제되었습니다.`);
        break;
        
      case 'background':
        updateCurrentDesign({
          backgroundSettings: {
            ...currentDesign.backgroundSettings,
            image: { file: null, preview: null }
          }
        });
        showNotification('백그라운드 이미지가 삭제되었습니다.');
        break;
        
      case 'sns':
        const platform = slideId; // slideId를 platform으로 사용
        updateCurrentDesign({
          snsSettings: {
            ...currentDesign.snsSettings,
            [platform]: { 
              ...currentDesign.snsSettings[platform], 
              file: null, 
              preview: null 
            }
          }
        });
        showNotification(`${platform} 아이콘이 삭제되었습니다.`);
        break;
        
      default:
        break;
    }
  }, [currentDesign, updateCurrentDesign]);
  
  // 크기 조정 핸들러 (슬라이더 드래그 중 스크롤 방지)
  const handleSizeChange = useCallback((type, dimension, value) => {
    setDesigns(prev => {
      const newDesigns = [...prev];
      const design = newDesigns[currentDesignTab];
      
      switch (type) {
        case 'adminLogo':
          design.adminLogo = { ...design.adminLogo, [dimension]: value };
          break;
          
        case 'userMainLogo':
          design.userLogos.main = { ...design.userLogos.main, [dimension]: value };
          break;
          
        case 'userFooterLogo':
          design.userLogos.footer = { ...design.userLogos.footer, [dimension]: value };
          break;
          
        case 'userLoginLogo':
          design.userLogos.login = { ...design.userLogos.login, [dimension]: value };
          break;
      }
      
      return newDesigns;
    });
  }, [currentDesignTab]);
  
  
  // SNS URL 업데이트 핸들러
  const handleSnsUrlChange = useCallback((platform, url) => {
    updateCurrentDesign({
      snsSettings: {
        ...currentDesign.snsSettings,
        [platform]: {
          ...currentDesign.snsSettings[platform],
          url
        }
      }
    });
  }, [currentDesign, updateCurrentDesign]);
  
  // 저장 핸들러 - 유저페이지 로고만 저장
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const currentDesignData = designs[currentDesignTab];
      
      // 파일 업로드가 있는 경우 FormData 사용
      const hasFiles = currentDesignData.userLogos.main.file || currentDesignData.userLogos.footer.file || currentDesignData.userLogos.login.file;
      
      if (hasFiles) {
        // FormData 생성 (파일 업로드용)
        const formData = new FormData();
        formData.append('templateId', currentDesignData.id);
        
        // 유저페이지 메인 로고 파일이 있으면 추가
        if (currentDesignData.userLogos.main.file) {
          formData.append('userMainLogo', currentDesignData.userLogos.main.file);
        }
        formData.append('userMainLogoWidth', currentDesignData.userLogos.main.width);
        formData.append('userMainLogoHeight', currentDesignData.userLogos.main.height);
        
        // 유저페이지 푸터 로고 파일이 있으면 추가
        if (currentDesignData.userLogos.footer.file) {
          formData.append('userFooterLogo', currentDesignData.userLogos.footer.file);
        }
        formData.append('userFooterLogoWidth', currentDesignData.userLogos.footer.width);
        formData.append('userFooterLogoHeight', currentDesignData.userLogos.footer.height);
        
        // 로그인 페이지 로고 파일이 있으면 추가
        if (currentDesignData.userLogos.login.file) {
          formData.append('userLoginLogo', currentDesignData.userLogos.login.file);
        }
        formData.append('userLoginLogoWidth', currentDesignData.userLogos.login.width);
        formData.append('userLoginLogoHeight', currentDesignData.userLogos.login.height);
        
        // API 호출 (파일 업로드 엔드포인트 사용)
        const response = await api.post('/design-templates/upload-logos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          showNotification(`${currentDesign.name}의 유저페이지 로고가 저장되었습니다.`);
          // 저장 후 데이터 다시 로드
          await loadDesignTemplates();
        } else {
          throw new Error(response.data.error || '저장 실패');
        }
      } else {
        // 파일이 없는 경우 크기만 업데이트
        const updateData = {
          user_main_logo_width: currentDesignData.userLogos.main.width,
          user_main_logo_height: currentDesignData.userLogos.main.height,
          user_footer_logo_width: currentDesignData.userLogos.footer.width,
          user_footer_logo_height: currentDesignData.userLogos.footer.height,
          user_login_logo_width: currentDesignData.userLogos.login.width,
          user_login_logo_height: currentDesignData.userLogos.login.height
        };
        
        // API 호출 (일반 업데이트 엔드포인트 사용)
        const response = await api.put(`/design-templates/templates/${currentDesignData.id}`, updateData);
        
        if (response.data.success) {
          showNotification(`${currentDesign.name}의 로고 크기가 저장되었습니다.`);
          // 저장 후 데이터 다시 로드
          await loadDesignTemplates();
        } else {
          throw new Error(response.data.error || '저장 실패');
        }
      }
    } catch (error) {
      console.error('저장 오류:', error);
      showNotification('유저페이지 로고 저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }, [designs, currentDesignTab, currentDesign]);
  
  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (window.confirm(`${currentDesign.name} 설정을 초기화하시겠습니까?`)) {
      updateCurrentDesign({
        adminLogo: { file: null, preview: null, width: 200, height: 60 },
        userLogos: {
          main: { file: null, preview: null, width: 180, height: 50 },
          footer: { file: null, preview: null, width: 150, height: 40 },
          login: { file: null, preview: null, width: 200, height: 60 }
        },
        mainSlides: [
          { id: 1, file: null, preview: null, title: '슬라이드 1' },
          { id: 2, file: null, preview: null, title: '슬라이드 2' },
          { id: 3, file: null, preview: null, title: '슬라이드 3' }
        ],
        backgroundSettings: {
          type: 'color',
          color: '#f5f5f5',
          image: { file: null, preview: null }
        },
        snsSettings: {
          facebook: { icon: null, preview: null, url: '' },
          twitter: { icon: null, preview: null, url: '' },
          instagram: { icon: null, preview: null, url: '' },
          youtube: { icon: null, preview: null, url: '' },
          telegram: { icon: null, preview: null, url: '' },
          kakao: { icon: null, preview: null, url: '' }
        }
      });
      
      showNotification(`${currentDesign.name} 설정이 초기화되었습니다.`);
    }
  }, [currentDesign, updateCurrentDesign]);
  
  // 로고 업로드 카드 컴포넌트
  const LogoUploadCard = ({ title, logo, type, inputRef, onUpload, onDelete, onSizeChange }) => {
    // 입력 필드 핸들러
    const handleInputChange = (dimension) => (e) => {
      const value = e.target.value;
      if (value === '') {
        onSizeChange(type, dimension, 0);
      } else {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 2000) {
          onSizeChange(type, dimension, numValue);
        }
      }
    };
    
    return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box
          sx={{
            mt: 2,
            p: 3,
            border: '2px dashed',
            borderColor: logo.preview ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: 'grey.50',
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {logo.preview ? (
            <Box>
              <img
                src={logo.preview}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: 150,
                  width: logo.width,
                  height: logo.height,
                  objectFit: 'contain'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' }
                }}
                size="small"
                onClick={() => onDelete(type)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                클릭하여 로고 업로드
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG, GIF, SVG (최대 5MB)
              </Typography>
            </Box>
          )}
          
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
            onChange={(e) => onUpload(e, type)}
          />
        </Box>
        
        {/* 크기 조정 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            크기 조정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  너비
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={logo.width}
                  onChange={handleInputChange('width')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    inputProps: { min: 0, max: 2000 }
                  }}
                  fullWidth
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  높이
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={logo.height}
                  onChange={handleInputChange('height')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    inputProps: { min: 0, max: 2000 }
                  }}
                  fullWidth
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
    );
  };
  
  return (
    <PageContainer>
      <PageHeader
        title="디자인설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefresh}
        sx={{ mb: 1 }}
      />
      
      {/* 디자인 탭 선택 */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={currentDesignTab}
          onChange={(e, newValue) => setCurrentDesignTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 600
            }
          }}
        >
          {designs.map((design, index) => (
            <Tab key={design.id} label={design.name} />
          ))}
        </Tabs>
      </Paper>
      
      
      {/* 유저페이지 로고 관리 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
            backgroundColor: '#f5f7fa',
            borderRadius: 1.5,
            p: 2.5,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography variant="h6" sx={{
            fontWeight: 600,
            color: '#2c3e50',
            fontSize: '1.1rem'
          }}>
            유저페이지 로고 관리
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <LogoUploadCard
              title="메인 로고"
              logo={currentDesign.userLogos.main}
              type="userMainLogo"
              inputRef={userMainLogoInputRef}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
              onSizeChange={handleSizeChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <LogoUploadCard
              title="푸터 로고"
              logo={currentDesign.userLogos.footer}
              type="userFooterLogo"
              inputRef={userFooterLogoInputRef}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
              onSizeChange={handleSizeChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <LogoUploadCard
              title="로그인 페이지 로고"
              logo={currentDesign.userLogos.login}
              type="userLoginLogo"
              inputRef={userLoginLogoInputRef}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
              onSizeChange={handleSizeChange}
            />
          </Grid>
        </Grid>
      </Paper>
      
      
      
      
      {/* 액션 버튼 */}
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
          color="primary"
          onClick={handleSave}
          disabled={saving}
          sx={{ minWidth: 120 }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : '저장'}
        </Button>
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

export default DesignSettingsPage;