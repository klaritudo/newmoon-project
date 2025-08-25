-- members 테이블에 슬롯/카지노 별도 롤링 퍼센트 컬럼 추가
ALTER TABLE members
ADD COLUMN IF NOT EXISTS rolling_slot_percent DECIMAL(5,2) DEFAULT 0 COMMENT '슬롯 롤링 퍼센트',
ADD COLUMN IF NOT EXISTS rolling_casino_percent DECIMAL(5,2) DEFAULT 0 COMMENT '카지노 롤링 퍼센트',
ADD COLUMN IF NOT EXISTS rolling_slot_amount DECIMAL(15,2) DEFAULT 0 COMMENT '슬롯 롤링 금액',
ADD COLUMN IF NOT EXISTS rolling_casino_amount DECIMAL(15,2) DEFAULT 0 COMMENT '카지노 롤링 금액';

-- 기존 rollingPercent 값을 슬롯과 카지노에 동일하게 적용 (기존 데이터가 있는 경우)
UPDATE members 
SET rolling_slot_percent = rollingPercent,
    rolling_casino_percent = rollingPercent
WHERE rollingPercent > 0;

-- 테스트 데이터 업데이트 (예시)
UPDATE members SET rolling_slot_percent = 5, rolling_casino_percent = 3 WHERE username = 'user00001';
UPDATE members SET rolling_slot_percent = 4, rolling_casino_percent = 2 WHERE username = 'user00002';
UPDATE members SET rolling_slot_percent = 3, rolling_casino_percent = 1.5 WHERE username = 'user00003';
UPDATE members SET rolling_slot_percent = 2, rolling_casino_percent = 1 WHERE username = 'user00004';
UPDATE members SET rolling_slot_percent = 1, rolling_casino_percent = 0.5 WHERE username = 'user00005';

-- 확인
SELECT username, rolling_slot_percent, rolling_casino_percent, rolling_slot_amount, rolling_casino_amount 
FROM members 
LIMIT 10;