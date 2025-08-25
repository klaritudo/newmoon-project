import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Stack, Switch, FormControlLabel } from '@mui/material';
import { BaseTable } from '../components/table';
import { TypeTreeView } from '../components';
import { useTypeHierarchy } from '../hooks';
import { tableData, defaultTypeHierarchy, defaultTypes } from './data/tableExampleData';

/**
 * 테이블 컴포넌트 사용 예제
 * 다양한 특수 기능을 갖춘 테이블 구현을 보여줍니다.
 */
const TableExample = () => {
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

  // 행 클릭 핸들러
  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
  };

  // 체크박스 클릭 핸들러
  const handleCheck = (id, checked, checkedItems) => {
    console.log(`Item ${id} ${checked ? 'checked' : 'unchecked'}`, checkedItems);
  };

  // 정렬 핸들러
  const handleSort = (columnId, direction) => {
    console.log(`Sort by ${columnId} in ${direction} order`);
  };

  // 계층 펼치기/접기 핸들러
  const handleToggleExpand = (id) => {
    toggleTypeExpand(id);
  };
  
  // 들여쓰기 모드 토글 핸들러
  const handleToggleIndentMode = (event) => {
    setIndentMode(event.target.checked);
  };

  return (
    <Grid item xs={12}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          테이블 컴포넌트 사용 예시
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          기본적인 테이블 기능과 함께 계층 구조를 지원합니다.
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

          <BaseTable
            columns={columns}
          data={hierarchicalData}
          checkable={true}
          hierarchical={true}
            onRowClick={handleRowClick}
            onSort={handleSort}
            onCheck={handleCheck}
            onToggleExpand={handleToggleExpand}
          indentMode={indentMode}
          sequentialPageNumbers={true}
          />
      </Paper>
    </Grid>
  );
};

export default TableExample; 