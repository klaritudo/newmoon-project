import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { updateMemberBalance } from '../features/members/membersSlice';

/**
 * 자동 잔액 새로고침 Hook
 * @param {number} userId - 사용자 ID
 * @param {number} interval - 새로고침 간격 (밀리초)
 * @param {boolean} enabled - 자동 새로고침 활성화 여부
 */
export const useBalanceRefresh = (userId, interval = 30000, enabled = true) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const lastBalanceRef = useRef(null);

  // 잔액 새로고침 함수
  const refreshBalance = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await apiService.post('/admin/refresh-balance/' + userId);
      
      if (!response.data.error && response.data.newBalance !== undefined) {
        const newBalance = response.data.newBalance;
        
        // 잔액이 변경된 경우에만 업데이트
        if (lastBalanceRef.current !== newBalance) {
          lastBalanceRef.current = newBalance;
          
          // Redux 상태 업데이트
          dispatch(updateMemberBalance({
            userId,
            balance: newBalance
          }));
          
          // 변경 알림 (옵션) - 콘솔 로그 제거
        }
      }
    } catch (error) {
      // API 호출 제한 에러는 무시
      if (error.response?.status !== 429) {
        console.error('잔액 새로고침 실패:', error);
      }
    }
  }, [userId, dispatch]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (!enabled || !userId) return;

    // 즉시 한 번 실행
    refreshBalance();

    // 주기적 실행
    intervalRef.current = setInterval(refreshBalance, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, userId, interval, refreshBalance]);

  // 수동 새로고침 함수 반환
  return {
    refreshBalance,
    lastBalance: lastBalanceRef.current
  };
};

/**
 * 회원 목록 잔액 일괄 새로고침 Hook
 * @param {Array} memberIds - 회원 ID 목록
 * @param {number} interval - 새로고침 간격
 * @param {boolean} enabled - 활성화 여부
 */
export const useBulkBalanceRefresh = (memberIds = [], interval = 30000, enabled = true) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const refreshAllBalances = useCallback(async () => {
    if (!memberIds.length) return;

    // 병렬로 처리하되, API 제한을 고려하여 청크로 나눔
    const chunkSize = 5;
    for (let i = 0; i < memberIds.length; i += chunkSize) {
      const chunk = memberIds.slice(i, i + chunkSize);
      
      await Promise.all(
        chunk.map(async (userId) => {
          try {
            const response = await apiService.post('/admin/refresh-balance/' + userId);
            
            if (!response.data.error && response.data.newBalance !== undefined) {
              dispatch(updateMemberBalance({
                userId,
                balance: response.data.newBalance
              }));
            }
          } catch (error) {
            // 개별 실패는 무시
          }
        })
      );
      
      // API 제한 방지를 위한 딜레이
      if (i + chunkSize < memberIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, [memberIds, dispatch]);

  useEffect(() => {
    if (!enabled || !memberIds.length) return;

    // 주기적 실행
    intervalRef.current = setInterval(refreshAllBalances, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, memberIds, interval, refreshAllBalances]);

  return { refreshAllBalances };
};