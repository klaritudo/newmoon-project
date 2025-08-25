-- agent_level별 계좌 설정 테이블 생성
CREATE TABLE IF NOT EXISTS agent_level_accounts (
  id INT NOT NULL AUTO_INCREMENT,
  agent_level_id INT NOT NULL,
  bank_name VARCHAR(100) NULL COMMENT '은행명',
  account_number VARCHAR(50) NULL COMMENT '계좌번호',
  account_holder VARCHAR(100) NULL COMMENT '예금주',
  auto_reply TEXT NULL COMMENT '자동답변 내용',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_agent_level (agent_level_id),
  CONSTRAINT fk_agent_level_accounts_level FOREIGN KEY (agent_level_id) REFERENCES agent_levels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='에이전트 레벨별 계좌 설정';