-- 오늘 날짜의 테스트 베팅 데이터 생성
-- betting_details 테이블에 슬롯과 카지노 베팅 내역 추가

-- 슬롯 베팅 데이터 (회원 ID 39-108 대상)
INSERT INTO betting_details (
    member_id, betting_id, game_type, game_name, game_company,
    bet_amount, win_amount, profit_loss, 
    before_balance, after_balance,
    betting_time, result_time, status,
    ip_address, device_type
) VALUES
-- 회원 39 (대본23)
(39, CONCAT('BET_', UNIX_TIMESTAMP(), '_39_1'), 'slot', '스타버스트', 'NetEnt', 
 50000, 35000, -15000, 1000000, 985000,
 NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 'lose',
 '192.168.1.10', 'mobile'),
(39, CONCAT('BET_', UNIX_TIMESTAMP(), '_39_2'), 'slot', '북 오브 데드', 'Play n GO',
 100000, 120000, 20000, 985000, 1005000,
 NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 'win',
 '192.168.1.10', 'mobile'),

-- 회원 40 (대본24)
(40, CONCAT('BET_', UNIX_TIMESTAMP(), '_40_1'), 'casino', '바카라', 'Evolution',
 200000, 180000, -20000, 2000000, 1980000,
 NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR, 'lose',
 '192.168.1.11', 'desktop'),
(40, CONCAT('BET_', UNIX_TIMESTAMP(), '_40_2'), 'casino', '블랙잭', 'Evolution',
 150000, 300000, 150000, 1980000, 2130000,
 NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 'win',
 '192.168.1.11', 'desktop'),

-- 회원 41 (부본25)
(41, CONCAT('BET_', UNIX_TIMESTAMP(), '_41_1'), 'slot', '스위트 보난자', 'Pragmatic Play',
 80000, 60000, -20000, 1500000, 1480000,
 NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'lose',
 '192.168.1.12', 'mobile'),
(41, CONCAT('BET_', UNIX_TIMESTAMP(), '_41_2'), 'slot', '게이츠 오브 올림푸스', 'Pragmatic Play',
 120000, 150000, 30000, 1480000, 1510000,
 NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 'win',
 '192.168.1.12', 'mobile'),

-- 회원 42 (부본26)
(42, CONCAT('BET_', UNIX_TIMESTAMP(), '_42_1'), 'casino', '룰렛', 'Evolution',
 100000, 0, -100000, 1200000, 1100000,
 NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR, 'lose',
 '192.168.1.13', 'desktop'),
(42, CONCAT('BET_', UNIX_TIMESTAMP(), '_42_2'), 'casino', '바카라', 'Evolution',
 150000, 150000, 0, 1100000, 1100000,
 NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR, 'win',
 '192.168.1.13', 'desktop'),

-- 회원 51 (일반회원51) - 더 많은 베팅
(51, CONCAT('BET_', UNIX_TIMESTAMP(), '_51_1'), 'slot', '빅 배스 보난자', 'Pragmatic Play',
 30000, 25000, -5000, 500000, 495000,
 NOW() - INTERVAL 7 HOUR, NOW() - INTERVAL 6 HOUR, 'lose',
 '192.168.1.20', 'mobile'),
(51, CONCAT('BET_', UNIX_TIMESTAMP(), '_51_2'), 'slot', '스타라이트 프린세스', 'Pragmatic Play',
 40000, 60000, 20000, 495000, 515000,
 NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'win',
 '192.168.1.20', 'mobile'),
(51, CONCAT('BET_', UNIX_TIMESTAMP(), '_51_3'), 'slot', '와일드 웨스트 골드', 'Pragmatic Play',
 50000, 30000, -20000, 515000, 495000,
 NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 'lose',
 '192.168.1.20', 'mobile'),

-- 회원 52 (일반회원52)
(52, CONCAT('BET_', UNIX_TIMESTAMP(), '_52_1'), 'casino', '바카라', 'Evolution',
 80000, 160000, 80000, 600000, 680000,
 NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR, 'win',
 '192.168.1.21', 'desktop'),
(52, CONCAT('BET_', UNIX_TIMESTAMP(), '_52_2'), 'casino', '블랙잭', 'Evolution',
 100000, 50000, -50000, 680000, 630000,
 NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR, 'lose',
 '192.168.1.21', 'desktop'),

-- 회원 63 (일반회원63) - 큰 금액 베팅
(63, CONCAT('BET_', UNIX_TIMESTAMP(), '_63_1'), 'slot', '메가 물라', 'Microgaming',
 500000, 450000, -50000, 5000000, 4950000,
 NOW() - INTERVAL 10 HOUR, NOW() - INTERVAL 9 HOUR, 'lose',
 '192.168.1.30', 'desktop'),
(63, CONCAT('BET_', UNIX_TIMESTAMP(), '_63_2'), 'slot', '메가 포춘', 'NetEnt',
 300000, 600000, 300000, 4950000, 5250000,
 NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR, 'win',
 '192.168.1.30', 'desktop'),
(63, CONCAT('BET_', UNIX_TIMESTAMP(), '_63_3'), 'casino', 'VIP 바카라', 'Evolution',
 1000000, 1000000, 0, 5250000, 5250000,
 NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'win',
 '192.168.1.30', 'desktop'),

-- 회원 64 (일반회원64)
(64, CONCAT('BET_', UNIX_TIMESTAMP(), '_64_1'), 'casino', '라이트닝 룰렛', 'Evolution',
 200000, 100000, -100000, 2000000, 1900000,
 NOW() - INTERVAL 11 HOUR, NOW() - INTERVAL 10 HOUR, 'lose',
 '192.168.1.31', 'mobile'),
(64, CONCAT('BET_', UNIX_TIMESTAMP(), '_64_2'), 'casino', '드래곤 타이거', 'Evolution',
 150000, 300000, 150000, 1900000, 2050000,
 NOW() - INTERVAL 9 HOUR, NOW() - INTERVAL 8 HOUR, 'win',
 '192.168.1.31', 'mobile');

-- 머니처리내역 (입출금) 데이터도 추가
INSERT INTO money_processing_history (
    member_id, transaction_type, amount, 
    before_balance, after_balance,
    bank_name, account_holder, account_number,
    status, request_date, complete_date
) VALUES
-- 회원 39 충전
(39, 'charge', 1000000, 0, 1000000,
 '국민은행', '대본23', '123-456-789012',
 'completed', NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 11 HOUR),
 
-- 회원 40 충전
(40, 'charge', 2000000, 0, 2000000,
 '우리은행', '대본24', '234-567-890123',
 'completed', NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 11 HOUR),

-- 회원 41 충전
(41, 'charge', 1500000, 0, 1500000,
 '신한은행', '부본25', '345-678-901234',
 'completed', NOW() - INTERVAL 13 HOUR, NOW() - INTERVAL 12 HOUR),

-- 회원 51 환전
(51, 'exchange', 200000, 695000, 495000,
 '하나은행', '일반회원51', '456-789-012345',
 'completed', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 30 MINUTE),

-- 회원 63 충전
(63, 'charge', 5000000, 0, 5000000,
 'KB국민은행', '일반회원63', '567-890-123456',
 'completed', NOW() - INTERVAL 15 HOUR, NOW() - INTERVAL 14 HOUR),

-- 회원 63 환전
(63, 'exchange', 1000000, 6250000, 5250000,
 'KB국민은행', '일반회원63', '567-890-123456',
 'completed', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR);