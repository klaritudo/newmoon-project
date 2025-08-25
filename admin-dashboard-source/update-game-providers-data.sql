-- 1. 기존 데이터 업데이트 (game_categories 데이터 기반)
UPDATE game_providers gp
INNER JOIN game_categories gc ON gp.code = gc.code
SET 
    gp.name_ko = gc.name_ko,
    gp.sort_order = gc.sort_order,
    gp.is_active = gc.is_active,
    gp.game_types = CASE 
        WHEN gc.type = 'slot' THEN '["slot"]'
        WHEN gc.type = 'casino' THEN '["casino", "live"]'
        WHEN gc.type = 'specialty' THEN '["specialty"]'
        ELSE '[]'
    END;

-- 2. 로고 URL 설정 (기본 경로)
UPDATE game_providers 
SET logo_url = CONCAT('/img/vendor-logo-icon/vender-logo-', LOWER(REPLACE(REPLACE(code, "'", ''), ' ', '')), '.png')
WHERE logo_url IS NULL;

-- 3. 누락된 name_ko 업데이트
UPDATE game_providers SET name_ko = name WHERE name_ko IS NULL;