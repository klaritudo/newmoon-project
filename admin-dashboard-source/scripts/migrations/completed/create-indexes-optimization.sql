-- ========================================
-- Database Index Optimization Script
-- For newmoon Database
-- Created: 2025-06-22
-- ========================================

-- 이 스크립트는 newmoon 데이터베이스의 성능 최적화를 위한 인덱스를 생성합니다.
-- 실행 전 백업을 권장합니다.

USE newmoon;

-- ========================================
-- 1. 기존 인덱스 확인 스크립트
-- ========================================

-- 특정 테이블의 인덱스 확인 (예: members 테이블)
-- SHOW INDEX FROM members;

-- 모든 테이블의 인덱스 상태 확인
SELECT 
    table_name,
    index_name,
    column_name,
    seq_in_index,
    non_unique,
    cardinality
FROM information_schema.statistics
WHERE table_schema = 'newmoon'
ORDER BY table_name, index_name, seq_in_index;

-- ========================================
-- 2. MEMBERS 테이블 인덱스 최적화
-- ========================================

-- 2.1 username 검색 최적화 (로그인, 회원 검색)
CREATE INDEX IF NOT EXISTS idx_members_username 
ON members(username);

-- 2.2 userId 검색 최적화 (unique 제약조건이 없다면)
CREATE INDEX IF NOT EXISTS idx_members_userId 
ON members(userId);

-- 2.3 parentId 검색 최적화 (계층 구조 탐색)
CREATE INDEX IF NOT EXISTS idx_members_parentId 
ON members(parentId);

-- 2.4 agent_level_id 검색 최적화 (에이전트 타입별 조회)
CREATE INDEX IF NOT EXISTS idx_members_agent_level_id 
ON members(agent_level_id);

-- 2.5 복합 인덱스: parentId + agent_level_id (계층별 타입 조회)
CREATE INDEX IF NOT EXISTS idx_members_parent_agent 
ON members(parentId, agent_level_id);

-- 2.6 복합 인덱스: username + status (활성 사용자 로그인)
CREATE INDEX IF NOT EXISTS idx_members_username_status 
ON members(username, status);

-- 2.7 created_at 인덱스 (신규 회원 조회)
CREATE INDEX IF NOT EXISTS idx_members_created_at 
ON members(created_at);

-- 2.8 is_api_synced 인덱스 (API 연동 회원 관리)
CREATE INDEX IF NOT EXISTS idx_members_api_synced 
ON members(is_api_synced);

-- ========================================
-- 3. BETTING_DETAILS 테이블 인덱스 최적화
-- ========================================

-- 3.1 memberId 검색 최적화 (회원별 베팅 내역)
CREATE INDEX IF NOT EXISTS idx_betting_memberId 
ON betting_details(memberId);

-- 3.2 betTime 검색 최적화 (시간순 정렬, 날짜 범위 검색)
CREATE INDEX IF NOT EXISTS idx_betting_betTime 
ON betting_details(betTime);

-- 3.3 status 검색 최적화 (상태별 필터링)
CREATE INDEX IF NOT EXISTS idx_betting_status 
ON betting_details(status);

-- 3.4 복합 인덱스: memberId + betTime (회원별 시간순 조회)
CREATE INDEX IF NOT EXISTS idx_betting_member_time 
ON betting_details(memberId, betTime DESC);

-- 3.5 복합 인덱스: status + betTime (상태별 최신 베팅)
CREATE INDEX IF NOT EXISTS idx_betting_status_time 
ON betting_details(status, betTime DESC);

-- 3.6 gameType 인덱스 (게임 유형별 통계)
CREATE INDEX IF NOT EXISTS idx_betting_gameType 
ON betting_details(gameType);

-- 3.7 복합 인덱스: memberId + status + betTime (회원별 상태 필터링)
CREATE INDEX IF NOT EXISTS idx_betting_member_status_time 
ON betting_details(memberId, status, betTime DESC);

-- 3.8 vendor 인덱스 (벤더별 통계)
CREATE INDEX IF NOT EXISTS idx_betting_vendor 
ON betting_details(vendor);

-- ========================================
-- 4. MONEY_PROCESSING_HISTORY 테이블 인덱스 최적화
-- ========================================

