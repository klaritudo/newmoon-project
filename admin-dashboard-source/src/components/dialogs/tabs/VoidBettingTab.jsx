import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Button,
  Tooltip
} from '@mui/material';
import { 
  Info,
  Visibility,
  TrendingDown,
  Block 
} from '@mui/icons-material';

const VoidBettingTab = ({ 
  editedMember, 
  handleInputChange, 
  handleNestedInputChange 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 샘플 하위 회원 데이터 생성 (실제로는 API에서 가져와야 함)
  const generateChildMembers = () => {
    return [
      { 
        id: 'child1', 
        username: 'agent001', 
        nickname: '대리점A', 
        levelName: '대리점', 
        level: 2,
        hasVoidBetting: true,
        voidBettingSettings: {
          slot: { enabled: true, percentage: 15, type: 'individual' },
          casino: { enabled: false }
        }
      },
      { 
        id: 'child2', 
        username: 'agent002', 
        nickname: '대리점B', 
        levelName: '대리점', 
        level: 2,
        hasVoidBetting: false,
        voidBettingSettings: null
      },
      { 
        id: 'child3', 
        username: 'dist001', 
        nickname: '총판A', 
        levelName: '총판', 
        level: 3,
        hasVoidBetting: true,
        voidBettingSettings: {
          slot: { enabled: true, percentage: 10, type: 'group' },
          casino: { enabled: true, percentage: 20, type: 'individual' }
        }
      },
      { 
        id: 'child4', 
        username: 'dist002', 
        nickname: '총판B', 
        levelName: '총판', 
        level: 3,
        hasVoidBetting: false,
        voidBettingSettings: null
      },
      { 
        id: 'child5', 
        username: 'user001', 
        nickname: '회원A', 
        levelName: '회원', 
        level: 4,
        hasVoidBetting: true,
        voidBettingSettings: {
          slot: { enabled: true, percentage: 5, type: 'individual' },
          casino: { enabled: false }
        }
      },
      { 
        id: 'child6', 
        username: 'user002', 
        nickname: '회원B', 
        levelName: '회원', 
        level: 4,
        hasVoidBetting: false,
        voidBettingSettings: null
      },
    ];
  };

  const childMembers = generateChildMembers();

  // 샘플 공베팅 내역 데이터
  const generateVoidBettingData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push({
        id: i + 1,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        gameType: Math.random() > 0.5 ? '슬롯' : '카지노',
        gameProvider: ['프라그마틱', '에볼루션', '마이크로게이밍', '넷엔트', 'PG소프트'][Math.floor(Math.random() * 5)],
        gameName: ['Sweet Bonanza', 'Gates of Olympus', 'Baccarat', 'Roulette', 'Blackjack'][Math.floor(Math.random() * 5)],
        originalBetAmount: Math.floor(Math.random() * 100000) + 10000,
        voidedAmount: Math.floor(Math.random() * 50000) + 5000,
        voidedPercentage: Math.floor(Math.random() * 50) + 10,
        rollingLoss: Math.floor(Math.random() * 10000) + 1000,
        type: ['그룹', '개별'][Math.floor(Math.random() * 2)],
        reason: ['그룹 설정 적용', '개별 설정 적용'][Math.floor(Math.random() * 2)],
        status: '완료'
      });
    }
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const voidBettingData = generateVoidBettingData();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 공베팅 통계 계산
  const calculateStats = () => {
    const totalVoidedAmount = voidBettingData.reduce((sum, item) => sum + item.voidedAmount, 0);
    const totalRollingLoss = voidBettingData.reduce((sum, item) => sum + item.rollingLoss, 0);
    const slotVoidCount = voidBettingData.filter(item => item.gameType === '슬롯').length;
    const casinoVoidCount = voidBettingData.filter(item => item.gameType === '카지노').length;
    
    return {
      totalVoidedAmount,
      totalRollingLoss,
      slotVoidCount,
      casinoVoidCount,
      totalCount: voidBettingData.length
    };
  };

  const stats = calculateStats();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>공베팅 설정</Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          공베팅은 베팅을 무효화하여 롤링금을 의도적으로 누락시키는 관리 기능입니다.
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          • <strong>그룹 설정</strong>: 선택한 회원 및 하위 회원들에게 일괄 적용 (최대 3단계)<br/>
          • <strong>개별 설정</strong>: 각 회원별로 독립적인 공베팅 조건 설정<br/>
          • <strong>수동 처리</strong>: 베팅상세내역에서 직접 무효화 가능 (별도 상시 활성화)
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* 슬롯 공베팅 설정 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>슬롯 공베팅</Typography>
              <Chip 
                label="SLOT" 
                color="primary" 
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedMember?.voidBetting?.slot?.enabled || false}
                      onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                        ...editedMember?.voidBetting?.slot,
                        enabled: e.target.checked
                      })}
                    />
                  }
                  label="슬롯 공베팅 활성화"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>공베팅 유형</InputLabel>
                  <Select
                    value={editedMember?.voidBetting?.slot?.type || 'individual'}
                    label="공베팅 유형"
                    onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                      ...editedMember?.voidBetting?.slot,
                      type: e.target.value
                    })}
                    disabled={!editedMember?.voidBetting?.slot?.enabled}
                  >
                    <MenuItem value="group">그룹 설정</MenuItem>
                    <MenuItem value="individual">개별 설정</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="공베팅 비율"
                  value={editedMember?.voidBetting?.slot?.percentage || '0'}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  disabled={!editedMember?.voidBetting?.slot?.enabled}
                  onFocus={(e) => {
                    if (editedMember?.voidBetting?.slot?.percentage === '0') {
                      handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                        ...editedMember?.voidBetting?.slot,
                        percentage: ''
                      });
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    if (parseFloat(value) <= 100 || value === '') {
                      handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                        ...editedMember?.voidBetting?.slot,
                        percentage: value
                      });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                        ...editedMember?.voidBetting?.slot,
                        percentage: '0'
                      });
                    }
                  }}
                  helperText="베팅 중 무효화할 비율을 설정합니다."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="최소 베팅금액"
                  value={editedMember?.voidBetting?.slot?.minBetAmount || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">원</InputAdornment>,
                  }}
                  disabled={!editedMember?.voidBetting?.slot?.enabled}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                      ...editedMember?.voidBetting?.slot,
                      minBetAmount: value
                    });
                  }}
                  helperText="이 금액 이상의 베팅에만 공베팅이 적용됩니다."
                />
              </Grid>

              {/* 그룹 설정 */}
              {editedMember?.voidBetting?.slot?.type === 'group' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                      그룹 공베팅 설정 (최대 3단계)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>적용 대상 선택</InputLabel>
                      <Select
                        value={editedMember?.voidBetting?.slot?.groupSettings?.selectedMember || ''}
                        label="적용 대상 선택"
                        onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                          ...editedMember?.voidBetting?.slot,
                          groupSettings: {
                            ...editedMember?.voidBetting?.slot?.groupSettings,
                            selectedMember: e.target.value
                          }
                        })}
                      >
                        <MenuItem value="self">
                          자신 ({editedMember?.username || 'N/A'} / {editedMember?.nickname || 'N/A'} / {editedMember?.levelName || 'N/A'})
                        </MenuItem>
                        {childMembers.map((child) => (
                          <MenuItem key={child.id} value={child.id}>
                            {child.username} ({child.nickname}) / {child.levelName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      선택한 회원의 하위 모든 회원에게 동일한 공베팅 설정이 일괄 적용됩니다.
                      설정 권한 범위는 공베팅을 설정할 수 있는 계층 권한을 의미합니다.
                    </Alert>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="설정 권한 범위 (단계)"
                      type="number"
                      value={editedMember?.voidBetting?.slot?.groupSettings?.maxDepth || 3}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        inputProps: { min: 1, max: 3 },
                        endAdornment: <InputAdornment position="end">단계</InputAdornment>,
                      }}
                      onChange={(e) => {
                        const value = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
                        handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                          ...editedMember?.voidBetting?.slot,
                          groupSettings: {
                            ...editedMember?.voidBetting?.slot?.groupSettings,
                            maxDepth: value
                          }
                        });
                      }}
                      helperText="공베팅을 설정할 수 있는 권한 범위 (최대 3단계)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedMember?.voidBetting?.slot?.groupSettings?.inheritSettings || true}
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                            ...editedMember?.voidBetting?.slot,
                            groupSettings: {
                              ...editedMember?.voidBetting?.slot?.groupSettings,
                              inheritSettings: e.target.checked
                            }
                          })}
                        />
                      }
                      label="하위 회원 설정 상속"
                      sx={{ mt: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedMember?.voidBetting?.slot?.groupSettings?.onlyLosing || false}
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                            ...editedMember?.voidBetting?.slot,
                            groupSettings: {
                              ...editedMember?.voidBetting?.slot?.groupSettings,
                              onlyLosing: e.target.checked
                            }
                          })}
                        />
                      }
                      label="패배 베팅에만 적용"
                    />
                  </Grid>
                </>
              )}

              {/* 개별 설정 */}
              {editedMember?.voidBetting?.slot?.type === 'individual' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                      개별 공베팅 설정
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info">
                      상위 회원이 하위 회원들을 개별적으로 설정할 수 있습니다.
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>설정할 회원 선택</InputLabel>
                      <Select
                        value={editedMember?.voidBetting?.slot?.individualSettings?.selectedMember || ''}
                        label="설정할 회원 선택"
                        onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                          ...editedMember?.voidBetting?.slot,
                          individualSettings: {
                            ...editedMember?.voidBetting?.slot?.individualSettings,
                            selectedMember: e.target.value
                          }
                        })}
                      >
                        <MenuItem value="">회원을 선택하세요</MenuItem>
                        {childMembers.map((child) => (
                          <MenuItem key={child.id} value={child.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <span>{child.username} ({child.nickname}) / {child.levelName}</span>
                              {child.hasVoidBetting && (
                                <Chip 
                                  label="공베팅적용" 
                                  color="warning" 
                                  size="small" 
                                  sx={{ ml: 'auto' }}
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 선택된 회원의 현재 설정 표시 */}
                  {editedMember?.voidBetting?.slot?.individualSettings?.selectedMember && (() => {
                    const selectedChild = childMembers.find(child => 
                      child.id === editedMember?.voidBetting?.slot?.individualSettings?.selectedMember
                    );
                    return selectedChild ? (
                      <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2, backgroundColor: 'background.default' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            현재 설정된 공베팅 정보: {selectedChild.username} ({selectedChild.nickname})
                          </Typography>
                          {selectedChild.hasVoidBetting ? (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                • 슬롯: {selectedChild.voidBettingSettings?.slot?.enabled ? 
                                  `활성화 (${selectedChild.voidBettingSettings.slot.percentage}%, ${selectedChild.voidBettingSettings.slot.type})` : 
                                  '비활성화'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • 카지노: {selectedChild.voidBettingSettings?.casino?.enabled ? 
                                  `활성화 (${selectedChild.voidBettingSettings.casino.percentage}%, ${selectedChild.voidBettingSettings.casino.type})` : 
                                  '비활성화'}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              공베팅 설정이 없습니다.
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ) : null;
                  })()}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="최대 베팅금액"
                      value={editedMember?.voidBetting?.slot?.individualSettings?.maxBetAmount || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">원</InputAdornment>,
                      }}
                      disabled={!editedMember?.voidBetting?.slot?.individualSettings?.selectedMember}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                          ...editedMember?.voidBetting?.slot,
                          individualSettings: {
                            ...editedMember?.voidBetting?.slot?.individualSettings,
                            maxBetAmount: value
                          }
                        });
                      }}
                      helperText="이 금액 이하의 베팅에만 적용"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>적용 시간대</InputLabel>
                      <Select
                        value={editedMember?.voidBetting?.slot?.individualSettings?.timeRange || 'always'}
                        label="적용 시간대"
                        disabled={!editedMember?.voidBetting?.slot?.individualSettings?.selectedMember}
                        onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                          ...editedMember?.voidBetting?.slot,
                          individualSettings: {
                            ...editedMember?.voidBetting?.slot?.individualSettings,
                            timeRange: e.target.value
                          }
                        })}
                      >
                        <MenuItem value="always">상시 적용</MenuItem>
                        <MenuItem value="morning">오전 (06:00-12:00)</MenuItem>
                        <MenuItem value="afternoon">오후 (12:00-18:00)</MenuItem>
                        <MenuItem value="evening">저녁 (18:00-24:00)</MenuItem>
                        <MenuItem value="night">새벽 (00:00-06:00)</MenuItem>
                        <MenuItem value="custom">사용자 설정</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 사용자 설정 시간대 */}
                  {editedMember?.voidBetting?.slot?.individualSettings?.timeRange === 'custom' && (
                    <>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="시작 시간"
                          type="time"
                          value={editedMember?.voidBetting?.slot?.individualSettings?.customStartTime || '00:00'}
                          fullWidth
                          margin="normal"
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                            ...editedMember?.voidBetting?.slot,
                            individualSettings: {
                              ...editedMember?.voidBetting?.slot?.individualSettings,
                              customStartTime: e.target.value
                            }
                          })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="종료 시간"
                          type="time"
                          value={editedMember?.voidBetting?.slot?.individualSettings?.customEndTime || '23:59'}
                          fullWidth
                          margin="normal"
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                            ...editedMember?.voidBetting?.slot,
                            individualSettings: {
                              ...editedMember?.voidBetting?.slot?.individualSettings,
                              customEndTime: e.target.value
                            }
                          })}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedMember?.voidBetting?.slot?.individualSettings?.onlyLosing || false}
                          disabled={!editedMember?.voidBetting?.slot?.individualSettings?.selectedMember}
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'slot', {
                            ...editedMember?.voidBetting?.slot,
                            individualSettings: {
                              ...editedMember?.voidBetting?.slot?.individualSettings,
                              onlyLosing: e.target.checked
                            }
                          })}
                        />
                      }
                      label="패배 베팅에만 적용"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* 카지노 공베팅 설정 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>카지노 공베팅</Typography>
              <Chip 
                label="CASINO" 
                color="secondary" 
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedMember?.voidBetting?.casino?.enabled || false}
                      onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                        ...editedMember?.voidBetting?.casino,
                        enabled: e.target.checked
                      })}
                    />
                  }
                  label="카지노 공베팅 활성화"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>공베팅 유형</InputLabel>
                  <Select
                    value={editedMember?.voidBetting?.casino?.type || 'individual'}
                    label="공베팅 유형"
                    onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                      ...editedMember?.voidBetting?.casino,
                      type: e.target.value
                    })}
                    disabled={!editedMember?.voidBetting?.casino?.enabled}
                  >
                    <MenuItem value="group">그룹 설정</MenuItem>
                    <MenuItem value="individual">개별 설정</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="공베팅 비율"
                  value={editedMember?.voidBetting?.casino?.percentage || '0'}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  disabled={!editedMember?.voidBetting?.casino?.enabled}
                  onFocus={(e) => {
                    if (editedMember?.voidBetting?.casino?.percentage === '0') {
                      handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                        ...editedMember?.voidBetting?.casino,
                        percentage: ''
                      });
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    if (parseFloat(value) <= 100 || value === '') {
                      handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                        ...editedMember?.voidBetting?.casino,
                        percentage: value
                      });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                        ...editedMember?.voidBetting?.casino,
                        percentage: '0'
                      });
                    }
                  }}
                  helperText="베팅 중 무효화할 비율을 설정합니다."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="최소 베팅금액"
                  value={editedMember?.voidBetting?.casino?.minBetAmount || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">원</InputAdornment>,
                  }}
                  disabled={!editedMember?.voidBetting?.casino?.enabled}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                      ...editedMember?.voidBetting?.casino,
                      minBetAmount: value
                    });
                  }}
                  helperText="이 금액 이상의 베팅에만 공베팅이 적용됩니다."
                />
              </Grid>

              {/* 그룹 설정 */}
              {editedMember?.voidBetting?.casino?.type === 'group' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'secondary.main' }}>
                      그룹 공베팅 설정 (최대 3단계)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>적용 대상 선택</InputLabel>
                      <Select
                        value={editedMember?.voidBetting?.casino?.groupSettings?.selectedMember || ''}
                        label="적용 대상 선택"
                        onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                          ...editedMember?.voidBetting?.casino,
                          groupSettings: {
                            ...editedMember?.voidBetting?.casino?.groupSettings,
                            selectedMember: e.target.value
                          }
                        })}
                      >
                        <MenuItem value="self">
                          자신 ({editedMember?.username || 'N/A'} / {editedMember?.nickname || 'N/A'} / {editedMember?.levelName || 'N/A'})
                        </MenuItem>
                        {childMembers.map((child) => (
                          <MenuItem key={child.id} value={child.id}>
                            {child.username} ({child.nickname}) / {child.levelName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      선택한 회원의 하위 모든 회원에게 동일한 공베팅 설정이 일괄 적용됩니다.
                      설정 권한 범위는 공베팅을 설정할 수 있는 계층 권한을 의미합니다.
                    </Alert>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="설정 권한 범위 (단계)"
                      type="number"
                      value={editedMember?.voidBetting?.casino?.groupSettings?.maxDepth || 3}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        inputProps: { min: 1, max: 3 },
                        endAdornment: <InputAdornment position="end">단계</InputAdornment>,
                      }}
                      onChange={(e) => {
                        const value = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
                        handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                          ...editedMember?.voidBetting?.casino,
                          groupSettings: {
                            ...editedMember?.voidBetting?.casino?.groupSettings,
                            maxDepth: value
                          }
                        });
                      }}
                      helperText="공베팅을 설정할 수 있는 권한 범위 (최대 3단계)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedMember?.voidBetting?.casino?.groupSettings?.inheritSettings || true}
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                            ...editedMember?.voidBetting?.casino,
                            groupSettings: {
                              ...editedMember?.voidBetting?.casino?.groupSettings,
                              inheritSettings: e.target.checked
                            }
                          })}
                        />
                      }
                      label="하위 회원 설정 상속"
                      sx={{ mt: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedMember?.voidBetting?.casino?.groupSettings?.onlyLosing || false}
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                            ...editedMember?.voidBetting?.casino,
                            groupSettings: {
                              ...editedMember?.voidBetting?.casino?.groupSettings,
                              onlyLosing: e.target.checked
                            }
                          })}
                        />
                      }
                      label="패배 베팅에만 적용"
                    />
                  </Grid>
                </>
              )}

              {/* 개별 설정 */}
              {editedMember?.voidBetting?.casino?.type === 'individual' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'secondary.main' }}>
                      개별 공베팅 설정
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info">
                      상위 회원이 하위 회원들을 개별적으로 설정할 수 있습니다.
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>설정할 회원 선택</InputLabel>
                      <Select
                        value={editedMember?.voidBetting?.casino?.individualSettings?.selectedMember || ''}
                        label="설정할 회원 선택"
                        onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                          ...editedMember?.voidBetting?.casino,
                          individualSettings: {
                            ...editedMember?.voidBetting?.casino?.individualSettings,
                            selectedMember: e.target.value
                          }
                        })}
                      >
                        <MenuItem value="">회원을 선택하세요</MenuItem>
                        {childMembers.map((child) => (
                          <MenuItem key={child.id} value={child.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <span>{child.username} ({child.nickname}) / {child.levelName}</span>
                              {child.hasVoidBetting && (
                                <Chip 
                                  label="공베팅적용" 
                                  color="warning" 
                                  size="small" 
                                  sx={{ ml: 'auto' }}
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 선택된 회원의 현재 설정 표시 */}
                  {editedMember?.voidBetting?.casino?.individualSettings?.selectedMember && (() => {
                    const selectedChild = childMembers.find(child => 
                      child.id === editedMember?.voidBetting?.casino?.individualSettings?.selectedMember
                    );
                    return selectedChild ? (
                      <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2, backgroundColor: 'background.default' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            현재 설정된 공베팅 정보: {selectedChild.username} ({selectedChild.nickname})
                          </Typography>
                          {selectedChild.hasVoidBetting ? (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                • 슬롯: {selectedChild.voidBettingSettings?.slot?.enabled ? 
                                  `활성화 (${selectedChild.voidBettingSettings.slot.percentage}%, ${selectedChild.voidBettingSettings.slot.type})` : 
                                  '비활성화'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • 카지노: {selectedChild.voidBettingSettings?.casino?.enabled ? 
                                  `활성화 (${selectedChild.voidBettingSettings.casino.percentage}%, ${selectedChild.voidBettingSettings.casino.type})` : 
                                  '비활성화'}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              공베팅 설정이 없습니다.
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ) : null;
                  })()}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="최대 베팅금액"
                      value={editedMember?.voidBetting?.casino?.individualSettings?.maxBetAmount || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">원</InputAdornment>,
                      }}
                      disabled={!editedMember?.voidBetting?.casino?.individualSettings?.selectedMember}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                          ...editedMember?.voidBetting?.casino,
                          individualSettings: {
                            ...editedMember?.voidBetting?.casino?.individualSettings,
                            maxBetAmount: value
                          }
                        });
                      }}
                      helperText="이 금액 이하의 베팅에만 적용"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>적용 시간대</InputLabel>
                      <Select
                        value={editedMember?.voidBetting?.casino?.individualSettings?.timeRange || 'always'}
                        label="적용 시간대"
                        disabled={!editedMember?.voidBetting?.casino?.individualSettings?.selectedMember}
                        onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                          ...editedMember?.voidBetting?.casino,
                          individualSettings: {
                            ...editedMember?.voidBetting?.casino?.individualSettings,
                            timeRange: e.target.value
                          }
                        })}
                      >
                        <MenuItem value="always">상시 적용</MenuItem>
                        <MenuItem value="morning">오전 (06:00-12:00)</MenuItem>
                        <MenuItem value="afternoon">오후 (12:00-18:00)</MenuItem>
                        <MenuItem value="evening">저녁 (18:00-24:00)</MenuItem>
                        <MenuItem value="night">새벽 (00:00-06:00)</MenuItem>
                        <MenuItem value="custom">사용자 설정</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 사용자 설정 시간대 */}
                  {editedMember?.voidBetting?.casino?.individualSettings?.timeRange === 'custom' && (
                    <>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="시작 시간"
                          type="time"
                          value={editedMember?.voidBetting?.casino?.individualSettings?.customStartTime || '00:00'}
                          fullWidth
                          margin="normal"
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                            ...editedMember?.voidBetting?.casino,
                            individualSettings: {
                              ...editedMember?.voidBetting?.casino?.individualSettings,
                              customStartTime: e.target.value
                            }
                          })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="종료 시간"
                          type="time"
                          value={editedMember?.voidBetting?.casino?.individualSettings?.customEndTime || '23:59'}
                          fullWidth
                          margin="normal"
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                            ...editedMember?.voidBetting?.casino,
                            individualSettings: {
                              ...editedMember?.voidBetting?.casino?.individualSettings,
                              customEndTime: e.target.value
                            }
                          })}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedMember?.voidBetting?.casino?.individualSettings?.onlyLosing || false}
                          disabled={!editedMember?.voidBetting?.casino?.individualSettings?.selectedMember}
                          onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'casino', {
                            ...editedMember?.voidBetting?.casino,
                            individualSettings: {
                              ...editedMember?.voidBetting?.casino?.individualSettings,
                              onlyLosing: e.target.checked
                            }
                          })}
                        />
                      }
                      label="패배 베팅에만 적용"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* 공베팅 통계 */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>공베팅 통계</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                      {stats.totalCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 공베팅 건수
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalVoidedAmount)}원
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 무효화 금액
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalRollingLoss)}원
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      누락된 롤링금
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                      <Chip label="슬롯" color="primary" size="small" sx={{ mr: 1 }} />
                      {stats.slotVoidCount}건
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
                      <Chip label="카지노" color="secondary" size="small" sx={{ mr: 1 }} />
                      {stats.casinoVoidCount}건
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      게임별 무효화
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 전체 설정 */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>공베팅 전체 설정</Typography>
            
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedMember?.voidBetting?.global?.enableLog || true}
                      onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'global', {
                        ...editedMember?.voidBetting?.global,
                        enableLog: e.target.checked
                      })}
                    />
                  }
                  label="공베팅 로그 기록"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedMember?.voidBetting?.global?.autoCalculateRolling || false}
                      onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'global', {
                        ...editedMember?.voidBetting?.global,
                        autoCalculateRolling: e.target.checked
                      })}
                    />
                  }
                  label="롤링금 자동 재계산"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedMember?.voidBetting?.global?.excludeWinningsFromVoid || false}
                      onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'global', {
                        ...editedMember?.voidBetting?.global,
                        excludeWinningsFromVoid: e.target.checked
                      })}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>당첨내역 공베팅 제외</span>
                      <Tooltip title="당첨된 베팅은 공베팅 대상에서 제외됩니다" placement="top">
                        <Info fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                      </Tooltip>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="공베팅 메모"
                  multiline
                  rows={3}
                  fullWidth
                  value={editedMember?.voidBetting?.global?.memo || ''}
                  onChange={(e) => handleNestedInputChange && handleNestedInputChange('voidBetting', 'global', {
                    ...editedMember?.voidBetting?.global,
                    memo: e.target.value
                  })}
                  placeholder="공베팅 설정에 대한 메모를 입력하세요"
                  helperText="공베팅 설정 이유나 특별한 조건을 기록할 수 있습니다."
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 공베팅 내역 테이블 */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">공베팅 내역</Typography>
              <Button 
                variant="outlined" 
                startIcon={<Visibility />}
                size="small"
              >
                전체 내역 보기
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>날짜/시간</TableCell>
                    <TableCell>게임유형</TableCell>
                    <TableCell>제공사</TableCell>
                    <TableCell>게임명</TableCell>
                    <TableCell align="right">원본 베팅금액</TableCell>
                    <TableCell align="right">무효화 금액</TableCell>
                    <TableCell align="center">무효화 비율</TableCell>
                    <TableCell align="right">누락 롤링금</TableCell>
                    <TableCell align="center">유형</TableCell>
                    <TableCell>사유</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {voidBettingData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography variant="body2">{row.date}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.time}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.gameType} 
                            color={row.gameType === '슬롯' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{row.gameProvider}</TableCell>
                        <TableCell>{row.gameName}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.originalBetAmount)}원
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error.main" fontWeight="bold">
                            {formatCurrency(row.voidedAmount)}원
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${row.voidedPercentage}%`}
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error.main">
                            -{formatCurrency(row.rollingLoss)}원
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.type}
                            color={
                              row.type === '그룹' ? 'success' : 'info'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={voidBettingData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="페이지당 행 수:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}개`}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VoidBettingTab; 