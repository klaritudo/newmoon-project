-- 마스터 계정 생성 스크립트
-- 주의: 이 스크립트는 보안을 위해 실행 후 즉시 삭제하세요

-- 1. 마스터 계정용 특별 레벨 생성 (없는 경우)
INSERT IGNORE INTO agent_levels (id, name, level, permission, is_top_level, background_color, border_color, icon, max_members, created_at)
VALUES (999, '시스템마스터', 0, '시스템관리자', 1, '#FF0000', '#CC0000', 'admin_panel_settings', 1, NOW());

-- 2. 마스터 계정 생성
-- 비밀번호는 SHA2로 해시화 (실제 비밀번호는 'master!@#$2025')
INSERT IGNORE INTO members (
    id, 
    username, 
    password, 
    nickname, 
    name, 
    agent_level_id,
    balance,
    point,
    status,
    created_at,
    parentId
) VALUES (
    1,
    'master',
    SHA2('master!@#$2025', 256),
    '시스템마스터',
    '시스템관리자',
    999,
    0,
    0,
    'active',
    NOW(),
    NULL
);

-- 3. 마스터 계정 보호 설정
-- 마스터 계정은 수정/삭제 불가능하도록 트리거 생성
DELIMITER $$

CREATE TRIGGER protect_master_update
BEFORE UPDATE ON members
FOR EACH ROW
BEGIN
    IF OLD.id = 1 AND OLD.username = 'master' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '마스터 계정은 수정할 수 없습니다.';
    END IF;
END$$

CREATE TRIGGER protect_master_delete
BEFORE DELETE ON members
FOR EACH ROW
BEGIN
    IF OLD.id = 1 AND OLD.username = 'master' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '마스터 계정은 삭제할 수 없습니다.';
    END IF;
END$$

DELIMITER ;

-- 4. 마스터 계정 정보 확인
SELECT 
    m.id,
    m.username,
    m.nickname,
    al.name as level_name,
    al.permission,
    m.created_at
FROM members m
JOIN agent_levels al ON m.agent_level_id = al.id
WHERE m.id = 1 AND m.username = 'master';