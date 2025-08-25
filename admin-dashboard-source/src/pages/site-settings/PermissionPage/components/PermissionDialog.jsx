import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography
} from '@mui/material';
import PermissionSettingsTabs from './PermissionSettingsTabs';

/**
 * 권한 추가/수정 다이얼로그 컴포넌트
 */
const PermissionDialog = ({
  open,
  editMode,
  currentPermission,
  onClose,
  onSave,
  onInputChange
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  // 권한 제한사항 변경 핸들러
  const handleRestrictionsChange = (newRestrictions) => {
    onInputChange({
      target: {
        name: 'restrictions',
        value: newRestrictions
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editMode ? '권한 수정' : '권한 추가'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
            <TextField
            autoFocus
            margin="dense"
              name="permissionName"
              label="권한명"
            type="text"
            fullWidth
              value={currentPermission.permissionName || ''}
              onChange={onInputChange}
            />

            <TextField
            margin="dense"
              name="description"
              label="설명"
            type="text"
              fullWidth
              multiline
              rows={3}
            value={currentPermission.description || ''}
                onChange={onInputChange}
          />

            {/* 활성 상태 */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  활성 상태
                </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                  checked={currentPermission.isActive === 1 || currentPermission.isActive === true}
                    onChange={(e) => onInputChange({
                      target: {
                        name: 'isActive',
                        value: e.target.checked
                      }
                    })}
                    color="primary"
                  />
                }
              label={currentPermission.isActive === 1 || currentPermission.isActive === true ? "활성" : "비활성"}
              sx={{ ml: 0 }}
            />
          </Box>

          {/* 권한 설정 탭 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              권한 설정
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              이 권한을 가진 사용자가 접근할 수 없는 메뉴, 버튼, UI 요소를 설정합니다.
            </Typography>
            
            <PermissionSettingsTabs
              restrictions={currentPermission.restrictions || { menus: [], buttons: [], layouts: [], cssSelectors: [] }}
              onRestrictionsChange={handleRestrictionsChange}
              />
            </Box>
          </Box>
        </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
            취소
          </Button>
        <Button onClick={onSave} color="primary" variant="contained">
          저장
          </Button>
        </DialogActions>
    </Dialog>
  );
};

PermissionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  editMode: PropTypes.bool.isRequired,
  currentPermission: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default PermissionDialog;