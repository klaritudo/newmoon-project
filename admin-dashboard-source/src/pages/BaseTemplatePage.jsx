import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ViewModule,
  ViewList,
  ViewComfy
} from '@mui/icons-material';

// 기본 템플릿 컴포넌트와 훅 가져오기
import { PageHeader, TableHeader, TableFilterAndPagination } from '../components/baseTemplate/components';
import { usePageHeader, useTableHeader } from '../components/baseTemplate/hooks';

// 문서 컴포넌트 가져오기
import { 
  TableHeaderDocs, 
  PageHeaderDocs, 
  TableFilterAndPaginationDocs
} from '../components/baseTemplate/docs';

// 예제 컴포넌트 가져오기
import TableFilterAndPaginationExample from '../components/baseTemplate/examples/TableFilterAndPaginationExample';

/**
 * 기본 템플릿 페이지
 * 재사용 가능한 컴포넌트 및 레이아웃을 보여주는 페이지입니다.
 */
const BaseTemplatePage = () => {
  // usePageHeader 훅 사용
  const {
    notification,
    closeNotification,
    handleAddClick,
    handleOptionsClick,
    handleRefreshClick,
    optionsMenuAnchor,
    isOptionsMenuOpen,
    handleCloseOptionsMenu
  } = usePageHeader({
    onAdd: () => {
      // 실제 추가 로직 구현 대신 콘솔 로그
      console.log('항목 추가 기능 호출됨');
    }
  });

  // useTableHeader 훅 사용
  const {
    searchText,
    totalItems,
    indentMode,
    sequentialPageNumbers,
    hasPinnedColumns,
    isGridReady,
    handleSearchChange,
    handleClearSearch,
    toggleIndentMode,
    togglePageNumberMode,
    toggleColumnPin,
    setGridReady
  } = useTableHeader({
    initialTotalItems: 250,
    onSearch: (value) => {
      console.log(`검색어: ${value}`);
    }
  });

  // 뷰 옵션 선택 핸들러
  const handleViewOptionSelect = (viewType) => {
    console.log(`선택된 뷰 타입: ${viewType}`);
    handleCloseOptionsMenu();
  };

  return (
    <Container maxWidth="lg">
      {/* 페이지 헤더 컴포넌트 사용 */}
      <PageHeader
        title="기본 템플릿"
        onAddClick={handleAddClick}
        onDisplayOptionsClick={handleOptionsClick}
        onRefreshClick={handleRefreshClick}
        showAddButton={true}
        showDisplayOptionsButton={true}
        showRefreshButton={true}
        addButtonText="템플릿 추가"
        customActions={null}
      />

      <Grid container spacing={3}>
        {/* 테이블 헤더 예제 섹션 */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              TableHeader 컴포넌트 사용 예시
            </Typography>
            <Typography variant="body1" paragraph>
              아래는 <code>TableHeader</code> 컴포넌트를 사용한 예시입니다.
              테이블 상단에 위치하는 헤더 영역으로, 타이틀, 항목 수, 페이지 번호 방식, 컬럼 고정 및 검색 기능을 제공합니다.
            </Typography>

            {/* 테이블 헤더 컴포넌트 사용 */}
            <TableHeader
              title="회원 목록"
              totalItems={totalItems}
              countLabel="총 ##count##명의 회원"
              indentMode={indentMode}
              toggleIndentMode={toggleIndentMode}
              sequentialPageNumbers={sequentialPageNumbers}
              togglePageNumberMode={togglePageNumberMode}
              hasPinnedColumns={hasPinnedColumns}
              isGridReady={isGridReady}
              toggleColumnPin={toggleColumnPin}
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              handleClearSearch={handleClearSearch}
              showIndentToggle={true}
              showPageNumberToggle={true}
              showColumnPinToggle={true}
              showSearch={true}
              searchPlaceholder="회원 검색..."
            />
          </Paper>
        </Grid>

        {/* 테이블 필터와 페이지네이션 예제 섹션 */}
        <TableFilterAndPaginationExample />

        {/* 페이지 헤더 예제 설명 카드 */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              PageHeader 컴포넌트 사용 예시
            </Typography>
            <Typography variant="body1">
              이 페이지의 상단에 있는 헤더는 <code>PageHeader</code> 컴포넌트를 사용하여 구현되었습니다.
              왼쪽에는 페이지 제목이, 오른쪽에는 추가, 표시 옵션, 새로고침 버튼이 있습니다.
              각 버튼은 클릭하면 스낵바 알림이 표시됩니다.
            </Typography>
          </Paper>
        </Grid>

        {/* 컴포넌트 문서 포함 */}
        <PageHeaderDocs />
        <TableHeaderDocs />
        <TableFilterAndPaginationDocs />
      </Grid>

      {/* 표시 옵션 메뉴 */}
      <Menu
        anchorEl={optionsMenuAnchor}
        open={isOptionsMenuOpen}
        onClose={handleCloseOptionsMenu}
        PaperProps={{
          elevation: 2,
          sx: { mt: 1, borderRadius: 2 }
        }}
      >
        <MenuItem onClick={() => handleViewOptionSelect('grid')}>
          <ListItemIcon>
            <ViewComfy fontSize="small" />
          </ListItemIcon>
          <ListItemText>그리드 뷰</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewOptionSelect('module')}>
          <ListItemIcon>
            <ViewModule fontSize="small" />
          </ListItemIcon>
          <ListItemText>모듈 뷰</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewOptionSelect('list')}>
          <ListItemIcon>
            <ViewList fontSize="small" />
          </ListItemIcon>
          <ListItemText>리스트 뷰</ListItemText>
        </MenuItem>
      </Menu>

      {/* 스낵바 */}
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
    </Container>
  );
};

export default BaseTemplatePage; 