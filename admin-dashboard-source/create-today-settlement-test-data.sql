-- 당일정산 테스트를 위한 금일자 데이터 생성
-- 베팅 데이터 50개 + 충환 데이터 생성

-- 기존 금일자 데이터 삭제 (테스트를 위해)
DELETE FROM betting_details WHERE DATE(betting_time) = CURDATE();
DELETE FROM money_processing_history WHERE DATE(request_date) = CURDATE();

-- 1. 베팅 데이터 50개 생성
INSERT INTO betting_details 
(betting_id, member_id, game_type, game_name, game_company, bet_amount, win_amount, status, 
 before_balance, after_balance, betting_time, result_time, created_at)
VALUES
-- super00001 (ID: 2) - 10건
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '001'), 2, 'slot', 'Sweet Bonanza', 'Pragmatic Play', 100000, 120000, 'win', 5000000, 5020000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '002'), 2, 'slot', 'Gates of Olympus', 'Pragmatic Play', 200000, 0, 'lose', 5020000, 4820000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '003'), 2, 'casino', 'Baccarat', 'Evolution', 300000, 280000, 'lose', 4820000, 4800000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '004'), 2, 'casino', 'Blackjack', 'Evolution', 150000, 300000, 'win', 4800000, 4950000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '005'), 2, 'slot', 'Starlight Princess', 'Pragmatic Play', 50000, 40000, 'lose', 4950000, 4940000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '006'), 2, 'casino', 'Roulette', 'Evolution', 100000, 200000, 'win', 4940000, 5040000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '007'), 2, 'slot', 'Wild West Gold', 'Pragmatic Play', 80000, 60000, 'lose', 5040000, 5020000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '008'), 2, 'casino', 'Dragon Tiger', 'Evolution', 120000, 240000, 'win', 5020000, 5140000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '009'), 2, 'slot', 'Sugar Rush', 'Pragmatic Play', 200000, 0, 'lose', 5140000, 4940000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(CONCAT('BET', DATE_FORMAT(NOW(), '%Y%m%d'), '010'), 2, 'casino', 'Sic Bo', 'Evolution', 150000, 450000, 'win', 4940000, 5240000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),

