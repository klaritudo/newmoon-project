// 시퀀스 관리 서비스 (클라이언트 측)
// 실시간 데이터의 순서와 무결성을 보장하기 위한 클라이언트 측 시퀀스 관리

class SequenceService {
  constructor() {
    this.lastSequence = 0;
    this.missedSequences = new Set();
    this.sequenceGapThreshold = 5; // 시퀀스 차이 임계값
    this.checkInterval = 5000; // 5초마다 누락 체크
    this.maxMissedSequences = 1000; // 최대 누락 시퀀스 저장 개수
    this.checkTimer = null;
    this.socketService = null;
    this.onMissingEventsCallback = null;
  }

  // 소켓 서비스 설정
  setSocketService(socketService) {
    this.socketService = socketService;
    this.startMissingCheck();
  }

  // 누락 이벤트 콜백 설정
  setOnMissingEvents(callback) {
    this.onMissingEventsCallback = callback;
  }

  // 시퀀스 업데이트 및 누락 확인
  updateSequence(sequence) {
    if (sequence <= this.lastSequence) {
      console.warn('⚠️ 중복 또는 이전 시퀀스 감지:', sequence);
      return false;
    }

    // 시퀀스 간격 확인
    const gap = sequence - this.lastSequence;
    if (gap > 1) {
      console.warn(`⚠️ 시퀀스 갭 감지: ${this.lastSequence} -> ${sequence} (${gap - 1}개 누락 가능성)`);
      
      // 너무 큰 갭인 경우 (1000개 이상) 중간 시퀀스는 무시
      if (gap > this.maxMissedSequences) {
        console.warn(`⚠️ 시퀀스 갭이 너무 큼(${gap}). 시퀀스 리셋.`);
        this.missedSequences.clear();
      } else {
        // 누락된 시퀀스 번호 추적
        for (let i = this.lastSequence + 1; i < sequence; i++) {
          // Set 크기 제한 확인
          if (this.missedSequences.size >= this.maxMissedSequences) {
            // 가장 오래된 항목 제거
            const firstItem = this.missedSequences.values().next().value;
            this.missedSequences.delete(firstItem);
          }
          this.missedSequences.add(i);
        }
      }

      // 임계값 초과 시 즉시 누락 요청
      if (gap > this.sequenceGapThreshold) {
        this.requestMissingEvents();
      }
    }

    this.lastSequence = sequence;
    
    // 서버에 시퀀스 업데이트 알림
    if (this.socketService) {
      this.socketService.emit('update-sequence', { sequence });
    }

    return true;
  }

  // 누락된 이벤트 요청
  requestMissingEvents() {
    if (!this.socketService) {
      console.error('❌ Socket service not available');
      return;
    }

    console.log(`🔄 누락된 이벤트 요청. 마지막 시퀀스: ${this.lastSequence}`);
    this.socketService.emit('request-missing-events', {
      lastSequence: this.lastSequence
    });

    // 누락된 이벤트 수신 리스너 (한 번만 등록)
    if (!this.missingEventsListenerRegistered) {
      this.socketService.on('missing-events', (data) => {
        console.log(`📥 ${data.count}개의 누락된 이벤트 수신`);
        
        if (this.onMissingEventsCallback) {
          // 시퀀스 순서로 이벤트 처리
          data.events.forEach(event => {
            // 이미 처리된 시퀀스는 건너뛰기
            if (event.sequence > this.lastSequence) {
              this.onMissingEventsCallback(event);
              this.lastSequence = event.sequence;
            }
          });
        }

        // 누락 목록 정리
        data.events.forEach(event => {
          this.missedSequences.delete(event.sequence);
        });
      });
      this.missingEventsListenerRegistered = true;
    }
  }

  // 주기적인 누락 체크 시작
  startMissingCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    this.checkTimer = setInterval(() => {
      // 누락된 시퀀스가 있는 경우
      if (this.missedSequences.size > 0) {
        console.log(`⏰ 주기적 체크: ${this.missedSequences.size}개의 누락된 시퀀스 감지`);
        this.requestMissingEvents();
      }
    }, this.checkInterval);
  }

  // 정리
  cleanup() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    
    if (this.socketService && this.missingEventsListenerRegistered) {
      this.socketService.off('missing-events');
      this.missingEventsListenerRegistered = false;
    }
  }

  // 현재 상태 조회
  getStatus() {
    return {
      lastSequence: this.lastSequence,
      missedCount: this.missedSequences.size,
      missedSequences: Array.from(this.missedSequences).sort((a, b) => a - b)
    };
  }

  // 재연결 시 상태 리셋
  resetOnReconnect() {
    console.log('🔄 재연결 - 시퀀스 상태 리셋');
    this.lastSequence = 0;
    this.missedSequences.clear();
    
    // 서버에서 최신 이벤트 요청
    this.requestMissingEvents();
  }
}

// 싱글톤 인스턴스
const sequenceService = new SequenceService();

export default sequenceService;