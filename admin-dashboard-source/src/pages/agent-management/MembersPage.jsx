import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Paper, Typography, Grid, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import usePermission from '../../hooks/usePermission';
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
  TableDebugInfo,
  DateFilterPopover 
} from '../../components/baseTemplate/components';
import PaymentDialog from '../../components/dialogs/PaymentDialog';
import MemberDetailDialog from '../../components/dialogs/MemberDetailDialog';
import CreateMemberDialog from '../../components/dialogs/CreateMemberDialog.jsx';
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
import { useSocket } from '../../context/SocketContext';
import { 
  membersColumns,
  apiOptions,
  bankList,
  MEMBERS_COLUMNS_VERSION
} from './data/membersData';
import useDynamicTypes from '../../hooks/useDynamicTypes';
import usePageData from '../../hooks/usePageData';
import apiService from '../../services/api';
import dayjs from 'dayjs';
import { useBulkBalanceRefresh } from '../../hooks/useBalanceRefresh';

/**
 * 회원관리 페이지
 * 회원 목록 조회, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */
const MembersPage = () => {
  const theme = useTheme();
  const currentUser = useSelector(state => state.auth.user);
  const { hasPermission } = usePermission();

  // 전역 알림 사용
  const { handleRefresh, showNotification } = useNotification();
  
  // Socket 서비스 및 시퀀스 서비스 사용
  const { socketService, sequenceService } = useSocket();
  
  // 실시간 데이터 업데이트를 위한 state
  const [realtimeUpdates, setRealtimeUpdates] = useState({});
  const lastSequenceRef = useRef(0);
  
  // 자동 새로고침 상태
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [gamingUserIds, setGamingUserIds] = useState(new Set());
  const autoRefreshTimerRef = useRef(null);
  
  // 합계 표시 옵션 (전체 또는 현재 페이지)
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);
  
  // 사용자 접속 상태 추적
  const [userStatuses, setUserStatuses] = useState({});

  // 동적 유형 관리
  const {
    types,
    typeHierarchy,
    isLoading: typesLoading,
    error: typesError,
    isInitialized: typesInitialized
  } = useDynamicTypes();

  // API를 통한 실제 회원 데이터 조회
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 상태 조회 함수
  const fetchUserStatuses = useCallback(async () => {
    try {
      const response = await apiService.userStatus.getAll();
      
      if (response.status === 200) {
        const result = response.data;
        if (result.success && result.data.users) {
          const statusMap = {};
          result.data.users.forEach(user => {
            statusMap[user.userId] = {
              status: user.status,
              lastActivity: user.lastActivity,
              gameInfo: user.gameInfo
            };
          });
          setUserStatuses(statusMap);
        }
      } else if (response.status === 403) {
        // 권한이 없는 경우 조용히 무시 (선택적 기능)
        console.debug('[MembersPage] 사용자 상태 조회 권한 없음 - 선택적 기능이므로 무시');
      }
    } catch (error) {
      // 권한 오류는 조용히 무시 (403 에러 시)
      if (error.status !== 403) {
        console.error('[MembersPage] 사용자 상태 조회 오류:', error);
      }
    }
  }, []);

  // 회원 데이터 조회 함수
  const fetchMembers = useCallback(async () => {
    console.log('fetchMembers 호출됨');
    try {
      setIsLoading(true);
      const response = await apiService.members.getAll();
      console.log('회원 목록 API 응답:', response.data);
      
      if (response.data && response.data.success) {
        
        // userId 필드 변환 (username\nnickname 형식) 및 API 필드 변환
        console.log('🏗️ 원본 데이터 샘플:', response.data.data.slice(0, 2).map(m => ({
          id: m.id,
          username: m.username, 
          agent_level_id: m.agent_level_id,
          agent_level_id_type: typeof m.agent_level_id,
          agent_level_name: m.agent_level_name
        })));

        const transformedData = response.data.data.map(member => {
          // 1단계 회원인지 확인
          const isTopLevel = member.agent_level_id === 1 || member.is_top_level === 1;
          
          // 1단계 회원인 경우 대부분의 필드를 '-'로 처리
          if (isTopLevel) {
            // type 필드 생성 - agent_level_name을 사용 (label이 아님)
            const typeInfo = {
              id: member.agent_level_id,
              label: member.agent_level_name || '',
              color: 'default',
              backgroundColor: member.agent_level_bg_color || '#e0e0e0',
              borderColor: member.agent_level_border_color || '#757575'
            };
            
            return {
              ...member,
              type: typeInfo,
              userId: member.nickname ? `${member.username}\n${member.nickname}` : member.username,
              parentTypes: member.parentTypes, // parentTypes 필드 유지
              // 1단계는 모든 데이터 숨김
              balance: '-',
              gameMoney: '-',
              deposit: '-',
              withdrawal: '-',
              rollingPercent: '-',
              rolling_slot_percent: 0,
              rolling_casino_percent: 0,
              rollingAmount: 0,
              rolling_slot_amount: 0,
              rolling_casino_amount: 0,
              api: '-',
              connectionStatus: '-',
              lastGame: '-',
              name: '-',
              accountNumber: '-',
              bank: '-',
              phone: '-',
              profitLoss: (() => {
                try {
                  if (typeof member.profitLoss === 'string') {
                    const parsed = JSON.parse(member.profitLoss);
                    return {
                      slot: parsed.byGameType?.slot?.profitLoss || 0,
                      casino: parsed.byGameType?.casino?.profitLoss || 0,
                      total: parsed.summary?.netProfitLoss || 0
                    };
                  } else if (member.profitLoss && typeof member.profitLoss === 'object') {
                    return {
                      slot: member.profitLoss.byGameType?.slot?.profitLoss || 0,
                      casino: member.profitLoss.byGameType?.casino?.profitLoss || 0,
                      total: member.profitLoss.summary?.netProfitLoss || 0
                    };
                  }
                } catch (e) {
                  console.error('profitLoss 파싱 오류:', e);
                }
                return { slot: 0, casino: 0, total: 0 };
              })(),
              connectionDate: '-',
              registrationDate: member.registrationDate, // 가입일은 유지
              // 1단계 회원 표시용 플래그
              isTopLevel: true
            };
          }
          
          // 일반 회원 - 실제 데이터 표시
          // type 필드 생성 - agent_level_name을 사용 (label이 아님)
          const typeInfo = {
            id: member.agent_level_id,
            label: member.agent_level_name || '',
            color: 'default',
            backgroundColor: member.agent_level_bg_color || '#e0e0e0',
            borderColor: member.agent_level_border_color || '#757575'
          };
          
          return {
            ...member,
            type: typeInfo,
            userId: member.nickname ? `${member.username}\n${member.nickname}` : member.username,
            parentTypes: member.parentTypes || [], // parentTypes 필드 유지
            // 권한 체크 없이 실제 데이터 표시
            balance: member.balance || 0,
            gameMoney: member.gameMoney || 0,
            deposit: member.deposit || 0,
            withdrawal: member.withdrawal || 0,
            // api1, api2, API1, API2 등을 Honor API로 변환 (api 값이 있고 disabled가 아닌 경우)
            api: member.api && member.api !== 'disabled' && member.api && member.api.toLowerCase().startsWith('api') ? 'Honor API' : (member.api || '-'),
            isTopLevel: false,
            // 사용자 접속 상태 반영
            connectionStatus: userStatuses[member.id]?.status || 'offline',
            // 추가 필드들 실제 데이터 표시
            profitLoss: (() => {
              try {
                if (typeof member.profitLoss === 'string') {
                  const parsed = JSON.parse(member.profitLoss);
                  return {
                    slot: parsed.byGameType?.slot?.profitLoss || 0,
                    casino: parsed.byGameType?.casino?.profitLoss || 0,
                    total: parsed.summary?.netProfitLoss || 0
                  };
                } else if (member.profitLoss && typeof member.profitLoss === 'object') {
                  return {
                    slot: member.profitLoss.byGameType?.slot?.profitLoss || 0,
                    casino: member.profitLoss.byGameType?.casino?.profitLoss || 0,
                    total: member.profitLoss.summary?.netProfitLoss || 0
                  };
                }
              } catch (e) {
                console.error('profitLoss 파싱 오류:', e);
              }
              return { slot: 0, casino: 0, total: 0 };
            })(),
            lastGame: member.lastGame || '-',
            connectionDate: member.connectionDate || '-',
            name: member.name || member.realname || '-',
            accountNumber: member.accountNumber || member.account_number || '-',
            bank: member.bank || member.bank_name || '-',
            phone: member.phone || '-',
            lastLoginDate: member.last_login_at || '-',
            registrationDate: member.created_at || member.registrationDate || '-',
            rollingPercent: member.rolling_slot_percent || member.rolling_casino_percent ? 
              `S:${member.rolling_slot_percent || 0}% / C:${member.rolling_casino_percent || 0}%` : '-',
            rolling_slot_percent: member.rolling_slot_percent || 0,
            rolling_casino_percent: member.rolling_casino_percent || 0,
            rollingAmount: Number(member.rolling_slot_amount || 0) + Number(member.rolling_casino_amount || 0),
            rolling_slot_amount: Number(member.rolling_slot_amount || 0),
            rolling_casino_amount: Number(member.rolling_casino_amount || 0)
          };
        });
        
        // 하위 관리자인 경우 본인이 데이터에 없으면 추가
        if (currentUser && currentUser.agent_level_id !== 1) {
          const selfIncluded = transformedData.some(m => m.id === currentUser.id);
          
          if (!selfIncluded) {
            // 본인 정보를 별도로 조회
            try {
              const selfResponse = await apiService.members.getById(currentUser.id);
              if (selfResponse.data && selfResponse.data.success) {
                const selfData = selfResponse.data.data;
                // 본인은 항상 보유금 표시
                
                const transformedSelfData = {
                  ...selfData,
                  userId: selfData.nickname ? `${selfData.username}\n${selfData.nickname}` : selfData.username,
                  balance: selfData.balance,
                  gameMoney: selfData.gameMoney,
                  deposit: selfData.deposit || 0,
                  withdrawal: selfData.withdrawal || 0,
                  api: selfData.api && selfData.api !== 'disabled' && selfData.api.toLowerCase().startsWith('api') ? 'Honor API' : selfData.api,
                  isTopLevel: false,
                  parentId: selfData.parentId || selfData.parent_id || null
                };
                
                // 본인을 데이터 맨 앞에 추가
                transformedData.unshift(transformedSelfData);
              }
            } catch (err) {
              console.error('본인 정보 조회 실패:', err);
            }
          }
        }
        
        console.log('✨ 변환된 데이터 샘플:', transformedData.slice(0, 2).map(m => ({
          id: m.id,
          username: m.username, 
          agent_level_id: m.agent_level_id,
          agent_level_id_type: typeof m.agent_level_id,
          agent_level_name: m.agent_level_name || m.type?.label
        })));

        setData(transformedData);
      }
    } catch (err) {
      console.error('회원 데이터 조회 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 사용자 상태 먼저 조회 후 회원 데이터 조회
    fetchUserStatuses().then(() => {
      fetchMembers();
    });
  }, [fetchMembers, fetchUserStatuses]);
  
  // 실시간 웹소켓 이벤트 리스너
  useEffect(() => {
    if (!socketService || !sequenceService) return;
    
    // 잔액 업데이트 리스너
    const handleBalanceUpdate = (event) => {
      // 이벤트 데이터 정규화
      let balanceData = event;
      let memberId = null;
      let newBalance = null;
      
      // realtimeService로부터 온 이벤트 (data로 래핑됨)
      if (event.data && event.sequence) {
        // 시퀀스 서비스를 통한 체크 (중복/누락 방지)
        const isValid = sequenceService.updateSequence(event.sequence);
        if (!isValid) {
          return;
        }
        balanceData = event.data;
      }
      
      // memberId와 balance 추출 (다양한 형태 지원)
      memberId = balanceData.memberId || balanceData.userId || balanceData.id;
      newBalance = balanceData.afterBalance || balanceData.balance || balanceData.newBalance;
      
      // rollingAmount가 포함된 경우 (realtimeBalanceService에서 오는 이벤트)
      const rollingAmount = balanceData.rollingAmount;
      
      if (!memberId || (newBalance === null || newBalance === undefined)) {
        console.error('Invalid balance update event:', event);
        return;
      }
      
      // 실시간 업데이트 저장
      setRealtimeUpdates(prev => ({
        ...prev,
        [`balance_${memberId}`]: balanceData
      }));
      
      // 해당 회원의 데이터만 업데이트
      setData(prevData => prevData.map(member => {
        if (member.id === memberId) {
          // 1단계 회원인지 확인
          const isTopLevel = member.agent_level_id === 1 || member.is_top_level === 1;
          
          // 1단계 회원은 업데이트 무시
          if (isTopLevel) {
            return member;
          }
          
          const updatedMember = {
            ...member,
            balance: newBalance,
            deposit: balanceData.deposit !== undefined ? balanceData.deposit : member.deposit,
            withdrawal: balanceData.withdrawal !== undefined ? balanceData.withdrawal : member.withdrawal,
            _realtimeUpdated: true,
            _updateTimestamp: event.timestamp || new Date()
          };
          
          // rollingAmount가 있으면 업데이트
          if (rollingAmount !== undefined && rollingAmount !== null) {
            updatedMember.rollingAmount = rollingAmount;
          }
          
          return updatedMember;
        }
        return member;
      }));
    };
    
    // 누락된 이벤트 처리 콜백 설정
    sequenceService.setOnMissingEvents((event) => {
      // 누락된 이벤트도 동일하게 처리
      if (event.type === 'balance:update') {
        handleBalanceUpdate(event);
      }
    });
    
    // 리스너 등록 - 서버에서 발생하는 모든 잔액 이벤트 수신
    socketService.on('realtime:balance', handleBalanceUpdate);
    socketService.on('balance:update', handleBalanceUpdate);
    socketService.on('balance:changed', handleBalanceUpdate);
    socketService.on('member:balance:updated', handleBalanceUpdate);
    socketService.on('member:balance-changed', handleBalanceUpdate);
    
    // Window 이벤트 리스너 (SocketContext에서 발생)
    const handleWindowBalanceUpdate = (event) => {
      handleBalanceUpdate(event.detail);
    };
    
    window.addEventListener('memberBalanceUpdated', handleWindowBalanceUpdate);
    window.addEventListener('balanceChanged', handleWindowBalanceUpdate);
    window.addEventListener('realtimeBalanceUpdate', handleWindowBalanceUpdate);
    
    // 게임 시작/종료 이벤트 리스너
    const handleGameStart = (event) => {
      console.log('[MembersPage] 게임 시작 감지:', event);
      const userId = event.userId || event.data?.userId;
      if (userId) {
        setGamingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.add(userId);
          return newSet;
        });
      }
    };
    
    const handleGameEnd = (event) => {
      console.log('[MembersPage] 게임 종료 감지:', event);
      const userId = event.userId || event.data?.userId;
      if (userId) {
        setGamingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    };
    
    // 사용자 상태 변경 이벤트 핸들러
    const handleUserStatusChange = (event) => {
      console.log('[MembersPage] 사용자 상태 변경:', event);
      const statusInfo = event.data || event;
      
      if (statusInfo.userId) {
        setUserStatuses(prev => ({
          ...prev,
          [statusInfo.userId]: {
            status: statusInfo.status,
            timestamp: statusInfo.timestamp,
            styleInfo: statusInfo.styleInfo
          }
        }));
        
        // 데이터에도 반영
        setData(prevData => prevData.map(member => {
          if (member.id === statusInfo.userId) {
            return {
              ...member,
              connectionStatus: statusInfo.status
            };
          }
          return member;
        }));
      }
    };
    
    socketService.on('game:started', handleGameStart);
    socketService.on('game:ended', handleGameEnd);
    socketService.on('user:status-changed', handleUserStatusChange);
    
    // 롤링금 업데이트 이벤트 리스너 추가
    const handleRollingUpdate = (event) => {
      console.log('[MembersPage] 롤링금 업데이트 이벤트 수신 시작');
      console.log('[MembersPage] 이벤트 전체 내용:', JSON.stringify(event, null, 2));
      
      // event가 래핑된 경우와 직접 데이터인 경우 모두 처리
      const eventData = event.data || event;
      const { memberId, userId, rollingAmount, rolling_slot_amount, rolling_casino_amount, timestamp } = eventData;
      const targetId = memberId || userId;
      
      console.log('[MembersPage] 처리할 데이터:', { 
        targetId, 
        rollingAmount, 
        rolling_slot_amount, 
        rolling_casino_amount, 
        timestamp 
      });
      
      setData(prevData => 
        prevData.map(member => {
          if (member.id === targetId) {
            // 서버에서 보낸 정확한 값을 사용
            const slotAmount = rolling_slot_amount !== undefined ? parseFloat(rolling_slot_amount) : parseFloat(member.rolling_slot_amount || 0);
            const casinoAmount = rolling_casino_amount !== undefined ? parseFloat(rolling_casino_amount) : parseFloat(member.rolling_casino_amount || 0);
            const totalAmount = slotAmount + casinoAmount;
            
            return {
              ...member,
              rollingAmount: totalAmount,
              rolling_slot_amount: slotAmount,
              rolling_casino_amount: casinoAmount,
              lastUpdated: timestamp || new Date()
            };
          }
          return member;
        })
      );
    };
    
    socketService.on('rolling:update', handleRollingUpdate);
    socketService.on('member:rolling:updated', handleRollingUpdate);
    
    return () => {
      socketService.off('realtime:balance', handleBalanceUpdate);
      socketService.off('balance:update', handleBalanceUpdate);
      socketService.off('balance:changed', handleBalanceUpdate);
      socketService.off('member:balance:updated', handleBalanceUpdate);
      socketService.off('member:balance-changed', handleBalanceUpdate);
      socketService.off('game:started', handleGameStart);
      socketService.off('game:ended', handleGameEnd);
      socketService.off('user:status-changed', handleUserStatusChange);
      socketService.off('rolling:update', handleRollingUpdate);
      socketService.off('member:rolling:updated', handleRollingUpdate);
      window.removeEventListener('memberBalanceUpdated', handleWindowBalanceUpdate);
      window.removeEventListener('balanceChanged', handleWindowBalanceUpdate);
      window.removeEventListener('realtimeBalanceUpdate', handleWindowBalanceUpdate);
      sequenceService.setOnMissingEvents(null);
    };
  }, [socketService, sequenceService]);

  // 새로고침 핸들러
  const handleRefreshClick = useCallback(async () => {
    handleRefresh('회원 목록');
    // fetchMembers 함수를 직접 호출하여 동일한 데이터 변환 로직 사용
    await fetchMembers();
  }, [handleRefresh, fetchMembers]);
  
  // 게임 중일 때 자동 새로고침
  useEffect(() => {
    if (gamingUserIds.size > 0 && !isAutoRefreshing) {
      console.log('[MembersPage] 자동 새로고침 시작 - 게임 중인 사용자:', Array.from(gamingUserIds));
      setIsAutoRefreshing(true);
      
      // 즉시 한 번 새로고침
      fetchMembers();
      
      // 10초마다 새로고침
      autoRefreshTimerRef.current = setInterval(() => {
        console.log('[MembersPage] 자동 새로고침 실행');
        fetchMembers();
      }, 10000);
    } else if (gamingUserIds.size === 0 && isAutoRefreshing) {
      console.log('[MembersPage] 자동 새로고침 중지');
      setIsAutoRefreshing(false);
      
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    }
    
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [gamingUserIds.size, isAutoRefreshing, fetchMembers]);
  
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

  // 들여쓰기 모드 - useTableIndent 훅 사용
  const { indentMode, toggleIndentMode } = useTableIndent(true);

  // parentId 기반 계층 구조 생성
  const buildHierarchicalData = useCallback((items, parentId = null) => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: buildHierarchicalData(items, item.id)
      }))
      .filter(item => item.id !== undefined); // 유효한 항목만
  }, []);
  
  // 페이지네이션 상태 - visibleMemberIds보다 먼저 정의
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(25);
  
  // 계층 데이터 생성
  const hierarchicalData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 최상위 레벨이 아닌 경우, 자신을 루트로 하는 계층 구조 생성
    if (currentUser && currentUser.agent_level_id !== 1) {
      // 자신을 찾아서 루트로 설정
      const selfData = data.find(member => {
        // 타입을 맞춰서 비교 (숫자/문자열 변환)
        const isMatch = member.id == currentUser.id || member.id === currentUser.id || String(member.id) === String(currentUser.id);
        return isMatch;
      });
      
      if (selfData) {
        // 자신을 루트로 하는 계층 구조 생성
        // 본인의 하위 회원들만 가져오기
        const children = buildHierarchicalData(data, selfData.id);
        // 본인을 루트 노드로 설정하고 하위 회원들을 children으로 추가
        return [{
          ...selfData,
          parentId: null, // 계층 구조에서는 본인을 최상위로 표시
          children: children
        }];
      } else {
        // 전체 계층 구조 생성 (최상위 관리자처럼 처리)
        const result = buildHierarchicalData(data);
        return result;
      }
    }
    
    // 기존 로직 (최상위 관리자인 경우)
    const result = buildHierarchicalData(data);
    return result;
  }, [data, buildHierarchicalData, currentUser]);
  
  // 펼쳐진 항목 추적 - 빈 객체로 초기화
  const [expandedItems, setExpandedItems] = useState({});
  
  // 현재 화면에 보이는 회원들의 ID 목록
  const visibleMemberIds = useMemo(() => {
    if (!hierarchicalData || hierarchicalData.length === 0) return [];
    
    const getVisibleIds = (items, parentExpanded = true) => {
      const ids = [];
      items.forEach(item => {
        if (parentExpanded && item.id && item.agent_level_id !== 1) {
          ids.push(item.id);
        }
        if (item.children && item.children.length > 0 && expandedItems[item.id]) {
          ids.push(...getVisibleIds(item.children, true));
        }
      });
      return ids;
    };
    
    // 페이지네이션을 고려하여 실제 보이는 항목들만
    const allVisibleIds = getVisibleIds(hierarchicalData);
    const startIndex = currentPage * currentRowsPerPage;
    const endIndex = startIndex + currentRowsPerPage;
    
    return allVisibleIds.slice(startIndex, endIndex);
  }, [hierarchicalData, expandedItems, currentPage, currentRowsPerPage]);
  
  // 자동 잔액 새로고침 (30초 간격으로 보이는 회원만)
  const { refreshAllBalances } = useBulkBalanceRefresh(visibleMemberIds, 30000, true);
  
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
    const addAllItems = (items, isRoot = false) => {
      items.forEach(item => {
        // 모든 항목을 펼침 상태로 설정
        if (item.children && item.children.length > 0) {
          newExpanded[item.id] = expanded;
          addAllItems(item.children, false);
        }
      });
    };
    addAllItems(hierarchicalData, true);
    setExpandedItems(newExpanded);
  }, [hierarchicalData]);
  
  // hierarchicalData가 변경될 때 모든 항목 펼치기
  useEffect(() => {
    if (hierarchicalData.length > 0) {
      const newExpanded = {};
      const addAllItems = (items, isRoot = false) => {
        items.forEach(item => {
          // 하위 관리자가 로그인한 경우, 자기 자신(루트)도 펼쳐야 하위 회원들이 보임
          const shouldExpand = item.children && item.children.length > 0;
          
          if (shouldExpand) {
            newExpanded[item.id] = true;
            addAllItems(item.children, false);
          }
        });
      };
      addAllItems(hierarchicalData, true);
      setExpandedItems(newExpanded);
    }
  }, [hierarchicalData, currentUser]);
  
  const expandedTypes = expandedItems;
  
  // 헤더 행 고정 기능 - useTableHeaderFixed 훅 사용
  const {
    tableHeaderRef,
    getTableHeaderStyles
  } = useTableHeaderFixed({
    zIndex: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  });

  // 지급/회수 다이얼로그 상태
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentAction, setPaymentAction] = useState('deposit'); // 'deposit' 또는 'withdraw'
  
  // 회원상세정보 다이얼로그 상태
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);
  
  // 회원추가 다이얼로그 상태
  const [createMemberDialogOpen, setCreateMemberDialogOpen] = useState(false);

  // 회원관리 액션 핸들러들
  const handlePayment = useCallback((row) => {
    // 자기 자신에게는 지급 불가
    if (currentUser && row.id === currentUser.id) {
      alert('자기 자신에게는 머니를 지급할 수 없습니다.');
      return;
    }
    setSelectedMember(row);
    setPaymentAction('deposit');
    setPaymentDialogOpen(true);
  }, [currentUser]);

  const handleWithdraw = useCallback((row) => {
    // 자기 자신에게는 회수 불가
    if (currentUser && row.id === currentUser.id) {
      alert('자기 자신으로부터는 머니를 회수할 수 없습니다.');
      return;
    }
    setSelectedMember(row);
    setPaymentAction('withdraw');
    setPaymentDialogOpen(true);
  }, [currentUser]);

  // 지급/회수 확인 핸들러
  const handlePaymentConfirm = useCallback(async (paymentData) => {
    const actionText = paymentData.action === 'deposit' ? '지급' : '회수';
    const memberName = selectedMember?.name || selectedMember?.userId || '회원';
    
    try {
      // API 호출 데이터 준비
      const requestData = {
        memberId: selectedMember.id,
        action: paymentData.action,
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        note: paymentData.note
      };
      
      // 실제 API 호출
      const response = await apiService.moneyTransfer.adminTransfer(requestData);
      
      if (response.data.success) {
        alert(`${memberName}님에게 ${paymentData.amount.toLocaleString()}원 ${actionText} 처리가 완료되었습니다.`);
        
        // 다이얼로그 닫기
        setPaymentDialogOpen(false);
        
        // 테이블 데이터 새로고침
        fetchMembers();
      } else {
        alert(`${actionText} 처리 실패: ${response.data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('머니 지급/회수 오류:', error);
      alert(`${actionText} 처리 중 오류가 발생했습니다: ${error.response?.data?.message || error.message}`);
    }
  }, [selectedMember, fetchMembers]);

  // 게임머니 전환 핸들러
  const handleGameMoneyTransfer = useCallback(async (memberId, isAutoTransfer = false) => {
    try {
      const response = await apiService.honorSync.withdrawFromGame({ userId: memberId });
      
      if (response.data.success) {
        const withdrawnAmount = response.data.withdrawnAmount || 0;
        
        // 다이얼로그용 selectedMember 업데이트
        if (selectedMember && selectedMember.username === memberId) {
          setSelectedMember(prev => ({
            ...prev,
            balance: (prev.balance || 0) + withdrawnAmount,
            gameMoney: 0
          }));
        }
        
        if (!isAutoTransfer) {
          alert(`${withdrawnAmount.toLocaleString()}원이 보유금으로 전환되었습니다.`);
        }
        fetchMembers(); // 데이터 새로고침
        return { success: true, amount: withdrawnAmount };
      } else {
        if (!isAutoTransfer) {
          alert('게임머니 전환 실패: ' + (response.data.error || '알 수 없는 오류'));
        }
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('게임머니 전환 오류:', error);
      if (!isAutoTransfer) {
        alert('게임머니 전환 중 오류가 발생했습니다: ' + (error.response?.data?.error || error.message));
      }
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }, [fetchMembers, selectedMember]);

  // 롤링금 전환 핸들러
  const handleRollingTransfer = useCallback(async (memberId, transferType = 'all') => {
    try {
      // memberId가 사실 username인 경우 처리
      const member = data.find(m => m.username === memberId || m.id === memberId);
      const actualMemberId = member?.id || memberId;
      
      const response = await apiService.rollingTransfer.transfer({
        memberId: actualMemberId,
        transferType: transferType
      });
      
      if (response.data.success) {
        const transferAmount = response.data.data?.transferAmount || 0;
        const afterRolling = response.data.data?.afterRolling || { slot: 0, casino: 0 };
        
        // 다이얼로그용 selectedMember 업데이트
        if (selectedMember && (selectedMember.username === memberId || selectedMember.id === actualMemberId)) {
          setSelectedMember(prev => ({
            ...prev,
            balance: (prev.balance || 0) + transferAmount,
            rollingAmount: afterRolling.slot + afterRolling.casino,
            rolling_slot_amount: afterRolling.slot,
            rolling_casino_amount: afterRolling.casino
          }));
        }
        
        alert(response.data.message);
        fetchMembers(); // 데이터 새로고침
      } else {
        alert('롤링금 전환 실패: ' + (response.data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('롤링금 전환 오류:', error);
      alert('롤링금 전환 중 오류가 발생했습니다: ' + (error.response?.data?.error || error.message));
    }
  }, [fetchMembers, selectedMember, data]);

  // 지급/회수 다이얼로그 닫기 핸들러
  const handlePaymentDialogClose = useCallback(() => {
    setPaymentDialogOpen(false);
    setSelectedMember(null);
    setPaymentAction('deposit');
  }, []);

  // 회원상세정보 다이얼로그 핸들러들
  const handleMemberDetailOpen = useCallback(async (member) => {
    // 먼저 이전 상태를 완전히 초기화
    setSelectedMemberForDetail(null);
    setMemberDetailDialogOpen(false);
    
    // 약간의 지연을 주어 React가 상태를 정리할 시간을 줌
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      // 개별 회원 조회 API 호출하여 parentTypes 포함된 데이터 가져오기
      const response = await apiService.members.getById(member.id);
      if (response.data && response.data.success) {
        const detailedMember = response.data.data;
        // 기존 데이터와 병합 (프론트엔드 형식 유지)
        const memberWithDetails = {
          ...member,
          ...detailedMember,
          userId: member.userId, // 프론트엔드 형식 유지
          type: member.type // 프론트엔드 형식 유지
        };
        setSelectedMemberForDetail(memberWithDetails);
        setMemberDetailDialogOpen(true);
      } else {
        alert('회원 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('회원 상세 조회 실패:', error);
      alert('회원 정보 조회 중 오류가 발생했습니다.');
    }
  }, []);

  const handleMemberDetailClose = useCallback(() => {
    setMemberDetailDialogOpen(false);
    setSelectedMemberForDetail(null);
  }, []);

  const handleMemberDetailSave = useCallback(async (updatedMember) => {
    // 서버로 전송할 필드만 추출 (불필요한 데이터 제거)
    const dataToSend = {
      id: updatedMember.id,
      nickname: updatedMember.nickname,
      status: typeof updatedMember.status === 'object' ? updatedMember.status.label : updatedMember.status,
      name: updatedMember.name,
      phone: updatedMember.phone,
      bank: updatedMember.bank,
      accountNumber: updatedMember.accountNumber,
      accountHolder: updatedMember.accountHolder,
      referrer: updatedMember.referrer,
      memo: updatedMember.memo,
      language: updatedMember.language,
      browserTitle: updatedMember.browserTitle,
      usernameChangeEnabled: updatedMember.usernameChangeEnabled,
      slot_percent: updatedMember.slot_percent,
      casino_percent: updatedMember.casino_percent,
      agent_level_id: updatedMember.agent_level_id,
      designTemplateId: updatedMember.designTemplateId
    };
    
    // 데이터 준비 완료
    
    try {
      // API 호출하여 회원정보 수정
      const response = await apiService.members.update(updatedMember.id, dataToSend);
      
      if (response.data.success) {
        // 디자인 템플릿 처리 (도메인에 할당)
        let designTemplateMessage = '';
        if (updatedMember.designTemplateId !== undefined && updatedMember.selectedDomainId) {
          try {
            const designResponse = await apiService.post('/design-templates/assign/domain', {
              domainId: updatedMember.selectedDomainId,
              templateId: updatedMember.designTemplateId || null
            });
            
            if (designResponse.data.success) {
              designTemplateMessage = updatedMember.designTemplateId 
                ? '\n선택한 도메인에 디자인 템플릿이 적용되었습니다.'
                : '\n선택한 도메인의 디자인 템플릿이 제거되었습니다.';
            }
          } catch (designError) {
            console.error('디자인 템플릿 처리 오류:', designError);
            // 디자인 템플릿 오류는 별도로 표시하지 않고 계속 진행
          }
        }
        
        // 도메인 권한 처리 (별도 import 필요)
        let domainPermissionMessage = '';
        if (updatedMember.grantPermissionTo || updatedMember.delegatePermissionType || updatedMember.selectedDomainId !== undefined) {
          try {
            const userDomainPermissionService = (await import('../../services/userDomainPermissionService')).default;
            const permissionResult = await userDomainPermissionService.handleMemberUpdate(
              updatedMember.id,
              {
                grantPermissionTo: updatedMember.grantPermissionTo,
                delegatePermissionType: updatedMember.delegatePermissionType,
                selectedDomainId: updatedMember.selectedDomainId
              },
              currentUser
            );
            
            if (permissionResult.success && permissionResult.results.length > 0) {
              const successCount = permissionResult.results.filter(r => r.success).length;
              const failCount = permissionResult.results.filter(r => !r.success).length;
              
              if (successCount > 0 && failCount === 0) {
                domainPermissionMessage = `\n도메인 권한이 ${successCount}명에게 성공적으로 부여되었습니다.`;
              } else if (successCount > 0 && failCount > 0) {
                domainPermissionMessage = `\n도메인 권한: 성공 ${successCount}명, 실패 ${failCount}명`;
              } else if (failCount > 0) {
                domainPermissionMessage = `\n도메인 권한 부여에 실패했습니다. (${failCount}명)`;
              }
            }
          } catch (permError) {
            console.error('도메인 권한 처리 오류:', permError);
            // 도메인 권한 오류는 별도로 표시하지 않고 계속 진행
          }
        }
        
        alert(`${updatedMember.nickname || updatedMember.username}님의 정보가 저장되었습니다.${designTemplateMessage}${domainPermissionMessage}`);
        
        console.log('회원 정보 수정 완료, 데이터 새로고침 시작');
        // 데이터 새로고침
        await fetchMembers();
        console.log('데이터 새로고침 완료');
        
        handleMemberDetailClose();
      } else {
        alert('회원정보 수정에 실패했습니다.');
      }
    } catch (error) {
      // 회원정보 수정 오류 처리
      alert(`오류가 발생했습니다: ${error.response?.data?.error || error.message}`);
    }
  }, [handleMemberDetailClose, fetchMembers, currentUser]);

  // 회원추가 다이얼로그 핸들러들
  const handleCreateMemberOpen = useCallback(() => {
    setCreateMemberDialogOpen(true);
  }, []);

  const handleCreateMemberClose = useCallback(() => {
    setCreateMemberDialogOpen(false);
  }, []);

  const handleCreateMemberConfirm = useCallback((newMemberData) => {
    // 회원 생성 성공 시 처리
    if (Array.isArray(newMemberData)) {
      // 일괄 생성의 경우
      showNotification(`${newMemberData.length}명의 회원이 생성되었습니다.`, 'success');
    } else {
      // 단일 생성의 경우
      showNotification(`${newMemberData.nickname || newMemberData.username} 회원이 생성되었습니다.`, 'success');
    }
    
    // 회원 목록 새로고침
    fetchMembers();
    
    // 다이얼로그 닫기
    handleCreateMemberClose();
  }, [handleCreateMemberClose, fetchMembers, showNotification]);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(() => {
    // console.log('회원 목록 엑셀 다운로드');
    alert('회원 목록을 엑셀로 다운로드합니다.');
  }, []);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    // console.log('회원 목록 인쇄');
    alert('회원 목록을 인쇄합니다.');
  }, []);

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
    data: hierarchicalData,
    initialSort: { key: null, direction: 'asc' },
    initialCheckedItems: {},
    initialExpandedRows: expandedItems, // expandedItems 상태 사용
    indentMode: true,
    page: currentPage,
    rowsPerPage: currentRowsPerPage
  });

  // 버튼 액션이 포함된 컬럼 설정
  const columnsWithActions = useMemo(() => {
    return membersColumns.map(column => {
      if (column.id === 'actions' && column.buttons) {
        return {
          ...column,
          buttons: column.buttons.map(button => ({
            ...button,
            onClick: button.label === '지급' ? handlePayment : handleWithdraw
          }))
        };
      }
      
      // 유형 컬럼에 토글 핸들러 추가
      if (column.id === 'type' && column.type === 'hierarchical') {
        return {
          ...column,
          onToggle: (itemId) => {
            console.log('유형 컬럼 토글:', itemId);
            // useTypeHierarchy의 toggleTypeExpand 사용
            const item = hierarchicalData.find(item => item.id === itemId);
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
      
      // 게임머니 컬럼 - 커스텀 렌더러 유지
      if (column.id === 'gameMoney') {
        return column; // membersData.js에서 이미 설정된 커스텀 렌더러 사용
      }
      
      // 롤링금 컬럼 - 커스텀 렌더러 유지
      if (column.id === 'rollingAmount') {
        return column; // membersData.js에서 이미 설정된 커스텀 렌더러 사용
      }
      
      return column;
    });
  }, [handlePayment, handleWithdraw, hierarchicalData, toggleTypeExpand, handleMemberDetailOpen]);

  // 동적 필터 옵션 생성
  const dynamicFilterOptions = useMemo(() => {
    console.log('🎛️ 필터 옵션 생성 시작:', {
      typesInitialized,
      typesCount: Object.keys(types || {}).length,
      dataCount: data?.length || 0,
      dataSample: data?.slice(0, 2)?.map(d => ({ 
        agent_level_id: d.agent_level_id, 
        agent_level_name: d.agent_level_name 
      }))
    });
    // 하드코딩된 agent level 정보 사용 (Socket 데이터가 로드되지 않을 때 fallback)
    const agentLevelMapping = {
      1: '본사',
      2: '부본사',
      3: '총판',
      4: '매장',
      5: '회원'
    };
    
    // types 객체가 비어있으면 data에서 추출, 있으면 types 사용
    let typeItems = [];
    
    if (Object.keys(types || {}).length > 0) {
      // types 객체가 있으면 우선 사용
      typeItems = Object.entries(types).map(([typeId, typeInfo]) => ({
        value: typeId,
        label: typeInfo.label
      }));
    } else {
      // types가 없으면 현재 데이터에서 추출 + 하드코딩된 매핑 사용
      const uniqueLevels = Array.from(new Set(data.map(item => item.agent_level_id))).filter(id => id);
      
      // 1-5 레벨 모두 포함하도록 보장
      [1, 2, 3, 4, 5].forEach(levelId => {
        if (!uniqueLevels.includes(levelId)) {
          uniqueLevels.push(levelId);
        }
      });
      
      typeItems = uniqueLevels
        .sort((a, b) => a - b)
        .map(id => {
          const member = data.find(m => m.agent_level_id === id);
          const label = member?.agent_level_name || agentLevelMapping[id] || `레벨 ${id}`;
          return {
            value: `agent_level_${id}`,
            label
          };
        });
    }

    console.log('🔍 생성된 typeItems:', typeItems);
    
    const baseOptions = [
      {
        id: 'status',
        label: '상태',
        items: [
          { value: '', label: '전체' },
          { value: 'online', label: '온라인' },
          { value: 'offline', label: '오프라인' },
          { value: 'suspended', label: '정지' }
        ]
      },
      {
        id: 'type',
        label: '회원유형',
        items: [
          { value: '', label: '전체' },
          ...typeItems
        ]
      },
      {
        id: 'api',
        label: 'API',
        items: [
          { value: '', label: '전체' },
          ...apiOptions.map(option => ({
            value: option.value,
            label: option.label
          }))
        ]
      }
    ];
    
    return baseOptions;
  }, [typesInitialized, types, apiOptions]);

  // useTableFilterAndPagination 훅 사용
  const {
    // 필터 관련 상태 및 핸들러
    activeFilters,
    isDateFilterActive,
    isDateFilterOpen,
    dateFilterAnchorEl,
    handleOpenDateFilter,
    handleCloseDateFilter,
    handleDateRangeChange,
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
    data: hierarchicalData,
    defaultRowsPerPage: 25,
    hierarchical: true,
    filterOptions: {
      initialFilters: { status: 'all', type: 'all', api: 'all' }
    },
    paginationOptions: {
      initialPage: 0,
      initialRowsPerPage: 25,
      totalItems: data.length,
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
    initialTotalItems: data.length,
    tableId: 'membersPage', // 페이지별 고유 ID 추가
    onSearch: (value) => {
      console.log(`회원 검색: ${value}`);
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

  // 전역 함수로 핸들러 노출 (memberColumns.jsx에서 접근)
  useEffect(() => {
    window.handleGameMoneyTransfer = handleGameMoneyTransfer;
    window.handleRollingTransfer = handleRollingTransfer;
    
    return () => {
      delete window.handleGameMoneyTransfer;
      delete window.handleRollingTransfer;
    };
  }, [handleGameMoneyTransfer, handleRollingTransfer]);

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
    tableId: 'members_table',
    version: MEMBERS_COLUMNS_VERSION, // 버전 추가
    onColumnOrderChange: (newColumns) => {
      console.log('회원 테이블 컬럼 순서 변경:', newColumns);
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
    tableId: 'members_table'
  });

  // 표시옵션 다이얼로그 상태
  const [displayOptionsAnchor, setDisplayOptionsAnchor] = useState(null);
  const isDisplayOptionsOpen = Boolean(displayOptionsAnchor);

  // 표시옵션 버튼 클릭 핸들러
  const handleDisplayOptionsClick = useCallback((anchorElement) => {
    setDisplayOptionsAnchor(anchorElement);
  }, []);

  // 표시옵션 다이얼로그 닫기 핸들러
  const handleDisplayOptionsClose = useCallback(() => {
    setDisplayOptionsAnchor(null);
  }, []);

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
    console.log('회원 행 클릭:', row);
  };

  // 계층 펼치기/접기 핸들러
  const handleToggleExpand2 = useCallback((id) => {
    console.log(`회원 유형 토글: ${id}`);
    toggleTypeExpand(id);
    
    if (typeof tableHandleToggleExpand === 'function') {
      tableHandleToggleExpand(id);
    }
  }, [toggleTypeExpand, tableHandleToggleExpand]);

  // 필터 콜백 함수
  const filterCallback = useCallback((result, filterId, filterValue) => {
    console.log('🔍 filterCallback 호출:', {
      filterId,
      filterValue,
      resultLength: result.length,
      firstItem: result[0] ? {
        id: result[0].id,
        username: result[0].username,
        agent_level_id: result[0].agent_level_id,
        agent_level_id_type: typeof result[0].agent_level_id
      } : null
    });

    switch (filterId) {
      case 'status':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => {
          switch (filterValue) {
            case 'online':
              return item.connectionStatus === '온라인';
            case 'offline':
              return item.connectionStatus === '오프라인';
            case 'suspended':
              return item.connectionStatus === '정지';
            default:
              return true;
          }
        });
        
      case 'type':
        if (!filterValue || filterValue === '') {
          return result;
        }
        
        // agent_level_X 형태가 아니면 그대로 리턴
        if (!filterValue.startsWith('agent_level_')) {
          return result;
        }
        
        // agent_level_1 -> 1로 변환
        const levelId = parseInt(filterValue.replace('agent_level_', ''));

        // 숫자와 문자열 모두 체크
        const filtered = result.filter(item => {
          return Number(item.agent_level_id) === levelId;
        });
        
        return filtered;
        
      case 'api':
        if (filterValue === 'all' || filterValue === '') return result;
        
        return result.filter(item => item.api === filterValue);
        
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
    console.log(`회원 필터 변경: ${filterId} = ${value}`);
    
    // type 필터의 경우 값 그대로 전달 (agent_level_X 형태)
    const actualValue = value === 'all' || value === '' ? '' : value;
    
    handleFilter({
      [filterId]: actualValue
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
  
  // useTableData 훅을 사용하여 필터링된 데이터 계산
  const computedFilteredData = useTableData({
    data: data,
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
    // 필터가 적용되지 않았거나 검색어가 없는 경우 계층 구조 데이터 반환
    const hasActiveFilters = Object.values(safeActiveFilters).some(value => value && value !== '');
    const hasSearchText = searchText && searchText.trim() !== '';
    
    
    // 검색어가 있는 경우: 계층 구조 무시하고 평면 데이터로 표시
    if (hasSearchText) {
      if (!data || !filteredIds || filteredIds.length === 0) {
        return [];
      }
      // 검색 결과를 평면 배열로 반환 (계층 구조 없이)
      return data.filter(item => filteredIds.includes(item.id));
    }
    
    // 필터가 없는 경우 전체 데이터 반환
    if (!hasActiveFilters) {
      const dataToUse = hierarchicalData?.length > 0 ? hierarchicalData : data;
      return dataToUse;
    }
    
    // 필터가 있는 경우: 평면 데이터로 필터링 (계층 구조 무시)
    if (!data || !filteredIds || filteredIds.length === 0) {
      return [];
    }
    
    // 필터가 적용된 경우 평면 데이터 반환 (계층 구조 없이)
    const filtered = data.filter(item => filteredIds.includes(item.id));
    
    return filtered;
  }, [hierarchicalData, filteredIds, safeActiveFilters, searchText, data]);
  
  // 페이지 관련 효과
  useEffect(() => {
    // console.log(`회원 페이지네이션 설정: 페이지=${page}, 행수=${rowsPerPage}`);
  }, [page, rowsPerPage]);

  // 필터링된 데이터 및 표시 데이터 저장
  const safeFilteredData = filteredHierarchicalData || [];
  
  // 실제 전체 항목 수 계산
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
  

  // 필터링된 데이터가 변경될 때 totalItems 값 업데이트
  useEffect(() => {
    if (safeFilteredData.length !== totalItems) {
      // console.log(`회원 검색/필터 결과: ${safeFilteredData.length}개 항목 (평면화: ${totalFlattenedItems}개)`);
    }
  }, [safeFilteredData.length, totalItems, totalFlattenedItems]);
  
  // 페이지 변경 핸들러
  const handlePageChangeWithLog = useCallback((event, newPageIndex) => {
    let pageIndex = newPageIndex;
    
    if (typeof event === 'number' && newPageIndex === undefined) {
      pageIndex = event;
    }
    
    // console.log(`회원 페이지 변경: ${currentPage} -> ${pageIndex}`);
    
    if (typeof pageIndex !== 'number') {
      console.error('유효하지 않은 페이지 번호:', pageIndex);
      return;
    }
    
    setCurrentPage(pageIndex);
    handlePageChange(pageIndex);
    
    // console.log(`회원 페이지 ${pageIndex + 1} 로드 완료`);
  }, [currentPage, handlePageChange]);

  // 페이지당 행 수 변경 핸들러
  const handleRowsPerPageChangeWithLog = useCallback((event) => {
    if (!event || !event.target || !event.target.value) {
      console.error('회원 행 수 변경 이벤트 오류:', event);
      return;
    }
    
    const newRowsPerPage = parseInt(event.target.value, 10);
    // console.log(`회원 페이지당 행 수 변경: ${currentRowsPerPage} -> ${newRowsPerPage}`);
    
    setCurrentRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    handleRowsPerPageChange(event);
    
    // console.log(`회원 테이블 새 행 수 ${newRowsPerPage}로 업데이트 완료`);
  }, [currentRowsPerPage, handleRowsPerPageChange]);

  // 테이블 강제 리렌더링을 위한 키 값
  const [tableKey, setTableKey] = useState(Date.now());
  
  // 페이지 또는 행 수가 변경될 때마다 테이블 키 업데이트
  useEffect(() => {
    setTableKey(Date.now());
    // console.log(`회원 테이블 키 업데이트: 페이지=${currentPage}, 행수=${currentRowsPerPage}`);
  }, [currentPage, currentRowsPerPage]);
  
  // 현재 페이지와 rowsPerPage를 활용하는 메모이제이션된 표시 데이터
  const visibleData = useMemo(() => {
    if (!safeFilteredData || safeFilteredData.length === 0) return [];
    
    // visibleData 생성
    
    return safeFilteredData;
  }, [safeFilteredData, currentPage, currentRowsPerPage, totalFlattenedItems]);

  // visibleColumns에 버튼 핸들러 다시 추가
  const finalColumns = useMemo(() => {
    const result = visibleColumns.map(column => {
      if (column.id === 'actions' && column.buttons) {
        return {
          ...column,
          buttons: column.buttons.map(button => ({
            ...button,
            onClick: button.label === '지급' ? handlePayment : handleWithdraw
          }))
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
    
    return result;
  }, [visibleColumns, handlePayment, handleWithdraw, handleMemberDetailOpen]);

  // 전체합계 설정 - 회원관리 페이지용
  const summaryConfig = useMemo(() => ({
    enabled: true,
    position: 'bottom',
    scope: {
      type: showCurrentPageOnly ? 'page' : 'all',
      customFilter: (row) => {
        // agent_level_id가 1 또는 2인 경우 제외
        const agentLevel = row.agent_level_id || row.agent_level || 0;
        return agentLevel !== 1 && agentLevel !== 2;
      }
    },
    columns: {
      // 보유금액
      balance: { type: 'sum', format: 'currency' },
      // 게임머니
      gameMoney: { type: 'sum', format: 'currency' },
      // 입금
      deposit: { type: 'sum', format: 'currency' },
      // 출금
      withdrawal: { type: 'sum', format: 'currency' },
      // 롤링금 (전체)
      rollingAmount: { type: 'sum', format: 'currency' },
      // 슬롯 롤링금 (숨겨진 컬럼)
      rolling_slot_amount: { type: 'sum', format: 'currency' },
      // 카지노 롤링금 (숨겨진 컬럼)
      rolling_casino_amount: { type: 'sum', format: 'currency' },
      // 슬롯 손익
      'profitLoss.slot': { type: 'sum', format: 'currency' },
      // 카지노 손익
      'profitLoss.casino': { type: 'sum', format: 'currency' },
      // 종합 손익
      'profitLoss.total': { type: 'sum', format: 'currency' }
    },
    ui: {
      label: '전체합계',
      toggleable: true,
      toggleLabel: '현재 페이지만',
      styling: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold'
      }
    }
  }), [showCurrentPageOnly]);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
        <PageHeader
          title="회원관리"
          onDisplayOptionsClick={handleDisplayOptionsClick}
          showAddButton={true}
          showRefreshButton={true}
          addButtonText="회원 추가"
          onAddClick={handleCreateMemberOpen}
          onRefreshClick={handleRefreshClick}
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

        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>

          {/* 회원 유형 계층 트리 뷰 */}
          {/*
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              회원 유형 구조 {typesLoading && '(로딩 중...)'} {typesError && '(오류 발생)'}
            </Typography>
            {typesInitialized && Object.keys(types).length > 0 ? (
              <TypeTreeView 
                types={types}
                typeHierarchy={typeHierarchy}
                expandedTypes={expandedTypes}
                onTypeToggle={toggleTypeExpand}
                onExpandAll={setAllExpanded}
                direction="horizontal"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {typesLoading ? '동적 유형을 로드하는 중...' : 
                 typesError ? `오류: ${typesError}` : 
                 '동적 유형이 설정되지 않았습니다.'}
              </Typography>
            )}
          </Box>
          */}
          
          {/* 테이블 설정 옵션 */}
          {/*
          <TableHeightSetting
            tableHeight={tableHeight}
            autoHeight={autoHeight}
            toggleAutoHeight={toggleAutoHeight}
            setManualHeight={setManualHeight}
            minHeight={200}
            maxHeight={1200}
            step={50}
          />*/}

          {/* 테이블 헤더 컴포넌트 */}
          <TableHeader
            title="회원 목록"
            totalItems={totalFlattenedItems}
            countLabel="총 ##count##명의 회원"
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
            onRefresh={handleRefreshClick}
            showIndentToggle={true}
            showPageNumberToggle={true}
            showColumnPinToggle={true}
            showSearch={true}
            searchPlaceholder="회원 검색..."
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
            <BaseTable
              key={`members-table-${tableKey}`}
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
              fixedFooter={true}
              maxHeight={tableHeight}
              tableHeaderRef={tableHeaderRef}
              headerStyle={getTableHeaderStyles()}
              pinnedColumns={pinnedColumns}
              summary={summaryConfig}
              showCurrentPageOnly={showCurrentPageOnly}
              onSummaryToggle={(currentPageOnly) => {
                console.log('회원관리 전체합계 토글:', currentPageOnly ? '현재 페이지만' : '전체');
                setShowCurrentPageOnly(currentPageOnly);
              }}
              dependencies={{
                realtimeUpdates,
                userStatuses,
                gamingUserIds
              }}
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
            
            {/* 디버깅용 정보 */}
            {/*<TableDebugInfo
              totalItems={totalFlattenedItems}
              totalPages={Math.ceil(totalFlattenedItems / currentRowsPerPage)}
              currentPage={currentPage}
              currentRowsPerPage={currentRowsPerPage}
              totalCount={totalFlattenedItems}
              searchText={searchText}
              sequentialPageNumbers={sequentialPageNumbers}
              isDragging={isDragging}
              tableHeight={tableHeight}
              calculateMaxHeight={calculateMaxHeight}
              pinnedColumns={pinnedColumns}
              visibleColumns={visibleColumns}
              hiddenColumnsCount={hiddenColumnsCount}
              columnVisibility={columnVisibility}
            />*/}
          </Box>
        </Paper>

        {/* 지급/회수 다이얼로그 */}
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={handlePaymentDialogClose}
          member={selectedMember}
          action={paymentAction}
          onConfirm={handlePaymentConfirm}
          formatCurrency={(value) => new Intl.NumberFormat('ko-KR').format(value || 0)}
          onGameMoneyTransfer={handleGameMoneyTransfer}
          onRollingTransfer={handleRollingTransfer}
        />

        {/* 회원상세정보 다이얼로그 */}
        <MemberDetailDialog
          key={selectedMemberForDetail?.id ? `member-${selectedMemberForDetail.id}` : 'no-member'}
          open={memberDetailDialogOpen}
          onClose={handleMemberDetailClose}
          member={selectedMemberForDetail}
          onSave={handleMemberDetailSave}
        />

        {/* 회원추가 다이얼로그 */}
        <CreateMemberDialog
          open={createMemberDialogOpen}
          onClose={handleCreateMemberClose}
          members={data}
          onCreateMember={handleCreateMemberConfirm}
        />
    </PageContainer>
  );
};

export default MembersPage; 