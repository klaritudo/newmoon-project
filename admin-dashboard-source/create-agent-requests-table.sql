-- 에이전트 요청 테이블 생성
CREATE TABLE IF NOT EXISTS `agent_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_id` int(11) NOT NULL COMMENT '요청자 ID',
  `target_admin_id` int(11) NOT NULL COMMENT '대상 관리자 ID (1단계 또는 2단계)',
  `request_type` enum('계좌신청','입금신청','출금신청','문의하기') NOT NULL COMMENT '요청 유형',
  `message` text DEFAULT NULL COMMENT '요청 메시지',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '추가 상세 정보 (JSON)' CHECK (json_valid(`details`)),
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending' COMMENT '요청 상태',
  `response_message` text DEFAULT NULL COMMENT '관리자 응답 메시지',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '요청 시간',
  `responded_at` datetime DEFAULT NULL COMMENT '응답 시간',
  PRIMARY KEY (`id`),
  KEY `idx_requester_id` (`requester_id`),
  KEY `idx_target_admin_id` (`target_admin_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_request_type` (`request_type`),
  CONSTRAINT `fk_agent_requests_requester` FOREIGN KEY (`requester_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_agent_requests_target` FOREIGN KEY (`target_admin_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='에이전트 요청 관리';

-- 알림 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '알림 수신자 ID',
  `type` varchar(50) NOT NULL COMMENT '알림 유형',
  `category` varchar(50) NOT NULL COMMENT '알림 카테고리',
  `title` varchar(255) NOT NULL COMMENT '알림 제목',
  `message` text NOT NULL COMMENT '알림 내용',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '추가 데이터 (JSON)' CHECK (json_valid(`data`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '읽음 여부',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성 시간',
  `read_at` datetime DEFAULT NULL COMMENT '읽은 시간',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_category` (`category`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='알림 관리';

-- 에이전트문의 카테고리를 notifications 테이블에서 카운트하는 뷰 생성
CREATE OR REPLACE VIEW `agent_inquiry_count` AS
SELECT 
  n.user_id,
  COUNT(CASE WHEN n.is_read = 0 THEN 1 END) as unread_count,
  COUNT(*) as total_count
FROM notifications n
WHERE n.category = 'agent_inquiry'
GROUP BY n.user_id;