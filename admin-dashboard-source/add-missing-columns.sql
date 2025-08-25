-- members 테이블에 누락된 컬럼 추가

-- 1. 예금주 컬럼 추가
ALTER TABLE members 
ADD COLUMN accountHolder VARCHAR(100) NULL COMMENT '예금주' AFTER accountNumber;

-- 2. 추천인 ID 컬럼 추가 (회원 페이지 마이페이지용)
ALTER TABLE members 
ADD COLUMN recommenderId INT NULL COMMENT '추천인 ID' AFTER parentId,
ADD COLUMN recommenderUsername VARCHAR(255) NULL COMMENT '추천인 아이디' AFTER recommenderId;

-- 3. 추천인 관계를 위한 외래키 설정 (선택사항)
-- ALTER TABLE members 
-- ADD CONSTRAINT fk_recommender 
-- FOREIGN KEY (recommenderId) REFERENCES members(id) ON DELETE SET NULL;

-- 4. 인덱스 추가 (검색 성능 향상)
ALTER TABLE members 
ADD INDEX idx_recommenderId (recommenderId);

-- 5. 기존 데이터 마이그레이션 (필요시)
-- 이름이 있는 경우 예금주를 이름으로 설정
UPDATE members 
SET accountHolder = name 
WHERE accountHolder IS NULL AND name IS NOT NULL;