import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';

/**
 * 삭제 확인 다이얼로그 컴포넌트 (2단계 확인)
 */
const DeleteConfirmDialog = ({
  open,
  title = '삭제 확인',
  itemName,
  itemType = '항목',
  onConfirm,
  onCancel
}) => {
  const [step, setStep] = useState(1); // 1: 첫 번째 확인, 2: 두 번째 확인

  // 다이얼로그가 열릴 때마다 첫 번째 단계로 초기화
  React.useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    setStep(1);
    onConfirm();
  };

  const handleCancel = () => {
    setStep(1);
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 1 ? title : '최종 삭제 확인'}
      </DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <Box>
            {/* 경고 문구 */}
            <Alert severity="error" sx={{ mb: 3, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '14px',
                  color: '#d32f2f'
                }}
              >
                * 단계 삭제 및 수정 시 일부 데이터가 변형되거나 삭제가 될 수 있으니 신중해 주세요.
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#d32f2f'
                }}
              >
                * 절대 되돌릴 수 없습니다.
              </Typography>
            </Alert>

            <Typography>
              정말로 "<strong>{itemName}</strong>" {itemType}을(를) 삭제하시겠습니까?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              삭제된 {itemType}은(는) 복구할 수 없습니다.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  color: '#e65100'
                }}
              >
                ⚠️ 마지막 확인
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#e65100'
                }}
              >
                이 작업은 되돌릴 수 없습니다!
              </Typography>
            </Alert>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              정말로 "<strong style={{ color: '#d32f2f' }}>{itemName}</strong>" {itemType}을(를) 
              <span style={{ color: '#d32f2f' }}> 영구적으로 삭제</span>하시겠습니까?
            </Typography>
            
            <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 500 }}>
              ✓ 관련된 모든 데이터가 삭제됩니다<br/>
              ✓ 이 작업은 취소할 수 없습니다<br/>
              ✓ 백업이 없다면 복구가 불가능합니다
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          취소
        </Button>
        {step === 1 ? (
          <Button onClick={handleFirstConfirm} color="warning" variant="contained">
            계속 진행
          </Button>
        ) : (
          <Button onClick={handleFinalConfirm} color="error" variant="contained">
            최종 삭제
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

DeleteConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  itemName: PropTypes.string.isRequired,
  itemType: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default DeleteConfirmDialog; 