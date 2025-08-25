import React from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Add,
  Delete,
  Link,
  Security
} from '@mui/icons-material';
import ParentChips from '../../baseTemplate/components/ParentChips';

const BasicInfoTab = ({ 
  editedMember, 
  handleInputChange, 
  handleNestedInputChange, 
  showPassword, 
  toggleShowPassword, 
  siteUrls, 
  newSiteUrl, 
  setNewSiteUrl, 
  handleAddSiteUrl, 
  handleDeleteSiteUrl,
  renderHierarchy,
  formatCurrency,
  getLevelChipStyle
}) => {
  return (
    <>
      {/* 상위 계층 표시 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">상위단계</Typography>
            {editedMember && (() => {
              // 상위 계층 데이터 추출
              let parentTypes = [];
              
              // hierarchy 배열에서 상위 계층 추출
              if (editedMember.hierarchy && Array.isArray(editedMember.hierarchy)) {
                parentTypes = editedMember.hierarchy.map(agent => ({
                  label: typeof agent.levelName === 'object' ? agent.levelName.name || '관리자' : agent.levelName || '관리자',
                  backgroundColor: agent.backgroundColor,
                  borderColor: agent.borderColor,
                  color: agent.color || 'default'
                }));
              }
              // parentTypes 배열에서 상위 계층 추출 (대안)
              else if (editedMember.parentTypes && Array.isArray(editedMember.parentTypes)) {
                parentTypes = editedMember.parentTypes.map(parentType => ({
                  label: typeof parentType.label === 'object' ? 
                    (parentType.label.name || parentType.label.label || '유형') : 
                    (parentType.label || parentType.name || '유형'),
                  backgroundColor: parentType.backgroundColor,
                  borderColor: parentType.borderColor,
                  color: parentType.color || 'default'
                }));
              }
              
              // 상위 계층이 있으면 ParentChips 컴포넌트로 표시
              if (parentTypes.length > 0) {
                return (
                  <ParentChips 
                    parentTypes={parentTypes} 
                    direction="row"
                    sx={{ 
                      justifyContent: 'flex-start',
                      ml: 1
                    }}
                  />
                );
              }
              
              // 상위 계층이 없으면 현재 회원의 레벨 표시
              if (getLevelChipStyle) {
                const chipStyle = getLevelChipStyle(editedMember);
                return (
                  <Chip 
                    label={chipStyle.name}
                    size="small"
                    sx={{
                      backgroundColor: chipStyle.backgroundColor,
                      color: chipStyle.textColor,
                      border: `1px solid ${chipStyle.borderColor}`,
                      fontWeight: 'medium',
                      fontSize: '0.75rem',
                      height: '24px',
                      ml: 1,
                      '& .MuiChip-label': {
                        padding: '0 8px'
                      }
                    }}
                  />
                );
              }
              
              return null;
            })()}
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Security />}
            onClick={() => console.log('권한 설정 팝업 열기')}
            size="small"
          >
            권한 설정
          </Button>
        </Box>
        {renderHierarchy && renderHierarchy()}
      </Box>

      <Grid container spacing={3}>
        {/* 왼쪽 컬럼 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>계정 정보</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="아이디"
                  value={editedMember?.username || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="닉네임"
                  value={editedMember?.nickname || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('nickname', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="비밀번호"
                  type={showPassword ? "text" : "password"}
                  value={editedMember?.password || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('password', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="전화번호"
                  value={editedMember?.phone || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="추천인"
                  value={editedMember?.referrer || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('referrer', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>상태 정보</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>현재 상태:</Typography>
                  <Chip
                    label={typeof editedMember?.status === 'object' ? 
                      (editedMember.status.label || '정상') : 
                      (editedMember?.status || '정상')}
                    color={
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '정상' ? 'success' :
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '비활성' ? 'warning' :
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '차단' ? 'error' :
                      (typeof editedMember?.status === 'object' ? editedMember.status.label : editedMember?.status) === '삭제' ? 'default' : 'primary'
                    }
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>상태 변경</InputLabel>
                  <Select
                    value={typeof editedMember?.status === 'object' ? 
                      (editedMember.status.label || '정상') : 
                      (editedMember?.status || '정상')}
                    label="상태 변경"
                    onChange={(e) => handleInputChange && handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="정상">정상</MenuItem>
                    <MenuItem value="비활성">비활성</MenuItem>
                    <MenuItem value="차단">차단</MenuItem>
                    <MenuItem value="삭제">삭제</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                    마지막 상태 변경: {editedMember?.statusChangedAt || '없음'}
                  </Typography>
                  {editedMember?.statusChangedBy && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      변경자: {editedMember.statusChangedBy}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 오른쪽 컬럼 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>보유 금액</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="보유머니"
                  value={formatCurrency ? formatCurrency(editedMember?.balance) : (editedMember?.balance || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="게임머니"
                  value={formatCurrency ? formatCurrency(editedMember?.gameMoney) : (editedMember?.gameMoney || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="슬롯 롤링금액"
                  value={formatCurrency ? formatCurrency(editedMember?.rollingAmount?.slot) : (editedMember?.rollingAmount?.slot || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="카지노 롤링금액"
                  value={formatCurrency ? formatCurrency(editedMember?.rollingAmount?.casino) : (editedMember?.rollingAmount?.casino || 0)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>계좌 정보</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="은행"
                  value={editedMember?.bank || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('bank', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="계좌번호"
                  value={editedMember?.accountNumber || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('accountNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="예금주"
                  value={editedMember?.accountHolder || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('accountHolder', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>사이트 설정</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="브라우저 타이틀"
                  value={editedMember?.browserTitle || ''}
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleInputChange && handleInputChange('browserTitle', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>사이트 언어</InputLabel>
                  <Select
                    value={editedMember?.language || 'ko'}
                    label="사이트 언어"
                    onChange={(e) => handleInputChange && handleInputChange('language', e.target.value)}
                  >
                    <MenuItem value="ko">한국어</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                    <MenuItem value="ja">日本語</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label="사이트 URL"
                    value={newSiteUrl || ''}
                    fullWidth
                    margin="normal"
                    onChange={(e) => setNewSiteUrl && setNewSiteUrl(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleAddSiteUrl} edge="end">
                            <Add />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <List dense>
                  {(siteUrls || []).map((url, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDeleteSiteUrl && handleDeleteSiteUrl(index)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Link fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={url} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>



        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>메모</Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={editedMember?.memo || ''}
              onChange={(e) => handleInputChange && handleInputChange('memo', e.target.value)}
              placeholder="회원에 대한 메모를 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  padding: '12px',
                },
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default BasicInfoTab; 