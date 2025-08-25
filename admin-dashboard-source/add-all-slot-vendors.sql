-- Honor API의 모든 슬롯 벤더를 game_categories 테이블에 추가하는 SQL
-- 기존에 없는 벤더만 추가 (INSERT IGNORE 사용)

INSERT IGNORE INTO game_categories (code, name, name_ko, type, is_active, sort_order) VALUES
-- 기존 8개는 제외하고 새로운 52개 추가
('PLAYTECH', 'PlayTechSlot', 'PlayTechSlot', 'slot', 1, 10),
('YGGDRASIL', 'Yggdrasil', 'Yggdrasil', 'slot', 1, 20),
('SKYWIND', 'Skywind Slot', 'Skywind Slot', 'slot', 1, 30),
('EVOPLAY', 'evoplay', 'evoplay', 'slot', 1, 40),
('WAZDAN', 'Wazdan', 'Wazdan', 'slot', 1, 50),
('CQ9', 'CQ9', 'CQ9', 'slot', 1, 60),
('RUBYPLAY', 'RubyPlay', 'RubyPlay', 'slot', 1, 70),
('GREENTUBE', 'greentube', 'greentube', 'slot', 1, 80),
('BGAMING', 'bgaming', 'bgaming', 'slot', 1, 90),
('THUNDERKICK', 'Thunderkick', 'Thunderkick', 'slot', 1, 100),
('BOOMING', 'booming', 'booming', 'slot', 1, 110),
('PGSOFT', 'PG Soft', 'PG Soft', 'slot', 1, 120),
('1X2GAMING', '1X2 Gaming', '1X2 Gaming', 'slot', 1, 130),
('EAGAMING', 'eagaming', 'eagaming', 'slot', 1, 140),
('CALETAGAMING', 'caletagaming', 'caletagaming', 'slot', 1, 150),
('INTOUCHGAMES', 'intouch-games', 'intouch-games', 'slot', 1, 160),
('BOOONGO', 'Booongo', 'Booongo', 'slot', 1, 170),
('PLATIPUS', 'platipus', 'platipus', 'slot', 1, 180),
('DREAMTECH', 'dreamtech', 'dreamtech', 'slot', 1, 190),
('KALAMBA', 'Kalamba', 'Kalamba', 'slot', 1, 200),
('PLATINGAMING', 'platingaming', 'platingaming', 'slot', 1, 210),
('JDB', 'JDB', 'JDB', 'slot', 1, 220),
('MICROGAMING', 'MicroGaming Plus Slo', 'MicroGaming Plus Slo', 'slot', 1, 230),
('NETGAME', 'netgame', 'netgame', 'slot', 1, 240),
('POPOK', 'popok', 'popok', 'slot', 1, 250),
('AMIGOGAMING', 'amigogaming', 'amigogaming', 'slot', 1, 260),
('BFGAMES', 'bfgames', 'bfgames', 'slot', 1, 270),
('ASIAGAMING', 'Asia Gaming Slot', 'Asia Gaming Slot', 'slot', 1, 280),
('GAMEART', 'GameArt', 'GameArt', 'slot', 1, 290),
('BLUEPRINT', 'Blueprint Gaming', 'Blueprint Gaming', 'slot', 1, 300),
('RETROGAMES', 'retrogames', 'retrogames', 'slot', 1, 310),
('MERKUR', 'merkur', 'merkur', 'slot', 1, 320),
('PLAYSTAR', 'PlayStar', 'PlayStar', 'slot', 1, 330),
('MANCALA', 'mancala', 'mancala', 'slot', 1, 340),
('RSG', 'rsg', 'rsg', 'slot', 1, 350),
('DRAGOONSOFT', 'dragoonsoft', 'dragoonsoft', 'slot', 1, 360),
('NOVOMATIC', 'Novomatic', 'Novomatic', 'slot', 1, 370),
('SLOTMILL', 'Slotmill', 'Slotmill', 'slot', 1, 380),
('BIGTIMEGAMING', 'BigTimeGaming', 'BigTimeGaming', 'slot', 1, 390),
('AVATARUX', 'AvatarUX', 'AvatarUX', 'slot', 1, 400),
('OCTOPLAY', 'Octoplay', 'Octoplay', 'slot', 1, 410),
('PETERSONS', 'PeterSons', 'PeterSons', 'slot', 1, 420),
('7MOJOS', '7-mojos-slots', '7-mojos-slots', 'slot', 1, 430),
('QUICKSPIN', 'quickspin', 'quickspin', 'slot', 1, 440),
('FILS', 'fils', 'fils', 'slot', 1, 450),
('FANTASMA', 'Fantasma', 'Fantasma', 'slot', 1, 460),
('ICONIX', 'iconix', 'iconix', 'slot', 1, 470),
('REVOLVER', 'revolver', 'revolver', 'slot', 1, 480),
('YOLTED', 'Yolted', 'Yolted', 'slot', 1, 490),
('MPLAY', 'mplay', 'mplay', 'slot', 1, 500),
('FATPANDA', 'FatPanda', 'FatPanda', 'slot', 1, 510),
('MACAW', 'macaw', 'macaw', 'slot', 1, 520);

-- 카지노 벤더들도 확인해서 추가
-- Honor API 응답에서 카지노 벤더가 0개로 나왔으므로 수동으로 추가
INSERT IGNORE INTO game_categories (code, name, name_ko, type, is_active, sort_order) VALUES
('EVOLUTION', 'Evolution', 'Evolution', 'casino', 1, 1),
('AG', 'Asia Gaming', 'Asia Gaming', 'casino', 1, 2),
('MG', 'Microgaming', 'Microgaming', 'casino', 1, 3),
('DREAMGAME', 'DreamGame', 'DreamGame', 'casino', 1, 4),
('WM', 'WM Live', 'WM Live', 'casino', 1, 5),
('SEXY', 'Sexy Baccarat', 'Sexy Baccarat', 'casino', 1, 6),
('EZUGI', 'Ezugi', 'Ezugi', 'casino', 1, 7),
('VIVO', 'Vivo Gaming', 'Vivo Gaming', 'casino', 1, 8);

-- 통계 확인
SELECT type, COUNT(*) as count 
FROM game_categories 
GROUP BY type;