-- 마스터 계정 IP 화이트리스트 테이블 생성
CREATE TABLE IF NOT EXISTS master_ip_whitelist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL COMMENT 'IPv4 또는 IPv6 주소',
    description VARCHAR(255) COMMENT 'IP 설명 (예: 본사 사무실)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    UNIQUE KEY unique_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='마스터 계정 접속 허용 IP 목록';

-- 기본 로컬 IP 추가
INSERT INTO master_ip_whitelist (ip_address, description, created_by) VALUES
('127.0.0.1', '로컬호스트', 'system'),
('::1', '로컬호스트 IPv6', 'system'),
('localhost', '로컬호스트 도메인', 'system');

-- IP 관리 로그 테이블
CREATE TABLE IF NOT EXISTS master_ip_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL COMMENT 'LOGIN_SUCCESS, LOGIN_BLOCKED, IP_ADDED, IP_REMOVED',
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='마스터 계정 IP 접근 로그';