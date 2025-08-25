/**
 * 기본 템플릿 훅 모듈
 * 
 * 이 모듈은 재사용 가능한 커스텀 훅들을 내보냅니다.
 * 다른 컴포넌트에서 다음과 같이 사용할 수 있습니다:
 * 예: import { usePageHeader, useTableHeader } from '../components/baseTemplate/hooks';
 */

// 베이스템플릿 훅들
// 
// 이 훅들은 범용적으로 사용할 수 있도록 설계되었습니다.
// 각 훅은 독립적으로 사용하거나 조합하여 사용할 수 있습니다.
//
// 주요 기능:
// - useTableFilter: 테이블 필터링 (계층형 데이터 최적화 포함)
// - useTablePagination: 페이지네이션 (자동 조정 기능 포함)
// - useTableFilterAndPagination: 필터링과 페이지네이션 통합 (안전한 필터 처리 포함)
// - useTypeHierarchy: 계층형 데이터 관리 (총 항목 수 계산 포함)
// - useDynamicTypes: 동적 유형 관리
// - useTable: 테이블 전체 기능 통합

export { default as useTableFilter } from './useTableFilter';
export { default as useTablePagination } from './useTablePagination';
export { default as useTableFilterAndPagination } from './useTableFilterAndPagination';
export { default as useTypeHierarchy } from './useTypeHierarchy';
export { default as useDynamicTypes } from './useDynamicTypes';
export { default as useTable } from './useTable';
export { default as useTableHeader } from './useTableHeader';
export { default as useTableData } from './useTableData';
export { default as usePageHeader } from './usePageHeader';
export { default as useTableColumnDrag } from './useTableColumnDrag'; 
export { default as useTableIndent } from './useTableIndent'; 
export { default as useTableHeaderFixed } from './useTableHeaderFixed'; 
export { default as useTableAutoHeight } from './useTableAutoHeight';
export { default as useTableResize } from './useTableResize';
export { default as useColumnVisibility } from './useColumnVisibility';
export { default as useTableRowDrag } from './useTableRowDrag';