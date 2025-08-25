import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Button,
  Menu,
  MenuItem,
  Grid,
  Chip,
  alpha
} from '@mui/material';
import {
  RestartAlt as ResetIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

/**
 * 테이블 컬럼 표시 옵션 다이얼로그 컴포넌트
 * 테이블 컬럼의 표시/숨김을 제어할 수 있는 체크박스 메뉴를 제공합니다.
 * 
 * @param {Object} props
 * @param {Element} props.anchorEl - 메뉴가 표시될 앵커 엘리먼트
 * @param {boolean} props.open - 메뉴 열림 상태
 * @param {Function} props.onClose - 메뉴 닫기 핸들러
 * @param {Array} props.toggleableColumns - 토글 가능한 컬럼 목록
 * @param {Object} props.columnVisibility - 컬럼 표시 상태 객체
 * @param {Function} props.onToggleColumn - 컬럼 토글 핸들러
 * @param {Function} props.onShowAll - 모든 컬럼 표시 핸들러
 * @param {Function} props.onReset - 기본 상태로 초기화 핸들러
 * @param {number} props.hiddenColumnsCount - 숨겨진 컬럼 개수
 * @param {string} props.menuWidth - 메뉴 너비
 */
const ColumnVisibilityDialog = ({
  anchorEl,
  open,
  onClose,
  toggleableColumns = [],
  columnVisibility = {},
  onToggleColumn,
  onShowAll,
  onReset,
  hiddenColumnsCount = 0,
  menuWidth = '300px'
}) => {
  // 컬럼 토글 핸들러
  const handleColumnToggle = (event, value) => {
    // value가 null이면 토글 해제, 값이 있으면 토글 활성화
    const columnId = event.currentTarget.dataset.columnId || 
                     event.currentTarget.closest('[data-column-id]')?.dataset.columnId;
    
    if (columnId && onToggleColumn) {
      onToggleColumn(columnId);
    }
  };

  // 모든 컬럼 표시 핸들러
  const handleShowAll = () => {
    if (onShowAll) {
      onShowAll();
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: menuWidth,
          maxWidth: menuWidth,
          maxHeight: '70vh', 
          zIndex: 1400
        }
      }}
      sx={{ zIndex: 1400 }}
      MenuListProps={{
        sx: { width: '100%' }
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem sx={{ display: 'block', p: 0 }}>
        <Box sx={{ p: 2 }}>
          {/* 헤더 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              컬럼 표시 옵션
            </Typography>
            {hiddenColumnsCount > 0 && (
              <Chip 
                icon={<VisibilityOffIcon />}
                label={`${hiddenColumnsCount}개 숨김`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* 컬럼 목록 */}
          <Box sx={{ mb: 2, maxHeight: '300px', overflowY: 'auto' }}>
            {toggleableColumns.length > 0 ? (
              <Grid container spacing={1}>
                {toggleableColumns.map(column => {
                  // 그룹 컬럼인지 확인
                  const isGroupColumn = column.type === 'group' && column.children && column.children.length > 0;
                  
                  if (isGroupColumn) {
                    // 그룹 컬럼의 경우 그룹 헤더와 자식 컬럼들을 계층적으로 표시
                    return (
                      <React.Fragment key={column.id}>
                        {/* 그룹 헤더 */}
                        <Grid item xs={12}>
                          <ToggleButtonGroup
                            value={columnVisibility[column.id] !== false ? [column.id] : []}
                            onChange={handleColumnToggle}
                            sx={{ 
                              width: '100%',
                              '& .MuiToggleButton-root': {
                                width: '100%',
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                '&.Mui-selected': {
                                  backgroundColor: (theme) => `${alpha(theme.palette.primary.main, 0.8)} !important`,
                                  color: 'white !important',
                                  '&:hover': {
                                    backgroundColor: (theme) => `${alpha(theme.palette.primary.dark, 0.9)} !important`,
                                  }
                                },
                                '&:not(.Mui-selected)': {
                                  backgroundColor: 'rgba(245, 245, 245, 0.7) !important',
                                  color: 'text.secondary',
                                  '&:hover': {
                                    backgroundColor: 'rgba(238, 238, 238, 0.8) !important',
                                  }
                                }
                              }
                            }}
                          >
                            <ToggleButton 
                              value={column.id}
                              data-column-id={column.id}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {column.header || column.label || column.id}
                                </Typography>
                                {columnVisibility[column.id] !== false ? (
                                  <VisibilityIcon 
                                    fontSize="small" 
                                    sx={{ color: 'inherit' }} 
                                  />
                                ) : (
                                  <VisibilityOffIcon 
                                    fontSize="small" 
                                    sx={{ color: 'inherit' }} 
                                  />
                                )}
                              </Box>
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Grid>
                        
                        {/* 자식 컬럼들 (들여쓰기) */}
                        {column.children.map(childColumn => (
                          <Grid item xs={12} key={childColumn.id}>
                            <Box sx={{ ml: 3 }}>
                              <ToggleButtonGroup
                                value={columnVisibility[childColumn.id] !== false ? [childColumn.id] : []}
                                onChange={handleColumnToggle}
                                sx={{ 
                                  width: '100%',
                                  '& .MuiToggleButton-root': {
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    border: '1px solid rgba(0, 0, 0, 0.12)',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    '&.Mui-selected': {
                                      backgroundColor: (theme) => `${alpha(theme.palette.success.main, 0.8)} !important`,
                                      color: 'white !important',
                                      '&:hover': {
                                        backgroundColor: (theme) => `${alpha(theme.palette.success.dark, 0.9)} !important`,
                                      }
                                    },
                                    '&:not(.Mui-selected)': {
                                      backgroundColor: 'rgba(245, 245, 245, 0.7) !important',
                                      color: 'text.secondary',
                                      '&:hover': {
                                        backgroundColor: 'rgba(238, 238, 238, 0.8) !important',
                                      }
                                    }
                                  }
                                }}
                              >
                                <ToggleButton 
                                  value={childColumn.id}
                                  data-column-id={childColumn.id}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                      {childColumn.header || childColumn.label || childColumn.id}
                                    </Typography>
                                    {columnVisibility[childColumn.id] !== false ? (
                                      <VisibilityIcon 
                                        fontSize="small" 
                                        sx={{ color: 'inherit' }} 
                                      />
                                    ) : (
                                      <VisibilityOffIcon 
                                        fontSize="small" 
                                        sx={{ color: 'inherit' }} 
                                      />
                                    )}
                                  </Box>
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </Box>
                          </Grid>
                        ))}
                      </React.Fragment>
                    );
                  } else {
                    // 일반 컬럼의 경우 기존과 동일하게 표시
                    return (
                      <Grid item xs={12} key={column.id}>
                        <ToggleButtonGroup
                          value={columnVisibility[column.id] !== false ? [column.id] : []}
                          onChange={handleColumnToggle}
                          sx={{ 
                            width: '100%',
                            '& .MuiToggleButton-root': {
                              width: '100%',
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              '&.Mui-selected': {
                                backgroundColor: (theme) => `${alpha(theme.palette.info.main, 0.8)} !important`,
                                color: 'white !important',
                                '&:hover': {
                                  backgroundColor: (theme) => `${alpha(theme.palette.info.dark, 0.9)} !important`,
                                }
                              },
                              '&:not(.Mui-selected)': {
                                backgroundColor: 'rgba(245, 245, 245, 0.7) !important',
                                color: 'text.secondary',
                                '&:hover': {
                                  backgroundColor: 'rgba(238, 238, 238, 0.8) !important',
                                }
                              }
                            }
                          }}
                        >
                          <ToggleButton 
                            value={column.id}
                            data-column-id={column.id}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                {column.header || column.label || column.id}
                              </Typography>
                              {columnVisibility[column.id] !== false ? (
                                <VisibilityIcon 
                                  fontSize="small" 
                                  sx={{ color: 'inherit' }} 
                                />
                              ) : (
                                <VisibilityOffIcon 
                                  fontSize="small" 
                                  sx={{ color: 'inherit' }} 
                                />
                              )}
                            </Box>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>
                    );
                  }
                })}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                표시 옵션을 변경할 수 있는 컬럼이 없습니다.
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* 액션 버튼들 */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<VisibilityIcon />}
              onClick={handleShowAll}
              sx={{ fontWeight: 500 }}
            >
              모두 표시
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<ResetIcon />}
              onClick={handleReset}
              sx={{ fontWeight: 500 }}
            >
              초기화
            </Button>
          </Box>
          
          {/* 도움말 */}
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                display: 'block',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                lineHeight: 1.4
              }}
            >
              💡 토글버튼을 클릭하면 해당 컬럼이 테이블에서 표시/숨김 됩니다.
              <br />
              💡 그룹 버튼을 클릭하면 해당 그룹의 모든 컬럼이 함께 토글됩니다.
            </Typography>
          </Box>
        </Box>
      </MenuItem>
    </Menu>
  );
};

ColumnVisibilityDialog.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  toggleableColumns: PropTypes.arrayOf(PropTypes.object),
  columnVisibility: PropTypes.object,
  onToggleColumn: PropTypes.func,
  onShowAll: PropTypes.func,
  onReset: PropTypes.func,
  hiddenColumnsCount: PropTypes.number,
  menuWidth: PropTypes.string
};

export default ColumnVisibilityDialog; 