-- 기존 테이블 백업 (데이터가 있을 경우)
CREATE TABLE IF NOT EXISTS balance_sync_logs_backup AS SELECT * FROM balance_sync_logs;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS balance_sync_logs;

-- 개선된 balance_sync_logs 테이블 생성
CREATE TABLE balance_sync_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  sync_type ENUM('manual', 'automatic', 'transaction', 'game_start', 'game_end', 'validation') NOT NULL,
  
  -- 로컬 잔액 정보
  before_local_balance DECIMAL(20,2) DEFAULT 0,
  after_local_balance DECIMAL(20,2) DEFAULT 0,
  local_balance_change DECIMAL(20,2) DEFAULT 0,
  
  -- Honor 잔액 정보
  before_honor_balance DECIMAL(20,2) DEFAULT 0,
  after_honor_balance DECIMAL(20,2) DEFAULT 0,
  honor_balance_change DECIMAL(20,2) DEFAULT 0,
  
  -- 총 잔액 정보
  before_total_balance DECIMAL(20,2) DEFAULT 0,
  after_total_balance DECIMAL(20,2) DEFAULT 0,
  total_balance_change DECIMAL(20,2) DEFAULT 0,
  
  -- 불일치 정보
  balance_discrepancy DECIMAL(20,2) DEFAULT 0,
  discrepancy_resolved BOOLEAN DEFAULT FALSE,
  
  -- 상태 및 에러 정보
  status ENUM('success', 'failed', 'partial', 'pending') DEFAULT 'success',
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- 추가 정보
  sync_details JSON,
  transaction_ids JSON,  -- 관련 트랜잭션 ID들
  game_info JSON,        -- 게임 정보 (게임 관련 동기화인 경우)
  api_response JSON,     -- Honor API 응답 데이터
  
  -- 실행 정보
  execution_time_ms INT,  -- 실행 시간 (밀리초)
  retry_count INT DEFAULT 0,
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 인덱스
  INDEX idx_member_id (member_id),
  INDEX idx_user_id (user_id),
  INDEX idx_sync_type (sync_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_balance_discrepancy (balance_discrepancy),
  INDEX idx_composite (member_id, sync_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 코멘트 추가
ALTER TABLE balance_sync_logs COMMENT = 'Honor API 잔액 동기화 로그 테이블';

-- 컬럼 코멘트 추가
ALTER TABLE balance_sync_logs
  MODIFY COLUMN member_id INT NOT NULL COMMENT '회원 ID (members.id)',
  MODIFY COLUMN user_id VARCHAR(50) NOT NULL COMMENT 'Honor API 사용자 ID',
  MODIFY COLUMN sync_type ENUM('manual', 'automatic', 'transaction', 'game_start', 'game_end', 'validation') NOT NULL COMMENT '동기화 유형',
  MODIFY COLUMN before_local_balance DECIMAL(20,2) DEFAULT 0 COMMENT '동기화 전 로컬 잔액',
  MODIFY COLUMN after_local_balance DECIMAL(20,2) DEFAULT 0 COMMENT '동기화 후 로컬 잔액',
  MODIFY COLUMN local_balance_change DECIMAL(20,2) DEFAULT 0 COMMENT '로컬 잔액 변화량',
  MODIFY COLUMN before_honor_balance DECIMAL(20,2) DEFAULT 0 COMMENT '동기화 전 Honor 잔액',
  MODIFY COLUMN after_honor_balance DECIMAL(20,2) DEFAULT 0 COMMENT '동기화 후 Honor 잔액',
  MODIFY COLUMN honor_balance_change DECIMAL(20,2) DEFAULT 0 COMMENT 'Honor 잔액 변화량',
  MODIFY COLUMN before_total_balance DECIMAL(20,2) DEFAULT 0 COMMENT '동기화 전 총 잔액',
  MODIFY COLUMN after_total_balance DECIMAL(20,2) DEFAULT 0 COMMENT '동기화 후 총 잔액',
  MODIFY COLUMN total_balance_change DECIMAL(20,2) DEFAULT 0 COMMENT '총 잔액 변화량',
  MODIFY COLUMN balance_discrepancy DECIMAL(20,2) DEFAULT 0 COMMENT '잔액 불일치 금액',
  MODIFY COLUMN discrepancy_resolved BOOLEAN DEFAULT FALSE COMMENT '불일치 해결 여부',
  MODIFY COLUMN status ENUM('success', 'failed', 'partial', 'pending') DEFAULT 'success' COMMENT '동기화 상태',
  MODIFY COLUMN error_message TEXT COMMENT '에러 메시지',
  MODIFY COLUMN error_code VARCHAR(50) COMMENT '에러 코드',
  MODIFY COLUMN sync_details JSON COMMENT '동기화 상세 정보',
  MODIFY COLUMN transaction_ids JSON COMMENT '관련 트랜잭션 ID 목록',
  MODIFY COLUMN game_info JSON COMMENT '게임 정보 (게임 관련 동기화)',
  MODIFY COLUMN api_response JSON COMMENT 'Honor API 응답 데이터',
  MODIFY COLUMN execution_time_ms INT COMMENT '실행 시간 (밀리초)',
  MODIFY COLUMN retry_count INT DEFAULT 0 COMMENT '재시도 횟수';

-- 기존 데이터가 있었다면 마이그레이션
INSERT INTO balance_sync_logs (member_id, user_id, sync_type, before_local_balance, after_local_balance, status, sync_details, created_at)
SELECT 
  user_id as member_id,
  CONCAT('user_', user_id) as user_id,
  COALESCE(sync_type, 'automatic') as sync_type,
  COALESCE(before_balance, 0) as before_local_balance,
  COALESCE(after_balance, 0) as after_local_balance,
  'success' as status,
  discrepancy as sync_details,
  created_at
FROM balance_sync_logs_backup
WHERE EXISTS (SELECT 1 FROM balance_sync_logs_backup);

-- 백업 테이블 삭제 (필요시 주석 해제)
-- DROP TABLE IF EXISTS balance_sync_logs_backup;