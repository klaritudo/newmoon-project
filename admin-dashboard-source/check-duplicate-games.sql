-- 중복된 벤더 확인
SELECT vendor, COUNT(*) as game_count, GROUP_CONCAT(DISTINCT id) as game_ids
FROM games
WHERE vendor LIKE '%pragmatic%'
GROUP BY vendor;

-- 각 프라그마틱 벤더의 게임 수 확인
SELECT vendor, COUNT(*) as count, MIN(id) as min_id, MAX(id) as max_id
FROM games
WHERE LOWER(vendor) LIKE '%pragmatic%'
GROUP BY vendor;

-- 게임 3개만 있는 프라그마틱 확인
SELECT vendor, COUNT(*) as game_count
FROM games
GROUP BY vendor
HAVING game_count < 10
ORDER BY game_count;

-- 삭제할 게임 확인 (게임 수가 적은 벤더)
SELECT id, vendor, game_name, created_at
FROM games
WHERE vendor IN (
    SELECT vendor
    FROM games
    GROUP BY vendor
    HAVING COUNT(*) < 10
)
ORDER BY vendor, id;