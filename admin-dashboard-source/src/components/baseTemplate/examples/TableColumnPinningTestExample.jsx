import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Button, Alert } from '@mui/material';
import { BaseTable } from '../components';
import { useTableColumnDrag } from '../hooks';

/**
 * 컬럼 고정 영역 간 이동 기능 테스트 예제
 * 고정영역 ↔ 비고정영역 간의 드래그 앤 드롭 이동을 테스트합니다.
 */
const TableColumnPinningTestExample = () => {
  // 테스트용 간단한 컬럼 정의
  const testColumns = [
    { id: 'checkbox', label: '선택', width: '48px', sortable: false },
    { id: 'number', label: 'No.', width: '60px', sortable: true },
    { id: 'userId', label: '사용자ID', width: '120px', sortable: true },
    { id: 'name', label: '이름', width: '100px', sortable: true },
    { id: 'email', label: '이메일', width: '200px', sortable: true },
    { id: 'status', label: '상태', width: '80px', sortable: true },
    { id: 'role', label: '역할', width: '100px', sortable: true },
    { id: 'createdAt', label: '생성일', width: '120px', sortable: true }
  ];

  // 테스트용 간단한 데이터
  const testData = [
    { id: 1, userId: 'user001', name: '김철수', email: 'kim@example.com', status: '활성', role: '관리자', createdAt: '2024-01-01' },
    { id: 2, userId: 'user002', name: '이영희', email: 'lee@example.com', status: '활성', role: '사용자', createdAt: '2024-01-02' },
    { id: 3, userId: 'user003', name: '박민수', email: 'park@example.com', status: '비활성', role: '사용자', createdAt: '2024-01-03' },
    { id: 4, userId: 'user004', name: '최지영', email: 'choi@example.com', status: '활성', role: '편집자', createdAt: '2024-01-04' },
    { id: 5, userId: 'user005', name: '정현우', email: 'jung@example.com', status: '활성', role: '사용자', createdAt: '2024-01-05' }
  ];

  // 컬럼 드래그 앤 드롭 관련 훅 사용
  const {
    columns,
    dragInfo,
    pinnedColumns,
    enableColumnPinning,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateColumns,
    isColumnPinned,
    toggleColumnPin,
    clearAllPinnedColumns,
    setDefaultPinnedColumns
  } = useTableColumnDrag({
    initialColumns: testColumns,
    enableColumnPinning: true, // 컬럼 고정 기능 활성화
    onColumnOrderChange: (newColumns) => {
      console.log('컬럼 순서 변경:', newColumns);
    }
  });

  // 드래그 앤 드롭은 상시 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // 테스트 버튼 핸들러들
  const handleSetDefaultPinned = () => {
    setDefaultPinnedColumns();
  };

  const handleClearAllPinned = () => {
    clearAllPinnedColumns();
  };

  const handleToggleSpecificColumn = (columnId) => {
    toggleColumnPin(columnId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        컬럼 고정 영역 간 이동 테스트
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        이 예제에서는 고정영역과 비고정영역 간의 드래그 앤 드롭 이동을 테스트할 수 있습니다.
        컬럼을 드래그하여 고정영역 ↔ 비고정영역으로 이동시켜보세요.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>테스트 방법:</strong><br />
          1. 고정영역(왼쪽)의 컬럼을 비고정영역(오른쪽)으로 드래그하면 고정이 해제됩니다.<br />
          2. 비고정영역(오른쪽)의 컬럼을 고정영역(왼쪽)으로 드래그하면 고정됩니다.<br />
          3. 콘솔에서 상세한 로그를 확인할 수 있습니다.
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              컨트롤 버튼
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                onClick={handleSetDefaultPinned}
                size="small"
              >
                기본 고정 설정
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleClearAllPinned}
                size="small"
              >
                모든 고정 해제
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => handleToggleSpecificColumn('name')}
                size="small"
              >
                이름 컬럼 토글
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => handleToggleSpecificColumn('email')}
                size="small"
              >
                이메일 컬럼 토글
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ height: '400px', overflow: 'auto' }}>
              <BaseTable
                columns={columns}
                data={testData}
                checkable={true}
                hierarchical={false}
                draggableColumns={draggableColumns}
                dragHandlers={dragHandlers}
                dragInfo={dragInfo}
                pinnedColumns={pinnedColumns}
                enableColumnPinning={enableColumnPinning}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 상태 정보 */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          현재 상태
        </Typography>
        <Typography variant="body2" component="div">
          <strong>컬럼 고정 기능:</strong> {enableColumnPinning ? '활성화' : '비활성화'}<br />
          <strong>고정된 컬럼 수:</strong> {pinnedColumns.length}개<br />
          <strong>고정된 컬럼 목록:</strong> {pinnedColumns.length > 0 ? pinnedColumns.join(', ') : '없음'}<br />
          <strong>전체 컬럼 수:</strong> {columns.length}개<br />
          <strong>드래그 중인 컬럼:</strong> {dragInfo.dragging ? dragInfo.columnId : '없음'}
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          <strong>컬럼별 고정 상태:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {columns.map(column => (
            <Box 
              key={column.id}
              sx={{ 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                bgcolor: isColumnPinned(column.id) ? 'primary.light' : 'grey.300',
                color: isColumnPinned(column.id) ? 'primary.contrastText' : 'text.primary',
                fontSize: '0.75rem'
              }}
            >
              {column.label} {isColumnPinned(column.id) ? '(고정)' : '(일반)'}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TableColumnPinningTestExample; 