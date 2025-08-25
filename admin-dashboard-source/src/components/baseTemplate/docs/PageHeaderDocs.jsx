import React from 'react';
import { 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';

/**
 * PageHeader 컴포넌트에 대한 문서 컴포넌트
 * PageHeader에 대한 설명, 사용법, props 정보 등을 제공합니다.
 */
const PageHeaderDocs = () => {
  return (
    <>
      {/* 컴포넌트 설명 카드 */}
      <Grid item xs={12}>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            PageHeader 컴포넌트 설명
          </Typography>
          <Typography variant="body1">
            PageHeader는 페이지 상단에 위치하여 페이지 제목과 다양한 작업 버튼을 제공합니다.
            왼쪽에는 페이지 제목이, 오른쪽에는 추가, 표시 옵션, 새로고침 버튼이 있습니다.
            각 버튼은 클릭하면 특정 기능이 실행되고 스낵바 알림이 표시될 수 있습니다.
          </Typography>
        </Paper>
      </Grid>

      {/* PageHeader 컴포넌트 props 설명 카드 */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardHeader title="PageHeader 컴포넌트 속성" />
          <Divider />
          <CardContent>
            <Typography variant="body1" gutterBottom>
              PageHeader 컴포넌트는 다음과 같은 props를 받습니다:
            </Typography>
            <ul>
              <li><code>title</code> - 페이지 제목 (필수)</li>
              <li><code>onAddClick</code> - 추가 버튼 클릭 핸들러</li>
              <li><code>onDisplayOptionsClick</code> - 표시 옵션 버튼 클릭 핸들러</li>
              <li><code>onRefreshClick</code> - 새로고침 버튼 클릭 핸들러</li>
              <li><code>showAddButton</code> - 추가 버튼 표시 여부 (기본값: true)</li>
              <li><code>showDisplayOptionsButton</code> - 표시 옵션 버튼 표시 여부 (기본값: true)</li>
              <li><code>showRefreshButton</code> - 새로고침 버튼 표시 여부 (기본값: true)</li>
              <li><code>addButtonText</code> - 추가 버튼 텍스트 (기본값: '회원 추가')</li>
              <li><code>customActions</code> - 추가적인 커스텀 액션</li>
              <li><code>sx</code> - 추가적인 스타일 오버라이드</li>
            </ul>
          </CardContent>
        </Card>
      </Grid>

      {/* usePageHeader 훅 설명 카드 */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardHeader title="usePageHeader 커스텀 훅" />
          <Divider />
          <CardContent>
            <Typography variant="body1" gutterBottom>
              usePageHeader 훅은 PageHeader 컴포넌트와 함께 사용하기 위한 상태와 핸들러를 제공합니다:
            </Typography>
            <ul>
              <li><code>notification</code> - 알림 상태 (open, message, severity)</li>
              <li><code>showNotification</code> - 알림 표시 함수</li>
              <li><code>closeNotification</code> - 알림 닫기 함수</li>
              <li><code>handleAddClick</code> - 추가 버튼 클릭 핸들러</li>
              <li><code>handleOptionsClick</code> - 표시 옵션 버튼 클릭 핸들러</li>
              <li><code>handleRefreshClick</code> - 새로고침 버튼 클릭 핸들러</li>
              <li><code>optionsMenuAnchor</code> - 옵션 메뉴 앵커 엘리먼트</li>
              <li><code>isOptionsMenuOpen</code> - 옵션 메뉴 열림 상태</li>
              <li><code>handleCloseOptionsMenu</code> - 옵션 메뉴 닫기 핸들러</li>
            </ul>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default PageHeaderDocs;
 