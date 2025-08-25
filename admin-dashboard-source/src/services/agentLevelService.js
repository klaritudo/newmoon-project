import socketService from './socketService';

class AgentLevelService {
  constructor() {
    this.agentLevels = [];
    this.types = {};
    this.typeHierarchy = {};
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // 초기화
  async initialize() {
    if (this.isInitialized) return;

    try {
      // console.log('=== AgentLevelService 초기화 시작 (Socket 전용) ===');
      
      // Socket.IO 연결 및 연결 완료 대기
      await this.waitForSocketConnection();
      socketService.joinRoom('table-updates');

      // 실시간 업데이트 리스너 등록
      this.setupSocketListeners();

      // 초기 데이터 요청 (Socket을 통해)
      this.requestInitialData();
      
      this.isInitialized = true;
      // console.log('=== AgentLevelService 초기화 완료 (Socket 전용) ===');
    } catch (error) {
      console.error('=== AgentLevelService 초기화 실패 ===', error);
      throw error;
    }
  }

  // Socket 연결 완료까지 대기
  async waitForSocketConnection() {
    try {
      // console.log('Socket 연결 시도 중...');
      const socket = await socketService.connect();
      // console.log('Socket 연결 완료:', socket.id);
      return socket;
    } catch (error) {
      console.error('Socket 연결 실패:', error);
      throw new Error(`Socket 연결 실패: ${error.message}`);
    }
  }

  // Socket.IO 리스너 설정
  setupSocketListeners() {
    // console.log('🟢 AgentLevelService: Socket 리스너 설정 시작');
    
    // 에이전트 레벨 업데이트 이벤트
    socketService.on('agent-levels-updated', (data) => {
      // console.log('🟢 AgentLevelService: agent-levels-updated 이벤트 수신!', data);
      
      switch (data.action || data.type) {
        case 'added':
          this.handleAgentLevelAdded(data.data);
          break;
        case 'updated':
          this.handleAgentLevelUpdated(data.data);
          break;
        case 'deleted':
          this.handleAgentLevelDeleted(data.id);
          break;
        case 'hierarchy-changed':
          // 계층 순서 변경 시 전체 데이터 다시 로드
          // console.log('🔄 AgentLevelService: hierarchy-changed 이벤트 수신');
          // console.log('📊 hierarchy-changed 데이터:', data);
          // console.log('🔔 현재 agentLevels 개수:', this.agentLevels.length);
          // console.log('🔔 현재 types 개수:', Object.keys(this.types).length);
          // console.log('🔔 현재 리스너 개수:', this.listeners.size);
          
          // 전체 데이터 다시 요청
          this.requestInitialData();
          
          // notifyListeners를 바로 호출하여 즉시 알림
          // console.log('📢 hierarchy-changed 리스너들에게 즉시 알림');
          setTimeout(() => {
            this.notifyListeners('hierarchy-changed', data);
          }, 100);
          break;
        default:
          // 전체 데이터 다시 요청
          this.requestInitialData();
      }
    });

    // 초기 데이터 응답 이벤트
    socketService.on('agent-levels-data', (data) => {
      // console.log('📥 agent-levels-data 이벤트 수신:', data);
      
      if (data.success && Array.isArray(data.data)) {
        // console.log('✅ 유효한 데이터 수신, 처리 시작...');
        this.agentLevels = data.data;
        // console.log('📊 저장된 agentLevels:', this.agentLevels);
        // console.log('📊 agentLevels 개수:', this.agentLevels.length);
        
        this.updateTypesAndHierarchy();
        
        // console.log('📊 처리 후 types:', this.types);
        // console.log('📊 처리 후 types 개수:', Object.keys(this.types).length);
        
        this.notifyListeners('loaded', this.agentLevels);
        
        // console.log('✅ Socket을 통한 데이터 로드 및 처리 완료');
      } else {
        console.error('❌ Socket을 통한 데이터 로드 실패:', data);
      }
    });
  }

  // 에이전트 레벨 추가 처리
  handleAgentLevelAdded(newLevel) {
    this.agentLevels.push(newLevel);
    this.updateTypesAndHierarchy();
    this.notifyListeners('added', newLevel);
  }

  // 에이전트 레벨 업데이트 처리
  handleAgentLevelUpdated(updatedLevel) {
    const index = this.agentLevels.findIndex(level => level.id === updatedLevel.id);
    if (index !== -1) {
      this.agentLevels[index] = updatedLevel;
      this.updateTypesAndHierarchy();
      this.notifyListeners('updated', updatedLevel);
    }
  }

  // 에이전트 레벨 삭제 처리
  handleAgentLevelDeleted(deletedId) {
    this.agentLevels = this.agentLevels.filter(level => level.id !== deletedId);
    this.updateTypesAndHierarchy();
    this.notifyListeners('deleted', { id: deletedId });
  }

  // 리스너에게 변경 사항 알림 (비동기 처리로 성능 최적화)
  notifyListeners(type, data) {
    // console.log(`📨 notifyListeners 호출: type='${type}', 리스너 수=${this.listeners.size}`);
    
    // 무거운 작업을 다음 이벤트 루프로 지연시켜 UI 블로킹 방지
    setTimeout(() => {
      let listenerIndex = 0;
      this.listeners.forEach((callback) => {
        try {
          // console.log(`🔔 리스너 #${listenerIndex} 호출 시작`);
          callback({ type, data, types: this.types, typeHierarchy: this.typeHierarchy });
          // console.log(`✅ 리스너 #${listenerIndex} 호출 성공`);
          listenerIndex++;
        } catch (error) {
          console.error(`❌ 리스너 #${listenerIndex} 호출 중 오류:`, error);
        }
      });
      // console.log(`🎯 notifyListeners 완료: 총 ${listenerIndex}개 리스너 처리`);
    }, 0);
  }

  // Socket을 통한 초기 데이터 요청
  requestInitialData() {
    // console.log('🔔 Socket을 통한 초기 데이터 요청 시작');
    // console.log('📡 Socket 연결 상태:', socketService.getConnectionStatus());
    socketService.emit('request-agent-levels');
    // console.log('📤 request-agent-levels 이벤트 전송 완료');
  }

  // types와 typeHierarchy 업데이트 (성능 최적화)
  updateTypesAndHierarchy() {
    // console.log('=== updateTypesAndHierarchy 시작 ===');
    // console.log('현재 agentLevels:', this.agentLevels);
    
    // 데이터가 없으면 빠르게 리턴
    if (!this.agentLevels || this.agentLevels.length === 0) {
      this.types = {};
      this.typeHierarchy = {};
      return;
    }
    
    // 기존 데이터 초기화
    this.types = {};
    this.typeHierarchy = {};

    // 계층 순서대로 정렬 (성능 최적화: 이미 정렬된 경우 스킵)
    const sortedLevels = [...this.agentLevels].sort((a, b) => (a.level || 999) - (b.level || 999));
    // console.log('정렬된 레벨:', sortedLevels.map(l => ({ id: l.id, name: l.name, level: l.level })));

    // types 객체 생성
    sortedLevels.forEach(level => {
      const typeId = this.generateTypeId(level);
      
      this.types[typeId] = {
        id: level.id,
        label: level.name || level.levelType, // name 필드 사용
        color: this.getColorFromBackground(level.background_color || level.backgroundColor),
        backgroundColor: level.background_color || level.backgroundColor,
        borderColor: level.border_color || level.borderColor,
        permissions: level.permission || level.permissions,
        hierarchyOrder: level.hierarchyOrder,
        order: level.level || level.hierarchyOrder // level 필드 추가
      };
    });

    // typeHierarchy 객체 생성
    sortedLevels.forEach((level, index) => {
      const typeId = this.generateTypeId(level);
      const nextLevel = sortedLevels[index + 1];
      
      if (nextLevel) {
        const nextTypeId = this.generateTypeId(nextLevel);
        this.typeHierarchy[typeId] = [nextTypeId];
        // console.log(`계층 설정: ${typeId} -> [${nextTypeId}]`);
      } else {
        this.typeHierarchy[typeId] = [];
        // console.log(`계층 설정: ${typeId} -> [] (최하위)`);
      }
    });

    // console.log('=== 최종 결과 ===');
    // console.log('업데이트된 types:', this.types);
    // console.log('업데이트된 typeHierarchy:', this.typeHierarchy);
    // console.log('types 키 개수:', Object.keys(this.types).length);
    // console.log('typeHierarchy 키 개수:', Object.keys(this.typeHierarchy).length);
  }

  // 유형 ID 생성 (에이전트 레벨 ID를 기반으로)
  generateTypeId(level) {
    // 에이전트 레벨의 ID를 직접 사용하여 고유성 보장
    const typeId = `agent_level_${level.id}`;
    // // console.log(`generateTypeId: "${level.levelType}" (ID: ${level.id}) -> "${typeId}"`);
    return typeId;
  }

  // 배경색에서 Material-UI 색상 추출
  getColorFromBackground(backgroundColor) {
    if (!backgroundColor) return 'default';
    
    const colorMap = {
      '#f44336': 'error',
      '#e91e63': 'secondary', 
      '#9c27b0': 'secondary',
      '#673ab7': 'secondary',
      '#3f51b5': 'primary',
      '#2196f3': 'info',
      '#03a9f4': 'info',
      '#00bcd4': 'info',
      '#009688': 'success',
      '#4caf50': 'success',
      '#8bc34a': 'success',
      '#cddc39': 'warning',
      '#ffeb3b': 'warning',
      '#ffc107': 'warning',
      '#ff9800': 'warning',
      '#ff5722': 'error'
    };

    // 정확한 매치 찾기
    if (colorMap[backgroundColor]) {
      return colorMap[backgroundColor];
    }

    // 유사한 색상 찾기 (간단한 휴리스틱)
    if (backgroundColor.includes('red') || backgroundColor.includes('#f4') || backgroundColor.includes('#e9')) {
      return 'error';
    } else if (backgroundColor.includes('blue') || backgroundColor.includes('#21') || backgroundColor.includes('#3f')) {
      return 'primary';
    } else if (backgroundColor.includes('green') || backgroundColor.includes('#4c') || backgroundColor.includes('#00')) {
      return 'success';
    } else if (backgroundColor.includes('orange') || backgroundColor.includes('#ff')) {
      return 'warning';
    }

    return 'default';
  }

  // 현재 types 반환
  getTypes() {
    return { ...this.types };
  }

  // 현재 typeHierarchy 반환
  getTypeHierarchy() {
    return { ...this.typeHierarchy };
  }

  // 현재 agentLevels 반환
  getAgentLevels() {
    return [...this.agentLevels];
  }

  // 변경 사항 리스너 등록
  addListener(callback) {
    const id = Date.now() + Math.random();
    this.listeners.set(id, callback);
    return id;
  }

  // 리스너 제거
  removeListener(id) {
    return this.listeners.delete(id);
  }

  // 모든 리스너 제거
  removeAllListeners() {
    this.listeners.clear();
  }

  // 서비스 정리
  cleanup() {
    this.removeAllListeners();
    socketService.off('agent-levels-updated');
    socketService.off('agent-levels-data');
    this.isInitialized = false;
  }
}

// 싱글톤 인스턴스 생성
const agentLevelService = new AgentLevelService();

export default agentLevelService; 