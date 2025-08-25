-- 모든 테이블 목록 확인
SHOW TABLES;

-- 각 테이블의 구조 확인 (필요한 테이블만)
-- 롤링금전환내역 관련 테이블이 있는지 확인
SHOW TABLES LIKE '%rolling%';

-- 머니처리내역 관련 테이블이 있는지 확인  
SHOW TABLES LIKE '%money%';

-- 머니이동내역 관련 테이블이 있는지 확인
SHOW TABLES LIKE '%transfer%';
SHOW TABLES LIKE '%transaction%';

-- point, cash 관련 테이블 확인
SHOW TABLES LIKE '%point%';
SHOW TABLES LIKE '%cash%';