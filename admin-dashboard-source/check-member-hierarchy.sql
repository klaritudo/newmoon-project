-- 회원 계층 구조 확인
SELECT 
    m.id,
    m.username,
    m.agent_level_id,
    al.name as level_name,
    m.parentId,
    p.username as parent_username
FROM members m
LEFT JOIN agent_levels al ON m.agent_level_id = al.id
LEFT JOIN members p ON m.parentId = p.id
WHERE m.username NOT IN ('system', 'master')
ORDER BY al.level, m.id;

-- hq00001의 정보와 하위 회원 확인
SELECT 'hq00001 정보:' as info;
SELECT id, username, agent_level_id, parentId 
FROM members 
WHERE username = 'hq00001';

SELECT 'hq00001의 직접 하위 회원:' as info;
SELECT id, username, agent_level_id, parentId 
FROM members 
WHERE parentId = (SELECT id FROM members WHERE username = 'hq00001');