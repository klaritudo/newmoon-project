-- 도메인 설정 테이블 생성
CREATE TABLE IF NOT EXISTS domains (
  id INT NOT NULL AUTO_INCREMENT,
  type ENUM('distributor', 'operator', 'agent', 'member') NOT NULL COMMENT '도메인 타입',
  url VARCHAR(255) NOT NULL COMMENT '도메인 URL',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_url (url),
  KEY idx_type (type),
  KEY idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='도메인 설정';

-- 초기 데이터 삽입 (예시)
INSERT INTO domains (type, url) VALUES
('distributor', 'https://distributor.example.com'),
('operator', 'https://operator.example.com'),
('agent', 'https://agent.example.com'),
('member', 'https://www.example.com'),
('member', 'https://m.example.com');