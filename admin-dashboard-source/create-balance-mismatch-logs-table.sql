-- 잔액 불일치 로그 테이블 생성
CREATE TABLE IF NOT EXISTS balance_mismatch_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(50),
  local_balance DECIMAL(15,2),
  honor_balance DECIMAL(15,2),
  difference DECIMAL(15,2),
  action_taken ENUM('blocked', 'auto_synced_to_honor', 'auto_synced_to_local', 'manual_review', 'favor_higher'),
  resolved_at TIMESTAMP NULL,
  resolved_by INT NULL,
  resolution_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action_taken (action_taken),
  INDEX idx_resolved (resolved_at),
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 시스템 설정 테이블에 잔액 불일치 처리 옵션 추가
INSERT INTO system_settings (setting_key, setting_value, description, updated_at)
VALUES 
  ('BALANCE_MISMATCH_ACTION', '"block"', '잔액 불일치 시 처리 방법: block, auto_sync_honor, auto_sync_local, favor_higher', NOW()),
  ('BALANCE_MISMATCH_THRESHOLD', '1', '잔액 불일치 허용 오차 (원 단위)', NOW())
ON DUPLICATE KEY UPDATE 
  updated_at = NOW();