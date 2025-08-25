-- 잔액 동기화 로그 테이블 생성
CREATE TABLE IF NOT EXISTS balance_sync_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sync_type VARCHAR(50) NOT NULL COMMENT 'manual, auto, game_start, game_end, periodic',
  before_db_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  before_honor_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  after_db_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  after_honor_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  action_taken VARCHAR(100) COMMENT 'keep_db, update_from_honor, keep_larger, etc',
  discrepancy JSON COMMENT '불일치 상세 정보',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_sync_type (sync_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='잔액 동기화 로그';