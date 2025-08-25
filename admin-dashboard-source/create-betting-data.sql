-- betting_details 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS betting_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  game_provider VARCHAR(100) NOT NULL,
  game_name VARCHAR(200) NOT NULL,
  bet_amount DECIMAL(15,2) NOT NULL,
  win_amount DECIMAL(15,2) DEFAULT 0,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  bet_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_bet_time (bet_time),
  INDEX idx_game_type (game_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- agent_level_id가 8인 일반회원 확인
SELECT id, username, balance FROM users WHERE agent_level_id = 8 LIMIT 10;

-- 일반회원 베팅 데이터 생성
-- 게임 제공업체와 게임 목록
-- 슬롯: Pragmatic Play, PG Soft, Habanero, CQ9, Playtech
-- 카지노: Evolution, Microgaming, Asia Gaming, WM Casino, Sexy Gaming

-- 베팅 데이터 삽입
INSERT INTO betting_details (user_id, game_type, game_provider, game_name, bet_amount, win_amount, balance_before, balance_after, bet_time, result)
SELECT 
    u.id as user_id,
    CASE WHEN RAND() < 0.6 THEN 'slot' ELSE 'casino' END as game_type,
    CASE 
        WHEN RAND() < 0.2 THEN 'Pragmatic Play'
        WHEN RAND() < 0.4 THEN 'PG Soft'
        WHEN RAND() < 0.6 THEN 'Evolution'
        WHEN RAND() < 0.8 THEN 'Microgaming'
        ELSE 'Asia Gaming'
    END as game_provider,
    CASE 
        WHEN RAND() < 0.2 THEN 'Sweet Bonanza'
        WHEN RAND() < 0.4 THEN 'Gates of Olympus'
        WHEN RAND() < 0.6 THEN 'Lightning Roulette'
        WHEN RAND() < 0.8 THEN 'Crazy Time'
        ELSE 'Baccarat Deluxe'
    END as game_name,
    ROUND(10000 + RAND() * 90000, 0) as bet_amount,
    CASE 
        WHEN RAND() < 0.3 THEN 0  -- 30% 확률로 패배
        ELSE ROUND((10000 + RAND() * 90000) * (0.5 + RAND() * 2), 0)  -- 70% 확률로 승리 (0.5배~2.5배)
    END as win_amount,
    u.balance as balance_before,
    u.balance + (CASE 
        WHEN RAND() < 0.3 THEN -(10000 + RAND() * 90000)
        ELSE ROUND((10000 + RAND() * 90000) * (RAND() * 1.5 - 0.5), 0)
    END) as balance_after,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 7) DAY) + INTERVAL FLOOR(RAND() * 24) HOUR as bet_time,
    CASE 
        WHEN RAND() < 0.3 THEN 'lose'
        ELSE 'win'
    END as result
FROM users u
WHERE u.agent_level_id = 8
LIMIT 10;

-- 더 현실적인 베팅 데이터 추가 생성
INSERT INTO betting_details (user_id, game_type, game_provider, game_name, bet_amount, win_amount, balance_before, balance_after, bet_time, result)
VALUES
-- user_id는 실제 agent_level_id=8인 회원의 ID로 대체해야 함
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1), 'slot', 'Pragmatic Play', 'Sweet Bonanza', 50000, 125000, 1000000, 1075000, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 14 HOUR, 'win'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 1), 'casino', 'Evolution', 'Lightning Roulette', 30000, 0, 500000, 470000, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 20 HOUR, 'lose'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 2), 'slot', 'PG Soft', 'Fortune Tiger', 20000, 40000, 800000, 820000, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 10 HOUR, 'win'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 3), 'casino', 'Asia Gaming', 'Baccarat', 100000, 200000, 2000000, 2100000, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 22 HOUR, 'win'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 4), 'slot', 'Habanero', 'Hot Hot Fruit', 10000, 0, 300000, 290000, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 15 HOUR, 'lose'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 5), 'casino', 'WM Casino', 'Dragon Tiger', 50000, 50000, 1500000, 1500000, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 18 HOUR, 'tie'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 6), 'slot', 'CQ9', 'Jump High', 25000, 75000, 600000, 650000, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, 'win'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 7), 'casino', 'Sexy Gaming', 'Sic Bo', 40000, 0, 900000, 860000, DATE_SUB(NOW(), INTERVAL 6 HOUR), 'lose'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 8), 'slot', 'Playtech', 'Age of Gods', 60000, 180000, 1200000, 1320000, DATE_SUB(NOW(), INTERVAL 3 HOUR), 'win'),
((SELECT id FROM users WHERE agent_level_id = 8 LIMIT 1 OFFSET 9), 'casino', 'Microgaming', 'Blackjack', 80000, 160000, 1800000, 1880000, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'win');

-- 생성된 베팅 데이터 확인
SELECT 
    bd.id,
    u.username,
    u.agent_level_id,
    bd.game_type,
    bd.game_provider,
    bd.game_name,
    bd.bet_amount,
    bd.win_amount,
    bd.balance_before,
    bd.balance_after,
    bd.bet_time,
    bd.result
FROM betting_details bd
JOIN users u ON bd.user_id = u.id
WHERE u.agent_level_id = 8
ORDER BY bd.bet_time DESC
LIMIT 20;