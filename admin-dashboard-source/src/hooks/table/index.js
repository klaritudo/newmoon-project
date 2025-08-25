/**
 * 테이블 관련 훅 모듈
 * 
 * 이 모듈은 테이블 관련 재사용 가능한 훅들을 내보냅니다.
 * 다른 컴포넌트에서 import { useDataTable, useHierarchyTable, usePageNumberMode, usePinnedColumns, useIndentMode } from '@/hooks/table'; 형태로 사용할 수 있습니다.
 */

import useDataTable from './useDataTable';
import useHierarchyTable from './useHierarchyTable';
import usePageNumberMode from './usePageNumberMode';
import usePinnedColumns from './usePinnedColumns';
import useIndentMode from './useIndentMode';

export {
  useDataTable,
  useHierarchyTable,
  usePageNumberMode,
  usePinnedColumns,
  useIndentMode
}; 