import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';

/**
 * TableHeader 컴포넌트에 대한 문서 컴포넌트
 * TableHeader에 대한 설명, 사용법, props 정보 등을 제공합니다.
 */
const TableHeaderDocs = () => {
  return (
    <>
      {/* TableHeader 설명 카드 */}
      <Grid item xs={12}>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            TableHeader 컴포넌트 설명
          </Typography>
          <Typography variant="body1">
            TableHeader는 테이블 상단에 위치하여 테이블 제목, 총 항목 수, 다양한 기능 버튼과 검색 기능을 제공합니다.
            테이블 데이터 표시 방식을 사용자가 커스터마이징할 수 있는 옵션들을 제공합니다.
          </Typography>
        </Paper>
      </Grid>

      {/* TableHeader 컴포넌트 props 설명 카드 */}
      <Grid item xs={12} md={6} sx={{ mt: 3 }}>
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardHeader title="TableHeader 컴포넌트 속성" />
          <Divider />
          <CardContent>
            <Typography variant="body1" gutterBottom>
              TableHeader 컴포넌트는 다음과 같은 props를 받습니다:
            </Typography>
            <ul>
              <li><code>title</code> - 테이블 제목</li>
              <li><code>totalItems</code> - 총 항목 수</li>
              <li><code>countLabel</code> - 항목 수 표시 형식 (예: "총 ##count##명")</li>
              <li><code>indentMode</code> - 들여쓰기 모드 상태</li>
              <li><code>toggleIndentMode</code> - 들여쓰기 모드 토글 함수</li>
              <li><code>sequentialPageNumbers</code> - 연속 페이지 번호 모드 상태</li>
              <li><code>togglePageNumberMode</code> - 페이지 번호 모드 토글 함수</li>
              <li><code>hasPinnedColumns</code> - 고정된 컬럼 존재 여부</li>
              <li><code>toggleColumnPin</code> - 컬럼 고정 토글 함수</li>
              <li><code>searchText</code> - 검색어</li>
              <li><code>handleSearchChange</code> - 검색어 변경 핸들러</li>
              <li><code>handleClearSearch</code> - 검색어 초기화 핸들러</li>
            </ul>
          </CardContent>
        </Card>
      </Grid>

      {/* useTableHeader 훅 설명 카드 */}
      <Grid item xs={12} md={6} sx={{ mt: 3 }}>
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardHeader title="useTableHeader 커스텀 훅" />
          <Divider />
          <CardContent>
            <Typography variant="body1" gutterBottom>
              useTableHeader 훅은 TableHeader 컴포넌트와 함께 사용하기 위한 상태와 핸들러를 제공합니다:
            </Typography>
            <ul>
              <li><code>searchText</code> - 현재 검색어</li>
              <li><code>totalItems</code> - 총 항목 수</li>
              <li><code>indentMode</code> - 들여쓰기 모드 상태</li>
              <li><code>sequentialPageNumbers</code> - 연속 페이지 번호 모드 상태</li>
              <li><code>hasPinnedColumns</code> - 고정된 컬럼 존재 여부</li>
              <li><code>isGridReady</code> - 그리드 준비 상태</li>
              <li><code>handleSearchChange</code> - 검색어 변경 핸들러</li>
              <li><code>handleClearSearch</code> - 검색어 초기화 핸들러</li>
              <li><code>toggleIndentMode</code> - 들여쓰기 모드 토글 함수</li>
              <li><code>togglePageNumberMode</code> - 페이지 번호 모드 토글 함수</li>
              <li><code>toggleColumnPin</code> - 컬럼 고정 토글 함수</li>
            </ul>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default TableHeaderDocs; 