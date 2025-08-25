-- 오늘(2025-06-19) 날짜의 베팅 데이터 생성
-- betting_details 테이블에 슬롯과 카지노 베팅 내역 추가

-- 슬롯 베팅 데이터
INSERT INTO betting_details (
    member_id, betting_id, game_type, game_name, game_company,
    bet_amount, win_amount, profit_loss, 
    before_balance, after_balance,
    betting_time, result_time, status,
    ip_address, device_type, betting_section
) VALUES
-- 회원 27 (강현우27) - 슬롯
(27, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_27_1'), 'slot', 'Sweet Bonanza', '프라그마틱', 
 50000, 35000, -15000, 564973, 549973,
 NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 'lose',
 '192.168.1.10', 'mobile', 'normal'),
(27, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_27_2'), 'slot', 'Gates of Olympus', '프라그마틱',
 100000, 250000, 150000, 549973, 699973,
 NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 'win',
 '192.168.1.10', 'mobile', 'freespin'),

-- 회원 30 (신수민30) - 카지노
(30, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_30_1'), 'casino', 'Lightning Baccarat', '에볼루션',
 200000, 180000, -20000, 415700, 395700,
 NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR, 'lose',
 '192.168.1.11', 'desktop', '-'),
(30, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_30_2'), 'casino', 'Speed Baccarat', '에볼루션',
 150000, 300000, 150000, 395700, 545700,
 NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 30 MINUTE, 'win',
 '192.168.1.11', 'desktop', '-'),

-- 회원 34 (황주원34) - 슬롯
(34, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_34_1'), 'slot', 'The Dog House', '프라그마틱',
 80000, 60000, -20000, 737635, 717635,
 NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'lose',
 '192.168.1.12', 'mobile', 'normal'),
(34, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_34_2'), 'slot', 'Big Bass Bonanza', '프라그마틱',
 120000, 150000, 30000, 717635, 747635,
 NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 'win',
 '192.168.1.12', 'mobile', 'freespin'),

-- 회원 36 (전서준36) - 혼합
(36, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_36_1'), 'casino', 'Crazy Time', '에볼루션',
 100000, 0, -100000, 314332, 214332,
 NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR, 'lose',
 '192.168.1.13', 'desktop', '-'),
(36, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_36_2'), 'slot', 'Starlight Princess', '프라그마틱',
 150000, 180000, 30000, 214332, 244332,
 NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 'win',
 '192.168.1.13', 'mobile', 'normal'),

-- 회원 37 (조주원37) - 카지노
(37, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_37_1'), 'casino', 'Blackjack', '에볼루션',
 30000, 60000, 30000, 53037, 83037,
 NOW() - INTERVAL 7 HOUR, NOW() - INTERVAL 6 HOUR, 'win',
 '192.168.1.20', 'mobile', '-'),
(37, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_37_2'), 'casino', 'Roulette', '에볼루션',
 40000, 0, -40000, 83037, 43037,
 NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR, 'lose',
 '192.168.1.20', 'mobile', '-'),

-- 회원 38 (정수빈38) - 슬롯
(38, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_38_1'), 'slot', 'Book of Dead', 'Play n GO',
 50000, 70000, 20000, 404316, 424316,
 NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR, 'win',
 '192.168.1.21', 'desktop', 'bonus'),
(38, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_38_2'), 'slot', 'Reactoonz', 'Play n GO',
 100000, 50000, -50000, 424316, 374316,
 NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'lose',
 '192.168.1.21', 'desktop', 'normal'),

-- 대박 회원들 (매장 단위로 몇 명 더 추가)
-- 회원 40 (박민지40)
(40, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_40_1'), 'slot', 'Mega Moolah', 'Microgaming',
 500000, 2000000, 1500000, 1000000, 2500000,
 NOW() - INTERVAL 10 HOUR, NOW() - INTERVAL 9 HOUR, 'win',
 '192.168.1.30', 'desktop', 'jackpot'),

-- 회원 42 (최서준42) 
(42, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_42_1'), 'casino', 'VIP Baccarat', '에볼루션',
 1000000, 1000000, 0, 2000000, 2000000,
 NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'win',
 '192.168.1.31', 'desktop', '-'),

-- 회원 45 (장하윤45)
(45, CONCAT('SL20250619', UNIX_TIMESTAMP(), '_45_1'), 'slot', 'Wolf Gold', '프라그마틱',
 200000, 100000, -100000, 500000, 400000,
 NOW() - INTERVAL 11 HOUR, NOW() - INTERVAL 10 HOUR, 'lose',
 '192.168.1.32', 'mobile', 'normal'),
(45, CONCAT('CA20250619', UNIX_TIMESTAMP(), '_45_2'), 'casino', 'Dragon Tiger', '에볼루션',
 150000, 300000, 150000, 400000, 550000,
 NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR, 'win',
 '192.168.1.32', 'mobile', '-');

-- 오늘 날짜 머니처리내역 (입출금) 데이터도 추가
INSERT INTO money_processing_history (
    member_id, transaction_type, amount, 
    before_balance, after_balance,
    bank_name, account_holder, account_number,
    status, request_date, complete_date
) VALUES
-- 회원 27 충전
(27, 'charge', 500000, 64973, 564973,
 'SC제일은행', '강현우', '663-961-94996-488',
 'completed', NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 11 HOUR),
 
-- 회원 30 충전
(30, 'charge', 300000, 115700, 415700,
 '우리은행', '신수민', '488-677-78127-607',
 'completed', NOW() - INTERVAL 13 HOUR, NOW() - INTERVAL 12 HOUR),

-- 회원 34 환전
(34, 'exchange', 200000, 947635, 747635,
 '농협은행', '황주원', '471-451-77437-464',
 'completed', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 30 MINUTE),

-- 회원 40 충전 (대박)
(40, 'charge', 1000000, 0, 1000000,
 '하나은행', '박민지', '123-456-789012',
 'completed', NOW() - INTERVAL 15 HOUR, NOW() - INTERVAL 14 HOUR),

-- 회원 40 환전 (대박 후)
(40, 'exchange', 1500000, 2500000, 1000000,
 '하나은행', '박민지', '123-456-789012',
 'completed', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR),

-- 회원 42 충전
(42, 'charge', 2000000, 0, 2000000,
 '국민은행', '최서준', '234-567-890123',
 'completed', NOW() - INTERVAL 14 HOUR, NOW() - INTERVAL 13 HOUR);