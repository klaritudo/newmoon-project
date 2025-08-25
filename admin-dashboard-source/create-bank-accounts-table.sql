-- bank_accounts 테이블 생성
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) NOT NULL COMMENT '은행명',
  `account_number` varchar(50) NOT NULL COMMENT '계좌번호',
  `account_holder` varchar(100) NOT NULL COMMENT '예금주',
  `description` text DEFAULT NULL COMMENT '설명',
  `display_order` int(11) NOT NULL DEFAULT 0 COMMENT '표시 순서',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='은행 계좌 정보';

-- 초기 데이터 삽입 (선택사항)
INSERT INTO `bank_accounts` (`bank_name`, `account_number`, `account_holder`, `description`, `display_order`) VALUES
('국민은행', '123-456-789012', '홍길동', '주 거래 계좌', 1),
('신한은행', '987-654-321098', '홍길동', '보조 계좌', 2),
('우리은행', '456-789-123456', '홍길동', '예비 계좌', 3);

-- 테이블 생성 확인
SELECT 'bank_accounts 테이블이 생성되었습니다.' AS message;
SHOW CREATE TABLE bank_accounts;