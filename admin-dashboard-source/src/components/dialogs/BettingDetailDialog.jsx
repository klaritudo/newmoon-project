import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * 베팅 상세정보 다이얼로그
 * @param {Object} props
 * @param {boolean} props.open - 다이얼로그 열림 상태
 * @param {Function} props.onClose - 다이얼로그 닫기 핸들러
 * @param {Object} props.bettingData - 베팅 상세 데이터
 */
const BettingDetailDialog = ({
  open,
  onClose,
  bettingData
}) => {
  const theme = useTheme();

  if (!bettingData) {
    return null;
  }

  const formatAmount = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString() : '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}
      >
        <Typography variant="h6" component="h2">
          베팅 상세정보
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.grey[500],
            '&:hover': {
              color: theme.palette.grey[700]
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={3}>
          {/* 기본정보 */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  기본정보
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Transaction ID
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.basicInfo?.transId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Link Transaction ID
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.basicInfo?.linkTransId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      게임 ID
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.basicInfo?.gameId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      라운드 ID
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.basicInfo?.roundId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      테이블 ID
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.basicInfo?.tableId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      게임 결과
                    </Typography>
                    <Chip
                      label={bettingData.basicInfo?.gameResult || '-'}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 회원정보 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  회원정보
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      아이디
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.memberInfo?.username || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      닉네임
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.memberInfo?.nickname || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      IP 주소
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.memberInfo?.ip || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      접속 기기
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.memberInfo?.device || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 베팅정보 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  베팅정보
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      베팅일시
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(bettingData.bettingDetails?.bettingTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      처리일시
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(bettingData.bettingDetails?.processTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      게임유형
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.bettingDetails?.gameType || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      게임사
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.bettingDetails?.gameCompany || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      게임명
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.bettingDetails?.gameName || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      베팅섹션
                    </Typography>
                    <Chip
                      label={bettingData.bettingDetails?.bettingSection || '-'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 금액정보 */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  금액정보
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        베팅 전 금액
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatAmount(bettingData.bettingDetails?.beforeAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
                      <Typography variant="caption" gutterBottom sx={{ opacity: 0.9 }}>
                        베팅금액
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatAmount(bettingData.bettingDetails?.betAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
                      <Typography variant="caption" gutterBottom sx={{ opacity: 0.9 }}>
                        당첨금액
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatAmount(bettingData.bettingDetails?.winAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        베팅 후 금액
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatAmount(bettingData.bettingDetails?.afterAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      배당률
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bettingData.bettingDetails?.odds || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      수수료
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatAmount(bettingData.bettingDetails?.commission)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 게임 상세정보 (바카라인 경우) */}
          {bettingData.gameDetails && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    게임 상세정보
                  </Typography>
                  {bettingData.gameDetails.cards && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          플레이어 카드
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {bettingData.gameDetails.cards.player?.map((card, index) => (
                            <Chip
                              key={index}
                              label={card}
                              size="small"
                              sx={{ 
                                bgcolor: 'grey.100',
                                fontFamily: 'monospace',
                                fontSize: '14px'
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          뱅커 카드
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {bettingData.gameDetails.cards.banker?.map((card, index) => (
                            <Chip
                              key={index}
                              label={card}
                              size="small"
                              sx={{ 
                                bgcolor: 'grey.100',
                                fontFamily: 'monospace',
                                fontSize: '14px'
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          게임 결과
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {bettingData.gameDetails.result} 
                          {bettingData.gameDetails.natural && ' (Natural)'}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="contained" color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BettingDetailDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bettingData: PropTypes.object
};

export default BettingDetailDialog; 