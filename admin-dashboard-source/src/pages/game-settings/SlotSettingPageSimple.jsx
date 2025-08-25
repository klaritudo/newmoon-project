import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Chip, Stack, Snackbar, Alert } from '@mui/material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TableHeightSetting, 
  TableResizeHandle, 
  ColumnVisibilityDialog, 
  PageHeader, 
  PageContainer
} from '../../components/baseTemplate/components';
import { 
  useTableAutoHeight,
  useTableResize,
  useColumnVisibility,
  useTable
} from '../../components/baseTemplate/hooks';
import { 
  slotColumns, 
  apiOptions,
  slotFilterOptions,
  generateSlotSettingsData 
} from './data/SlotSettingData';

/**
 * 게임 목록 다이얼로그
 */
const GameListDialog = ({ open, onClose, vendorName, games = [] }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>{vendorName} 게임 목록 ({games.length}개)</DialogTitle>
    <DialogContent dividers>
      <List>
        {games.map(game => (
          <ListItem key={game.id}>
            <ListItemText 
              primary={game.name} 
              secondary={
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip label={game.type} size="small" variant="outlined" />
                  <Chip label={`RTP: ${game.rtp}`} size="small" color="primary" />
                  <Chip label={`변동성: ${game.volatility}`} size="small" 
                    color={game.volatility === 'High' ? 'error' : game.volatility === 'Medium' ? 'warning' : 'success'} />
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">닫기</Button>
    </DialogActions>
  </Dialog>
);

/**
 * 슬롯 게임 설정 페이지 (심플 버전)
 */
const SlotSettingPageSimple = () => {
  // 게임사 데이터 상태
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // 다이얼로그 상태
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  
  // 검색 및 필터 상태
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({ status: '', api: '' });
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(10);
  
  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    const data = generateSlotSettingsData(30);
    setVendors(data);
  }, []);


  // 알림 표시 함수
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // 알림 닫기 함수
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // 필터링된 데이터를 먼저 정의
  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    // 검색 필터
    if (searchText) {
      result = result.filter(vendor => 
        vendor.vendorName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 상태 필터
    if (activeFilters.status === 'enabled') {
      result = result.filter(vendor => vendor.enabled === true);
    } else if (activeFilters.status === 'disabled') {
      result = result.filter(vendor => vendor.enabled === false);
    }

    // API 필터
    if (activeFilters.api && activeFilters.api !== '') {
      result = result.filter(vendor => vendor.api === activeFilters.api);
    }

    return result;
  }, [vendors, searchText, activeFilters]);

  // 필터가 변경될 때 페이지를 0으로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [searchText, activeFilters]);

  // 현재 페이지가 최대 페이지를 초과하지 않도록 보장
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredVendors.length / currentRowsPerPage) - 1);
    if (currentPage > maxPage && filteredVendors.length > 0) {
      setCurrentPage(maxPage);
    }
  }, [filteredVendors.length, currentRowsPerPage, currentPage]);

  // 테이블 높이 자동 조정
  const {
    containerRef,
    tableHeight,
    autoHeight,
    toggleAutoHeight,
    setManualHeight
  } = useTableAutoHeight({
    defaultHeight: '500px',
    defaultAutoHeight: true,
    minHeight: 300,
    bottomMargin: 100
  });

  // 테이블 리사이즈 기능
  const {
    isDragging,
    getResizeHandleProps
  } = useTableResize({
    minHeight: 200,
    maxHeight: null,
    useViewportLimit: true,
    viewportMargin: 50,
    onResize: (newHeight) => {
      if (autoHeight) {
        toggleAutoHeight(false);
      }
      setManualHeight(`${newHeight}px`);
    }
  });

  // 새로고침 핸들러
  const handleRefreshClick = () => {
    const data = generateSlotSettingsData(30);
    setVendors(data);
    setCurrentPage(0);
    showNotification('데이터를 새로고침했습니다.', 'success');
  };

  // 액션 핸들러들
  const handleToggleEnable = useCallback((vendor) => {
    console.log('토글 클릭:', vendor);
    setVendors(prev => {
      const updated = prev.map(v => 
        v.id === vendor.id ? { ...v, enabled: !v.enabled } : v
      );
      return updated;
    });
    showNotification('활성/비활성 상태가 변경되었습니다.');
  }, []);

  const handleApiChange = useCallback((vendor, newApi) => {
    console.log('API 변경:', vendor, newApi);
    setVendors(prev => {
      const updated = prev.map(v => 
        v.id === vendor.id ? { ...v, api: newApi } : v
      );
      return updated;
    });
    showNotification('API가 변경되었습니다.');
  }, []);

  const handleViewGames = useCallback((vendor) => {
    setSelectedVendor(vendor);
    setIsGameDialogOpen(true);
  }, []);

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return slotColumns.map(column => {
      if (column.id === 'enabled') {
        return {
          ...column,
          onToggle: handleToggleEnable
        };
      }
      if (column.id === 'api') {
        return {
          ...column,
          dropdownOptions: apiOptions,
          onApiChange: handleApiChange
        };
      }
      if (column.id === 'action') {
        return {
          ...column,
          onClick: handleViewGames
        };
      }
      return column;
    });
  }, [handleToggleEnable, handleApiChange, handleViewGames]);

  // 컬럼 표시옵션 관련 훅 사용
  const {
    columnVisibility,
    visibleColumns,
    hiddenColumnsCount,
    toggleableColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(columnsWithActions, {
    defaultHiddenColumns: [],
    alwaysVisibleColumns: ['no', 'vendorName'],
    tableId: 'slot_settings_table'
  });

  // 페이지네이션된 데이터 (디버깅용으로 남겨둠)
  const displayData = useMemo(() => {
    const startIndex = currentPage * currentRowsPerPage;
    const endIndex = startIndex + currentRowsPerPage;
    const slicedData = filteredVendors.slice(startIndex, endIndex);
    
    return slicedData.map((item, index) => ({
      ...item,
      no: startIndex + index + 1
    }));
  }, [filteredVendors, currentPage, currentRowsPerPage]);

  // useTable 훅 사용
  const {
    checkedItems,
    sortConfig,
    allChecked,
    handleSort,
    handleCheck,
    handleToggleAll
  } = useTable({
    data: displayData,
    initialSort: { key: null, direction: 'asc' },
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage) => {
    // TablePagination 컴포넌트는 페이지 인덱스(숫자)만 전달함
    const pageIndex = typeof newPage === 'number' ? newPage : 0;
    
    // 유효성 검사
    if (pageIndex < 0) {
      console.error('잘못된 페이지 인덱스:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
  }, []);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((filterId, value) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    setCurrentPage(0); // 필터 변경시 첫 페이지로
  }, []);

  // 표시옵션 핸들러
  const handleDisplayOptionsClick = (event) => {
    setDisplayOptionsAnchor(event.currentTarget);
  };

  const handleDisplayOptionsClose = () => {
    setDisplayOptionsAnchor(null);
  };

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <PageHeader
        title="슬롯 게임 설정"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefreshClick}
        sx={{ mb: 2 }}
      />

      {/* 컬럼 표시옵션 다이얼로그 */}
      <ColumnVisibilityDialog
        anchorEl={displayOptionsAnchor}
        open={Boolean(displayOptionsAnchor)}
        onClose={handleDisplayOptionsClose}
        toggleableColumns={toggleableColumns}
        columnVisibility={columnVisibility}
        onToggleColumn={toggleColumnVisibility}
        onShowAll={showAllColumns}
        onReset={resetToDefault}
        hiddenColumnsCount={hiddenColumnsCount}
        menuWidth="350px"
      />

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        
        {/* 테이블 헤더 컴포넌트 */}
        <TableHeader
          title="슬롯 게임사 목록"
          totalItems={filteredVendors.length}
          countLabel="총 ##count##개의 게임사"
          sequentialPageNumbers={true}
          togglePageNumberMode={() => {}}
          hasPinnedColumns={false}
          isGridReady={true}
          toggleColumnPin={() => {}}
          searchText={searchText}
          handleSearchChange={(e) => setSearchText(e.target.value)}
          handleClearSearch={() => setSearchText('')}
          showIndentToggle={false}
          showPageNumberToggle={true}
          showColumnPinToggle={true}
          showSearch={true}
          searchPlaceholder="게임사 검색..."
          sx={{ mb: 2 }}
        />

        {/* 테이블 높이 설정 */}
        <TableHeightSetting
          tableHeight={tableHeight}
          autoHeight={autoHeight}
          toggleAutoHeight={toggleAutoHeight}
          setManualHeight={setManualHeight}
          minHeight={200}
          maxHeight={1200}
          step={50}
        />

        <Box sx={{ width: '100%' }}>
          <TableFilterAndPagination
            filterProps={{
              columns: visibleColumns,
              filterValues: activeFilters,
              activeFilters: activeFilters,
              filterOptions: slotFilterOptions,
              handleFilterChange: handleFilterChange,
              onFilter: () => {},
              onClearFilters: () => setActiveFilters({ status: '', api: '' })
            }}
            paginationProps={{
              count: filteredVendors.length,
              page: currentPage,
              rowsPerPage: currentRowsPerPage,
              onPageChange: handlePageChange,
              onRowsPerPageChange: handleRowsPerPageChange,
              totalCount: filteredVendors.length
            }}
          />
        </Box>
        
        {/* 테이블 콘텐츠 영역 */}
        <Box 
          sx={{ 
            width: '100%', 
            mt: 2
          }} 
          ref={containerRef}
        >
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            현재 페이지: {currentPage + 1} / {Math.ceil(filteredVendors.length / currentRowsPerPage)} 
            (페이지당 {currentRowsPerPage}행) - 표시 데이터: {displayData.length}개
          </Typography>
          
          <BaseTable
            key={`slot-table-${currentPage}-${currentRowsPerPage}`}
            columns={visibleColumns}
            data={filteredVendors}
            checkable={true}
            hierarchical={false}
            indentMode={false}
            checkedItems={checkedItems}
            allChecked={allChecked}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            page={currentPage}
            rowsPerPage={currentRowsPerPage}
            totalCount={filteredVendors.length}
            sequentialPageNumbers={true}
            draggableColumns={false}
            fixedHeader={true}
            maxHeight={tableHeight}
            sx={{
              '& table': {
                tableLayout: 'fixed !important',
                width: '100% !important'
              }
            }}
          />

          {/* 테이블 리사이즈 핸들 */}
          <TableResizeHandle 
            resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
            showIcon={true}
            isDragging={isDragging}
            sx={{ 
              mt: 1,
              opacity: isDragging ? 1 : 0.7,
              '&:hover': { opacity: 1 }
            }}
          />
        </Box>
      </Paper>

      {/* 게임 목록 다이얼로그 */}
      <GameListDialog 
        open={isGameDialogOpen} 
        onClose={() => setIsGameDialogOpen(false)} 
        vendorName={selectedVendor?.vendorName || ''} 
        games={selectedVendor?.games || []} 
      />

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default SlotSettingPageSimple;