-- 4.1 member_id 검색 최적화
CREATE INDEX IF NOT EXISTS idx_money_proc_member_id 
ON money_processing_history(member_id);

-- 4.2 processedTime 검색 최적화 (시간순 정렬)
CREATE INDEX IF NOT EXISTS idx_money_proc_processed_time 
ON money_processing_history(process_date);

-- 4.3 transactionType 검색 최적화
CREATE INDEX IF NOT EXISTS idx_money_proc_transaction_type 
ON money_processing_history(transaction_type);

-- 4.4 복합 인덱스: member_id + processedTime
CREATE INDEX IF NOT EXISTS idx_money_proc_member_time 
ON money_processing_history(member_id, process_date DESC);

-- 4.5 status 인덱스 (처리 상태별 조회)
CREATE INDEX IF NOT EXISTS idx_money_proc_status 
ON money_processing_history(status);

-- 4.6 복합 인덱스: status + processedTime (대기중인 요청 조회)
CREATE INDEX IF NOT EXISTS idx_money_proc_status_time 
ON money_processing_history(status, process_date DESC);

-- 4.7 processed_by 인덱스 (처리자별 내역)
CREATE INDEX IF NOT EXISTS idx_money_proc_processed_by 
ON money_processing_history(processed_by);

-- 4.8 request_date 인덱스 (요청 시간별 조회)
CREATE INDEX IF NOT EXISTS idx_money_proc_request_date 
ON money_processing_history(request_date);

-- ========================================
-- 5. BALANCE_CHANGE_LOG 테이블 인덱스 최적화
-- ========================================

-- 5.1 member_id 검색 최적화
CREATE INDEX IF NOT EXISTS idx_balance_change_member_id 
ON balance_change_log(member_id);

-- 5.2 created_at 검색 최적화
CREATE INDEX IF NOT EXISTS idx_balance_change_created_at 
ON balance_change_log(created_at);

-- 5.3 복합 인덱스: member_id + created_at
CREATE INDEX IF NOT EXISTS idx_balance_change_member_time 
ON balance_change_log(member_id, created_at DESC);

-- 5.4 change_type 인덱스
CREATE INDEX IF NOT EXISTS idx_balance_change_type 
ON balance_change_log(change_type);

-- 5.5 transaction_id 인덱스 (거래 추적)
CREATE INDEX IF NOT EXISTS idx_balance_change_transaction 
ON balance_change_log(transaction_id);

-- 5.6 복합 인덱스: member_id + change_type + created_at
CREATE INDEX IF NOT EXISTS idx_balance_change_member_type_time 
ON balance_change_log(member_id, change_type, created_at DESC);

-- ========================================
-- 6. MEMBER_DAILY_STATS 테이블 인덱스 최적화
-- ========================================

-- 6.1 member_id 검색 최적화
CREATE INDEX IF NOT EXISTS idx_daily_stats_member_id 
ON member_daily_stats(member_id);

-- 6.2 stat_date 검색 최적화
CREATE INDEX IF NOT EXISTS idx_daily_stats_date 
ON member_daily_stats(stat_date);

-- 6.3 복합 인덱스: member_id + stat_date (이미 UNIQUE KEY로 존재할 가능성 있음)
-- CREATE UNIQUE INDEX IF NOT EXISTS uk_member_date 
-- ON member_daily_stats(member_id, stat_date);

-- ========================================
-- 7. MONEY_TRANSFER_HISTORY 테이블 인덱스 최적화
-- ========================================

-- 7.1 from_member_id 인덱스
CREATE INDEX IF NOT EXISTS idx_money_transfer_from_member 
ON money_transfer_history(from_member_id);

-- 7.2 to_member_id 인덱스
CREATE INDEX IF NOT EXISTS idx_money_transfer_to_member 
ON money_transfer_history(to_member_id);

-- 7.3 transfer_date 인덱스
CREATE INDEX IF NOT EXISTS idx_money_transfer_date 
ON money_transfer_history(transfer_date);

-- 7.4 복합 인덱스: from_member_id + transfer_date
CREATE INDEX IF NOT EXISTS idx_money_transfer_from_date 
ON money_transfer_history(from_member_id, transfer_date DESC);

