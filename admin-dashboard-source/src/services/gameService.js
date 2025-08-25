import apiService from './api';

/**
 * 게임 관리 서비스
 * 
 * 이 서비스는 게임 설정, 벤더 관리, 게임 리스트 등
 * 게임 관련 API 호출을 처리합니다.
 */
class GameService {
  /**
   * 게임 목록 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} 게임 목록
   */
  async getGames(params = {}) {
    try {
      const response = await apiService.games.getAll(params);
      return response.data;
    } catch (error) {
      // console.error('게임 목록 조회 실패:', error);
      // API 실패 시 목업 데이터 반환
      if (error.code === 'ERR_NETWORK') {
        return this.getMockGames(params);
      }
      throw error;
    }
  }

  /**
   * 게임 벤더 목록 조회
   * @param {string} gameType - 게임 타입 (slot, casino)
   * @returns {Promise<Object>} 벤더 목록
   */
  async getVendors(gameType) {
    try {
      const response = await apiService.games.getVendors({ game_type: gameType });
      return response.data;
    } catch (error) {
      // console.error('벤더 목록 조회 실패:', error);
      // API 실패 시 목업 데이터 반환
      if (error.code === 'ERR_NETWORK') {
        return this.getMockVendors(gameType);
      }
      throw error;
    }
  }

