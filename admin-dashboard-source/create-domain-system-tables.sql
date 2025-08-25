-- 도메인 관리 시스템 테이블 생성

-- 1. 도메인 테이블
CREATE TABLE IF NOT EXISTS domains (
    id INT NOT NULL AUTO_INCREMENT,
    domain_type ENUM('admin', 'user') NOT NULL COMMENT '도메인 타입 (관리자/유저)',
    url VARCHAR(255) NOT NULL COMMENT '도메인 URL',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_url (url),
    KEY idx_domain_type (domain_type),
    KEY idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='도메인 설정';

-- 2. 도메인 권한 테이블 (관리자 도메인에 접속 가능한 에이전트 레벨 설정)
CREATE TABLE IF NOT EXISTS domain_permissions (
    id INT NOT NULL AUTO_INCREMENT,
    domain_id INT NOT NULL COMMENT '도메인 ID',
    agent_level_id INT NOT NULL COMMENT '에이전트 레벨 ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_domain_level (domain_id, agent_level_id),
    KEY idx_domain_id (domain_id),
    KEY idx_agent_level_id (agent_level_id),
    CONSTRAINT fk_domain_permissions_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    CONSTRAINT fk_domain_permissions_level FOREIGN KEY (agent_level_id) REFERENCES agent_levels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='도메인별 접속 권한';

-- 3. 도메인 권한 위임 테이블 (1단계 회원이 하위 회원에게 도메인 권한 위임)
CREATE TABLE IF NOT EXISTS domain_permissions_delegation (
    id INT NOT NULL AUTO_INCREMENT,
    grantor_id INT NOT NULL COMMENT '권한을 위임하는 회원 ID (1단계)',
    grantee_id INT NOT NULL COMMENT '권한을 받는 회원 ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_grantor (grantor_id),
    KEY idx_grantee (grantee_id),
    CONSTRAINT fk_delegation_grantor FOREIGN KEY (grantor_id) REFERENCES members(id) ON DELETE CASCADE,
    CONSTRAINT fk_delegation_grantee FOREIGN KEY (grantee_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='도메인 권한 위임';

-- 4. 회원별 도메인 설정 테이블
CREATE TABLE IF NOT EXISTS member_domains (
    id INT NOT NULL AUTO_INCREMENT,
    member_id INT NOT NULL COMMENT '회원 ID',
    domain_id INT NOT NULL COMMENT '도메인 ID',
    is_primary TINYINT(1) NOT NULL DEFAULT 0 COMMENT '기본 도메인 여부',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_member_domain (member_id, domain_id),
    KEY idx_member_id (member_id),
    KEY idx_domain_id (domain_id),
    KEY idx_primary (member_id, is_primary),
    CONSTRAINT fk_member_domains_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_domains_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원별 도메인 설정';

-- 5. 도메인 접속 로그 테이블
CREATE TABLE IF NOT EXISTS domain_access_logs (
    id INT NOT NULL AUTO_INCREMENT,
    domain_id INT NOT NULL COMMENT '도메인 ID',
    member_id INT COMMENT '회원 ID (NULL = 비회원)',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP 주소',
    user_agent TEXT COMMENT 'User Agent',
    referer TEXT COMMENT 'Referer',
    access_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_domain_id (domain_id),
    KEY idx_member_id (member_id),
    KEY idx_access_time (access_time),
    KEY idx_ip_address (ip_address),
    CONSTRAINT fk_access_logs_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_logs_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='도메인 접속 로그';

-- 6. 시스템 설정에 도메인 관련 설정 추가 (이미 있다면 무시)
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('domain_setting_level', '0', '도메인 설정 가능 단계 (0=설정안함)'),
('allow_multiple_domains', '1', '회원당 복수 도메인 허용 여부'),
('domain_access_log_retention_days', '30', '도메인 접속 로그 보관 기간(일)');

-- 초기 샘플 데이터 (필요시 주석 해제)
/*
-- 관리자 도메인 샘플
INSERT INTO domains (domain_type, url) VALUES
('admin', 'https://admin.newmoon.com'),
('admin', 'https://manage.newmoon.com');

-- 유저 도메인 샘플
INSERT INTO domains (domain_type, url) VALUES
('user', 'https://www.newmoon.com'),
('user', 'https://m.newmoon.com'),
('user', 'https://app.newmoon.com');

-- 관리자 도메인 권한 설정 샘플 (1,2,3단계만 접속 가능)
INSERT INTO domain_permissions (domain_id, agent_level_id)
SELECT d.id, al.id
FROM domains d
CROSS JOIN agent_levels al
WHERE d.domain_type = 'admin' 
AND al.level IN (1, 2, 3);
*/