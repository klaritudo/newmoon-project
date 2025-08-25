-- games 테이블에 플래그 컬럼 추가
ALTER TABLE games ADD COLUMN is_featured BOOLEAN DEFAULT FALSE COMMENT '추천 게임 여부';
ALTER TABLE games ADD COLUMN is_hot BOOLEAN DEFAULT FALSE COMMENT '인기 게임 여부';
ALTER TABLE games ADD COLUMN is_new BOOLEAN DEFAULT FALSE COMMENT '신규 게임 여부';

-- 인덱스 추가 (성능 향상)
ALTER TABLE games ADD INDEX idx_featured (is_featured);
ALTER TABLE games ADD INDEX idx_hot (is_hot);
ALTER TABLE games ADD INDEX idx_new (is_new);

-- 샘플 데이터 업데이트 (일부 게임을 인기/추천/신규로 설정)
UPDATE games SET is_featured = 1 WHERE RAND() < 0.1 LIMIT 50;
UPDATE games SET is_hot = 1 WHERE RAND() < 0.15 LIMIT 100;
UPDATE games SET is_new = 1 WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);