-- shop00001 (ID: 6) - 8건
(6, 'slot', 'Book of Dead', 'Play n GO', 50000, 0, 'lose', 2000000, 1950000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'slot', 'Reactoonz', 'Play n GO', 30000, 45000, 'win', 1950000, 1965000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'casino', 'Baccarat', 'Evolution', 100000, 95000, 'lose', 1965000, 1960000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'slot', 'Moon Princess', 'Play n GO', 40000, 120000, 'win', 1960000, 2040000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'casino', 'Roulette', 'Evolution', 80000, 0, 'lose', 2040000, 1960000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'slot', 'Rise of Olympus', 'Play n GO', 60000, 180000, 'win', 1960000, 2080000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'casino', 'Blackjack', 'Evolution', 70000, 140000, 'win', 2080000, 2150000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(6, 'slot', 'Jammin Jars', 'Push Gaming', 90000, 0, 'lose', 2150000, 2060000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),

-- shop00002 (ID: 7) - 6건
(7, 'slot', 'Gonzo Quest', 'NetEnt', 40000, 80000, 'win', 1500000, 1540000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(7, 'casino', 'Baccarat', 'Evolution', 60000, 0, 'lose', 1540000, 1480000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(7, 'slot', 'Starburst', 'NetEnt', 30000, 90000, 'win', 1480000, 1540000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(7, 'casino', 'Dragon Tiger', 'Evolution', 50000, 100000, 'win', 1540000, 1590000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(7, 'slot', 'Dead or Alive', 'NetEnt', 70000, 0, 'lose', 1590000, 1520000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(7, 'casino', 'Roulette', 'Evolution', 80000, 160000, 'win', 1520000, 1600000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),

-- 매장24 (ID: 30) - 5건
(30, 'slot', 'Big Bass Bonanza', 'Pragmatic Play', 20000, 60000, 'win', 800000, 840000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(30, 'casino', 'Baccarat', 'Evolution', 30000, 0, 'lose', 840000, 810000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(30, 'slot', 'Wolf Gold', 'Pragmatic Play', 25000, 75000, 'win', 810000, 860000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(30, 'casino', 'Blackjack', 'Evolution', 40000, 80000, 'win', 860000, 900000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(30, 'slot', 'The Dog House', 'Pragmatic Play', 35000, 0, 'lose', 900000, 865000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),

-- 매장26 (ID: 32) - 5건  
(32, 'slot', 'Fire Joker', 'Play n GO', 15000, 45000, 'win', 600000, 630000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(32, 'casino', 'Roulette', 'Evolution', 25000, 0, 'lose', 630000, 605000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(32, 'slot', 'Gemix', 'Play n GO', 20000, 40000, 'win', 605000, 625000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(32, 'casino', 'Dragon Tiger', 'Evolution', 30000, 60000, 'win', 625000, 655000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(32, 'slot', 'Legacy of Dead', 'Play n GO', 35000, 0, 'lose', 655000, 620000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),

-- 에이전트 레벨 회원들 추가 (ID: 3, 4, 5, 11, 12, 14, 20, 27, 33, 40) - 16건
(3, 'slot', 'Sweet Bonanza', 'Pragmatic Play', 150000, 0, 'lose', 3000000, 2850000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(3, 'casino', 'Baccarat', 'Evolution', 200000, 400000, 'win', 2850000, 3050000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(4, 'slot', 'Gates of Olympus', 'Pragmatic Play', 100000, 300000, 'win', 2500000, 2700000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(4, 'casino', 'Blackjack', 'Evolution', 120000, 0, 'lose', 2700000, 2580000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(5, 'slot', 'Starlight Princess', 'Pragmatic Play', 80000, 240000, 'win', 2000000, 2160000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(5, 'casino', 'Roulette', 'Evolution', 90000, 0, 'lose', 2160000, 2070000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(11, 'slot', 'Book of Dead', 'Play n GO', 60000, 180000, 'win', 1800000, 1920000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(11, 'casino', 'Dragon Tiger', 'Evolution', 70000, 140000, 'win', 1920000, 1990000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(12, 'slot', 'Reactoonz', 'Play n GO', 50000, 0, 'lose', 1600000, 1550000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(12, 'casino', 'Sic Bo', 'Evolution', 55000, 165000, 'win', 1550000, 1660000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(14, 'slot', 'Moon Princess', 'Play n GO', 45000, 135000, 'win', 1400000, 1490000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(14, 'casino', 'Baccarat', 'Evolution', 85000, 0, 'lose', 1490000, 1405000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(20, 'slot', 'Wild West Gold', 'Pragmatic Play', 40000, 120000, 'win', 1200000, 1280000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(27, 'casino', 'Blackjack', 'Evolution', 65000, 130000, 'win', 1000000, 1065000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(33, 'slot', 'Sugar Rush', 'Pragmatic Play', 55000, 0, 'lose', 900000, 845000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW()),
(40, 'casino', 'Roulette', 'Evolution', 75000, 150000, 'win', 800000, 875000, NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, NOW());

-- 2. 충전/환전 데이터 생성 (무통장 거래)
INSERT INTO money_processing_history 
(member_id, transaction_type, amount, status, payment_method, bank_name, account_holder, 
 request_date, process_date, processed_by, created_at)
VALUES
-- 충전 데이터
(2, 'charge', 2000000, 'completed', '무통장', '국민은행', '슈퍼00001', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(6, 'charge', 1000000, 'completed', '무통장', '신한은행', '샵00001', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(7, 'charge', 500000, 'completed', '무통장', '우리은행', '샵00002', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(30, 'charge', 300000, 'completed', '무통장', '하나은행', '매장24', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(32, 'charge', 200000, 'completed', '무통장', '국민은행', '매장26', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(3, 'charge', 1500000, 'completed', '무통장', '신한은행', '에이00001', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(4, 'charge', 800000, 'completed', '무통장', '우리은행', '에이00002', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),

-- 환전 데이터
(2, 'exchange', 500000, 'completed', '무통장', '국민은행', '슈퍼00001', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(6, 'exchange', 300000, 'completed', '무통장', '신한은행', '샵00001', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(7, 'exchange', 200000, 'completed', '무통장', '우리은행', '샵00002', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(30, 'exchange', 100000, 'completed', '무통장', '하나은행', '매장24', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(3, 'exchange', 400000, 'completed', '무통장', '신한은행', '에이00001', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(4, 'exchange', 250000, 'completed', '무통장', '우리은행', '에이00002', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),

-- 일부 카드 거래 (당일정산에 포함되지 않음)
(5, 'charge', 1000000, 'completed', '카드', NULL, '에이00003', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW()),
(11, 'exchange', 200000, 'completed', '카드', NULL, '매1', NOW() - INTERVAL FLOOR(RAND() * 600) MINUTE, NOW() - INTERVAL FLOOR(RAND() * 300) MINUTE, 1, NOW());

-- 3. 데이터 확인
SELECT '=== 베팅 데이터 요약 ===' as title;
SELECT 
  m.username,
  m.nickname,
  COUNT(*) as betting_count,
  SUM(CASE WHEN bd.game_type = 'slot' THEN 1 ELSE 0 END) as slot_count,
  SUM(CASE WHEN bd.game_type = 'casino' THEN 1 ELSE 0 END) as casino_count,
  SUM(bd.bet_amount) as total_bet,
  SUM(bd.win_amount) as total_win,
  SUM(bd.bet_amount) - SUM(bd.win_amount) as profit_loss
FROM betting_details bd
JOIN members m ON bd.member_id = m.id
WHERE DATE(bd.betting_time) = CURDATE()
GROUP BY m.id, m.username, m.nickname
ORDER BY m.id;

SELECT '=== 충환 데이터 요약 ===' as title;
SELECT 
  m.username,
  m.nickname,
  SUM(CASE WHEN mph.transaction_type = 'charge' AND mph.payment_method = '무통장' THEN mph.amount ELSE 0 END) as charge_amount,
  SUM(CASE WHEN mph.transaction_type = 'exchange' AND mph.payment_method = '무통장' THEN mph.amount ELSE 0 END) as exchange_amount,
  SUM(CASE WHEN mph.transaction_type = 'charge' AND mph.payment_method = '무통장' THEN mph.amount ELSE 0 END) - 
  SUM(CASE WHEN mph.transaction_type = 'exchange' AND mph.payment_method = '무통장' THEN mph.amount ELSE 0 END) as profit_loss
FROM money_processing_history mph
JOIN members m ON mph.member_id = m.id
WHERE DATE(mph.request_date) = CURDATE() 
  AND mph.status = 'completed'
GROUP BY m.id, m.username, m.nickname
HAVING charge_amount > 0 OR exchange_amount > 0
ORDER BY m.id;

SELECT '=== 전체 통계 ===' as title;
SELECT 
  COUNT(DISTINCT bd.member_id) as betting_members,
  COUNT(*) as total_bets,
  SUM(bd.bet_amount) as total_bet_amount,
  SUM(bd.win_amount) as total_win_amount,
  SUM(bd.bet_amount) - SUM(bd.win_amount) as total_profit_loss
FROM betting_details bd
WHERE DATE(bd.betting_time) = CURDATE();