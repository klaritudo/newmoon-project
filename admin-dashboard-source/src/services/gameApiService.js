import axios from 'axios';
import apiService from './api';

// Honor API 설정
const HONOR_API_CONFIG = {
  BASE_URL: 'https://api.honorlink.org/api',
  AGENT_CODE: import.meta.env.VITE_HONOR_AGENT_CODE || '',
  AGENT_TOKEN: import.meta.env.VITE_HONOR_AGENT_TOKEN || '',
  CALLBACK_URL: import.meta.env.VITE_HONOR_CALLBACK_URL || 'https://your-domain.com/api/honor'
};

// Honor API axios 인스턴스
const honorApi = axios.create({
  baseURL: HONOR_API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30초 타임아웃
});

// Honor API 요청 인터셉터 - 인증 헤더 추가
honorApi.interceptors.request.use(
  (config) => {
    // API Token만 사용하는 경우
    if (HONOR_API_CONFIG.AGENT_TOKEN) {
      config.headers['Authorization'] = `Bearer ${HONOR_API_CONFIG.AGENT_TOKEN}`;
    }
    
    // agent-code가 있는 경우 추가
    if (HONOR_API_CONFIG.AGENT_CODE) {
      config.headers['agent-code'] = HONOR_API_CONFIG.AGENT_CODE;
      config.headers['agent-token'] = HONOR_API_CONFIG.AGENT_TOKEN;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Honor API 응답 인터셉터
honorApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 게임 API 타입 정의
const API_TYPES = {
  TRANSFER: 'transfer'
};

// 게임 타입별 API 설정
const GAME_API_CONFIG = {
  SLOT: {
    type: API_TYPES.TRANSFER,
    vendors: ['pragmatic', 'habanero'], // PragmaticPlay, Habanero 등
  },
  CASINO: {
    type: API_TYPES.TRANSFER, // Transfer API로 변경
    vendors: ['evolution', 'ag', 'mg'], // Evolution, Asia Gaming, Micro Gaming 등
  }
};

class GameApiService {
  constructor() {
    this.providers = {};
  }

  // === Honor Transfer API 구현 (슬롯용) ===
  
  // 유저 생성 (더 이상 사용하지 않음 - game-launch-link로 자동 등록)
  async createUser(username) {
    return { success: true, message: 'Auto-registration through game-launch-link' };
  }

  // 유저 정보 조회
  async getUser(username) {
    try {
      const response = await honorApi.get('/user', {
        params: { username: username }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 잔액 추가 (입금)
  async addBalance(username, amount) {
    try {
      const response = await honorApi.post('/user/add-balance', null, {
        params: {
          username: username,
          amount: amount
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 잔액 전체 회수
  async subBalanceAll(username) {
    try {
      const response = await honorApi.post('/user/sub-balance-all', null, {
        params: {
          username: username
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 잔액 일부 차감
  async subBalance(username, amount) {
    try {
      const response = await honorApi.post('/user/sub-balance', null, {
        params: {
          username: username,
          amount: amount
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // === Honor Transfer API 전용 ===
  // 현재 프로젝트는 Transfer API만 사용합니다.

  // 게임 목록 조회
  async getGameList(vendor, gameType) {
    try {
      const response = await honorApi.get('/game-list', {
        params: { 
          vendor,
          // 추가 필터 파라미터 필요 시 여기에 추가
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 게임 실행 링크 생성
  async getGameLaunchLink(params) {
    try {
      const {
        vendor,
        gameCode,
        username,
        mode = 'real', // real or fun
        lang = 'ko',
        mobile = false
      } = params;

      const response = await honorApi.get('/game-launch-link', {
        params: {
          vendor,
          game_code: gameCode,
          username: username,
          nickname: username,
          mode,
          lang,
          mobile: mobile ? 1 : 0,
          return_url: `${window.location.origin}/games/return`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 트랜잭션 내역 조회
  async getTransactions(params) {
    try {
      const {
        username,
        vendor,
        startTime,
        endTime,
        page = 1,
        limit = 50
      } = params;

      const response = await honorApi.get('/transactions', {
        params: {
          username: username,
          vendor,
          start_time: startTime,
          end_time: endTime,
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // === 유틸리티 메서드 ===
  
  // 트랜잭션 ID 생성 (백엔드에서 관리하지만 프론트엔드에서도 필요 시 사용)
  generateTransactionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // API 타입 확인
  getApiType(gameType) {
    return API_TYPES.TRANSFER; // 모든 게임 타입에 Transfer API 사용
  }

  // 벤더별 게임 타입 확인
  getGameTypeByVendor(vendor) {
    if (GAME_API_CONFIG.SLOT.vendors.includes(vendor)) {
      return 'SLOT';
    } else if (GAME_API_CONFIG.CASINO.vendors.includes(vendor)) {
      return 'CASINO';
    }
    return null;
  }

  // === 통합 게임 실행 메서드 ===
  async launchGame(params) {
    const { vendor, gameCode, userId, username, mode = 'real' } = params;
    const gameType = this.getGameTypeByVendor(vendor);
    
    if (!gameType) {
      throw new Error(`지원하지 않는 벤더입니다: ${vendor}`);
    }

    try {
      // Honor API는 game-launch-link 호출 시 자동으로 회원을 등록합니다
      // 별도의 회원 생성 과정이 필요없습니다
      
      // 게임 실행 링크 가져오기 (자동 회원 등록)
      const launchData = await this.getGameLaunchLink({
        vendor,
        gameCode,
        username,
        mode,
        lang: 'ko',
        mobile: this.isMobileDevice()
      });

      return {
        success: true,
        gameUrl: launchData.launch_url,
        gameType,
        vendor
      };
    } catch (error) {
      throw error;
    }
  }

  // 모바일 기기 체크
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Honor API 밸런스 조회 (에이전트 전체 잔액)
  async getAgentBalance() {
    try {
      const response = await honorApi.get('/my-info');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const gameApiService = new GameApiService();

export default gameApiService;
export { API_TYPES, GAME_API_CONFIG };