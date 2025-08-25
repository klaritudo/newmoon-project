-- Honor API 게임 관리 시스템을 위한 테이블 생성 스크립트

-- 1. 게임 카테고리 테이블 (벤더/제공업체 관리)
CREATE TABLE IF NOT EXISTS game_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  name_ko VARCHAR(100) DEFAULT NULL,
  type ENUM('slot', 'casino', 'sports', 'specialty') NOT NULL,
  parent_id INT DEFAULT NULL,
  icon VARCHAR(50) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES game_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 게임 테이블 개선 (기존 테이블 수정)
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS vendor VARCHAR(50) NOT NULL AFTER id,
ADD COLUMN IF NOT EXISTS category_id INT DEFAULT NULL AFTER vendor,
ADD COLUMN IF NOT EXISTS game_name_ko VARCHAR(255) DEFAULT NULL AFTER game_name,
ADD COLUMN IF NOT EXISTS game_name_en VARCHAR(255) DEFAULT NULL AFTER game_name_ko,
ADD COLUMN IF NOT EXISTS is_hot BOOLEAN DEFAULT FALSE AFTER is_featured,
ADD COLUMN IF NOT EXISTS is_jackpot BOOLEAN DEFAULT FALSE AFTER is_hot,
ADD COLUMN IF NOT EXISTS rtp DECIMAL(5,2) DEFAULT NULL AFTER max_bet,
ADD COLUMN IF NOT EXISTS volatility ENUM('low', 'medium', 'high', 'very-high') DEFAULT NULL AFTER rtp,
ADD COLUMN IF NOT EXISTS mobile_support BOOLEAN DEFAULT TRUE AFTER volatility,
ADD COLUMN IF NOT EXISTS demo_available BOOLEAN DEFAULT TRUE AFTER mobile_support,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL DEFAULT NULL AFTER demo_available,
ADD COLUMN IF NOT EXISTS honor_game_id VARCHAR(100) DEFAULT NULL AFTER last_synced_at,
ADD INDEX idx_vendor (vendor),
ADD INDEX idx_category (category_id),
ADD INDEX idx_game_type (game_type),
ADD INDEX idx_is_active (is_active),
ADD INDEX idx_honor_game_id (honor_game_id),
ADD UNIQUE KEY uk_vendor_game_code (vendor, game_code),
ADD FOREIGN KEY (category_id) REFERENCES game_categories(id) ON DELETE SET NULL;

-- 3. Honor API 동기화 로그 테이블
CREATE TABLE IF NOT EXISTS honor_sync_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sync_type ENUM('games', 'vendors', 'transactions', 'balances') NOT NULL,
  vendor VARCHAR(50) DEFAULT NULL,
  status ENUM('started', 'completed', 'failed') NOT NULL,
  total_items INT DEFAULT 0,
  synced_items INT DEFAULT 0,
  failed_items INT DEFAULT 0,
  error_message TEXT DEFAULT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_sync_type (sync_type),
  INDEX idx_vendor (vendor),
  INDEX idx_status (status),
  INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 게임별 설정 테이블
CREATE TABLE IF NOT EXISTS game_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  setting_key VARCHAR(50) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_game_setting (game_id, setting_key),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Honor 트랜잭션 테이블 (기존 코드에서 참조하는 테이블)
CREATE TABLE IF NOT EXISTS honor_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  vendor VARCHAR(50) NOT NULL,
  game_code VARCHAR(100) DEFAULT NULL,
  transaction_type ENUM('bet', 'win', 'refund', 'bonus') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) DEFAULT NULL,
  balance_after DECIMAL(15,2) DEFAULT NULL,
  currency VARCHAR(10) DEFAULT 'KRW',
  round_id VARCHAR(100) DEFAULT NULL,
  reference_id VARCHAR(100) DEFAULT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_username (username),
  INDEX idx_vendor (vendor),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_round_id (round_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 기본 카테고리/벤더 데이터 삽입
INSERT INTO game_categories (code, name, name_ko, type, sort_order) VALUES
-- 슬롯 게임 제공업체
('pragmatic', 'Pragmatic Play', '프라그마틱 플레이', 'slot', 1),
('habanero', 'Habanero', '하바네로', 'slot', 2),
('netent', 'NetEnt', '넷엔트', 'slot', 3),
('redtiger', 'Red Tiger', '레드타이거', 'slot', 4),
('playngo', 'Play\'n GO', '플레이앤고', 'slot', 5),
('nolimit', 'Nolimit City', '노리밋시티', 'slot', 6),
('relax', 'Relax Gaming', '릴렉스게이밍', 'slot', 7),
('hacksaw', 'Hacksaw Gaming', '핵쏘게이밍', 'slot', 8),

-- 라이브 카지노 제공업체
('evolution', 'Evolution Gaming', '에볼루션 게이밍', 'casino', 10),
('ag', 'Asia Gaming', '아시아 게이밍', 'casino', 11),
('mg', 'Micro Gaming', '마이크로 게이밍', 'casino', 12),
('dreamgame', 'Dream Gaming', '드림 게이밍', 'casino', 13),
('wm', 'WM Live', 'WM 라이브', 'casino', 14),
('sexy', 'Sexy Gaming', '섹시 게이밍', 'casino', 15),
('ezugi', 'Ezugi', '이주기', 'casino', 16),
('vivo', 'Vivo Gaming', '비보 게이밍', 'casino', 17),

-- 스페셜티 게임
('betgames', 'BetGames.TV', '벳게임즈', 'specialty', 20),
('tvbet', 'TVBet', 'TV벳', 'specialty', 21)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  name_ko = VALUES(name_ko),
  type = VALUES(type),
  sort_order = VALUES(sort_order);

-- 7. 게임 제공업체 테이블 업데이트 (기존 테이블과 동기화)
INSERT INTO game_providers (name, code, status) 
SELECT name, code, 'active' FROM game_categories 
WHERE code NOT IN (SELECT code FROM game_providers)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  status = 'active';