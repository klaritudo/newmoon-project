import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Stack, FormControlLabel, Switch } from '@mui/material';
import { BaseTable } from '../components/table';
import { TypeTreeView } from '../components';
import { useTable, useTypeHierarchy } from '../hooks';
import { tableData, defaultTypeHierarchy, defaultTypes } from './data/tableExampleData';

/**
 * 테이블 훅 사용 예제
 * useTable 훅을 사용하여 테이블 기능을 구현합니다.
 */
const TableHookExample = () => {
  // 들여쓰기 모드 상태
  const [indentMode, setIndentMode] = useState(true);
  
  // 유형 계층 관리 훅 사용
  const {
    hierarchicalData,
    expandedTypes,
    toggleTypeExpand,
    setAllExpanded
  } = useTypeHierarchy({
    data: tableData,
    types: defaultTypes,
    typeHierarchy: defaultTypeHierarchy,
    expandAll: true
  });
  
  // 테이블 훅 사용
  const {
    checkedItems,
    sortConfig,
    expandedRows,
    selectedRow,
    handleSort,
    handleCheck,
    handleToggleAll,
    handleToggleExpand,
    handleRowClick
  } = useTable({
    data: hierarchicalData,
    indentMode
  });
  
  // 테이블 컬럼 정의
  const columns = [
    {
      id: 'checkbox',
      type: 'checkbox',
      width: 50,
      sortable: false,
    },
    {
      id: 'number',
      type: 'number',
      header: 'No.',
      width: 70,
      align: 'center',
    },
    {
      id: 'userId',
      header: '아이디(닉네임)',
      type: 'multiline',
      width: 150,
      sortable: true,
    },
    {
      id: 'type',
      header: '유형',
      type: 'hierarchical',
      width: 180,
      cellRenderer: 'chip',
      sortable: true,
    },
    {
      id: 'parentTypes',
      header: '상위 유형',
      type: 'horizontal',
      width: 200,
      cellRenderer: 'chip',
    },
    {
      id: 'actions',
      header: '관리',
      type: 'button',
      width: 160,
      align: 'center',
      buttons: [
        { label: '수정', color: 'primary', variant: 'outlined' },
        { label: '삭제', color: 'error', variant: 'outlined' },
      ],
      buttonDirection: 'row',
    },
    {
      id: 'description',
      header: '설명',
      type: 'multiline',
      width: 180,
    },
    {
      id: 'group1',
      type: 'group',
      header: '그룹컬럼1',
      children: [
        { id: 'child1', header: '자식컬럼1', width: 120 },
        { id: 'child2', header: '자식컬럼2', width: 120 },
      ],
    },
    {
      id: 'group2',
      type: 'group',
      header: '그룹컬럼2',
      children: [
        { id: 'child3', header: '자식컬럼3', width: 120 },
        { id: 'child4', header: '자식컬럼4', width: 120 },
        { id: 'child5', header: '자식컬럼5', width: 120 },
        { id: 'child6', header: '자식컬럼6', width: 120 },
      ],
    },
  ];

  // 들여쓰기 모드 토글 핸들러
  const handleToggleIndentMode = (event) => {
    setIndentMode(event.target.checked);
  };
  
  // 계층 펼치기/접기 핸들러
  const handleToggleExpand2 = (id) => {
    toggleTypeExpand(id);
    handleToggleExpand(id);
  };

  return (
    <Grid item xs={12}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          테이블 훅 (useTable) 사용 예시
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          useTable 훅을 사용하여 테이블 기능을 구현한 예제입니다.
        </Typography>

        {/* 유형 계층 트리 뷰 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            유형 계층 구조
          </Typography>
          <TypeTreeView 
            types={defaultTypes}
            typeHierarchy={defaultTypeHierarchy}
            expandedTypes={expandedTypes}
            onTypeToggle={toggleTypeExpand}
            onExpandAll={setAllExpanded}
            direction="horizontal"
          />
        </Box>

        {/* 옵션 컨트롤 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={indentMode}
                onChange={handleToggleIndentMode}
                color="primary"
              />
            }
            label="들여쓰기 모드"
          />
        </Stack>
        
        {/* 선택된 행 정보 표시 */}
        {selectedRow && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2">
              선택된 행: ID={selectedRow.id}, 유형={selectedRow.type?.label}
            </Typography>
          </Box>
        )}

          <BaseTable
            columns={columns}
          data={hierarchicalData}
          checkable={true}
          hierarchical={true}
            checkedItems={checkedItems}
            expandedRows={expandedRows}
            onRowClick={handleRowClick}
            onSort={handleSort}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
          onToggleExpand={handleToggleExpand2}
          sortConfig={sortConfig}
          indentMode={indentMode}
          sequentialPageNumbers={true}
          />
      </Paper>
    </Grid>
  );
};

export default TableHookExample; 