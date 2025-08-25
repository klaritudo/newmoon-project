import { useMemo, useCallback, useState, useEffect } from 'react';
import useDynamicTypes from './useDynamicTypes';
import { apiOptions, bankList } from '../pages/agent-management/data/membersData';
import apiService from '../services/api';

/**
 * 페이지 데이터 로딩을 위한 범용 훅
 * 모든 관리 페이지의 데이터 로딩 패턴을 통합 지원
 */
export const usePageData = (config) => {
  const {
    pageType,
    dataGenerator,
    requiresMembersData = false,
    membersDataGenerator = null,
    // 슬롯 카지노 페이지네이션 파라미터
    pagination = null
  } = config;
  
  console.log('[usePageData] 훅 실행:', { pageType, time: new Date().toISOString() });

  // 동적 유형 관리 훅 사용
  const dynamicTypesResult = useDynamicTypes();
  
  const {
    types,
    typeHierarchy,
    isLoading: typesLoading,
    error: typesError,
    isInitialized: typesInitialized,
    convertToHierarchicalData
  } = dynamicTypesResult;

  // 목업 데이터 생성 함수 제거 - 실제 DB 데이터만 사용

  // 회원 데이터는 더 이상 목업으로 생성하지 않음
  const membersData = [];

  // 쿠폰 페이지용 state
  const [couponData, setCouponData] = useState([]);
  
  // 정산 데이터를 위한 state
  const [settlementData, setSettlementData] = useState([]);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementError, setSettlementError] = useState(null);
  
  // 롤링금전환내역 데이터를 위한 state
  const [rollingHistoryData, setRollingHistoryData] = useState([]);
  const [rollingHistoryLoading, setRollingHistoryLoading] = useState(false);
  const [rollingHistoryError, setRollingHistoryError] = useState(null);
  
  // 머니처리내역 데이터를 위한 state
  const [moneyHistoryData, setMoneyHistoryData] = useState([]);
  const [moneyHistoryLoading, setMoneyHistoryLoading] = useState(false);
  const [moneyHistoryError, setMoneyHistoryError] = useState(null);
  
  // 머니이동내역 데이터를 위한 state
  const [moneyTransferData, setMoneyTransferData] = useState([]);
  const [moneyTransferLoading, setMoneyTransferLoading] = useState(false);
  const [moneyTransferError, setMoneyTransferError] = useState(null);
  
  // 회원 데이터를 위한 state
  const [membersApiData, setMembersApiData] = useState([]);
  const [membersApiLoading, setMembersApiLoading] = useState(false);
  const [membersApiError, setMembersApiError] = useState(null);
  
  // 베팅내역 데이터를 위한 state
  const [bettingData, setBettingData] = useState([]);
  const [bettingLoading, setBettingLoading] = useState(false);
  const [bettingError, setBettingError] = useState(null);
  const [bettingTotalCount, setBettingTotalCount] = useState(0);
  
  // 일자별정산 데이터를 위한 state
  const [dailySettlementData, setDailySettlementData] = useState([]);
  const [dailySettlementLoading, setDailySettlementLoading] = useState(false);
  const [dailySettlementError, setDailySettlementError] = useState(null);
  
  // 게임사별정산 데이터를 위한 state
  const [thirdPartySettlementData, setThirdPartySettlementData] = useState([]);
  const [thirdPartySettlementLoading, setThirdPartySettlementLoading] = useState(false);
  const [thirdPartySettlementError, setThirdPartySettlementError] = useState(null);
  
  // 정산 데이터 로드 (settlement 페이지인 경우)
  useEffect(() => {
    const typesReady = typesInitialized || Object.keys(types || {}).length > 0;
    if (pageType === 'settlement' && typesReady) {
      const loadSettlementData = async () => {
        setSettlementLoading(true);
        setSettlementError(null);
        try {
          const response = await apiService.settlement.getTodaySettlement();
          if (response.data.success) {
            // 정산 데이터도 parentId로 변환 (회원관리와 동일하게)
            const transformedData = response.data.data.map(item => ({
              ...item,
              parentId: item.parent_id // parent_id를 parentId로 매핑
            }));
            setSettlementData(transformedData);
          } else {
            throw new Error(response.data.error || '정산 데이터 로드 실패');
          }
        } catch (error) {
          setSettlementError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setSettlementData([]);
        } finally {
          setSettlementLoading(false);
        }
      };
      loadSettlementData();
    }
  }, [pageType, typesInitialized, types]);
  
  // 롤링금전환내역 데이터 로드
  useEffect(() => {
    if (pageType === 'rollingHistory' && typesInitialized) {
      const loadRollingHistoryData = async () => {
        setRollingHistoryLoading(true);
        setRollingHistoryError(null);
        try {
          const response = await apiService.rollingHistory.getAll({
            page: 0,
            rowsPerPage: 1000, // 초기 로드 시 충분한 데이터 가져오기
          });
          if (response.data.success) {
            setRollingHistoryData(response.data.data);
          } else {
            throw new Error(response.data.error || '롤링금전환내역 데이터 로드 실패');
          }
        } catch (error) {
          setRollingHistoryError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setRollingHistoryData([]);
        } finally {
          setRollingHistoryLoading(false);
        }
      };
      loadRollingHistoryData();
    }
  }, [pageType, typesInitialized]);
  
  // 충환내역 데이터 로드
  useEffect(() => {
    if (pageType === 'history' && typesInitialized) {
      const loadTransactionHistoryData = async () => {
        setMoneyHistoryLoading(true);
        setMoneyHistoryError(null);
        try {
          const response = await apiService.moneyHistory.getAll({
            page: 0,
            rowsPerPage: 1000,
            // type 필터 제거 - 모든 내역 표시
            format: 'transactionHistory' // 충환내역 형식으로 요청
          });
          if (response.data.success) {
            // API에서 이미 충환내역 형식으로 포맷팅된 데이터를 받음
            setMoneyHistoryData(response.data.data);
          } else {
            throw new Error(response.data.error || '충환내역 데이터 로드 실패');
          }
        } catch (error) {
          setMoneyHistoryError(error.message);
          setMoneyHistoryData([]);
        } finally {
          setMoneyHistoryLoading(false);
        }
      };
      loadTransactionHistoryData();
    }
  }, [pageType, typesInitialized]);
  
  // 머니처리내역 데이터 로드
  useEffect(() => {
    if (pageType === 'moneyHistory' && typesInitialized) {
      const loadMoneyHistoryData = async () => {
        setMoneyHistoryLoading(true);
        setMoneyHistoryError(null);
        try {
          const response = await apiService.moneyHistory.getAll({
            page: 0,
            rowsPerPage: 1000, // 초기 로드 시 충분한 데이터 가져오기
            type: 'bonus,adjustment' // 지급/회수만 필터링
          });
          if (response.data.success) {
            setMoneyHistoryData(response.data.data);
          } else {
            throw new Error(response.data.error || '머니처리내역 데이터 로드 실패');
          }
        } catch (error) {
          setMoneyHistoryError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setMoneyHistoryData([]);
        } finally {
          setMoneyHistoryLoading(false);
        }
      };
      loadMoneyHistoryData();
    }
  }, [pageType, typesInitialized]);
  
  // 머니이동내역 데이터 로드
  useEffect(() => {
    if (pageType === 'moneyTransfer' && typesInitialized) {
      const loadMoneyTransferData = async () => {
        setMoneyTransferLoading(true);
        setMoneyTransferError(null);
        try {
          const response = await apiService.moneyTransfer.getAll({
            page: 0,
            rowsPerPage: 1000, // 초기 로드 시 충분한 데이터 가져오기
          });
          if (response.data.success) {
            setMoneyTransferData(response.data.data);
          } else {
            throw new Error(response.data.error || '머니이동내역 데이터 로드 실패');
          }
        } catch (error) {
          setMoneyTransferError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setMoneyTransferData([]);
        } finally {
          setMoneyTransferLoading(false);
        }
      };
      loadMoneyTransferData();
    }
  }, [pageType, typesInitialized]);
  
  // 베팅내역 데이터 로드 - 클라이언트 사이드 페이지네이션으로 변경
  useEffect(() => {
    if (pageType === 'slotCasino') {
      const loadBettingData = async () => {
        setBettingLoading(true);
        setBettingError(null);
        try {
          console.log('[usePageData] 슬롯카지노 전체 데이터 로드 시작');
          const response = await apiService.betting.getSlotCasino({
            gameType: 'all', // 슬롯과 카지노 모두
            page: 0,
            rowsPerPage: 1000, // 충분한 양의 데이터를 한 번에 로드
          });
          if (response.data.success) {
            console.log('[usePageData] 베팅 데이터 로드 성공:', {
              dataCount: response.data.data.length,
              totalCount: response.data.totalCount
            });
            setBettingData(response.data.data);
            setBettingTotalCount(response.data.totalCount || response.data.data.length);
          } else {
            throw new Error(response.data.error || '베팅내역 데이터 로드 실패');
          }
        } catch (error) {
          setBettingError(error.message);
          console.error('[usePageData] 베팅내역 데이터 로드 실패:', error);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setBettingData([]);
          setBettingTotalCount(0);
        } finally {
          setBettingLoading(false);
        }
      };
      loadBettingData();
    }
  }, [pageType]); // pagination 의존성 제거
  
  // 일자별정산 데이터 로드
  useEffect(() => {
    if (pageType === 'dailySettlement') {
      const loadDailySettlementData = async () => {
        setDailySettlementLoading(true);
        setDailySettlementError(null);
        try {
          const response = await apiService.settlement.getDailySettlement();
          if (response.data.success) {
            setDailySettlementData(response.data.data);
          } else {
            throw new Error(response.data.error || '일자별정산 데이터 로드 실패');
          }
        } catch (error) {
          setDailySettlementError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setDailySettlementData([]);
        } finally {
          setDailySettlementLoading(false);
        }
      };
      loadDailySettlementData();
    }
  }, [pageType]);
  
  // 게임사별정산 데이터 로드
  useEffect(() => {
    if (pageType === 'thirdPartySettlement') {
      const loadThirdPartySettlementData = async () => {
        setThirdPartySettlementLoading(true);
        setThirdPartySettlementError(null);
        try {
          const response = await apiService.settlement.getThirdPartySettlement();
          if (response.data.success) {
            setThirdPartySettlementData(response.data.data);
          } else {
            throw new Error(response.data.error || '게임사별정산 데이터 로드 실패');
          }
        } catch (error) {
          setThirdPartySettlementError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setThirdPartySettlementData([]);
        } finally {
          setThirdPartySettlementLoading(false);
        }
      };
      loadThirdPartySettlementData();
    }
  }, [pageType]);
  
  // 회원 데이터 로드 
  
  
  useEffect(() => {
    // 회원 페이지인 경우에만 로드
    if (pageType === 'members') {
      const loadMembersData = async () => {
        console.log('회원 데이터 로드 시작');
        setMembersApiLoading(true);
        setMembersApiError(null);
        try {
          const response = await apiService.members.getAll();
          console.log('API 응답:', response);
          if (response.data) {
            // API 응답 데이터를 프론트엔드 형식으로 변환
            const membersData = response.data.data || response.data;
            console.log('변환 전 데이터 개수:', membersData.length);
            const transformedData = membersData.map(member => {
              // parentTypes는 서버에서 이미 처리되어 옴
              let parentTypes = member.parentTypes || [];
              
              // type 객체 생성 - agent_levels 테이블 데이터 사용
              const type = {
                id: member.agent_level_id,
                label: member.agent_level_label || member.agent_level_name || '미지정',
                backgroundColor: member.agent_level_bg_color || '#e0e0e0',
                borderColor: member.agent_level_border_color || '#757575',
                color: 'default',
                order: member.level_order || member.agent_level_order || 999
              };
              
              return {
                ...member,
                userId: member.nickname ? `${member.username}\n${member.nickname}` : member.username,
                type,
                parentId: member.parentId,
                parentTypes: parentTypes,
                levelOrder: member.level_order || member.agent_level_order || type.order || 999
              };
            });
            
            console.log('변환 후 데이터 개수:', transformedData.length);
            setMembersApiData(transformedData);
          }
        } catch (error) {
          console.error('회원 데이터 로드 에러:', error);
          setMembersApiError(error.message);
          // 목업 데이터 사용하지 않음 - 실제 DB 데이터만 사용
          setMembersApiData([]);
        } finally {
          setMembersApiLoading(false);
        }
      };
      loadMembersData();
    }
  }, [pageType]); // 의존성 단순화 - pageType만 체크

  // 최종 테이블 데이터 - 목업 데이터 생성 없이 API 데이터만 사용
  const data = useMemo(() => {
    
    // 회원 페이지
    if (pageType === 'members') {
      console.log('data memo - membersApiData:', membersApiData.length);
      return membersApiData;
    }
    
    // 쿠폰 관련 페이지
    if (pageType === 'couponCreate' || pageType === 'couponHistory') {
      return couponData;
    }

    // 정산 페이지의 경우 API 데이터 사용
    if (pageType === 'settlement') {
      return settlementData;
    }
    
    // 롤링금전환내역 페이지의 경우 API 데이터 사용
    if (pageType === 'rollingHistory') {
      return rollingHistoryData;
    }
    
    // 머니처리내역 페이지의 경우 API 데이터 사용
    if (pageType === 'moneyHistory') {
      return moneyHistoryData;
    }
    
    // 충환내역 페이지의 경우도 moneyHistoryData 사용 (필터링된 데이터)
    if (pageType === 'history') {
      return moneyHistoryData;
    }
    
    // 머니이동내역 페이지의 경우 API 데이터 사용
    if (pageType === 'moneyTransfer') {
      return moneyTransferData;
    }
    
    // 베팅내역 페이지의 경우 API 데이터 사용
    if (pageType === 'slotCasino') {
      console.log('[usePageData] data memo - bettingData:', bettingData.length);
      return bettingData;
    }
    
    // 일자별정산 페이지의 경우 API 데이터 사용
    if (pageType === 'dailySettlement') {
      return dailySettlementData;
    }
    
    // 게임사별정산 페이지의 경우 API 데이터 사용
    if (pageType === 'thirdPartySettlement') {
      return thirdPartySettlementData;
    }

    // 기타 페이지는 빈 배열 반환
    return [];
  }, [pageType, membersApiData, couponData, settlementData, rollingHistoryData, moneyHistoryData, moneyTransferData, bettingData, dailySettlementData, thirdPartySettlementData]);

  // 데이터 새로고침 함수
  const refreshPageData = useCallback(async () => {
    if (pageType === 'members' && typesInitialized) {
      const loadMembersData = async () => {
        setMembersApiLoading(true);
        setMembersApiError(null);
        try {
          const response = await apiService.members.getAll();
          if (response.data) {
            const membersData = response.data.data || response.data;
            const transformedData = membersData.map(member => {
              let parentTypes = member.parentTypes || [];
              
              const type = {
                id: member.agent_level_id,
                label: member.type?.label || member.agent_level_name || member.level_name || '미지정',
                backgroundColor: member.type?.backgroundColor || member.background_color || '#e0e0e0',
                borderColor: member.type?.borderColor || member.border_color || '#757575',
                color: member.type?.color || 'default',
                order: member.level_order || member.agent_level_order || 999
              };
              
              return {
                ...member,
                userId: member.nickname ? `${member.username}\n${member.nickname}` : member.username,
                type,
                parentId: member.parentId,
                parentTypes: parentTypes,
                levelOrder: member.level_order || member.agent_level_order || type.order || 999
              };
            });
            
            setMembersApiData(transformedData);
          }
        } catch (error) {
          setMembersApiError(error.message);
          setMembersApiData([]);
        } finally {
          setMembersApiLoading(false);
        }
      };
      loadMembersData();
    } else if (pageType === 'settlement' && typesInitialized) {
      // 정산 데이터 새로고침
      setSettlementLoading(true);
      setSettlementError(null);
      try {
        const response = await apiService.settlement.getTodaySettlement();
        if (response.data.success) {
          // 정산 데이터도 parentId로 변환 (회원관리와 동일하게)
          const transformedData = response.data.data.map(item => ({
            ...item,
            parentId: item.parent_id // parent_id를 parentId로 매핑
          }));
          setSettlementData(transformedData);
        } else {
          throw new Error(response.data.error || '정산 데이터 로드 실패');
        }
      } catch (error) {
        setSettlementError(error.message);
        setSettlementData([]);
      } finally {
        setSettlementLoading(false);
      }
    } else if (pageType === 'dailySettlement') {
      // 일자별정산 데이터 새로고침
      setDailySettlementLoading(true);
      setDailySettlementError(null);
      try {
        const response = await apiService.settlement.getDailySettlement();
        if (response.data.success) {
          setDailySettlementData(response.data.data);
        } else {
          throw new Error(response.data.error || '일자별정산 데이터 로드 실패');
        }
      } catch (error) {
        setDailySettlementError(error.message);
        setDailySettlementData([]);
      } finally {
        setDailySettlementLoading(false);
      }
    } else if (pageType === 'thirdPartySettlement') {
      // 게임사별정산 데이터 새로고침
      setThirdPartySettlementLoading(true);
      setThirdPartySettlementError(null);
      try {
        const response = await apiService.settlement.getThirdPartySettlement();
        if (response.data.success) {
          setThirdPartySettlementData(response.data.data);
        } else {
          throw new Error(response.data.error || '게임사별정산 데이터 로드 실패');
        }
      } catch (error) {
        setThirdPartySettlementError(error.message);
        setThirdPartySettlementData([]);
      } finally {
        setThirdPartySettlementLoading(false);
      }
    }
  }, [pageType, typesInitialized]); // types 의존성 제거 - types 변경 시 재로드 방지

  return {
    // 데이터
    data,
    membersData,
    setData: pageType === 'couponCreate' || pageType === 'couponHistory' ? setCouponData : undefined, // 쿠폰 페이지용 setData
    
    // 동적 유형 정보
    types,
    typeHierarchy,
    
    // 로딩 상태
    isLoading: pageType === 'members' ? membersApiLoading || typesLoading :
               pageType === 'settlement' ? settlementLoading || typesLoading : 
               pageType === 'rollingHistory' ? rollingHistoryLoading || typesLoading :
               pageType === 'moneyHistory' ? moneyHistoryLoading || typesLoading :
               pageType === 'history' ? moneyHistoryLoading || typesLoading :
               pageType === 'moneyTransfer' ? moneyTransferLoading || typesLoading :
               pageType === 'slotCasino' ? bettingLoading || typesLoading :
               pageType === 'dailySettlement' ? dailySettlementLoading || typesLoading :
               pageType === 'thirdPartySettlement' ? thirdPartySettlementLoading || typesLoading : typesLoading,
    error: pageType === 'members' ? membersApiError || typesError :
           pageType === 'settlement' ? settlementError || typesError : 
           pageType === 'rollingHistory' ? rollingHistoryError || typesError :
           pageType === 'moneyHistory' ? moneyHistoryError || typesError :
           pageType === 'history' ? moneyHistoryError || typesError :
           pageType === 'moneyTransfer' ? moneyTransferError || typesError :
           pageType === 'slotCasino' ? bettingError || typesError :
           pageType === 'dailySettlement' ? dailySettlementError || typesError :
           pageType === 'thirdPartySettlement' ? thirdPartySettlementError || typesError : typesError,
    isInitialized: typesInitialized,
    
    // 슬롯 카지노 페이지네이션 정보
    totalCount: pageType === 'slotCasino' ? bettingTotalCount : (data?.length || 0),
    
    // 유틸리티
    convertToHierarchicalData,
    refreshPageData
  };
};

export default usePageData; 