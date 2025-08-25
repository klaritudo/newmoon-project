-- game_providers 테이블 확장
-- 기존 컬럼: id, name, code, status

-- 1. 새로운 컬럼 추가
ALTER TABLE game_providers 
ADD COLUMN IF NOT EXISTS name_ko VARCHAR(100) DEFAULT NULL COMMENT '한글명',
ADD COLUMN IF NOT EXISTS game_types JSON DEFAULT NULL COMMENT '지원하는 게임 타입 ["slot", "casino", "live"]',
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255) DEFAULT NULL COMMENT '로고 이미지 URL',
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 COMMENT '정렬 순서',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 상태',
ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT NULL COMMENT '추가 메타데이터',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. 인덱스 추가
ALTER TABLE game_providers
ADD INDEX IF NOT EXISTS idx_is_active (is_active),
ADD INDEX IF NOT EXISTS idx_sort_order (sort_order),
ADD INDEX IF NOT EXISTS idx_code (code);

-- 3. 기존 데이터 업데이트 (game_categories 데이터 기반)
UPDATE game_providers gp
INNER JOIN game_categories gc ON gp.code = gc.code
SET 
    gp.name_ko = gc.name_ko,
    gp.sort_order = gc.sort_order,
    gp.is_active = gc.is_active,
    gp.game_types = CASE 
        WHEN gc.type = 'slot' THEN '["slot"]'
        WHEN gc.type = 'casino' THEN '["casino", "live"]'
        WHEN gc.type = 'specialty' THEN '["specialty"]'
        ELSE '[]'
    END
WHERE gp.name_ko IS NULL;

-- 4. 로고 URL 설정 (기본 경로)
UPDATE game_providers 
SET logo_url = CONCAT('/img/vendor-logo-icon/vender-logo-', LOWER(REPLACE(REPLACE(code, "'", ''), ' ', '')), '.png')
WHERE logo_url IS NULL;