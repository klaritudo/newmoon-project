import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { TableExample } from '../examples';

/**
 * 테이블 컴포넌트 문서화
 * 
 * 테이블 컴포넌트의 사용 방법과 예제를 제공합니다.
 */
const TableDocs = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        테이블 컴포넌트
      </Typography>
      
      <Typography variant="body1" paragraph>
        다양한 특수 기능을 갖춘 테이블 컴포넌트입니다. 체크박스, 계층형 구조, 그룹 헤더, 다양한 셀 타입 등을 지원합니다.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        기능
      </Typography>
      
      <Typography component="div" variant="body1">
        <ul>
          <li>체크박스 컬럼 지원</li>
          <li>번호 컬럼 (페이지별/연속 번호)</li>
          <li>줄바꿈 지원 (멀티라인 셀)</li>
          <li>계층형 구조 (들여쓰기, 접고 펴기)</li>
          <li>칩 스타일 데이터 표시</li>
          <li>가로 정렬 (상위 계층 목록 등)</li>
          <li>셀 내 버튼 여러 개 배치</li>
          <li>그룹 컬럼 헤더</li>
          <li>정렬 기능</li>
        </ul>
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        사용 방법
      </Typography>
      
      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 3 }}>
        <Typography component="pre" sx={{ overflowX: 'auto' }}>
          {`
import { BaseTable } from '../components/baseTemplate/components/table';

// 컬럼 정의
const columns = [
  {
    id: 'checkbox',
    type: 'checkbox',
    width: 50,
  },
  {
    id: 'number',
    type: 'number',
    header: 'No.',
    width: 70,
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
  // ... 더 많은 컬럼 정의
];

// 데이터
const data = [
  {
    id: 1,
    userId: 'user1\\nadmin1',
    type: { label: '본사', color: 'primary' },
    // ... 다른 필드
  },
  // ... 더 많은the_data
];

// 컴포넌트 사용
<BaseTable
  columns={columns}
  data={data}
  checkable
  hierarchical
  onRowClick={handleRowClick}
  onSort={handleSort}
  onCheck={handleCheck}
  onToggleExpand={handleToggleExpand}
/>
          `}
        </Typography>
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        Props
      </Typography>
      
      <Box component="table" sx={{ width: '100%', mb: 3, borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>이름</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>타입</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>기본값</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>설명</Box>
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>columns</Box>
            <Box component="td" sx={{ p: 1 }}>Array</Box>
            <Box component="td" sx={{ p: 1 }}>[]</Box>
            <Box component="td" sx={{ p: 1 }}>테이블 컬럼 정의</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>data</Box>
            <Box component="td" sx={{ p: 1 }}>Array</Box>
            <Box component="td" sx={{ p: 1 }}>[]</Box>
            <Box component="td" sx={{ p: 1 }}>테이블 데이터</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>checkable</Box>
            <Box component="td" sx={{ p: 1 }}>boolean</Box>
            <Box component="td" sx={{ p: 1 }}>false</Box>
            <Box component="td" sx={{ p: 1 }}>체크박스 컬럼 사용 여부</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>hierarchical</Box>
            <Box component="td" sx={{ p: 1 }}>boolean</Box>
            <Box component="td" sx={{ p: 1 }}>false</Box>
            <Box component="td" sx={{ p: 1 }}>계층형 구조 사용 여부</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>onRowClick</Box>
            <Box component="td" sx={{ p: 1 }}>function</Box>
            <Box component="td" sx={{ p: 1 }}>-</Box>
            <Box component="td" sx={{ p: 1 }}>행 클릭 이벤트 핸들러</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>onSort</Box>
            <Box component="td" sx={{ p: 1 }}>function</Box>
            <Box component="td" sx={{ p: 1 }}>-</Box>
            <Box component="td" sx={{ p: 1 }}>정렬 이벤트 핸들러</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>onCheck</Box>
            <Box component="td" sx={{ p: 1 }}>function</Box>
            <Box component="td" sx={{ p: 1 }}>-</Box>
            <Box component="td" sx={{ p: 1 }}>체크박스 클릭 이벤트 핸들러</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>onToggleExpand</Box>
            <Box component="td" sx={{ p: 1 }}>function</Box>
            <Box component="td" sx={{ p: 1 }}>-</Box>
            <Box component="td" sx={{ p: 1 }}>계층 펼치기/접기 이벤트 핸들러</Box>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        컬럼 타입
      </Typography>
      
      <Box component="table" sx={{ width: '100%', mb: 3, borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>타입</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>설명</Box>
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>checkbox</Box>
            <Box component="td" sx={{ p: 1 }}>체크박스 컬럼</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>number</Box>
            <Box component="td" sx={{ p: 1 }}>번호 컬럼 (페이지별/연속 번호)</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>multiline</Box>
            <Box component="td" sx={{ p: 1 }}>줄바꿈 지원 텍스트 컬럼</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>hierarchical</Box>
            <Box component="td" sx={{ p: 1 }}>계층형 구조 컬럼 (들여쓰기, 접고 펴기)</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>chip</Box>
            <Box component="td" sx={{ p: 1 }}>칩 스타일 데이터 컬럼</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>horizontal</Box>
            <Box component="td" sx={{ p: 1 }}>가로 정렬 컬럼 (상위 계층 목록 등)</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>button</Box>
            <Box component="td" sx={{ p: 1 }}>버튼 컬럼</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #ddd' }}>
            <Box component="td" sx={{ p: 1 }}>group</Box>
            <Box component="td" sx={{ p: 1 }}>그룹 컬럼 헤더</Box>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        예제
      </Typography>
      
      <TableExample />
    </Box>
  );
};

export default TableDocs; 