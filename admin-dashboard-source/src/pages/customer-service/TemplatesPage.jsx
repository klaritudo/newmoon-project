import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, useTheme, Button, Chip } from '@mui/material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TableHeightSetting, 
  TableResizeHandle, 
  ColumnVisibilityDialog, 
  PageHeader, 
  PageContainer,
  TableDebugInfo 
} from '../../components/baseTemplate/components';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import TemplateDetailDialog from '../../components/dialogs/TemplateDetailDialog.jsx';
import { 
  templatesColumns,
  templateCategoryOptions,
  templateStatusOptions,
  templateFilterFields,
  templateSearchFields,
  generateTemplatesData
} from './data/templatesData';
import usePageData from '../../hooks/usePageData';
import useColumnVisibility from '../../components/baseTemplate/hooks/useColumnVisibility';
import useTableAutoHeight from '../../components/baseTemplate/hooks/useTableAutoHeight';
import useTableResize from '../../components/baseTemplate/hooks/useTableResize';
import useTableHeaderFixed from '../../components/baseTemplate/hooks/useTableHeaderFixed';
import useTableColumnDrag from '../../components/baseTemplate/hooks/useTableColumnDrag';

/**
 * 템플릿 관리 페이지
 * 자동응답 템플릿 목록 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const TemplatesPage = () => {
  const theme = useTheme();

  // 전역 알림 사용
  const { handleRefresh } = useNotification();

  // 새로고침 핸들러
  const handleRefreshClick = useCallback(() => {
    handleRefresh('템플릿관리');
  }, [handleRefresh]);

  // 범용 페이지 데이터 훅 사용
  const {
    data,
    isLoading,
    error,
    isInitialized
  } = usePageData({
    pageType: 'templates',
    dataGenerator: generateTemplatesData,
    requiresMembersData: false
  });

  // 로컬 상태로 데이터 관리 (상태 변경을 위해)
  const [localTemplatesData, setLocalTemplatesData] = useState([]);

  // 데이터가 없을 때 직접 생성 (fallback)
  const finalData = useMemo(() => {
    if (!data || data.length === 0) {
      return generateTemplatesData();
    }
    return data;
  }, [data]);

  // finalData가 변경될 때마다 로컬 상태 업데이트
  useEffect(() => {
    console.log('📊 finalData 변경됨:', finalData.length, '개 템플릿');
    setLocalTemplatesData(finalData);
  }, [finalData]);

  // localTemplatesData 변경 시 로그
  useEffect(() => {
    console.log('📋 localTemplatesData 업데이트됨:', localTemplatesData.length, '개 템플릿');
    if (localTemplatesData.length > 0) {
      console.log('📋 첫 번째 템플릿 샘플:', localTemplatesData[0]);
    }
  }, [localTemplatesData]);

  // 템플릿 상세정보 다이얼로그 상태
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'create'

  // 선택된 템플릿을 실시간으로 업데이트 (상태 변경 시)
  const currentSelectedTemplate = useMemo(() => {
    if (!selectedTemplate || !localTemplatesData) return selectedTemplate;
    
    // 로컬 데이터에서 최신 상태 찾기
    const updatedTemplate = localTemplatesData.find(tpl => tpl.id === selectedTemplate.id);
    return updatedTemplate || selectedTemplate;
  }, [selectedTemplate, localTemplatesData]);

  // 컬럼 가시성 관리 - useColumnVisibility 훅 사용 (안정적인 순서로 이동)
  const {
    visibleColumns,
    toggleColumnVisibility,
    resetToDefault,
    columnVisibility
  } = useColumnVisibility(templatesColumns || [], {
    storageKey: 'templates-column-visibility'
  });

  // 테이블 높이 자동 조정 - useTableAutoHeight 훅 사용
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

  // 테이블 리사이즈 기능 - useTableResize 훅 사용
  const {
    isDragging,
    getResizeHandleProps,
    calculateMaxHeight
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
  
  // 헤더 행 고정 기능 - useTableHeaderFixed 훅 사용
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    zIndex: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });

  // 템플릿 상세보기 핸들러 (템플릿명 클릭 시)
  const handleViewTemplate = useCallback((template) => {
    console.log('템플릿 상세보기:', template);
    setSelectedTemplate(template);
    setDialogMode('view');
    setOpenDetailDialog(true);
  }, []);

  // 새 템플릿 생성 핸들러
  const handleCreateTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setDialogMode('create');
    setOpenDetailDialog(true);
  }, []);

  // 템플릿 수정 핸들러
  const handleEditTemplate = useCallback((template) => {
    console.log('템플릿 수정:', template);
    setSelectedTemplate(template);
    setDialogMode('edit');
    setOpenDetailDialog(true);
  }, []);

  // 템플릿 삭제 핸들러
  const handleDeleteTemplate = useCallback((template) => {
    console.log('템플릿 삭제:', template);
    
    // 삭제 확인 다이얼로그 (간단한 confirm으로 구현)
    if (window.confirm(`"${template.title}" 템플릿을 삭제하시겠습니까?`)) {
      setLocalTemplatesData(prevData => {
        const updatedData = prevData.filter(t => t.id !== template.id);
        console.log(`템플릿 ${template.id} 삭제 완료`);
        return updatedData;
      });
    }
  }, []);

  // 상태 변경 핸들러
  const handleStatusChange = useCallback((templateId, newStatus) => {
    console.log(`템플릿 ${templateId}의 상태를 ${newStatus}로 변경`);
    
    // 로컬 데이터 업데이트
    setLocalTemplatesData(prevData => {
      return prevData.map(template => {
        if (template.id === templateId) {
          const updatedTemplate = {
            ...template,
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0]
          };
          
          console.log(`템플릿 ${templateId} 상태 변경 완료: ${newStatus}`);
          return updatedTemplate;
        }
        return template;
      });
    });
  }, []);

  // 템플릿 저장 핸들러
  const handleSaveTemplate = useCallback((templateData) => {
    console.log('템플릿 저장:', templateData);
    
    setLocalTemplatesData(prevData => {
      const existingIndex = prevData.findIndex(template => template.id === templateData.id);
      
      if (existingIndex >= 0) {
        // 기존 템플릿 업데이트
        const updatedData = [...prevData];
        updatedData[existingIndex] = {
          ...updatedData[existingIndex],
          ...templateData,
          no: updatedData[existingIndex].no // no는 유지
        };
        console.log('템플릿 업데이트 완료:', templateData.id);
        return updatedData;
      } else {
        // 새 템플릿 추가
        const newTemplate = {
          ...templateData,
          no: prevData.length + 1,
          id: templateData.id || Date.now()
        };
        console.log('새 템플릿 추가 완료:', newTemplate.id);
        return [...prevData, newTemplate];
      }
    });
    
    // 다이얼로그 닫기
    setOpenDetailDialog(false);
  }, []);

  // 최종 컬럼 (가시성 적용)
  const finalColumns = useMemo(() => {
    return visibleColumns.map(column => {
      if (column.type === 'clickable' && column.id === 'title') {
        // For clickable type, set onClick directly on the column
        return {
          ...column,
          clickable: true,
          onClick: handleViewTemplate
        };
      }
      
      if (column.type === 'actions' && column.id === 'actions') {
        // For actions type, set actions array directly on the column
        return {
          ...column,
          actions: [
            {
              type: 'button',
              label: '수정',
              variant: 'outlined',
              size: 'small',
              color: 'primary',
              onClick: handleEditTemplate
            },
            {
              type: 'button',
              label: '삭제',
              variant: 'outlined',
              size: 'small',
              color: 'error',
              onClick: handleDeleteTemplate
            }
          ]
        };
      }
      
      if (column.type === 'chip' && column.id === 'status') {
        // Add render function for status chip coloring
        return {
          ...column,
          render: (row) => {
            // row가 객체인 경우 status 값을 추출, 아니면 그대로 사용
            const statusValue = typeof row === 'object' ? row.status : row;
            return {
              label: statusValue,
              color: statusValue === '활성' ? 'success' : 'default'
            };
          }
        };
      }
      
      if (column.id === 'usageCount') {
        // Add render function for usage count formatting
        return {
          ...column,
          render: (value) => `${value}회`
        };
      }
      
      return column;
    });
  }, [visibleColumns, handleViewTemplate, handleEditTemplate, handleDeleteTemplate]);

  // 테이블 필터 및 페이지네이션 - 직접 구현 (안정성을 위해)
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);

  // 데이터 필터링
  const filteredData = useMemo(() => {
    return localTemplatesData.filter(item => {
      // 카테고리 필터
      if (filters.category && filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      // 상태 필터
      if (filters.status && filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [localTemplatesData, filters]);

  // 페이지네이션 적용
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalItems = filteredData.length;

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(0); // 필터 변경 시 첫 페이지로
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // 페이지 크기 변경 핸들러 - prop 이름을 onRowsPerPageChange로 맞춤
  const handleRowsPerPageChange = useCallback((event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setPage(0);
    console.log('템플릿 페이지 - 페이지당 행 수 변경:', newPageSize);
  }, []);

  // 필터 초기화 핸들러
  const resetFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  // 다이얼로그 상태
  const [openColumnDialog, setOpenColumnDialog] = useState(false);

  // 액션 버튼들
  const actionButtons = useMemo(() => [
    {
      label: '새 템플릿',
      variant: 'contained',
      color: 'primary',
      onClick: handleCreateTemplate
    },
    {
      label: '선택 삭제',
      variant: 'outlined',
      color: 'error',
      disabled: selectedItems.length === 0,
      onClick: () => {
        console.log('선택된 템플릿 삭제:', selectedItems);
        // TODO: 선택된 템플릿 삭제 확인 다이얼로그
      }
    }
  ], [selectedItems, handleCreateTemplate]);

  // 선택된 아이템 상태를 객체 형태로 변환
  const checkedItems = useMemo(() => {
    const result = {};
    selectedItems.forEach(id => {
      result[id] = true;
    });
    return result;
  }, [selectedItems]);

  // 모든 아이템이 선택되었는지 확인
  const allChecked = useMemo(() => {
    return paginatedData.length > 0 && paginatedData.every(item => selectedItems.includes(item.id));
  }, [paginatedData, selectedItems]);

  // 체크박스 변경 핸들러
  const handleCheck = useCallback((id, checked, newCheckedItems) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  }, []);

  // 모든 체크박스 토글 핸들러
  const handleToggleAll = useCallback((checked) => {
    if (checked) {
      // 현재 페이지의 모든 아이템 선택
      const currentPageIds = paginatedData.map(item => item.id);
      setSelectedItems(prev => {
        const newItems = [...prev];
        currentPageIds.forEach(id => {
          if (!newItems.includes(id)) {
            newItems.push(id);
          }
        });
        return newItems;
      });
    } else {
      // 현재 페이지의 모든 아이템 선택 해제
      const currentPageIds = paginatedData.map(item => item.id);
      setSelectedItems(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  }, [paginatedData]);

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // 정렬 핸들러
  const handleSort = useCallback((columnId, direction) => {
    setSortConfig({ key: columnId, direction });
    
    // 실제 정렬 로직 구현
    if (direction) {
      setLocalTemplatesData(prevData => {
        const sortedData = [...prevData].sort((a, b) => {
          const aValue = a[columnId];
          const bValue = b[columnId];
          
          if (aValue === bValue) return 0;
          
          if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        console.log(`${columnId} 컬럼 ${direction} 정렬 완료`);
        return sortedData;
      });
    }
  }, []);

  // 테이블 컬럼 드래그 훅 사용
  const {
    dragHandlers,
    dragInfo,
    handleColumnOrderChange
  } = useTableColumnDrag({
    initialColumns: finalColumns,
    tableId: 'templates-page',
    enableColumnPinning: true
  });

  return (
    <PageContainer>
      <PageHeader 
        title="템플릿 관리"
        subtitle="자동응답 템플릿을 관리할 수 있습니다."
        onAddClick={handleCreateTemplate}
        onDisplayOptionsClick={(anchorEl) => {
          console.log('표시 옵션 클릭:', anchorEl);
          // TODO: 표시 옵션 메뉴 구현 (컬럼 가시성, 테이블 설정 등)
          setOpenColumnDialog(true);
        }}
        onRefresh={handleRefreshClick}
        addButtonText="템플릿 추가"
        showAddButton={true}
        showDisplayOptionsButton={true}
        showRefreshButton={true}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* 테이블 헤더 */}
        <TableHeader
          title="템플릿 목록"
          subtitle={`총 ${totalItems}개의 템플릿`}
          actionButtons={actionButtons}
          onColumnSettings={() => setOpenColumnDialog(true)}
        />

        {/* 테이블 높이 설정 */}
        <TableHeightSetting
          autoHeight={autoHeight}
          tableHeight={tableHeight}
          toggleAutoHeight={toggleAutoHeight}
          setManualHeight={setManualHeight}
        />

        {/* 테이블 필터 및 페이지네이션 */}
        <TableFilterAndPagination
          filterProps={{
            activeFilters: filters,
            handleFilterChange: (filterId, value) => {
              setFilters(prev => ({
                ...prev,
                [filterId]: value
              }));
              setPage(0);
            },
            filterOptions: templateFilterFields.map(field => ({
              id: field.key,
              label: field.label,
              items: field.options
            })),
            showDateFilter: false
          }}
          paginationProps={{
            page: page,
            rowsPerPage: rowsPerPage,
            count: totalItems,
            onPageChange: handlePageChange,
            onRowsPerPageChange: handleRowsPerPageChange
          }}
        />

        {/* 테이블 컨테이너 */}
        <Box ref={containerRef} sx={{ position: 'relative' }}>
          <BaseTable
            data={paginatedData}
            columns={finalColumns}
            checkable={true}
            checkedItems={checkedItems}
            allChecked={allChecked}
            onCheck={handleCheck}
            onToggleAll={handleToggleAll}
            sortConfig={sortConfig}
            onSort={handleSort}
            onRowClick={handleViewTemplate}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalItems}
            sequentialPageNumbers={true}
            tableHeaderRef={tableHeaderRef}
            headerStyle={getTableHeaderStyles()}
            fixedHeader={false}
            maxHeight={tableHeight}
            draggableColumns={true}
            onColumnOrderChange={handleColumnOrderChange}
            dragHandlers={dragHandlers}
            dragInfo={dragInfo}
          />

          {/* 테이블 리사이즈 핸들 */}
          <TableResizeHandle 
            resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
            isDragging={isDragging}
          />
        </Box>
      </Paper>

      {/* 컬럼 가시성 다이얼로그 */}
      <ColumnVisibilityDialog
        open={openColumnDialog}
        onClose={() => setOpenColumnDialog(false)}
        columns={templatesColumns}
        visibleColumns={columnVisibility}
        onToggleColumn={toggleColumnVisibility}
        onReset={resetToDefault}
      />

      {/* 템플릿 상세 다이얼로그 */}
      <TemplateDetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        template={currentSelectedTemplate}
        onSave={handleSaveTemplate}
        mode={dialogMode}
      />
    </PageContainer>
  );
};

export default TemplatesPage; 