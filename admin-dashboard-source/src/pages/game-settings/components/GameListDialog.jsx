import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  BaseTable,
  TableHeader,
  TableFilterAndPagination
} from '../../../components/baseTemplate/components';
import {
  useTable,
  useTableFilterAndPagination,
  useTableHeader,
  useColumnVisibility
} from '../../../components/baseTemplate/hooks';

/**
 * 게임 목록 테이블 컬럼 정의
 */
const gameColumns = [
  {
    id: 'no',
    label: 'No.',
    width: 60,
    align: 'center',
    type: 'number'  // number 타입으로 설정하여 번호 자동 계산
  },
  {
    id: 'gameImage',
    label: '게임이미지',
    width: 240,
    align: 'center',
    type: 'image'
  },
  {
    id: 'gameName',
    label: '게임이름',
    width: 250,
    align: 'left',
    type: 'text',
    sortable: true
  },
  {
    id: 'enabled',
    label: '활성/비활성',
    width: 100,
    align: 'center',
    type: 'toggle'
  },
  {
    id: 'api',
    label: 'API',
    width: 150,
    align: 'center',
    type: 'dropdown',
    dropdownOptions: [
      { value: 'api-provider-a', label: 'API Provider A' },
      { value: 'api-provider-b', label: 'API Provider B' },
      { value: 'api-provider-c', label: 'API Provider C' }
    ]
  }
];

/**
 * 게임 목록 다이얼로그 컴포넌트
 */
