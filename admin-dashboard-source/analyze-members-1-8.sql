-- 1. ID 1~8번 회원의 전체 데이터 조회
SELECT * FROM members WHERE id BETWEEN 1 AND 8 ORDER BY id;

-- 2. ID 1~8번과 9~20번 회원 주요 필드 비교
SELECT 
    id,
    userId,
    username,
    nickname,
    type,
    parentTypes,
    parentId,
    agent_level_id,
    balance,
    gameMoney,
    registrationDate,
    createdAt
FROM members 
WHERE id BETWEEN 1 AND 8
ORDER BY id;

-- ID 9~20번 회원 데이터
SELECT 
    id,
    userId,
    username,
    nickname,
    type,
    parentTypes,
    parentId,
    agent_level_id,
    balance,
    gameMoney,
    registrationDate,
    createdAt
FROM members 
WHERE id BETWEEN 9 AND 20
ORDER BY id;

-- 3. type 필드 분석 (JSON 필드)
SELECT 
    id,
    userId,
    type,
    JSON_EXTRACT(type, '$.label') as type_label,
    JSON_EXTRACT(type, '$.id') as type_id
FROM members 
WHERE id <= 20
ORDER BY id;

-- 4. parentTypes 필드 분석 (JSON 필드)
SELECT 
    id,
    userId,
    parentTypes,
    JSON_LENGTH(parentTypes) as parent_count
FROM members 
WHERE id <= 20 AND parentTypes IS NOT NULL
ORDER BY id;

-- 5. 계층 구조 확인
SELECT 
    m1.id,
    m1.userId,
    m1.username,
    m1.nickname,
    m1.parentId,
    m2.userId as parent_userId,
    m2.username as parent_username,
    m2.nickname as parent_nickname
FROM members m1
LEFT JOIN members m2 ON m1.parentId = m2.id
WHERE m1.id BETWEEN 1 AND 8
ORDER BY m1.id;

-- 6. agent_level_id 분포
SELECT 
    CASE 
        WHEN id BETWEEN 1 AND 8 THEN 'ID 1-8'
        ELSE 'ID 9+'
    END as group_name,
    agent_level_id,
    COUNT(*) as count
FROM members
WHERE agent_level_id IS NOT NULL
GROUP BY group_name, agent_level_id
ORDER BY group_name, agent_level_id;

-- 7. 가입일과 생성일 비교
SELECT 
    id,
    userId,
    registrationDate,
    createdAt,
    CASE 
        WHEN registrationDate IS NULL THEN 'NULL'
        ELSE 'EXISTS'
    END as reg_date_status
FROM members 
WHERE id <= 20
ORDER BY id;

-- 8. 전체 통계 비교
SELECT 
    'ID 1-8' as group_name,
    COUNT(*) as total_count,
    COUNT(nickname) as has_nickname,
    COUNT(name) as has_name,
    COUNT(bank) as has_bank,
    COUNT(accountNumber) as has_account,
    MIN(registrationDate) as min_reg_date,
    MAX(registrationDate) as max_reg_date,
    AVG(balance) as avg_balance,
    AVG(gameMoney) as avg_game_money
FROM members 
WHERE id BETWEEN 1 AND 8

UNION ALL

SELECT 
    'ID 9+' as group_name,
    COUNT(*) as total_count,
    COUNT(nickname) as has_nickname,
    COUNT(name) as has_name,
    COUNT(bank) as has_bank,
    COUNT(accountNumber) as has_account,
    MIN(registrationDate) as min_reg_date,
    MAX(registrationDate) as max_reg_date,
    AVG(balance) as avg_balance,
    AVG(gameMoney) as avg_game_money
FROM members 
WHERE id > 8;

-- 9. child 필드들 확인
SELECT 
    id,
    userId,
    child1,
    child2,
    child3,
    child4,
    child5,
    child6
FROM members 
WHERE id BETWEEN 1 AND 8
ORDER BY id;

-- 10. 자식 회원 수 확인 (parentId 기반)
SELECT 
    m1.id,
    m1.userId,
    m1.username,
    COUNT(m2.id) as child_count
FROM members m1
LEFT JOIN members m2 ON m2.parentId = m1.id
WHERE m1.id BETWEEN 1 AND 8
GROUP BY m1.id, m1.userId, m1.username
ORDER BY m1.id;