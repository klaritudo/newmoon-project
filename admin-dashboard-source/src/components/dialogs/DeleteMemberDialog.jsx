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

const DeleteMemberDialog = ({ 
  open, 
  onClose, 
  memberData,
  onConfirm,
  preventDeleteEnabled = true // 삭제 방지 기능 ON/OFF
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [childCount, setChildCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [upperMember, setUpperMember] = useState(null);
  const [siblingMembers, setSiblingMembers] = useState([]);

  // 해당 회원의 하위 회원 수 조회
  useEffect(() => {
    if (open && memberData) {
      fetchChildCount();
      fetchRelatedMembers();
    }
  }, [open, memberData]);

  const fetchChildCount = async () => {
    try {
      const response = await apiService.members.getChildren(memberData.id);
      setChildCount(response.data?.count || 0);
    } catch (error) {
      console.error('하위 회원 수 조회 실패:', error);
      setChildCount(0);
    }
  };

  const fetchRelatedMembers = async () => {
    try {
      const response = await apiService.members.getAll();
      const allMembers = response.data?.data || [];
      
      // 상위 회원 찾기
      const parent = allMembers.find(m => m.id === memberData.parent_id);
      setUpperMember(parent);
      
      // 같은 레벨의 다른 회원들 찾기
      const siblings = allMembers.filter(m => 
        m.agent_level_id === memberData.agent_level_id && 
        m.id !== memberData.id
      );
      setSiblingMembers(siblings);
    } catch (error) {
      console.error('관련 회원 조회 실패:', error);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOption) {
      alert('처리 옵션을 선택해주세요.');
      return;
    }

    if (selectedOption === '4' && preventDeleteEnabled && childCount > 0) {
      alert('하위 회원이 있는 회원은 삭제할 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(memberData.id, selectedOption, {
        upperMemberId: upperMember?.id,
        siblingMemberIds: siblingMembers.map(s => s.id)
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
    setChildCount(0);
    setUpperMember(null);
    setSiblingMembers([]);
    onClose();
  };

  const getOptionLabel = (option) => {
    switch (option) {
      case '1':
        return `상위 회원으로 이동${upperMember ? ` (${upperMember.username})` : ''}`;
      case '2':
        return `같은 레벨 회원으로 분산${siblingMembers.length > 0 ? ` (${siblingMembers.length}명)` : ''}`;
      case '3':
        return '수동으로 재배치';
      case '4':
        return '삭제 방지';
      case '5':
        return '하부 회원 모두 삭제';
      default:
        return '';
    }
  };

  const isOptionDisabled = (option) => {
    switch (option) {
      case '1':
        return !upperMember;
      case '2':
        return siblingMembers.length === 0;
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
            {memberData?.username} 회원 삭제
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          이 회원에는 <strong>{childCount}명</strong>의 하위 회원이 있습니다.
        </Alert>

        {childCount > 0 && (
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
                  disabled={isOptionDisabled('1')}
                />
                <FormControlLabel
                  value="2"
                  control={<Radio />}
                  label={getOptionLabel('2')}
                  disabled={isOptionDisabled('2')}
                />
                <FormControlLabel
                  value="3"
                  control={<Radio />}
                  label={getOptionLabel('3')}
                  disabled={isOptionDisabled('3')}
                />
                {preventDeleteEnabled && (
                  <FormControlLabel
                    value="4"
                    control={<Radio />}
                    label={getOptionLabel('4')}
                    disabled={isOptionDisabled('4')}
                  />
                )}
                <FormControlLabel
                  value="5"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography color="error">
                        {getOptionLabel('5')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        주의: 이 옵션은 되돌릴 수 없습니다.
                      </Typography>
                    </Box>
                  }
                  disabled={isOptionDisabled('5')}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {childCount === 0 && (
          <Typography>
            하위 회원이 없는 회원입니다. 삭제하시겠습니까?
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
          disabled={loading || (childCount > 0 && !selectedOption)}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? '처리 중...' : '삭제'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMemberDialog;