import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * 기본 데이터 테이블 관리 훅
 * 테이블 데이터 로드, 페이지네이션, 행 선택 등의 기본 기능을 제공
 * 
 * @param {Object} options 기본 설정 옵션
 * @param {Function} options.fetchData 데이터 불러오기 함수
 * @param {Function} options.processFetchedData 가져온 데이터 처리 함수 (선택)
 * @param {number} options.defaultPageSize 기본 페이지 크기 (기본값: 25)
 * @param {string} options.defaultSortField 기본 정렬 필드
 * @param {string} options.defaultSortOrder 기본 정렬 순서 ('asc' 또는 'desc')
 * @param {string} options.idField 고유 식별자 필드 (기본값: 'id')
 * @param {Function} options.onError 오류 핸들러
 * @returns {Object} 테이블 데이터 및 관련 함수
 */
const useDataTable = ({
  fetchData,
  processFetchedData,
  defaultPageSize = 25,
  defaultSortField = 'createdAt',
  defaultSortOrder = 'desc',
  idField = 'id',
  onError
}) => {
  const dispatch = useDispatch();
  
  // 기본 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);       // 원본 데이터
  const [filteredData, setFilteredData] = useState([]); // 필터링/검색 후 데이터
  const [rowData, setRowData] = useState([]);           // 최종 그리드에 표시될 데이터
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [tableHeight, setTableHeight] = useState(500);
  const [sortModel, setSortModel] = useState([{ field: defaultSortField, sort: defaultSortOrder }]);
  const [selected, setSelected] = useState([]);
  
  // AG Grid 관련 참조 및 상태
  const gridRef = useRef(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!fetchData) return;
    
    setLoading(true);
    setError(null);
    try {
      // fetchData가 함수일 경우 실행, 아니면 그대로 사용
      const result = typeof fetchData === 'function' 
        ? await fetchData() 
        : fetchData;
      
      // 데이터 처리 (선택적)
      const processedData = processFetchedData 
        ? processFetchedData(result)
        : result;
      
      // 데이터 설정
      setTableData(processedData);
      setTotalItems(processedData.length);
      setFilteredData(processedData);
      
      // AG Grid가 준비되면 데이터 설정 (직접 rowData 업데이트)
      setRowData(processedData);
      
      // 그리드 API가 있는 경우에만 직접 데이터 설정
      if (gridApi) {
        gridApi.setRowData(processedData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, processFetchedData, onError, gridApi]);

  // 페이지네이션 처리된 데이터 가져오기
  const getPagedData = useCallback((data) => {
    // 데이터와 현재 페이지, 페이지 크기를 기준으로 데이터 조각 반환
    return data;  // 기본적으로 전체 데이터를 반환 (AG Grid 내부 페이지네이션 사용 시)
  }, []);

  // 페이지 변경 핸들러
  const handleChangePage = useCallback((event, newPage) => {
    if (gridApi) {
      try {
        gridApi.paginationGoToPage(newPage);
        setPage(newPage);
      } catch (err) {
        console.error('Error changing page:', err);
      }
    }
  }, [gridApi]);
  
  // 그리드 페이지네이션 변경 이벤트 핸들러
  const handleGridPaginationChanged = useCallback(() => {
    if (gridApi) {
      try {
        const currentPage = gridApi.paginationGetCurrentPage();
        setPage(currentPage);
      } catch (err) {
        console.error('Error handling pagination change:', err);
      }
    }
  }, [gridApi]);
  
  // 페이지당 행 수 변경 핸들러
  const handleChangeRowsPerPage = useCallback((event) => {
    try {
      const newRowsPerPage = parseInt(event.target.value, 10);
      
      if (gridApi) {
        gridApi.paginationSetPageSize(newRowsPerPage);
      }
      
      setPageSize(newRowsPerPage);
      setPage(0);
      
      if (gridApi) {
        gridApi.paginationGoToPage(0);
      }
    } catch (err) {
      console.error('Error changing rows per page:', err);
    }
  }, [gridApi]);

  // 데이터 새로고침
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Grid Ready 핸들러
  const onGridReady = useCallback((params) => {
    try {
      // API 설정
      setGridApi(params.api);
      setColumnApi(params.columnApi);
      
      // 데이터가 있는 경우 설정
      if (tableData.length > 0 && params.api) {
        params.api.setRowData(tableData);
      }
      
      // 이벤트 리스너 설정
      params.api.addEventListener('paginationChanged', handleGridPaginationChanged);
    } catch (err) {
      console.error('Error in grid ready:', err);
    }
  }, [tableData, handleGridPaginationChanged]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
    
    // 컴포넌트 언마운트 시 리스너 제거를 위한 cleanup 함수 반환
    return () => {
      try {
        if (gridApi) {
          gridApi.removeEventListener('paginationChanged', handleGridPaginationChanged);
        }
      } catch (err) {
        console.error('Error removing event listener:', err);
      }
    };
  }, [loadData, gridApi, handleGridPaginationChanged]);

  // 행 선택 가능 여부 (기본 구현)
  const isRowSelectable = useCallback((params) => {
    if (!params || !params.data) {
      return false;
    }
    return true; // 기본적으로 모든 행 선택 가능
  }, []);

  // 행 클래스 결정 (기본 구현)
  const getRowClass = useCallback((params) => {
    return ''; // 기본적으로 클래스 없음
  }, []);

  // 반환 객체를 메모이제이션하여 불필요한 리렌더링 방지
  return useMemo(() => ({
    // 상태
    loading,
    error,
    tableData,
    filteredData,
    setFilteredData,
    rowData,
    setRowData,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    setTotalItems,
    tableHeight,
    setTableHeight,
    sortModel,
    setSortModel,
    selected,
    setSelected,
    
    // 그리드 참조 및 API
    gridRef,
    gridApi,
    setGridApi,
    columnApi,
    setColumnApi,
    
    // 함수
    loadData,
    refreshData,
    getPagedData,
    handleChangePage,
    handleGridPaginationChanged,
    handleChangeRowsPerPage,
    isRowSelectable,
    getRowClass,
    onGridReady
  }), [
    loading,
    error,
    tableData,
    filteredData,
    rowData,
    page,
    pageSize,
    totalItems,
    tableHeight,
    sortModel,
    selected,
    gridApi,
    columnApi,
    loadData,
    refreshData,
    getPagedData,
    handleChangePage,
    handleGridPaginationChanged,
    handleChangeRowsPerPage,
    isRowSelectable,
    getRowClass,
    onGridReady
  ]);
};

export default useDataTable; 