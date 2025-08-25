-- honor_profiles 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS honor_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    honor_user_code VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    last_synced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_id (user_id),
    UNIQUE KEY unique_honor_code (honor_user_code),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스 추가
CREATE INDEX idx_last_synced ON honor_profiles(last_synced_at);
CREATE INDEX idx_balance ON honor_profiles(balance);