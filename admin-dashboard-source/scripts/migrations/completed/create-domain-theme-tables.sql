-- 도메인별 테마 설정 테이블
CREATE TABLE IF NOT EXISTS domain_themes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain_id INT NOT NULL,
  theme_name VARCHAR(100) DEFAULT 'default',
  
  -- 색상 설정
  primary_color VARCHAR(7) DEFAULT '#3498db',
  secondary_color VARCHAR(7) DEFAULT '#2ecc71',
  accent_color VARCHAR(7) DEFAULT '#e74c3c',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#2c3e50',
  
  -- 로고 및 파비콘
  logo_url VARCHAR(500),
  logo_dark_url VARCHAR(500),
  favicon_url VARCHAR(500),
  
  -- 사이트 정보
  site_title VARCHAR(200),
  site_description TEXT,
  footer_text TEXT,
  
  -- 커스텀 CSS
  custom_css TEXT,
  
  -- 레이아웃 설정
  layout_type ENUM('default', 'modern', 'classic', 'minimal') DEFAULT 'default',
  sidebar_position ENUM('left', 'right', 'none') DEFAULT 'left',
  header_style ENUM('fixed', 'static', 'transparent') DEFAULT 'fixed',
  
  -- 폰트 설정
  font_family VARCHAR(100) DEFAULT 'Noto Sans KR',
  font_size_base INT DEFAULT 14,
  
  -- 메타 정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  UNIQUE KEY unique_domain_theme (domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 도메인별 설정 테이블
CREATE TABLE IF NOT EXISTS domain_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain_id INT NOT NULL,
  setting_group VARCHAR(50) NOT NULL, -- 'general', 'game', 'payment', 'security' 등
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  UNIQUE KEY unique_domain_setting (domain_id, setting_group, setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 도메인별 메뉴 커스터마이징
CREATE TABLE IF NOT EXISTS domain_menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain_id INT NOT NULL,
  menu_key VARCHAR(50) NOT NULL, -- 'slot', 'casino', 'sports' 등
  menu_label VARCHAR(100),
  menu_icon VARCHAR(50),
  menu_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  custom_url VARCHAR(255),
  
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  UNIQUE KEY unique_domain_menu (domain_id, menu_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 도메인별 데이터 격리를 위한 회원 도메인 매핑
CREATE TABLE IF NOT EXISTS member_domains (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  domain_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_domain (member_id, domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 도메인별 게임 설정
CREATE TABLE IF NOT EXISTS domain_games (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain_id INT NOT NULL,
  game_id INT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  custom_name VARCHAR(200),
  custom_thumbnail VARCHAR(500),
  display_order INT DEFAULT 0,
  
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY unique_domain_game (domain_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 기본 테마 데이터 삽입
INSERT INTO domain_themes (domain_id, theme_name, primary_color, secondary_color)
SELECT id, 'default', '#3498db', '#2ecc71' FROM domains WHERE id NOT IN (SELECT domain_id FROM domain_themes);