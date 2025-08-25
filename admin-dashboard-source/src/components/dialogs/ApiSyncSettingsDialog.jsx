import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import apiService from '../../services/api';

const ApiSyncSettingsDialog = ({ open, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiSyncEnabled, setApiSyncEnabled] = useState(false);
  const [apiSyncLevel, setApiSyncLevel] = useState(0);
  const [syncedMembersCount, setSyncedMembersCount] = useState(0);
  const [error, setError] = useState(null);

  // API 연동 설정 조회
  useEffect(() => {
    if (open) {
      fetchApiSyncSettings();
    }
  }, [open]);

  const fetchApiSyncSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.systemSettings.getApiSync();
      if (response.data.success) {
        const level = response.data.data.apiSyncLevel;
        setApiSyncLevel(level);
        setApiSyncEnabled(level > 0);
        setSyncedMembersCount(response.data.data.syncedMembersCount || 0);
      }
    } catch (error) {
      console.error('API 연동 설정 조회 실패:', error);
      setError('API 연동 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // API 연동 ON/OFF 토글
  const handleToggleApiSync = (event) => {
    const enabled = event.target.checked;
    setApiSyncEnabled(enabled);
    if (!enabled) {
      setApiSyncLevel(0);
    } else if (apiSyncLevel === 0) {
      setApiSyncLevel(1); // 기본값 1단계
    }
  };

  // API 연동 레벨 변경
  const handleLevelChange = (event) => {
    setApiSyncLevel(parseInt(event.target.value));
  };

  // 설정 저장
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const level = apiSyncEnabled ? apiSyncLevel : 0;
      
      // 연동 활성화 시 안내 메시지
      if (level > 0) {
        alert('API 연동을 설정하는 중입니다. 외부 API에서 잔액을 가져와 동기화합니다.\n이 작업은 시간이 걸릴 수 있습니다.');
      }
      
      const response = await apiService.systemSettings.setApiSyncLevel(level);
      
      if (response.data.success) {
        if (level > 0) {
          alert(`API 연동이 완료되었습니다.\n연동된 회원들의 보유금이 외부 API 잔액으로 동기화되었습니다.`);
        } else {
          alert('API 연동이 해제되었습니다.');
        }
        onClose();
      } else {
        throw new Error(response.data.message || '설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 연동 설정 저장 실패:', error);
      setError(error.response?.data?.message || error.message || 'API 연동 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        API 잔액 연동 설정
        <Typography variant="caption" display="block" color="text.secondary">
          최상위 레벨 전용 기능
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={apiSyncEnabled}
                    onChange={handleToggleApiSync}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      API 잔액 연동
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      외부 API와 잔액을 실시간으로 동기화합니다
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {apiSyncEnabled && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    연동 레벨 선택
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={apiSyncLevel}
                      onChange={handleLevelChange}
                    >
                      <FormControlLabel
                        value={1}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2">
                              1단계만 연동
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              최상위 레벨(슈퍼201)만 API와 연동됩니다
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value={2}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2">
                              2단계까지 연동
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              1단계와 2단계(대본23) 모두 API와 연동됩니다
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    연동 시 주의사항
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • API 연동된 회원은 자기 자신에게 지급/회수가 불가능합니다
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • API 연동된 회원 간에는 머니 이동이 불가능합니다
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • 보유금은 외부 API의 잔액과 동기화됩니다
                  </Typography>
                  <Typography variant="body2">
                    • 롤링 퍼센트는 여전히 100%까지 설정 가능합니다
                  </Typography>
                </Box>
              </>
            )}

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                현재 API 연동된 회원:
              </Typography>
              <Chip 
                label={`${syncedMembersCount}명`} 
                size="small" 
                color={syncedMembersCount > 0 ? "primary" : "default"}
              />
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || saving}
        >
          {saving ? '동기화 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiSyncSettingsDialog;