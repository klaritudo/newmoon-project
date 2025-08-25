-- Honor API 동기화를 위한 컬럼 추가

-- members 테이블에 Honor API 관련 컬럼 추가
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS honor_sync_status VARCHAR(20) DEFAULT NULL COMMENT 'Honor API 동기화 상태 (synced, failed, NULL)',
ADD COLUMN IF NOT EXISTS honor_sync_date DATETIME DEFAULT NULL COMMENT 'Honor API 동기화 일시',
ADD COLUMN IF NOT EXISTS honor_sync_error TEXT DEFAULT NULL COMMENT 'Honor API 동기화 실패 시 에러 내용';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_honor_sync_status ON members(honor_sync_status);
CREATE INDEX IF NOT EXISTS idx_honor_sync_date ON members(honor_sync_date);