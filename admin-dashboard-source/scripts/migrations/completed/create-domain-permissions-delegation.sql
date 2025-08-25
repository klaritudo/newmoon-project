-- 도메인 권한 위임 테이블 생성
CREATE TABLE IF NOT EXISTS `domain_permissions_delegation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grantor_id` int NOT NULL COMMENT '권한을 준 회원 ID',
  `grantee_id` int NOT NULL COMMENT '권한을 받은 회원 ID',
  `delegation_type` ENUM('self', 'children') DEFAULT 'self' COMMENT '위임 타입 (self: 본인만, children: 하위 위임)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grantee` (`grantee_id`),
  KEY `idx_grantor` (`grantor_id`),
  CONSTRAINT `fk_delegation_grantor` FOREIGN KEY (`grantor_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delegation_grantee` FOREIGN KEY (`grantee_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='도메인 권한 위임 정보';