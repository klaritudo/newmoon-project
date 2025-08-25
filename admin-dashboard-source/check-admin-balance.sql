-- 현재 1단계 관리자 확인
SELECT m.id, m.username, m.nickname, m.balance, m.agent_level_id, al.permission
FROM members m
LEFT JOIN agent_levels al ON m.agent_level_id = al.id
WHERE m.agent_level_id IN (1, 999)
ORDER BY m.agent_level_id;

-- Honor API에 잘못 등록된 관리자 계정 확인
SELECT * FROM honor_profiles 
WHERE user_id IN (
  SELECT id FROM members WHERE agent_level_id IN (1, 999)
);

-- honor_profiles 테이블에서 관리자 계정 제거
DELETE FROM honor_profiles 
WHERE user_id IN (
  SELECT id FROM members WHERE agent_level_id IN (1, 999)
);