import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import apiService from '../../services/api';

const DeleteLevelDialog = ({ 
  open, 
  onClose, 
  levelData,
  onConfirm,
  preventDeleteEnabled = true // 삭제 방지 기능 ON/OFF
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [upperLevel, setUpperLevel] = useState(null);
  const [lowerLevel, setLowerLevel] = useState(null);

  // 해당 단계의 회원 수 조회
  useEffect(() => {
    if (open && levelData) {
      fetchMemberCount();
      fetchAdjacentLevels();
    }
  }, [open, levelData]);

  const fetchMemberCount = async () => {
    try {
      const response = await apiService.members.getByLevel(levelData.id);
      setMemberCount(response.data?.data?.count || 0);
    } catch (error) {
      console.error('회원 수 조회 실패:', error);
      setMemberCount(0);
    }
  };

  const fetchAdjacentLevels = async () => {
    try {
      const response = await apiService.agentLevels.getAll();
      const levels = response.data?.data || [];
      const sortedLevels = levels.sort((a, b) => a.level - b.level);
      
      const currentIndex = sortedLevels.findIndex(l => l.id === levelData.id);
      
      if (currentIndex > 0) {
        setUpperLevel(sortedLevels[currentIndex - 1]);
      }
      if (currentIndex < sortedLevels.length - 1) {
        setLowerLevel(sortedLevels[currentIndex + 1]);
      }
    } catch (error) {
      console.error('인접 레벨 조회 실패:', error);
    }
  };

  const handleConfirm = async () => {
    if (memberCount > 0 && !selectedOption) {
      alert('처리 옵션을 선택해주세요.');
      return;
    }

    if (selectedOption === '1' && memberCount > 0) {
      alert('회원이 있는 단계는 삭제할 수 없습니다.');
      return;
    }
    
    // "하위 회원 모두 삭제" 선택 시 추가 확인
    if (selectedOption === '2') {
      const confirmMessage = `정말로 "${levelData?.name}" 단계의 모든 회원(${memberCount}명)과 그 하위 회원들을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      // 두 번째 확인
      const secondConfirm = window.confirm('마지막 확인: 정말로 모든 회원을 삭제하시겠습니까?');
      if (!secondConfirm) {
        return;
      }
    }

    setLoading(true);
    try {
      await onConfirm(levelData.id, selectedOption, {
        upperLevelId: upperLevel?.id,
        lowerLevelId: lowerLevel?.id
      });
      handleClose();
    } catch (error) {
      console.error('삭제 처리 실패:', error);
      alert('삭제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOption('');
    setMemberCount(0);
    setUpperLevel(null);
    setLowerLevel(null);
    onClose();
  };

  const getOptionLabel = (option) => {
    switch (option) {
      case '1':
        return '삭제 방지 (회원이 있으면 삭제 불가)';
      case '2':
        return '하부 회원 모두 삭제 (주의: 되돌릴 수 없음)';
      default:
        return '';
    }
  };

  const isOptionDisabled = (option) => {
    switch (option) {
      case '1':
        return !upperLevel;
      case '2':
        return !lowerLevel;
      case '4':
        return !preventDeleteEnabled;
      default:
        return false;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmberIcon color="warning" />
          <Typography variant="h6">
            {levelData?.name} 단계 삭제
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          이 단계에는 <strong>{memberCount}명</strong>의 회원이 있습니다.
        </Alert>

        {memberCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              삭제 처리 옵션을 선택하세요:
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label={getOptionLabel('1')}
                />
                <FormControlLabel
                  value="2"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography color="error">
                        {getOptionLabel('2')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        이 단계의 모든 회원과 하위 회원들이 삭제됩니다.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {memberCount === 0 && (
          <Typography>
            회원이 없는 단계입니다. 삭제하시겠습니까?
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          취소
        </Button>
        <Button 
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading || (memberCount > 0 && !selectedOption)}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? '처리 중...' : '삭제'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLevelDialog;