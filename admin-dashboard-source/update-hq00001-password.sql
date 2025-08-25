-- hq00001 비밀번호를 1234로 업데이트
UPDATE members 
SET password = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
WHERE username = 'hq00001';

-- 확인
SELECT id, username, agent_level_id 
FROM members 
WHERE username = 'hq00001';