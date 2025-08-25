-- Honor API 동기화 큐 테이블
CREATE TABLE IF NOT EXISTS honor_sync_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '사용자 ID',
  sync_type VARCHAR(50) NOT NULL COMMENT 'balance_sync, transaction_sync, game_start, game_end',
  priority INT DEFAULT 5 COMMENT '우선순위 (1=최고, 10=최저)',
  request_data JSON COMMENT '요청 데이터',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  retry_count INT DEFAULT 0 COMMENT '재시도 횟수',
  max_retry INT DEFAULT 3 COMMENT '최대 재시도 횟수',
  last_error TEXT COMMENT '마지막 에러 메시지',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL COMMENT '처리 시작 시간',
  completed_at TIMESTAMP NULL COMMENT '처리 완료 시간',
  
  INDEX idx_status_priority (status, priority, created_at),
  INDEX idx_user_status (user_id, status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Honor API 동기화 큐';

-- 사용자별 마지막 API 호출 시간 추적
CREATE TABLE IF NOT EXISTS honor_api_rate_limit (
  user_id INT PRIMARY KEY,
  last_api_call TIMESTAMP NULL COMMENT '마지막 API 호출 시간',
  api_call_count INT DEFAULT 0 COMMENT '최근 1분간 API 호출 횟수',
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '카운터 리셋 시간',
  
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Honor API Rate Limit 추적';