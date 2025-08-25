import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';

/**
 * TableFilterAndPagination 컴포넌트 및 useTableFilterAndPagination 훅 문서화
 * 사용법과 속성 정보 제공
 */
const TableFilterAndPaginationDocs = () => {
  return (
    <Grid item xs={12}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
          TableFilterAndPagination 컴포넌트
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          개요
        </Typography>
        <Typography variant="body2" paragraph>
          TableFilterAndPagination 컴포넌트는 테이블의 필터링과 페이지네이션 기능을 하나의 컴포넌트로 결합한 것입니다.
          반응형으로 설계되어 모바일에서는 세로로, 데스크톱에서는 가로로 배치됩니다.
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          사용 방법
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2, overflow: 'auto' }}>
          <pre style={{ margin: 0 }}>
            <code>
{`import { TableFilterAndPagination } from '../components/baseTemplate/components';
import { useTableFilterAndPagination } from '../components/baseTemplate/hooks';

// 훅 사용
const {
  activeFilters,
  handleFilterChange,
  page,
  rowsPerPage,
  totalCount,
  handlePageChange,
  handleRowsPerPageChange
} = useTableFilterAndPagination({
  filterOptions: {
    initialFilters: { status: 'all' }
  },
  paginationOptions: {
    totalItems: 100
  }
});

// 컴포넌트 사용
<TableFilterAndPagination
  filterProps={{
    activeFilters: activeFilters,
    handleFilterChange: handleFilterChange,
    filterOptions: [
      {
        id: 'status',
        label: '상태',
        items: [
          { value: 'all', label: '전체' },
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' }
        ]
      }
    ]
  }}
  paginationProps={{
    page: page,
    count: totalCount,
    rowsPerPage: rowsPerPage,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange
  }}
  showDivider={true}
/>`}
            </code>
          </pre>
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          컴포넌트 Props
        </Typography>
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>속성</strong></TableCell>
                <TableCell><strong>타입</strong></TableCell>
                <TableCell><strong>설명</strong></TableCell>
                <TableCell><strong>기본값</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>filterProps</TableCell>
                <TableCell>object</TableCell>
                <TableCell>TableFilter 컴포넌트에 전달할 속성들</TableCell>
                <TableCell>{"{}"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>paginationProps</TableCell>
                <TableCell>object</TableCell>
                <TableCell>TablePagination 컴포넌트에 전달할 속성들</TableCell>
                <TableCell>{"{}"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>showDivider</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>필터/페이지네이션 하단에 구분선 표시 여부</TableCell>
                <TableCell>true</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>sx</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Material-UI의 sx 속성을 통한 추가 스타일링</TableCell>
                <TableCell>{"{}"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          컴포넌트 특징
        </Typography>
        <ul>
          <Typography component="li" variant="body2">
            반응형 레이아웃: 모바일에서는 세로로, 데스크톱에서는 가로로 배치
          </Typography>
          <Typography component="li" variant="body2">
            TableFilter와 TablePagination 컴포넌트를 손쉽게 결합
          </Typography>
          <Typography component="li" variant="body2">
            테이블 위 또는 아래에 배치 가능
          </Typography>
          <Typography component="li" variant="body2">
            하단 구분선 표시 옵션으로 테이블 콘텐츠와의 시각적 구분 제공
          </Typography>
          <Typography component="li" variant="body2">
            Material-UI의 sx 속성을 통한 쉬운 스타일 커스터마이징
          </Typography>
        </ul>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
          useTableFilterAndPagination 훅
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          개요
        </Typography>
        <Typography variant="body2" paragraph>
          useTableFilterAndPagination 훅은 테이블의 필터링과 페이지네이션 기능을 통합하여 관리하는 커스텀 훅입니다.
          useTableFilter와 useTablePagination 훅을 결합하여 데이터 필터링과 페이지 이동을 효율적으로 처리합니다.
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          훅 옵션
        </Typography>
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>옵션</strong></TableCell>
                <TableCell><strong>타입</strong></TableCell>
                <TableCell><strong>설명</strong></TableCell>
                <TableCell><strong>기본값</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>filterOptions</TableCell>
                <TableCell>object</TableCell>
                <TableCell>useTableFilter 훅에 전달할 옵션</TableCell>
                <TableCell>{"{}"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>paginationOptions</TableCell>
                <TableCell>object</TableCell>
                <TableCell>useTablePagination 훅에 전달할 옵션</TableCell>
                <TableCell>{"{}"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>onStateChange</TableCell>
                <TableCell>function</TableCell>
                <TableCell>필터 또는 페이지네이션 상태 변경 시 호출될 콜백 함수</TableCell>
                <TableCell>undefined</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          filterOptions 속성
        </Typography>
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>속성</strong></TableCell>
                <TableCell><strong>타입</strong></TableCell>
                <TableCell><strong>설명</strong></TableCell>
                <TableCell><strong>기본값</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>initialFilters</TableCell>
                <TableCell>object</TableCell>
                <TableCell>초기 필터 상태</TableCell>
                <TableCell>{"{}"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>onFilterChange</TableCell>
                <TableCell>function</TableCell>
                <TableCell>필터 변경 시 호출될 콜백 함수</TableCell>
                <TableCell>undefined</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>initialDateFilterActive</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>초기 날짜 필터 활성화 상태</TableCell>
                <TableCell>false</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>initialDateRange</TableCell>
                <TableCell>object</TableCell>
                <TableCell>초기 날짜 범위</TableCell>
                <TableCell>{"{ startDate: null, endDate: null }"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          paginationOptions 속성
        </Typography>
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>속성</strong></TableCell>
                <TableCell><strong>타입</strong></TableCell>
                <TableCell><strong>설명</strong></TableCell>
                <TableCell><strong>기본값</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>initialPage</TableCell>
                <TableCell>number</TableCell>
                <TableCell>초기 페이지</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>initialRowsPerPage</TableCell>
                <TableCell>number</TableCell>
                <TableCell>초기 페이지당 행 수</TableCell>
                <TableCell>10</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>rowsPerPageOptions</TableCell>
                <TableCell>array</TableCell>
                <TableCell>페이지당 행 옵션</TableCell>
                <TableCell>[10, 25, 50, 100]</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>totalItems</TableCell>
                <TableCell>number</TableCell>
                <TableCell>총 항목 수</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>onPageChange</TableCell>
                <TableCell>function</TableCell>
                <TableCell>페이지 변경 시 호출될 콜백 함수</TableCell>
                <TableCell>undefined</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>onRowsPerPageChange</TableCell>
                <TableCell>function</TableCell>
                <TableCell>페이지당 행 수 변경 시 호출될 콜백 함수</TableCell>
                <TableCell>undefined</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          훅 반환값
        </Typography>
        <Typography variant="body2" paragraph>
          이 훅은 useTableFilter와 useTablePagination에서 제공하는 모든 상태와 함수를 결합하여 반환합니다.
          추가로 resetAllFiltersAndPagination 함수를 제공하여 모든 필터와 페이지네이션을 초기화할 수 있습니다.
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          훅 특징
        </Typography>
        <ul>
          <Typography component="li" variant="body2">
            필터와 페이지네이션 상태를 통합 관리
          </Typography>
          <Typography component="li" variant="body2">
            필터 변경 시 자동으로 첫 페이지로 이동
          </Typography>
          <Typography component="li" variant="body2">
            페이지당 행 수 변경 시 자동으로 첫 페이지로 이동
          </Typography>
          <Typography component="li" variant="body2">
            통합 상태 변경 콜백을 통한 데이터 페칭 관리
          </Typography>
          <Typography component="li" variant="body2">
            간편한 API로 복잡한 테이블 상태 관리 단순화
          </Typography>
        </ul>
      </Paper>
    </Grid>
  );
};

export default TableFilterAndPaginationDocs; 