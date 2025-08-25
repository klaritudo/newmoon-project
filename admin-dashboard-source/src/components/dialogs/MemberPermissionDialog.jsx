import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  Switch,
  Chip
} from '@mui/material';
import { Security } from '@mui/icons-material';
import apiService from '../../services/api';

const MemberPermissionDialog = ({ 
  open, 
  onClose, 
  member,
  onPermissionUpdate 
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [hasOverride, setHasOverride] = useState(false);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  
  // 메뉴 및 버튼 옵션
  const menuOptions = [
    '회원관리', '머니이동내역', '롤링내역', '베팅내역', 
    '정산', '게임설정', '사이트설정', '시스템설정'
  ];
  
  const buttonOptions = [
    '조회', '추가', '수정', '삭제', '엑셀다운로드', 
    '머니이동', '롤링처리', '권한변경'
  ];
  
  const featureOptions = [
    '잔액확인', '베팅조회', '정산조회', '게임실행', 
    '보고서열람', '시스템모니터링'
  ];

  // 권한 정보 로드
  useEffect(() => {
    if (open && member?.id) {
      loadPermissions();
    }
  }, [open, member?.id]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.permissions.getMemberPermissions(member.id);
      
      if (response.data?.data) {
        const data = response.data.data;
        setPermissions(data.effectivePermissions);
        setHasOverride(data.hasOverride);
        setUseCustomPermissions(data.hasOverride);
      }
    } catch (error) {
      console.error('권한 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 권한 변경 핸들러
  const handlePermissionChange = (category, item, checked) => {
    setPermissions(prev => ({
      ...prev,
      [category]: checked 
        ? [...(prev[category] || []), item]
        : (prev[category] || []).filter(p => p !== item)
    }));
  };

  // 제한사항 변경 핸들러
  const handleRestrictionChange = (category, item, checked) => {
    setPermissions(prev => ({
      ...prev,
      restrictions: {
        ...prev.restrictions,
        [category]: checked
          ? [...(prev.restrictions?.[category] || []), item]
          : (prev.restrictions?.[category] || []).filter(r => r !== item)
      }
    }));
  };

  // 커스텀 권한 사용 토글
  const handleToggleCustom = (event) => {
    setUseCustomPermissions(event.target.checked);
    if (!event.target.checked) {
      // 기본 권한으로 복원
      loadPermissions();
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (useCustomPermissions) {
        // 커스텀 권한 저장
        await apiService.permissions.updateMemberPermissions(member.id, permissions);
      } else {
        // 권한 오버라이드 제거 (기본값으로 복원)
        await apiService.permissions.updateMemberPermissions(member.id, null);
      }
      
      if (onPermissionUpdate) {
        onPermissionUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error('권한 저장 실패:', error);
      alert('권한 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 모든 권한 체크/해제
  const handleSelectAll = (category, checked) => {
    const options = category === 'menus' ? menuOptions :
                   category === 'buttons' ? buttonOptions :
                   category === 'features' ? featureOptions : [];
    
    setPermissions(prev => ({
      ...prev,
      [category]: checked ? [...options] : []
    }));
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          <Typography variant="h6">권한 설정</Typography>
          <Chip 
            label={member?.userId || member?.username} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* 커스텀 권한 사용 스위치 */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={useCustomPermissions} 
                onChange={handleToggleCustom}
              />
            }
            label="개별 권한 설정 사용"
          />
          {!useCustomPermissions && (
            <Alert severity="info" sx={{ mt: 1 }}>
              현재 단계({member?.agent_level_name || member?.level_name})의 기본 권한을 사용합니다.
            </Alert>
          )}
        </Box>

        {useCustomPermissions && permissions && (
          <>
            {/* 메뉴 권한 */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">메뉴 접근 권한</Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={permissions.menus?.length === menuOptions.length}
                      onChange={(e) => handleSelectAll('menus', e.target.checked)}
                    />
                  }
                  label="전체 선택"
                />
              </Box>
              <FormGroup row>
                {menuOptions.map(menu => (
                  <FormControlLabel
                    key={menu}
                    control={
                      <Checkbox
                        checked={permissions.menus?.includes(menu) || false}
                        onChange={(e) => handlePermissionChange('menus', menu, e.target.checked)}
                      />
                    }
                    label={menu}
                    sx={{ width: '25%' }}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 버튼 권한 */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">버튼/기능 권한</Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={permissions.buttons?.length === buttonOptions.length}
                      onChange={(e) => handleSelectAll('buttons', e.target.checked)}
                    />
                  }
                  label="전체 선택"
                />
              </Box>
              <FormGroup row>
                {buttonOptions.map(button => (
                  <FormControlLabel
                    key={button}
                    control={
                      <Checkbox
                        checked={permissions.buttons?.includes(button) || false}
                        onChange={(e) => handlePermissionChange('buttons', button, e.target.checked)}
                      />
                    }
                    label={button}
                    sx={{ width: '25%' }}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 기능 권한 */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">기능 권한</Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={permissions.features?.length === featureOptions.length}
                      onChange={(e) => handleSelectAll('features', e.target.checked)}
                    />
                  }
                  label="전체 선택"
                />
              </Box>
              <FormGroup row>
                {featureOptions.map(feature => (
                  <FormControlLabel
                    key={feature}
                    control={
                      <Checkbox
                        checked={permissions.features?.includes(feature) || false}
                        onChange={(e) => handlePermissionChange('features', feature, e.target.checked)}
                      />
                    }
                    label={feature}
                    sx={{ width: '33%' }}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 제한사항 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                추가 제한사항 (체크된 항목은 사용 불가)
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                위에서 허용한 권한 중에서 추가로 제한할 항목을 선택하세요.
              </Alert>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>메뉴 제한</Typography>
              <FormGroup row sx={{ mb: 2 }}>
                {permissions.menus?.map(menu => (
                  <FormControlLabel
                    key={menu}
                    control={
                      <Checkbox
                        checked={permissions.restrictions?.menus?.includes(menu) || false}
                        onChange={(e) => handleRestrictionChange('menus', menu, e.target.checked)}
                      />
                    }
                    label={menu}
                    sx={{ width: '25%' }}
                  />
                ))}
              </FormGroup>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>버튼 제한</Typography>
              <FormGroup row>
                {permissions.buttons?.map(button => (
                  <FormControlLabel
                    key={button}
                    control={
                      <Checkbox
                        checked={permissions.restrictions?.buttons?.includes(button) || false}
                        onChange={(e) => handleRestrictionChange('buttons', button, e.target.checked)}
                      />
                    }
                    label={button}
                    sx={{ width: '25%' }}
                  />
                ))}
              </FormGroup>
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberPermissionDialog;