-- 시스템 설정 테이블 생성
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL COMMENT '설정 키',
    setting_value TEXT COMMENT '설정 값',
    description TEXT COMMENT '설정 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='시스템 설정 테이블';

-- API 연동 레벨 설정 추가 (기본값: 0 = 연동 안함)
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('api_sync_level', '0', 'API 연동 레벨 (0: 연동 안함, 1: 1단계만, 2: 2단계까지)')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- members 테이블에 is_api_synced 컬럼 추가
ALTER TABLE members 
ADD COLUMN is_api_synced BOOLEAN DEFAULT FALSE COMMENT 'API 잔액 연동 여부' AFTER is_top_level;

-- 확인
SELECT * FROM system_settings WHERE setting_key = 'api_sync_level';
DESCRIBE members;