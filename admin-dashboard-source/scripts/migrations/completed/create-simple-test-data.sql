-- 당일정산 테스트를 위한 간단한 데이터 생성
-- AUTO_INCREMENT를 사용하여 betting_id 자동 생성

-- 기존 금일자 데이터 삭제
DELETE FROM betting_details WHERE DATE(betting_time) = CURDATE();
DELETE FROM money_processing_history WHERE DATE(request_date) = CURDATE();

-- betting_details 테이블의 betting_id 컬럼 확인 및 수정
-- 만약 NOT NULL이면서 DEFAULT가 없다면 임시로 수정
-- betting_id 컬럼 타입 확인 후 필요시 수정
ALTER TABLE betting_details MODIFY COLUMN betting_id VARCHAR(100);

-- 1. 충전/환전 데이터 먼저 생성 (무통장 거래만)
INSERT INTO money_processing_history 
(member_id, transaction_type, amount, status, payment_method, request_date, process_date, created_at)
VALUES
-- 충전
(2, 'charge', 2000000, 'completed', '무통장', NOW(), NOW(), NOW()),
(6, 'charge', 1000000, 'completed', '무통장', NOW(), NOW(), NOW()),
(7, 'charge', 500000, 'completed', '무통장', NOW(), NOW(), NOW()),
(30, 'charge', 300000, 'completed', '무통장', NOW(), NOW(), NOW()),
(32, 'charge', 200000, 'completed', '무통장', NOW(), NOW(), NOW()),
-- 환전
(2, 'exchange', 500000, 'completed', '무통장', NOW(), NOW(), NOW()),
(6, 'exchange', 300000, 'completed', '무통장', NOW(), NOW(), NOW()),
(30, 'exchange', 100000, 'completed', '무통장', NOW(), NOW(), NOW());

-- 2. 베팅 데이터 생성 (betting_id 명시적으로 제공)
INSERT INTO betting_details 
(betting_id, member_id, game_type, game_name, game_company, bet_amount, win_amount, status, betting_time, created_at)
VALUES
-- super00001 (ID: 2)
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '001'), 2, 'slot', 'Sweet Bonanza', 'Pragmatic Play', 100000, 120000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '002'), 2, 'slot', 'Gates of Olympus', 'Pragmatic Play', 200000, 0, 'lose', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '003'), 2, 'casino', 'Baccarat', 'Evolution', 300000, 280000, 'lose', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '004'), 2, 'casino', 'Blackjack', 'Evolution', 150000, 300000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '005'), 2, 'slot', 'Starlight Princess', 'Pragmatic Play', 50000, 40000, 'lose', NOW(), NOW()),
-- shop00001 (ID: 6)
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '006'), 6, 'slot', 'Book of Dead', 'Play n GO', 50000, 0, 'lose', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '007'), 6, 'casino', 'Baccarat', 'Evolution', 100000, 95000, 'lose', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '008'), 6, 'slot', 'Moon Princess', 'Play n GO', 40000, 120000, 'win', NOW(), NOW()),
-- shop00002 (ID: 7)
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '009'), 7, 'slot', 'Starburst', 'NetEnt', 30000, 90000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '010'), 7, 'casino', 'Dragon Tiger', 'Evolution', 50000, 100000, 'win', NOW(), NOW()),
-- 매장24 (ID: 30)
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '011'), 30, 'slot', 'Big Bass Bonanza', 'Pragmatic Play', 20000, 60000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '012'), 30, 'casino', 'Baccarat', 'Evolution', 30000, 0, 'lose', NOW(), NOW()),
-- 매장26 (ID: 32)
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '013'), 32, 'slot', 'Fire Joker', 'Play n GO', 15000, 45000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '014'), 32, 'casino', 'Roulette', 'Evolution', 25000, 0, 'lose', NOW(), NOW()),
-- 추가 회원들
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '015'), 3, 'slot', 'Sweet Bonanza', 'Pragmatic Play', 150000, 0, 'lose', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '016'), 3, 'casino', 'Baccarat', 'Evolution', 200000, 400000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '017'), 4, 'slot', 'Gates of Olympus', 'Pragmatic Play', 100000, 300000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '018'), 5, 'casino', 'Roulette', 'Evolution', 90000, 0, 'lose', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '019'), 11, 'slot', 'Book of Dead', 'Play n GO', 60000, 180000, 'win', NOW(), NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '020'), 12, 'casino', 'Sic Bo', 'Evolution', 55000, 165000, 'win', NOW(), NOW());

-- 3. 데이터 확인
SELECT 
  '=== 당일정산 요약 ===' as title,
  COUNT(DISTINCT bd.member_id) as '베팅회원수',
  COUNT(*) as '총베팅수',
  FORMAT(SUM(bd.bet_amount), 0) as '총베팅금액',
  FORMAT(SUM(bd.win_amount), 0) as '총당첨금액',
  FORMAT(SUM(bd.bet_amount) - SUM(bd.win_amount), 0) as '손익'
FROM betting_details bd
WHERE DATE(bd.betting_time) = CURDATE();

-- 회원별 정산 데이터
SELECT 
  m.username as '아이디',
  m.nickname as '닉네임',
  FORMAT(COALESCE(ch.charge_amt, 0), 0) as '충전금액',
  FORMAT(COALESCE(ex.exchange_amt, 0), 0) as '환전금액',
  FORMAT(COALESCE(ch.charge_amt, 0) - COALESCE(ex.exchange_amt, 0), 0) as '충환손익',
  FORMAT(COALESCE(s.bet_amt, 0), 0) as '슬롯베팅',
  FORMAT(COALESCE(s.win_amt, 0), 0) as '슬롯당첨',
  FORMAT(COALESCE(c.bet_amt, 0), 0) as '카지노베팅',
  FORMAT(COALESCE(c.win_amt, 0), 0) as '카지노당첨'
FROM members m
LEFT JOIN (
  SELECT member_id, SUM(amount) as charge_amt
  FROM money_processing_history
  WHERE DATE(request_date) = CURDATE() 
    AND transaction_type = 'charge' 
    AND status = 'completed'
    AND payment_method = '무통장'
  GROUP BY member_id
) ch ON m.id = ch.member_id
LEFT JOIN (
  SELECT member_id, SUM(amount) as exchange_amt
  FROM money_processing_history
  WHERE DATE(request_date) = CURDATE() 
    AND transaction_type = 'exchange' 
    AND status = 'completed'
    AND payment_method = '무통장'
  GROUP BY member_id
) ex ON m.id = ex.member_id
LEFT JOIN (
  SELECT member_id, SUM(bet_amount) as bet_amt, SUM(win_amount) as win_amt
  FROM betting_details
  WHERE DATE(betting_time) = CURDATE() AND game_type = 'slot'
  GROUP BY member_id
) s ON m.id = s.member_id
LEFT JOIN (
  SELECT member_id, SUM(bet_amount) as bet_amt, SUM(win_amount) as win_amt
  FROM betting_details
  WHERE DATE(betting_time) = CURDATE() AND game_type = 'casino'
  GROUP BY member_id
) c ON m.id = c.member_id
WHERE m.username NOT IN ('system', 'master')
  AND (ch.charge_amt > 0 OR ex.exchange_amt > 0 OR s.bet_amt > 0 OR c.bet_amt > 0)
ORDER BY m.id;