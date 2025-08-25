import apiService from './api';
import gameApiService from './gameApiService';
import { store } from '../app/store';

class ApiBalanceService {
  constructor() {
    this.balance = 0;
    this.listeners = [];
    this.updateInterval = null;
    this.fetchCount = 0;
    this.lastFetchTime = 0;
  }

  // 리스너 추가
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // 리스너에게 알림
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.balance));
  }

  // API 잔액 조회
  async fetchBalance() {
    try {
      // 무한 루프 방지를 위한 체크
      const now = Date.now();
      if (now - this.lastFetchTime < 1000) {
        this.fetchCount++;
        if (this.fetchCount > 5) {
          console.error('⚠️ API 잔액 조회 무한 루프 감지! 중단합니다.');
          return this.balance;
        }
      } else {
        this.fetchCount = 0;
      }
      this.lastFetchTime = now;
      
      // 사용자 정보 가져오기
      const state = store.getState();
      const user = state.auth?.user;
      
      console.log('🔍 API Balance Service - User Info:', {
        username: user?.username,
        agent_level_id: user?.agent_level_id,
        user_exists: !!user
      });
      
      // 사용자가 없는 경우만 스킵
      if (!user) {
        console.log('🚫 사용자 없음 - API 잔액 조회 스킵');
        this.balance = 0;
        this.notifyListeners();
        return this.balance;
      }
      
      // 1단계와 마스터(999)는 총 API 잔액 조회
      console.log('✅ API 잔액 조회 진행 - 사용자 레벨:', user.agent_level_id);
      
      // 백엔드 API를 통해 Honor API 잔액 조회
      const response = await apiService.balance.get();
      console.log('🔍 API 잔액 응답:', {
        data: response.data,
        error_type: typeof response.data.error,
        error_value: response.data.error
      });
      
      // error가 false이거나 success가 true면 성공
      if (response.data.error === false || response.data.success === true) {
        this.balance = response.data.balance || 0;
        this.notifyListeners();
        console.log('✅ 잔액 업데이트 성공:', this.balance);
        return this.balance;
      } else {
        console.error('❌ API 잔액 조회 실패:', {
          error: response.data.error,
          msg: response.data.msg,
          full_response: response.data
        });
        this.balance = response.data.balance || 0;
        this.notifyListeners();
        return this.balance;
      }
    } catch (error) {
      // console.error('❌ API 잔액 조회 에러:', error);
      // console.error('- 에러 상세:', error.response?.data);
      // 에러 시에도 0으로 표시
      this.balance = 0;
      this.notifyListeners();
      return this.balance;
    }
  }

  // 주기적 업데이트 시작
  startPolling(interval = 30000) { // 30초마다
    // 이미 polling이 실행 중이면 중복 실행 방지
    if (this.updateInterval) {
      console.log('⚠️ Polling already running, skipping duplicate start');
      return;
    }
    
    this.fetchBalance(); // 초기 로드
    this.updateInterval = setInterval(() => {
      this.fetchBalance();
    }, interval);
  }

  // 주기적 업데이트 중지
  stopPolling() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // 현재 잔액 가져오기
  getBalance() {
    return this.balance;
  }

  // 금액 포맷팅
  formatBalance(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

// 싱글톤 인스턴스
const apiBalanceService = new ApiBalanceService();

export default apiBalanceService;