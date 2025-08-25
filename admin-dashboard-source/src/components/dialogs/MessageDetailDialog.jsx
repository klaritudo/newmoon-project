import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  TextField,
  IconButton,
  Paper
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';

/**
 * 문의 상세 정보 다이얼로그
 * 문의 내용을 조회하고 답변을 작성할 수 있는 다이얼로그입니다.
 */
const MessageDetailDialog = ({ 
  open, 
  onClose, 
  message, 
  onStatusChange,
  onReply 
}) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // 답변 작성 모드 토글
  const handleToggleReply = useCallback(() => {
    setIsReplying(!isReplying);
    if (!isReplying) {
      setReplyText('');
    }
  }, [isReplying]);

  // 답변 전송
  const handleSendReply = useCallback(() => {
    if (!replyText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    const replyData = {
      messageId: message?.id,
      content: replyText,
      timestamp: new Date().toISOString()
    };

    onReply?.(replyData);
    setReplyText('');
    setIsReplying(false);
    
    // 상태를 '회신완료'로 변경
    onStatusChange?.(message?.id, 'replied');
  }, [message?.id, replyText, onReply, onStatusChange]);

  // 상태 변경 핸들러
  const handleStatusChange = useCallback((newStatus) => {
    onStatusChange?.(message?.id, newStatus);
  }, [message?.id, onStatusChange]);

  // 다이얼로그 닫기
  const handleClose = useCallback(() => {
    setIsReplying(false);
    setReplyText('');
    onClose();
  }, [onClose]);

  if (!message) {
    return null;
  }

  // 상태별 색상 매핑
  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'error';
      case 'read': return 'primary';
      case 'pending': return 'warning';
      case 'replied': return 'success';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          문의 상세 정보
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 문의 기본 정보 */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    작성자
                  </Typography>
                  <Typography variant="body1">
                    {message.username} ({message.nickname})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    회원 유형
                  </Typography>
                  <Chip
                    label={message.memberType?.label || '일반'}
                    color={message.memberType?.color || 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    등록일
                  </Typography>
                  <Typography variant="body1">
                    {message.createdDate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    읽은일
                  </Typography>
                  <Typography variant="body1">
                    {message.readDate || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    현재 상태
                  </Typography>
                  <Chip
                    label={message.status?.label || '미읽음'}
                    color={getStatusColor(message.status?.label)}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                {message.superAgent && message.superAgent.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      상위에이전트
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.superAgent.map((agent, index) => (
                        <Chip
                          key={index}
                          label={agent.label}
                          color={agent.color || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* 문의 제목 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              제목
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {message.title}
            </Typography>
          </Grid>

          {/* 문의 내용 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              내용
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                minHeight: '200px'
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6 
                }}
              >
                {message.content}
              </Typography>
            </Paper>
          </Grid>

          {/* 상태 변경 버튼들 */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              상태 변경
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => handleStatusChange('pending')}
                disabled={message.status?.label === '대기'}
              >
                대기로 변경
              </Button>
              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={() => handleStatusChange('read')}
                disabled={message.status?.label === '읽음'}
              >
                읽음으로 변경
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="small"
                onClick={() => handleStatusChange('completed')}
                disabled={message.status?.label === '완료'}
              >
                완료로 변경
              </Button>
            </Box>
          </Grid>

          {/* 답변 섹션 */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                답변 작성
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleToggleReply}
              >
                {isReplying ? '취소' : '답변하기'}
              </Button>
            </Box>

            {isReplying && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="답변 내용을 입력하세요..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleToggleReply}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                  >
                    답변 전송
                  </Button>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDetailDialog; 