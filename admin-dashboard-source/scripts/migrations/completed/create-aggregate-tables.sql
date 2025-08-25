-- 성능 최적화를 위한 집계 테이블 생성

-- 1. 일별 회원 통계 집계
CREATE TABLE IF NOT EXISTS member_daily_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    stat_date DATE NOT NULL,
    -- 입출금 통계
    deposit_count INT DEFAULT 0,
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    withdrawal_count INT DEFAULT 0,
    withdrawal_amount DECIMAL(15,2) DEFAULT 0,
    -- 베팅 통계
    bet_count INT DEFAULT 0,
    bet_amount DECIMAL(15,2) DEFAULT 0,
    win_count INT DEFAULT 0,
    win_amount DECIMAL(15,2) DEFAULT 0,
    -- 손익 통계
    profit_loss DECIMAL(15,2) DEFAULT 0,
    -- 게임별 통계
    slot_bet_amount DECIMAL(15,2) DEFAULT 0,
    slot_win_amount DECIMAL(15,2) DEFAULT 0,
    casino_bet_amount DECIMAL(15,2) DEFAULT 0,
    casino_win_amount DECIMAL(15,2) DEFAULT 0,
    -- 롤링 통계
    rolling_amount DECIMAL(15,2) DEFAULT 0,
    -- 잔액 스냅샷
    start_balance DECIMAL(15,2) DEFAULT 0,
    end_balance DECIMAL(15,2) DEFAULT 0,
    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_member_date (member_id, stat_date),
    INDEX idx_stat_date (stat_date),
    INDEX idx_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 시간별 베팅 집계
CREATE TABLE IF NOT EXISTS betting_hourly_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_datetime DATETIME NOT NULL,
    game_type ENUM('slot', 'casino') NOT NULL,
    vendor VARCHAR(50),
    -- 베팅 통계
    bet_count INT DEFAULT 0,
    bet_amount DECIMAL(15,2) DEFAULT 0,
    win_count INT DEFAULT 0,
    win_amount DECIMAL(15,2) DEFAULT 0,
    -- 활성 사용자
    active_users INT DEFAULT 0,
    -- 수익률
    house_edge DECIMAL(5,2) DEFAULT 0, -- 하우스 엣지 %
    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stat_datetime (stat_datetime),
    INDEX idx_game_type (game_type),
    INDEX idx_vendor (vendor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 에이전트별 일별 집계
CREATE TABLE IF NOT EXISTS agent_daily_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    stat_date DATE NOT NULL,
    agent_level INT NOT NULL,
    -- 하위 회원 통계
    total_members INT DEFAULT 0,
    active_members INT DEFAULT 0, -- 당일 활동한 회원
    new_members INT DEFAULT 0, -- 신규 가입
    -- 베팅 통계 (하위 전체)
    total_bet_amount DECIMAL(15,2) DEFAULT 0,
    total_win_amount DECIMAL(15,2) DEFAULT 0,
    total_profit_loss DECIMAL(15,2) DEFAULT 0,
    -- 롤링 통계
    total_rolling_amount DECIMAL(15,2) DEFAULT 0,
    self_rolling_amount DECIMAL(15,2) DEFAULT 0, -- 본인이 받은 롤링
    -- 입출금 통계
    total_deposit DECIMAL(15,2) DEFAULT 0,
    total_withdrawal DECIMAL(15,2) DEFAULT 0,
    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_agent_date (agent_id, stat_date),
    INDEX idx_stat_date (stat_date),
    INDEX idx_agent_id (agent_id),
    INDEX idx_agent_level (agent_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 게임별 월별 통계
CREATE TABLE IF NOT EXISTS game_monthly_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_month VARCHAR(7) NOT NULL, -- 'YYYY-MM' 형식
    game_type ENUM('slot', 'casino') NOT NULL,
    vendor VARCHAR(50) NOT NULL,
    game_code VARCHAR(100),
    game_name VARCHAR(255),
    -- 베팅 통계
    bet_count INT DEFAULT 0,
    bet_amount DECIMAL(15,2) DEFAULT 0,
    win_count INT DEFAULT 0,
    win_amount DECIMAL(15,2) DEFAULT 0,
    -- 사용자 통계
    unique_players INT DEFAULT 0,
    -- 인기도
    popularity_score DECIMAL(10,2) DEFAULT 0,
    -- RTP (Return To Player)
    rtp DECIMAL(5,2) DEFAULT 0,
    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_game_month (stat_month, game_type, vendor, game_code),
    INDEX idx_stat_month (stat_month),
    INDEX idx_game_type (game_type),
    INDEX idx_vendor (vendor),
    INDEX idx_popularity (popularity_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 실시간 대시보드용 집계 (5분 단위)
CREATE TABLE IF NOT EXISTS realtime_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_time DATETIME NOT NULL,
    -- 전체 통계
    online_users INT DEFAULT 0,
    betting_users INT DEFAULT 0,
    -- 베팅 통계 (5분간)
    bet_count INT DEFAULT 0,
    bet_amount DECIMAL(15,2) DEFAULT 0,
    win_amount DECIMAL(15,2) DEFAULT 0,
    -- 입출금 통계 (5분간)
    deposit_count INT DEFAULT 0,
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    withdrawal_count INT DEFAULT 0,
    withdrawal_amount DECIMAL(15,2) DEFAULT 0,
    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stat_time (stat_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 머니 처리 일별 집계
CREATE TABLE IF NOT EXISTS money_daily_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL,
    processor_id INT, -- 처리자 ID
    -- 충전 통계
    charge_count INT DEFAULT 0,
    charge_amount DECIMAL(15,2) DEFAULT 0,
    charge_completed INT DEFAULT 0,
    charge_rejected INT DEFAULT 0,
    -- 환전 통계
    exchange_count INT DEFAULT 0,
    exchange_amount DECIMAL(15,2) DEFAULT 0,
    exchange_completed INT DEFAULT 0,
    exchange_rejected INT DEFAULT 0,
    -- 수동 처리 통계
    bonus_count INT DEFAULT 0,
    bonus_amount DECIMAL(15,2) DEFAULT 0,
    adjustment_count INT DEFAULT 0,
    adjustment_amount DECIMAL(15,2) DEFAULT 0,
    -- 평균 처리 시간 (분)
    avg_process_time INT DEFAULT 0,
    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_processor_date (processor_id, stat_date),
    INDEX idx_stat_date (stat_date),
    INDEX idx_processor_id (processor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;