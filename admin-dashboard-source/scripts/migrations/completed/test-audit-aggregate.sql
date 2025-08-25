-- 변경 이력 추적 및 집계 테이블 테스트 SQL

-- 1. 테이블 존재 확인
SELECT '=== 테이블 존재 확인 ===' as test_section;
SELECT 
    TABLE_NAME,
    TABLE_COMMENT,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'newmoon' 
AND TABLE_NAME IN (
    'member_audit_log',
    'balance_change_log',
    'betting_audit_log',
    'settings_audit_log',
    'access_log',
    'api_call_log',
    'member_daily_stats',
    'betting_hourly_stats',
    'agent_daily_stats',
    'game_monthly_stats',
    'realtime_stats',
    'money_daily_stats'
);

-- 2. 변경 이력 테스트 데이터 삽입
SELECT '=== 변경 이력 테스트 ===' as test_section;

-- 회원 변경 이력 테스트
INSERT INTO member_audit_log (
    member_id, action_type, changed_by, 
    old_values, new_values, notes
) VALUES (
    1, 'UPDATE', 1,
    '{"balance": 100000, "status": "active"}',
    '{"balance": 150000, "status": "active"}',
    '테스트: 잔액 변경'
);

-- 잔액 변경 이력 테스트
INSERT INTO balance_change_log (
    member_id, transaction_id, change_type, 
    amount, before_balance, after_balance, notes
) VALUES (
    1, 'TEST_001', 'DEPOSIT', 
    50000, 100000, 150000, '테스트 입금'
);

-- 최근 변경 이력 조회
SELECT * FROM member_audit_log ORDER BY changed_at DESC LIMIT 5;
SELECT * FROM balance_change_log ORDER BY created_at DESC LIMIT 5;

-- 3. 집계 데이터 테스트
SELECT '=== 집계 데이터 테스트 ===' as test_section;

-- 오늘 날짜 회원 통계 생성
INSERT INTO member_daily_stats (
    member_id, stat_date, 
    deposit_count, deposit_amount,
    bet_count, bet_amount,
    win_count, win_amount,
    profit_loss
) VALUES (
    1, CURDATE(),
    2, 200000,
    10, 100000,
    3, 80000,
    -20000
) ON DUPLICATE KEY UPDATE
    deposit_count = VALUES(deposit_count),
    deposit_amount = VALUES(deposit_amount);

-- 실시간 통계 생성
INSERT INTO realtime_stats (
    stat_time, online_users, betting_users,
    bet_count, bet_amount, win_amount,
    deposit_count, deposit_amount
) VALUES (
    NOW(), 50, 30,
    100, 1000000, 800000,
    5, 500000
);

-- 집계 데이터 조회
SELECT '오늘 회원 통계:' as info;
SELECT * FROM member_daily_stats WHERE stat_date = CURDATE();

SELECT '최근 실시간 통계:' as info;
SELECT * FROM realtime_stats ORDER BY stat_time DESC LIMIT 5;

-- 4. 트리거 테스트 (있는 경우)
SELECT '=== 트리거 확인 ===' as test_section;
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'newmoon';

-- 5. 인덱스 확인
SELECT '=== 인덱스 확인 ===' as test_section;
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'newmoon'
AND TABLE_NAME IN ('balance_change_log', 'member_daily_stats')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 6. 집계 통계 요약
SELECT '=== 집계 통계 요약 ===' as test_section;
SELECT 
    COUNT(DISTINCT member_id) as total_members,
    SUM(deposit_amount) as total_deposits,
    SUM(bet_amount) as total_bets,
    SUM(win_amount) as total_wins,
    SUM(profit_loss) as total_profit_loss
FROM member_daily_stats
WHERE stat_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);

-- 7. 성능 테스트 쿼리
SELECT '=== 성능 테스트 ===' as test_section;
EXPLAIN SELECT 
    m.username,
    mds.stat_date,
    mds.bet_amount,
    mds.win_amount,
    mds.profit_loss
FROM member_daily_stats mds
INNER JOIN members m ON mds.member_id = m.id
WHERE mds.stat_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY mds.stat_date DESC;