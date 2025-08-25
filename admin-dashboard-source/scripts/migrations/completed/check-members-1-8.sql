-- 1. 테이블 구조 확인
-- MySQL
-- DESCRIBE members;
-- SQLite
-- PRAGMA table_info(members);

-- 2. ID 1~8번 회원의 전체 데이터 조회
SELECT * FROM members WHERE id BETWEEN 1 AND 8 ORDER BY id;

-- 3. ID 1~8번과 9번 이후 회원 데이터 비교
-- 3-1. ID 1~8번 회원 상세
SELECT 
    id,
    userId,
    username,
    nickname,
    type,
    recommendCode,
    phone,
    parent_id,
    agent_level_id,
    created_at,
    join_date,
    holdings,
    points,
    status,
    notes
FROM members 
WHERE id BETWEEN 1 AND 8
ORDER BY id;

-- 3-2. ID 9~20번 회원 상세 (비교용)
SELECT 
    id,
    userId,
    username,
    nickname,
    type,
    recommendCode,
    phone,
    parent_id,
    agent_level_id,
    created_at,
    join_date,
    holdings,
    points,
    status,
    notes
FROM members 
WHERE id BETWEEN 9 AND 20
ORDER BY id;

-- 4. 특정 필드별 비교
-- 4-1. nickname 필드 비교
SELECT 
    id,
    userId,
    nickname,
    CASE 
        WHEN nickname IS NULL THEN 'NULL'
        WHEN nickname = '' THEN 'EMPTY'
        ELSE 'EXISTS'
    END as nickname_status
FROM members 
WHERE id <= 20
ORDER BY id;

-- 4-2. recommendCode 필드 비교
SELECT 
    id,
    userId,
    recommendCode,
    CASE 
        WHEN recommendCode IS NULL THEN 'NULL'
        WHEN recommendCode = '' THEN 'EMPTY'
        ELSE 'EXISTS'
    END as recommend_status
FROM members 
WHERE id <= 20
ORDER BY id;

-- 4-3. phone 필드 비교
SELECT 
    id,
    userId,
    phone,
    CASE 
        WHEN phone IS NULL THEN 'NULL'
        WHEN phone = '' THEN 'EMPTY'
        ELSE 'EXISTS'
    END as phone_status
FROM members 
WHERE id <= 20
ORDER BY id;

-- 5. type 필드 분석
-- ID 1~8번과 나머지 회원들의 type 분포
SELECT 
    CASE 
        WHEN id BETWEEN 1 AND 8 THEN 'ID 1-8'
        ELSE 'ID 9+'
    END as group_name,
    type,
    COUNT(*) as count
FROM members
GROUP BY group_name, type
ORDER BY group_name, type;

-- 6. 계층 구조 확인
-- ID 1~8번 회원들의 부모-자식 관계
SELECT 
    m1.id,
    m1.userId,
    m1.type,
    m1.parent_id,
    m2.userId as parent_userId,
    m2.type as parent_type
FROM members m1
LEFT JOIN members m2 ON m1.parent_id = m2.id
WHERE m1.id BETWEEN 1 AND 8
ORDER BY m1.id;

-- 7. 가입일 비교
SELECT 
    id,
    userId,
    join_date,
    created_at,
    CASE 
        WHEN join_date IS NULL THEN 'NULL'
        ELSE join_date
    END as join_date_status
FROM members 
WHERE id <= 20
ORDER BY id;

-- 8. agent_level_id 분포
SELECT 
    CASE 
        WHEN id BETWEEN 1 AND 8 THEN 'ID 1-8'
        ELSE 'ID 9+'
    END as group_name,
    agent_level_id,
    COUNT(*) as count
FROM members
GROUP BY group_name, agent_level_id
ORDER BY group_name, agent_level_id;

-- 9. 전체 통계 비교
SELECT 
    'ID 1-8' as group_name,
    COUNT(*) as total_count,
    COUNT(DISTINCT type) as unique_types,
    COUNT(nickname) as has_nickname,
    COUNT(recommendCode) as has_recommend_code,
    COUNT(phone) as has_phone,
    MIN(join_date) as min_join_date,
    MAX(join_date) as max_join_date
FROM members 
WHERE id BETWEEN 1 AND 8

UNION ALL

SELECT 
    'ID 9+' as group_name,
    COUNT(*) as total_count,
    COUNT(DISTINCT type) as unique_types,
    COUNT(nickname) as has_nickname,
    COUNT(recommendCode) as has_recommend_code,
    COUNT(phone) as has_phone,
    MIN(join_date) as min_join_date,
    MAX(join_date) as max_join_date
FROM members 
WHERE id > 8;

-- 10. holdings와 points 비교
SELECT 
    id,
    userId,
    holdings,
    points,
    CASE 
        WHEN holdings = 0 AND points = 0 THEN 'Both Zero'
        WHEN holdings > 0 AND points = 0 THEN 'Holdings Only'
        WHEN holdings = 0 AND points > 0 THEN 'Points Only'
        ELSE 'Both Non-Zero'
    END as balance_status
FROM members 
WHERE id <= 20
ORDER BY id;