-- Honor API 개선을 위한 테이블 생성

-- 1. Honor 프로필 테이블
CREATE TABLE IF NOT EXISTS honor_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  honor_user_code VARCHAR(100) UNIQUE,
  balance DECIMAL(15,2) DEFAULT 0,
  last_synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_honor_user_code (honor_user_code),
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 동기화 상태 관리 테이블
CREATE TABLE IF NOT EXISTS honor_sync_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  last_object_id VARCHAR(100),
  last_sync_time TIMESTAMP NULL,
  status ENUM('running', 'stopped', 'error') DEFAULT 'stopped',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 통합 게임 통계 테이블
CREATE TABLE IF NOT EXISTS stat_game (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  date_time TIMESTAMP NOT NULL,
  user_id INT NOT NULL,
  shop_id INT DEFAULT NULL,
  category_id INT DEFAULT NULL,
  c_type VARCHAR(20) COMMENT 'slot/baccarat/etc',
  game VARCHAR(100),
  game_name VARCHAR(200),
  roundid VARCHAR(100),
  balance DECIMAL(15,2),
  bet DECIMAL(15,2),
  win DECIMAL(15,2),
  percent DECIMAL(5,2) COMMENT '환수율',
  profit DECIMAL(15,2) COMMENT '수익',
  trans_id VARCHAR(100) UNIQUE,
  object_id VARCHAR(100),
  api TINYINT COMMENT '11=Honor, 12=Evolution, etc',
  is_shown TINYINT DEFAULT 1,
  is_feepay TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date_time (date_time),
  INDEX idx_user_id (user_id),
  INDEX idx_trans_id (trans_id),
  INDEX idx_api (api),
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- honor_transactions 테이블에 object_id 컬럼 추가 (없는 경우)
ALTER TABLE honor_transactions 
ADD COLUMN IF NOT EXISTS object_id VARCHAR(100) AFTER reference_id,
ADD INDEX IF NOT EXISTS idx_object_id (object_id);

-- 초기 동기화 상태 레코드 삽입
INSERT INTO honor_sync_status (status, created_at) 
VALUES ('stopped', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();