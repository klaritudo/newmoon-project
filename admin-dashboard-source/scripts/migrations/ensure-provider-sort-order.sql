-- 게임 제공사 정렬 순서 보장 스크립트
-- 이 스크립트는 game_providers와 game_categories 테이블의 sort_order를 확인하고 동기화합니다.

-- 1. game_providers 테이블에 sort_order 컬럼이 없으면 추가
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'game_providers' 
AND COLUMN_NAME = 'sort_order';

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE game_providers ADD COLUMN sort_order INT DEFAULT 0 COMMENT ''정렬 순서'' AFTER status',
    'SELECT ''sort_order column already exists in game_providers''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. game_providers 테이블에 sort_order 인덱스 추가 (없으면)
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'game_providers'
AND INDEX_NAME = 'idx_sort_order';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE game_providers ADD INDEX idx_sort_order (sort_order)',
    'SELECT ''idx_sort_order already exists in game_providers''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. game_categories 테이블의 sort_order 값을 game_providers로 동기화
UPDATE game_providers gp
INNER JOIN game_categories gc ON gp.code = gc.code
SET gp.sort_order = gc.sort_order
WHERE gc.sort_order IS NOT NULL AND gc.sort_order > 0;

-- 4. sort_order가 0인 경우 기본값 설정 (슬롯과 카지노 구분)
-- 슬롯 게임 제공사
UPDATE game_providers gp
INNER JOIN game_categories gc ON gp.code = gc.code
SET gp.sort_order = CASE gp.code
    WHEN 'pragmatic' THEN 1
    WHEN 'PRAGMATIC' THEN 1
    WHEN 'PragmaticPlay' THEN 1
    WHEN 'habanero' THEN 2
    WHEN 'HABANERO' THEN 2
    WHEN 'netent' THEN 3
    WHEN 'NETENT' THEN 3
    WHEN 'NetEnt' THEN 3
    WHEN 'redtiger' THEN 4
    WHEN 'REDTIGER' THEN 4
    WHEN 'RedTiger' THEN 4
    WHEN 'playngo' THEN 5
    WHEN 'PLAYNGO' THEN 5
    WHEN 'PlaynGO' THEN 5
    WHEN 'nolimit' THEN 6
    WHEN 'NOLIMIT' THEN 6
    WHEN 'NoLimit' THEN 6
    WHEN 'relax' THEN 7
    WHEN 'RELAX' THEN 7
    WHEN 'RelaxGaming' THEN 7
    WHEN 'hacksaw' THEN 8
    WHEN 'HACKSAW' THEN 8
    WHEN 'HacksawGaming' THEN 8
    ELSE gp.sort_order
END
WHERE gc.type = 'slot' AND (gp.sort_order = 0 OR gp.sort_order IS NULL);

-- 카지노 게임 제공사
UPDATE game_providers gp
INNER JOIN game_categories gc ON gp.code = gc.code
SET gp.sort_order = CASE gp.code
    WHEN 'evolution' THEN 10
    WHEN 'EVOLUTION' THEN 10
    WHEN 'Evolution' THEN 10
    WHEN 'ag' THEN 11
    WHEN 'AG' THEN 11
    WHEN 'AsiaGaming' THEN 11
    WHEN 'mg' THEN 12
    WHEN 'MG' THEN 12
    WHEN 'MicroGaming' THEN 12
    WHEN 'dreamgame' THEN 13
    WHEN 'DREAMGAME' THEN 13
    WHEN 'DreamGaming' THEN 13
    WHEN 'wm' THEN 14
    WHEN 'WM' THEN 14
    WHEN 'WMLive' THEN 14
    WHEN 'sexy' THEN 15
    WHEN 'SEXY' THEN 15
    WHEN 'SexyGaming' THEN 15
    WHEN 'ezugi' THEN 16
    WHEN 'EZUGI' THEN 16
    WHEN 'Ezugi' THEN 16
    WHEN 'vivo' THEN 17
    WHEN 'VIVO' THEN 17
    WHEN 'VivoGaming' THEN 17
    ELSE gp.sort_order
END
WHERE gc.type = 'casino' AND (gp.sort_order = 0 OR gp.sort_order IS NULL);

-- 5. game_categories 테이블도 동일하게 업데이트
UPDATE game_categories
SET sort_order = CASE code
    -- 슬롯
    WHEN 'pragmatic' THEN 1
    WHEN 'PRAGMATIC' THEN 1
    WHEN 'PragmaticPlay' THEN 1
    WHEN 'habanero' THEN 2
    WHEN 'HABANERO' THEN 2
    WHEN 'netent' THEN 3
    WHEN 'NETENT' THEN 3
    WHEN 'NetEnt' THEN 3
    WHEN 'redtiger' THEN 4
    WHEN 'REDTIGER' THEN 4
    WHEN 'RedTiger' THEN 4
    WHEN 'playngo' THEN 5
    WHEN 'PLAYNGO' THEN 5
    WHEN 'PlaynGO' THEN 5
    WHEN 'nolimit' THEN 6
    WHEN 'NOLIMIT' THEN 6
    WHEN 'NoLimit' THEN 6
    WHEN 'relax' THEN 7
    WHEN 'RELAX' THEN 7
    WHEN 'RelaxGaming' THEN 7
    WHEN 'hacksaw' THEN 8
    WHEN 'HACKSAW' THEN 8
    WHEN 'HacksawGaming' THEN 8
    -- 카지노
    WHEN 'evolution' THEN 10
    WHEN 'EVOLUTION' THEN 10
    WHEN 'Evolution' THEN 10
    WHEN 'ag' THEN 11
    WHEN 'AG' THEN 11
    WHEN 'AsiaGaming' THEN 11
    WHEN 'mg' THEN 12
    WHEN 'MG' THEN 12
    WHEN 'MicroGaming' THEN 12
    WHEN 'dreamgame' THEN 13
    WHEN 'DREAMGAME' THEN 13
    WHEN 'DreamGaming' THEN 13
    WHEN 'wm' THEN 14
    WHEN 'WM' THEN 14
    WHEN 'WMLive' THEN 14
    WHEN 'sexy' THEN 15
    WHEN 'SEXY' THEN 15
    WHEN 'SexyGaming' THEN 15
    WHEN 'ezugi' THEN 16
    WHEN 'EZUGI' THEN 16
    WHEN 'Ezugi' THEN 16
    WHEN 'vivo' THEN 17
    WHEN 'VIVO' THEN 17
    WHEN 'VivoGaming' THEN 17
    ELSE sort_order
END
WHERE sort_order = 0 OR sort_order IS NULL;

-- 6. 결과 확인
SELECT 'game_providers 정렬 순서:' as info;
SELECT code, name, name_ko, sort_order 
FROM game_providers 
ORDER BY sort_order ASC, code ASC;

SELECT '---' as separator;
SELECT 'game_categories 정렬 순서:' as info;
SELECT code, name, name_ko, type, sort_order 
FROM game_categories 
ORDER BY type, sort_order ASC, code ASC;