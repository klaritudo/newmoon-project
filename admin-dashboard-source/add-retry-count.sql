-- honor_transactions 테이블에 retry_count 컬럼 추가
ALTER TABLE honor_transactions 
ADD COLUMN retry_count INT DEFAULT 0 AFTER status;

-- balance_discrepancy_log 테이블 생성 (잔액 불일치 기록)
CREATE TABLE IF NOT EXISTS balance_discrepancy_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  db_balance DECIMAL(15,2) NOT NULL,
  honor_balance DECIMAL(15,2) NOT NULL,
  difference DECIMAL(15,2) NOT NULL,
  transaction_id VARCHAR(100),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  resolved_by INT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_unresolved (resolved, created_at),
  FOREIGN KEY (user_id) REFERENCES members(id)
);