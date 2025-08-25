import React from 'react';
import PropTypes from 'prop-types';
import { 
  Menu, 
  MenuItem, 
  FormControlLabel, 
  Checkbox,
  Divider,
  Button,
  Typography,
  Box
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

/**
 * 컬럼 표시 옵션 메뉴 컴포넌트
 * 테이블 컬럼의 가시성을 제어할 수 있는 메뉴
 * 
 * @param {Object} props
 * @param {HTMLElement} props.anchorEl - 메뉴를 띄울 기준 요소
 * @param {boolean} props.open - 메뉴 표시 여부
 * @param {function} props.onClose - 메뉴 닫기 핸들러
 * @param {Object} props.visibleColumns - 컬럼 표시 상태 객체
 * @param {function} props.onVisibleColumnsChange - 컬럼 표시 변경 핸들러
 * @param {function} props.onResetLayout - 레이아웃 초기화 핸들러
 * @returns {JSX.Element}
 */
const DisplayOptionsMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  visibleColumns,
  onVisibleColumnsChange,
  onResetLayout
}) => {
  // 현재 페이지의 경로 확인
  const currentPath = window.location.pathname;
  let columnGroups = [];
  
  // 롤링금전환내역 페이지일 경우
  if (
    currentPath.includes('/agent-management/rolling-history') || 
    currentPath.includes('/agent-management/members/rolling-history')
  ) {
    columnGroups = [
      {
        title: '기본 정보',
        columns: [
          { id: 'rowNum', label: '번호' },
          { id: 'username', label: '아이디(닉네임)' },
          { id: 'parentAgents', label: '상위에이전트' }
        ]
      },
      {
        title: '롤링 정보',
        columns: [
          { id: 'rollingBefore', label: '전환롤링금' },
          { id: 'rollingAfter', label: '전환후롤링금' },
          { id: 'balanceBefore', label: '처리전보유금' },
          { id: 'balanceAfter', label: '처리후보유금' }
        ]
      },
      {
        title: '상태 및 처리 정보',
        columns: [
          { id: 'status', label: '상태' },
          { id: 'adminId', label: '처리자' },
          { id: 'transferDate', label: '처리시간' },
          { id: 'details', label: '상세정보' },
          { id: 'memo', label: '비고' }
        ]
      }
    ];
  }
  // 머니처리내역 페이지일 경우
  else if (
    currentPath.includes('/money-history')
  ) {
    columnGroups = [
      {
        title: '기본 정보',
        columns: [
          { id: 'rowNum', label: '번호' },
          { id: 'type', label: '유형' },
          { id: 'username', label: '아이디(닉네임)' },
          { id: 'parentAgents', label: '상위에이전트' }
        ]
      },
      {
        title: '처리 정보',
        columns: [
          { id: 'amount', label: '처리금' },
          { id: 'balanceBefore', label: '처리전보유금' },
          { id: 'balanceAfter', label: '처리후보유금' }
        ]
      },
      {
        title: '추가 정보',
        columns: [
          { id: 'transactionType', label: '타입' },
          { id: 'adminId', label: '처리자' },
          { id: 'transactionDate', label: '처리시간' },
          { id: 'details', label: '상세정보' }
        ]
      }
    ];
  }
  // 머니이동내역 페이지일 경우
  else if (
    currentPath.includes('/agent-management/money-transfer')
  ) {
    columnGroups = [
      {
        title: '기본 정보',
        columns: [
          { id: 'rowNum', label: '번호' },
          { id: 'type', label: '유형' },
          { id: 'username', label: '아이디(닉네임)' },
          { id: 'parentAgents', label: '상위에이전트' }
        ]
      },
      {
        title: '처리 정보',
        columns: [
          { id: 'transferAmount', label: '이동금액' },
          { id: 'balance', label: '보유금액' },
          { id: 'gameMoney', label: '게임머니' }
        ]
      },
      {
        title: '추가 정보',
        columns: [
          { id: 'route', label: '경로' },
          { id: 'transferDate', label: '처리시간' },
          { id: 'details', label: '상세정보' }
        ]
      }
    ];
  }
  // 베팅내역 페이지일 경우 - 슬롯/카지노 베팅 컬럼 그룹 사용
  else if (
    currentPath.includes('/betting/details') || 
    currentPath.includes('/betting/casino') || 
    currentPath.includes('/betting/slot-casino')
  ) {
    columnGroups = [
      {
        title: '기본 정보',
        columns: [
          { id: 'checked', label: '체크박스' },
          { id: 'rowNum', label: '번호' },
          { id: 'betDate', label: '일자' },
          { id: 'username', label: '아이디(닉네임)' },
          { id: 'betInfo', label: '베팅정보' },
          { id: 'betSection', label: '베팅섹션' }
        ]
      },
      {
        title: '게임 정보',
        columns: [
          { id: 'gameType', label: '게임유형' },
          { id: 'gameProvider', label: '게임사' },
          { id: 'gameName', label: '게임' },
          { id: 'gameId', label: '게임ID' }
        ]
      },
      {
        title: '거래 정보',
        columns: [
          { id: 'transId', label: 'TransID' },
          { id: 'linkTransId', label: 'LinkTransID' },
          { id: 'status', label: '비고' }
        ]
      },
      {
        title: '액션',
        columns: [
          { id: 'actions', label: '상세정보' }
        ]
      }
    ];
  } else {
    // 회원관리 기본 컬럼 그룹
    columnGroups = [
      {
        title: '기본 정보',
        columns: [
          { id: 'checked', label: '체크박스' },
          { id: 'rowNum', label: '번호' },
          { id: 'type', label: '유형' },
          { id: 'username', label: '아이디(닉네임)' },
          { id: 'connectionStatus', label: '상태' },
          { id: 'onlineStatus', label: '접속상태' },
          { id: 'realName', label: '이름' },
          { id: 'actions', label: '지급/회수' }
        ]
      },
      {
        title: '계정/가입 정보',
        columns: [
          { id: 'bank', label: '은행' },
          { id: 'accountNumber', label: '계좌번호' },
          { id: 'lastConnectedAt', label: '접속일' },
          { id: 'createdAt', label: '가입일' }
        ]
      },
      {
        title: '게임 정보',
        columns: [
          { id: 'lastGame', label: '마지막게임' },
          { id: 'api', label: 'API' }
        ]
      },
      {
        title: '자금 정보',
        columns: [
          { id: 'balance', label: '보유금액' },
          { id: 'gameMoney', label: '게임머니' },
          { id: 'depositWithdrawal', label: '입금/출금' },
          { id: 'rollingPercent', label: '롤링%' },
          { id: 'rollingAmount', label: '롤링금' }
        ]
      },
      {
        title: '손익 정보',
        columns: [
          { id: 'profit_casino', label: '카지노 손익' },
          { id: 'profit_slot', label: '슬롯 손익' },
          { id: 'profit_total', label: '종합 손익' }
        ]
      }
    ];
  }
  
  // 체크박스 변경 핸들러
  const handleCheckboxChange = (columnId) => (event) => {
    onVisibleColumnsChange(columnId, event.target.checked);
  };

  // 전체 선택 핸들러
  const handleSelectAll = () => {
    // 모든 컬럼 ID를 가져와서 객체 생성
    const allSelectedColumns = {};
    
    // 모든 컬럼 그룹을 순회하면서 ID 수집
    columnGroups.forEach(group => {
      group.columns.forEach(column => {
        allSelectedColumns[column.id] = true;
      });
    });
    
    // 현재 표시 상태와 병합 (기존 값 유지를 위해)
    const updatedVisibleColumns = {
      ...visibleColumns,
      ...allSelectedColumns
    };
    
    // 부모 컴포넌트에서 한 번에 처리하도록 전달
    onVisibleColumnsChange('__ALL__', updatedVisibleColumns);
  };

  // 전체 해제 핸들러
  const handleDeselectAll = () => {
    // 현재 페이지 경로에 따라 필수 컬럼 설정
    let requiredColumns = [];
    
    // 롤링금전환내역 페이지일 경우 필수 컬럼 없음
    if (currentPath.includes('/agent-management/rolling-history') || 
        currentPath.includes('/agent-management/members/rolling-history')) {
      requiredColumns = [];
    } 
    // 머니처리내역 페이지일 경우 필수 컬럼 없음
    else if (currentPath.includes('/money-history')) {
      requiredColumns = [];
    }
    // 머니이동내역 페이지일 경우 필수 컬럼 없음
    else if (currentPath.includes('/agent-management/money-transfer')) {
      requiredColumns = [];
    }
    else {
      // 다른 페이지에서는 기본 필수 컬럼 유지
      requiredColumns = ['rowNum', 'username', 'actions'];
    }
    
    // 현재 visibleColumns 복사본 생성
    const updatedVisibleColumns = { ...visibleColumns };
    
    // 필수 컬럼을 제외한 모든 컬럼 숨기기
    Object.keys(updatedVisibleColumns).forEach(columnId => {
      if (!requiredColumns.includes(columnId)) {
        updatedVisibleColumns[columnId] = false;
      }
    });
    
    // 부모 컴포넌트에서 한 번에 처리하도록 전달
    onVisibleColumnsChange('__ALL__', updatedVisibleColumns);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: { 
          minWidth: 280, 
          maxHeight: '80vh',
          overflowY: 'auto',
          p: 1
        }
      }}
    >
      <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 600 }}>
        표시 옵션
      </Typography>
      
      <Divider sx={{ mb: 1 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mb: 1 }}>
        <Button 
          size="small" 
          onClick={handleSelectAll}
          startIcon={<RefreshIcon fontSize="small" />}
          sx={{ fontSize: '0.75rem' }}
        >
          전체 선택
        </Button>
        <Button 
          size="small" 
          onClick={handleDeselectAll}
          startIcon={<RefreshIcon fontSize="small" />}
          sx={{ fontSize: '0.75rem' }}
        >
          전체 해제
        </Button>
      </Box>
      
      <Divider sx={{ mb: 1 }} />
      
      {columnGroups.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              py: 0.5, 
              display: 'block', 
              fontWeight: 600,
              bgcolor: 'action.hover',
              borderRadius: '4px',
              mx: 1
            }}
          >
            {group.title}
          </Typography>
          
          {group.columns.map(column => (
            <MenuItem 
              key={column.id}
              dense
              sx={{ 
                minHeight: 'unset',
                py: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!visibleColumns[column.id]}
                    onChange={handleCheckboxChange(column.id)}
                    size="small"
                    sx={{ py: 0 }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {column.label}
                  </Typography>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </MenuItem>
          ))}
          
          {groupIndex < columnGroups.length - 1 && (
            <Divider sx={{ my: 1 }} />
          )}
        </div>
      ))}
      
      <Divider sx={{ mt: 1, mb: 1 }} />
      
      <Box sx={{ px: 2, py: 1 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<SettingsBackupRestoreIcon />}
          onClick={onResetLayout}
          sx={{ fontSize: '0.85rem' }}
        >
          레이아웃 초기화
        </Button>
      </Box>
    </Menu>
  );
};

DisplayOptionsMenu.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  visibleColumns: PropTypes.object.isRequired,
  onVisibleColumnsChange: PropTypes.func.isRequired,
  onResetLayout: PropTypes.func.isRequired
};

export default DisplayOptionsMenu; 