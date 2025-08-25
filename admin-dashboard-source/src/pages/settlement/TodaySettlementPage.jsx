import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  useTheme, 
  Button, 
  Popover, 
  List, 
  ListItem, 
  FormControlLabel, 
  Checkbox, 
  Divider 
} from '@mui/material';
import { 
  TableFilterAndPagination, 
  TableHeader, 
  BaseTable, 
  TypeTreeView, 
  TableHeightSetting, 
  TableResizeHandle, 
  ColumnVisibilityDialog, 
  PageHeader, 
  PageContainer,
  TableDebugInfo 
} from '../../components/baseTemplate/components';
import MemberDetailDialog from '../../components/dialogs/MemberDetailDialog';
import { 
  useTableFilterAndPagination, 
  useTableHeader, 
  useTableColumnDrag,
  useTableData,
  useTypeHierarchy,
  useTableIndent,
  useTableHeaderFixed,
  useTableAutoHeight,
  useTableResize,
  useColumnVisibility,
  useTable
} from '../../components/baseTemplate/hooks';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { 
  todaySettlementColumns,
  apiOptions,
  bankList
} from './data/todaySettlementData';
import useDynamicTypes from '../../hooks/useDynamicTypes';
import usePageData from '../../hooks/usePageData';
import { useSocket } from '../../context/SocketContext';

