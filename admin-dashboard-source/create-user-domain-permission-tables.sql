-- 유저 도메인 권한 시스템 테이블 생성

-- 1. 유저 도메인 권한 테이블
CREATE TABLE IF NOT EXISTS user_domain_permissions (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL COMMENT '권한을 받은 회원 ID',
  granted_by INT NOT NULL COMMENT '권한을 부여한 회원 ID',
  can_delegate TINYINT(1) DEFAULT 0 COMMENT '위임 가능 여부 (0: 불가, 1: 가능)',
  delegation_step INT NOT NULL DEFAULT 1 COMMENT '위임 단계 (1: 슈퍼201이 부여, 2: 1단계로부터 받음, 3: 2단계로부터 받음)',
  is_active TINYINT(1) DEFAULT 1 COMMENT '활성화 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_member (member_id),
  KEY idx_granted_by (granted_by),
  CONSTRAINT fk_udp_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_udp_granted_by FOREIGN KEY (granted_by) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='유저 도메인 권한 관리';

-- 2. 유저 도메인 할당 테이블
CREATE TABLE IF NOT EXISTS user_domain_assignments (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL COMMENT '도메인을 할당받은 회원 ID',
  domain_id INT NOT NULL COMMENT '할당된 도메인 ID',
  assigned_by INT NOT NULL COMMENT '할당한 회원 ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_member_domain (member_id, domain_id),
  KEY idx_domain (domain_id),
  CONSTRAINT fk_uda_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_uda_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  CONSTRAINT fk_uda_assigned_by FOREIGN KEY (assigned_by) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='유저 도메인 할당 정보';

-- 3. 유저 도메인 위임 이력 테이블
CREATE TABLE IF NOT EXISTS user_domain_delegation_history (
  id INT NOT NULL AUTO_INCREMENT,
  from_member_id INT NOT NULL COMMENT '위임한 회원',
  to_member_id INT NOT NULL COMMENT '위임받은 회원',
  delegation_step INT NOT NULL COMMENT '위임 단계',
  can_delegate TINYINT(1) DEFAULT 0 COMMENT '위임 가능 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_from_member (from_member_id),
  KEY idx_to_member (to_member_id),
  KEY idx_created_at (created_at),
  CONSTRAINT fk_uddh_from_member FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_uddh_to_member FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='유저 도메인 위임 이력';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_udp_delegation_step ON user_domain_permissions(delegation_step);
CREATE INDEX idx_udp_is_active ON user_domain_permissions(is_active);
CREATE INDEX idx_uda_created_at ON user_domain_assignments(created_at);