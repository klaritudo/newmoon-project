-- store00015 사용자의 정확한 정보 확인
SELECT 
    m.id,
    m.username,
    m.nickname,
    m.agent_level_id,
    al.name as level_name,
    al.permission,
    m.balance,
    m.api
FROM members m
LEFT JOIN agent_levels al ON m.agent_level_id = al.id
WHERE m.username = 'store00015';

-- agent_levels 테이블 확인
SELECT * FROM agent_levels ORDER BY id;