  /**
   * 게임 동기화
   * @param {string} vendor - 벤더 코드
   * @param {string} gameType - 게임 타입
   * @returns {Promise<Object>} 동기화 결과
   */
  async syncGames(vendor, gameType) {
    try {
      const response = await apiService.games.sync({ vendor, game_type: gameType });
      return response.data;
    } catch (error) {
      // console.error('게임 동기화 실패:', error);
      // console.error('에러 응답:', error.response?.data);
      
      // 에러 메시지 개선
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const errorMessage = `동기화 실패: ${details.message || '알 수 없는 오류'}`;
        
        if (!details.apiConfigured) {
          throw new Error('Honor API 토큰이 설정되지 않았습니다. 관리자에게 문의하세요.');
        }
        
        throw new Error(errorMessage);
      }
      
      // API 실패 시 목업 응답 반환
      if (error.code === 'ERR_NETWORK') {
        return {
          success: true,
          message: '[테스트] 게임 동기화가 완료되었습니다.',
          synced_count: Math.floor(Math.random() * 100) + 50
        };
      }
      throw error;
    }
  }


  /**
   * 게임 설정 업데이트
   * @param {string} gameId - 게임 ID
   * @param {Object} settings - 업데이트할 설정
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateGameSettings(gameId, settings) {
    try {
      // console.log('게임 설정 업데이트 요청:', { gameId, settings });
      const response = await apiService.games.update(gameId, settings);
      // console.log('게임 설정 업데이트 응답:', response.data);
      return response.data;
    } catch (error) {
      // console.error('게임 설정 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 벤더별 게임 수 가져오기
   * @param {string} gameType - 게임 타입
   * @returns {Promise<Object>} 벤더별 게임 수
   */
  async getVendorGameCounts(gameType) {
    try {
      const response = await apiService.get('/games/vendor-game-counts', { params: { game_type: gameType } });
      return response.data.data || {};
    } catch (error) {
      // console.error('벤더별 게임 수 조회 실패:', error);
      // 목업 데이터 반환
      const mockCounts = {
        'pragmatic': 128,
        'habanero': 95,
        'netent': 87,
        'redtiger': 72,
        'playngo': 65,
        'evolution': 45,
        'ag': 38,
        'mg': 42
      };
      return mockCounts;
    }
  }

  /**
   * 카테고리 상태 업데이트
   * @param {string} categoryId - 카테고리 ID
   * @param {boolean} isActive - 활성화 여부
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateCategoryStatus(categoryId, isActive) {
    try {
      const response = await apiService.put(`/games/categories/${categoryId}/status`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      // console.error('카테고리 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 동기화 로그 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} 동기화 로그
   */
  async getSyncLogs(params = {}) {
    try {
      const response = await apiService.get('/games/sync-logs', { params });
      return response.data;
    } catch (error) {
      // console.error('동기화 로그 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 목업 벤더 데이터
   */
  getMockVendors(gameType) {
    const vendors = {
      slot: [
        { code: 'pragmatic', name: 'Pragmatic Play', name_ko: '프라그마틱 플레이', type: 'slot', is_active: true },
        { code: 'habanero', name: 'Habanero', name_ko: '하바네로', type: 'slot', is_active: true },
        { code: 'netent', name: 'NetEnt', name_ko: '넷엔트', type: 'slot', is_active: true },
        { code: 'redtiger', name: 'Red Tiger', name_ko: '레드타이거', type: 'slot', is_active: true },
        { code: 'playngo', name: 'Play\'n GO', name_ko: '플레이앤고', type: 'slot', is_active: true }
      ],
      casino: [
        { code: 'evolution', name: 'Evolution Gaming', name_ko: '에볼루션 게이밍', type: 'casino', is_active: true },
        { code: 'ag', name: 'Asia Gaming', name_ko: '아시아 게이밍', type: 'casino', is_active: true },
        { code: 'mg', name: 'Micro Gaming', name_ko: '마이크로 게이밍', type: 'casino', is_active: true },
        { code: 'dreamgame', name: 'Dream Gaming', name_ko: '드림 게이밍', type: 'casino', is_active: true },
        { code: 'wm', name: 'WM Live', name_ko: 'WM 라이브', type: 'casino', is_active: true }
      ]
    };
    
    return {
      success: true,
      data: vendors[gameType] || []
    };
  }

  /**
   * 태그 모드 조회
   * @param {string} gameType - 게임 타입
   * @returns {Promise<Object>} 태그 모드
   */
  async getTagMode(gameType) {
    try {
      const response = await apiService.get('/games/tag-mode', { params: { game_type: gameType } });
      return response.data;
    } catch (error) {
      console.error('태그 모드 조회 실패:', error);
      // 기본값 반환
      return { success: true, mode: 'manual' };
    }
  }

  /**
   * 게임 제공사 상태 업데이트
   * @param {string} vendorCode - 벤더 코드
   * @param {boolean} isActive - 활성화 상태
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateVendorStatus(vendorCode, isActive) {
    try {
      console.log('=== gameService.updateVendorStatus ===');
      console.log('요청 파라미터:', { vendorCode, isActive, isActiveType: typeof isActive });
      
      const response = await apiService.put(`/games/vendors/${vendorCode}/status`, {
        is_active: isActive
      });
      
      console.log('게임사 API 원본 응답:', response);
      console.log('게임사 response.data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('게임사 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 개별 게임 상태 업데이트
   * @param {number} gameId - 게임 ID
   * @param {boolean} isActive - 활성화 상태
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateGameStatus(gameId, isActive) {
    try {
      console.log('=== gameService.updateGameStatus ===');
      console.log('요청 파라미터:', { gameId, isActive, isActiveType: typeof isActive });
      
      const response = await apiService.put(`/games/${gameId}/status`, {
        is_active: isActive
      });
      
      console.log('API 원본 응답:', response);
      console.log('response.data:', response.data);
      console.log('response.data 타입:', typeof response.data);
      console.log('response.data.success:', response.data?.success);
      
      // API 응답이 response.data 형태인지 확인
      if (response.data) {
        return response.data;
      }
      
      // 혹시 response 자체가 데이터인 경우
      return response;
    } catch (error) {
      console.error('게임 상태 업데이트 실패:', error);
      console.error('에러 응답 데이터:', error.response?.data);
      throw error;
    }
  }

  /**
   * 태그 모드 설정
   * @param {string} gameType - 게임 타입
   * @param {string} mode - 모드 (manual/auto)
   * @returns {Promise<Object>} 설정 결과
   */
  async setTagMode(gameType, mode) {
    try {
      const response = await apiService.post('/games/tag-mode', { game_type: gameType, mode });
      return response.data;
    } catch (error) {
      console.error('태그 모드 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 태그 해제
   * @param {string} gameType - 게임 타입
   * @returns {Promise<Object>} 해제 결과
   */
  async clearAllTags(gameType) {
    try {
      const response = await apiService.post('/games/clear-all-tags', { game_type: gameType });
      return response.data;
    } catch (error) {
      console.error('태그 해제 실패:', error);
      throw error;
    }
  }

  /**
   * 게임사 순서 업데이트
   * @param {Array} providers - 순서가 변경된 게임사 목록
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateProviderOrder(providers) {
    try {
      const response = await apiService.put('/games/providers/order', { providers });
      return response.data;
    } catch (error) {
      console.error('게임사 순서 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 목업 게임 데이터
   */
  getMockGames(params) {
    const games = [];
    const vendors = params.game_type === 'slot' 
      ? ['pragmatic', 'habanero', 'netent', 'redtiger', 'playngo']
      : ['evolution', 'ag', 'mg', 'dreamgame', 'wm'];
    
    vendors.forEach(vendor => {
      for (let i = 1; i <= 20; i++) {
        games.push({
          id: `${vendor}_${i}`,
          vendor: vendor,
          game_code: `${vendor}_game_${i}`,
          game_name: `${vendor.toUpperCase()} Game ${i}`,
          game_name_ko: `${vendor} 게임 ${i}`,
          game_type: params.game_type || 'slot',
          thumbnail_url: `/images/games/${vendor}_${i}.jpg`,
          is_active: true,
          is_featured: Math.random() > 0.8,
          is_hot: Math.random() > 0.7,
          is_new: Math.random() > 0.9,
          rtp: (Math.random() * 5 + 94).toFixed(2),
          min_bet: 100,
          max_bet: 1000000
        });
      }
    });
    
    return {
      success: true,
      data: games,
      count: games.length
    };
  }
}

const gameService = new GameService();
export default gameService;