/**
 * 당일정산 페이지
 * 당일정산 목록 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const TodaySettlementPage = () => {
  const theme = useTheme();

  // 전역 알림 사용
  const { handleRefresh } = useNotification();
  
  // Socket 서비스 및 시퀀스 서비스 사용
  const { socketService, agentLevelService, sequenceService } = useSocket();
  
  // 실시간 데이터 업데이트를 위한 state
  const [realtimeUpdates, setRealtimeUpdates] = useState({});
  const lastSequenceRef = useRef(0);
  
  // 합계 토글 상태
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);

  // 동적 유형 관리
  const {
    types: dynamicTypes,
    typeHierarchy,
    isLoading: typesLoading,
    error: typesError,
    isInitialized: typesInitialized
  } = useDynamicTypes();
  
  // 임시 하드코딩된 types (Socket이 작동하지 않을 때 폴백)
  const hardcodedTypes = {
    "agent_level_1": {
      id: 1,
      label: "총판",
      color: "error",
      backgroundColor: "#f44336",
      borderColor: "#f44336",
      order: 1
    },
    "agent_level_2": {
      id: 2,
      label: "부본",
      color: "secondary",
      backgroundColor: "#e91e63",
      borderColor: "#e91e63",
      order: 2
    },
    "agent_level_3": {
      id: 3,
      label: "매장",
      color: "primary",
      backgroundColor: "#3f51b5",
      borderColor: "#3f51b5",
      order: 3
    },
    "agent_level_4": {
      id: 4,
      label: "일반회원",
      color: "info",
      backgroundColor: "#2196f3",
      borderColor: "#2196f3",
      order: 4
    }
  };
  
  // dynamicTypes가 없으면 하드코딩된 types 사용
  const types = (dynamicTypes && Object.keys(dynamicTypes).length > 0) ? dynamicTypes : hardcodedTypes;
  
  // 디버깅: types 초기화 상태 확인
  useEffect(() => {
    console.log('🔍 TodaySettlementPage - types 상태:', {
      typesInitialized,
      typesLoading,
      typesError,
      typesCount: Object.keys(types || {}).length,
      types: types,
      usingHardcodedTypes: (!dynamicTypes || Object.keys(dynamicTypes).length === 0)
    });
  }, [typesInitialized, typesLoading, typesError, types, dynamicTypes]);
  
  // Socket 연결 상태 확인을 위한 추가 디버깅
  useEffect(() => {
    console.log('🔌 Socket 연결 상태 확인 시작...');
    
    // socketService 직접 확인
    if (socketService) {
      const status = socketService.getConnectionStatus();
      console.log('📡 socketService 상태:', status);
      
      // 글로벌로도 노출 (디버깅용)
      window.socketService = socketService;
      window.agentLevelService = agentLevelService;
    }
    
    // 5초 후에도 types가 없으면 강제로 agent-levels 요청
    const forceRequestTimeout = setTimeout(() => {
      if (!types || Object.keys(types).length === 0) {
        console.log('⚠️ 5초 후에도 types가 없음, 강제 요청 시도...');
        
        // socketService가 있으면 직접 요청
        if (socketService && socketService.isConnected) {
          console.log('📤 직접 request-agent-levels 이벤트 전송');
          socketService.emit('request-agent-levels');
        } else if (agentLevelService) {
          console.log('📤 agentLevelService를 통한 초기 데이터 요청');
          agentLevelService.requestInitialData();
        }
      }
    }, 5000);
    
    return () => clearTimeout(forceRequestTimeout);
  }, [socketService, agentLevelService]);
  
  // 범용 페이지 데이터 훅 사용 (1단계 구조)
  const {
    data,
    types: pageDataTypes, // 사용하지 않음
    typeHierarchy: pageDataTypeHierarchy, // 사용하지 않음
    isLoading,
    error,
    refreshPageData
  } = usePageData({
    pageType: 'settlement',
    requiresMembersData: false
  });
  
  // 실제 사용할 데이터 (실시간 업데이트 반영 + types 매핑)
  const actualData = useMemo(() => {
    if (!data) return [];
    
    // types 매핑과 실시간 업데이트 반영
    return data.map(item => {
      // type 매핑 추가
      let processedItem = {
        ...item,
        type: types[`agent_level_${item.agent_level_id}`] || null
      };
      
      // 실시간 업데이트 반영
      const balanceUpdate = realtimeUpdates[`balance_${item.id}`];
      if (balanceUpdate) {
        processedItem = {
          ...processedItem,
          last_balance: balanceUpdate.balance,
          _realtimeUpdated: true,
          _updateTimestamp: balanceUpdate.timestamp
        };
      }
      
      return processedItem;
    });
  }, [data, realtimeUpdates, types]);
  
  // 디버깅: 데이터 확인 - buildHierarchicalDataRecursive 정의 후로 이동 필요
  
  // Socket 이벤트로 agent-levels 변경 감지
  const refreshPageDataRef = useRef(refreshPageData);
  refreshPageDataRef.current = refreshPageData;
  
  // AgentLevelService의 변경사항 감지
  useEffect(() => {
    if (!agentLevelService) return;
    
    const listenerId = agentLevelService.addListener((event) => {
      console.log('당일정산: AgentLevelService 이벤트 수신:', event.type);
      
      if (event.type === 'hierarchy-changed' || event.type === 'updated' || event.type === 'loaded') {
        console.log('당일정산: 계층 변경 감지, 데이터 새로고침');
        // 약간의 지연을 두고 새로고침 (DB 업데이트 완료 대기)
        setTimeout(() => {
          if (refreshPageDataRef.current) {
            refreshPageDataRef.current();
          }
        }, 500);
      }
    });
    
    return () => {
      agentLevelService.removeListener(listenerId);
    };
  }, [agentLevelService]);
  
  // 실시간 웹소켓 이벤트 리스너
  useEffect(() => {
    if (!socketService || !sequenceService) return;
    
    // 잔액 업데이트 리스너
    const handleBalanceUpdate = (event) => {
      console.log('💰 실시간 잔액 업데이트:', event);
      
      // 시퀀스 서비스를 통한 체크 (중복/누락 방지)
      const isValid = sequenceService.updateSequence(event.sequence);
      if (!isValid) {
        return;
      }
      
      // 실시간 업데이트 저장
      setRealtimeUpdates(prev => ({
        ...prev,
        [`balance_${event.data.memberId}`]: event.data
      }));
      
      // 데이터 새로고침 (선택적)
      // refreshPageData();
    };
    
    // 베팅 업데이트 리스너
    const handleBettingUpdate = (event) => {
      console.log('🎰 실시간 베팅 업데이트:', event);
      
      // 시퀀스 서비스를 통한 체크
      const isValid = sequenceService.updateSequence(event.sequence);
      if (!isValid) {
        return;
      }
      
      // 시퀀스 체크
      if (event.sequence <= lastSequenceRef.current) {
        console.warn('⚠️ 중복 이벤트 감지:', event.sequence);
        return;
      }
      lastSequenceRef.current = event.sequence;
      
      // 실시간 업데이트 저장
      setRealtimeUpdates(prev => ({
        ...prev,
        [`betting_${event.data.bettingId}`]: event.data
      }));
    };
    
    // 누락된 이벤트 처리 콜백 설정
    sequenceService.setOnMissingEvents((event) => {
      console.log('🔄 누락된 이벤트 처리:', event);
      // 누락된 이벤트도 동일하게 처리
      if (event.type === 'balance:update') {
        handleBalanceUpdate(event);
      } else if (event.type === 'betting:update') {
        handleBettingUpdate(event);
      }
    });
    
    // 리스너 등록
    socketService.on('realtime:balance', handleBalanceUpdate);
    socketService.on('realtime:betting', handleBettingUpdate);
    
    return () => {
      socketService.off('realtime:balance', handleBalanceUpdate);
      socketService.off('realtime:betting', handleBettingUpdate);
      sequenceService.setOnMissingEvents(null);
    };
  }, [socketService, sequenceService]);
  
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

  // 들여쓰기 모드 - useTableIndent 훅 사용 (정산 페이지에서는 비활성화)
  const { indentMode, toggleIndentMode } = useTableIndent(true);

  // parentId 기반 계층 구조 생성 - 단순화
  const buildHierarchicalDataRecursive = useCallback((items, parentId = null, level = 0) => {
    const children = items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => {
        const aOrder = a.levelOrder || a.level_order || a.agent_level_order || 999;
        const bOrder = b.levelOrder || b.level_order || b.agent_level_order || 999;
        return aOrder - bOrder;
      });
    
    return children.map(item => ({
      ...item,
      level: level,
      _displayLevel: level,
      children: buildHierarchicalDataRecursive(items, item.id, level + 1)
    }));
  }, []);
  
  // 표시단계 상태 관리 - levelFilteredData보다 먼저 선언
  const [levelFilter, setLevelFilter] = useState({}); // 체크된 단계들
  
  // 단계 필터링 적용
  const levelFilteredData = useMemo(() => {
    if (!actualData || actualData.length === 0) return [];
    if (Object.keys(levelFilter).length === 0) return actualData;
    
    return actualData.filter(item => {
      // agent_level_id로 필터링
      return levelFilter[item.agent_level_id] === true;
    });
  }, [actualData, levelFilter]);
  
  // parent_id 기반 계층구조 생성
  const buildHierarchicalData = useMemo(() => {
    console.log('🏗️ 계층 데이터 생성, 원본 데이터:', levelFilteredData?.length || 0, '개');
    console.log('🏗️ 첫 번째 데이터:', levelFilteredData?.[0]);
    
    if (!levelFilteredData || levelFilteredData.length === 0) return [];
    
    // levelOrder로 먼저 정렬하여 단계설정 순서 반영
    const sortedData = [...levelFilteredData].sort((a, b) => {
      const aOrder = a.levelOrder || a.level_order || a.agent_level_order || 999;
      const bOrder = b.levelOrder || b.level_order || b.agent_level_order || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // 같은 레벨 내에서는 ID로 정렬
      return a.id - b.id;
    });
    
    const result = buildHierarchicalDataRecursive(sortedData);
    
    // 계층 구조에 포함되지 않은 항목 찾기
    const includedIds = new Set();
    const collectIds = (items) => {
      items.forEach(item => {
        includedIds.add(item.id);
        if (item.children && item.children.length > 0) {
          collectIds(item.children);
        }
      });
    };
    collectIds(result);
    
    // 누락된 항목 확인
    const missingItems = sortedData.filter(item => !includedIds.has(item.id));
    if (missingItems.length > 0) {
      console.warn('🚨 계층 구조에서 누락된 항목:', missingItems.length, '개');
      console.warn('누락된 항목 상세:', missingItems.map(item => ({
        id: item.id,
        username: item.username,
        parentId: item.parentId,
        levelName: item.levelName,
        type: item.type
      })));
      
      // 최상위 항목들의 parentId 확인
      console.log('🔍 최상위 항목들:', result.map(item => ({
        id: item.id,
        username: item.username,
        parentId: item.parentId
      })));
      
      // 누락된 항목을 최상위 레벨에 추가
      missingItems.forEach(item => {
        result.push({
          ...item,
          level: 0,
          _displayLevel: 0,
          children: [],
          _orphaned: true // 고아 항목 표시
        });
      });
    }
    
    console.log('🏗️ 최종 계층 데이터:', result.length, '개 (최상위)');
    return result;
  }, [levelFilteredData, buildHierarchicalDataRecursive]);

  // 펼침/접힘 상태 관리 - 초기값을 모두 펼친 상태로 설정
  const [expandedItems, setExpandedItems] = useState(() => {
    // 초기에 모든 항목을 펼친 상태로 설정
    const initialExpanded = {};
    const addAllItems = (items) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          initialExpanded[item.id] = true;
          addAllItems(item.children);
        }
      });
    };
    if (buildHierarchicalData.length > 0) {
      addAllItems(buildHierarchicalData);
    }
    return initialExpanded;
  });
  
  // 계층적 데이터를 평탄화하여 표시용 데이터 생성
  const flattenHierarchicalData = useCallback((items, parentExpanded = true) => {
    let result = [];
    
    items.forEach(item => {
      if (parentExpanded) {
        result.push(item);
      }
      
      if (item.children && item.children.length > 0) {
        const isExpanded = expandedItems[item.id];
        result = result.concat(flattenHierarchicalData(item.children, parentExpanded && isExpanded));
      }
    });
    
    return result;
  }, [expandedItems]);
  
  // 항목 펼치기/접기 토글
  const toggleTypeExpand = useCallback((itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);
  
  // 모든 항목 펼치기
  const setAllExpanded = useCallback((expanded) => {
    const newExpanded = {};
    const addAllItems = (items) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          newExpanded[item.id] = expanded;
          addAllItems(item.children);
        }
      });
    };
    addAllItems(buildHierarchicalData);
    setExpandedItems(newExpanded);
  }, [buildHierarchicalData]);
  
  // hierarchicalData가 변경될 때 모든 항목 펼치기
  useEffect(() => {
    // 데이터가 처음 로드될 때만 초기 확장 상태 설정
    if (buildHierarchicalData.length > 0 && Object.keys(expandedItems).length === 0) {
      const newExpanded = {};
      const addAllItems = (items) => {
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            newExpanded[item.id] = true;
            addAllItems(item.children);
          }
        });
      };
      addAllItems(buildHierarchicalData);
      setExpandedItems(newExpanded);
    }
  }, [buildHierarchicalData.length]); // 의존성을 길이로만 확인
  
  const hierarchicalData = buildHierarchicalData;
  // 평탄화하지 않고 계층 구조 그대로 사용
  const effectiveData = hierarchicalData;
  
  // 디버깅: 데이터 확인
  useEffect(() => {
    if (actualData && actualData.length > 0) {
      console.log('🔍 당일정산 actualData 첫 번째 항목:', actualData[0]);
      console.log('🔍 당일정산 actualData type 정보:', actualData[0]?.type);
      console.log('🔍 parent_id 필드 확인:', actualData[0]?.parent_id);
      console.log('🔍 parentId 필드 확인:', actualData[0]?.parentId);
      
      // parent_id가 있는 항목 찾기
      const itemsWithParentId = actualData.filter(item => item.parent_id || item.parentId);
      console.log('🔍 parent_id가 있는 항목 수:', itemsWithParentId.length);
      if (itemsWithParentId.length > 0) {
        console.log('🔍 parent_id가 있는 첫 번째 항목:', itemsWithParentId[0]);
      }
      
      // 계층 구조 디버깅
      console.log('🔍 buildHierarchicalDataRecursive 테스트:');
      const testHierarchy = buildHierarchicalDataRecursive(actualData);
      console.log('🔍 계층 구조 결과:', testHierarchy);
      console.log('🔍 최상위 항목 수:', testHierarchy.length);
    }
  }, [actualData, buildHierarchicalDataRecursive]);
  
  // 디버그 로그 추가
  useEffect(() => {
    console.log('🔍 당일정산 데이터 상태:', {
      dataLength: data?.length || 0,
      actualDataLength: actualData?.length || 0,
      buildHierarchicalDataLength: buildHierarchicalData?.length || 0,
      hierarchicalDataLength: hierarchicalData?.length || 0,
      effectiveDataLength: effectiveData?.length || 0,
      isLoading,
      error,
      typesInitialized,
      firstActualDataItem: actualData?.[0],
      firstActualDataType: actualData?.[0]?.type,
      firstBuildHierarchicalItem: buildHierarchicalData?.[0],
      firstBuildHierarchicalType: buildHierarchicalData?.[0]?.type,
      firstHierarchicalItem: hierarchicalData?.[0],
      firstHierarchicalType: hierarchicalData?.[0]?.type,
      expandedItems
    });
  }, [data, actualData, buildHierarchicalData, hierarchicalData, effectiveData, isLoading, error, typesInitialized, expandedItems]);
  
  // 헤더 행 고정 기능 - useTableHeaderFixed 훅 사용
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    zIndex: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });

  // 회원상세정보 다이얼로그 상태
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);

  // 회원상세정보 다이얼로그 핸들러들
  const handleMemberDetailOpen = useCallback((member) => {
    // console.log('🔥 회원상세정보 다이얼로그 열기 요청!');
    // console.log('선택된 회원:', member);
    // console.log('회원 ID:', member?.id);
    // console.log('회원 이름:', member?.username);
    setSelectedMemberForDetail(member);
    setMemberDetailDialogOpen(true);
    // console.log('다이얼로그 상태 변경 완료');
  }, []);

  const handleMemberDetailClose = useCallback(() => {
    setMemberDetailDialogOpen(false);
    setSelectedMemberForDetail(null);
  }, []);

  const handleMemberDetailSave = useCallback((updatedMember) => {
    // console.log('회원정보 저장:', updatedMember);
    // 실제 API 호출 로직을 여기에 구현
    // 예: await memberAPI.updateMember(updatedMember);
    
    alert(`${updatedMember.nickname || updatedMember.username}님의 정보가 저장되었습니다.`);
    
    // 테이블 데이터 새로고침 로직 추가 가능
    // 예: refetchData();
    
    handleMemberDetailClose();
  }, [handleMemberDetailClose]);

  // 새로고침 핸들러
  const handleRefreshClick = useCallback(() => {
    handleRefresh('당일정산');
    refreshPageData();
  }, [handleRefresh, refreshPageData]);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(() => {
    // console.log('당일정산 목록 엑셀 다운로드');
    alert('당일정산 목록을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    // console.log('당일정산 목록 인쇄');
    alert('당일정산 목록을 인쇄합니다.');
  }, []);

  // 페이지네이션 직접 제어 로직
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);

  // useTable 훅 사용 (체크박스 관련 기능)
  const {
    checkedItems: tableCheckedItems,
    sortConfig: tableSortConfig,
    expandedRows: tableExpandedRows,
    allChecked: tableAllChecked,
    handleSort: tableHandleSort,
    handleCheck: tableHandleCheck,
    handleToggleAll: tableHandleToggleAll,
    handleToggleExpand: tableHandleToggleExpand
  } = useTable({
    data: effectiveData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: {},
    indentMode: true,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    console.log('🔍 당일정산 columnsWithActions 생성, effectiveData 샘플:', effectiveData?.[0]);
    return todaySettlementColumns.map(column => {
      // 유형 컬럼에 토글 핸들러 추가
      if (column.id === 'type' && column.type === 'hierarchical') {
        return {
          ...column,
          onToggle: (itemId) => {
            console.log('유형 컬럼 토글:', itemId);
            // useTypeHierarchy의 toggleTypeExpand 사용
            const item = effectiveData.find(item => item.id === itemId);
            if (item && item.type) {
              const typeId = typeof item.type === 'object' ? item.type.id : item.type;
              toggleTypeExpand(typeId);
            }
          }
        };
      }
      
      // userId 컬럼에 클릭 핸들러 추가
      if (column.id === 'userId') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('아이디 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      return column;
    });
  }, [effectiveData, toggleTypeExpand, handleMemberDetailOpen]);

  // 단계 목록 생성 (실제 데이터에서 추출)
  const availableLevels = useMemo(() => {
    if (!actualData || actualData.length === 0) return [];
    
    const levelMap = new Map();
    actualData.forEach(item => {
      // agent_level_id와 level_name을 함께 저장
      if (item.agent_level_id && item.type?.label) {
        levelMap.set(item.agent_level_id, item.type.label);
      }
    });
    
    // id와 label을 포함한 객체 배열로 반환
    const levels = Array.from(levelMap.entries()).map(([id, label]) => ({
      id: id,
      label: label
    })).sort((a, b) => a.id - b.id);
    
    console.log('🎯 사용 가능한 단계:', levels);
    return levels;
  }, [actualData]);

  // 초기값: 모든 단계 선택
  useEffect(() => {
    if (availableLevels.length > 0 && Object.keys(levelFilter).length === 0) {
      const initialFilter = {};
      availableLevels.forEach(level => {
        initialFilter[level.id] = true;
      });
      setLevelFilter(initialFilter);
    }
  }, [availableLevels, levelFilter]);

  // 동적 필터 옵션 생성 (상태와 API 필터 제거)
  const dynamicFilterOptions = useMemo(() => {
    // 디버깅: 필터 옵션 생성 상태 확인
    console.log('🔍 회원유형 필터 옵션 생성:', {
      typesInitialized,
      types,
      typesKeys: types ? Object.keys(types) : [],
      typesCount: types ? Object.keys(types).length : 0,
      actualTypes: types
    });

    const baseOptions = [
      {
        id: 'type',
        label: '회원유형',
        items: [
          { value: '', label: '전체' },
          // 동적 유형 옵션 추가 - typesInitialized 체크 제거
          ...(types && Object.keys(types).length > 0 ? Object.keys(types).map(typeId => {
            const option = {
              value: String(typeId), // 문자열로 명시적 변환
              label: types[typeId].label || typeId
            };
            console.log('🔍 생성된 필터 옵션:', option);
            return option;
          }) : [])
        ]
      }
    ];
    
    console.log('🔍 최종 필터 옵션:', baseOptions[0].items);
    return baseOptions;
  }, [typesInitialized, types]);

  // useTableFilterAndPagination 훅 사용
  const {
    // 필터 관련 상태 및 핸들러
    activeFilters,
    handleFilterChange,
    isDateFilterActive,
    handleOpenDateFilter,
    resetDateFilter,
    dateRange,
    
    // 페이지네이션 관련 상태 및 핸들러
    page,
    rowsPerPage,
    totalCount,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    filteredData,
    displayData,
    filterValues,
    handleFilter,
    handleClearFilters
  } = useTableFilterAndPagination({
    columns: columnsWithActions,
    data: effectiveData,
    defaultRowsPerPage: 25,
    hierarchical: true,
    filterOptions: {
      initialFilters: { type: 'all' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: effectiveData.length,  // effectiveData 기준으로 변경
      onExcelDownload: handleExcelDownload,
      onPrint: handlePrint
    }
  });

  // TableHeader 훅 사용
  const {
    searchText,
    totalItems,
    sequentialPageNumbers,
    hasPinnedColumns,
    isGridReady,
    handleSearchChange,
    handleClearSearch,
    togglePageNumberMode,
    toggleColumnPin: headerToggleColumnPin,
    setGridReady
  } = useTableHeader({
    initialTotalItems: effectiveData.length,  // effectiveData 기준으로 변경
    tableId: 'todaySettlementPage', // 페이지별 고유 ID 추가
    onSearch: (value) => {
      console.log(`당일정산 검색: ${value}`);
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    onToggleColumnPin: (hasPinned) => {
      console.log(`컬럼 고정 토글: ${hasPinned}`);
      if (hasPinned) {
        setDefaultPinnedColumns();
      } else {
        clearAllPinnedColumns();
      }
    }
  });

  // 그리드 준비 상태로 설정
  useEffect(() => {
    setGridReady(true);
  }, [setGridReady]);

  // 컬럼 드래그 앤 드롭 관련 훅 사용
  const {
    columns,
    dragInfo,
    pinnedColumns,
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
    initialColumns: columnsWithActions,
    tableId: 'today_settlement_table',
    initialPinnedColumns: ['checkbox', 'number', 'type', 'userId'],
    onColumnOrderChange: (newColumns) => {
      console.log('당일정산 테이블 컬럼 순서 변경:', newColumns);
    }
  });

  // 컬럼 표시옵션 관련 훅 사용
  const {
    columnVisibility,
    visibleColumns,
    hiddenColumnsCount,
    toggleableColumns,
    toggleColumnVisibility,
    showAllColumns,
    resetToDefault
  } = useColumnVisibility(columns, {
    defaultHiddenColumns: [],
    alwaysVisibleColumns: ['checkbox'],
    tableId: 'today_settlement_table'
  });

  // 표시옵션 다이얼로그 상태
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  const isDisplayOptionsOpen = Boolean(displayOptionsAnchor);

  // 표시단계 팝오버 상태
  const [levelFilterAnchor, setLevelFilterAnchor] = useState(null);
  const isLevelFilterOpen = Boolean(levelFilterAnchor);

  // 표시옵션 버튼 클릭 핸들러
  const handleDisplayOptionsClick = useCallback((anchorElement) => {
    setDisplayOptionsAnchor(anchorElement);
  }, []);

  // 표시옵션 다이얼로그 닫기 핸들러
  const handleDisplayOptionsClose = useCallback(() => {
    setDisplayOptionsAnchor(null);
  }, []);

  // 표시단계 버튼 클릭 핸들러
  const handleLevelFilterClick = useCallback((event) => {
    setLevelFilterAnchor(event.currentTarget);
  }, []);

  // 표시단계 팝오버 닫기 핸들러
  const handleLevelFilterClose = useCallback(() => {
    setLevelFilterAnchor(null);
  }, []);

  // 단계 체크박스 변경 핸들러
  const handleLevelToggle = useCallback((level) => {
    setLevelFilter(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  }, []);

  // 모든 단계 선택/해제 핸들러
  const handleLevelSelectAll = useCallback((selectAll) => {
    const newFilter = {};
    availableLevels.forEach(level => {
      newFilter[level.id] = selectAll;
    });
    setLevelFilter(newFilter);
  }, [availableLevels]);

  // 드래그 앤 드롭 활성화
  const draggableColumns = true;

  // 드래그 관련 핸들러 모음
  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  // 행 클릭 핸들러
  const handleRowClick = (row) => {
    console.log('당일정산 행 클릭:', row);
  };

  // 계층 펼치기/접기 핸들러
  const handleToggleExpand2 = useCallback((id) => {
    console.log(`당일정산 유형 토글: ${id}`);
    toggleTypeExpand(id);
    
    if (typeof tableHandleToggleExpand === 'function') {
      tableHandleToggleExpand(id);
    }
  }, [toggleTypeExpand, tableHandleToggleExpand]);

  // 필터 콜백 함수 (상태와 API 필터 제거)
  const filterCallback = useCallback((result, filterId, filterValue) => {
    switch (filterId) {
      case 'type':
        if (filterValue === 'all' || filterValue === '') return result;
        
        // 디버깅: 필터링 과정 확인
        console.log('🔍 회원유형 필터링:', {
          filterValue,
          resultLength: result.length,
          firstItemType: result[0]?.type,
          firstItemTypeId: result[0]?.type?.id,
          filterValueType: typeof filterValue,
          comparison: result.slice(0, 3).map(item => ({
            itemTypeId: item.type?.id,
            itemTypeIdType: typeof item.type?.id,
            stringItemTypeId: String(item.type?.id),
            stringFilterValue: String(filterValue),
            matches: String(item.type?.id) === String(filterValue)
          }))
        });
        
        const filtered = result.filter(item => 
          item.type && String(item.type.id) === String(filterValue)
        );
        
        console.log('🔍 필터링 결과:', {
          originalLength: result.length,
          filteredLength: filtered.length,
          filteredItems: filtered.slice(0, 3).map(item => ({ 
            id: item.id, 
            typeId: item.type?.id, 
            userId: item.userId 
          }))
        });
        
        return filtered;
        
      case 'date':
        let dateFilteredResult = [...result];
        
        if (filterValue.startDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id >= 3);
        }
        
        if (filterValue.endDate) {
          dateFilteredResult = dateFilteredResult.filter(item => item.id <= 6);
        }
        
        return dateFilteredResult;
      default:
        return result;
    }
  }, []);
  
  // 커스텀 handleFilterChange 함수
  const manualHandleFilterChange = useCallback((filterId, value) => {
    console.log(`당일정산 필터 변경: ${filterId} = ${value}`);
    handleFilter({
      [filterId]: value
    });
  }, [handleFilter]);
  
  // 안전한 필터 값 설정
  const safeActiveFilters = useMemo(() => {
    const result = { ...activeFilters };
    
    Object.keys(result).forEach(key => {
      if (result[key] === 'all') {
        result[key] = '';
      }
    });
    
    return result;
  }, [activeFilters]);
  
  // useTableData 훅을 사용하여 필터링된 데이터 계산 (단계 필터링 적용)
  const computedFilteredData = useTableData({
    data: levelFilteredData,
    activeFilters: safeActiveFilters,
    searchText,
    isDateFilterActive,
    dateRange,
    filterCallback
  });
  
  // 필터링된 데이터의 ID 목록 생성
  const filteredIds = useMemo(() => {
    return computedFilteredData ? computedFilteredData.map(item => item.id) : [];
  }, [computedFilteredData]);
  
  // hierarchicalData에서 filteredIds에 포함된 항목만 필터링
  const filteredHierarchicalData = useMemo(() => {
    // hierarchicalData 사용 (계층 구조 유지)
    const dataToUse = hierarchicalData;
    
    // 필터가 적용되지 않았거나 검색어가 없는 경우 모든 데이터 반환
    const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    if (!hasActiveFilters && !hasSearchText) {
      return dataToUse;
    }
    
    // 필터가 있는 경우에만 filteredIds로 필터링
    if (!dataToUse || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    // 계층 구조를 유지하면서 필터링
    const filterHierarchical = (items) => {
      return items.filter(item => {
        // 현재 항목이 필터에 포함되거나
        const isIncluded = filteredIds.includes(item.id);
        
        // 자식 중 하나라도 필터에 포함되면 표시
        const hasFilteredChildren = item.children && item.children.length > 0 && 
          item.children.some(child => filteredIds.includes(child.id));
        
        if (isIncluded || hasFilteredChildren) {
          return {
            ...item,
            children: item.children ? filterHierarchical(item.children) : []
          };
        }
        
        return false;
      }).filter(Boolean);
    };
    
    return filterHierarchical(dataToUse);
  }, [hierarchicalData, filteredIds, safeActiveFilters, searchText]);
  
  // 페이지 관련 효과
  useEffect(() => {
    // console.log(`당일정산 페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredHierarchicalData || [];
  
  // 실제 전체 항목 수 계산 - 평탄화된 데이터 사용
  const flattenedDisplayData = useMemo(() => {
    return flattenHierarchicalData(safeFilteredData);
  }, [safeFilteredData, flattenHierarchicalData]);
  
  const totalFlattenedItems = useMemo(() => {
    const countAllItems = (items) => {
      if (!items || !items.length) return 0;
      
      let count = 0;
      items.forEach(item => {
        count++;
        
        if (item.children && item.children.length > 0) {
          count += countAllItems(item.children);
        }
      });
      
      return count;
    };
    
    return countAllItems(safeFilteredData);
  }, [safeFilteredData]);
  
  const safeDisplayData = safeFilteredData;

  // 필터링된 데이터가 변경될 때 totalItems 값 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      // console.log(`당일정산 검색/필터 결과: ${safeFilteredData.length}개 항목 (평면화: ${totalFlattenedItems}개)`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    // console.log(`당일정산 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    // console.log(`당일정산 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('당일정산 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    // console.log(`당일정산 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    // console.log(`당일정산 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    // console.log(`당일정산 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    // 계층 구조 데이터를 그대로 사용 (회원관리 페이지처럼)
    return safeFilteredData;
  }, [safeFilteredData, currentPage, currentRowsPerPage]);

  // visibleColumns에 버튼 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    return visibleColumns.map(column => {
      // userId 컬럼에 클릭 핸들러 추가
      if (column.id === 'userId') {
        return {
          ...column,
          clickable: true,
          onClick: (row) => {
            console.log('아이디 클릭:', row);
            handleMemberDetailOpen(row);
          }
        };
      }
      
      return column;
    });
  }, [visibleColumns, handleMemberDetailOpen]);

  // 합계 설정
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all',
      customFilter: (row) => {
        // agent_level_id가 1 또는 2인 회원 제외
        return row.agent_level_id !== 1 && row.agent_level_id !== 2;
      }
    },
    columns: {
      // 입출 그룹
      'deposit_withdrawal.charge_amount': { type: 'sum', format: 'currency' },
      'deposit_withdrawal.exchange_amount': { type: 'sum', format: 'currency' },
      'deposit_withdrawal.profit_loss': { type: 'sum', format: 'currency' },
      
      // 슬롯 그룹
      'slot.betting': { type: 'sum', format: 'currency' },
      'slot.winning': { type: 'sum', format: 'currency' },
      'slot.betting_winning': { type: 'sum', format: 'currency' },
      'slot.rolling_amount': { type: 'sum', format: 'currency' },
      'slot.rolling_total': { type: 'sum', format: 'currency' },
      'slot.final_profit_loss': { type: 'sum', format: 'currency' },
      'slot.losing': { type: 'sum', format: 'currency' },
      
      // 카지노 그룹
      'casino.betting': { type: 'sum', format: 'currency' },
      'casino.winning': { type: 'sum', format: 'currency' },
      'casino.betting_winning': { type: 'sum', format: 'currency' },
      'casino.rolling_amount': { type: 'sum', format: 'currency' },
      'casino.rolling_total': { type: 'sum', format: 'currency' },
      'casino.final_profit_loss': { type: 'sum', format: 'currency' },
      'casino.losing': { type: 'sum', format: 'currency' },
      
      // 합계 그룹
      'total.betting': { type: 'sum', format: 'currency' },
      'total.winning': { type: 'sum', format: 'currency' },
      'total.rolling_amount': { type: 'sum', format: 'currency' },
      'total.rolling_total': { type: 'sum', format: 'currency' },
      'total.final_profit_loss': { type: 'sum', format: 'currency' },
      'total.losing': { type: 'sum', format: 'currency' },
      
      // 개별 컬럼
      'last_balance': { type: 'sum', format: 'currency' },
      'last_rolling_balance': { type: 'sum', format: 'currency' }
    },
    ui: {
      label: '전체 합계',
      toggleable: true,
      toggleLabel: '현재 페이지만',
      styling: {
        backgroundColor: theme.palette.grey[100],
        fontWeight: 700,
        borderColor: theme.palette.primary.main
      }
    }
  }), [theme, showCurrentPageOnly]);

  // 당일정산 그룹별 색상 스타일
  const settlementGroupStyles = `
    /* 입출 그룹 - 파란색 계열 */
    [data-column-id="deposit_withdrawal"],
    [data-column-id*="deposit_withdrawal."] {
      background-color: rgba(54, 153, 255, 0.15) !important;
    }
    
    /* 슬롯 그룹 - 초록색 계열 */
    [data-column-id="slot"],
    [data-column-id*="slot."] {
      background-color: rgba(76, 175, 80, 0.15) !important;
    }
    
    /* 카지노 그룹 - 보라색 계열 */
    [data-column-id="casino"],
    [data-column-id*="casino."] {
      background-color: rgba(156, 39, 176, 0.15) !important;
    }
    
    /* 합계 그룹 - 주황색 계열 */
    [data-column-id="total"],
    [data-column-id*="total."] {
      background-color: rgba(255, 152, 0, 0.15) !important;
    }
    
    /* 테이블 바디의 셀에도 동일한 색상 적용 - 모든 가능한 선택자 */
    .MuiTableBody-root .MuiTableCell-root[data-column-id="deposit_withdrawal"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="deposit_withdrawal."],
    tbody .MuiTableCell-root[data-column-id="deposit_withdrawal"],
    tbody .MuiTableCell-root[data-column-id*="deposit_withdrawal."],
    table tbody tr td[data-column-id="deposit_withdrawal"],
    table tbody tr td[data-column-id*="deposit_withdrawal."],
    td[data-column-id="deposit_withdrawal"],
    td[data-column-id*="deposit_withdrawal."] {
      background-color: rgba(54, 153, 255, 0.08) !important;
    }
    
    .MuiTableBody-root .MuiTableCell-root[data-column-id="slot"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="slot."],
    tbody .MuiTableCell-root[data-column-id="slot"],
    tbody .MuiTableCell-root[data-column-id*="slot."],
    table tbody tr td[data-column-id="slot"],
    table tbody tr td[data-column-id*="slot."],
    td[data-column-id="slot"],
    td[data-column-id*="slot."] {
      background-color: rgba(76, 175, 80, 0.08) !important;
    }
    
    .MuiTableBody-root .MuiTableCell-root[data-column-id="casino"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="casino."],
    tbody .MuiTableCell-root[data-column-id="casino"],
    tbody .MuiTableCell-root[data-column-id*="casino."],
    table tbody tr td[data-column-id="casino"],
    table tbody tr td[data-column-id*="casino."],
    td[data-column-id="casino"],
    td[data-column-id*="casino."] {
      background-color: rgba(156, 39, 176, 0.08) !important;
    }
    
    .MuiTableBody-root .MuiTableCell-root[data-column-id="total"],
    .MuiTableBody-root .MuiTableCell-root[data-column-id*="total."],
    tbody .MuiTableCell-root[data-column-id="total"],
    tbody .MuiTableCell-root[data-column-id*="total."],
    table tbody tr td[data-column-id="total"],
    table tbody tr td[data-column-id*="total."],
    td[data-column-id="total"],
    td[data-column-id*="total."] {
      background-color: rgba(255, 152, 0, 0.08) !important;
    }
  `;

  // 로딩 중이거나 에러가 있는 경우 처리 - 회원관리처럼 제거
  // 데이터가 없어도 UI는 표시하도록 변경

  return (
    <PageContainer>
      {/* 당일정산 그룹별 색상 스타일 적용 */}
      <style>{settlementGroupStyles}</style>
      
      {/* 페이지 헤더 */}
      <PageHeader
        title="당일정산"
        onDisplayOptionsClick={handleDisplayOptionsClick}
        showAddButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefreshClick}
        customActions={
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLevelFilterClick}
            size="small"
            sx={{ mr: 1 }}
          >
            표시단계
          </Button>
        }
        sx={{ mb: 2 }}
      />

      {/* 컬럼 표시옵션 다이얼로그 */}
      <ColumnVisibilityDialog
        anchorEl={displayOptionsAnchor}
        open={isDisplayOptionsOpen}
        onClose={handleDisplayOptionsClose}
        toggleableColumns={toggleableColumns}
        columnVisibility={columnVisibility}
        onToggleColumn={toggleColumnVisibility}
        onShowAll={showAllColumns}
        onReset={resetToDefault}
        hiddenColumnsCount={hiddenColumnsCount}
        menuWidth="350px"
      />

      {/* 표시단계 팝오버 */}
      <Popover
        open={isLevelFilterOpen}
        anchorEl={levelFilterAnchor}
        onClose={handleLevelFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 250,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: 3
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            표시할 단계 선택
          </Typography>
          
          {/* 전체 선택/해제 버튼 */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleLevelSelectAll(true)}
              sx={{ fontSize: '12px' }}
            >
              전체 선택
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleLevelSelectAll(false)}
              sx={{ fontSize: '12px' }}
            >
              전체 해제
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* 단계 목록 */}
          <List sx={{ p: 0 }}>
            {availableLevels.map((level) => (
              <ListItem key={level.id} sx={{ p: 0, mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={levelFilter[level.id] || false}
                      onChange={() => handleLevelToggle(level.id)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {level.label}
                    </Typography>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </ListItem>
            ))}
          </List>
          
          {availableLevels.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              표시할 단계가 없습니다.
            </Typography>
          )}
        </Box>
      </Popover>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>

        {/* 테이블 헤더 컴포넌트 */}
        <TableHeader
          title="당일정산 목록"
          totalItems={totalFlattenedItems}
          countLabel="총 ##count##건의 정산"
          indentMode={indentMode}
          toggleIndentMode={toggleIndentMode}
          sequentialPageNumbers={sequentialPageNumbers}
          togglePageNumberMode={togglePageNumberMode}
          hasPinnedColumns={hasPinnedColumns}
          isGridReady={isGridReady}
          toggleColumnPin={headerToggleColumnPin}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          showIndentToggle={true}
          showPageNumberToggle={true}
          showColumnPinToggle={true}
          showSearch={true}
          searchPlaceholder="당일정산 검색..."
          sx={{ mb: 2 }}
        />

        <Box sx={{ width: '100%' }}>
          <TableFilterAndPagination
            filterProps={{
              columns: columns,
              filterValues: filterValues || {},
              activeFilters: safeActiveFilters || {},
              filterOptions: dynamicFilterOptions,
              handleFilterChange: manualHandleFilterChange,
              onFilter: handleFilter,
              onClearFilters: handleClearFilters,
              isDateFilterActive: isDateFilterActive,
              handleOpenDateFilter: handleOpenDateFilter,
              resetDateFilter: resetDateFilter
            }}
            paginationProps={{
              count: totalFlattenedItems,
              page: currentPage,
              rowsPerPage: currentRowsPerPage,
              onPageChange: handlePageChangeWithLog,
              onRowsPerPageChange: handleRowsPerPageChangeWithLog,
              totalCount: totalFlattenedItems,
              onExcelDownload: handleExcelDownload,
              onPrint: handlePrint
            }}
          />
        </Box>
        
        {/* 테이블 콘텐츠 영역 */}
        <Box 
          sx={{ 
            width: '100%', 
            mt: 2
          }} 
          ref={containerRef}
        >
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            현재 페이지: {currentPage + 1} / {Math.ceil(totalFlattenedItems / currentRowsPerPage)} (페이지당 {currentRowsPerPage}행)
            {' - 컬럼을 드래그하여 순서를 변경할 수 있습니다.'}
          </Typography>
          {console.log('🔍 BaseTable에 전달되는 데이터:', {
            visibleDataLength: visibleData?.length || 0,
            columnsLength: finalColumns?.length || 0,
            page: currentPage,
            rowsPerPage: currentRowsPerPage
          })}
          <BaseTable
            key={`today-settlement-table-${tableKey}`}
            columns={finalColumns}
            data={visibleData}
            checkable={true}
            hierarchical={true}
            indentMode={indentMode}
            checkedItems={tableCheckedItems}
            expandedRows={expandedItems}
            allChecked={tableAllChecked}
            onCheck={tableHandleCheck}
            onToggleAll={tableHandleToggleAll}
            onToggleExpand={handleToggleExpand2}
            onSort={tableHandleSort}
            sortConfig={tableSortConfig}
            page={currentPage}
            rowsPerPage={currentRowsPerPage}
            totalCount={totalFlattenedItems}
            sequentialPageNumbers={sequentialPageNumbers}
            draggableColumns={draggableColumns}
            onColumnOrderChange={updateColumns}
            dragHandlers={dragHandlers}
            dragInfo={dragInfo}
            fixedHeader={true}
            maxHeight={tableHeight}
            tableHeaderRef={tableHeaderRef}
            headerStyle={getTableHeaderStyles()}
            pinnedColumns={pinnedColumns}
            summary={summaryConfig}
            onSummaryToggle={(currentPageOnly) => setShowCurrentPageOnly(currentPageOnly)}
            fixedFooter={true}
          />
          
          {/* 테이블 리사이즈 핸들 */}
          <TableResizeHandle 
            resizeHandleProps={getResizeHandleProps(parseFloat(tableHeight))}
            showIcon={true}
            isDragging={isDragging}
            sx={{ 
              mt: 1,
              opacity: isDragging ? 1 : 0.7,
              '&:hover': { opacity: 1 }
            }}
          />
        </Box>
      </Paper>

      {/* 회원상세정보 다이얼로그 */}
      <MemberDetailDialog
        open={memberDetailDialogOpen}
        onClose={handleMemberDetailClose}
        member={selectedMemberForDetail}
        onSave={handleMemberDetailSave}
      />
    </PageContainer>
  );
};

export default TodaySettlementPage; 