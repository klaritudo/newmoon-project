-- PRAGMATICPLAY 벤더의 게임 확인
SELECT vendor, COUNT(*) as game_count 
FROM games 
WHERE vendor IN ('PRAGMATICPLAY', 'pragmatic')
GROUP BY vendor;

-- PRAGMATICPLAY 게임 삭제
DELETE FROM games WHERE vendor = 'PRAGMATICPLAY';

-- game_providers 테이블에서도 삭제
DELETE FROM game_providers WHERE code = 'PRAGMATICPLAY';

-- 결과 확인
SELECT vendor, COUNT(*) as game_count 
FROM games 
WHERE vendor LIKE '%pragmatic%'
GROUP BY vendor;