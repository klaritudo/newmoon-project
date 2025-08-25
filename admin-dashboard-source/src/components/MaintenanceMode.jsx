import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const MaintenanceMode = ({ settings }) => {
  // 기본 설정값
  const defaultSettings = {
    backgroundColor: '#1a1a1a',
    backgroundImage: '',
    mainLogo: '',
    mainLogoPosition: { x: 50, y: 20 },
    mainLogoSize: '200px',
    mainText: '<h1 style="color: white;">시스템 점검 중입니다</h1><p style="color: #ccc;">보다 나은 서비스를 제공하기 위해 시스템 점검을 진행하고 있습니다.</p>',
    footerLogo: '',
    footerText: '© 2024 All rights reserved.',
    socialLinks: []
  };

  // 전달받은 설정과 기본값 병합
  const maintenanceSettings = { ...defaultSettings, ...settings };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: maintenanceSettings.backgroundColor,
        backgroundImage: maintenanceSettings.backgroundImage ? `url(${maintenanceSettings.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
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
            zIndex: 1
          }}
        >
          <img 
            src={maintenanceSettings.mainLogo} 
            alt="Logo" 
            style={{ 
              width: maintenanceSettings.mainLogoSize,
              height: 'auto'
            }}
          />
        </Box>
      )}

      {/* 메인 컨텐츠 */}
      <Container 
        maxWidth="md" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4
        }}
      >
        <Box
          dangerouslySetInnerHTML={{ __html: maintenanceSettings.mainText }}
          sx={{
            textAlign: 'center',
            '& h1': {
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 3,
              color: 'white'
            },
            '& p': {
              fontSize: { xs: '1rem', md: '1.25rem' },
              mb: 2,
              color: '#ccc',
              lineHeight: 1.6
            }
          }}
        />
      </Container>

      {/* 푸터 */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* 푸터 로고 */}
        {maintenanceSettings.footerLogo && (
          <Box sx={{ mb: 2 }}>
            <img 
              src={maintenanceSettings.footerLogo} 
              alt="Footer Logo" 
              style={{ 
                height: '40px',
                maxWidth: '200px',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
        
        {/* SNS 링크 */}
        {maintenanceSettings.socialLinks && maintenanceSettings.socialLinks.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {maintenanceSettings.socialLinks.map((link, index) => (
              link.icon && link.url && (
                <a 
                  key={index} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img 
                    src={link.icon} 
                    alt={link.platform} 
                    style={{ 
                      width: '30px', 
                      height: '30px',
                      objectFit: 'contain'
                    }}
                  />
                </a>
              )
            ))}
          </Box>
        )}

        {/* 푸터 텍스트 */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#888',
            fontSize: { xs: '0.875rem', md: '1rem' }
          }}
        >
          {maintenanceSettings.footerText}
        </Typography>
        
        {/* 관리자용 우회 접속 안내 (개발 모드에서만 표시) */}
        {process.env.NODE_ENV === 'development' && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 2,
              color: '#666',
              fontSize: '0.75rem'
            }}
          >
            관리자 접속: ?bypass=maintenance
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MaintenanceMode;