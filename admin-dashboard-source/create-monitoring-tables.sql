-- 사용자 활동 로그 테이블
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_activity (user_id, created_at),
  INDEX idx_activity_type (activity_type, created_at),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 보안 로그 테이블
CREATE TABLE IF NOT EXISTS security_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id INT,
  details JSON,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type, created_at),
  INDEX idx_user_security (user_id, created_at),
  INDEX idx_severity (severity, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 트랜잭션 로그 테이블 (고액 거래용)
CREATE TABLE IF NOT EXISTS transaction_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_transaction (user_id, created_at),
  INDEX idx_transaction_type (transaction_type, created_at),
  INDEX idx_amount (amount, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 모니터링 알림 테이블
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  details JSON,
  severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INT,
  acknowledged_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alert_type (alert_type, created_at),
  INDEX idx_severity_ack (severity, acknowledged, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API 성능 로그 테이블
CREATE TABLE IF NOT EXISTS api_performance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  response_time INT NOT NULL,
  user_id INT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_endpoint_method (endpoint, method, created_at),
  INDEX idx_response_time (response_time, created_at),
  INDEX idx_status_code (status_code, created_at),
  INDEX idx_created_hour (created_at, HOUR(created_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 시스템 메트릭 로그 테이블
CREATE TABLE IF NOT EXISTS system_metrics_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cpu_usage FLOAT,
  memory_usage FLOAT,
  memory_total BIGINT,
  memory_used BIGINT,
  memory_free BIGINT,
  load_average JSON,
  active_connections INT,
  socket_connections INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_cpu_memory (cpu_usage, memory_usage, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 에러 로그 테이블
CREATE TABLE IF NOT EXISTS error_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  error_type VARCHAR(100),
  error_message TEXT,
  error_stack TEXT,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  user_id INT,
  ip_address VARCHAR(45),
  request_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_error_type (error_type, created_at),
  INDEX idx_user_error (user_id, created_at),
  INDEX idx_endpoint_error (endpoint, method, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 일일 통계 집계 테이블
CREATE TABLE IF NOT EXISTS daily_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_date DATE NOT NULL,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  total_logins INT DEFAULT 0,
  total_requests INT DEFAULT 0,
  total_errors INT DEFAULT 0,
  avg_response_time FLOAT,
  peak_cpu_usage FLOAT,
  peak_memory_usage FLOAT,
  total_transactions INT DEFAULT 0,
  total_transaction_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_stat_date (stat_date),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 파티셔닝 설정 (대용량 로그 처리용)
-- 월별 파티션 예시 (필요시 활성화)
/*
ALTER TABLE user_activity_logs
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p202501 VALUES LESS THAN (TO_DAYS('2025-02-01')),
  PARTITION p202502 VALUES LESS THAN (TO_DAYS('2025-03-01')),
  PARTITION p202503 VALUES LESS THAN (TO_DAYS('2025-04-01')),
  PARTITION p202504 VALUES LESS THAN (TO_DAYS('2025-05-01')),
  PARTITION p202505 VALUES LESS THAN (TO_DAYS('2025-06-01')),
  PARTITION p202506 VALUES LESS THAN (TO_DAYS('2025-07-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
*/