-- 롤링 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS rolling_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL COMMENT '회원 ID',
  betting_id INT COMMENT '베팅 ID',
  game_type VARCHAR(20) NOT NULL COMMENT '게임 타입 (slot/casino)',
  bet_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '베팅 금액',
  rolling_percent DECIMAL(5,2) NOT NULL COMMENT '적용된 롤링 퍼센트',
  rolling_amount DECIMAL(15,2) NOT NULL COMMENT '지급된 롤링 금액',
  before_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '지급 전 롤링 잔액',
  after_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '지급 후 롤링 잔액',
  status VARCHAR(20) DEFAULT 'completed' COMMENT '상태',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  
  -- 인덱스
  INDEX idx_member_id (member_id),
  INDEX idx_betting_id (betting_id),
  INDEX idx_created_at (created_at),
  INDEX idx_game_type (game_type),
  
  -- 외래키
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='롤링 지급 히스토리';