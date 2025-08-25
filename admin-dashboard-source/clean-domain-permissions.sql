-- 현재 권한 상태 확인
SELECT 
    udp.id,
    udp.member_id,
    m.username,
    m.agent_level_id,
    al.name as level_name,
    udp.granted_by,
    gm.username as granted_by_username,
    udp.can_delegate,
    udp.delegation_step
FROM user_domain_permissions udp
JOIN members m ON udp.member_id = m.id
JOIN agent_levels al ON m.agent_level_id = al.id
LEFT JOIN members gm ON udp.granted_by = gm.id
WHERE udp.is_active = 1
ORDER BY m.agent_level_id;

-- 잘못된 권한 삭제 (예시)
-- 1단계는 모든 단계에 권한을 줄 수 있지만, 일반적으로 특정 단계에만 부여해야 함
-- 아래는 예시이므로 실제 비즈니스 요구사항에 맞게 수정 필요

-- 옵션 1: 모든 권한 초기화 (주의: 이렇게 하면 모든 권한이 삭제됨)
-- DELETE FROM user_domain_permissions;
-- DELETE FROM user_domain_assignments;

-- 옵션 2: 특정 레벨의 권한만 삭제 (예: 2, 3단계 권한 삭제)
-- DELETE FROM user_domain_permissions WHERE member_id IN (
--     SELECT id FROM members WHERE agent_level_id IN (2, 3)
-- );

-- 옵션 3: 1단계가 부여한 권한 중 일부만 유지 (예: 4단계에게만 권한 부여)
-- UPDATE user_domain_permissions SET is_active = 0 
-- WHERE granted_by = 1 AND member_id NOT IN (
--     SELECT id FROM members WHERE agent_level_id = 4
-- );