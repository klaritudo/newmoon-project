import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Box,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

/**
 * useDynamicTypes 훅 문서 컴포넌트
 */
const UseDynamicTypesDocs = () => {
  return (
    <Grid item xs={12}>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader
          title="useDynamicTypes 훅"
          subheader="동적 유형 관리를 위한 범용 훅"
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent>
          <Typography variant="body1" paragraph>
            <code>useDynamicTypes</code> 훅은 외부 데이터 서비스를 통해 동적으로 유형 정보를 관리하는 범용 훅입니다.
            에이전트 레벨, 카테고리, 분류 등 다양한 계층 구조 데이터를 처리할 수 있습니다.
          </Typography>

          {/* 기본 사용법 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            기본 사용법
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`import { useDynamicTypes } from '../components/baseTemplate/hooks';
import myDataService from '../services/myDataService';

const MyComponent = () => {
  const {
    types,
    typeHierarchy,
    isLoading,
    error,
    isInitialized,
    generateDataByTypes
  } = useDynamicTypes({
    dataService: myDataService,
    autoInitialize: true,
    enableRealtime: true
  });

  // 유형별 데이터 생성
  const data = generateDataByTypes((types, hierarchy, helpers) => {
    return Object.keys(types).map((typeId, index) => ({
      id: index + 1,
      name: \`Item \${index + 1}\`,
      type: types[typeId],
      parentTypes: helpers.getParentTypes(typeId)
    }));
  });

  return (
    <div>
      {isLoading && <div>로딩 중...</div>}
      {error && <div>오류: {error}</div>}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};`}
            </Typography>
          </Box>

          {/* 매개변수 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            매개변수
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>매개변수</strong></TableCell>
                  <TableCell><strong>타입</strong></TableCell>
                  <TableCell><strong>기본값</strong></TableCell>
                  <TableCell><strong>설명</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>dataService</code></TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>null</TableCell>
                  <TableCell>데이터 서비스 객체 (필수)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>autoInitialize</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>true</TableCell>
                  <TableCell>자동 초기화 여부</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>enableRealtime</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>true</TableCell>
                  <TableCell>실시간 업데이트 활성화 여부</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>initialTypes</code></TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>{'{}'}</TableCell>
                  <TableCell>초기 유형 데이터</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>initialTypeHierarchy</code></TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>{'{}'}</TableCell>
                  <TableCell>초기 계층 구조 데이터</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 반환값 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            반환값
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>속성</strong></TableCell>
                  <TableCell><strong>타입</strong></TableCell>
                  <TableCell><strong>설명</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>types</code></TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>유형 정보 객체</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>typeHierarchy</code></TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>계층 구조 정보</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>rawData</code></TableCell>
                  <TableCell>Array</TableCell>
                  <TableCell>원본 데이터 배열</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>isLoading</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>로딩 상태</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>error</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>오류 메시지</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>isInitialized</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>초기화 완료 여부</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>generateDataByTypes</code></TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>유형별 데이터 생성 함수</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>getTypeInfo</code></TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>특정 유형 정보 조회</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>getParentTypes</code></TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>부모 유형들 조회</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>getChildTypes</code></TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>자식 유형들 조회</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 데이터 서비스 인터페이스 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            데이터 서비스 인터페이스
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            데이터 서비스 객체는 다음 메서드들을 구현해야 합니다:
          </Alert>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// 필수 메서드
dataService.getTypes()          // 유형 정보 반환
dataService.getTypeHierarchy()  // 계층 구조 반환
dataService.getRawData()        // 원본 데이터 반환

// 선택적 메서드
dataService.initialize()        // 서비스 초기화
dataService.addListener()       // 실시간 리스너 등록
dataService.removeListener()    // 리스너 제거
dataService.requestInitialData() // 데이터 재요청
dataService.refresh()           // 데이터 새로고침`}
            </Typography>
          </Box>

          {/* 고급 사용법 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            고급 사용법
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// 커스텀 데이터 생성
const customData = generateDataByTypes((types, hierarchy, helpers) => {
  const typeKeys = Object.keys(types);
  
  return typeKeys.map((typeId, index) => {
    const type = types[typeId];
    const parentTypes = helpers.getParentTypes(typeId);
    const childTypes = helpers.getChildTypes(typeId);
    
    return {
      id: index + 1,
      typeId,
      typeName: type.label,
      level: parentTypes.length,
      hasChildren: childTypes.length > 0,
      parentChain: parentTypes.map(p => p.label).join(' > '),
      // 커스텀 로직 추가
      customField: \`Custom-\${type.label}-\${index}\`
    };
  });
});

// 특정 유형 정보 조회
const typeInfo = getTypeInfo('agent_level_1');
const parentTypes = getParentTypes('agent_level_1');
const childTypes = getChildTypes('agent_level_1');`}
            </Typography>
          </Box>

          {/* 주의사항 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            주의사항
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              • 데이터 서비스는 반드시 <code>getTypes()</code>, <code>getTypeHierarchy()</code>, <code>getRawData()</code> 메서드를 구현해야 합니다.<br/>
              • 실시간 업데이트를 사용하려면 <code>addListener()</code>와 <code>removeListener()</code> 메서드가 필요합니다.<br/>
              • <code>generateDataByTypes</code> 함수는 유형 데이터가 없을 때 빈 배열을 반환합니다.
            </Typography>
          </Alert>

          {/* 예제 링크 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            관련 예제
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="TableFilterAndPaginationExample" variant="outlined" />
            <Chip label="MembersPage" variant="outlined" />
            <Chip label="AgentLevelService 연동" variant="outlined" />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default UseDynamicTypesDocs; 