const GameListDialog = ({ 
  open, 
  onClose, 
  vendorName, 
  vendorLogo, // 게임사 로고 정보 추가
  games = [],
  gameType = 'slot', // 'slot' or 'casino'
  onGameUpdate 
}) => {
  // 게임 데이터 상태
  const [gameData, setGameData] = useState([]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(10);
  
  // 테이블 키 (리렌더링용)
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 일괄 API 변경을 위한 상태
  const [bulkApi, setBulkApi] = useState('');
  
  // 다이얼로그가 열릴 때 게임 데이터 초기화
  useEffect(() => {
    if (open && games.length > 0) {
      // 게임 데이터를 테이블 형식에 맞게 변환
      const transformedGames = games.map((game, index) => ({
        ...game,
        gameImage: getGameImage(game, gameType),
        gameName: game.name,
        enabled: game.enabled !== undefined ? game.enabled : true,
        api: game.api || 'api-provider-a'
      }));
      setGameData(transformedGames);
      setCurrentPage(0); // 페이지 초기화
    }
  }, [open, games, gameType]);
  
  // 게임 이미지 생성 함수
  const getGameImage = (game, type) => {
    if (type === 'slot') {
      // 슬롯 게임 이미지
      const typeColors = {
        'Video Slot': '#FF6B35',
        'Classic Slot': '#4ECDC4',
        'Progressive Slot': '#FFE66D',
        '3D Slot': '#A8E6CF',
        'Megaways': '#FF8B94'
      };
      
      return {
        bg: typeColors[game.type] || '#95A5A6',
        text: game.type ? game.type.split(' ').map(w => w[0]).join('') : 'SLOT'
      };
    } else {
      // 카지노 게임 이미지
      const typeColors = {
        'Live Baccarat': '#E74C3C',
        'Live Roulette': '#3498DB',
        'Live Blackjack': '#2ECC71',
        'Live Poker': '#9B59B6',
        'Live Sic Bo': '#F39C12',
        'Live Dragon Tiger': '#1ABC9C'
      };
      
      return {
        bg: typeColors[game.type] || '#95A5A6',
        text: game.type ? game.type.replace('Live ', '').slice(0, 3).toUpperCase() : 'LIVE'
      };
    }
  };
  
  // 게임 활성/비활성 토글
  const handleToggleEnable = useCallback((game) => {
    setGameData(prev => prev.map(g => 
      g.id === game.id ? { ...g, enabled: !g.enabled } : g
    ));
    
    // 상위 컴포넌트에 변경사항 알림
    if (onGameUpdate) {
      onGameUpdate(game.id, { enabled: !game.enabled });
    }
  }, [onGameUpdate]);
  
  // API 변경
  const handleApiChange = useCallback((game, newApi) => {
    setGameData(prev => prev.map(g => 
      g.id === game.id ? { ...g, api: newApi } : g
    ));
    
    // 상위 컴포넌트에 변경사항 알림
    if (onGameUpdate) {
      onGameUpdate(game.id, { api: newApi });
    }
  }, [onGameUpdate]);
  
  // 액션 핸들러가 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return gameColumns.map(column => {
      if (column.id === 'enabled') {
        return {
          ...column,
          onToggle: handleToggleEnable
        };
      }
      if (column.id === 'api') {
        return {
          ...column,
          onApiChange: handleApiChange
        };
      }
      return column;
    });
  }, [handleToggleEnable, handleApiChange]);
  
  // useTable 훅 사용
  const {
    checkedItems,
    sortConfig,
    allChecked,
    handleSort,
    handleCheck,
    handleToggleAll
  } = useTable({
    data: gameData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });
  
  // TableHeader 훅 사용
  const {
    searchText,
    sequentialPageNumbers,
    handleSearchChange,
    handleClearSearch,
    togglePageNumberMode
  } = useTableHeader({
    initialTotalItems: gameData.length,
    tableId: 'gameListDialog',
    initialSequentialPageNumbers: false,
    onSearch: (value) => {
      if (currentPage !== 0) {
        setCurrentPage(0);
      }
    },
    onTogglePageNumberMode: (sequential) => {
      console.log('GameListDialog 번호 모드 변경:', sequential ? '연속번호' : '페이지별번호');
      // 테이블 키를 업데이트하여 강제 리렌더링
      setTableKey(Date.now());
    }
  });
  
  // sequentialPageNumbers 변경 시 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
  }, [sequentialPageNumbers]);
  
  // 필터링된 데이터 처리
  const filteredData = useMemo(() => {
    let result = [...gameData];
    
    // 검색 필터
    if (searchText && searchText.trim() !== '') {
      result = result.filter(game => 
        game.gameName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return result;
  }, [gameData, searchText]);
  
  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * currentRowsPerPage;
    const endIndex = startIndex + currentRowsPerPage;
    const slicedData = filteredData.slice(startIndex, endIndex);
    
    // BaseTable이 번호를 처리하므로 여기서는 번호를 추가하지 않음
    return slicedData;
  }, [filteredData, currentPage, currentRowsPerPage]);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event, newPage) => {
    // TablePagination은 때때로 첫 번째 매개변수로 페이지 번호를 직접 전달할 수 있음
    const pageNumber = typeof event === 'number' ? event : newPage;
    console.log('GameListDialog 페이지 변경:', { event, newPage, pageNumber });
    
    if (pageNumber !== undefined && pageNumber !== null) {
      setCurrentPage(pageNumber);
    }
  }, []);
  
  // 행 수 변경 핸들러
  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (!isNaN(newRowsPerPage)) {
      setCurrentRowsPerPage(newRowsPerPage);
      setCurrentPage(0);
    }
  }, []);
  
  // 다이얼로그 닫기 핸들러
  const handleClose = useCallback(() => {
    // 상태 초기화
    setCurrentPage(0);
    setGameData([]);
    setBulkApi('');
    onClose();
  }, [onClose]);
  
  // 선택된 게임들을 활성화
  const handleEnableSelected = useCallback(() => {
    const selectedIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
    if (selectedIds.length === 0) return;
    
    setGameData(prev => prev.map(game => 
      selectedIds.includes(game.id) ? { ...game, enabled: true } : game
    ));
    
    // 상위 컴포넌트에 변경사항 알림
    if (onGameUpdate) {
      selectedIds.forEach(id => {
        onGameUpdate(id, { enabled: true });
      });
    }
  }, [checkedItems, onGameUpdate]);
  
  // 선택된 게임들을 비활성화
  const handleDisableSelected = useCallback(() => {
    const selectedIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
    if (selectedIds.length === 0) return;
    
    setGameData(prev => prev.map(game => 
      selectedIds.includes(game.id) ? { ...game, enabled: false } : game
    ));
    
    // 상위 컴포넌트에 변경사항 알림
    if (onGameUpdate) {
      selectedIds.forEach(id => {
        onGameUpdate(id, { enabled: false });
      });
    }
  }, [checkedItems, onGameUpdate]);
  
  // 일괄 API 변경 핸들러
  const handleBulkApiChange = useCallback((event) => {
    const newApi = event.target.value;
    setBulkApi(newApi);
    
    if (newApi) {
      setGameData(prev => prev.map(game => ({ ...game, api: newApi })));
      
      // 상위 컴포넌트에 변경사항 알림
      if (onGameUpdate) {
        gameData.forEach(game => {
          onGameUpdate(game.id, { api: newApi });
        });
      }
    }
  }, [gameData, onGameUpdate]);
  
  // 체크된 항목 수 계산
  const checkedCount = useMemo(() => {
    return Object.values(checkedItems).filter(checked => checked).length;
  }, [checkedItems]);
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 게임사 로고 */}
          {vendorLogo && (
            <Box
              sx={{
                width: 100,
                height: 40,
                borderRadius: '8px',
                backgroundColor: vendorLogo.bg || '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '16px',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {vendorLogo.text}
            </Box>
          )}
          <Box>
            <Typography variant="h6">
              {vendorName} 게임 목록 ({filteredData.length}개)
            </Typography>
            {checkedCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                ({checkedCount}개 선택됨)
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>API 일괄 변경</InputLabel>
            <Select
              value={bulkApi}
              onChange={handleBulkApiChange}
              label="API 일괄 변경"
            >
              <MenuItem value="">
                <em>선택 안함</em>
              </MenuItem>
              {gameColumns.find(col => col.id === 'api')?.dropdownOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 테이블 헤더 */}
        <TableHeader
          title=""
          totalItems={filteredData.length}
          countLabel="총 ##count##개의 게임"
          sequentialPageNumbers={sequentialPageNumbers}
          togglePageNumberMode={togglePageNumberMode}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          showSearch={true}
          searchPlaceholder="게임 검색..."
          showPageNumberToggle={true}
          showColumnPinToggle={false}
          showIndentToggle={false}
          sx={{ mb: 2 }}
        />
        
        {/* 테이블 */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {console.log('GameListDialog BaseTable props:', {
            sequentialPageNumbers,
            page: currentPage,
            rowsPerPage: currentRowsPerPage,
            dataLength: filteredData.length
          })}
          <BaseTable
            key={tableKey}
            columns={columnsWithActions}
            data={filteredData}
            checkable={true}
            hierarchical={false}
            checkedItems={checkedItems}
            allChecked={allChecked}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            page={currentPage}
            rowsPerPage={currentRowsPerPage}
            totalCount={filteredData.length}
            sequentialPageNumbers={sequentialPageNumbers}
            fixedHeader={true}
            maxHeight="100%"
            sx={{
              '& .MuiTableContainer-root': {
                height: '100%',
                maxHeight: 'calc(100% - 60px)'
              }
            }}
          />
        </Box>
        
        {/* 페이지네이션 */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 선택 활성/비활성 버튼 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {checkedCount > 0 && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleEnableSelected}
                  sx={{ fontSize: '0.875rem' }}
                >
                  선택 활성 ({checkedCount})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleDisableSelected}
                  sx={{ fontSize: '0.875rem' }}
                >
                  선택 비활성 ({checkedCount})
                </Button>
              </>
            )}
          </Box>
          
          {/* 페이지네이션 */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <TableFilterAndPagination
              filterProps={{
                columns: columnsWithActions,
                filterValues: {},
                activeFilters: {},
                filterOptions: [],
                handleFilterChange: () => {},
                showFilter: false
              }}
              paginationProps={{
                count: filteredData.length || 0,
                page: currentPage || 0,
                rowsPerPage: currentRowsPerPage || 10,
                onPageChange: handlePageChange,
                onRowsPerPageChange: handleRowsPerPageChange,
                totalCount: filteredData.length || 0
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          취소
        </Button>
        <Button onClick={handleClose} variant="contained">
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameListDialog;