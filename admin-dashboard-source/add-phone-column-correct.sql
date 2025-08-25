-- members 테이블에 phone 컬럼 추가
ALTER TABLE members ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER bank;

-- 기존 회원들에게 샘플 전화번호 추가 (선택사항)
-- ID 1~8번 회원에게는 NULL 유지
-- ID 9번 이후 회원들에게만 샘플 전화번호 추가
UPDATE members 
SET phone = CONCAT('010-', 
    LPAD(FLOOR(1000 + RAND() * 9000), 4, '0'), '-', 
    LPAD(FLOOR(1000 + RAND() * 9000), 4, '0')
)
WHERE id > 8;

-- 확인
SELECT id, userId, username, nickname, bank, phone FROM members WHERE id <= 20 ORDER BY id;