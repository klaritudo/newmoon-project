-- 테스트용 당일 정산 데이터 생성
-- 주의: 이 스크립트는 테스트 목적으로만 사용하세요

-- 오늘 날짜의 충전/환전 데이터 생성
INSERT INTO money_processing_history 
(member_id, transaction_type, amount, status, payment_method, request_date, process_date, created_at)
VALUES
-- super00001 (ID: 2)
(2, 'charge', 1000000, 'completed', '무통장', NOW(), NOW(), NOW()),
(2, 'exchange', 500000, 'completed', '무통장', NOW(), NOW(), NOW()),
-- shop00001 (ID: 6)
(6, 'charge', 500000, 'completed', '무통장', NOW(), NOW(), NOW()),
(6, 'exchange', 200000, 'completed', '무통장', NOW(), NOW(), NOW()),
-- 매장24 (ID: 30)
(30, 'charge', 300000, 'completed', '무통장', NOW(), NOW(), NOW()),
-- 매장26 (ID: 32)
(32, 'exchange', 100000, 'completed', '무통장', NOW(), NOW(), NOW());

-- 오늘 날짜의 베팅 데이터 생성
INSERT INTO betting_details
(member_id, game_type, game_name, bet_amount, win_amount, status, betting_time, created_at)
VALUES
-- super00001 슬롯 베팅
(2, 'slot', 'Sweet Bonanza', 100000, 80000, 'lose', NOW(), NOW()),
(2, 'slot', 'Gates of Olympus', 200000, 250000, 'win', NOW(), NOW()),
-- super00001 카지노 베팅
(2, 'casino', 'Baccarat', 300000, 280000, 'lose', NOW(), NOW()),
(2, 'casino', 'Blackjack', 150000, 180000, 'win', NOW(), NOW()),
-- shop00001 슬롯 베팅
(6, 'slot', 'Sugar Rush', 50000, 40000, 'lose', NOW(), NOW()),
(6, 'slot', 'Wild West Gold', 80000, 120000, 'win', NOW(), NOW()),
-- shop00001 카지노 베팅
(6, 'casino', 'Roulette', 100000, 90000, 'lose', NOW(), NOW()),
-- 매장24 베팅
(30, 'slot', 'Starlight Princess', 30000, 25000, 'lose', NOW(), NOW()),
(30, 'casino', 'Dragon Tiger', 40000, 45000, 'win', NOW(), NOW()),
-- 매장26 베팅
(32, 'slot', 'Book of Dead', 20000, 15000, 'lose', NOW(), NOW()),
(32, 'casino', 'Sic Bo', 25000, 30000, 'win', NOW(), NOW());

-- 확인
SELECT 
  m.username,
  m.nickname,
  m.rolling_slot_percent,
  m.rolling_casino_percent,
  (SELECT COALESCE(SUM(amount), 0) FROM money_processing_history 
   WHERE member_id = m.id AND transaction_type = 'charge' 
   AND DATE(request_date) = CURDATE() AND status = 'completed') as charge_amount,
  (SELECT COALESCE(SUM(amount), 0) FROM money_processing_history 
   WHERE member_id = m.id AND transaction_type = 'exchange' 
   AND DATE(request_date) = CURDATE() AND status = 'completed') as exchange_amount,
  (SELECT COALESCE(SUM(bet_amount), 0) FROM betting_details 
   WHERE member_id = m.id AND game_type = 'slot' 
   AND DATE(betting_time) = CURDATE() AND status IN ('win', 'lose')) as slot_betting,
  (SELECT COALESCE(SUM(win_amount), 0) FROM betting_details 
   WHERE member_id = m.id AND game_type = 'slot' 
   AND DATE(betting_time) = CURDATE() AND status IN ('win', 'lose')) as slot_winning,
  (SELECT COALESCE(SUM(bet_amount), 0) FROM betting_details 
   WHERE member_id = m.id AND game_type = 'casino' 
   AND DATE(betting_time) = CURDATE() AND status IN ('win', 'lose')) as casino_betting,
  (SELECT COALESCE(SUM(win_amount), 0) FROM betting_details 
   WHERE member_id = m.id AND game_type = 'casino' 
   AND DATE(betting_time) = CURDATE() AND status IN ('win', 'lose')) as casino_winning
FROM members m
WHERE m.id IN (2, 6, 30, 32);