-- 7.5 복합 인덱스: to_member_id + transfer_date
CREATE INDEX IF NOT EXISTS idx_money_transfer_to_date 
ON money_transfer_history(to_member_id, transfer_date DESC);

-- 7.6 transfer_type 인덱스
CREATE INDEX IF NOT EXISTS idx_money_transfer_type 
ON money_transfer_history(transfer_type);

-- 7.7 status 인덱스
CREATE INDEX IF NOT EXISTS idx_money_transfer_status 
ON money_transfer_history(status);

-- ========================================
-- 8. TRANSACTIONS 테이블 인덱스 최적화
-- ========================================

-- 8.1 user_id 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
ON transactions(user_id);

-- 8.2 created_at 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
ON transactions(created_at);

-- 8.3 type 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON transactions(type);

-- 8.4 status 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_status 
ON transactions(status);

-- 8.5 복합 인덱스: user_id + created_at
CREATE INDEX IF NOT EXISTS idx_transactions_user_time 
ON transactions(user_id, created_at DESC);

-- 8.6 복합 인덱스: status + created_at (대기중인 거래 조회)
CREATE INDEX IF NOT EXISTS idx_transactions_status_time 
ON transactions(status, created_at DESC);

-- 8.7 processed_by 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_processed_by 
ON transactions(processed_by);

-- ========================================
-- 9. 추가 권장 인덱스 (기타 중요 테이블)
-- ========================================

-- 9.1 agent_levels 테이블
CREATE INDEX IF NOT EXISTS idx_agent_levels_is_top 
ON agent_levels(is_top_level);

-- 9.2 settlement_daily 테이블 (있는 경우)
CREATE INDEX IF NOT EXISTS idx_settlement_member_date 
ON settlement_daily(member_id, settlement_date);

-- 9.3 rolling_history 테이블 (있는 경우)
CREATE INDEX IF NOT EXISTS idx_rolling_member_date 
ON rolling_history(member_id, created_at);

-- ========================================
-- 10. 인덱스 통계 업데이트
-- ========================================

-- 각 테이블의 인덱스 통계를 업데이트하여 쿼리 옵티마이저가 최적의 실행 계획을 수립하도록 함
ANALYZE TABLE members;
ANALYZE TABLE betting_details;
ANALYZE TABLE money_processing_history;
ANALYZE TABLE balance_change_log;
ANALYZE TABLE member_daily_stats;
ANALYZE TABLE money_transfer_history;
ANALYZE TABLE transactions;

-- ========================================
-- 11. 인덱스 생성 후 확인
-- ========================================

-- 생성된 인덱스 확인
SELECT 
    table_name AS '테이블명',
    index_name AS '인덱스명',
    GROUP_CONCAT(column_name ORDER BY seq_in_index) AS '컬럼',
    CASE non_unique 
        WHEN 0 THEN 'UNIQUE' 
        ELSE 'NON-UNIQUE' 
    END AS '유형',
    cardinality AS '카디널리티'
FROM information_schema.statistics
WHERE table_schema = 'newmoon'
    AND table_name IN (
        'members', 
        'betting_details', 
        'money_processing_history', 
        'balance_change_log', 
        'member_daily_stats',
        'money_transfer_history',
        'transactions'
    )
GROUP BY table_name, index_name
ORDER BY table_name, index_name;

-- ========================================
-- 12. 성능 모니터링 쿼리
-- ========================================

-- 인덱스 사용 통계 확인 (MySQL 8.0+)
-- SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage
-- WHERE object_schema = 'newmoon'
-- ORDER BY sum_timer_wait DESC
-- LIMIT 20;

-- 느린 쿼리 로그 활성화 (필요시)
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 1;

-- ========================================
-- 주의사항:
-- 1. 인덱스 생성은 대량의 데이터가 있는 경우 시간이 오래 걸릴 수 있습니다.
-- 2. 트래픽이 적은 시간대에 실행하는 것을 권장합니다.
-- 3. 인덱스가 많으면 INSERT/UPDATE 성능이 저하될 수 있으므로 필요한 인덱스만 생성하세요.
-- 4. 정기적으로 인덱스 사용 통계를 확인하고 사용되지 않는 인덱스는 제거하세요.
-- ========================================