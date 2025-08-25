-- 변경 이력 추적을 위한 테이블 생성

-- 1. 회원 정보 변경 이력
CREATE TABLE IF NOT EXISTS member_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    action_type ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'BALANCE_CHANGE') NOT NULL,
    changed_by INT, -- 변경한 관리자 ID
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSON, -- 변경 전 값들
    new_values JSON, -- 변경 후 값들
    ip_address VARCHAR(45),
    user_agent TEXT,
    notes TEXT,
    INDEX idx_member_id (member_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_action_type (action_type),
    INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 잔액 변경 이력 (상세)
CREATE TABLE IF NOT EXISTS balance_change_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    transaction_id VARCHAR(100),
    change_type ENUM('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'ADJUSTMENT', 'ROLLING', 'TRANSFER') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    before_balance DECIMAL(15,2) NOT NULL,
    after_balance DECIMAL(15,2) NOT NULL,
    related_id BIGINT, -- 관련 테이블의 ID (betting_details.id, money_processing_history.id 등)
    related_type VARCHAR(50), -- 관련 테이블 타입
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    notes TEXT,
    INDEX idx_member_id (member_id),
    INDEX idx_created_at (created_at),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_change_type (change_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 베팅 변경 이력
CREATE TABLE IF NOT EXISTS betting_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    betting_detail_id BIGINT NOT NULL,
    action_type ENUM('CREATE', 'UPDATE', 'CANCEL', 'SETTLE') NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100), -- API 또는 관리자
    reason TEXT,
    INDEX idx_betting_detail_id (betting_detail_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 설정 변경 이력
CREATE TABLE IF NOT EXISTS settings_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_type VARCHAR(50) NOT NULL, -- 'agent_level', 'game_setting', 'system_setting' 등
    setting_id INT,
    action_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    notes TEXT,
    INDEX idx_setting_type (setting_type),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 로그인/접속 이력
CREATE TABLE IF NOT EXISTS access_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('MEMBER', 'ADMIN') NOT NULL,
    action_type ENUM('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'SESSION_EXPIRED') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_info JSON,
    location_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action_type (action_type),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. API 호출 이력
CREATE TABLE IF NOT EXISTS api_call_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_type VARCHAR(50) NOT NULL, -- 'honor', 'internal' 등
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_data JSON,
    response_data JSON,
    status_code INT,
    error_message TEXT,
    duration_ms INT, -- 응답 시간
    member_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_type (api_type),
    INDEX idx_created_at (created_at),
    INDEX idx_member_id (member_id),
    INDEX idx_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;