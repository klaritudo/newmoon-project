import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  Tooltip,
  Box,
  Alert
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

/**
 * 에이전트 레벨 추가/수정 다이얼로그 컴포넌트
 */
const AgentLevelDialog = ({
  open,
  editMode,
  currentLevel,
  onClose,
  onSave,
  onInputChange,
  availablePermissions = [],
  totalCount = 5
}) => {
  // 권한 데이터 디버깅
  console.log('AgentLevelDialog - availablePermissions:', availablePermissions);
  console.log('AgentLevelDialog - 권한 개수:', availablePermissions.length);
  // 색상 선택기 상태
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#e8f5e9');
  const [colorSearchText, setColorSearchText] = useState('');

  // 색상 카테고리 정의
  const colorCategories = [
    {
      name: '기본 색상',
      colors: [
        { name: '녹색', backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
        { name: '파란색', backgroundColor: '#e3f2fd', borderColor: '#1565c0' },
        { name: '주황색', backgroundColor: '#fff3e0', borderColor: '#e65100' },
        { name: '보라색', backgroundColor: '#f3e5f5', borderColor: '#7b1fa2' },
        { name: '빨간색', backgroundColor: '#ffebee', borderColor: '#c62828' },
        { name: '노란색', backgroundColor: '#fffde7', borderColor: '#f57f17' },
        { name: '청록색', backgroundColor: '#e0f2f1', borderColor: '#00695c' },
        { name: '분홍색', backgroundColor: '#fce4ec', borderColor: '#ad1457' },
        { name: '갈색', backgroundColor: '#efebe9', borderColor: '#5d4037' },
        { name: '회색', backgroundColor: '#f5f5f5', borderColor: '#424242' },
        { name: '남색', backgroundColor: '#e8eaf6', borderColor: '#303f9f' },
        { name: '라임', backgroundColor: '#f9fbe7', borderColor: '#827717' },
        { name: '시안', backgroundColor: '#e0f7fa', borderColor: '#00838f' },
        { name: '자주색', backgroundColor: '#f1f8e9', borderColor: '#558b2f' },
        { name: '연두색', backgroundColor: '#e8f4fd', borderColor: '#1976d2' },
        { name: '살구색', backgroundColor: '#fef7e0', borderColor: '#f57c00' },
        { name: '라벤더', backgroundColor: '#f8e5f8', borderColor: '#8e24aa' },
        { name: '코랄', backgroundColor: '#fdeaea', borderColor: '#d32f2f' },
        { name: '민트', backgroundColor: '#fffef0', borderColor: '#fbc02d' },
        { name: '스카이블루', backgroundColor: '#e1f5fe', borderColor: '#0277bd' }
      ]
    }
  ];

  // 색상 선택 핸들러
  const handleColorSelect = useCallback((backgroundColor, borderColor) => {
    onInputChange({
      target: {
        name: 'backgroundColor',
        value: backgroundColor
      }
    });
    onInputChange({
      target: {
        name: 'borderColor',
        value: borderColor
      }
    });
    setCustomBackgroundColor(backgroundColor);
  }, [onInputChange]);

  // 커스텀 배경색 선택 핸들러
  const handleCustomBackgroundColorChange = useCallback((color) => {
    setCustomBackgroundColor(color);
    
    // 배경색에 맞는 테두리색 자동 생성 (더 어두운 색상)
    const borderColor = generateBorderColor(color);
    
    onInputChange({
      target: {
        name: 'backgroundColor',
        value: color
      }
    });
    onInputChange({
      target: {
        name: 'borderColor',
        value: borderColor
      }
    });
  }, [onInputChange]);

  // 배경색에서 테두리색 자동 생성 함수
  const generateBorderColor = (backgroundColor) => {
    // 16진수 색상을 RGB로 변환
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 각 색상 값을 40% 어둡게 만들기
    const darkerR = Math.floor(r * 0.6);
    const darkerG = Math.floor(g * 0.6);
    const darkerB = Math.floor(b * 0.6);
    
    // 다시 16진수로 변환
    const darkerHex = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    
    return darkerHex;
  };

  // 색상 카테고리 필터링
  const getFilteredColorCategories = () => {
    if (!colorSearchText) return colorCategories;
    
    return colorCategories.map(category => ({
      ...category,
      colors: category.colors.filter(color => 
        color.name.toLowerCase().includes(colorSearchText.toLowerCase())
      )
    })).filter(category => category.colors.length > 0);
  };

  // 다이얼로그 닫기 시 상태 초기화
  const handleClose = () => {
    setShowBackgroundPicker(false);
    setColorSearchText('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disablePortal={false}
      keepMounted={false}
    >
      <DialogTitle>{editMode ? '단계 수정' : '단계 추가'}</DialogTitle>
      
      {/* 경고 문구 */}
      <Alert severity="warning" sx={{ mx: 3, mb: 2, backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            mb: 0.5,
            fontSize: '14px',
            color: '#e65100'
          }}
        >
          * 단계는 영업에 들어가기 앞서 초기에 설정해주세요!
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            fontSize: '14px',
            color: '#e65100'
          }}
        >
          * 단계 삭제 및 수정 시 일부 데이터가 변형되거나 삭제가 될 수 있으니 신중해 주세요!
        </Typography>
      </Alert>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            name="levelType"
            label="단계 이름"
            type="text"
            fullWidth
            value={currentLevel.levelType || ''}
            onChange={onInputChange}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>권한 템플릿</InputLabel>
            <Select
              name="permissionId"
              value={currentLevel.permissionId || ''}
              label="권한 템플릿"
              onChange={onInputChange}
            >
              <MenuItem value="">
                <em>선택 안함</em>
              </MenuItem>
              {availablePermissions.map((permission) => (
                <MenuItem key={permission.id} value={permission.id}>
                  {permission.permissionName || permission.permission_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>계층 순서</InputLabel>
            <Select
              name="hierarchyOrder"
              value={currentLevel.hierarchyOrder || 1}
              label="계층 순서"
              onChange={onInputChange}
            >
              {Array.from({ length: totalCount + 1 }, (_, i) => i + 1).map((order) => (
                <MenuItem key={order} value={order}>
                  {order}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 색상 선택 섹션 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              색상 선택
            </Typography>
            
            {/* 색상 검색 */}
            <TextField
              fullWidth
              size="small"
              placeholder="색상 검색..."
              value={colorSearchText}
              onChange={(e) => setColorSearchText(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* 커스텀 색상 선택기 */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                sx={{ mb: 1 }}
              >
                커스텀 색상 선택
              </Button>
              {showBackgroundPicker && (
                <Box sx={{ mt: 1 }}>
                  <HexColorPicker
                    color={customBackgroundColor}
                    onChange={handleCustomBackgroundColorChange}
                  />
                </Box>
              )}
            </Box>

            {/* 미리 정의된 색상들 */}
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {getFilteredColorCategories().map((category, categoryIndex) => (
                <Box key={categoryIndex} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {category.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {category.colors.map((color, colorIndex) => (
                      <Tooltip key={colorIndex} title={color.name} arrow>
                        <Box
                          onClick={() => handleColorSelect(color.backgroundColor, color.borderColor)}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: color.backgroundColor,
                            border: `2px solid ${color.borderColor}`,
                            cursor: 'pointer',
                            boxShadow: currentLevel.backgroundColor === color.backgroundColor ? '0 0 0 3px rgba(0,0,0,0.3)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color.borderColor,
                            fontSize: '14px',
                            fontWeight: 400,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 0 0 2px rgba(0,0,0,0.2)'
                            }
                          }}
                        >
                          {currentLevel.backgroundColor === color.backgroundColor && '✓'}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              ))}
              
              {getFilteredColorCategories().length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                  검색 결과가 없습니다.
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                미리보기:
              </Typography>
              <Chip
                label={currentLevel.levelType || '단계 이름'}
                sx={{
                  backgroundColor: currentLevel.backgroundColor || '#e8f5e9',
                  color: currentLevel.borderColor || '#2e7d32',
                  border: `1px solid ${currentLevel.borderColor || '#2e7d32'}`,
                  fontWeight: 400,
                  borderRadius: '50px',
                  padding: '0 8px',
                  height: '28px',
                  fontSize: '0.8rem'
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button onClick={onSave} color="primary" variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AgentLevelDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  editMode: PropTypes.bool.isRequired,
  currentLevel: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  availablePermissions: PropTypes.array,
  totalCount: PropTypes.number
};

export default AgentLevelDialog; 