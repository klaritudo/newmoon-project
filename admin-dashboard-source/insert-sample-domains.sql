-- 도메인 샘플 데이터 삽입

-- 기존 데이터 삭제 (개발 환경용)
DELETE FROM domain_permissions;
DELETE FROM domains;

-- 관리자 도메인 추가
INSERT INTO domains (domain_type, url, is_active) VALUES
('admin', 'http://localhost:5173', 1),
('admin', 'http://localhost:5174', 1),
('admin', 'http://localhost:5175', 1),
('admin', 'http://49.171.117.184:5173', 1);

-- 유저 도메인 추가
INSERT INTO domains (domain_type, url, is_active) VALUES
('user', 'https://www.newmoon.com', 1),
('user', 'https://m.newmoon.com', 1),
('user', 'https://app.newmoon.com', 1);

-- 관리자 도메인 권한 설정 (모든 레벨이 접속 가능하도록 설정)
INSERT INTO domain_permissions (domain_id, agent_level_id)
SELECT d.id, al.id
FROM domains d
CROSS JOIN agent_levels al
WHERE d.domain_type = 'admin' 
AND al.id != 999; -- 마스터 레벨 제외

-- 설정 확인
SELECT 
    d.id,
    d.domain_type,
    d.url,
    d.is_active,
    GROUP_CONCAT(al.name ORDER BY al.level) as allowed_levels
FROM domains d
LEFT JOIN domain_permissions dp ON d.id = dp.domain_id
LEFT JOIN agent_levels al ON dp.agent_level_id = al.id
GROUP BY d.id
ORDER BY d.domain_type, d.id;