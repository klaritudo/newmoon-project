-- betting_details 테이블에 처리일자 컬럼 추가
ALTER TABLE betting_details 
ADD COLUMN process_time DATETIME DEFAULT NULL AFTER bet_time;

-- 기존 데이터 업데이트 (pending이 아닌 경우 베팅시간 + 몇 초로 설정)
UPDATE betting_details 
SET process_time = DATE_ADD(bet_time, INTERVAL FLOOR(RAND() * 10) SECOND)
WHERE result != 'pending';

-- 확인
SELECT 
  id,
  bet_time,
  process_time,
  result,
  bet_amount,
  win_amount
FROM betting_details
LIMIT 10;