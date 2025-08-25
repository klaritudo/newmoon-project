import React from 'react';
import { 
  Typography, 
  Paper, 
  Grid
} from '@mui/material';
import { TableHeader } from '../components';
import { useTableHeader } from '../hooks';

/**
 * TableHeader 컴포넌트 사용 예제
 * 실제 TableHeader 컴포넌트 사용법을 보여줍니다.
 */
const TableHeaderExample = () => {
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

  return (
    <Grid item xs={12}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          TableHeader 컴포넌트 사용 예시
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
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
  );
};

export default TableHeaderExample;